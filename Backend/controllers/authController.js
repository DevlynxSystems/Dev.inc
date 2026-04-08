const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getJwtSecret() {
  // In production, set `JWT_SECRET` in Backend/.env
  return process.env.JWT_SECRET || 'dev-only-secret-change-me';
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '7d';
}

function toUserResponse(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    phone: userDoc.phone || '',
    address: userDoc.address || {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  };
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() }
    );

    return res.status(201).json({ token, user: toUserResponse(user) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error('POST /api/auth/signup error:', err);
    return res.status(500).json({ error: 'Failed to sign up' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() }
    );

    return res.json({ token, user: toUserResponse(user) });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    return res.status(500).json({ error: 'Failed to log in' });
  }
}

async function me(req, res) {
  try {
    const { userId } = req.user || {};
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId).select('name email role phone address');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: toUserResponse(user) });
  } catch (err) {
    console.error('GET /api/auth/me error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function updateMe(req, res) {
  try {
    const { userId } = req.user || {};
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, password, phone, address } = req.body || {};

    const updates = {};
    if (name != null) {
      const nextName = String(name).trim();
      if (!nextName) return res.status(400).json({ error: 'Name cannot be empty' });
      updates.name = nextName;
    }

    if (password != null) {
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'password must be at least 6 characters' });
      }
      updates.password = await bcrypt.hash(String(password), 10);
    }

    if (phone !== undefined) {
      updates.phone = String(phone || '').trim();
    }

    if (address !== undefined) {
      const next = address || {};
      updates.address = {
        line1: String(next.line1 || '').trim(),
        line2: String(next.line2 || '').trim(),
        city: String(next.city || '').trim(),
        state: String(next.state || '').trim(),
        postalCode: String(next.postalCode || '').trim(),
        country: String(next.country || '').trim(),
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const updated = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: toUserResponse(updated) });
  } catch (err) {
    console.error('PUT /api/auth/me error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

module.exports = {
  signup,
  login,
  me,
  updateMe,
};


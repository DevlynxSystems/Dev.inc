const User = require('../models/User');

/**
 * Maps a User mongoose document to a safe API response shape.
 * @param {import('mongoose').Document & Object} u
 * @returns {{ id: any, name: string, email: string, role: string, phone: string, address: Object, createdAt: any, updatedAt: any }}
 */
function safeUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || '',
    address: u.address || {},
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

/**
 * Lists users with optional query and role filtering.
 * Query params:
 * - q: case-insensitive search on name/email
 * - role: one of "user" | "admin"
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function listUsers(req, res) {
  try {
    const { q, role } = req.query || {};
    const query = {};

    if (role === 'user' || role === 'admin') query.role = role;

    if (q) {
      const s = String(q).trim();
      if (s) {
        query.$or = [
          { name: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
        ];
      }
    }

    const users = await User.find(query)
      .select('name email role phone address createdAt updatedAt')
      .sort({ createdAt: -1 });

    return res.json({ users: users.map(safeUser) });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

/**
 * Gets a single user by id.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select(
      'name email role phone address createdAt updatedAt'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: safeUser(user) });
  } catch (err) {
    console.error('GET /api/admin/users/:id error:', err);
    return res.status(400).json({ error: 'Failed to fetch user' });
  }
}

/**
 * Updates editable user fields (name, phone, address).
 * Returns 400 if payload has no valid updatable fields.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function updateUser(req, res) {
  try {
    const { name, phone, address } = req.body || {};
    const updates = {};

    if (name !== undefined) {
      const next = String(name || '').trim();
      if (!next) return res.status(400).json({ error: 'Name cannot be empty' });
      updates.name = next;
    }

    if (phone !== undefined) updates.phone = String(phone || '').trim();

    if (address !== undefined) {
      const a = address || {};
      updates.address = {
        line1: String(a.line1 || '').trim(),
        line2: String(a.line2 || '').trim(),
        city: String(a.city || '').trim(),
        state: String(a.state || '').trim(),
        postalCode: String(a.postalCode || '').trim(),
        country: String(a.country || '').trim(),
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('name email role phone address createdAt updatedAt');

    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: safeUser(updated) });
  } catch (err) {
    console.error('PUT /api/admin/users/:id error:', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

/**
 * Deletes a user by id.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function deleteUser(req, res) {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('DELETE /api/admin/users/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

/**
 * Updates a user's role.
 * Accepted values: "user" or "admin".
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function patchUserRole(req, res) {
  try {
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'role must be either "user" or "admin"' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select('name email role phone address createdAt updatedAt');

    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: safeUser(updated) });
  } catch (err) {
    console.error('PATCH /api/admin/users/:id/role error:', err);
    return res.status(500).json({ error: 'Failed to update role' });
  }
}

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  patchUserRole,
};


const jwt = require('jsonwebtoken');



/**
 * Retrieves the JWT secret key used for signing and verifying tokens.
 *
 * In a production environment, this value should always be stored
 * securely in an environment variable (JWT_SECRET).
 *
 * @returns {string} The JWT secret key
 */

function getJwtSecret() {
  // In production, set `JWT_SECRET` in Backend/.env
  return process.env.JWT_SECRET || 'dev-only-secret-change-me';
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;


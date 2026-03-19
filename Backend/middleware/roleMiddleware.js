function roleMiddleware(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return function roleCheck(req, res, next) {
    if (!req.user?.role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

module.exports = roleMiddleware;


/**
 * Express middleware factory for role-based access control.
 * @param {string|string[]} allowedRoles - Accepted role(s) for the route.
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => any}
 */
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


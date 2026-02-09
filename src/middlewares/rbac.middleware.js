const ApiError = require('../utils/ApiError');

/**
 * Middleware to restrict access based on user roles
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
exports.authorize = (allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user is authenticated (auth middleware should have run first)
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    // 2. Check if user's role is in the allowedRoles array
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    // 3. User is authorized
    next();
  };
};

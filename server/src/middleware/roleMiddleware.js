const ApiError = require("../utils/apiError");

const requireAnyRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication is required"));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have access to this resource"));
  }

  return next();
};

const requireSystemAdmin = (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication is required"));
  }

  if (req.user.role !== "system_admin") {
    return next(new ApiError(403, "This action is restricted to system administrators"));
  }

  return next();
};

module.exports = {
  requireAnyRole,
  requireSystemAdmin,
};


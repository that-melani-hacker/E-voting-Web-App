const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Authentication token is required"));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
};

module.exports = {
  requireAuth,
};


const { generateCorrelationId } = require("../utils/security");

const requestContext = (req, res, next) => {
  req.correlationId = generateCorrelationId();
  req.clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null;
  res.setHeader("X-Correlation-Id", req.correlationId);
  next();
};

module.exports = requestContext;


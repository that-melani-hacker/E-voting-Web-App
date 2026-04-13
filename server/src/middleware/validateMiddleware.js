const { validationResult } = require("express-validator");

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next({
      statusCode: 422,
      message: "Validation failed",
      details: errors.array(),
    });
  }

  return next();
};

module.exports = validateRequest;


const { body } = require("express-validator");

const studentLoginValidator = [
  body("matric_no").trim().notEmpty().withMessage("Matriculation number is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

const adminLoginValidator = [
  body("email").isEmail().withMessage("A valid email address is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

const studentRegisterValidator = [
  body("matric_no")
    .trim()
    .notEmpty().withMessage("Matriculation number is required")
    .isLength({ min: 5, max: 20 }).withMessage("Matriculation number must be between 5 and 20 characters"),
  body("full_name")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 150 }).withMessage("Full name must be between 2 and 150 characters"),
  body("email")
    .isEmail().withMessage("A valid email address is required"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
  body("confirm_password")
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
];

module.exports = {
  studentLoginValidator,
  adminLoginValidator,
  studentRegisterValidator,
};


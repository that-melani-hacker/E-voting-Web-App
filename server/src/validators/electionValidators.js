const { body, param, query } = require("express-validator");

const electionCreateValidator = [
  body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Election title is required"),
  body("description").optional().trim().isLength({ max: 5000 }),
  body("start_time").isISO8601().withMessage("Valid start time is required"),
  body("end_time")
    .isISO8601()
    .withMessage("Valid end time is required")
    .custom((value, { req }) => new Date(value) > new Date(req.body.start_time))
    .withMessage("Election end time must be later than the start time"),
  body("status").isIn(["upcoming", "active", "closed"]).withMessage("Invalid election status"),
];

const electionStatusValidator = [
  param("electionId").isInt({ min: 1 }).withMessage("Election ID must be numeric"),
  body("status").isIn(["upcoming", "active", "closed"]).withMessage("Invalid election status"),
];

const positionCreateValidator = [
  param("electionId").isInt({ min: 1 }).withMessage("Election ID must be numeric"),
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Position name is required"),
  body("max_selection").optional().isInt({ min: 1 }).withMessage("max_selection must be at least 1"),
  body("display_order").optional().isInt({ min: 0 }).withMessage("display_order must be 0 or greater"),
];

const candidateCreateValidator = [
  param("positionId").isInt({ min: 1 }).withMessage("Position ID must be numeric"),
  body("matric_no").trim().notEmpty().withMessage("Matriculation number is required"),
  body("full_name").trim().notEmpty().withMessage("Candidate full name is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("manifesto").optional().trim().isLength({ max: 3000 }),
  body("photo_url").optional().isURL().withMessage("photo_url must be a valid URL"),
];

const auditLogQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be numeric"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("action_type").optional().isString(),
];

module.exports = {
  electionCreateValidator,
  electionStatusValidator,
  positionCreateValidator,
  candidateCreateValidator,
  auditLogQueryValidator,
};

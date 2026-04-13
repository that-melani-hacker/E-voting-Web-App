const { body, param } = require("express-validator");

const electionIdParamValidator = [
  param("electionId").isInt({ min: 1 }).withMessage("Election ID must be numeric"),
];

const voteSubmissionValidator = [
  param("electionId").isInt({ min: 1 }).withMessage("Election ID must be numeric"),
  body("selections").isArray({ min: 1 }).withMessage("At least one ballot selection is required"),
  body("selections.*.position_id").isInt({ min: 1 }).withMessage("position_id must be numeric"),
  body("selections.*.candidate_id").isInt({ min: 1 }).withMessage("candidate_id must be numeric"),
];

module.exports = {
  electionIdParamValidator,
  voteSubmissionValidator,
};


const express = require("express");
const studentController = require("../controllers/studentController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAnyRole } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateMiddleware");
const { electionIdParamValidator, voteSubmissionValidator } = require("../validators/voteValidators");

const router = express.Router();

router.use(requireAuth, requireAnyRole("student"));

router.get("/elections/active", studentController.getActiveElection);
router.get("/elections/published", studentController.getPublishedElections);
router.get("/elections/:electionId/results", electionIdParamValidator, validateRequest, studentController.getPublishedResults);
router.get("/elections/:electionId/ballot", electionIdParamValidator, validateRequest, studentController.getBallot);
router.post("/elections/:electionId/vote", voteSubmissionValidator, validateRequest, studentController.submitVote);
router.get(
  "/elections/:electionId/confirmation",
  electionIdParamValidator,
  validateRequest,
  studentController.getConfirmation
);

module.exports = router;


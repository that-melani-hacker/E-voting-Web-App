const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAnyRole, requireSystemAdmin } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateMiddleware");
const {
  electionCreateValidator,
  electionStatusValidator,
  positionCreateValidator,
  candidateCreateValidator,
  auditLogQueryValidator,
} = require("../validators/electionValidators");

const router = express.Router();

router.use(requireAuth, requireAnyRole("election_admin", "system_admin"));

router.post("/elections", electionCreateValidator, validateRequest, adminController.createElection);
router.get("/elections", adminController.listElections);
router.patch("/elections/:electionId/status", electionStatusValidator, validateRequest, adminController.updateElectionStatus);
router.get("/elections/:electionId/positions", adminController.listPositions);
router.post("/elections/:electionId/positions", positionCreateValidator, validateRequest, adminController.createPosition);
router.post("/positions/:positionId/candidates", candidateCreateValidator, validateRequest, adminController.createCandidate);
router.get("/elections/:electionId/results", adminController.getResults);
router.get("/elections/:electionId/results/export", requireSystemAdmin, adminController.exportResultsCsv);
router.post("/elections/:electionId/publish-results", requireSystemAdmin, adminController.publishResults);
router.get("/audit-logs", requireSystemAdmin, auditLogQueryValidator, validateRequest, adminController.getAuditLogs);

module.exports = router;


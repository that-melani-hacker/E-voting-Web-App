const express = require("express");
const { body, param } = require("express-validator");
const systemController = require("../controllers/systemController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAnyRole } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateMiddleware");

const router = express.Router();

router.use(requireAuth, requireAnyRole("system_admin"));

router.get("/users", systemController.listUsers);
router.patch(
  "/students/:studentId/status",
  [
    param("studentId").isInt({ min: 1 }).withMessage("Student ID must be numeric"),
    body("is_active").isBoolean().withMessage("is_active must be a boolean"),
  ],
  validateRequest,
  systemController.updateStudentStatus
);

module.exports = router;


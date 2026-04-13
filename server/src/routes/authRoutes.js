const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateMiddleware");
const { authLimiter } = require("../middleware/rateLimiters");
const { studentLoginValidator, adminLoginValidator, studentRegisterValidator } = require("../validators/authValidators");

const router = express.Router();

router.post("/student/register", authLimiter, studentRegisterValidator, validateRequest, authController.studentRegister);
router.post("/student/login", authLimiter, studentLoginValidator, validateRequest, authController.studentLogin);
router.post("/admin/login", authLimiter, adminLoginValidator, validateRequest, authController.adminLogin);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.getCurrentUser);

module.exports = router;


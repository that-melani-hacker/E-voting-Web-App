const asyncHandler = require("../utils/asyncHandler");
const userRepository = require("../repositories/userRepository");
const auditService = require("../services/auditService");

const listUsers = asyncHandler(async (_req, res) => {
  const users = await userRepository.listUsers();
  res.status(200).json({
    success: true,
    data: users,
  });
});

const updateStudentStatus = asyncHandler(async (req, res) => {
  await userRepository.updateStudentStatus(Number(req.params.studentId), req.body.is_active);
  await auditService.logEvent({
    actorId: req.user.sub,
    actorType: "admin",
    actionType: "admin_action",
    details: `Student ${req.params.studentId} status updated to ${req.body.is_active}`,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(200).json({
    success: true,
    message: "Student status updated successfully",
  });
});

module.exports = {
  listUsers,
  updateStudentStatus,
};

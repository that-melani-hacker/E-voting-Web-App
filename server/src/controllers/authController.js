const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

const studentLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginStudent({
    matricNo: req.body.matric_no,
    password: req.body.password,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(200).json({ success: true, message: "Login successful", ...result });
});

const adminLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginAdmin({
    email: req.body.email,
    password: req.body.password,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(200).json({ success: true, message: "Login successful", ...result });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

const studentRegister = asyncHandler(async (req, res) => {
  const result = await authService.registerStudent({
    matric_no: req.body.matric_no,
    full_name: req.body.full_name,
    email: req.body.email,
    password: req.body.password,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });
  res.status(201).json({ success: true, message: "Account created successfully", ...result });
});

const logout = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful on client side. Discard the stored token.",
  });
});

module.exports = {
  studentLogin,
  studentRegister,
  adminLogin,
  getCurrentUser,
  logout,
};


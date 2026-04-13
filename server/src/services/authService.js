const bcrypt = require("bcrypt");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const { signAccessToken } = require("../utils/jwt");
const userRepository = require("../repositories/userRepository");
const auditService = require("./auditService");

const buildLockedUntil = () => {
  const lockedUntil = new Date();
  lockedUntil.setMinutes(lockedUntil.getMinutes() + env.loginLockMinutes);
  return lockedUntil;
};

const isLocked = (lockedUntil) => lockedUntil && new Date(lockedUntil) > new Date();

const recordFailure = async ({ actor, type, ipAddress, correlationId }) => {
  const nextCount = (actor.failed_login_attempts || 0) + 1;
  const shouldLock = nextCount >= env.loginLockThreshold;
  const lockedUntil = shouldLock ? buildLockedUntil() : null;

  if (type === "student") {
    await userRepository.incrementStudentLoginFailure(actor.student_id, nextCount, lockedUntil);
  } else {
    await userRepository.incrementAdminLoginFailure(actor.admin_id, nextCount, lockedUntil);
  }

  await auditService.logEvent({
    actorId: type === "student" ? actor.student_id : actor.admin_id,
    actorType: type,
    actionType: "login_failed",
    details: shouldLock
      ? `${type} login failed and account was temporarily locked after ${nextCount} attempts`
      : `${type} login failed`,
    ipAddress,
    correlationId,
  });
};

const loginStudent = async ({ matricNo, password, ipAddress, correlationId }) => {
  const student = await userRepository.findStudentByMatricNo(matricNo);

  if (!student) {
    await auditService.logEvent({
      actorId: 0,
      actorType: "system",
      actionType: "login_failed",
      details: `Student login failed for unknown matric number ${matricNo}`,
      ipAddress,
      correlationId,
    });
    throw new ApiError(401, "Invalid matriculation number or password");
  }

  if (!student.is_active) {
    await auditService.logEvent({
      actorId: student.student_id,
      actorType: "student",
      actionType: "login_failed",
      details: "Student login attempted on an inactive account",
      ipAddress,
      correlationId,
    });
    throw new ApiError(403, "This student account is inactive");
  }

  if (isLocked(student.locked_until)) {
    await auditService.logEvent({
      actorId: student.student_id,
      actorType: "student",
      actionType: "login_failed",
      details: "Student login attempted on a locked account",
      ipAddress,
      correlationId,
    });
    throw new ApiError(423, "Account temporarily locked due to repeated failed login attempts");
  }

  const passwordMatches = await bcrypt.compare(password, student.password_hash);
  if (!passwordMatches) {
    await recordFailure({ actor: student, type: "student", ipAddress, correlationId });
    throw new ApiError(401, "Invalid matriculation number or password");
  }

  await userRepository.resetStudentLoginFailures(student.student_id);
  await auditService.logEvent({
    actorId: student.student_id,
    actorType: "student",
    actionType: "login_success",
    details: "Student login successful",
    ipAddress,
    correlationId,
  });

  const token = signAccessToken({
    sub: student.student_id,
    role: "student",
    type: "student",
    full_name: student.full_name,
  });

  return {
    token,
    user: {
      id: student.student_id,
      full_name: student.full_name,
      email: student.email,
      matric_no: student.matric_no,
      role: "student",
    },
  };
};

const loginAdmin = async ({ email, password, ipAddress, correlationId }) => {
  const admin = await userRepository.findAdminByEmail(email);

  if (!admin) {
    await auditService.logEvent({
      actorId: 0,
      actorType: "system",
      actionType: "login_failed",
      details: `Admin login failed for unknown email ${email}`,
      ipAddress,
      correlationId,
    });
    throw new ApiError(401, "Invalid email or password");
  }

  if (!admin.is_active) {
    await auditService.logEvent({
      actorId: admin.admin_id,
      actorType: "admin",
      actionType: "login_failed",
      details: "Admin login attempted on an inactive account",
      ipAddress,
      correlationId,
    });
    throw new ApiError(403, "This admin account is inactive");
  }

  if (isLocked(admin.locked_until)) {
    await auditService.logEvent({
      actorId: admin.admin_id,
      actorType: "admin",
      actionType: "login_failed",
      details: "Admin login attempted on a locked account",
      ipAddress,
      correlationId,
    });
    throw new ApiError(423, "Account temporarily locked due to repeated failed login attempts");
  }

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatches) {
    await recordFailure({ actor: admin, type: "admin", ipAddress, correlationId });
    throw new ApiError(401, "Invalid email or password");
  }

  await userRepository.resetAdminLoginFailures(admin.admin_id);
  await auditService.logEvent({
    actorId: admin.admin_id,
    actorType: "admin",
    actionType: "login_success",
    details: `Admin login successful for role ${admin.role}`,
    ipAddress,
    correlationId,
  });

  const token = signAccessToken({
    sub: admin.admin_id,
    role: admin.role,
    type: "admin",
    full_name: admin.full_name,
  });

  return {
    token,
    user: {
      id: admin.admin_id,
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role,
    },
  };
};

const registerStudent = async ({ matric_no, full_name, email, password, ipAddress, correlationId }) => {
  const existingMatric = await userRepository.findStudentByMatricNo(matric_no);
  if (existingMatric) throw new ApiError(409, "This matriculation number is already registered");

  const existingEmail = await userRepository.findStudentByEmail(email);
  if (existingEmail) throw new ApiError(409, "This email address is already registered");

  const password_hash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const studentId = await userRepository.createStudent({ matric_no, full_name, email, password_hash });

  await auditService.logEvent({
    actorId: studentId,
    actorType: "student",
    actionType: "login_success",
    details: `New student account registered: ${full_name} (${matric_no})`,
    ipAddress,
    correlationId,
  });

  const token = signAccessToken({
    sub: studentId,
    role: "student",
    type: "student",
    full_name,
  });

  return {
    token,
    user: {
      id: studentId,
      full_name,
      email,
      matric_no,
      role: "student",
    },
  };
};

module.exports = {
  loginStudent,
  loginAdmin,
  registerStudent,
};

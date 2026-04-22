const pool = require("../config/db");

const findStudentByMatricNo = async (matricNo) => {
  const [rows] = await pool.query(
    `SELECT student_id, matric_no, full_name, email, password_hash, is_active,
            failed_login_attempts, locked_until, created_at
     FROM students
     WHERE matric_no = ?
     LIMIT 1`,
    [matricNo]
  );

  return rows[0] || null;
};

const findAdminByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT admin_id, full_name, email, password_hash, role, is_active,
            failed_login_attempts, locked_until, created_at
     FROM admins
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
};

const resetStudentLoginFailures = async (studentId) => {
  await pool.query(
    `UPDATE students
     SET failed_login_attempts = 0, locked_until = NULL
     WHERE student_id = ?`,
    [studentId]
  );
};

const incrementStudentLoginFailure = async (studentId, failedAttempts, lockedUntil = null) => {
  await pool.query(
    `UPDATE students
     SET failed_login_attempts = ?, locked_until = ?
     WHERE student_id = ?`,
    [failedAttempts, lockedUntil, studentId]
  );
};

const resetAdminLoginFailures = async (adminId) => {
  await pool.query(
    `UPDATE admins
     SET failed_login_attempts = 0, locked_until = NULL
     WHERE admin_id = ?`,
    [adminId]
  );
};

const incrementAdminLoginFailure = async (adminId, failedAttempts, lockedUntil = null) => {
  await pool.query(
    `UPDATE admins
     SET failed_login_attempts = ?, locked_until = ?
     WHERE admin_id = ?`,
    [failedAttempts, lockedUntil, adminId]
  );
};

const findStudentByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT student_id, matric_no, full_name, email, password_hash, is_active,
            failed_login_attempts, locked_until, created_at
     FROM students
     WHERE email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const createStudent = async ({ matric_no, full_name, email, password_hash }) => {
  const [result] = await pool.query(
    `INSERT INTO students (matric_no, full_name, email, password_hash, is_active)
     VALUES (?, ?, ?, ?, TRUE)`,
    [matric_no, full_name, email, password_hash]
  );
  return result.insertId;
};

const listUsers = async () => {
  const [studentRows] = await pool.query(
    `SELECT student_id AS id, full_name, email, matric_no AS identifier, 'student' AS actor_type, is_active, created_at
     FROM students`
  );
  const [adminRows] = await pool.query(
    `SELECT admin_id AS id, full_name, email, role AS identifier, 'admin' AS actor_type, is_active, created_at
     FROM admins`
  );

  return [...studentRows, ...adminRows];
};

const updateStudentStatus = async (studentId, isActive) => {
  await pool.query(`UPDATE students SET is_active = ? WHERE student_id = ?`, [isActive, studentId]);
};

module.exports = {
  findStudentByMatricNo,
  findStudentByEmail,
  createStudent,
  findAdminByEmail,
  resetStudentLoginFailures,
  incrementStudentLoginFailure,
  resetAdminLoginFailures,
  incrementAdminLoginFailure,
  listUsers,
  updateStudentStatus,
};


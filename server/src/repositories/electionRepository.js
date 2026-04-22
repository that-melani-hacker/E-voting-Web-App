const pool = require("../config/db");

const createElection = async ({ title, description, start_time, end_time, status, created_by }) => {
  const [result] = await pool.query(
    `INSERT INTO elections (title, description, start_time, end_time, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description || null, start_time, end_time, status, created_by]
  );

  return result.insertId;
};

const getElectionById = async (electionId) => {
  const [rows] = await pool.query(
    `SELECT election_id, title, description, start_time, end_time, status, results_published, created_by, created_at, updated_at
     FROM elections
     WHERE election_id = ?`,
    [electionId]
  );
  return rows[0] || null;
};

const getActiveElection = async () => {
  const [rows] = await pool.query(
    `SELECT election_id, title, description, start_time, end_time, status, results_published
     FROM elections
     WHERE status = 'active'
       AND NOW() BETWEEN start_time AND end_time
     ORDER BY start_time ASC
     LIMIT 1`
  );
  return rows[0] || null;
};

const listElections = async () => {
  const [rows] = await pool.query(
    `SELECT election_id, title, description, start_time, end_time, status, results_published, created_by, created_at, updated_at
     FROM elections
     ORDER BY created_at DESC`
  );
  return rows;
};

const updateElectionStatus = async (electionId, status) => {
  await pool.query(`UPDATE elections SET status = ? WHERE election_id = ?`, [status, electionId]);
};

const publishElectionResults = async (electionId) => {
  await pool.query(`UPDATE elections SET results_published = TRUE WHERE election_id = ?`, [electionId]);
};

const createPosition = async ({ electionId, name, maxSelection = 1, displayOrder = 0 }) => {
  const [result] = await pool.query(
    `INSERT INTO positions (election_id, name, max_selection, display_order)
     VALUES (?, ?, ?, ?)`,
    [electionId, name, maxSelection, displayOrder]
  );
  return result.insertId;
};

const listPositionsByElection = async (electionId) => {
  const [rows] = await pool.query(
    `SELECT position_id, name, max_selection, display_order
     FROM positions
     WHERE election_id = ?
     ORDER BY display_order ASC, position_id ASC`,
    [electionId]
  );
  return rows;
};

const getPositionById = async (positionId) => {
  const [rows] = await pool.query(
    `SELECT position_id, election_id, name, max_selection, display_order
     FROM positions
     WHERE position_id = ?`,
    [positionId]
  );
  return rows[0] || null;
};

const createCandidate = async ({ positionId, matricNo, fullName, department, manifesto, photoUrl }) => {
  const [result] = await pool.query(
    `INSERT INTO candidates (position_id, matric_no, full_name, department, manifesto, photo_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [positionId, matricNo, fullName, department || null, manifesto || null, photoUrl || null]
  );
  return result.insertId;
};

module.exports = {
  createElection,
  getElectionById,
  getActiveElection,
  listElections,
  updateElectionStatus,
  publishElectionResults,
  createPosition,
  listPositionsByElection,
  getPositionById,
  createCandidate,
};

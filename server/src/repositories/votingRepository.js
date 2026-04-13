const pool = require("../config/db");

const getParticipationRecord = async (studentId, electionId) => {
  const [rows] = await pool.query(
    `SELECT id, student_id, election_id, receipt_code, voted_at
     FROM voter_participation
     WHERE student_id = ? AND election_id = ?
     LIMIT 1`,
    [studentId, electionId]
  );

  return rows[0] || null;
};

const getCandidateMapForElection = async (electionId) => {
  const [rows] = await pool.query(
    `SELECT c.candidate_id, c.position_id, p.max_selection
     FROM candidates c
     INNER JOIN positions p ON p.position_id = c.position_id
     WHERE p.election_id = ?
       AND c.is_active = TRUE`,
    [electionId]
  );

  return rows;
};

const getBallotForElection = async (electionId) => {
  const [positions] = await pool.query(
    `SELECT position_id, election_id, name, max_selection, display_order
     FROM positions
     WHERE election_id = ?
     ORDER BY display_order ASC, name ASC`,
    [electionId]
  );

  const [candidates] = await pool.query(
    `SELECT c.candidate_id, c.position_id, c.student_id, c.full_name, c.manifesto, c.photo_url
     FROM candidates c
     INNER JOIN positions p ON p.position_id = c.position_id
     WHERE p.election_id = ?
       AND c.is_active = TRUE
     ORDER BY c.full_name ASC`,
    [electionId]
  );

  return positions.map((position) => ({
    ...position,
    candidates: candidates.filter((candidate) => candidate.position_id === position.position_id),
  }));
};

const submitBallot = async ({ electionId, studentId, selections, receiptCode, ballotRef, auditPayload }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO voter_participation (student_id, election_id, receipt_code)
       VALUES (?, ?, ?)`,
      [studentId, electionId, receiptCode]
    );

    for (const selection of selections) {
      await connection.query(
        `INSERT INTO votes (election_id, position_id, candidate_id, ballot_ref)
         VALUES (?, ?, ?, ?)`,
        [electionId, selection.position_id, selection.candidate_id, ballotRef]
      );
    }

    await connection.query(
      `INSERT INTO audit_logs (actor_id, actor_type, action_type, details, ip_address, correlation_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        auditPayload.actorId,
        auditPayload.actorType,
        auditPayload.actionType,
        auditPayload.details,
        auditPayload.ipAddress,
        auditPayload.correlationId,
      ]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getElectionResults = async (electionId) => {
  const [rows] = await pool.query(
    `SELECT
       p.position_id,
       p.name AS position_name,
       c.candidate_id,
       c.full_name AS candidate_name,
       COUNT(v.vote_id) AS vote_count
     FROM positions p
     INNER JOIN candidates c ON c.position_id = p.position_id
     LEFT JOIN votes v
       ON v.position_id = p.position_id
      AND v.candidate_id = c.candidate_id
      AND v.election_id = p.election_id
     WHERE p.election_id = ?
     GROUP BY p.position_id, p.name, c.candidate_id, c.full_name
     ORDER BY p.display_order ASC, p.name ASC, vote_count DESC, c.full_name ASC`,
    [electionId]
  );

  const grouped = new Map();

  rows.forEach((row) => {
    if (!grouped.has(row.position_id)) {
      grouped.set(row.position_id, {
        position_id: row.position_id,
        position_name: row.position_name,
        candidates: [],
      });
    }

    grouped.get(row.position_id).candidates.push({
      candidate_id: row.candidate_id,
      candidate_name: row.candidate_name,
      vote_count: Number(row.vote_count),
    });
  });

  return Array.from(grouped.values()).map((position) => {
    const highestVotes = Math.max(...position.candidates.map((candidate) => candidate.vote_count), 0);
    return {
      ...position,
      candidates: position.candidates.map((candidate) => ({
        ...candidate,
        is_winner: candidate.vote_count === highestVotes && highestVotes > 0,
      })),
    };
  });
};

module.exports = {
  getParticipationRecord,
  getCandidateMapForElection,
  getBallotForElection,
  submitBallot,
  getElectionResults,
};


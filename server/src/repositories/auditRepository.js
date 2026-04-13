const pool = require("../config/db");

const createAuditLog = async ({
  actorId,
  actorType,
  actionType,
  details,
  ipAddress,
  correlationId,
  connection = pool,
}) => {
  await connection.query(
    `INSERT INTO audit_logs (actor_id, actor_type, action_type, details, ip_address, correlation_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [actorId, actorType, actionType, details, ipAddress, correlationId]
  );
};

const getAuditLogs = async ({ page = 1, limit = 20, actionType }) => {
  const offset = (page - 1) * limit;
  const params = [];
  let whereClause = "";

  if (actionType) {
    whereClause = "WHERE action_type = ?";
    params.push(actionType);
  }

  const [rows] = await pool.query(
    `SELECT audit_id, actor_id, actor_type, action_type, details, ip_address, correlation_id, timestamp
     FROM audit_logs
     ${whereClause}
     ORDER BY timestamp DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM audit_logs
     ${whereClause}`,
    params
  );

  return {
    rows,
    total: countRows[0]?.total || 0,
    page,
    limit,
  };
};

module.exports = {
  createAuditLog,
  getAuditLogs,
};


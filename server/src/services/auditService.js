const auditRepository = require("../repositories/auditRepository");

const logEvent = async (payload) => auditRepository.createAuditLog(payload);
const getLogs = async (query) => auditRepository.getAuditLogs(query);

module.exports = {
  logEvent,
  getLogs,
};


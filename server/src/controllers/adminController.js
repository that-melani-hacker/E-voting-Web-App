const asyncHandler = require("../utils/asyncHandler");
const electionService = require("../services/electionService");
const resultService = require("../services/resultService");
const auditService = require("../services/auditService");

const createElection = asyncHandler(async (req, res) => {
  const election = await electionService.createElection({
    payload: req.body,
    actor: req.user,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(201).json({
    success: true,
    message: "Election created successfully",
    data: election,
  });
});

const listElections = asyncHandler(async (_req, res) => {
  const elections = await electionService.listElections();
  res.status(200).json({
    success: true,
    data: elections,
  });
});

const listPositions = asyncHandler(async (req, res) => {
  const positions = await electionService.listPositions(Number(req.params.electionId));
  res.status(200).json({ success: true, data: positions });
});

const createPosition = asyncHandler(async (req, res) => {
  const result = await electionService.createPosition({
    electionId: Number(req.params.electionId),
    payload: req.body,
    actor: req.user,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(201).json({
    success: true,
    message: "Position created successfully",
    data: result,
  });
});

const createCandidate = asyncHandler(async (req, res) => {
  const result = await electionService.createCandidate({
    positionId: Number(req.params.positionId),
    payload: req.body,
    actor: req.user,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(201).json({
    success: true,
    message: "Candidate added successfully",
    data: result,
  });
});

const updateElectionStatus = asyncHandler(async (req, res) => {
  const election = await electionService.updateElectionStatus({
    electionId: Number(req.params.electionId),
    status: req.body.status,
    actor: req.user,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(200).json({
    success: true,
    message: "Election status updated",
    data: election,
  });
});

const getResults = asyncHandler(async (req, res) => {
  const results = await resultService.getResults(Number(req.params.electionId));
  res.status(200).json({
    success: true,
    data: results,
  });
});

const exportResultsCsv = asyncHandler(async (req, res) => {
  const csv = await resultService.buildResultsCsv(Number(req.params.electionId));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="election-${req.params.electionId}-results.csv"`);
  res.status(200).send(csv);
});

const publishResults = asyncHandler(async (req, res) => {
  const results = await resultService.publishResults({
    electionId: Number(req.params.electionId),
    actor: req.user,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(200).json({
    success: true,
    message: "Results published successfully",
    data: results,
  });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const logs = await auditService.getLogs({
    page,
    limit,
    actionType: req.query.action_type,
  });

  res.status(200).json({
    success: true,
    data: logs,
  });
});

module.exports = {
  createElection,
  listElections,
  listPositions,
  createPosition,
  createCandidate,
  updateElectionStatus,
  getResults,
  exportResultsCsv,
  publishResults,
  getAuditLogs,
};


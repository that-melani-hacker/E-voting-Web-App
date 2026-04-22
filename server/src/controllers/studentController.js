const asyncHandler = require("../utils/asyncHandler");
const electionService = require("../services/electionService");
const voteService = require("../services/voteService");
const resultService = require("../services/resultService");
const ApiError = require("../utils/apiError");

const getActiveElection = asyncHandler(async (_req, res) => {
  const election = await electionService.getActiveElectionWithBallot();
  res.status(200).json({
    success: true,
    data: election,
  });
});

const getBallot = asyncHandler(async (req, res) => {
  const ballot = await electionService.getBallot(Number(req.params.electionId));
  res.status(200).json({
    success: true,
    data: ballot,
  });
});

const submitVote = asyncHandler(async (req, res) => {
  const receipt = await voteService.submitVote({
    electionId: Number(req.params.electionId),
    studentId: req.user.sub,
    selections: req.body.selections,
    ipAddress: req.clientIp,
    correlationId: req.correlationId,
  });

  res.status(201).json({
    success: true,
    message: "Vote submitted successfully",
    data: receipt,
  });
});

const getConfirmation = asyncHandler(async (req, res) => {
  const confirmation = await voteService.getConfirmation({
    electionId: Number(req.params.electionId),
    studentId: req.user.sub,
  });

  res.status(200).json({
    success: true,
    data: confirmation,
  });
});

const getPublishedElections = asyncHandler(async (_req, res) => {
  const elections = await electionService.listElections();
  const published = elections.filter((e) => e.results_published);
  res.status(200).json({ success: true, data: published });
});

const getPublishedResults = asyncHandler(async (req, res) => {
  const electionId = Number(req.params.electionId);
  const elections = await electionService.listElections();
  const election = elections.find((e) => e.election_id === electionId);
  if (!election) throw new ApiError(404, "Election not found");
  if (!election.results_published) throw new ApiError(403, "Results for this election have not been published yet");
  const results = await resultService.getResults(electionId);
  res.status(200).json({ success: true, data: results });
});

module.exports = {
  getActiveElection,
  getBallot,
  submitVote,
  getConfirmation,
  getPublishedElections,
  getPublishedResults,
};


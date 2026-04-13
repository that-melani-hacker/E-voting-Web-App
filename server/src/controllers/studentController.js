const asyncHandler = require("../utils/asyncHandler");
const electionService = require("../services/electionService");
const voteService = require("../services/voteService");

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

module.exports = {
  getActiveElection,
  getBallot,
  submitVote,
  getConfirmation,
};


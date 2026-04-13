const ApiError = require("../utils/apiError");
const { generateBallotRef, generateReceiptCode } = require("../utils/security");
const electionRepository = require("../repositories/electionRepository");
const votingRepository = require("../repositories/votingRepository");

const ensureElectionIsVotable = (election) => {
  const now = new Date();
  const start = new Date(election.start_time);
  const end = new Date(election.end_time);

  if (election.status !== "active" || now < start || now > end) {
    throw new ApiError(400, "This election is not currently open for voting");
  }
};

const submitVote = async ({ electionId, studentId, selections, ipAddress, correlationId }) => {
  const election = await electionRepository.getElectionById(electionId);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  ensureElectionIsVotable(election);

  const existingParticipation = await votingRepository.getParticipationRecord(studentId, electionId);
  if (existingParticipation) {
    throw new ApiError(409, "You have already voted in this election");
  }

  const candidateRows = await votingRepository.getCandidateMapForElection(electionId);
  const candidateById = new Map(candidateRows.map((row) => [row.candidate_id, row]));
  const selectionCounts = new Map();

  for (const selection of selections) {
    const candidate = candidateById.get(selection.candidate_id);

    if (!candidate) {
      throw new ApiError(400, "One or more selected candidates are invalid");
    }

    if (candidate.position_id !== selection.position_id) {
      throw new ApiError(400, "Candidate does not belong to the selected position");
    }

    const currentCount = selectionCounts.get(selection.position_id) || 0;
    const nextCount = currentCount + 1;

    if (nextCount > candidate.max_selection) {
      throw new ApiError(400, "You selected too many candidates for a position");
    }

    selectionCounts.set(selection.position_id, nextCount);
  }

  const receiptCode = generateReceiptCode();
  const ballotRef = generateBallotRef();

  try {
    await votingRepository.submitBallot({
      electionId,
      studentId,
      selections,
      receiptCode,
      ballotRef,
      auditPayload: {
        actorId: studentId,
        actorType: "student",
        actionType: "vote_submitted",
        details: `Student submitted ballot for election ${election.title}`,
        ipAddress,
        correlationId,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "You have already voted in this election");
    }

    throw error;
  }

  return {
    election_id: electionId,
    receipt_code: receiptCode,
    submitted_at: new Date().toISOString(),
  };
};

const getConfirmation = async ({ electionId, studentId }) => {
  const participation = await votingRepository.getParticipationRecord(studentId, electionId);
  if (!participation) {
    throw new ApiError(404, "No voting confirmation found for this election");
  }

  return participation;
};

module.exports = {
  submitVote,
  getConfirmation,
};


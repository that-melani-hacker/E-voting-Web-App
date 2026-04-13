const ApiError = require("../utils/apiError");
const electionRepository = require("../repositories/electionRepository");
const votingRepository = require("../repositories/votingRepository");
const auditService = require("./auditService");

const getResults = async (electionId) => {
  const election = await electionRepository.getElectionById(electionId);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  const results = await votingRepository.getElectionResults(electionId);
  return {
    election,
    results,
  };
};

const publishResults = async ({ electionId, actor, ipAddress, correlationId }) => {
  const election = await electionRepository.getElectionById(electionId);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  if (election.status !== "closed") {
    throw new ApiError(400, "Election must be closed before results can be published");
  }

  await electionRepository.publishElectionResults(electionId);
  await auditService.logEvent({
    actorId: actor.sub,
    actorType: "admin",
    actionType: "result_published",
    details: `Results published for election ${election.title}`,
    ipAddress,
    correlationId,
  });

  return getResults(electionId);
};

const buildResultsCsv = async (electionId) => {
  const { election, results } = await getResults(electionId);
  const header = ["election_title", "position_name", "candidate_name", "vote_count", "is_winner"];
  const rows = [header.join(",")];

  results.forEach((position) => {
    position.candidates.forEach((candidate) => {
      rows.push(
        [
          `"${election.title.replace(/"/g, '""')}"`,
          `"${position.position_name.replace(/"/g, '""')}"`,
          `"${candidate.candidate_name.replace(/"/g, '""')}"`,
          candidate.vote_count,
          candidate.is_winner ? "yes" : "no",
        ].join(",")
      );
    });
  });

  return rows.join("\n");
};

module.exports = {
  getResults,
  publishResults,
  buildResultsCsv,
};

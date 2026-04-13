const ApiError = require("../utils/apiError");
const electionRepository = require("../repositories/electionRepository");
const votingRepository = require("../repositories/votingRepository");
const auditService = require("./auditService");

const createElection = async ({ payload, actor, ipAddress, correlationId }) => {
  const electionId = await electionRepository.createElection({
    ...payload,
    created_by: actor.sub,
  });

  await auditService.logEvent({
    actorId: actor.sub,
    actorType: "admin",
    actionType: "election_created",
    details: `Election created: ${payload.title}`,
    ipAddress,
    correlationId,
  });

  return electionRepository.getElectionById(electionId);
};

const listElections = async () => electionRepository.listElections();

const listPositions = async (electionId) => {
  const election = await electionRepository.getElectionById(electionId);
  if (!election) throw new ApiError(404, "Election not found");
  return electionRepository.listPositionsByElection(electionId);
};

const createPosition = async ({ electionId, payload, actor, ipAddress, correlationId }) => {
  const election = await electionRepository.getElectionById(electionId);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  const positionId = await electionRepository.createPosition({
    electionId,
    name: payload.name,
    maxSelection: payload.max_selection || 1,
    displayOrder: payload.display_order || 0,
  });

  await auditService.logEvent({
    actorId: actor.sub,
    actorType: "admin",
    actionType: "admin_action",
    details: `Position created: ${payload.name} for election ${election.title}`,
    ipAddress,
    correlationId,
  });

  return { position_id: positionId };
};

const createCandidate = async ({ positionId, payload, actor, ipAddress, correlationId }) => {
  const position = await electionRepository.getPositionById(positionId);
  if (!position) {
    throw new ApiError(404, "Position not found");
  }

  const student = await electionRepository.getStudentByMatricNo(payload.matric_no);
  if (!student) {
    throw new ApiError(404, `No registered student found with matric number ${payload.matric_no}`);
  }

  const candidateId = await electionRepository.createCandidate({
    positionId,
    studentId: student.student_id,
    fullName: payload.full_name,
    department: payload.department,
    manifesto: payload.manifesto,
    photoUrl: payload.photo_url,
  });

  await auditService.logEvent({
    actorId: actor.sub,
    actorType: "admin",
    actionType: "candidate_added",
    details: `Candidate added: ${payload.full_name} (${payload.matric_no}, ${payload.department}) to position ${position.name}`,
    ipAddress,
    correlationId,
  });

  return { candidate_id: candidateId };
};

const updateElectionStatus = async ({ electionId, status, actor, ipAddress, correlationId }) => {
  const election = await electionRepository.getElectionById(electionId);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  await electionRepository.updateElectionStatus(electionId, status);

  await auditService.logEvent({
    actorId: actor.sub,
    actorType: "admin",
    actionType: status === "closed" ? "election_closed" : "election_updated",
    details: `Election status updated to ${status} for ${election.title}`,
    ipAddress,
    correlationId,
  });

  return electionRepository.getElectionById(electionId);
};

const getActiveElectionWithBallot = async () => {
  const election = await electionRepository.getActiveElection();
  if (!election) {
    return null;
  }

  const positions = await votingRepository.getBallotForElection(election.election_id);
  return {
    ...election,
    positions,
  };
};

const getBallot = async (electionId) => {
  const election = await electionRepository.getElectionById(electionId);
  if (!election) {
    throw new ApiError(404, "Election not found");
  }

  const positions = await votingRepository.getBallotForElection(electionId);
  return {
    ...election,
    positions,
  };
};

module.exports = {
  createElection,
  listElections,
  listPositions,
  createPosition,
  createCandidate,
  updateElectionStatus,
  getActiveElectionWithBallot,
  getBallot,
};


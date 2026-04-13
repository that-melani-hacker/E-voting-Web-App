const crypto = require("crypto");

const generateReceiptCode = () => `TRI-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
const generateBallotRef = () => crypto.randomUUID();
const generateCorrelationId = () => crypto.randomUUID();

module.exports = {
  generateReceiptCode,
  generateBallotRef,
  generateCorrelationId,
};


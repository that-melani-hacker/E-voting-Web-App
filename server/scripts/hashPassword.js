const bcrypt = require("bcrypt");
const env = require("../src/config/env");

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error("Usage: npm run hash:password -- <plain-text-password>");
  process.exit(1);
}

const main = async () => {
  const hash = await bcrypt.hash(plainPassword, env.bcryptSaltRounds);
  console.log(hash);
};

main().catch((error) => {
  console.error("Failed to generate password hash:", error.message);
  process.exit(1);
});


const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "trinity_evoting",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },
  jwtSecret: process.env.JWT_SECRET || "replace_with_a_long_random_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  loginLockThreshold: Number(process.env.LOGIN_LOCK_THRESHOLD || 5),
  loginLockMinutes: Number(process.env.LOGIN_LOCK_MINUTES || 15),
};

module.exports = env;


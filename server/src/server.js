const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();

    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();


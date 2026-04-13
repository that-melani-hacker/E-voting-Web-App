const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const requestContext = require("./middleware/requestContext");
const errorHandler = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const systemRoutes = require("./routes/systemRoutes");

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(requestContext);
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Trinity University E-Voting API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/system", systemRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

module.exports = app;


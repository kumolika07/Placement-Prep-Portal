const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const aptitudeRoutes = require("./routes/aptitudeRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const officerRoutes = require("./routes/officerRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Global middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : "*",
    credentials: true,
  })
);

// ---- API routes ----
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Placement Prep Portal API is running", time: new Date() });
});

// No-op favicon so browsers do not log a 404.
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/officer", officerRoutes);

// ---- Serve the static frontend (optional single-server mode) ----
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

app.get("/", (req, res, next) => {
  // If the frontend exists, serve index.html; otherwise fall back to API info.
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      res.json({
        success: true,
        message: "Placement Prep Portal API",
        docs: "/api/health",
      });
    }
  });
});

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

// ---- Boot ----
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Placement Prep Portal running on http://localhost:${PORT}`);
    console.log(`[server] API base: http://localhost:${PORT}/api`);
  });
};

start();

module.exports = app;

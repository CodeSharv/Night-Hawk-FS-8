const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
const eventsRouter = require("./routes/events");
const usersRouter = require("./routes/users");
const bookmarksRouter = require("./routes/bookmarks");
const registrationsRouter = require("./routes/registrations");

app.use("/api/events", eventsRouter);
app.use("/api/users", usersRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/registrations", registrationsRouter);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Campus Event Discovery API running...",
    version: "1.0.0",
    endpoints: [
      "GET /api/events",
      "GET /api/events/:id",
      "POST /api/events",
      "PUT /api/events/:id",
      "DELETE /api/events/:id",
      "POST /api/users",
      "GET /api/users/me",
      "GET /api/users/:id",
      "GET /api/users",
      "PUT /api/users/:id",
      "DELETE /api/users/:id",
      "GET /api/bookmarks",
      "POST /api/bookmarks",
      "DELETE /api/bookmarks/:eventId",
      "GET /api/registrations",
      "POST /api/registrations",
      "DELETE /api/registrations/:eventId",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Campus Event API running on http://localhost:${PORT}`);
});

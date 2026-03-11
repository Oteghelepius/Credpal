const express = require("express");
const bodyParser = require("body-parser");
const { createClient } = require("redis");

const app = express();
app.use(bodyParser.json());

// Redis configuration
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;

const redisClient = createClient({
  url: `redis://${redisHost}:${redisPort}`
});

redisClient.connect().catch(console.error);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// Redis status check endpoint
app.get("/status", async (req, res) => {
  try {
    const pong = await redisClient.ping();
    res.json({
      service: "running",
      redis: pong
    });
  } catch (err) {
    res.status(500).json({ error: "Redis connection failed" });
  }
});

// GET /process/ for browser-friendly testing
app.get("/process", (req, res) => {
  res.send("Devops Node Assessment");
});

// POST /process/ to store payload in Redis
app.post("/process", async (req, res) => {
  const payload = req.body;

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).json({ error: "Payload is required" });
  }

  try {
    const id = Date.now().toString();
    await redisClient.set(id, JSON.stringify(payload));

    res.json({
      message: "Payload processed",
      id: id
    });
  } catch (err) {
    console.error("Processing error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
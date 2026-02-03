const express = require("express");
const crypto = require("crypto");
const app = express();
app.use(express.json());

const SECRET_TOKEN = "interview_token_123";
let lastRequestTime = 0;

// 1. Rate Limiter Middleware (Strict 1s gap)
app.use((req, res, next) => {
  const now = Date.now();
  // Allow a tiny buffer (50ms) for network jitter, but strict otherwise
  if (now - lastRequestTime < 950) {
    console.log(
      `[429] Request rejected. Time since last: ${now - lastRequestTime}ms`,
    );
    return res
      .status(429)
      .json({ error: "Too Many Requests. Limit: 1 req/sec." });
  }
  lastRequestTime = now;
  next();
});

// 2. Security Middleware (Signature Check)
app.use((req, res, next) => {
  const signature = req.headers["signature"];
  const timestamp = req.headers["timestamp"];
  const url = req.originalUrl;

  if (!timestamp || !signature) {
    return res
      .status(401)
      .json({ error: "Missing headers: signature or timestamp" });
  }

  // Expected: MD5( url + token + timestamp )
  const expectedSig = crypto
    .createHash("md5")
    .update(url + SECRET_TOKEN + timestamp)
    .digest("hex");

  if (signature !== expectedSig) {
    console.log(
      `[401] Bad Signature. Got: ${signature}, Expected: ${expectedSig}`,
    );
    return res.status(401).json({ error: "Invalid Signature" });
  }
  next();
});

// 3. Endpoint
app.post("/device/real/query", (req, res) => {
  const { sn_list } = req.body;

  if (!sn_list || !Array.isArray(sn_list)) {
    return res.status(400).json({ error: "sn_list array is required" });
  }
  if (sn_list.length > 10) {
    return res
      .status(400)
      .json({ error: "Batch size limit exceeded (Max 10)" });
  }

  // Simulate processing delay
  const results = sn_list.map((sn) => ({
    sn: sn,
    power: (Math.random() * 5).toFixed(2) + " kW",
    status: Math.random() > 0.1 ? "Online" : "Offline",
    last_updated: new Date().toISOString(),
  }));

  console.log(`[200] Success. Processed ${sn_list.length} devices.`);
  res.json({ data: results });
});

app.listen(3000, () => {
  console.log("⚡ EnergyGrid Mock API running on port 3000");
  console.log("   Constraints: 1 req/sec, Max 10 items/batch");
});

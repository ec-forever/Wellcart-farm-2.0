const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const retailerRouter = require("./routes/retailer");
const uploadRouter = require("./routes/upload");
const skuRouter = require("./routes/sku");

dotenv.config();

const app = express();
const frontendDir = path.join(__dirname, "..", "frontend");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(frontendDir));

// API routes
app.use("/api/retailer", retailerRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/sku", skuRouter);

// Frontend routes
app.get(["/", "/onboard", "/upload"], (req, res) => {
  const page = req.path === "/onboard" ? "onboard.html" : req.path === "/upload" ? "upload.html" : "index.html";
  res.sendFile(path.join(frontendDir, page));
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server normally
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

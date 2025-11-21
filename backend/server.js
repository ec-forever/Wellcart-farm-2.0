const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const retailerRouter = require("./routes/retailer");
const uploadRouter = require("./routes/upload");
const skuRouter = require("./routes/sku");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/retailer", retailerRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/sku", skuRouter);

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

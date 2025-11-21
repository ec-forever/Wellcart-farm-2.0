import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import retailerRouter from "./routes/retailer.js";
import uploadRouter from "./routes/upload.js";
import skuRouter from "./routes/sku.js";

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

if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;

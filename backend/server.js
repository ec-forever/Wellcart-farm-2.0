import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import retailerRouter from './routes/retailer.js';
import uploadRouter from './routes/upload.js';
import skuRouter from './routes/sku.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/retailer', retailerRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/sku', skuRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

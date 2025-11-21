const express = require('express');
const retailerRouter = require('./retailer');
const uploadPhotoRouter = require('./uploadPhoto');
const uploadCsvRouter = require('./uploadCsv');
const manualSkuRouter = require('./manualSku');
const eligibilityRouter = require('./eligibility');

const router = express.Router();

router.use('/retailer', retailerRouter);
router.use('/upload/photo', uploadPhotoRouter);
router.use('/upload/csv', uploadCsvRouter);
router.use('/sku/manual', manualSkuRouter);
router.use('/eligibility', eligibilityRouter);

module.exports = router;

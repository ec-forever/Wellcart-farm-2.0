const express = require('express');
const multer = require('multer');
const { uploadBufferToBucket } = require('../services/storage');
const { supabase } = require('../supabaseClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not configured' });
  }

  const { retailer_id } = req.body;

  if (!retailer_id) {
    return res.status(400).json({ error: 'retailer_id is required' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }

  try {
    const csvString = req.file.buffer.toString('utf-8');

    await uploadBufferToBucket({
      bucket: 'sku-csv-uploads',
      buffer: req.file.buffer,
      filename: req.file.originalname || 'upload.csv',
      contentType: req.file.mimetype || 'text/csv',
    });

    const { data, error } = await supabase
      .from('product_catalog_items')
      .insert([
        {
          retailer_id,
          source: 'csv',
          raw_payload: csvString,
        },
      ])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({ id: data.id });
  } catch (error) {
    console.error('Error uploading CSV', error);
    return res.status(500).json({ error: 'Failed to upload CSV' });
  }
});

module.exports = router;

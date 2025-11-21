const express = require('express');
const multer = require('multer');
const { uploadBufferToBucket } = require('../services/storage');
const { supabase } = require('../supabaseClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.any(), async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not configured' });
  }

  const { retailer_id } = req.body;

  if (!retailer_id) {
    return res.status(400).json({ error: 'retailer_id is required' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one photo is required' });
  }

  try {
    const insertedItems = [];

    for (const file of req.files) {
      const { publicUrl } = await uploadBufferToBucket({
        bucket: 'product-photos',
        buffer: file.buffer,
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const { data, error } = await supabase
        .from('product_catalog_items')
        .insert([{ retailer_id, image_url: publicUrl, source: 'photo', raw_payload: null }])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      insertedItems.push({ id: data.id, image_url: publicUrl });
    }

    return res.status(200).json({ items: insertedItems });
  } catch (error) {
    console.error('Error uploading product photos', error);
    return res.status(500).json({ error: 'Failed to upload product photos' });
  }
});

module.exports = router;

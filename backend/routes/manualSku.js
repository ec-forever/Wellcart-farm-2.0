const express = require('express');
const multer = require('multer');
const { uploadBufferToBucket } = require('../services/storage');
const { supabase } = require('../supabaseClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('photo'), async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not configured' });
  }

  const { name, price, unit_size, category, retailer_id } = req.body;

  if (!retailer_id) {
    return res.status(400).json({ error: 'retailer_id is required' });
  }

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    let imageUrl = null;

    if (req.file) {
      const { publicUrl } = await uploadBufferToBucket({
        bucket: 'product-photos',
        buffer: req.file.buffer,
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      imageUrl = publicUrl;
    }

    const payload = {
      name,
      price: price !== undefined ? Number(price) : null,
      unit_size: unit_size || null,
      category: category || null,
      retailer_id,
      image_url: imageUrl,
      source: 'manual',
      raw_payload: null,
    };

    const { data, error } = await supabase
      .from('product_catalog_items')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({ id: data.id, image_url: imageUrl });
  } catch (error) {
    console.error('Error creating manual SKU', error);
    return res.status(500).json({ error: 'Failed to create manual SKU' });
  }
});

module.exports = router;

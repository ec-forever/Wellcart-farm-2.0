const express = require('express');
const multer = require('multer');
const { uploadBufferToBucket } = require('../services/storage');
const { supabase } = require('../supabaseClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const multipartLogo = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return upload.single('logo')(req, res, next);
  }
  return next();
};

function decodeBase64Logo(logoString) {
  if (!logoString || typeof logoString !== 'string') return null;
  const cleaned = logoString.replace(/^data:[^;]+;base64,/, '');
  try {
    return Buffer.from(cleaned, 'base64');
  } catch (error) {
    return null;
  }
}

router.post('/', multipartLogo, async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not configured' });
  }

  try {
    const { name, revenue, gmv, store_count, pos_system } = req.body;

    let logoUrl = null;
    if (req.file) {
      const { publicUrl } = await uploadBufferToBucket({
        bucket: 'logos',
        buffer: req.file.buffer,
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      logoUrl = publicUrl;
    } else if (req.body.logo) {
      const buffer = decodeBase64Logo(req.body.logo);
      if (buffer) {
        const { publicUrl } = await uploadBufferToBucket({
          bucket: 'logos',
          buffer,
          filename: 'logo.png',
          contentType: 'image/png',
        });
        logoUrl = publicUrl;
      }
    }

    const payload = {
      name: name || null,
      revenue: revenue !== undefined ? Number(revenue) : null,
      gmv: gmv !== undefined ? Number(gmv) : null,
      store_count: store_count !== undefined ? Number(store_count) : null,
      pos_system: pos_system || null,
      logo_url: logoUrl,
    };

    const { data, error } = await supabase
      .from('retailer_profiles')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({ id: data.id });
  } catch (error) {
    console.error('Error creating retailer profile', error);
    return res.status(500).json({ error: 'Failed to create retailer profile' });
  }
});

module.exports = router;

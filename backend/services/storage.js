const { randomUUID } = require('crypto');
const path = require('path');
const { supabase } = require('../supabaseClient');

const CONTENT_TYPES = {
  default: 'application/octet-stream',
};

function buildPath(prefix, filename) {
  const ext = path.extname(filename || '') || '';
  const uniqueName = `${randomUUID()}${ext}`;
  return `${prefix}/${uniqueName}`;
}

async function uploadBufferToBucket({ bucket, buffer, filename, contentType }) {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const storagePath = buildPath(bucket, filename || 'upload');
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType: contentType || CONTENT_TYPES.default,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return {
    path: storagePath,
    publicUrl: publicUrlData ? publicUrlData.publicUrl : null,
  };
}

module.exports = {
  uploadBufferToBucket,
};

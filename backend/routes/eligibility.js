const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

router.get('/:id', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not configured' });
  }

  const retailerId = req.params.id;

  try {
    const reasons = [];

    const { data: profile, error: profileError } = await supabase
      .from('retailer_profiles')
      .select('revenue, gmv, store_count, pos_system')
      .eq('id', retailerId)
      .single();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      return res.status(404).json({ error: 'Retailer not found' });
    }

    if (profile.revenue === null || profile.revenue === undefined || Number(profile.revenue) < 5000) {
      reasons.push('Revenue below eligibility threshold');
    }

    if (profile.gmv === null || profile.gmv === undefined || Number(profile.gmv) < 5000) {
      reasons.push('GMV below eligibility threshold');
    }

    if (!profile.store_count || Number(profile.store_count) < 1) {
      reasons.push('At least one store is required');
    }

    if (!profile.pos_system) {
      reasons.push('POS system is required');
    }

    const { count, error: catalogError } = await supabase
      .from('product_catalog_items')
      .select('id', { head: true, count: 'exact' })
      .eq('retailer_id', retailerId);

    if (catalogError) {
      throw catalogError;
    }

    if (!count || count < 1) {
      reasons.push('No catalog items found');
    }

    return res.status(200).json({ eligible: reasons.length === 0, reasons });
  } catch (error) {
    console.error('Error checking eligibility', error);
    return res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

module.exports = router;

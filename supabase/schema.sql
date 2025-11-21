-- Supabase schema and storage configuration for Sprint 2
-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Retailer profiles table
CREATE TABLE IF NOT EXISTS retailer_profiles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name text,
    address text,
    contact_name text,
    contact_phone text,
    contact_email text,
    logo_url text,
    revenue numeric,
    gmv numeric,
    store_count int,
    offers_ecommerce boolean,
    offers_delivery boolean,
    channel_partner text,
    pos_system text,
    created_at timestamp DEFAULT now()
);

-- Product catalog items table
CREATE TABLE IF NOT EXISTS product_catalog_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    retailer_id uuid REFERENCES retailer_profiles(id),
    name text,
    price numeric,
    unit_size text,
    category text,
    image_url text,
    source text,
    raw_payload jsonb,
    created_at timestamp DEFAULT now()
);

-- Storage buckets for assets (public access enabled for testing only)
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('logos', 'logos', true),
    ('product-photos', 'product-photos', true),
    ('sku-csv-uploads', 'sku-csv-uploads', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    public = EXCLUDED.public;

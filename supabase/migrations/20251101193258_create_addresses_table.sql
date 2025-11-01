/*
  # Create addresses table

  1. New Tables
    - `addresses`
      - `id` (uuid, primary key) - Unique identifier for each address
      - `user_id` (uuid, foreign key) - References auth.users table
      - `country` (text) - Country name (e.g., "საქართველო")
      - `city` (text) - City name (e.g., "თბილისი")
      - `address` (text) - Full street address
      - `postal_code` (text) - Postal/ZIP code
      - `is_default` (boolean) - Whether this is the default address
      - `created_at` (timestamptz) - When the address was created
      - `updated_at` (timestamptz) - When the address was last updated

  2. Security
    - Enable RLS on `addresses` table
    - Add policy for authenticated users to read their own addresses
    - Add policy for authenticated users to insert their own addresses
    - Add policy for authenticated users to update their own addresses
    - Add policy for authenticated users to delete their own addresses

  3. Important Notes
    - Only one address per user can be set as default
    - When a new address is set as default, all other addresses for that user are set to non-default
    - Trigger function ensures data consistency for default addresses
*/

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country text NOT NULL DEFAULT '',
  city text NOT NULL,
  address text NOT NULL,
  postal_code text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses(user_id);

-- Create index for default addresses
CREATE INDEX IF NOT EXISTS addresses_is_default_idx ON addresses(user_id, is_default);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this address as default, unset all other defaults for this user
  IF NEW.is_default = true THEN
    UPDATE addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one default address per user
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON addresses;
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_addresses_updated_at_trigger ON addresses;
CREATE TRIGGER update_addresses_updated_at_trigger
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_addresses_updated_at();
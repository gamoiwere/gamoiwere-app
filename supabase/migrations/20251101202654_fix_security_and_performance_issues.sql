/*
  # Fix Security and Performance Issues

  1. Performance Optimizations
    - Add indexes for foreign keys on `order_items` table:
      - `order_items.order_id` (for faster order lookups)
      - `order_items.product_id` (for faster product lookups)
    - Add index for foreign key on `orders` table:
      - `orders.user_id` (for faster user order lookups)

  2. RLS Policy Optimization
    - Optimize all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth function for each row
    - Applies to all tables: `user_profiles`, `orders`, `order_items`, `addresses`

  3. Function Security
    - Set search_path for functions to prevent role mutable search_path issues:
      - `ensure_single_default_address` function
      - `update_addresses_updated_at` function

  4. Index Cleanup
    - Remove unused indexes:
      - `addresses_user_id_idx` (replaced with compound index)
      - `addresses_is_default_idx` (not needed for current queries)
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Index for order_items.order_id foreign key
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- Index for order_items.product_id foreign key
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);

-- Index for orders.user_id foreign key
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - user_profiles table
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - orders table
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - order_items table
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - addresses table
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own addresses"
  ON addresses
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- 6. FIX FUNCTION SEARCH PATH ISSUES
-- =====================================================

-- Recreate ensure_single_default_address function with secure search_path
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate update_addresses_updated_at function with secure search_path
CREATE OR REPLACE FUNCTION update_addresses_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 7. REMOVE UNUSED INDEXES
-- =====================================================

-- Drop the standalone user_id index (covered by compound index)
DROP INDEX IF EXISTS addresses_user_id_idx;

-- Drop the is_default index (not being used in queries)
DROP INDEX IF EXISTS addresses_is_default_idx;

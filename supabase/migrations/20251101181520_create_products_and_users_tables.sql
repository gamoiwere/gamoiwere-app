/*
  # Create Products and Users Tables for gamoiwere.ge

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name in English
      - `name_ka` (text) - Product name in Georgian
      - `description` (text) - Description in English
      - `description_ka` (text) - Description in Georgian
      - `price` (numeric) - Product price
      - `image_url` (text) - Product image URL
      - `category` (text) - Category in English
      - `category_ka` (text) - Category in Georgian
      - `is_recommended` (boolean) - Whether product is recommended
      - `is_popular` (boolean) - Whether product is popular
      - `in_stock` (boolean) - Stock availability
      - `created_at` (timestamptz) - Creation timestamp

    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text) - User's full name
      - `phone` (text, nullable) - Phone number
      - `created_at` (timestamptz) - Creation timestamp

    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `status` (text) - Order status
      - `total` (numeric) - Total amount
      - `created_at` (timestamptz) - Creation timestamp

    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `product_id` (uuid, references products)
      - `quantity` (integer) - Quantity ordered
      - `price` (numeric) - Price at time of order

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read products
    - Add policies for users to manage their own profiles
    - Add policies for users to view their own orders

  3. Sample Data
    - Insert 20 sample products (10 recommended, 10 popular)
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ka text NOT NULL,
  description text NOT NULL DEFAULT '',
  description_ka text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  image_url text NOT NULL,
  category text NOT NULL,
  category_ka text NOT NULL,
  is_recommended boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample products
INSERT INTO products (name, name_ka, description, description_ka, price, image_url, category, category_ka, is_recommended, is_popular, in_stock) VALUES
('Gaming Laptop', 'გეიმინგ ლეპტოპი', 'High-performance gaming laptop', 'მაღალი წარმადობის გეიმინგ ლეპტოპი', 2499.99, 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, false, true),
('Wireless Headphones', 'უკაბელო ყურსასმენი', 'Premium noise-canceling headphones', 'პრემიუმ ხმაურგამაგდებელი ყურსასმენი', 299.99, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, true, true),
('Smart Watch', 'სმარტ საათი', 'Fitness tracking smartwatch', 'ფიტნეს ტრეკერი სმარტ საათი', 199.99, 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, true, true),
('4K Monitor', '4K მონიტორი', 'Ultra HD 27-inch monitor', 'Ultra HD 27-ინჩიანი მონიტორი', 399.99, 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, false, true),
('Mechanical Keyboard', 'მექანიკური კლავიატურა', 'RGB mechanical gaming keyboard', 'RGB მექანიკური გეიმინგ კლავიატურა', 149.99, 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, true, true),
('Wireless Mouse', 'უკაბელო მაუსი', 'Ergonomic wireless mouse', 'ერგონომიული უკაბელო მაუსი', 49.99, 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, false, true),
('Bluetooth Speaker', 'ბლუთუზ სპიკერი', 'Portable waterproof speaker', 'პორტატული წყალგაუმტარი სპიკერი', 79.99, 'https://images.pexels.com/photos/1279406/pexels-photo-1279406.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, true, true),
('USB-C Hub', 'USB-C ჰაბი', '7-in-1 USB-C adapter', '7-in-1 USB-C ადაპტერი', 59.99, 'https://images.pexels.com/photos/4219861/pexels-photo-4219861.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, false, true),
('Power Bank', 'პაუერბანკი', '20000mAh portable charger', '20000mAh პორტატული დამტენი', 39.99, 'https://images.pexels.com/photos/4219863/pexels-photo-4219863.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, true, true),
('Webcam HD', 'ვებკამერა HD', '1080p streaming webcam', '1080p სტრიმინგ ვებკამერა', 89.99, 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', true, false, true),
('Smartphone Pro', 'სმარტფონი Pro', 'Latest flagship smartphone', 'უახლესი ფლაგმანი სმარტფონი', 999.99, 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', false, true, true),
('Tablet 10"', 'ტაბლეტი 10"', 'Android tablet with stylus', 'Android ტაბლეტი სტილუსით', 449.99, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', false, true, true),
('Camera DSLR', 'ფოტოაპარატი DSLR', 'Professional DSLR camera', 'პროფესიონალური DSLR ფოტოაპარატი', 1299.99, 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', false, true, true),
('Drone 4K', 'დრონი 4K', '4K camera drone with GPS', '4K კამერის დრონი GPS-ით', 799.99, 'https://images.pexels.com/photos/442589/pexels-photo-442589.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', false, true, true),
('VR Headset', 'VR ყურსასმენი', 'Virtual reality gaming headset', 'ვირტუალური რეალობის გეიმინგ ყურსასმენი', 399.99, 'https://images.pexels.com/photos/3761262/pexels-photo-3761262.jpeg?auto=compress&cs=tinysrgb&w=800', 'Electronics', 'ელექტრონიკა', false, true, true),
('Gaming Chair', 'გეიმინგ სკამი', 'Ergonomic gaming chair', 'ერგონომიული გეიმინგ სკამი', 249.99, 'https://images.pexels.com/photos/5864245/pexels-photo-5864245.jpeg?auto=compress&cs=tinysrgb&w=800', 'Furniture', 'ავეჯი', false, true, true),
('Desk Lamp LED', 'სამაგიდო LED ლამპა', 'Adjustable LED desk lamp', 'რეგულირებადი LED სამაგიდო ლამპა', 34.99, 'https://images.pexels.com/photos/1210473/pexels-photo-1210473.jpeg?auto=compress&cs=tinysrgb&w=800', 'Furniture', 'ავეჯი', false, true, true),
('Standing Desk', 'მდგომარე მაგიდა', 'Adjustable height desk', 'რეგულირებადი სიმაღლის მაგიდა', 449.99, 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=800', 'Furniture', 'ავეჯი', false, true, true),
('Office Chair', 'ოფისის სკამი', 'Comfortable office chair', 'კომფორტული ოფისის სკამი', 179.99, 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=800', 'Furniture', 'ავეჯი', false, true, true),
('Bookshelf', 'წიგნის თარო', 'Modern wooden bookshelf', 'თანამედროვე ხის წიგნის თარო', 129.99, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800', 'Furniture', 'ავეჯი', false, true, true);

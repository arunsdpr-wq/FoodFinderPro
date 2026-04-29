-- FoodFinderPro Seed Data Script
-- This script populates the database with sample data for testing and development
-- Run this after setup-database.sql

-- Additional cities
INSERT INTO cities (name, value) VALUES
    ('San Francisco', 'san-francisco'),
    ('Seattle', 'seattle'),
    ('Miami', 'miami'),
    ('Boston', 'boston'),
    ('Denver', 'denver')
ON CONFLICT (value) DO NOTHING;

-- Additional locations for various cities
INSERT INTO locations (name, value, city_id) VALUES
    ('Downtown', 'downtown', 6),
    ('Mission District', 'mission-district', 6),
    ('Capitol Hill', 'capitol-hill', 7),
    ('South Beach', 'south-beach', 8),
    ('Back Bay', 'back-bay', 9),
    ('LoDo', 'lodo', 10)
ON CONFLICT (value) DO NOTHING;

-- Additional restaurants
INSERT INTO restaurants (name, value, description, location_id, image_url) VALUES
    ('Golden Gate Grill', 'golden-gate-grill', 'Farm-to-table American cuisine', 6, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'),
    ('Mission Tacos', 'mission-tacos', 'Authentic Mexican street food', 7, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800'),
    ('Space Needle Cafe', 'space-needle-cafe', 'Pacific Northwest favorites with a view', 8, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'),
    ('Ocean Drive Bistro', 'ocean-drive-bistro', 'Fresh seafood and Mediterranean dishes', 9, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800'),
    ('Beacon Hill Bakery', 'beacon-hill-bakery', 'Artisan breads and pastries', 10, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'),
    ('Rocky Mountain Steakhouse', 'rocky-mountain-steakhouse', 'Premium steaks and local craft beer', 11, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800')
ON CONFLICT (value) DO NOTHING;

-- Additional menu items
INSERT INTO menu_items (name, description, price, restaurant_id, category, is_popular) VALUES
    ('Caesar Salad', 'Romaine lettuce, parmesan, croutons, and house dressing', 9.99, 4, 'Salads', false),
    ('Grilled Salmon', 'Fresh Atlantic salmon with lemon butter sauce', 24.99, 4, 'Main Course', true),
    ('Fish Tacos', 'Beer-battered fish with cabbage slaw and chipotle aioli', 13.99, 5, 'Tacos', true),
    ('Carne Asada', 'Grilled steak with peppers and onions', 15.99, 5, 'Main Course', false),
    ('Clam Chowder', 'New England style clam chowder in sourdough bowl', 11.99, 6, 'Soups', true),
    ('Dungeness Crab', 'Fresh local crab with drawn butter', 32.99, 6, 'Seafood', false),
    ('Key Lime Pie', 'Classic Florida key lime pie with meringue', 8.99, 7, 'Desserts', true),
    ('Ceviche', 'Fresh fish cured in citrus juices', 16.99, 7, 'Appetizers', false),
    ('Croissant', 'Buttery French croissant', 4.99, 8, 'Bakery', true),
    ('Boston Cream Pie', 'Classic Boston cream pie', 7.99, 8, 'Desserts', false),
    ('Ribeye Steak', '12oz prime ribeye with garlic butter', 38.99, 9, 'Steaks', true),
    ('Bison Burger', 'Local bison with caramelized onions', 18.99, 9, 'Burgers', false)
ON CONFLICT DO NOTHING;

-- Sample user (password: password123 - hashed with bcrypt)
INSERT INTO users (username, password, email, phone_number, full_name, address, is_verified) VALUES
    ('testuser', '$2b$10$rKwJQZzQZzQZzQZzQZzQZuExampleHashForPassword123', 'test@example.com', '+1234567890', 'Test User', '123 Main St, New York, NY 10001', true)
ON CONFLICT (username) DO NOTHING;

-- Sample orders
INSERT INTO orders (order_number, customer_name, customer_phone, delivery_address, zip_code, delivery_instructions, total_amount, status, payment_method, restaurant_id, user_id, order_items) VALUES
    ('ORD-001', 'John Doe', '+1234567890', '456 Oak Ave, Manhattan, NY', '10001', 'Ring doorbell twice', 35.97, 'delivered', 'credit_card', 1, 1, 
     '[{"menuItemId": 1, "name": "Margherita Pizza", "price": 14.99, "quantity": 1}, {"menuItemId": 2, "name": "Spaghetti Carbonara", "price": 16.99, "quantity": 1}, {"menuItemId": 6, "name": "Truffle Fries", "price": 7.99, "quantity": 1}]'::jsonb),
    ('ORD-002', 'Jane Smith', '+1987654321', '789 Pine St, Brooklyn, NY', '11201', 'Leave at door', 27.98, 'confirmed', 'cash', 3, 1,
     '[{"menuItemId": 5, "name": "Classic Cheeseburger", "price": 12.99, "quantity": 2}, {"menuItemId": 6, "name": "Truffle Fries", "price": 7.99, "quantity": 1}]'::jsonb)
ON CONFLICT (order_number) DO NOTHING;

-- Sample reviews
INSERT INTO reviews (user_id, restaurant_id, rating, comment, title, order_number, is_approved) VALUES
    (1, 1, 5, 'Amazing food! The pizza was perfectly cooked and the service was excellent. Will definitely order again!', 'Best Italian in NYC', 'ORD-001', true),
    (1, 3, 4, 'Great burgers and fast delivery. The truffle fries were a bit salty but still delicious.', 'Solid burger joint', 'ORD-002', true)
ON CONFLICT DO NOTHING;

-- Display summary
DO $$
BEGIN
    RAISE NOTICE 'Database seeded successfully!';
    RAISE NOTICE 'Cities: %', (SELECT COUNT(*) FROM cities);
    RAISE NOTICE 'Locations: %', (SELECT COUNT(*) FROM locations);
    RAISE NOTICE 'Restaurants: %', (SELECT COUNT(*) FROM restaurants);
    RAISE NOTICE 'Menu Items: %', (SELECT COUNT(*) FROM menu_items);
    RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Orders: %', (SELECT COUNT(*) FROM orders);
    RAISE NOTICE 'Reviews: %', (SELECT COUNT(*) FROM reviews);
END $$;

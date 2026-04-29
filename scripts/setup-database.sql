-- FoodFinderPro Database Setup Script
-- This script creates all necessary tables for the FoodFinderPro application
-- Run this script after setting up your PostgreSQL database

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    value TEXT NOT NULL UNIQUE
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    value TEXT NOT NULL UNIQUE,
    city_id INTEGER NOT NULL REFERENCES cities(id)
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    value TEXT NOT NULL UNIQUE,
    description TEXT,
    location_id INTEGER NOT NULL REFERENCES locations(id),
    image_url TEXT
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    category TEXT NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    full_name TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    otp TEXT NOT NULL,
    type TEXT NOT NULL, -- 'email' or 'phone'
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    delivery_instructions TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    payment_method TEXT NOT NULL,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    user_id INTEGER REFERENCES users(id),
    order_items JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    title TEXT,
    order_number TEXT REFERENCES orders(order_number),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_city_id ON locations(city_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_location_id ON restaurants(location_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_user_id ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_number ON reviews(order_number);

-- Insert sample data for cities
INSERT INTO cities (name, value) VALUES
    ('New York', 'new-york'),
    ('Los Angeles', 'los-angeles'),
    ('Chicago', 'chicago'),
    ('Houston', 'houston'),
    ('Phoenix', 'phoenix')
ON CONFLICT (value) DO NOTHING;

-- Insert sample data for locations (New York)
INSERT INTO locations (name, value, city_id) VALUES
    ('Manhattan', 'manhattan', 1),
    ('Brooklyn', 'brooklyn', 1),
    ('Queens', 'queens', 1)
ON CONFLICT (value) DO NOTHING;

-- Insert sample data for restaurants
INSERT INTO restaurants (name, value, description, location_id, image_url) VALUES
    ('The Italian Kitchen', 'the-italian-kitchen', 'Authentic Italian cuisine with fresh ingredients', 1, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'),
    ('Sushi Master', 'sushi-master', 'Premium sushi and Japanese delicacies', 1, 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800'),
    ('Burger House', 'burger-house', 'Juicy burgers and crispy fries', 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800')
ON CONFLICT (value) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, restaurant_id, category, is_popular) VALUES
    ('Margherita Pizza', 'Classic tomato sauce, mozzarella, and fresh basil', 14.99, 1, 'Pizza', true),
    ('Spaghetti Carbonara', 'Creamy pasta with pancetta and parmesan', 16.99, 1, 'Pasta', false),
    ('Salmon Nigiri', 'Fresh salmon over seasoned rice', 8.99, 2, 'Sushi', true),
    ('Dragon Roll', 'Eel, avocado, and cucumber with special sauce', 18.99, 2, 'Sushi', false),
    ('Classic Cheeseburger', 'Beef patty with cheese, lettuce, and tomato', 12.99, 3, 'Burgers', true),
    ('Truffle Fries', 'Crispy fries with truffle oil and parmesan', 7.99, 3, 'Sides', false)
ON CONFLICT DO NOTHING;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reviews table
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE cities IS 'Stores city information for food delivery';
COMMENT ON TABLE locations IS 'Stores location/area information within cities';
COMMENT ON TABLE restaurants IS 'Stores restaurant details and information';
COMMENT ON TABLE menu_items IS 'Stores menu items for each restaurant';
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for email/phone verification';
COMMENT ON TABLE orders IS 'Stores customer orders and delivery information';
COMMENT ON TABLE reviews IS 'Stores customer reviews for restaurants';

-- Create the database
CREATE DATABASE recipe_db;

\c recipe_db

-- Create the users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the pantry_items table
CREATE TABLE pantry_items (
    pantry_item_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    item_name VARCHAR(100) NOT NULL,
    quantity VARCHAR(50),
    expiration_date DATE
);

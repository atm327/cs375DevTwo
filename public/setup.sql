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

-- Table for storing saved recipes
CREATE TABLE saved_recipes (
    recipe_id SERIAL PRIMARY KEY,
    recipe_name VARCHAR(100) NOT NULL,
    ingredients TEXT NOT NULL
);

-- Table for calendar meals
CREATE TABLE calendar_meals (
    meal_id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    recipe_name VARCHAR(100) NOT NULL,
    ingredients TEXT NOT NULL
);

-- Table for pantry items
CREATE TABLE pantry_items (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL
);

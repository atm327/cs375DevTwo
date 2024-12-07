\c deploydevtwo

-- use this to clear any existing tables to reinsert fresh data
-- you'll need to add a DROP TABLE for every table you add
-- we don't drop the database because that causes errors with fly
DROP TABLE IF EXISTS pantry_items;
DROP TABLE IF EXISTS calendar_meals;
DROP TABLE IF EXISTS saved_recipes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS shopping_list;

-- create whatever tables you need here
-- Create the database

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

CREATE TABLE calendar_meals (
    meal_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    recipe_name VARCHAR(100) NOT NULL,
    ingredients TEXT DEFAULT '',
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table for pantry items
CREATE TABLE pantry_items (
                              item_id SERIAL PRIMARY KEY,
                              item_name VARCHAR(100) NOT NULL,
                              quantity INTEGER NOT NULL,
                              unit VARCHAR(50) NOT NULL,
                              category VARCHAR(50) NOT NULL,
                              user_id INTEGER NOT NULL,
                              CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE shopping_list (
    user_id INT NOT NULL,
    meal_id INT NOT NULL,
    ingredients TEXT NOT NULL,
    date DATE NOT NULL,
    recipe_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
\q
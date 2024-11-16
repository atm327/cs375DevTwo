const axios = require("axios");
const express = require("express");
const path = require("path");
const bcrypt = require('bcryptjs');
const { Pool } = require("pg");

// Express setup
const app = express();
const apiFile = require("./env.json");
const apiKey = apiFile["api_key"];
const baseUrl = "https://api.spoonacular.com/recipes"; 
const apiUrl = "https://api.spoonacular.com/recipes";
const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const pool = new Pool({
    user: apiFile["user"],
    host: apiFile["host"],
    database: apiFile["database"],
    password: apiFile["password"],
    port: apiFile["port"]
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
    console.log('Registration request body:', req.body); // Log incoming request data
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required." });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    console.log('Login request body:', req.body); // Log incoming request data
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get shopping list based on calendar meals
app.get('/api/shopping-list', async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Dates are required' });
        }

        // Get meals for date range
        const result = await pool.query(
            'SELECT ingredients FROM calendar_meals WHERE date BETWEEN $1 AND $2',
            [startDate, endDate]
        );

        // Get pantry items
        const pantryResult = await pool.query(
            'SELECT item_name FROM pantry_items'
        );

        // Create lists (using Sets to avoid duplicates)
        const neededItems = new Set();
        const pantryItems = new Set();

        // Add ingredients from meals
        result.rows.forEach(row => {
            neededItems.add(row.ingredients);
        });

        // Add pantry items
        pantryResult.rows.forEach(row => {
            pantryItems.add(row.item_name);
        });

        // Filter out items we already have
        const shoppingList = Array.from(neededItems)
            .filter(item => !pantryItems.has(item));

        res.json({ items: shoppingList });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Could not generate shopping list' });
    }
});

// Add or update pantry item
app.post('/api/pantry', async (req, res) => {
    try {
        const { item_name, quantity, unit, category } = req.body;

        if (!item_name || !quantity || !unit || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await pool.query(
            'INSERT INTO pantry_items (item_name, quantity, unit, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [item_name, quantity, unit, category]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding pantry item:', error);
        res.status(500).json({ error: 'Could not add item' });
    }
});

// Get all pantry items
app.get('/api/pantry', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pantry_items');
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting pantry items:', error);
        res.status(500).json({ error: 'Could not get items' });
    }
});

app.delete('/api/pantry/:id', async (req, res) => {
    const id = req.params.id;

    try {
        await pool.query('DELETE FROM pantry_items WHERE pantry_item_id = $1', [id]);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.log('Database error:', error);
        res.status(500).json({ error: 'Could not delete item' });
    }
});

// Recipe search routes
app.get('/api/findByIngredients', async (req, res) => {
    const ingredients = req.query.ingredients;
    const number = req.query.number || 5;

    if (!ingredients) {
        res.status(400).json({ error: 'Ingredients are required' });
        return;
    }

    try {
        const response = await fetch(
            `${apiUrl}/findByIngredients?apiKey=${apiKey}&ingredients=${ingredients}&number=${number}`
        );
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.log('API error:', error);
        res.status(500).json({ error: 'Could not get recipes' });
    }
});

app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
    }

    try {
        const response = await fetch(
            `${apiUrl}/complexSearch?apiKey=${apiKey}&query=${query}&number=5`
        );
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        res.json(data.results);
    } catch (error) {
        console.log('API error:', error);
        res.status(500).json({ error: 'Could not search recipes' });
    }
});

app.get('/api/recipe/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const response = await fetch(
            `${apiUrl}/${id}/information?apiKey=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const recipe = await response.json();
        res.json(recipe);
    } catch (error) {
        console.log('API error:', error);
        res.status(500).json({ error: 'Could not get recipe details' });
    }
});

app.post('/api/calendar', async (req, res) => {
    const { date, meal_type, recipe_name, ingredients } = req.body;

    // Validate input
    if (!date || !meal_type || !recipe_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO calendar_meals (date, meal_type, recipe_name, ingredients) VALUES ($1, $2, $3, $4) RETURNING *',
            [date, meal_type, recipe_name, ingredients]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Could not save meal' });
    }
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
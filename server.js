const axios = require("axios");
const express = require("express");
const path = require("path");
<<<<<<< Updated upstream
const app = express();

const apiFile = require(path.join(__dirname, 'env.json'));
const apiKey = apiFile["api_key"];
const baseUrl = "https://api.spoonacular.com/recipes";  // Direct URL
=======
const bcrypt = require('bcryptjs');
const { Pool } = require("pg");

// Express setup
const app = express();
const apiFile = require("./env.json");
const apiKey = apiFile["api_key"];
const baseUrl = "https://api.spoonacular.com/recipes";
const apiUrl = "https://api.spoonacular.com/recipes";
>>>>>>> Stashed changes
const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
app.use(express.json());

<<<<<<< Updated upstream
// Endpoint for searching recipes by ingredients
=======
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

app.get('/api/pantry', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pantry_items');
        res.json(result.rows);
    } catch (error) {
        console.log('Database error:', error);
        res.status(500).json({ error: 'Could not get pantry items' });
    }
});

app.post('/api/pantry', async (req, res) => {
    const { name, quantity, unit, category } = req.body;

    if (!name || !quantity || !category) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        const result = await pool.query(
            'INSERT INTO pantry_items (item_name, quantity, unit, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, quantity, unit, category]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.log('Database error:', error);
        res.status(500).json({ error: 'Could not add item' });
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
>>>>>>> Stashed changes
app.get('/api/findByIngredients', async (req, res) => {
    const ingredients = req.query.ingredients;
    const number = req.query.number || 5;

    if (!ingredients) {
        res.status(400).json({ error: 'Ingredients are required' });
        return;
    }

    console.log('Requesting URL:', url.replace(apiKey, 'API_KEY')); // Log URL (hide API key)

    try {
<<<<<<< Updated upstream
        const response = await axios.get(url);
        console.log('API Response Status:', response.status);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('API Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
        
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || 'Internal server error',
            details: error.response?.data
        });
=======
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
>>>>>>> Stashed changes
    }
});

// Endpoint for searching recipes by name
app.get('/api/search', async (req, res) => {
<<<<<<< Updated upstream
    const { query, cuisine, diet } = req.query;
    const number = req.query.number || 5;
    
    // Construct URL with optional parameters
    let url = `${baseUrl}/complexSearch?apiKey=${apiKey}&query=${query}&number=${number}`;
    if (cuisine) url += `&cuisine=${cuisine}`;
    if (diet) url += `&diet=${diet}`;
    url += '&addRecipeInformation=true'; // This includes detailed recipe info in response
    
    console.log('Searching recipes:', url.replace(apiKey, 'API_KEY'));

    try {
        const response = await axios.get(url);
        res.status(200).json(response.data.results); // Send just the results array
    } catch (error) {
        console.error('Recipe search error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || 'Failed to search recipes'
        });
=======
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
>>>>>>> Stashed changes
    }
});

// Endpoint for getting recipe details
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
<<<<<<< Updated upstream
        console.error('Recipe details error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || 'Failed to get recipe details'
        });
=======
        console.log('API error:', error);
        res.status(500).json({ error: 'Could not get recipe details' });
>>>>>>> Stashed changes
    }
});

// Start server
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
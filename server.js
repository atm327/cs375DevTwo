const axios = require("axios");
const express = require("express");
const path = require("path");
const bcrypt = require('bcryptjs');
const { Pool } = require("pg");

const app = express();
const apiFile = require(path.join(__dirname, 'env.json'));
const apiKey = apiFile["api_key"];
const baseUrl = "https://api.spoonacular.com/recipes"; 
const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const pool = new Pool({
    user: apiFile["user"],
    host: apiFile["host"],
    database: apiFile["database"],
    password: apiFile["password"],
    port: apiFile["port"],
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
    const userId = req.body.user_id; // Get user_id dynamically
    if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
    }
    try {
        const result = await pool.query('SELECT * FROM pantry_items WHERE user_id = $1', [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/pantry', async (req, res) => {
    const { user_id, name, quantity, unit, category, dateAdded } = req.body;
    
    if (!user_id || !name || !quantity) {
        return res.status(400).json({ error: "User ID, name, and quantity are required." });
    }

    try {
        const result = await pool.query(
            'INSERT INTO pantry_items (user_id, item_name, quantity, unit, category, date_added) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, name, quantity, unit, category, dateAdded]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/pantry/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        const result = await pool.query(
            'UPDATE pantry_items SET quantity = $1 WHERE pantry_item_id = $2 RETURNING *',
            [quantity, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/pantry/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM pantry_items WHERE pantry_item_id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Existing endpoints for recipes
app.get('/api/findByIngredients', async (req, res) => {
    const ingredients = req.query.ingredients;
    const number = req.query.number || 5;
    const url = `${baseUrl}/findByIngredients?apiKey=${apiKey}&ingredients=${ingredients}&number=${number}&ranking=2`;

    try {
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || 'Internal server error' });
    }
});

app.get('/api/search', async (req, res) => {
    const { query, cuisine, diet } = req.query;
    const number = req.query.number || 5;
    
    let url = `${baseUrl}/complexSearch?apiKey=${apiKey}&query=${query}&number=${number}`;
    if (cuisine) url += `&cuisine=${cuisine}`;
    if (diet) url += `&diet=${diet}`;
    url += '&addRecipeInformation=true';

    try {
        const response = await axios.get(url);
        res.status(200).json(response.data.results);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || 'Failed to search recipes' });
    }
});

app.get('/api/recipe/:id', async (req, res) => {
    const id = req.params.id;
    const url = `${baseUrl}/${id}/information?apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data?.message || 'Failed to get recipe details' });
    }
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});

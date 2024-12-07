let express = require("express");
let { Pool } = require("pg");
const path = require("path");
const bcrypt = require('bcryptjs');
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const axios = require("axios");

// make this script's dir the cwd
// b/c npm run start doesn't cd into src/ to run this
// and if we aren't in its cwd, all relative paths will break
process.chdir(__dirname);

let port = 3000;
let host;
let databaseConfig;

// fly.io sets NODE_ENV to production automatically, otherwise it's unset when running locally
if (process.env.NODE_ENV == "production") {
	host = "0.0.0.0";
	databaseConfig = { connectionString: process.env.DATABASE_URL };
} else {
	host = "localhost";
	let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
	databaseConfig = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}

let app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// uncomment these to debug
// console.log(JSON.stringify(process.env, null, 2));
// console.log(JSON.stringify(databaseConfig, null, 2));

let pool = new Pool(databaseConfig);
pool.connect().then(() => {
	console.log("Connected to db");
});

/*
KEEP EVERYTHING ABOVE HERE
REPLACE THE FOLLOWING WITH YOUR SERVER CODE 
*/

// Express setup
const apiFile = require("../env.json");
const apiKey = apiFile["api_key"];
const baseUrl = "https://api.spoonacular.com/recipes"; 
const apiUrl = "https://api.spoonacular.com/recipes";

// Token storage (active session management)
const activeSessions = {};

// Helper function to generate a random token
function generateToken() {
    return crypto.randomBytes(32).toString("hex");
}

// Cookie options for secure cookie handling
const cookieOptions = {
    httpOnly: true,
    secure: true, 
    sameSite: "strict"
};

const authorize = (req, res, next) => {
    const { token } = req.cookies;

    if (!token || !activeSessions[token]) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    console.log('User Authorized:', activeSessions[token]);
    req.user = activeSessions[token]; // Attach user info to the request
    next();
};


// User registration endpoint
app.post('/api/register', async (req, res) => {
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

        // Generate token and store session globally
        const token = generateToken();
        activeSessions[token] = { userId: user.user_id, username: user.username };

        res.cookie("token", token, cookieOptions).status(200).json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User logout endpoint
app.post('/api/logout', (req, res) => {
    const { token } = req.cookies;

    if (!token || !activeSessions[token]) {
        return res.status(400).json({ error: "Invalid session or already logged out." });
    }

    // Remove the user session from global storage
    delete activeSessions[token];
    res.clearCookie("token", cookieOptions).status(200).json({ message: "Logout successful" });
});

app.post('/api/pantry', authorize, async (req, res) => {
    try {
        const { item_name, quantity, unit, category } = req.body;

        if (!item_name || !quantity || !unit || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await pool.query(
            'INSERT INTO pantry_items (item_name, quantity, unit, category, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [item_name, quantity, unit, category, req.user.userId]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding pantry item:', error);
        res.status(500).json({ error: 'Could not add item', details: error.message });
    }
});

// Get all pantry items for logged-in user (requires authorization)
app.get('/api/pantry', authorize, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM pantry_items WHERE user_id = $1',
            [req.user.userId]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Could not get items' });
    }
});

// Delete pantry item (requires authorization)
app.delete('/api/pantry/:id', authorize, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM pantry_items WHERE item_id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Item not found or unauthorized' });
        }

        res.json({ message: 'Item deleted', deletedItem: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Could not delete item' });
    }
});

// Recipe search
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

app.post('/api/calendar', authorize, async (req, res) => {
    try {
        const { date, meal_type, recipe_name, ingredients } = req.body;

        if (!date || !meal_type || !recipe_name || !ingredients) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const query = `
            INSERT INTO calendar_meals 
            (user_id, date, meal_type, recipe_name, ingredients) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;

        const result = await pool.query(query, [
            req.user.userId, 
            date, 
            meal_type, 
            recipe_name, 
            ingredients // This should now be a valid JSON string
        ]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error saving meal:', error);
        res.status(500).json({ error: 'Could not save meal' });
    }
});


app.get('/api/calendar', authorize, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM calendar_meals WHERE user_id = $1 ORDER BY date',
            [req.user.userId]
        );

        const meals = {};
        result.rows.forEach(row => {
            const dateStr = row.date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            if (!meals[dateStr]) {
                meals[dateStr] = {};
            }
            meals[dateStr][row.meal_type] = {
                title: row.recipe_name,
            };
        });

        res.json(meals);
    } catch (error) {
        console.error('Error retrieving meals:', error);
        res.status(500).json({ error: 'Could not get meals' });
    }
});

app.delete('/api/calendar/:recipe_name', authorize, async (req, res) => {
    const { recipe_name } = req.params;

    try {
        // Adjust the query to delete based on the recipe_name instead of the meal_id
        const result = await pool.query(
            'DELETE FROM calendar_meals WHERE recipe_name = $1 AND user_id = $2 RETURNING *',
            [recipe_name, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Meal not found or unauthorized' });
        }

        res.json({ message: 'Meal deleted', deletedMeal: result.rows[0] });
    } catch (error) {
        console.error('Error deleting meal:', error);
        res.status(500).json({ error: 'Could not delete meal' });
    }
});

app.get('/api/shopping-list', authorize, async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Fetch calendar recipes for the user within the given date range
        const calendarResult = await pool.query(
            `
            SELECT ingredients 
            FROM calendar_meals 
            WHERE user_id = $1 AND date BETWEEN $2 AND $3
            `,
            [req.user.userId, startDate, endDate]
        );

        const calendarIngredients = calendarResult.rows
            .map(row => row.ingredients.split(',').map(ingredient => ingredient.trim())) // Split and trim
            .flat(); // Flatten the array

        // Fetch pantry items for the user
        const pantryResult = await pool.query(
            `
            SELECT item_name, quantity, unit 
            FROM pantry_items 
            WHERE user_id = $1
            `,
            [req.user.userId]
        );

        const pantryItems = pantryResult.rows;
        res.json({
            calendarItems: [...new Set(calendarIngredients)],
            pantryItems,
        });
    } catch (error) {
        console.error('Error fetching shopping list:', error);
        res.status(500).json({ error: 'Could not generate shopping list' });
    }
});


app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});

const axios = require("axios");
const express = require("express");
const path = require("path");
const app = express();

const apiFile = require(path.join(__dirname, 'env.json'));
const apiKey = apiFile["api_key"];
const baseUrl = "https://api.spoonacular.com/recipes";  // Direct URL
const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
app.use(express.json());

// Updated endpoint with better error handling
app.get('/api/findByIngredients', async (req, res) => {
    const ingredients = req.query.ingredients;
    const number = req.query.number || 5;
    const url = `${baseUrl}/findByIngredients?apiKey=${apiKey}&ingredients=${ingredients}&number=${number}&ranking=2`;

    console.log('Requesting URL:', url.replace(apiKey, 'API_KEY')); // Log URL (hide API key)

    try {
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
    }
});

// New endpoint for searching recipes by name
app.get('/api/search', async (req, res) => {
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
    }
});

// New endpoint for getting recipe details
app.get('/api/recipe/:id', async (req, res) => {
    const id = req.params.id;
    const url = `${baseUrl}/${id}/information?apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Recipe details error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || 'Failed to get recipe details'
        });
    }
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
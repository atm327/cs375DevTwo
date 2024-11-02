// public/js/api.js
const API = {
    // Find recipes by ingredients
    findByIngredients: async (ingredients, number = 5) => {
        try {
            const response = await fetch(`/api/findByIngredients?ingredients=${ingredients}&number=${number}`);
            if (!response.ok) throw new Error('Failed to fetch recipes');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Get detailed recipe information
    getRecipeDetails: async (recipeId) => {
        try {
            const response = await fetch(`/api/recipe/${recipeId}`);
            if (!response.ok) throw new Error('Failed to fetch recipe details');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Search recipes with complex parameters
    searchRecipes: async (params) => {
        try {
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`/api/search?${queryParams}`);
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Get random recipes
    getRandomRecipes: async (number = 1) => {
        try {
            const response = await fetch(`/api/random?number=${number}`);
            if (!response.ok) throw new Error('Failed to fetch random recipes');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Get recipe instructions
    getRecipeInstructions: async (recipeId) => {
        try {
            const response = await fetch(`/api/recipe/${recipeId}/instructions`);
            if (!response.ok) throw new Error('Failed to fetch instructions');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
};

// Example usage in your my_script.js
document.getElementById('search-button').addEventListener('click', async function() {
    const ingredients = document.getElementById('ingredients').value;
    const recipeCount = document.getElementById('recipe-count').value;
    
    try {
        showLoading(true);
        const recipes = await API.findByIngredients(ingredients, recipeCount);
        displayRecipes(recipes);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
});

// Function to display recipe details
async function viewRecipeDetails(recipeId) {
    try {
        showLoading(true);
        const [details, instructions] = await Promise.all([
            API.getRecipeDetails(recipeId),
            API.getRecipeInstructions(recipeId)
        ]);
        
        // Create and show modal with recipe details
        showRecipeModal(details, instructions);
    } catch (error) {
        showError('Failed to load recipe details');
    } finally {
        showLoading(false);
    }
}

// Example of complex search
async function searchRecipesWithFilters() {
    const searchParams = {
        query: document.getElementById('search-query').value,
        cuisine: document.getElementById('cuisine').value,
        diet: document.getElementById('diet').value,
        type: document.getElementById('meal-type').value,
        maxReadyTime: document.getElementById('max-time').value
    };
    
    try {
        showLoading(true);
        const results = await API.searchRecipes(searchParams);
        displayRecipes(results.results);
    } catch (error) {
        showError('Search failed');
    } finally {
        showLoading(false);
    }
}
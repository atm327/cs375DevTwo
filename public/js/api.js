async function searchRecipesByIngredients(ingredients, recipeCount) {
    if (!ingredients) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = 'Please enter ingredients';
        errorDiv.style.display = 'block';
        return [];
    }

    const recipesGrid = document.getElementById('recipes-grid');
    while (recipesGrid.firstChild) {
        recipesGrid.removeChild(recipesGrid.firstChild);
    }
    const loadingText = document.createTextNode('Loading...');
    recipesGrid.appendChild(loadingText);

    try {
        const response = await fetch(`/api/findByIngredients?ingredients=${ingredients}&number=${recipeCount}`);

        if (!response.ok) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = 'Error finding recipes';
            errorDiv.style.display = 'block';
            recipesGrid.removeChild(loadingText);
            return [];
        }

        // Get the recipe data
        const recipes = await response.json();
        recipesGrid.removeChild(loadingText);
        return recipes;

    } catch (error) {
        console.log('Error:', error);
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = 'Failed to fetch recipes';
        errorDiv.style.display = 'block';
        recipesGrid.removeChild(loadingText);
        return [];
    }
}

// Function to search recipes by name
async function searchRecipesByName(recipeName, cuisine, diet) {
    if (!recipeName) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = 'Please enter a recipe name';
        errorDiv.style.display = 'block';
        return [];
    }

    const recipesGrid = document.getElementById('recipes-grid');
    while (recipesGrid.firstChild) {
        recipesGrid.removeChild(recipesGrid.firstChild);
    }
    const loadingText = document.createTextNode('Loading...');
    recipesGrid.appendChild(loadingText);

    try {
        // Build the URL with search parameters
        let url = `/api/search?query=${recipeName}`;
        if (cuisine && cuisine !== 'Any Cuisine') {
            url += `&cuisine=${cuisine}`;
        }
        if (diet && diet !== 'Any Diet') {
            url += `&diet=${diet}`;
        }

        // Make the fetch request
        const response = await fetch(url);

        // Check if response was successful
        if (!response.ok) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = 'Error searching recipes';
            errorDiv.style.display = 'block';
            recipesGrid.removeChild(loadingText);
            return [];
        }

        // Get the recipe data
        const recipes = await response.json();
        recipesGrid.removeChild(loadingText);
        return recipes;

    } catch (error) {
        console.log('Error:', error);
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = 'Failed to search recipes';
        errorDiv.style.display = 'block';
        recipesGrid.removeChild(loadingText);
        return [];
    }
}

// Function to get recipe details
async function getRecipeDetails(recipeId) {
    // Check if recipe ID is empty
    if (!recipeId) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = 'Recipe ID is missing';
        errorDiv.style.display = 'block';
        return null;
    }

    const recipeDetail = document.getElementById('recipe-detail');
    while (recipeDetail.firstChild) {
        recipeDetail.removeChild(recipeDetail.firstChild);
    }
    const loadingText = document.createTextNode('Loading recipe details...');
    recipeDetail.appendChild(loadingText);

    try {
        const response = await fetch(`/api/recipe/${recipeId}`);

        if (!response.ok) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = 'Error getting recipe details';
            errorDiv.style.display = 'block';
            recipeDetail.removeChild(loadingText);
            return null;
        }

        // Get the recipe details
        const recipe = await response.json();
        recipeDetail.removeChild(loadingText);
        return recipe;

    } catch (error) {
        console.log('Error:', error);
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = 'Failed to get recipe details';
        errorDiv.style.display = 'block';
        recipeDetail.removeChild(loadingText);
        return null;
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function showLoading(element) {
    clearElement(element);
    const loadingText = document.createTextNode('Loading...');
    element.appendChild(loadingText);
    return loadingText;
}

function hideLoading(element, loadingText) {
    element.removeChild(loadingText);
}
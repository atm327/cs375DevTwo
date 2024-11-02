// Toggle between search types
document.querySelectorAll('.search-toggle').forEach(button => {
    button.addEventListener('click', () => {
        // Update active toggle button
        document.querySelectorAll('.search-toggle').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show corresponding search panel
        const searchType = button.dataset.type;
        document.querySelectorAll('.search-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${searchType}-search`).classList.add('active');
    });
});

document.getElementById('search-button').addEventListener('click', function() {
    const activeSearchType = document.querySelector('.search-toggle.active').dataset.type;
    
    if (activeSearchType === 'ingredients') {
        searchByIngredients();
    } else {
        searchByRecipeName();
    }
});

function searchByIngredients() {
    const ingredients = document.getElementById('ingredients').value.split(',').map(ing => ing.trim()).join(',+');
    const recipeCount = document.getElementById('recipe-count').value;
    const apiUrl = `/api/findByIngredients?ingredients=${ingredients}&number=${recipeCount}`;
    
    fetchRecipes(apiUrl);
}

function searchByRecipeName() {
    const recipeName = document.getElementById('recipe-name').value;
    const cuisine = document.getElementById('cuisine-type').value;
    const diet = document.getElementById('diet-type').value;
    const apiUrl = `/api/search?query=${recipeName}&cuisine=${cuisine}&diet=${diet}`;
    
    fetchRecipes(apiUrl);
}

function fetchRecipes(apiUrl) {
    // Show loading state
    const resultsContainer = document.getElementById('recipes-grid');
    resultsContainer.innerHTML = '<div class="loading">Searching for recipes...</div>';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Recipes data:', data);
            displayRecipes(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('error-message').textContent = `Error: ${error.message}`;
            resultsContainer.innerHTML = '';
        });
}

function displayRecipes(recipes) {
    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = '';

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.onclick = () => showRecipeDetails(recipe.id);
        
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span>${recipe.readyInMinutes || '--'} mins</span>
                    <span>${recipe.servings || '--'} servings</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function showRecipeDetails(recipeId) {
    const modal = document.getElementById('recipe-modal');
    const detailContainer = document.getElementById('recipe-detail');
    
    // Show loading state
    modal.style.display = 'block';
    detailContainer.innerHTML = '<div class="loading">Loading recipe details...</div>';
    
    fetch(`/api/recipe/${recipeId}`)
        .then(response => response.json())
        .then(recipe => {
            detailContainer.innerHTML = `
                <h2>${recipe.title}</h2>
                <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 100%;">
                
                <div class="recipe-stats">
                    <p>Ready in: ${recipe.readyInMinutes} minutes</p>
                    <p>Servings: ${recipe.servings}</p>
                </div>
                
                <h3>Ingredients:</h3>
                <ul>
                    ${recipe.extendedIngredients.map(ing => 
                        `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                    ).join('')}
                </ul>
                
                <h3>Instructions:</h3>
                <ol>
                    ${recipe.analyzedInstructions[0]?.steps.map(step =>
                        `<li>${step.step}</li>`
                    ).join('')}
                </ol>
                
                <div class="recipe-actions">
                    <button class="action-btn btn-primary" onclick="addToMealPlan(${recipe.id})">
                        Add to Meal Plan
                    </button>
                    <button class="action-btn btn-secondary" onclick="checkPantry(${recipe.id})">
                        Check Pantry
                    </button>
                </div>
            `;
        })
        .catch(error => {
            detailContainer.innerHTML = `<p class="error">Error loading recipe details: ${error.message}</p>`;
        });
}

// Close modal when clicking the close button or outside the modal
document.querySelector('.close').onclick = function() {
    document.getElementById('recipe-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('recipe-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Placeholder functions for future implementation
function addToMealPlan(recipeId) {
    alert('Feature coming soon: Add to meal plan');
}

function checkPantry(recipeId) {
    alert('Feature coming soon: Check pantry ingredients');
}

// Add this at the beginning of your my_script.js file
function clearError() {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Update your searchByRecipeName function
function searchByRecipeName() {
    clearError(); // Clear any existing errors
    const recipeName = document.getElementById('recipe-name').value;
    if (!recipeName.trim()) {
        showError('Please enter a recipe name');
        return;
    }
    
    const cuisine = document.getElementById('cuisine-type').value;
    const diet = document.getElementById('diet-type').value;
    const apiUrl = `/api/search?query=${encodeURIComponent(recipeName)}`;
    
    // Add optional parameters if selected
    if (cuisine) apiUrl += `&cuisine=${encodeURIComponent(cuisine)}`;
    if (diet) apiUrl += `&diet=${encodeURIComponent(diet)}`;
    
    fetchRecipes(apiUrl);
}

// Update your fetchRecipes function
function fetchRecipes(apiUrl) {
    clearError(); // Clear any existing errors
    const resultsContainer = document.getElementById('recipes-grid');
    resultsContainer.innerHTML = '<div class="loading">Searching for recipes...</div>';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch recipes (Status: ${response.status})`);
            return response.json();
        })
        .then(data => {
            console.log('Recipes data:', data);
            if (Array.isArray(data)) {
                if (data.length === 0) {
                    showError('No recipes found. Try different search terms.');
                    resultsContainer.innerHTML = '';
                } else {
                    displayRecipes(data);
                }
            } else {
                throw new Error('Invalid response format');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError(`Error: ${error.message}`);
            resultsContainer.innerHTML = '';
        });
}
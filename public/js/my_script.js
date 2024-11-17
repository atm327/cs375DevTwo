document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const recipesGrid = document.getElementById('recipes-grid');
    const errorMessage = document.getElementById('error-message');
    const modal = document.getElementById('recipe-modal');
    const closeButton = document.querySelector('.close');
    const ingredientsSearch = document.getElementById('ingredients-search');
    const recipeSearch = document.getElementById('recipe-search');
    const searchTypeButtons = document.querySelectorAll('.search-toggle');

    // Toggle search panels based on active button
    searchTypeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            searchTypeButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            button.classList.add('active');

            // Show correct search panel
            if (button.dataset.type === 'ingredients') {
                ingredientsSearch.classList.add('active');
                recipeSearch.classList.remove('active');
            } else {
                recipeSearch.classList.add('active');
                ingredientsSearch.classList.remove('active');
            }
        });
    });

    // Handle search button click
    searchButton.addEventListener('click', function() {
        clearResults();
        hideError();

        // Check which search type is active
        if (ingredientsSearch.classList.contains('active')) {
            searchWithIngredients();
        } else {
            searchWithRecipeName();
        }
    });

    // Search by ingredients
    async function searchWithIngredients() {
        const ingredients = document.getElementById('ingredients').value;
        const recipeCount = document.getElementById('recipe-count').value;

        if (!ingredients) {
            showError('Please enter ingredients');
            return;
        }

        showLoading();

        try {
            const response = await fetch(`/api/findByIngredients?ingredients=${ingredients}&number=${recipeCount}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const recipes = await response.json();
            if (recipes.length === 0) {
                showError('No recipes found');
            } else {
                displayRecipeResults(recipes);
            }
        } catch (error) {
            showError('Error searching recipes');
            console.log(error);
        }

        hideLoading();
    }

    // Search by recipe name
    async function searchWithRecipeName() {
        const recipeName = document.getElementById('recipe-name').value;
        const cuisine = document.getElementById('cuisine').value;
        const diet = document.getElementById('diet').value;

        if (!recipeName) {
            showError('Please enter a recipe name');
            return;
        }

        showLoading();

        // Build URL
        let url = `/api/search?query=${recipeName}`;
        if (cuisine && cuisine !== 'Any Cuisine') {
            url += `&cuisine=${cuisine}`;
        }
        if (diet && diet !== 'Any Diet') {
            url += `&diet=${diet}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const recipes = await response.json();
            if (recipes.length === 0) {
                showError('No recipes found');
            } else {
                displayRecipeResults(recipes);
            }
        } catch (error) {
            showError('Error searching recipes');
            console.log(error);
        }

        hideLoading();
    }

    // Display recipe results using DOM
    function displayRecipeResults(recipes) {
        recipes.forEach(function(recipe) {
            // Create recipe card
            const card = document.createElement('div');
            card.className = 'recipe-card';

            // Add recipe image
            const img = document.createElement('img');
            img.src = recipe.image;
            img.alt = recipe.title;
            img.className = 'recipe-image';
            card.appendChild(img);

            // Add recipe info
            const info = document.createElement('div');
            info.className = 'recipe-info';

            const title = document.createElement('h3');
            title.textContent = recipe.title;
            info.appendChild(title);

            const time = document.createElement('p');
            time.textContent = `Ready in: ${recipe.readyInMinutes || '--'} mins`;
            info.appendChild(time);

            const servings = document.createElement('p');
            servings.textContent = `Servings: ${recipe.servings || '--'}`;
            info.appendChild(servings);

            card.appendChild(info);

            // Add click handler
            card.addEventListener('click', function() {
                showRecipeDetails(recipe.id);
            });

            recipesGrid.appendChild(card);
        });
    }

    // Show recipe details
    async function showRecipeDetails(recipeId) {
        try {
            const response = await fetch(`/api/recipe/${recipeId}`);
            if (!response.ok) {
                throw new Error('Failed to get recipe details');
            }

            const recipe = await response.json();
            const detailDiv = document.getElementById('recipe-detail');
            clearElement(detailDiv);

            // Add recipe title
            const title = document.createElement('h2');
            title.textContent = recipe.title;
            detailDiv.appendChild(title);

            // Add recipe image
            const img = document.createElement('img');
            img.src = recipe.image;
            img.alt = recipe.title;
            detailDiv.appendChild(img);

            // Add ingredients section
            const ingredientsTitle = document.createElement('h3');
            ingredientsTitle.textContent = 'Ingredients:';
            detailDiv.appendChild(ingredientsTitle);

            const ingredientsList = document.createElement('ul');
            recipe.extendedIngredients.forEach(function(ing) {
                const li = document.createElement('li');
                li.textContent = `${ing.amount} ${ing.unit} ${ing.name}`;
                ingredientsList.appendChild(li);
            });
            detailDiv.appendChild(ingredientsList);

            modal.style.display = 'block';
        } catch (error) {
            showError('Error loading recipe details');
            console.log(error);
        }
    }

    // Helper functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    function clearResults() {
        while (recipesGrid.firstChild) {
            recipesGrid.removeChild(recipesGrid.firstChild);
        }
    }

    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    function showLoading() {
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Loading recipes...';
        loadingText.className = 'loading';
        recipesGrid.appendChild(loadingText);
    }

    function hideLoading() {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // Modal close handlers
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
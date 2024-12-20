document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('search-button');
    const recipesGrid = document.getElementById('recipes-grid');
    const errorMessage = document.getElementById('error-message');
    const modal = document.getElementById('recipe-modal');
    const closeButton = document.querySelector('.close');

    const ingredientsSearch = document.getElementById('ingredients-search');
    const recipeSearch = document.getElementById('recipe-search');
    const searchTypeButtons = document.querySelectorAll('.search-toggle');

    // Login-related elements
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    // Search type toggle between ingredients and recipe name
    searchTypeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            searchTypeButtons.forEach(function (btn) {
                btn.classList.remove('active');
            });

            button.classList.add('active');

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
    searchButton.addEventListener('click', function () {
        clearResults();
        hideError();

        if (ingredientsSearch.classList.contains('active')) {
            searchWithIngredients();
        } else {
            searchWithRecipeName();
        }
    });
    
    document.querySelectorAll('.close').forEach(closeButton => {
        closeButton.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
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

    // Display recipe results using DOM methods
    function displayRecipeResults(recipes) {
        recipes.forEach(function (recipe) {
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
            card.addEventListener('click', function () {
                showRecipeDetails(recipe.id);
            });

            recipesGrid.appendChild(card);
        });
    }

    let currentRecipe = null;

    // Helper function for formatting dates
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Fill the date select options
    function fillDateOptions() {
        const dateSelect = document.getElementById('planDate');
        if (!dateSelect) return;

        const today = new Date();
        clearElement(dateSelect);

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const option = document.createElement('option');
            option.value = formatDate(date);
            const displayText = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            option.appendChild(document.createTextNode(displayText));
            dateSelect.appendChild(option);
        }
    }

    // Show recipe details
    function showRecipeDetails(recipeId) {
        fetch(`/api/recipe/${recipeId}`)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to get recipe details');
                }
                return response.json();
            })
            .then(function (recipe) {
                currentRecipe = recipe;
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
                recipe.extendedIngredients.forEach(function (ing) {
                    const li = document.createElement('li');
                    li.textContent = ing.amount + ' ' + ing.unit + ' ' + ing.name;
                    ingredientsList.appendChild(li);
                });
                detailDiv.appendChild(ingredientsList);

                fillDateOptions();
                modal.style.display = 'block';
            })
            .catch(function (error) {
                console.error('Error:', error);
                showError('Error loading recipe details');
            });
    }

    // Add meal to the calendar from index
    const addToPlanBtn = document.getElementById('addToPlanBtn');
    if (addToPlanBtn) {
        addToPlanBtn.addEventListener('click', function () {
            if (!currentRecipe) return;

            const date = document.getElementById('planDate').value;
            const mealType = document.getElementById('planMealType').value;
            const originalIngredients = currentRecipe.extendedIngredients.map(item => item.originalName);
            const serializedOriginalIngredients = JSON.stringify(originalIngredients);

            console.log(serializedOriginalIngredients);

            fetch('/api/calendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: date,
                    meal_type: mealType,
                    recipe_name: currentRecipe.title,
                    ingredients: serializedOriginalIngredients
                })
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error('Failed to add to meal plan');
                    }
                    return response.json();
                })
                .then(function () {
                    const successMsg = document.createElement('p');
                    successMsg.className = 'success-message';
                    successMsg.appendChild(document.createTextNode('Added to meal plan!'));

                    const actionsDiv = document.querySelector('.recipe-actions');
                    if (actionsDiv) {
                        actionsDiv.appendChild(successMsg);
                        setTimeout(function () {
                            actionsDiv.removeChild(successMsg);
                        }, 2000);
                    }
                })
                .catch(function (error) {
                    console.error('Error:', error);
                    showError('Error adding to meal plan');
                });
        });
    }


    // Handle login form submission
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Please provide both username and password');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                showError(error.message || 'Login failed');
            } else {
                hideError();
            }
        } catch (error) {
            showError('Error logging in');
            console.log(error);
        }
    });

    // Handle logout
    logoutButton.addEventListener('click', async function () {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                showError('Error logging out');
            } else {
                checkLoginStatus();
            }
        } catch (error) {
            showError('Error logging out');
            console.log(error);
        }
    });

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

    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

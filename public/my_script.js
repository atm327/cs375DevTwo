document.getElementById('search-button').addEventListener('click', function() {
    const ingredients = document.getElementById('ingredients').value.split(',').map(ing => ing.trim()).join(',+');
    const recipeCount = document.getElementById('recipe-count').value;
    const apiUrl = `/findByIngredients?ingredients=${ingredients}&number=${recipeCount}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) throw new TypeError('Expected data to be an array');
            
            const tbody = document.getElementById('recipes-table').getElementsByTagName('tbody')[0];
            while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
            }

            data.forEach(recipe => {
                const row = tbody.insertRow();
                const cellTitle = row.insertCell(0);
                const cellImage = row.insertCell(1);

                cellTitle.textContent = recipe.title;
                const img = document.createElement('img');
                img.src = recipe.image;
                img.alt = recipe.title;
                cellImage.appendChild(img);
            });
        })
        .catch(error => {
            document.getElementById('error-message').textContent = `Failed to fetch recipes: ${error.message}`;
            console.error('Error fetching recipes:', error);
        });
});

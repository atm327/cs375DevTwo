document.addEventListener('DOMContentLoaded', function() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('currentMonth');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const modal = document.getElementById('meal-modal');
    const closeButton = modal.querySelector('.close');
    const selectedDateDisplay = document.getElementById('selectedDate');
    const searchResults = document.getElementById('searchResults');
    const recipeSearch = document.getElementById('recipeSearch');

    let currentDate = new Date();
    let meals = {};
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    function createDayElement(day, dateString) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        const dayNum = document.createElement('div');
        dayNum.className = 'day-number';
        dayNum.textContent = day;
        dayDiv.appendChild(dayNum);

        if (meals[dateString]) {
            Object.entries(meals[dateString]).forEach(([mealType, meal]) => {
                const mealDiv = document.createElement('div');
                mealDiv.className = 'meal-item';
                
                const text = document.createElement('span');
                text.textContent = `${mealType}: ${meal.title}`;
                mealDiv.appendChild(text);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '×';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteMeal(dateString, mealType);
                };
                mealDiv.appendChild(deleteBtn);
                
                dayDiv.appendChild(mealDiv);
            });
        }

        dayDiv.onclick = () => openModal(dateString, day);
        return dayDiv;
    }

    function updateCalendar() {
        clearElement(calendarGrid);
        monthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarGrid.appendChild(emptyDay);
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
            calendarGrid.appendChild(createDayElement(day, dateString));
        }
    }

    // Modal and recipe handling
    function openModal(dateString, day) {
        selectedDateDisplay.textContent = new Date(currentDate.getFullYear(),
            currentDate.getMonth(), day).toLocaleDateString();
        modal.dataset.selectedDate = dateString;
        modal.style.display = 'block';
    }

    function addRecipeToResults(recipe) {
        const div = document.createElement('div');
        div.className = 'recipe-result';

        const title = document.createElement('p');
        title.textContent = recipe.title;
        div.appendChild(title);

        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.onclick = () => {
            const mealTime = document.getElementById('mealTime').value;
            addMeal(recipe, mealTime);
        };
        div.appendChild(addButton);

        searchResults.appendChild(div);
    }

    function searchRecipes(query) {
        clearElement(searchResults);
        
        const loading = document.createElement('p');
        loading.textContent = 'Searching...';
        searchResults.appendChild(loading);

        fetch(`/api/search?query=${query}`)
            .then(response => response.json())
            .then(recipes => {
                clearElement(searchResults);
                recipes.forEach(addRecipeToResults);
            })
            .catch(() => {
                clearElement(searchResults);
                const error = document.createElement('p');
                error.textContent = 'Error searching recipes';
                searchResults.appendChild(error);
            });
    }

    function addMeal(recipe, mealTime) {
        const dateString = modal.dataset.selectedDate;
        if (!meals[dateString]) {
            meals[dateString] = {};
        }
        meals[dateString][mealTime] = { title: recipe.title };
        
        modal.style.display = 'none';
        clearElement(searchResults);
        recipeSearch.value = '';
        updateCalendar();
    }

    function deleteMeal(dateString, mealType) {
        delete meals[dateString][mealType];
        if (Object.keys(meals[dateString]).length === 0) {
            delete meals[dateString];
        }
        updateCalendar();
    }

    // Event listeners
    recipeSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = recipeSearch.value.trim();
            if (query) {
                searchRecipes(query);
            }
        }
    });

    closeButton.onclick = () => {
        modal.style.display = 'none';
        clearElement(searchResults);
        recipeSearch.value = '';
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            clearElement(searchResults);
            recipeSearch.value = '';
        }
    };

    if (prevButton) {
        prevButton.onclick = () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCalendar();
        };
    }

    if (nextButton) {
        nextButton.onclick = () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCalendar();
        };
    }

    updateCalendar();
});
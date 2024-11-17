// Calendar state management
let currentDate = new Date();
let selectedDate = null;
let mealPlan = {};  // Structure: { "2024-01-01": { breakfast: {...}, lunch: {...}, dinner: {...} } }

// Initialize calendar
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    setupEventListeners();
    loadMealPlan();
});

function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('generateShoppingList').addEventListener('click', generateShoppingList);

    // Modal close button
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('meal-modal').style.display = 'none';
    });

    // Recipe search input
    document.getElementById('recipeSearch').addEventListener('input', debounce(searchRecipes, 500));
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    document.getElementById('currentMonthDisplay').textContent = 
        new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
        calendarGrid.appendChild(createDayElement());
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
        const dateString = formatDate(new Date(year, month, day));
        const dayElement = createDayElement(day, dateString);
        calendarGrid.appendChild(dayElement);

        // Add meal plan if exists
        if (mealPlan[dateString]) {
            addMealPlanToDay(dayElement, mealPlan[dateString]);
        }
    }
}

function createDayElement(day = '', dateString = '') {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    
    if (day) {
        div.innerHTML = `<div class="day-number">${day}</div>`;
        div.setAttribute('data-date', dateString);
        
        div.addEventListener('click', () => {
            selectedDate = dateString;
            openMealModal(dateString);
        });
    }
    
    return div;
}

function addMealPlanToDay(dayElement, meals) {
    Object.entries(meals).forEach(([mealTime, recipe]) => {
        const mealDiv = document.createElement('div');
        mealDiv.className = 'meal-item';
        mealDiv.innerHTML = `
            <strong>${mealTime}:</strong> ${recipe.title}
            <button class="remove-meal" onclick="removeMeal('${dayElement.dataset.date}', '${mealTime}')">×</button>
        `;
        dayElement.appendChild(mealDiv);
    });
}

function openMealModal(date) {
    document.getElementById('selectedDate').textContent = formatDisplayDate(date);
    document.getElementById('meal-modal').style.display = 'block';
    document.getElementById('recipeSearch').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

async function searchRecipes(event) {
    const query = event.target.value;
    if (!query) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        const results = document.getElementById('searchResults');
        results.innerHTML = '';
        
        data.forEach(recipe => {
            const div = document.createElement('div');
            div.className = 'recipe-result';
            div.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}">
                <span>${recipe.title}</span>
            `;
            div.addEventListener('click', () => assignMeal(recipe));
            results.appendChild(div);
        });
    } catch (error) {
        console.error('Error searching recipes:', error);
    }
}

function assignMeal(recipe) {
    const mealTime = document.getElementById('mealTime').value;
    
    // Save to meal plan
    if (!mealPlan[selectedDate]) {
        mealPlan[selectedDate] = {};
    }
    mealPlan[selectedDate][mealTime] = recipe;
    
    // Save to localStorage
    saveMealPlan();
    
    // Update calendar
    renderCalendar();
    
    // Close modal
    document.getElementById('meal-modal').style.display = 'none';
}

function removeMeal(date, mealTime) {
    if (mealPlan[date] && mealPlan[date][mealTime]) {
        delete mealPlan[date][mealTime];
        if (Object.keys(mealPlan[date]).length === 0) {
            delete mealPlan[date];
        }
        saveMealPlan();
        renderCalendar();
    }
}

function generateShoppingList() {
    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = getEndOfWeek(currentDate);
    let ingredients = new Map();

    // Collect all ingredients for the week
    for (let date in mealPlan) {
        const mealDate = new Date(date);
        if (mealDate >= startOfWeek && mealDate <= endOfWeek) {
            for (let mealTime in mealPlan[date]) {
                const recipe = mealPlan[date][mealTime];
                if (recipe.extendedIngredients) {
                    recipe.extendedIngredients.forEach(ing => {
                        if (ingredients.has(ing.name)) {
                            ingredients.get(ing.name).amount += ing.amount;
                        } else {
                            ingredients.set(ing.name, {
                                amount: ing.amount,
                                unit: ing.unit
                            });
                        }
                    });
                }
            }
        }
    }

    // Display shopping list
    alert('Shopping List:\n\n' + 
        Array.from(ingredients.entries())
            .map(([name, { amount, unit }]) => `${name}: ${amount} ${unit}`)
            .join('\n')
    );
}

// Utility functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStartOfWeek(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
}

function getEndOfWeek(date) {
    const end = new Date(date);
    end.setDate(end.getDate() - end.getDay() + 6);
    return end;
}

function loadMealPlan() {
    const saved = localStorage.getItem('mealPlan');
    if (saved) {
        mealPlan = JSON.parse(saved);
        renderCalendar();
    }
}

function saveMealPlan() {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
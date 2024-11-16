document.addEventListener('DOMContentLoaded', function() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('currentMonth');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const modal = document.getElementById('meal-modal');
    const closeButton = modal.querySelector('.close');
    const selectedDateDisplay = document.getElementById('selectedDate');

    document.getElementById('recipeSearch').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addMealToCalendar();
        }
    });

    // Track current date and meals
    let currentDate = new Date();
    let meals = {};  // Format: {'2024-11-15': {breakfast: {title: 'Oatmeal'}, dinner: {title: 'Pasta'}}}

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    function updateCalendar() {
        // Remove old calendar content
        while (calendarGrid.firstChild) {
            calendarGrid.removeChild(calendarGrid.firstChild);
        }

        // Update displayed month/year
        monthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        // Add blank days
        for (let i = 0; i < firstDay; i++) {
            const blank = document.createElement('div');
            blank.className = 'calendar-day';
            calendarGrid.appendChild(blank);
        }

        // Add days with meals
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';

            const dayNum = document.createElement('div');
            dayNum.className = 'day-number';
            dayNum.textContent = day;
            dayDiv.appendChild(dayNum);

            const dateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;

            // Add meals if they exist
            if (meals[dateString]) {
                const mealList = document.createElement('div');
                mealList.className = 'meal-list';

                // Add each meal type
                for (let type in meals[dateString]) {
                    const mealDiv = document.createElement('div');
                    mealDiv.className = 'meal-item';

                    const mealText = document.createElement('span');
                    mealText.textContent = `${type}: ${meals[dateString][type].title}`;
                    mealDiv.appendChild(mealText);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '×';
                    deleteBtn.onclick = function(e) {
                        e.stopPropagation();  // Prevent modal from opening
                        delete meals[dateString][type];
                        if (Object.keys(meals[dateString]).length === 0) {
                            delete meals[dateString];
                        }
                        updateCalendar();
                    };
                    mealDiv.appendChild(deleteBtn);

                    mealList.appendChild(mealDiv);
                }
                dayDiv.appendChild(mealList);
            }

            // Add click handler for modal
            dayDiv.onclick = function() {
                selectedDateDisplay.textContent = new Date(currentDate.getFullYear(),
                    currentDate.getMonth(), day).toLocaleDateString();
                modal.style.display = 'block';
                // Store selected date for adding meals
                modal.dataset.selectedDate = dateString;
            };

            calendarGrid.appendChild(dayDiv);
        }
    }

    // Month navigation
    if (prevButton) {
        prevButton.onclick = function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCalendar();
        };
    }

    if (nextButton) {
        nextButton.onclick = function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCalendar();
        };
    }

    // Modal handling
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Public function to add meals
    window.addMeal = function(type, recipe) {
        const dateString = modal.dataset.selectedDate;
        if (!dateString) return;

        if (!meals[dateString]) {
            meals[dateString] = {};
        }
        meals[dateString][type] = recipe;
        updateCalendar();
        modal.style.display = 'none';
    };

    function addMealToCalendar() {
        const mealTime = document.getElementById('mealTime').value;
        const recipe = document.getElementById('recipeSearch').value.trim();
        const selectedDate = document.getElementById('selectedDate').textContent;

        if (!recipe) {
            alert('Please enter a recipe name!');
            return;
        }

        // Save the meal to the calendar
        const dateString = modal.dataset.selectedDate;
        if (!meals[dateString]) {
            meals[dateString] = {};
        }
        meals[dateString][mealTime] = { title: recipe };

        updateCalendar();

        document.getElementById('recipeSearch').value = '';
        modal.style.display = 'none';
    }


    // Initialize calendar
    updateCalendar();
});
document.addEventListener('DOMContentLoaded', function() {
    let calendarDays = document.getElementById('calendar-days');
    let weekDays = document.querySelector('.weekdays');
    
    let meals = {};

    function makeWeekdays() {
        let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < days.length; i++) {
            let dayDiv = document.createElement('div');
            let dayText = document.createTextNode(days[i]);
            dayDiv.appendChild(dayText);
            weekDays.appendChild(dayDiv);
        }
    }

    // Format date as YYYY-MM-DD
    function formatDate(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) month = '0' + month;
        let day = date.getDate();
        if (day < 10) day = '0' + day;
        return year + '-' + month + '-' + day;
    }

    function makeDayBox(date) {
        let box = document.createElement('div');
        
        let dateNum = document.createElement('div');
        dateNum.appendChild(document.createTextNode(date.getDate()));
        box.appendChild(dateNum);
        
        let mealBox = document.createElement('div');
        
        let dateStr = formatDate(date);
        
        // If we have meals for this date, add them
        if (meals[dateStr]) {
            // Look at each meal type (breakfast, lunch, dinner)
            for (let type in meals[dateStr]) {
                let meal = meals[dateStr][type];
                
                let mealDiv = document.createElement('div');

                let typeDiv = document.createElement('span');
                typeDiv.appendChild(document.createTextNode(type + ': '));
                mealDiv.appendChild(typeDiv);

                let nameDiv = document.createElement('span');
                nameDiv.appendChild(document.createTextNode(meal.title));
                mealDiv.appendChild(nameDiv);
                
                // Add delete button - Not implemented to work with database currently
                let delButton = document.createElement('button');
                delButton.appendChild(document.createTextNode('×'));
                
                delButton.onclick = function() {
                    removeMeal(dateStr, type);
                };
                mealDiv.appendChild(delButton);
                
                mealBox.appendChild(mealDiv);
            }
        }
        
        box.appendChild(mealBox);
        return box;
    }

    // Get array of dates we want to show
    function getDates() {
        let dates = [];
        let today = new Date();
        
        // Start from Sunday of current week
        let startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        
        // Add 21 days - 3 weeks
        for (let i = 0; i < 21; i++) {
            let newDate = new Date(startDate);
            newDate.setDate(startDate.getDate() + i);
            dates.push(newDate);
        }
        return dates;
    }

    function updateCalendar() {
        while (calendarDays.firstChild) {
            calendarDays.removeChild(calendarDays.firstChild);
        }

        let dates = getDates();
        for (let i = 0; i < dates.length; i++) {
            calendarDays.appendChild(makeDayBox(dates[i]));
        }
    }

    function removeMeal(dateStr, mealType) {
        if (meals[dateStr]) {
            const meal = meals[dateStr][mealType];  // Get the meal object
            const recipeName = meal.title;  // Assuming `meal.title` contains the `recipe_name`
    
            // Call the API to delete the meal
            fetch(`/api/calendar/${recipeName}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Could not delete meal');
                }
    
                // If the delete is successful, remove the meal from the local meals object
                delete meals[dateStr][mealType];
    
                // If no more meals for that day, remove the whole day
                if (Object.keys(meals[dateStr]).length === 0) {
                    delete meals[dateStr];
                }
    
                updateCalendar();  // Refresh the calendar display
            })
            .catch(error => {
                console.error('Error removing meal:', error);
            });
        }
    }
    

    // Get meals from server
	function loadMeals() {
        const loadingMessage = document.createElement('div');
        loadingMessage.textContent = 'Loading meals...';
        calendarDays.appendChild(loadingMessage);
    
        fetch('/api/calendar', { credentials: 'include' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Could not get meals');
                }
                return response.json();
            })
            .then(data => {
                meals = data;
                updateCalendar();
            })
            .catch(error => {
                console.error('Could not load meals:', error);
                const errorMessage = document.createElement('div');
                errorMessage.textContent = 'Error loading meals. Please try again.';
                errorMessage.className = 'error-message';
                calendarDays.appendChild(errorMessage);
            })
            .finally(() => {
                if (loadingMessage.parentNode) {
                    loadingMessage.parentNode.removeChild(loadingMessage);
                }
            });
    }    

    makeWeekdays();
    loadMeals();
});
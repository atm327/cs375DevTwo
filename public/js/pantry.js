document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addItemForm');
    const addButton = document.getElementById('addItemBtn');
    const modal = document.getElementById('addItemModal');
    const closeButton = document.querySelector('.close');
    const messageDiv = document.getElementById('message');
    const categoryContainers = {
        produce: document.querySelector('#produce .category-items'),
        dairy: document.querySelector('#dairy .category-items'),
        meat: document.querySelector('#meat .category-items'),
        grains: document.querySelector('#grains .category-items'),
        spices: document.querySelector('#spices .category-items'),
        canned: document.querySelector('#canned .category-items')
    };

    let pantryItems = [];

    const generateBtn = document.createElement('button');
    generateBtn.textContent = 'Generate Shopping List';
    const pantryHeader = document.querySelector('.pantry-header');
    pantryHeader.appendChild(generateBtn);

    generateBtn.addEventListener('click', function () {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
    
        const startDate = today.toISOString().split('T')[0];
        const endDate = nextWeek.toISOString().split('T')[0];
        console.log(`start: ${startDate} end: ${endDate}`);
        showMessage('Loading shopping list...');
    
        fetch(`/api/shopping-list?startDate=${startDate}&endDate=${endDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to get shopping list');
                }
                return response.json();
            })
            .then(data => {
                displayShoppingList(data.calendarItems, data.pantryItems);
            })
            .catch(error => {
                showMessage('Error loading shopping list');
                console.error('Error:', error);
            });
    });    

    addButton.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Get values from form - match database column names
        const item = {
            item_name: document.getElementById('itemName').value,
            quantity: parseInt(document.getElementById('itemQuantity').value),
            unit: document.getElementById('itemUnit').value,
            category: document.getElementById('itemCategory').value
        };

        try {
            const response = await fetch('/api/pantry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                throw new Error('Failed to add item');
            }

            const newItem = await response.json();
            
            form.reset();
            modal.style.display = 'none';
            
            loadPantryItems();
            showMessage('Item added successfully');

        } catch (error) {
            console.error('Error:', error);
            showMessage('Error adding item');
        }
    });

    function displayShoppingList(calendarItems, pantryItems) {
        const modal = document.getElementById('lowStockModal');
        const listContainer = document.getElementById('lowStockItems');
    
        while (listContainer.firstChild) {
            listContainer.removeChild(listContainer.firstChild);
        }
    
        const heading = document.createElement('h3');
        heading.textContent = 'Shopping List';
        listContainer.appendChild(heading);
    
        // Calendar Items Section
        const calendarHeading = document.createElement('h4');
        calendarHeading.textContent = 'Calendar Recipes';
        listContainer.appendChild(calendarHeading);
    
        if (!calendarItems || calendarItems.length === 0) {
            const noItems = document.createElement('p');
            noItems.textContent = 'No items from calendar recipes.';
            listContainer.appendChild(noItems);
        } else {
            const calendarList = document.createElement('ul');
            calendarItems.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
    
                // Add a "Remove" button
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.onclick = function () {
                    calendarItems.splice(index, 1); // Remove the item from the list
                    displayShoppingList(calendarItems, pantryItems); // Refresh the display
                };
    
                listItem.appendChild(removeButton);
                calendarList.appendChild(listItem);
            });
            listContainer.appendChild(calendarList);
        }
    
        // Pantry Items Section
        const pantryHeading = document.createElement('h4');
        pantryHeading.textContent = 'Pantry Items';
        listContainer.appendChild(pantryHeading);
    
        if (!pantryItems || pantryItems.length === 0) {
            const noPantryItems = document.createElement('p');
            noPantryItems.textContent = 'No pantry items available.';
            listContainer.appendChild(noPantryItems);
        } else {
            const pantryList = document.createElement('ul');
            pantryItems.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.item_name} - ${item.quantity} ${item.unit}`;
                pantryList.appendChild(listItem);
            });
            listContainer.appendChild(pantryList);
        }
    
        modal.style.display = 'block';
    }

    function showPantryItems() {
        Object.values(categoryContainers).forEach(container => {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        });

        pantryItems.forEach(function(item) {
            const container = categoryContainers[item.category];
            if (container) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'pantry-item';

                const infoDiv = document.createElement('div');
                infoDiv.className = 'item-info';

                const nameSpan = document.createElement('strong');
                nameSpan.textContent = item.item_name;
                infoDiv.appendChild(nameSpan);

                const quantitySpan = document.createElement('span');
                quantitySpan.textContent = ' ' + item.quantity + ' ' + item.unit;
                infoDiv.appendChild(quantitySpan);

                itemDiv.appendChild(infoDiv);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Remove';
                deleteButton.onclick = function() {
                    deleteItem(item.item_id);
                };
                itemDiv.appendChild(deleteButton);

                container.appendChild(itemDiv);
            }
        });
    }

    async function deleteItem(id) {
        try {
            const response = await fetch('/api/pantry/' + id, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            await loadPantryItems();
            showMessage('Item removed');

        } catch (error) {
            console.error('Error:', error);
            showMessage('Error removing item');
        }
    }

    function showMessage(text) {
        messageDiv.textContent = text;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    async function loadPantryItems() {
        try {
            const response = await fetch('/api/pantry');
            if (!response.ok) {
                throw new Error('Failed to load items');
            }
            
            pantryItems = await response.json();
            showPantryItems();

        } catch (error) {
            console.error('Error:', error);
            showMessage('Error loading items');
        }
    }

    loadPantryItems();
});

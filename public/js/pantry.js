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

    // Add Shopping List button
    const generateBtn = document.createElement('button');
    generateBtn.textContent = 'Generate Shopping List';
    const pantryHeader = document.querySelector('.pantry-header');
    pantryHeader.appendChild(generateBtn);

    // Add click handler for shopping list
    generateBtn.addEventListener('click', function() {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const startDate = today.toISOString().split('T')[0];
        const endDate = nextWeek.toISOString().split('T')[0];

        showMessage('Loading shopping list...');

        fetch(`/api/shopping-list?startDate=${startDate}&endDate=${endDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to get shopping list');
                }
                return response.json();
            })
            .then(data => {
                displayShoppingList(data.items);
            })
            .catch(error => {
                showMessage('Error loading shopping list');
                console.error('Error:', error);
            });
    });

    // Show modal when add button is clicked
    addButton.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    // Hide modal when X is clicked
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Handle adding new item
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

    function displayShoppingList(items) {
        const modal = document.getElementById('lowStockModal');
        const listContainer = document.getElementById('lowStockItems');

        // Clear previous items
        while (listContainer.firstChild) {
            listContainer.removeChild(listContainer.firstChild);
        }

        // Add heading
        const heading = document.createElement('h3');
        heading.textContent = 'Shopping List';
        listContainer.appendChild(heading);

        if (!items || items.length === 0) {
            const noItems = document.createElement('p');
            noItems.textContent = 'No items needed';
            listContainer.appendChild(noItems);
        } else {
            const list = document.createElement('ul');
            items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                list.appendChild(listItem);
            });
            listContainer.appendChild(list);
        }

        modal.style.display = 'block';
    }

    function showPantryItems() {
        // Clear all containers first
        Object.values(categoryContainers).forEach(container => {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        });

        // Add items to their categories
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

            // Reload items instead of filtering locally
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
<<<<<<< Updated upstream
// Pantry state management
let pantryItems = [];
const LOW_STOCK_THRESHOLD = 2;

document.addEventListener('DOMContentLoaded', function() {
    loadPantryItems();
    setupEventListeners();
    renderPantry();
});

function setupEventListeners() {
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', () => {
        document.getElementById('addItemModal').style.display = 'block';
    });

    // Close buttons for modals
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Add item form submission
    document.getElementById('addItemForm').addEventListener('submit', handleAddItem);

    // Search and filter
    document.getElementById('pantrySearch').addEventListener('input', filterPantryItems);
    document.getElementById('categoryFilter').addEventListener('change', filterPantryItems);
}

function handleAddItem(event) {
    event.preventDefault();

    const newItem = {
        id: Date.now(), // Simple unique ID
        name: document.getElementById('itemName').value,
        quantity: parseFloat(document.getElementById('itemQuantity').value),
        unit: document.getElementById('itemUnit').value,
        category: document.getElementById('itemCategory').value,
        dateAdded: new Date().toISOString()
    };

    pantryItems.push(newItem);
    savePantryItems();
    renderPantry();

    // Reset and close form
    event.target.reset();
    document.getElementById('addItemModal').style.display = 'none';
}

function renderPantry() {
    const categories = document.querySelectorAll('.category-section');
    categories.forEach(category => {
        const categoryId = category.id;
        const items = pantryItems.filter(item => item.category === categoryId);
        
        const itemsContainer = category.querySelector('.category-items');
        itemsContainer.innerHTML = '';

        items.forEach(item => {
            const itemElement = createPantryItemElement(item);
            itemsContainer.appendChild(itemElement);
        });
=======
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

    // Store pantry items
    let pantryItems = [];

    // Replace with the actual user ID retrieved from authentication logic
    // const userId = /* dynamically retrieved user ID */;
    // document.addEventListener('DOMContentLoaded', function() {
    //     // Check if user is logged in
    //     if (!userId) {
    //         showNotification('Please log in to access your pantry.');
    //         window.location.href = '/login';
    //         return;
    //     }
    //     loadPantryItems();
    //     setupEventListeners();
    //     renderPantry();
    // });

    // Show modal when add button is clicked
    addButton.addEventListener('click', function() {
        modal.style.display = 'block';
>>>>>>> Stashed changes
    });

    // Hide modal when X is clicked
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

<<<<<<< Updated upstream
function createPantryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'pantry-item';
    div.innerHTML = `
        <div class="pantry-item-info">
            <strong>${item.name}</strong>
            <div>${item.quantity} ${item.unit}</div>
        </div>
        <div class="pantry-item-actions">
            <button onclick="adjustQuantity(${item.id}, -1)" class="action-btn">-</button>
            <button onclick="adjustQuantity(${item.id}, 1)" class="action-btn">+</button>
            <button onclick="removeItem(${item.id})" class="action-btn">×</button>
        </div>
    `;
    
    if (item.quantity <= LOW_STOCK_THRESHOLD) {
        div.classList.add('low-stock');
    }
    
    return div;
}

function adjustQuantity(itemId, change) {
    const item = pantryItems.find(item => item.id === itemId);
    if (item) {
        item.quantity = Math.max(0, item.quantity + change);
        savePantryItems();
        renderPantry();
    }
}

function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        pantryItems = pantryItems.filter(item => item.id !== itemId);
        savePantryItems();
        renderPantry();
    }
}
=======
    // Handle adding new item
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Get values from form
        const item = {
            name: document.getElementById('itemName').value,
            quantity: document.getElementById('itemQuantity').value,
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

            // Add to our list
            pantryItems.push(newItem);

            form.reset();
            modal.style.display = 'none';

            showPantryItems();
            showMessage('Item added successfully');

        } catch (error) {
            console.log('Error:', error);
            showMessage('Error adding item');
        }
    });

    // Display pantry items
    function showPantryItems() {
        // Clear all containers first
        for (let category in categoryContainers) {
            clearContainer(categoryContainers[category]);
        }

        // Add items to their categories
        pantryItems.forEach(function(item) {
            if (categoryContainers[item.category]) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'pantry-item';

                // Create info section
                const infoDiv = document.createElement('div');
                infoDiv.className = 'item-info';

                const nameSpan = document.createElement('strong');
                nameSpan.textContent = item.name;
                infoDiv.appendChild(nameSpan);

                const quantitySpan = document.createElement('span');
                quantitySpan.textContent = ' ' + item.quantity + ' ' + item.unit;
                infoDiv.appendChild(quantitySpan);

                itemDiv.appendChild(infoDiv);

                // Create delete button
                const actionDiv = document.createElement('div');
                actionDiv.className = 'item-actions';

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Remove';
                deleteButton.addEventListener('click', function() {
                    deleteItem(item.id);
                });
                actionDiv.appendChild(deleteButton);

                itemDiv.appendChild(actionDiv);
                categoryContainers[item.category].appendChild(itemDiv);
            }
        });
    }

    // Delete item function
    async function deleteItem(id) {
        try {
            const response = await fetch('/api/pantry/' + id, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }
>>>>>>> Stashed changes

            // Remove from our list
            pantryItems = pantryItems.filter(function(item) {
                return item.id !== id;
            });

            // Update display and show message
            showPantryItems();
            showMessage('Item removed');

        } catch (error) {
            console.log('Error:', error);
            showMessage('Error removing item');
        }
<<<<<<< Updated upstream
    });
}

function checkLowStock() {
    const lowStockItems = pantryItems.filter(item => item.quantity <= LOW_STOCK_THRESHOLD);
    
    if (lowStockItems.length > 0) {
        const lowStockList = document.getElementById('lowStockItems');
        lowStockList.innerHTML = lowStockItems.map(item => `
            <div class="low-stock-item">
                <strong>${item.name}</strong>: ${item.quantity} ${item.unit} remaining
            </div>
        `).join('');
        
        // Show notification (you can enhance this with a proper notification system)
        const notification = `You have ${lowStockItems.length} items running low!`;
        showNotification(notification);
=======
>>>>>>> Stashed changes
    }

<<<<<<< Updated upstream
function showNotification(message) {
    // Simple notification - you can enhance this with a proper notification system
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'notification';
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);

    setTimeout(() => {
        notificationDiv.remove();
    }, 3000);
}

// Local Storage functions
function loadPantryItems() {
    const saved = localStorage.getItem('pantryItems');
    if (saved) {
        pantryItems = JSON.parse(saved);
    }
}

function savePantryItems() {
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
}

// Window click event for closing modals
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
=======
    // Helper function to clear a container
    function clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    // Show message function
    function showMessage(text) {
        messageDiv.textContent = text;
        messageDiv.style.display = 'block';
        // Hide message after 3 seconds
        setTimeout(function() {
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
            console.log('Error:', error);
            showMessage('Error loading items');
        }
    }

    loadPantryItems();
});
>>>>>>> Stashed changes

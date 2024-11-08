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

async function handleAddItem(event) {
    event.preventDefault();

    const newItem = {
        user_id: 1, // Replace with actual user_id from your auth system
        name: document.getElementById('itemName').value,
        quantity: parseFloat(document.getElementById('itemQuantity').value),
        unit: document.getElementById('itemUnit').value,
        category: document.getElementById('itemCategory').value,
        dateAdded: new Date().toISOString()
    };

    try {
        const response = await fetch('/api/pantry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        });

        const addedItem = await response.json();
        pantryItems.push(addedItem);
        renderPantry();

        // Reset and close form
        event.target.reset();
        document.getElementById('addItemModal').style.display = 'none';
    } catch (error) {
        console.error('Error adding item:', error);
    }
}

async function loadPantryItems() {
    try {
        const response = await fetch('/api/pantry?user_id=1'); // Replace with actual user_id
        pantryItems = await response.json();
        renderPantry();
    } catch (error) {
        console.error('Error loading pantry items:', error);
    }
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
    });

    checkLowStock();
}

function createPantryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'pantry-item';
    div.innerHTML = `
        <div class="pantry-item-info">
            <strong>${item.name}</strong>
            <div>${item.quantity} ${item.unit}</div>
        </div>
        <div class="pantry-item-actions">
            <button onclick="adjustQuantity(${item.pantry_item_id}, -1)" class="action-btn">-</button>
            <button onclick="adjustQuantity(${item.pantry_item_id}, 1)" class="action-btn">+</button>
            <button onclick="removeItem(${item.pantry_item_id})" class="action-btn">×</button>
        </div>
    `;
    
    if (item.quantity <= LOW_STOCK_THRESHOLD) {
        div.classList.add('low-stock');
    }
    
    return div;
}

async function adjustQuantity(itemId, change) {
    const item = pantryItems.find(item => item.pantry_item_id === itemId);
    if (item) {
        const newQuantity = Math.max(0, item.quantity + change);

        try {
            const response = await fetch(`/api/pantry/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (response.ok) {
                item.quantity = newQuantity;
                renderPantry();
            } else {
                console.error('Error adjusting quantity:', response.statusText);
            }
        } catch (error) {
            console.error('Error adjusting quantity:', error);
        }
    }
}

async function removeItem(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        try {
            const response = await fetch(`/api/pantry/${itemId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                pantryItems = pantryItems.filter(item => item.pantry_item_id !== itemId);
                renderPantry();
            } else {
                console.error('Error removing item:', response.statusText);
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }
}

function filterPantryItems() {
    const searchTerm = document.getElementById('pantrySearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    const categories = document.querySelectorAll('.category-section');
    categories.forEach(category => {
        if (categoryFilter === 'all' || category.id === categoryFilter) {
            category.style.display = 'block';
            const items = pantryItems.filter(item => 
                item.category === category.id &&
                item.name.toLowerCase().includes(searchTerm)
            );
            
            const itemsContainer = category.querySelector('.category-items');
            itemsContainer.innerHTML = '';
            items.forEach(item => {
                itemsContainer.appendChild(createPantryItemElement(item));
            });
        } else {
            category.style.display = 'none';
        }
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
        
        const notification = `You have ${lowStockItems.length} items running low!`;
        showNotification(notification);
    }
}

function showNotification(message) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'notification';
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);

    setTimeout(() => {
        notificationDiv.remove();
    }, 3000);
}

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
        
        // Show notification (you can enhance this with a proper notification system)
        const notification = `You have ${lowStockItems.length} items running low!`;
        showNotification(notification);
    }
}

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
// report.js
let criticalStockData = []; // Store critical stock for the alert button

document.addEventListener('DOMContentLoaded', () => {
    fetchInventoryCategories(); // Fetch categories on page load
    updateInventoryStatus();
    // Other initializations (fetchSalesOverview, updateOrderSummary, etc.)
});

// Fetch categories for the inventory filter dropdown
function fetchInventoryCategories() {
    fetch('/report/inventory-categories')
        .then(response => response.json())
        .then(categories => {
            const categoryFilter = document.getElementById('inventoryCategoryFilter');
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(cat => {
                categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        })
        .catch(error => console.error('Error fetching inventory categories:', error));
}

// Fetch and display inventory status
function updateInventoryStatus() {
    const category = document.getElementById('inventoryCategoryFilter').value;
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    fetch(`/report/inventory-status?${queryParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            // Low Stock Products
            const lowStockTbody = document.getElementById('lowStockProducts');
            lowStockTbody.innerHTML = '';
            data.lowStock.forEach(product => {
                const row = `
                    <tr class="${product.stock <= 2 ? 'critical-stock' : 'low-stock'}">
                        <td>${product.productId}</td>
                        <td>${product.productName}</td>
                        <td>${product.category}</td>
                        <td>${product.stock}</td>
                    </tr>
                `;
                lowStockTbody.innerHTML += row;
            });

            // Out of Stock Products
            const outOfStockTbody = document.getElementById('outOfStockProducts');
            outOfStockTbody.innerHTML = '';
            data.outOfStock.forEach(product => {
                const row = `
                    <tr class="out-of-stock">
                        <td>${product.productId}</td>
                        <td>${product.productName}</td>
                        <td>${product.category}</td>
                        <td>${product.stock}</td>
                    </tr>
                `;
                outOfStockTbody.innerHTML += row;
            });

            // Critical Stock Alert
            criticalStockData = data.criticalStock; // Store for alert button
            const alertBanner = document.getElementById('criticalStockAlert');
            const alertMessage = document.getElementById('criticalStockMessage');
            if (data.criticalStock.length > 0) {
                const criticalProducts = data.criticalStock.map(p => `${p.productName} (${p.stock} left)`).join(', ');
                alertMessage.textContent = `Critically low stock: ${criticalProducts}`;
                alertBanner.classList.remove('hidden');
            } else {
                alertBanner.classList.add('hidden');
            }
        })
        .catch(error => console.error('Error fetching inventory status:', error));
}

// Send restock alert
function sendRestockAlert() {
    if (criticalStockData.length === 0) {
        alert('No critical stock items to notify about.');
        return;
    }

    fetch('/report/send-restock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criticalStock: criticalStockData })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error sending restock alert:', error);
        alert('Failed to send restock alert.');
    });
}

// Rest of your report.js code (fetchSalesOverview, updateOrderSummary, etc.) remains unchanged...

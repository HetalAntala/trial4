// inventory.js
window.highlightLowStockProduct = function(productId) {
    const lowStockTbody = document.getElementById('lowStockProducts');
    const rows = lowStockTbody.getElementsByTagName('tr');
    for (let row of rows) {
        const idCell = row.cells[0].textContent;
        if (idCell === productId) {
            row.style.backgroundColor = '#ffebee'; // Highlight color for low stock
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        }
    }

    // Optionally filter the table to show only low stock items
    const categoryFilter = document.getElementById('inventoryCategoryFilter');
    if (categoryFilter) {
        categoryFilter.value = ''; // Reset to "All Categories"
        updateInventoryStatus(); // Refresh the table
    }
};
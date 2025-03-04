// report.js
let criticalStockData = [];
let salesTrendChart = null;
let bestSellersChart = null;
let orderStatusChart = null;
let bestSellersData = []; // Store the full best-sellers data for filtering

// Fetch categories for the inventory filter dropdown (also used for best-sellers filter)
function fetchInventoryCategories1() {
    fetch('/report/inventory-categories1')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Categories received:', data);
            const categoryFilter = document.getElementById('inventoryCategoryFilter');
            const bestSellersCategoryFilter = document.getElementById('bestSellersCategoryFilter');
            if (!categoryFilter || !bestSellersCategoryFilter) {
                console.error('Category filter elements not found in DOM');
                return;
            }
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            bestSellersCategoryFilter.innerHTML = '<option value="">All Categories</option>';

            // Ensure data is an array
            const categories = Array.isArray(data) ? data : [];
            if (categories.length > 0) {
                categories.forEach(cat => {
                    categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
                    bestSellersCategoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
                });
            } else {
                console.warn('No valid categories returned from the server');
            }
        })
        .catch(error => {
            console.error('Error fetching inventory categories:', error);
            alert('Failed to load categories. Please try again later.');
        });
}

// Update Best-Sellers Chart based on selected category
function updateBestSellersChart() {
    const selectedCategory = document.getElementById('bestSellersCategoryFilter').value;
    let filteredData = bestSellersData;
    if (selectedCategory) {
        filteredData = bestSellersData.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Map categories to colors
    const categoryColors = {};
    const uniqueCategories = [...new Set(filteredData.map(item => item.category))];
    uniqueCategories.forEach((cat, index) => {
        const hue = (index * 137.5) % 360; // Generate distinct colors
        categoryColors[cat] = `hsl(${hue}, 70%, 60%)`;
    });

    if (bestSellersChart) bestSellersChart.destroy();
    const bestSellersCtx = document.getElementById('bestSellersChart').getContext('2d');
    bestSellersChart = new Chart(bestSellersCtx, {
        type: 'bar',
        data: {
            labels: filteredData.map(item => item.productName || `Product ID: ${item.Product_id} (Category: ${item.category})`),
            datasets: [{
                label: 'Units Sold',
                data: filteredData.map(item => item.totalSold),
                backgroundColor: filteredData.map(item => categoryColors[item.category] || 'rgba(115, 128, 236, 0.6)'),
                borderColor: filteredData.map(item => categoryColors[item.category] || '#7380ec'),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Units Sold'
                    }
                },
                x: {
                    ticks: {
                        // Rotate labels to 45 degrees to prevent overlap
                        maxRotation: 45,
                        minRotation: 45,
                        // Optionally, limit the maximum length of labels
                        callback: function(value, index, values) {
                            // Wrap long labels into multiple lines
                            const maxLength = 15; // Adjust based on your needs
                            if (typeof value === 'string' && value.length > maxLength) {
                                const words = value.split(' ');
                                let line = '';
                                const lines = [];
                                for (const word of words) {
                                    if ((line + word).length > maxLength) {
                                        lines.push(line.trim());
                                        line = word + ' ';
                                    } else {
                                        line += word + ' ';
                                    }
                                }
                                lines.push(line.trim());
                                return lines; // Chart.js will display each line separately
                            }
                            return value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            layout: {
                padding: {
                    bottom: 30 // Increase bottom padding to accommodate rotated labels
                }
            },
            maintainAspectRatio: false // Allow the chart to adjust its height
        }
    });
    const chartContainer = document.getElementById('bestSellersChart').parentElement;
        chartContainer.style.height = '400px'; // Adjust height to give more space
}

// Fetch Dashboard Data
function fetchDashboardData() {
    fetch('/report/dashboard')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.keyMetrics || !data.charts || !data.recentActivity) {
                console.error('Invalid response format:', data);
                // Reset UI on error
                document.getElementById('dailySales').textContent = 'Rs. 0';
                document.getElementById('weeklySales').textContent = 'Rs. 0';
                document.getElementById('monthlySales').textContent = 'Rs. 0';
                document.getElementById('totalOrders').textContent = '0';
                document.getElementById('totalActiveCustomers').textContent = '0';
                document.getElementById('totalInventory').textContent = '0';
                if (salesTrendChart) salesTrendChart.destroy();
                if (bestSellersChart) bestSellersChart.destroy();
                if (orderStatusChart) orderStatusChart.destroy();
                document.getElementById('recentActivityLog').innerHTML = '';
                alert('Failed to load dashboard data. Please try again later.');
                return;
            }

            // Update Key Metrics
            document.getElementById('dailySales').textContent = `Rs. ${data.keyMetrics.dailySales.toFixed(2)}`;
            document.getElementById('weeklySales').textContent = `Rs. ${data.keyMetrics.weeklySales.toFixed(2)}`;
            document.getElementById('monthlySales').textContent = `Rs. ${data.keyMetrics.monthlySales.toFixed(2)}`;
            document.getElementById('totalOrders').textContent = data.keyMetrics.totalOrders;
            document.getElementById('totalActiveCustomers').textContent = data.keyMetrics.totalActiveCustomers;
            document.getElementById('totalInventory').textContent = data.keyMetrics.totalInventory;

            // Sales Trend Chart
            if (salesTrendChart) salesTrendChart.destroy();
            const salesTrendCtx = document.getElementById('salesTrendChart').getContext('2d');
            salesTrendChart = new Chart(salesTrendCtx, {
                type: 'line',
                data: {
                    labels: data.charts.salesTrend.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [{
                        label: 'Sales',
                        data: data.charts.salesTrend.map(item => item.totalSales),
                        borderColor: '#7380ec',
                        backgroundColor: 'rgba(115, 128, 236, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Sales (Rs.)' } },
                        x: { title: { display: true, text: 'Date' } }
                    }
                }
            });

            // Store best-sellers data for filtering
            bestSellersData = data.charts.bestSellers;
            updateBestSellersChart();


                        // Order Status Distribution Chart
            console.log('Order Status Data:', data.charts.orderStatus);
            if (orderStatusChart) orderStatusChart.destroy();
            const orderStatusCtx = document.getElementById('orderStatusChart').getContext('2d');
            orderStatusChart = new Chart(orderStatusCtx, {
                type: 'pie',
                data: {
                    labels: data.charts.orderStatus.map(item => item.status),
                    datasets: [{
                        label: 'Order Count by Status',
                        data: data.charts.orderStatus.map(item => item.count),
                        backgroundColor: [
                            '#ff6384', // Pending
                            '#36a2eb', // Processing
                            '#ffce56', // Shipped
                            '#4bc0c0', // Delivered
                            '#ff9f40'  // Canceled
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            onClick: (e, legendItem, legend) => {
                                // Prevent default legend click behavior (toggling visibility)
                                e.stopPropagation();
                                const status = legend.chart.data.labels[legendItem.index];
                                navigateToOrdersWithStatusFilter(status);
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: ${value} orders`;
                                }
                            }
                        }
                    },
                    onClick: (event, elements) => {
                        if (elements.length > 0) {
                            const element = elements[0];
                            const status = element.element.$context.chart.data.labels[element.index];
                            navigateToOrdersWithStatusFilter(status);
                        }
                    }
                }
            });

            // Recent Activity Log with Clickable Links
            const activityLog = document.getElementById('recentActivityLog');
            activityLog.innerHTML = '';
            data.recentActivity.forEach(activity => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = `${activity.details} at ${new Date(activity.activityDate).toLocaleString()}`;
                link.style.cursor = 'pointer';
                link.style.color = '#7380ec';
                link.style.textDecoration = 'none';

                // Add click handler based on activity type
                if (activity.activityType === 'New Order') {
                    link.onclick = () => {
                        // Navigate to Orders tab and show order details
                        showSection('orders');
                        setTimeout(() => {
                            showOrderDetails(activity.identifier); // Assumes showOrderDetails is defined in orderdet.js
                        }, 100); // Delay to ensure Orders tab is rendered
                    };
                } else if (activity.activityType === 'New Customer') {
                    link.onclick = () => {
                        // Navigate to Customer tab and highlight customer
                        showSection('customer');
                        setTimeout(() => {
                            highlightCustomer(activity.identifier); // Assumes highlightCustomer is defined in customer.js
                        }, 100);
                    };
                } else if (activity.activityType === 'Low Stock Alert') {
                    link.onclick = () => {
                        // Navigate to Inventory tab and highlight product
                        showSection('inventory');
                        setTimeout(() => {
                            highlightLowStockProduct(activity.identifier); // Define this function in inventory.js
                        }, 100);
                    };
                }

                li.appendChild(link);
                activityLog.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
            // Reset UI on error
            document.getElementById('dailySales').textContent = 'Rs. 0';
            document.getElementById('weeklySales').textContent = 'Rs. 0';
            document.getElementById('monthlySales').textContent = 'Rs. 0';
            document.getElementById('totalOrders').textContent = '0';
            document.getElementById('totalActiveCustomers').textContent = '0';
            document.getElementById('totalInventory').textContent = '0';
            if (salesTrendChart) salesTrendChart.destroy();
            if (bestSellersChart) bestSellersChart.destroy();
            if (orderStatusChart) orderStatusChart.destroy();
            document.getElementById('recentActivityLog').innerHTML = '';
            alert('Failed to load dashboard data. Please try again later.');
        });
}

// Call fetchDashboardData when the Dashboard tab is shown
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    fetchInventoryCategories1();
});







// report.js
let orderPieChart = null;
let orderBarChart = null;
let salesByPeriodChart = null;
let salesByProductChart = null;
let salesByCategoryChart = null;
let customerDemographicsChart = null;
let customerPurchaseHistoryChart = null;
let customerLifetimeValueChart = null;


// Remove this line since currentReportType is already declared in index.html
// let currentReportType = 'order-report';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchInventoryCategories(); // Fetch categories for inventory filter

    // Setup event listeners for date range toggles
    document.getElementById('salesDateRange').addEventListener('change', function() {
        const customRangeDiv = document.getElementById('salesCustomDateRange');
        customRangeDiv.style.display = this.value === 'custom' ? 'block' : 'none';
        if (this.value !== 'custom') fetchSalesReport();
    });

    document.getElementById('customerDateRange').addEventListener('change', function() {
        const customRangeDiv = document.getElementById('customerCustomDateRange');
        customRangeDiv.style.display = this.value === 'custom' ? 'block' : 'none';
        if (this.value !== 'custom') fetchCustomerReport();
    });

    document.getElementById('orderDateRange').addEventListener('change', function() {
        const customRangeDiv = document.getElementById('customDateRange');
        customRangeDiv.style.display = this.value === 'custom' ? 'block' : 'none';
        if (this.value !== 'custom') fetchOrderReport();
    });
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

// Fetch Sales Report
function fetchSalesReport() {
    const dateRange = document.getElementById('salesDateRange').value;
    const groupBy = document.getElementById('salesGroupBy').value;
    let startDate, endDate;

    const today = new Date();
    if (dateRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    } else if (dateRange === 'last7days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    } else if (dateRange === 'last30days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
        startDate = document.getElementById('salesStartDate').value;
        endDate = document.getElementById('salesEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    }

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (groupBy) queryParams.append('groupBy', groupBy);

    fetch(`/report/sales-report?${queryParams.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Sales Report Data:", data);
            console.log("Sales by Product:", data.salesByProduct);

            // Update Total Sales
            const totalSales = data.totalSales.reduce((sum, item) => sum + item.totalSales, 0);
            document.getElementById('totalSales').textContent = `Rs. ${totalSales.toFixed(2)}`;

            // Sales by Period Chart
            if (salesByPeriodChart) salesByPeriodChart.destroy();
            const periodCtx = document.getElementById('salesByPeriodChart').getContext('2d');
            salesByPeriodChart = new Chart(periodCtx, {
                type: 'line',
                data: {
                    labels: data.totalSales.map(item => item.period),
                    datasets: [{
                        label: 'Total Sales',
                        data: data.totalSales.map(item => item.totalSales),
                        borderColor: '#7380ec',
                        backgroundColor: 'rgba(115, 128, 236, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Sales (Rs.)' } },
                        x: { title: { display: true, text: 'Period' } }
                    }
                }
            });

            // Sales by Product Chart
            if (salesByProductChart) salesByProductChart.destroy();
            const productCtx = document.getElementById('salesByProductChart').getContext('2d');
            salesByProductChart = new Chart(productCtx, {
                type: 'bar',
                data: {
                    labels: data.salesByProduct.map(item => item.productName || 'Unknown'), // Fallback to "Unknown" if productName is null
                    datasets: [{
                        label: 'Total Revenue',
                        data: data.salesByProduct.map(item => item.totalRevenue),
                        backgroundColor: 'rgba(115, 128, 236, 0.6)',
                        borderColor: '#7380ec',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Revenue (Rs.)' } }
                    }
                }
            });

            // Sales by Category Chart
            if (salesByCategoryChart) salesByCategoryChart.destroy();
            const categoryCtx = document.getElementById('salesByCategoryChart').getContext('2d');
            salesByCategoryChart = new Chart(categoryCtx, {
                type: 'bar',
                data: {
                    labels: data.salesByCategory.map(item => item.categoryName),
                    datasets: [{
                        label: 'Total Revenue',
                        data: data.salesByCategory.map(item => item.totalRevenue),
                        backgroundColor: 'rgba(115, 128, 236, 0.6)',
                        borderColor: '#7380ec',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Revenue (Rs.)' } }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error fetching sales report:', error);
            alert('Failed to fetch sales report. Please try again later.');
        });
}

// Export Sales Report
function exportSalesReport(format) {
    const dateRange = document.getElementById('salesDateRange').value;
    const groupBy = document.getElementById('salesGroupBy').value;
    let startDate, endDate;

    const today = new Date();
    if (dateRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    } else if (dateRange === 'last7days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    } else if (dateRange === 'last30days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
        startDate = document.getElementById('salesStartDate').value;
        endDate = document.getElementById('salesEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    }

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (groupBy) queryParams.append('groupBy', groupBy);

    const endpoint = format === 'csv' ? '/report/export-sales-report-csv' : '/report/export-sales-report-pdf';
    const fileName = `sales_report.${format}`;

    fetch(`${endpoint}?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Accept': format === 'csv' ? 'text/csv' : 'application/pdf' }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert(`Sales report exported successfully as ${format.toUpperCase()}!`);
    })
    .catch(error => {
        console.error(`Error exporting sales report as ${format}:`, error);
        alert(`Failed to export sales report as ${format.toUpperCase()}.`);
    });
}

// Fetch Customer Report
function fetchCustomerReport() {
    const dateRange = document.getElementById('customerDateRange').value;
    let startDate, endDate;

    const today = new Date();
    if (dateRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    } else if (dateRange === 'last7days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    } else if (dateRange === 'last30days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
        startDate = document.getElementById('customerStartDate').value;
        endDate = document.getElementById('customerEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    }

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    fetch(`/report/customer-report?${queryParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            // Customer Demographics Chart
            if (customerDemographicsChart) customerDemographicsChart.destroy();
            const demographicsCtx = document.getElementById('customerDemographicsChart').getContext('2d');
            customerDemographicsChart = new Chart(demographicsCtx, {
                type: 'bar',
                data: {
                    labels: data.demographics.map(item => item.areaId),
                    datasets: [{
                        label: 'Customer Count by Area',
                        data: data.demographics.map(item => item.customerCount),
                        backgroundColor: 'rgba(115, 128, 236, 0.6)',
                        borderColor: '#7380ec',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Customer Count' } },
                        x: { title: { display: true, text: 'Area ID' } }
                    }
                }
            });

            // Purchase History Chart
            if (customerPurchaseHistoryChart) customerPurchaseHistoryChart.destroy();
            const purchaseHistoryCtx = document.getElementById('customerPurchaseHistoryChart').getContext('2d');
            customerPurchaseHistoryChart = new Chart(purchaseHistoryCtx, {
                type: 'bar',
                data: {
                    labels: data.purchaseHistory.map(item => item.C_id),
                    datasets: [{
                        label: 'Total Spent',
                        data: data.purchaseHistory.map(item => item.totalSpent),
                        backgroundColor: 'rgba(115, 128, 236, 0.6)',
                        borderColor: '#7380ec',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Total Spent (Rs.)' } },
                        x: { title: { display: true, text: 'Customer ID' } }
                    }
                }
            });

            // Lifetime Value Chart
            if (customerLifetimeValueChart) customerLifetimeValueChart.destroy();
            const lifetimeValueCtx = document.getElementById('customerLifetimeValueChart').getContext('2d');
            customerLifetimeValueChart = new Chart(lifetimeValueCtx, {
                type: 'bar',
                data: {
                    labels: data.lifetimeValue.map(item => item.C_id),
                    datasets: [{
                        label: 'Lifetime Value',
                        data: data.lifetimeValue.map(item => item.lifetimeValue),
                        backgroundColor: 'rgba(115, 128, 236, 0.6)',
                        borderColor: '#7380ec',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Lifetime Value (Rs.)' } },
                        x: { title: { display: true, text: 'Customer ID' } }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching customer report:', error));
}

// Export Customer Report
function exportCustomerReport(format) {
    const dateRange = document.getElementById('customerDateRange').value;
    let startDate, endDate;

    const today = new Date();
    if (dateRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    } else if (dateRange === 'last7days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    } else if (dateRange === 'last30days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
        startDate = document.getElementById('customerStartDate').value;
        endDate = document.getElementById('customerEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    }

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const endpoint = format === 'csv' ? '/report/export-customer-report-csv' : '/report/export-customer-report-pdf';
    const fileName = `customer_report.${format}`;

    fetch(`${endpoint}?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Accept': format === 'csv' ? 'text/csv' : 'application/pdf' }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert(`Customer report exported successfully as ${format.toUpperCase()}!`);
    })
    .catch(error => {
        console.error(`Error exporting customer report as ${format}:`, error);
        alert(`Failed to export customer report as ${format.toUpperCase()}.`);
    });
}

// Fetch Inventory Report
function fetchInventoryReport() {
    const category = document.getElementById('inventoryCategoryFilter').value;
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    fetch(`/report/inventory-report?${queryParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            // Low Stock Products
            const lowStockTbody = document.getElementById('lowStockProducts');
            lowStockTbody.innerHTML = '';
            data.stockLevels.forEach(product => {
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
            data.stockLevels.filter(product => product.stock === 0).forEach(product => {
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
            criticalStockData = data.stockLevels.filter(item => item.stock <= 2);
            const alertBanner = document.getElementById('criticalStockAlert');
            const alertMessage = document.getElementById('criticalStockMessage');
            if (criticalStockData.length > 0) {
                const criticalProducts = criticalStockData.map(p => `${p.productName} (${p.stock} left)`).join(', ');
                alertMessage.textContent = `Critically low stock: ${criticalProducts}`;
                alertBanner.classList.remove('hidden');
            } else {
                alertBanner.classList.add('hidden');
            }

            // Inventory Turnover
            const turnoverTbody = document.getElementById('inventoryTurnover');
            turnoverTbody.innerHTML = '';
            data.turnover.forEach(product => {
                const row = `
                    <tr>
                        <td>${product.productId}</td>
                        <td>${product.productName}</td>
                        <td>${product.category}</td>
                        <td>${product.stock}</td>
                        <td>${product.totalSold}</td>
                    </tr>
                `;
                turnoverTbody.innerHTML += row;
            });

            // Slow Moving Products
            const slowMovingTbody = document.getElementById('slowMovingProducts');
            slowMovingTbody.innerHTML = '';
            data.slowMoving.forEach(product => {
                const row = `
                    <tr>
                        <td>${product.productId}</td>
                        <td>${product.productName}</td>
                        <td>${product.category}</td>
                        <td>${product.stock}</td>
                        <td>${product.totalSold}</td>
                    </tr>
                `;
                slowMovingTbody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching inventory report:', error));
}

// Export Inventory Report
function exportInventoryReport(format) {
    const category = document.getElementById('inventoryCategoryFilter').value;
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    const endpoint = format === 'csv' ? '/report/export-inventory-report-csv' : '/report/export-inventory-report-pdf';
    const fileName = `inventory_report.${format}`;

    fetch(`${endpoint}?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Accept': format === 'csv' ? 'text/csv' : 'application/pdf' }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert(`Inventory report exported successfully as ${format.toUpperCase()}!`);
    })
    .catch(error => {
        console.error(`Error exporting inventory report as ${format}:`, error);
        alert(`Failed to export inventory report as ${format.toUpperCase()}.`);
    });
}

// Send Restock Alert
// function sendRestockAlert() {
//     if (criticalStockData.length === 0) {
//         alert('No critical stock items to notify about.');
//         return;
//     }

//     fetch('/report/send-restock-alert', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ criticalStock: criticalStockData })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json();
//     })
//     .then(data => {
//         alert(data.message || 'Restock alert sent successfully!');
//         // Optionally hide the alert banner after sending
//         const alertBanner = document.getElementById('criticalStockAlert');
//         alertBanner.classList.add('hidden');
//     })
//     .catch(error => {
//         console.error('Error sending restock alert:', error);
//         alert('Failed to send restock alert. Please try again.');
//     });
// }

// Fetch Order Report
function fetchOrderReport() {
    const dateRange = document.getElementById('orderDateRange').value;
    const status = document.getElementById('orderStatusFilter').value;
    let startDate, endDate;

    const today = new Date();
    if (dateRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    } else if (dateRange === 'last7days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    } else if (dateRange === 'last30days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
        startDate = document.getElementById('orderStartDate').value;
        endDate = document.getElementById('orderEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    }

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (status) queryParams.append('status', status);

    fetch(`/report/order-report?${queryParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            // Update key metrics
            document.getElementById('pendingOrders').textContent = data.statusSummary.find(item => item.status === 'Pending')?.count || 0;
            document.getElementById('deliveredOrders').textContent = data.statusSummary.find(item => item.status === 'Delivered')?.count || 0;
            document.getElementById('canceledOrders').textContent = data.statusSummary.find(item => item.status === 'Canceled')?.count || 0;

            // Order Status Chart
            if (orderStatusChart) orderStatusChart.destroy();
            const statusCtx = document.getElementById('orderSummaryPieChart').getContext('2d');
            orderStatusChart = new Chart(statusCtx, {
                type: 'pie',
                data: {
                    labels: data.statusSummary.map(item => item.status),
                    datasets: [{
                        label: 'Order Count by Status',
                        data: data.statusSummary.map(item => item.count),
                        backgroundColor: [
                            '#ff6384', // Pending
                            '#36a2eb', // Processing
                            '#ffce56', // Shipped
                            '#4bc0c0', // Delivered
                            '#ff9f40'  // Canceled
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });

            // Bar Chart for Key Metrics
            if (orderBarChart) orderBarChart.destroy();
            const barCtx = document.getElementById('orderSummaryBarChart').getContext('2d');
            orderBarChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: ['Processing', 'Delivered', 'Canceled'],
                    datasets: [{
                        label: 'Order Counts',
                        data: [
                            data.statusSummary.find(item => item.status === 'Processing')?.count || 0,
                            data.statusSummary.find(item => item.status === 'Delivered')?.count || 0,
                            data.statusSummary.find(item => item.status === 'Canceled')?.count || 0
                        ],
                        backgroundColor: ['#ff6384', '#4bc0c0', '#ff9f40'],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Number of Orders' } }
                    }
                }
            });

            // Shipping Details Table
            const shippingTbody = document.getElementById('shippingDetails');
            shippingTbody.innerHTML = '';
            data.shippingDetails.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.O_id}</td>
                        <td>${item.C_id}</td>
                        <td>${item.customerAddress}</td>
                        <td>${item.customerPincode}</td>
                        <td>${item.deliveryPerson || 'N/A'}</td>
                    </tr>
                `;
                shippingTbody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching order report:', error));
}

// Export Order Report
function exportOrderReport(format) {
    const dateRange = document.getElementById('orderDateRange').value;
    const status = document.getElementById('orderStatusFilter').value;
    let startDate, endDate;

    const today = new Date();
    if (dateRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    } else if (dateRange === 'last7days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    } else if (dateRange === 'last30days') {
        endDate = today.toISOString().split('T')[0];
        startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    } else if (dateRange === 'custom') {
        startDate = document.getElementById('orderStartDate').value;
        endDate = document.getElementById('orderEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }
    }

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (status) queryParams.append('status', status);

    const endpoint = format === 'csv' ? '/report/export-order-report-csv' : '/report/export-order-report-pdf';
    const fileName = `order_report.${format}`;

    fetch(`${endpoint}?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Accept': format === 'csv' ? 'text/csv' : 'application/pdf' }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert(`Order report exported successfully as ${format.toUpperCase()}!`);
    })
    .catch(error => {
        console.error(`Error exporting order report as ${format}:`, error);
        alert(`Failed to export order report as ${format.toUpperCase()}.`);
    });
}

// CSV Report Generation (Optional)
document.getElementById('reportForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const status = document.getElementById('statusFilter').value;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (status) queryParams.append('status', status);

    try {
        const response = await fetch(`/order/orderdets/report?${queryParams.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'text/csv' }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders_report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert('Report generated successfully!');
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report.');
    }
});
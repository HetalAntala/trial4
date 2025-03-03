// orderdet.js
window.showOrderDetails = function(orderId) {
    fetch(`/order/orderdets/details/${orderId}`)
        .then(response => response.json())
        .then(data => {
            const modal = document.getElementById('order-details-modal');
            const orderDetails = document.getElementById('order-details');
            orderDetails.innerHTML = '';

            let total = 0;
            data.forEach(item => {
                total += item.quantity * item.price;
                orderDetails.innerHTML += `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.description}</td>
                        <td><img src="${item.image}" alt="${item.name}" width="50"></td>
                        <td>${item.quantity}</td>
                        <td>$${item.price}</td>
                        <td>${item.category}</td>
                    </tr>
                `;
            });

            modal.style.display = 'block';
        })
        .catch(error => console.error('Error fetching order details:', error));
};
// Helper function to format date
// function formatDate(dateString) {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
// }

// // Fetch and display orders
// function fetchOrders() {
//     fetch('/order/orderdets')
//         .then(response => {
//             console.log('Response Status:', response.status);
//             return response.json();
//         })
//         .then(data => {
//             console.log('Fetched Orders:', data);
//             const tableBody = document.querySelector('#orders-table tbody');
//             tableBody.innerHTML = '';

//             data.forEach(order => {
//                 const formattedDate = formatDate(order.O_date);
//                 const row = `
//                     <tr>
//                         <td>${order.O_id}</td>
//                         <td>${formattedDate}</td>
//                         <td>${order.O_status}</td>
//                         <td>${order.C_id}</td>
//                         <td>
//                             <button onclick="viewOrderDetails('${order.O_id}')">View</button>
//                         </td>
//                     </tr>
//                 `;
//                 tableBody.innerHTML += row;
//             });
//         })
//         .catch(error => console.error('Error fetching orders:', error));
// }

// Fetch and display orders with filter
function fetchOrders(statusFilter = '') {
    const url = statusFilter ? `/order/orderdets?status=${statusFilter}` : '/order/orderdets';
    
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Fetched Orders:', data);
            const tableBody = document.querySelector('#orders-table tbody');
            tableBody.innerHTML = '';

            data.forEach(order => {
                const formattedDate = formatDate(order.O_date);
                const row = `
                    <tr>
                        <td>${order.O_id}</td>
                        <td>${formattedDate}</td>
                        <td>${order.O_status}</td>
                        <td>${order.C_id}</td>
                        <td>
                            <button class="btn" onclick="viewOrderDetails('${order.O_id}')">View</button>
                            <button class="btn" onclick="openUpdateStatusModal('${order.O_id}', '${order.O_status}')">Update Status</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

// Filter orders based on status dropdown
document.addEventListener('DOMContentLoaded', () => {
    fetchOrders(); // Initial fetch without filter

    const statusFilter = document.getElementById('status-filter');
    statusFilter.addEventListener('change', (e) => {
        fetchOrders(e.target.value);
    });
});

// Helper function to format date (already provided)
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
// Open modal to update order status
function openUpdateStatusModal(orderId, currentStatus) {
    document.getElementById('update-order-id').value = orderId;
    document.getElementById('update-status').value = currentStatus;
    document.getElementById('updateStatusModal').style.display = 'block';
}

// Close modal
function closeUpdateStatusModal() {
    document.getElementById('updateStatusModal').style.display = 'none';
}

// Handle status update form submission
document.getElementById('updateStatusForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const orderId = document.getElementById('update-order-id').value;
    const newStatus = document.getElementById('update-status').value;

    try {
        const response = await fetch(`/order/orderdets/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status');
        const result = await response.json();

        if (result.success) {
            alert('Order status updated successfully!');
            closeUpdateStatusModal();
            fetchOrders(document.getElementById('status-filter').value); // Refresh orders
        } else {
            alert('Failed to update status: ' + result.error);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
});
// View order details
function viewOrderDetails(orderId) {
    const orderDetailsContainer = document.getElementById("order-details");
    orderDetailsContainer.innerHTML = "";

    fetch(`/order/orderdets/${orderId}/details`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then((details) => {
            console.log("Order Details:", details);

            if (!Array.isArray(details)) {
                orderDetailsContainer.innerHTML = `<tr><td colspan="7">${details.error || 'Unexpected response'}</td></tr>`;
                document.getElementById('order-details-modal').style.display = 'block';
                return;
            }

            if (details.length === 0) {
                orderDetailsContainer.innerHTML = `<tr><td colspan="7">No details found for this order.</td></tr>`;
                document.getElementById('order-details-modal').style.display = 'block';
                return;
            }

            details.forEach((detail) => {
                const row = `
                    <tr>
                        <td>${detail.Odetails_id}</td>
                        <td>${detail.product_name || 'N/A'}</td>
                        <td>${detail.description || 'N/A'}</td>
                        <td><img src="${detail.image}" alt="${detail.product_name || 'Product'}" width="100" onerror="this.onerror=null; this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';"></td>
                        <td>${detail.O_Qty}</td>
                        <td>${detail.O_price}</td>
                        <td>${detail.category_name || 'N/A'}</td>
                    </tr>
                `;
                console.log(`Rendering image for product ${detail.Odetails_id}: ${detail.image}`);
                orderDetailsContainer.innerHTML += row;
            });
            document.getElementById('order-details-modal').style.display = 'block';
        })
        .catch((error) => {
            console.error("Error fetching order details:", error);
            orderDetailsContainer.innerHTML = `<tr><td colspan="7">Error loading details: ${error.message}</td></tr>`;
            document.getElementById('order-details-modal').style.display = 'block';
        });
}

function closeModal() {
    document.getElementById('order-details-modal').style.display = 'none';
}

// Fetch orders on page load
document.addEventListener('DOMContentLoaded', fetchOrders);

// ✅ Fetch Orders (Admin Panel)
async function fetchOrders1() {
    try {
        const response = await fetch('/admin/orders');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error("Invalid response format: Expected an array");
        }

        const tableBody = document.getElementById("delivery-table-body");
        tableBody.innerHTML = "";

        data.forEach(order => {
            const assigned = order.d_name ? order.d_name : "Not Assigned";
            tableBody.innerHTML += `
                <tr>
                    <td>${order.O_id}</td>
                    <td>${order.customer_name || "Unknown"}</td>
                    <td>${order.status}</td>
                    <td>${assigned}</td>
                    <td>
                        ${assigned === "Not Assigned" ? 
                            `<button onclick="openAssignDeliveryModal('${order.O_id}')">Assign</button>` 
                            : "Assigned"}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

// Call the function
fetchOrders1();

// ✅ Open Assign Delivery Modal
async function openAssignDeliveryModal(orderId) {
    document.getElementById("assign-order-id").value = orderId;

    const response = await fetch('/admin/delivery-persons');
    const persons = await response.json();
    const deliverySelect = document.getElementById("delivery-person");

    deliverySelect.innerHTML = `<option value="">Select Delivery Person</option>`;
    persons.forEach(person => {
        deliverySelect.innerHTML += `<option value="${person.d_id}">${person.d_name}</option>`;
    });

    document.getElementById("assignDeliveryModal").style.display = "block";
}

// ✅ Close Modal
function closeAssignDeliveryModal() {
    document.getElementById("assignDeliveryModal").style.display = "none";
}

// ✅ Assign Delivery Person
document.getElementById("assignDeliveryForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const orderId = document.getElementById("assign-order-id").value;
    const deliveryPersonId = document.getElementById("delivery-person").value;

    await fetch("/admin/assign-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, deliveryPersonId })
    });

    closeAssignDeliveryModal();
    fetchOrders1();
});



// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Fetch and display orders
function fetchOrders() {
    fetch('/order/orderdets')
        .then(response => {
            console.log('Response Status:', response.status);
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
                            <button onclick="viewOrderDetails('${order.O_id}')">View</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

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

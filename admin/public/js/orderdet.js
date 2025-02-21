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

document.addEventListener('DOMContentLoaded', fetchOrders);



// View order details
function viewOrderDetails(orderId) {
    // Clear existing order details
    document.getElementById("order-details").innerHTML= ""; 

    fetch(`/order/orderdets/${orderId}/details`)
        .then((response) => response.json())
        .then((details) => {
            const uniqueDetails = details.filter((value, index, self) => 
                index === self.findIndex((t) => (
                    t.Odetails_id === value.Odetails_id
                ))
            );
            console.log("Order Details:", details);
            if (Array.isArray(details) && details.length > 0) {
                uniqueDetails.forEach((detail) => {
                    let row = `
                            <tr>
                                <td>${detail.Odetails_id}</td>
                                <td>${detail.product_name || 'N/A'}</td>
                                <td>${detail.description || 'N/A'}</td>
                                <td> <img src="${detail.image || 'default.jpg'}" alt="${detail.product_name}" width="100"></td>
                                <td>${detail.O_Qty}</td>
                                <td>${detail.O_price}</td>
                                <td>${detail.category_name || 'N/A'}</td>
                            </tr>
                        `;
                        document.getElementById("order-details").innerHTML += row;
                });
            } else {
                orderDetailsContainer.innerHTML = `<tr><td colspan="7">No details found for this order.</td></tr>`;
            }
        })
        .catch((error) => {
            console.error("Error fetching order details:", error);
        });
}



// Close Modal
function closeModal() {
    const modal = document.getElementById('order-details-modal');
    modal.style.display = 'none';
}

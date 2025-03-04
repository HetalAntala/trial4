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

        console.log("Fetched Orders:", data);

        const tableBody = document.getElementById("delivery-table-body");
        tableBody.innerHTML = "";

        data.forEach(order => {
            const assigned = order.d_name ? order.d_name : "Not Assigned";
            console.log(`Order ${order.O_id}: Assigned = ${assigned}, Delivery Person = ${order.d_name}`);
            tableBody.innerHTML += `
                <tr>
                    <td>${order.O_id}</td>
                    <td>${order.customer_name || "Unknown"}</td>
                    <td>${order.status}</td>
                    <td>${assigned}</td>
                    <td>
                        ${assigned === "Not Assigned" ? 
                            `<button onclick="openAssignDeliveryModal('${order.O_id}')">Assign</button>` 
                            : `<button onclick="unassignDelivery('${order.O_id}')">Unassign</button>`}
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

async function unassignDelivery(orderId) {
    if (!confirm("Are you sure you want to unassign the delivery person?")) return;

    try {
        const response = await fetch("/admin/unassign-delivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            alert(result.message);
            fetchOrders1();
        } else {
            throw new Error("Failed to unassign delivery person");
        }
    } catch (error) {
        console.error("Error unassigning delivery person:", error);
        alert("Failed to unassign delivery person. Please try again.");
    }
}

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

    try {
        const response = await fetch("/admin/assign-delivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, deliveryPersonId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            alert(result.message); // "Delivery person assigned successfully"
            closeAssignDeliveryModal();
            fetchOrders1();
        } else {
            throw new Error("Failed to assign delivery person");
        }
    } catch (error) {
        console.error("Error assigning delivery person:", error);
        alert("Failed to assign delivery person. Please try again.");
    }
});
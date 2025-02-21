// Fetch data from backend and display in the table
const fetchCustomers = async () => {
    try {
        const response = await fetch('/customers');
        const customers = await response.json();
        const tableBody = document.getElementById('customer-table-body');
        tableBody.innerHTML = ''; // Clear existing data

        customers.forEach(customer => {
            const row = `
                <tr>
                    <td>${customer.c_id}</td>
                    <td>${customer.c_username}</td>
                    <td>${customer.c_email}</td>
                    <td>${customer.c_mobile}</td>
                    <td>${customer.c_address}</td>
                    <td>${customer.c_pincode}</td>
                    <td>${customer.Area_id}</td>
                    <td id="status-${customer.c_id}">${customer.c_status}</td>
                    <td>
                        <button class="btn" onclick="toggleEditStatus('${customer.c_id}', '${customer.c_status}')">Edit</button>
                        <button class="btn" onclick="deleteCustomer('${customer.c_id}')">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
};

  
// Function to toggle status dropdown
const toggleEditStatus = (c_id, currentStatus) => {
    const statusCell = document.getElementById(`status-${c_id}`);
    
    // Check if the element exists before setting innerHTML
    if (statusCell) {
        statusCell.innerHTML = `
            <select id="status-select-${c_id}" onchange="updateStatus('${c_id}')">
                <option value="active" ${currentStatus === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${currentStatus === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
        `;
    } else {
        console.error(`Element with ID status-${c_id} not found.`);
    }
};

// Ensure the script runs after DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchCustomers);


// Function to update status in database
const updateStatus = async (c_id) => {
    const newStatus = document.getElementById(`status-select-${c_id}`).value;
    try {
        const response = await fetch(`/customers/${c_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ c_status: newStatus }),
        });

        if (response.ok) {
            alert('Status updated successfully!');
            fetchCustomers(); // Refresh the table
        } else {
            alert('Failed to update status.');
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
};
  // Call the function when the page loads
  window.onload = fetchCustomers;
  
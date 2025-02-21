var username = document.getElementById("username");
var userdesc = document.getElementById("userdescription");

fetch("/user/profile")
  .then((response) => {
    if (response.status === 401) {
      // Create the login link
      var login = document.createElement("a");
      login.href = "../html/login.html";
      login.textContent = "Login";
      userdesc.innerHTML += "<br><br>";
      userdesc.appendChild(login);
      throw new Error("Unauthorized"); // Stop further processing
    } else {
      return response.json(); // Parse the response as JSON
    }
  })
  .then((data) => {
    // Check if data is defined and has the expected structure
    if (data && data.c_username) {
      username.innerHTML += data.c_username;
      fetch("/orders/customer/orders") // Replace with your actual API endpoint
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok.");
          }
          return response.json();
        })
        .then((orders) => {
          // Clear any existing rows in the table
          const orderTableBody = document.getElementById("orderTableBody");
          orderTableBody.innerHTML = "";

          // Iterate over the orders and create table rows
          orders.forEach((order) => {
            const row = document.createElement("tr");

            // Create table cells
            const orderIdCell = document.createElement("td");
            orderIdCell.textContent = `#${order.O_ID}`;

            const dateCell = document.createElement("td");
            dateCell.textContent = new Date(order.O_DATE).toLocaleDateString();

            const statusCell = document.createElement("td");
            statusCell.textContent = order.O_STATUS;

            const totalCell = document.createElement("td");
            totalCell.textContent = `Rs. ${order.ODETAILS_PRICE.toFixed(2)}`;

            const actionsCell = document.createElement("td");
            const viewLink = document.createElement("a");
            viewLink.href = `#`; // Replace with actual link if needed
            viewLink.classList.add("view__order");
            viewLink.textContent = "View";
            actionsCell.appendChild(viewLink);

            // Append cells to the row
            row.appendChild(orderIdCell);
            row.appendChild(dateCell);
            row.appendChild(statusCell);
            row.appendChild(totalCell);
            row.appendChild(actionsCell);

            // Append row to the table body
            orderTableBody.appendChild(row);
          });
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
        });
    } else {
      console.error("Invalid data structure:", data);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function logout() {
  fetch("/user/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.text(); // Parse the response as plain text
    })
    .then((data) => {
      alert("Logout successful: " + data);
      // Optionally, redirect to the login page or another page
      window.location.href = "/";
    })
    .catch((error) => {
      console.log("Error: ", error);
      alert("Error: " + error.message);
    });
}

function updateUser() {
  var updateuname = document.getElementById("updateuname").value;
  var updateemail = document.getElementById("updateemail").value;
  var updateuaddress = document.getElementById("updateuaddress").value;
  var updatepincode = document.getElementById("updatepincode").value;
  var updatembno = document.getElementById("updatembno").value;
  var profileData = {
    username: updateuname,
    email: updateemail,
    address: updateuaddress,
    pincode: updatepincode,
    mobile: updatembno,
  };

  fetch("/user/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData), // Convert the profile data to a JSON string
  })
    .then((response) => {
      if (!response.ok) {
        // If the response status is not OK, handle the error
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
      // Ensure the data contains the expected fields
      if (data.message) {
        var up = document.getElementById("updateprofile");
        up.textContent = "Profile Updated Successfully!"; // Update the message
      } else {
        throw new Error("Unexpected response format");
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      alert("Error updating profile: " + error.message);
    });
}

function changepass() {
  var cpass = document.getElementById("cpass").value;
  var npass = document.getElementById("npass").value;
  var cnpass = document.getElementById("cnpass").value;

  const passwordData = {
    currentPassword: cpass,
    newPassword: npass,
    confirmPassword: cnpass,
  };
  fetch("/user/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData), // Convert the password data to a JSON string
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
        alert("Password Updated Successfully!");
    })
    .catch((error) => {
      console.log("Error:", error);
      alert("Error updating password: " + error.message);
    });
}

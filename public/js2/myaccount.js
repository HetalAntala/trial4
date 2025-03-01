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
      throw new Error("Unauthorized");
    } else {
      return response.json();
    }
  })
  .then((data) => {
    if (data && data.c_username) {
      username.innerHTML += data.c_username;

      fetch("/order/customer/orders")
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("order_image").src = "../" + data.image;
          document.getElementById("order_name").innerHTML = data.name.replace(
            /_/g,
            " "
          );
          document.getElementById("order_price").innerHTML += data.price;
          document.getElementById("order_id").innerHTML += data.o_id;
          document.getElementById("order_date").innerHTML += new Date(
            data.o_date
          ).toLocaleDateString("en-GB");
          document.getElementById("order_status").innerHTML += data.o_status;
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
        alert("Profile Updated Successfully!"); // Update the message
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

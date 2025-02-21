document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login').addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent the default form submission
  
      const email = document.getElementById('cemail').value;
      const password = document.getElementById('cpassword').value;
  
      const loginData = {
        email: email,
        password: password
      };
  
      loginUser(loginData);
    });
  });
  
  function loginUser(loginData) {
    fetch("/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData), // Convert the login data to a JSON string
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl; // Redirect to index.html
        } else {
          alert("Login successful: " + data.message);
        }
      })
      .catch((error) => {
        console.log("Error: ", error);
        alert("Error: " + error.message);
      });
  }
  
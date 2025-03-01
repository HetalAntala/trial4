document.addEventListener("DOMContentLoaded", function () {
    // Login form submission
    document.getElementById("login").addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission
  
      const email = document.getElementById("cemail").value.trim();
      const password = document.getElementById("cpassword").value.trim();
  
      let isValid = true;
      
      // Validation criteria
      const validEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
      // Clear previous error message
      document.getElementById("error_message_email").textContent = "";
  
      // Email validation
      if (!validEmailPattern.test(email)) {
        document.getElementById("error_message_email").textContent = "Please enter a valid email address.";
        isValid = false;
      }
  
      // If validation passes, proceed with login
      if (isValid) {
        const loginData = {
          email: email,
          password: password,
        };
  
        loginUser(loginData);
      } else {
        console.log("Login validation failed");
      }
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
  })
    // Registration form submission
  document
    .getElementById("register")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission

      const uname = document.getElementById("un").value.trim();
      const email = document.getElementById("em").value.trim();
      const password = document.getElementById("pw").value.trim();
      const address = document.getElementById("ad").value.trim();
      const pincode = document.getElementById("pc").value.trim();
      const mobile = document.getElementById("mb").value;
      const form = document.getElementById("register");

      let isValid = true;

      // Validation criteria
      const minLength = 3;
      const maxLength = 50;
      const validUsernamePattern = /^[a-zA-Z0-9 ]+$/;
      const validEmailPattern =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const validMobilePattern = /^[0-9]{10}$/;
      const validPincodePattern = /^[0-9]$/;

      // Clear previous error messages
      document.getElementById("error_message1").textContent = "";
      document.getElementById("error_message2").textContent = "";
      document.getElementById("error_message3").textContent = "";
      document.getElementById("error_message4").textContent = "";
      document.getElementById("error_message5").textContent = "";
      document.getElementById("error_message6").textContent = "";
      // Username validation
      if (uname === "") {
        document.getElementById("error_message1").textContent =
          "Username is required.";
        isValid = false;
      } else if (uname.length < minLength) {
        document.getElementById(
          "error_message1"
        ).textContent = `Username must be at least ${minLength} characters long.`;
        isValid = false;
      } else if (uname.length > maxLength) {
        document.getElementById(
          "error_message1"
        ).textContent = `Username must be no more than ${maxLength} characters long.`;
        isValid = false;
      } else if (!validUsernamePattern.test(uname)) {
        document.getElementById("error_message1").textContent =
          "Username can only contain letters and numbers.";
        isValid = false;
      }

      // Email validation
      if (email === "") {
        document.getElementById("error_message2").textContent =
          "Email is required.";
        isValid = false;
      } else if (!validEmailPattern.test(email)) {
        document.getElementById("error_message2").textContent =
          "Please enter a valid email address.";
        isValid = false;
      }

      // Mobile validation
      if (mobile === "") {
        document.getElementById("error_message3").textContent =
          "Mobile number is required.";
        isValid = false;
      } else if (!validMobilePattern.test(mobile)) {
        document.getElementById("error_message3").textContent =
          "Please enter a valid mobile number.";
        isValid = false;
      }

      // Address validation
      if (address === "") {
        document.getElementById("error_message4").textContent =
          "Address is required.";
        isValid = false;
      } else if (address.length < 10) {
        document.getElementById("error_message4").textContent =
          "Address must be at least 10 characters long.";
        isValid = false;
      } else if (address.length > 100) {
        document.getElementById("error_message4").textContent =
          "Address must be no more than 100 characters long.";
        isValid = false;
      }

      // Password validation
      if (password === "") {
        document.getElementById("error_message6").textContent =
          "Password is required.";
        isValid = false;
      } else if (password.length < 8) {
        document.getElementById("error_message6").textContent =
          "Password must be at least 8 characters long.";
        isValid = false;
      }

      // If all validations pass, submit the form
      if (isValid) {
        const RegisterData = {
          username: uname,
          email: email,
          password: password,
          address: address,
          pincode: pincode,
          mobile: mobile,
        };

        RegisterUser(RegisterData);
      }
    });

  function RegisterUser(RegisterData) {
    fetch("/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(RegisterData), // Convert the register data to a JSON string
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
        if (data.error) {
          document.getElementById("error_message7").textContent = data.error;
        }
        alert("Registration successful");
        window.location.reload();
      })
      .catch((error) => {
        console.log("Error: ", error);
        alert("Error: " + error.message);
      });
  } 

async function loadNav() {
  try {
    const response = await fetch("/header");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    document.getElementById("nav").innerHTML = data;
    console.log("Navigation loaded successfully");
  } catch (error) {
    console.error("Error loading navigation:", error);
    document.getElementById("nav").innerHTML =
      "<p>Failed to load navigation.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadNav);


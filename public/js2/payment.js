let orderId;
let currency;

document.addEventListener("DOMContentLoaded", function () {
  orderId = localStorage.getItem("orderID");
  if (orderId) {
    console.log("Order ID:", orderId);

    // Fetch payment details
    fetch(`/payment/${orderId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Payment details:", data);
        document.getElementById(
          "address"
        ).innerHTML = `${data.S_ADDRESS}<br>${data.S_PINCODE}<br>${data.S_CONTACTNO}`;

        const orderSummaryDiv = document.getElementById("order-summary");
        orderSummaryDiv.innerHTML = `
          <h2>Order Summary</h2>
          <div><strong>Order ID:</strong> ${data.O_ID}</div>
          <div><strong>Order Date:</strong> ${data.O_DATE}</div>
          <div><strong>Order Status:</strong> ${data.O_STATUS}</div>
          <div><strong>Customer ID:</strong> ${data.C_ID}</div><br>
          <h3>Products</h3>
          <ul>
            <li>Product ID : ${data.ODETAILS_ID}, Quantity : ${data.ODETAILS_QTY}, Price : ${data.ODETAILS_PRICE}, Total Cost: ${data.Total_Product_Cost}</li>
          </ul>
        `;
        currency = data.Total_Product_Cost;
        document.getElementById(
          "price"
        ).innerHTML = `&#8377;${data.ODETAILS_PRICE}`;
        document.getElementById(
          "total"
        ).innerHTML = `&#8377;${data.Total_Product_Cost}`;
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });

    const paymentForm = document.getElementById("payment-form");
    const passwordContainer = document.getElementById("password-container");
    const qrCodeContainer = document.getElementById("qr-code-container");
    const qrCodeImage = document.getElementById("qr-code-image");
    const qrRadioButton = document.getElementById("qr");
    const submitPasswordButton = document.getElementById("submit-password");
    const confirmOrderButton = document.getElementById("confirm-order");

    let userEmail = null;

    // Fetch user email
    fetch("/user/profile")
      .then((response) => response.json())
      .then((data) => {
        userEmail = data.c_email;
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });

    if (
      paymentForm &&
      qrRadioButton &&
      submitPasswordButton &&
      confirmOrderButton
    ) {
      paymentForm.addEventListener("change", function (event) {
        if (event.target.value === "qr") {
          passwordContainer.style.display = "block";
          confirmOrderButton.disabled = true; // Disable the Confirm Order button
        } else {
          passwordContainer.style.display = "none";
          qrCodeContainer.style.display = "none";
          confirmOrderButton.disabled = false; // Enable the Confirm Order button
        }
      });

      submitPasswordButton.addEventListener("click", function () {
        const password = document.getElementById("password").value;

        fetch("/user/verify-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail, password: password }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                "Network response was not ok " + response.statusText
              );
            }
            return response.json();
          })
          .then((data) => {
            if (data.message === "Password verified successfully") {
              qrCodeContainer.style.display = "block";
              passwordContainer.style.display = "none";
              confirmOrderButton.disabled = false; // Enable the Confirm Order button after successful payment

              // Fetch and display the QR code with dynamic payment details
              fetch("/payment/generate-qr-code", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId: orderId, currency: currency }), // Send the order ID to fetch dynamic payment details
              })
                .then((response) => response.json())
                .then((data) => {
                  qrCodeImage.src = data.qrCodeURL;
                })
                .catch((error) => {
                  console.error("Error generating QR code:", error);
                });
            } else {
              alert("Incorrect password. Please try again.");
            }
          })
          .catch((error) => {
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
          });
      });

      confirmOrderButton.addEventListener("click", function () {
        window.location.href = "/orderPlaced.html";
      });
    } else {
      console.error("Some elements are missing in the HTML.");
    }
  } else {
    console.error("Order ID not found!");
  }
});

function handleConfirmOrder() {
  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;

  let paymentStatus = "UNPAID";
  if (paymentMethod === "qr") {
    paymentStatus = "PAID";
  }

  fetch("/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      PY_MODE: paymentMethod.toUpperCase(),
      PY_DATE: new Date().toISOString().split("T")[0],
      PY_STATUS: paymentStatus,
      PY_AMOUNT: currency,
      O_ID: orderId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.text();
    })
    .then((data) => {
      console.log("Payment creation response:", data);
      // Redirect to order placed page or handle response as needed
      window.location.href = "/orderPlaced.html";
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

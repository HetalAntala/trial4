var uname = document.getElementById("name");
var email = document.getElementById("email");
var address = document.getElementById("checkout_address");
var city = document.getElementById("city");
var state = document.getElementById("state");
var pincode = document.getElementById("pincode");
var mobile = document.getElementById("mobile");

// Fetch user profile and initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch user profile
    const profileResponse = await fetch("/user/profile");
    const profileData = await profileResponse.json();

    if (profileData) {
      uname.value = profileData.c_username;
      email.value = profileData.c_email;
      address.value = profileData.c_address;
      city.value = profileData.city;
      state.value = profileData.PostOfficeName;
      pincode.value = profileData.c_pincode;
      mobile.value = profileData.c_mobile;
      // Fetch cart data
      const response = await fetch("cart/user"); // Replace with your API endpoint
      const cartData = await response.json();
      console.log(cartData);

      const itemSummary = document.getElementById("item_summary");
      let subtotal = 0;

      cartData.forEach((item) => {
        const li = document.createElement("li");
        li.classList.add("box2");

        const itemDetails = document.createElement("div");
        itemDetails.classList.add("cart_total_title");
        itemDetails.innerHTML = `
          <strong style="text-decoration: underline;">Product : </strong>   ${
            item.name
          }<br>
          <strong style="text-decoration: underline;">Quantity : </strong>   ${
            item.CA_QTY
          }<br>
          <strong style="text-decoration: underline;">Price (Per Unit) : </strong>   ₹${
            item.price
          }<br>
          <strong style="text-decoration: underline;">Subtotal : </strong>   ₹${(
            item.price * item.CA_QTY
          ).toFixed(2)}
        `;

        li.appendChild(itemDetails);
        itemSummary.appendChild(li);

        subtotal += item.price * item.CA_QTY;
      });

      const totalAmount = subtotal;
      document.getElementById(
        "total_amount"
      ).textContent = `₹${totalAmount.toFixed(2)}`;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// Add event listener for continueForPayment button
document
  .getElementById("continueForPayment")
  .addEventListener("click", placeOrder);

// Add event listener for continueForPayment button
document
  .getElementById("continueForPayment")
  .addEventListener("click", placeOrder);

function placeOrder(event) {
  event.preventDefault();

  const s_add = document.getElementById("checkout_address").value;
  const s_pc = document.getElementById("pincode").value;
  const s_no = document.getElementById("mobile").value;

  fetch("/order/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      s_add: s_add,
      s_pc: s_pc,
      s_cno: s_no,
    }),
  })
    .then((response) => {
      console.log("Response status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if (data.status === 200) {
        localStorage.setItem("orderID", data.orderID);
        window.location.href = "/payment.html"; // Redirect to the payment page
      } else {
        alert("Order not placed!");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Order not placed due to some error!");
    });
}

// Function to fetch and load wishlist data
function fetchWishlist() {
  fetch("/wishlist/user")
    .then((response) => {
      // Check if the status is 400 or 401
      if (response.status === 400 || response.status === 401) {
        return response.json().then((data) => {
          const messageElement = document.getElementById("message");
          messageElement.innerHTML = data.message;
        });
      }
      return response.json();
    })
    .then((data) => {
      const wishlistContainer = document.getElementById("wishlist-container");

      if (!wishlistContainer) {
        console.error("Wishlist container not found!");
        return;
      }

      function loadWishlist() {
        wishlistContainer.innerHTML = "";
        data.forEach((item) => {
          wishlistContainer.innerHTML += `
                    <tr data-wishlist-id="${item.w_id}">
                        <td><img src="${item.image}" alt="${item.name}" width="50"></td>
                        <td><a href="/product.html?product=${item.name}">${item.name}</a></td>
                        <td>${item.price}</td>
                        <td><button onclick="removeFromWishlist('${item.w_id}');updateCartAndWishlistCounts();">Remove</button></td>
                        <td><button class="add-btn" onclick="addToCart('${item.w_id}','1');updateCartAndWishlistCounts();">Add to Cart</button></td>
                    </tr>
                `;
        });
      }

      loadWishlist();
    })
    .catch((error) => {
      // Only log other types of errors
      if (error !== "Error status: 400" && error.status == "401") {
        console.error("Error:", error);
      }
    });
}

function removeFromWishlist(wishlistId) {
  fetch("/wishlist/remove", {
    method: "DELETE", // or "DELETE" if your server supports it
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wishlistId: wishlistId }), // Send the wishlist ID
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((message) => {
      const messageElement = document.getElementById("message");
      messageElement.innerHTML = message.message; // Display the server response

      // Optionally, remove the item from the DOM
      const row = document.querySelector(
        `tr[data-wishlist-id='${wishlistId}']`
      );
      if (row) {
        row.remove();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      const messageElement = document.getElementById("message");
      messageElement.innerHTML = "An error occurred. Please try again.";
    });
}

function addToCart(wishlistId, quantity) {
  fetch("/wishlist/moveToCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ wishlistId: wishlistId, quantity: quantity }), // Send the wishlist ID and quantity
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
      return response.json(); // Get the response text
    })
    .then((data) => {
      const messageElement = document.getElementById("message");
      if (messageElement) {
        messageElement.innerHTML = data.message; // Display the server response
      } else {
        console.error("Element with class 'message' not found!");
      }

      // Optionally, remove the item from the DOM
      const row = document.querySelector(
        `tr[data-wishlist-id='${wishlistId}']`
      );
      if (row) {
        row.remove();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      const messageElement = document.getElementById("message");
      if (messageElement) {
        messageElement.innerHTML = error.message; // Display the error message
      } else {
        console.error("Element with class 'message' not found!");
      }
    });
}
// Fetch the wishlist data when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  fetchWishlist();
});

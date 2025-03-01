let fdata = [];

function loadCart(data) {
  const cartitem = document.getElementById("cart-items");
  if (!cartitem) {
    const message = document.getElementById("message");
    message.innerHTML = "Cart items container not found!";
    return;
  }

  cartitem.innerHTML = "";
  let Stotal = 0;

  data.forEach((item) => {
    cartitem.innerHTML += `
      <tr data-cart-id="${item.CA_ID}">
        <td><img src="${item.image}" alt="${item.name}" width="50"></td>
        <td><a href="/product.html?product=${item.name}">${item.name}</a></td>
        <td>${item.price}</td>
        <td><input type="number" value="${item.CA_QTY}" id="qty_num${item.CA_ID}" style="width:30px;" onchange="updatecart('${item.CA_ID}', this.value)"></td>
        <td>${item.total}</td>
        <td><button onclick="removeFromCart('${item.CA_ID}'); updateCartAndWishlistCounts();">Remove</button></td>
      </tr>
    `;
    Stotal += item.total;
    fdata=data;
  });

  const total = document.getElementById("total");
  total.innerHTML = "Total : &#8377; " + Stotal;
}

fetch("/cart/user")
  .then((response) => response.json())
  .then((data) => {
    if (data.length > 0) {
      loadCart(data);
    } else {
      document.getElementById("message").innerHTML = data.error;
    }
  })
  .catch((error) => {
    const message = document.getElementById("message");
    message.innerHTML = `Error loading cart items: ${error.message}`;
  });

function updatecart(id, newQty) {
  // Find the item in the data array
  const item = fdata.find((item) => item.CA_ID === id);
  if (item) {
    item.CA_QTY = parseInt(newQty, 10);
    item.total = item.CA_QTY * item.price;
    const Stotal = fdata.reduce((sum, item) => sum + item.total, 0);

    // Update the database
    fetch("/cart/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ CA_ID: id, qty: item.CA_QTY }),
    })
      .then((response) => response.json())
      .then((data) => {
        loadCart(fdata);
      })
      .catch((error) => {
        console.error("Error updating database:", error);
        const message = document.getElementById("message");
        message.innerHTML = "Error updating the cart. Please try again.";
      });
  } else {
    console.error("Item not found in cart");
  }
}
function removeFromCart(CA_ID) {
  const itemIndex = fdata.findIndex((item) => item.CA_ID === CA_ID);
  if (itemIndex !== -1) {
    // Remove the item from the data array
    fdata.splice(itemIndex, 1);

    // Update the database
    fetch("/cart/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartId: CA_ID }), // Ensure the correct parameter name
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          document.getElementById("message").innerHTML = data.message;
          loadCart(fdata);
        } else {
          console.error("Error removing item:", data);
        }
      })
      .catch((error) => {
        console.error("Error removing item from database:", error);
        const message = document.getElementById("message");
        message.innerHTML =
          "Error removing the item from the cart. Please try again.";
      });
  }
}

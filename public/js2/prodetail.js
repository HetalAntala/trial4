// Function to get the product name from the URL
function getProductNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("product");
}
var prodid;

// Fetching product details using the product name from the URL
const productName = getProductNameFromURL();
fetch(`/product/${productName}`)
  .then((response) => response.json())
  .then((data) => {
    prodid = data.productId;
    document.getElementById("product-title").textContent = data.name;
    document.getElementById("product-price").textContent += data.price;
    document.getElementById("product-description").innerHTML = data.description;
    document.getElementById("featured-image").src = "../" + data.images[0];
    const reviewContainer = document.getElementById("review-container");

    // Clear any existing content in the review container
    reviewContainer.innerHTML = "";

    // Loop through the feedback array and create elements to display the feedback
    data.feedback.forEach((feedback) => {
      const reviewElement = document.createElement("div");
      reviewElement.classList.add("review");

      reviewElement.innerHTML = `
    <div class="profile">
      <strong>${feedback.username}</strong>
      <div class="date">${new Date(feedback.f_date).toLocaleDateString(
        "en-GB"
      )}</div>
      <div class="comment">${feedback.f_desc}</div>
    </div>
  `;

      reviewContainer.appendChild(reviewElement);
    });

    const thumbnailContainer = document.getElementById("thumbnail-container");
    data.images.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = "../" + src;
      img.alt = `Thumbnail ${index + 1}`;
      img.classList.add("small-img");
      img.addEventListener("click", () => {
        document.getElementById("featured-image").src = "../" + src;
      });
      thumbnailContainer.appendChild(img);
    });
  });
function wishlist() {
  fetch("/wishlist/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prodid: prodid }),
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
      document.getElementById("message").innerHTML = data.message;
    })
    .catch((error) => {
      const errorObj = JSON.parse(error.message);
      const messageElement = document.getElementById("message");
      messageElement.innerHTML = errorObj.error;
    });
}
const quantity = document.getElementById("quantity");
let quantityValue;
function addtocart() {
  quantityValue = quantity.valueAsNumber;
  if (isNaN(quantityValue) || quantityValue <= 0) {
    quantityValue = 1; // Set default value to 1 if the input is invalid
  }
  fetch("/cart/addFromProduct", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prodname: productName,
      quantity: quantityValue,
    }),
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
      document.getElementById("message").innerHTML = data.message;
    })
    .catch((error) => {
      const errorObj = JSON.parse(error.message);
      const messageElement = document.getElementById("message");
      messageElement.innerHTML = errorObj.message;
    });
}

fetch("/best-selling")
  .then((response) => response.json())
  .then((data) => {
    displayNewArrivals(data);
  });
const displayNewArrivals = (data) => {
  const productContainer = document.getElementById("newarrival-container");
  productContainer.innerHTML = "";

  if (data && data.forEach) {
    data.forEach((item) => {
      const productHTML = `
          <div class="product-card">
            <a href="/product.html?product=${item.P_NAME}">
              <img src="../${item.PATH1}" alt="${item.P_NAME}">
              <h3 class="product-name">${item.P_NAME}</h3>
              <p class="product-price">₹${item.P_PRICE}</p>
            </a>
          </div>
        `;
      productContainer.innerHTML += productHTML;
    });
  } else {
    console.error("Error: new arrivals is not an array or undefined");
  }
};

// const reviewContainer = document.getElementById("review-container");
// let totalRating = 0;
// const product = [
//   {
//     id: 1,
//     name: "aaa",
//     price: 599,
//     category: "Plant",
//     image: "../Database(image)/Plant/P0001/1.jpg",
//     rating: 4.5,
//     isBestseller: true,
//     isNewArrival: false,
//     reviews: 3,
//   },
//   {
//     id: 2,
//     name: "bbb",
//     price: 999,
//     category: "Plant",
//     image: "../Database/Plant/P0001/2.jpg",
//     rating: 4.7,
//     isBestseller: true,
//     isNewArrival: false,
//     reviews: 2,
//   },
// ];
// for (let i = 0; i < product.length; i++) {
//   if (Array.isArray(product[i].reviews)) {
//     product[i].reviews.forEach((review) => {
//       totalRating += review.rating;
//       const reviewElement = document.createElement("div");
//       reviewElement.classList.add("profile");
//       reviewElement.innerHTML = `
//         <div class="thumb-name">
//           <img src=  "../Database(image)/Plant/P0001/1.jpg" alt="">
//             <div class="grouping">
//                 <strong>${review.name}</strong>
//                 <div class="ratingg">${"⭐".repeat(review.rating)}</div>
//                 <div class="date">${review.date}</div>
//             </div>
//         </div>
//         <div class="comment">${review.comment}</div>
//         <p class="gray">${review.desc}</p>
//       `;
//       reviewContainer.appendChild(reviewElement);
//     });
//   }
// }

// Calculate average rating
// const averageRating = (totalRating / product.reviews.length).toFixed(1);
// document.getElementById("average-rating").textContent = `${averageRating} ⭐`;
// document.getElementById(
//   "total-reviews"
// ).textContent = `${product.reviews.length} Reviews`;
// document.getElementById("review-count").textContent = product.reviews.length;

// // Tab switching functionality
// document.querySelectorAll(".tab-link").forEach((tab) => {
//   tab.addEventListener("click", () => {
//     // Remove active class from all tabs & sections
//     document
//       .querySelectorAll(".tab-link")
//       .forEach((t) => t.classList.remove("active"));
//     document
//       .querySelectorAll(".product-about")
//       .forEach((content) => content.classList.remove("active"));

//     // Activate clicked tab and corresponding section
//     tab.classList.add("active");
//     document.getElementById(tab.dataset.id).classList.add("active");
//   });
// });
// function displayProducts1(containerId) {
//   const container = document.getElementById(containerId);
//   container.innerHTML = ""; // Clear previous products

//   products1.forEach((product) => {
//     const productCard = document.createElement("div");
//     productCard.className = "product-card";
//     productCard.innerHTML = `
//       <a href="/product.html?product=${product.name}">
//       <img src="${product.image}" alt="${product.name}">
//       <h3>${product.name}</h3>
//       <p>Rating: ${product.rating} ⭐</p>
//       <p>Price: $${product.price}</p>
//       </a>
//     `;
//     container.appendChild(productCard);
//   });
// }
// displayProducts1("newarrival-container");

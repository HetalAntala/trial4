// Function to Fetch and Display Products
async function fetchAndDisplayProducts(endpoint, containerId) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const products = await response.json();
        const container = document.getElementById(containerId);
        container.innerHTML = ""; // Clear previous content

        if (products.length === 0) {
            container.innerHTML = "<p>No products found.</p>";
            return;
        }

        // Loop through products and create HTML structure
        products.forEach((product) => {
            const productCard = document.createElement("div");
            productCard.className = "product__item";
            productCard.innerHTML = `
                <div class="product__banner">
                    <a href="productdetails.html" class="product__thumb">
                        <img src="${product.PATH1}" alt="${product.P_NAME}" class="product__img default"/>
                        <img src="${product.PATH2}" alt="${product.P_NAME}" class="product__img hover"/>
                    </a>
                </div>
                <div class="product__content">
                    <a href="productdetails.html">
                        <h3 class="product__title">${product.P_NAME}</h3>
                    </a>
                    <div class="product__rating">
                        <i class="fa-regular fa-star"></i>
                        <i class="fa-regular fa-star"></i>
                        <i class="fa-regular fa-star"></i>
                        <i class="fa-regular fa-star"></i>
                        <i class="fa-regular fa-star"></i>
                    </div>
                    <div class="product__price">
                        <span class="new__price">&#8377; ${product.P_PRICE}</span>
                    </div>
                </div>
            `;
            container.appendChild(productCard);
        });

    } catch (error) {
        console.error(`Error fetching products from ${endpoint}:`, error);
        document.getElementById(containerId).innerHTML = "<p>Failed to load products.</p>";
    }
}

// Fetch Best Selling and Fresh Arrivals Products
document.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayProducts("/best-selling", "bestseller-container");
    fetchAndDisplayProducts("/fresh-arrivals", "newarrival-container");
});

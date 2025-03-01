document.addEventListener("DOMContentLoaded", (event) => {
  const pathname = window.location.pathname;
  const pathSegments = pathname.split("/").filter((segment) => segment);

  let endpoint;
  if (pathSegments.length > 1) {
    const subcategory = pathSegments[0];
    const subSubCategory = pathSegments[1];
    endpoint = `/header/sub/${subcategory}/${subSubCategory}`;
  } else {
    const subcategory = pathSegments[0];
    endpoint = `/header/sub/${subcategory}`;
  }

  fetch(endpoint)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      updateUI(pathSegments, data);
      displayProducts(data.items);
      document.getElementById("tp").textContent = data.items.length;
      document.getElementById("info1").textContent = data.description;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  // Fetch best-selling data
  fetch("/best-selling")
    .then((response) => response.json())
    .then((data) => {
      displayNewArrivals(data);
    });
});

const updateUI = (pathSegments, data) => {
  const subcategory = decodeURIComponent(pathSegments[0]);
  const subSubCategory = decodeURIComponent(pathSegments[1]) || null;
  const breadcrumb = document.getElementById("breadcrumb1");
  const heading = document.getElementById("heading");

  if (subSubCategory) {
    breadcrumb.textContent = `${capitalize(
      subcategory.replace("_", " ")
    )} > ${capitalize(subSubCategory.replace("_", " "))}`;
    heading.textContent = capitalize(subSubCategory.replace("_", " "));
  } else {
    breadcrumb.textContent = capitalize(subcategory);
    heading.textContent = capitalize(subcategory);
  }
};

const displayProducts = (products) => {
  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = "";

  if (products && products.forEach) {
    products.forEach((product) => {
      const productHTML = `
        <div class="product-card">
          <a href="/product.html?product=${product.name}">
            <img src="../${product.image}" alt="${product.name}" class="">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">₹${product.price}</p>
          </a>
        </div>
      `;
      productContainer.innerHTML += productHTML;
    });
  } else {
    console.error("Error: products is not an array or undefined");
  }
};

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

const capitalize = (str) => {
  if (typeof str !== "string") {
    console.error("capitalize: received non-string value", str);
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

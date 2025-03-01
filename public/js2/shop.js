let category, subcategory, pathSegments, pathname, fetchEndpoint;

document.addEventListener("DOMContentLoaded", (event) => {
  pathname = window.location.pathname;
  pathSegments = pathname.split("/").filter((segment) => segment);

  let headerEndpoint;
  let sortEndpoint;

  if (pathSegments.length > 1) {
    category = pathSegments[0];
    subcategory = pathSegments[1];
    headerEndpoint = `/header/${category}/${subcategory}`; // Fetch menu categories
    fetchEndpoint = `/fetch/sub/${category}/${subcategory}`;
    sortEndpoint = `/fetch/sort/${category}`;
  } else {
    category = pathSegments[0];
    headerEndpoint = `/header/header/${category}`;
    fetchEndpoint = `/fetch/${category}`;
    sortEndpoint = `/fetch/sort/${category}`;
  }
  fetch(headerEndpoint)
    .then((response) => response.json())
    .then((data) => {
      updateHeaderUI(data);
    })
    .catch((error) => {
      console.error("Error fetching header data:", error);
    });

  // Fetch product data based on the dynamically constructed endpoint
  fetchData(fetchEndpoint, pathSegments, pathname);

  // Fetch and populate filters based on the category
  fetch(sortEndpoint)
    .then((response) => response.json())
    .then((data) => {
      const { colors, sizes } = data;

      // Populate color filter
      const colorFilter = document.getElementById("colorFilter");
      if (colorFilter) {
        populateSelect(colorFilter, colors, "Color");
      }

      // Populate size filter
      const sizeFilter = document.getElementById("sizeFilter");
      if (sizeFilter) {
        populateSelect(sizeFilter, sizes, "Size");
      }
    })
    .catch((error) => {
      console.error("Error fetching filters:", error);
    });

  // Event listeners for the filters to handle selection
  const colorFilter = document.getElementById("colorFilter");
  const sizeFilter = document.getElementById("sizeFilter");
  const resetButton = document.getElementById("resetFilters"); // Add a reset button element
  const sortSelect = document.getElementById("defaultSorting"); // Sorting select element

  if (colorFilter) {
    colorFilter.addEventListener("change", (event) => {
      const selectedColor = event.target.value;
      const selectedSize = sizeFilter.value; // Get the selected size
      const selectedSort = sortSelect.value; // Get the selected sorting
      fetchDataWithFilter(selectedColor, selectedSize, selectedSort);
    });
  }

  if (sizeFilter) {
    sizeFilter.addEventListener("change", (event) => {
      const selectedSize = event.target.value;
      const selectedColor = colorFilter.value; // Get the selected color
      const selectedSort = sortSelect.value; // Get the selected sorting
      fetchDataWithFilter(selectedColor, selectedSize, selectedSort);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (event) => {
      const selectedSort = event.target.value;
      const selectedColor = colorFilter.value; // Get the selected color
      const selectedSize = sizeFilter.value; // Get the selected size
      fetchDataWithFilter(selectedColor, selectedSize, selectedSort);
    });
  }

  // Add event listener for the reset button to clear filters
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      colorFilter.value = ""; // Reset color filter
      sizeFilter.value = ""; // Reset size filter
      sortSelect.value = ""; // Reset sort filter
      fetchData(fetchEndpoint, pathSegments, pathname); // Fetch all products
    });
  }
});

const fetchData = (endpoint, pathSegments, pathname) => {
  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      updateUI(pathSegments, data);
      // Call the displayProducts function with the fetched data
      displayProducts(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

const fetchDataWithFilter = (color, size, sort) => {
  const endpoint = `/fetch/${category}/filter?color=${color}&size=${size}&sort=${sort}`;
  fetchData(endpoint, pathSegments, pathname);
};

const updateUI = (pathSegments, data) => {
  const category = pathSegments[0];
  const subcategory = pathSegments[1] || null;
  const breadcrumb = document.getElementById("breadcrumb1");
  const heading = document.getElementById("heading");

  if (subcategory) {
    breadcrumb.textContent = `${capitalize(category)} > ${capitalize(
      subcategory.replace("_", " ")
    )}`;
    heading.textContent = capitalize(subcategory.replace("_", " "));
  } else {
    breadcrumb.textContent = capitalize(category);
    heading.textContent = capitalize(category);
  }
};

const displayProducts = (data) => {
  // Ensure the response structure matches the updated backend
  const { desc, products } = data;

  const result = document.getElementById("tp");
  result.innerHTML = products.length; // Use the products length

  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = "";

  document.getElementById("info1").innerHTML = desc; // Use the desc from the response

  if (products && Array.isArray(products)) {
    products.forEach((product) => {
      const productHTML = `
          <div class="product-card">
            <a href="/product.html?product=${product.name}">
              <img src="../${product.img}" alt="${product.name}" class="">
              <h3 class="product-name">${product.name}</h3>
              <p class="product-price">&#8377; ${product.price}</p>
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
  const products = data;
  products.forEach((item) => {
    const productHTML = `
          <div class="product-card">
          <a href="/product.html?product=${item.P_NAME}">
            <img src="${item.PATH1}" alt="${item.P_NAME}">
            <h3 class="product-name">${item.P_NAME}</h3>
            <p class="product-price">₹${item.P_PRICE}</p>
          </a>
          </div>
        `;
    productContainer.innerHTML += productHTML;
  });
};

const capitalize = (str) => {
  if (typeof str !== "string") {
    console.error("capitalize: received non-string value", str);
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const updateHeaderUI = (data) => {
  const optionsContainer = document.getElementById("options-container");
  const subcategories = data.items;

  // Clear existing subcategories
  optionsContainer.innerHTML = "";

  subcategories.forEach((sub) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("option-div");

    const optionItems = document.createElement("div");
    optionItems.classList.add("option-items");

    const a = document.createElement("a");
    let subName=sub.ss_name || sub.sub_name;
    let formattedPath;
    if(sub.ss_name){
      formattedPath = `/${subcategory.toLowerCase().replace(/ /g, "_")}/${subName.toLowerCase().replace(/ /g, "_")}`;
    }
    else{
      formattedPath = `/${category.toLowerCase().replace(/ /g, "_")}/${subName.toLowerCase().replace(/ /g, "_")}`;
    }
    a.href = formattedPath;

    const img = document.createElement("img");
    img.src = sub.sub_image || sub.ss_image;
    img.alt = "";

    const cat = document.createElement("a");
    cat.classList.add("cat");
    const sub_name = sub.sub_name || sub.ss_name;
    cat.textContent = capitalize(sub_name).replace(/_/g, " ");

    a.appendChild(img);
    a.appendChild(cat);
    optionItems.appendChild(a);
    optionDiv.appendChild(optionItems);
    optionsContainer.appendChild(optionDiv);
  });
};
// Function to populate a select element with options
const populateSelect = (selectElement, options, defaultText) => {
  // Add the default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = defaultText;
  defaultOption.selected = true;
  defaultOption.disabled = true;
  selectElement.appendChild(defaultOption);

  // Add the other options
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.toLowerCase().replace(/ /g, "_"); // Use a standardized value
    opt.textContent = option.charAt(0).toUpperCase() + option.slice(1); // Capitalize the first letter
    selectElement.appendChild(opt);
  });
};

document.addEventListener("DOMContentLoaded", (event) => {
  // Populate the default sorting filter (static options)
  const defaultSortingOptions = ["Price: Low to High", "Price: High to Low"];
  const defaultSorting = document.getElementById("defaultSorting");
  populateSelect(defaultSorting, defaultSortingOptions, "Sort by");

  // Optional: Add event listeners for the filters to handle the selection
  const sizeFilter = document.getElementById("sizeFilter");
  const colorFilter = document.getElementById("colorFilter");
  const resetButton = document.getElementById("resetFilters"); // Add a reset button element

  if (sizeFilter) {
    sizeFilter.addEventListener("change", (event) => {
      const selectedSize = event.target.value;
      const selectedColor = colorFilter.value; // Get the selected color
      const selectedSort = defaultSorting.value; // Get the selected sorting
      fetchDataWithFilter(selectedColor, selectedSize, selectedSort);
    });
  }

  if (colorFilter) {
    colorFilter.addEventListener("change", (event) => {
      const selectedColor = event.target.value;
      const selectedSize = sizeFilter.value; // Get the selected size
      const selectedSort = defaultSorting.value; // Get the selected sorting
      fetchDataWithFilter(selectedColor, selectedSize, selectedSort);
    });
  }

  if (defaultSorting) {
    defaultSorting.addEventListener("change", (event) => {
      const selectedSort = event.target.value;
      const selectedColor = colorFilter.value; // Get the selected color
      const selectedSize = sizeFilter.value; // Get the selected size
      fetchDataWithFilter(selectedColor, selectedSize, selectedSort);
    });
  }

  // Add event listener for the reset button to clear filters
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (colorFilter) {
        colorFilter.value = ""; // Reset color filter
      }
      if (sizeFilter) {
        sizeFilter.value = ""; // Reset size filter
      }
      defaultSorting.value = ""; // Reset sort filter
      fetchData(fetchEndpoint, pathSegments, pathname); // Fetch all products
    });
  }
});

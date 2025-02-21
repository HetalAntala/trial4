async function fetchProducts(endpoint, containerId) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const products = await response.json();
    console.log(`Fetched products from ${endpoint}:`, products);

    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Element with ID '${containerId}' not found`);

    container.innerHTML = "";

    products.forEach((product) => {
      if (product.PATH1 && product.P_NAME && product.P_PRICE) {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
          <img src="${product.PATH1}" alt="${product.P_NAME}" width="150px">
          <h3>${product.P_NAME}</h3>
          <p>Price: ₹${product.P_PRICE}</p>
          <div class="product-icons">
            <a href="#" class="action__btn" aria-label="Add to Wishlist">
              <i class="fa-regular fa-heart"></i>
            </a>
            <a href="#" class="action__btn" aria-label="ADD TO CART">
              <i class="fa-solid fa-cart-shopping"></i>
            </a>
          </div>
        `;
        container.appendChild(productCard);
      } else {
        console.warn('Product data is missing required fields', product);
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

const fetchData = (endpoint) => {
  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const breadcrumb1 = document.getElementById("breadcrumb1");
      var heading = document.getElementById("heading");
      var info1 = document.getElementById("info1");

      switch (path) {
        case "plants":
          breadcrumb1.innerHTML = "Plants";
          heading.textContent = "Plants";
          info1.textContent =
            "Plants produce their own food through a process called photosynthesis, where they convert sunlight, carbon dioxide, and water into glucose and oxygen.";
          plantsdata = data;
          var tp = document.getElementById("tp");
          tp.textContent = data.count;

          var sub_cat1 = document.getElementById("sub_cat1");
          var sub_cat_img1 = document.getElementById("sub_cat_img1");
          sub_cat_img1.src = "../images/season.jpeg";
          sub_cat1.textContent = "Seasonal Plants";
          var a1 = document.getElementById("a1");
          sub_cat1.href = "/plants/seasonal_plants";
          a1.href = "/plants/seasonal_plants";

          var sub_cat2 = document.getElementById("sub_cat2");
          var sub_cat_img2 = document.getElementById("sub_cat_img2");
          sub_cat_img2.src = "../images/suitable location.jpeg";
          sub_cat2.textContent = "Suitable Locations";
          a1 = document.getElementById("a2");
          sub_cat2.href = "/plants/suitable_locations";
          a1.href = "/plants/suitable_locations";

          var sub_cat3 = document.getElementById("sub_cat3");
          var sub_cat_img3 = document.getElementById("sub_cat_img3");
          sub_cat_img3.src = "../images/plant types.jpeg";
          sub_cat3.textContent = "Plant Types";
          a1 = document.getElementById("a3");
          sub_cat3.href = "/plants/plant_types";
          a1.href = "/plants/plant_types";

          var sub_cat4 = document.getElementById("sub_cat4");
          var sub_cat_img4 = document.getElementById("sub_cat_img4");
          sub_cat_img4.src = "../images/flower varieties.jpeg";
          sub_cat4.textContent = "Flower Varieties";
          a1 = document.getElementById("a4");
          sub_cat4.href = "/plants/flower_varieties";
          a1.href = "/plants/flower_varieties";

          document.getElementById("sub_cat5").hidden = true;
          document.getElementById("sub_cat_img5").hidden = true;
          document.getElementById("sub_cat6").hidden = true;
          document.getElementById("sub_cat_img6").hidden = true;
          document.getElementById("sub_cat7").hidden = true;
          document.getElementById("sub_cat_img7").hidden = true;
          var no = 1;
          for (i = 0; i < 8; i++) {
            var card = document.getElementById("card" + no.toString());
            var card_img = document.getElementById("card_img" + no.toString());
            var card_price = document.getElementById(
              "card_price" + no.toString()
            );
            card.textContent = data.plants[i].name;
            card_img.src = "../" + data.plants[i].image;
            card_price.textContent += data.plants[i].price;
            no++;
          }
          break;
        case "bouquets":
          breadcrumb1.innerHTML = "Bouquet";
          break;
        case "pots":
          breadcrumb1.innerHTML = "Pots";
          break;
        case "fertilizers":
          breadcrumb1.innerHTML = "Fertilizers";
          break;
        case "tools":
          breadcrumb1.innerHTML = "Tools";
          break;
        default:
          console.log("Invalid request type");
          break;
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

const handleRequest = (requestType) => {
  switch (requestType) {
    case "plants":
      fetchData("/header/plantsdata");
      break;
    case "bouquets":
      fetchData("/header/bouquetdata");
      break;
    case "pots":
      fetchData("/header/potsdata");
      break;
    case "fertilizers":
      fetchData("/header/fertilizerdata");
      break;
    case "tools":
      fetchData("/header/toolsdata");
      break;
    default:
      console.log("Invalid request type");
      break;
  }
};

// Example usage
const path = window.location.pathname.split("/").pop();
handleRequest(path);

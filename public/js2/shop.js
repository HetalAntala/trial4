// Get the pathname from the URL
const pathname = window.location.pathname;

// Extract the category from the pathname
const category = pathname.split("/")[1];
const pathSegments = pathname.split("/").filter((segment) => segment);
document.addEventListener("DOMContentLoaded", () => {
  // Determine the endpoint based on the category
  let endpoint;
  if (pathSegments.length > 1) {
    // Handle cases with subcategories
    const category = pathSegments[0];
    const subcategory = pathSegments[1];

    switch (category) {
      case "plants":
        switch (subcategory) {
          case "seasonal_plants":
            endpoint = "/header/seasonal_plants";
            break;
          case "suitable_locations":
            endpoint = "/header/suitable_locations";
            break;
          case "plant_types":
            endpoint = "/header/plant_types";
            break;
          case "flower_varieties":
            endpoint = "/header/flowering_plant";
            break;
        }
        break;
      case "bouquets":
        switch (subcategory) {
          case "occassion_type":
            endpoint = "/header/occassion_type";
            break;
          case "wrapping_style":
            endpoint = "/header/wrapping_style";
            break;
          case "arrangement_type":
            endpoint = "/header/arrangement_style";
            break;
          case "flower_varieties":
            endpoint = "/header/flower_varieties";
            break;
        }
        break;
    }
  } else {
    // Handle cases without subcategories
    switch (pathSegments[0]) {
      case "plants":
        endpoint = "/header/plantsdata";
        break;
      case "bouquets":
        endpoint = "/header/bouquetdata";
        break;
      case "pots":
        endpoint = "/header/potsdata";
        break;
      case "fertilizers":
        endpoint = "/header/fertilizerdata";
        break;
      case "tools":
        endpoint = "/header/toolsdata";
        break;
    }
  }
  // Call the fetchData function with the determined endpoint
  fetchData(endpoint);
});
fetch("/best-selling")
  .then((response) => response.json())
  .then((data) => {
    for (var i = 0; i < data.length; i++) {
      var newImagePath = "../" + data[i].PATH1;
      data[i].PATH1 = newImagePath;
    }
    displayNewArrivals(data);
  });
const fetchData = (endpoint) => {
  fetch(endpoint)
    .then((response) => {
      // console.log(pathSegments);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (pathSegments.length > 1) {
        const category = pathSegments[0];
        const subcategory = pathSegments[1];
        switch (category) {
          case "plants":
            switch (subcategory) {
              case "seasonal_plants":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Seasonal Plants";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Seasonal Plants";

                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Did you know that pumpkins are actually a type of squash, and they're considered a fruit? They grow in autumn and are famous for their role in Halloween as jack-o'-lanterns. 🎃";
                plantsdata = data;
                var tp = document.getElementById("tp");
                tp.textContent = data.count;

                var sub_cat1 = document.getElementById("sub_cat1");
                var sub_cat_img1 = document.getElementById("sub_cat_img1");
                sub_cat_img1.src = "../images/summer.jpeg";
                sub_cat1.textContent = "Summer";
                var a1 = document.getElementById("a1");
                sub_cat1.href = "/seasonal_plants/summer";
                a1.href = "/seasonal_plants/summer";

                var sub_cat2 = document.getElementById("sub_cat2");
                var sub_cat_img2 = document.getElementById("sub_cat_img2");
                sub_cat_img2.src = "../images/winter.jpeg";
                sub_cat2.textContent = "Winter";
                a1 = document.getElementById("a2");
                sub_cat2.href = "/seasonal_plants/winter";
                a1.href = "/seasonal_plants/winter";

                var sub_cat3 = document.getElementById("sub_cat3");
                var sub_cat_img3 = document.getElementById("sub_cat_img3");
                sub_cat_img3.src = "../images/monsoon.jpeg";
                sub_cat3.textContent = "Monsoon";
                a1 = document.getElementById("a3");
                sub_cat3.href = "/seasonal_plants/monsoon";
                a1.href = "/seasonal_plants/monsoon";

                var sub_cat4 = document.getElementById("sub_cat4");
                var sub_cat_img4 = document.getElementById("sub_cat_img4");
                sub_cat_img4.src = "../images/spring.jpeg";
                sub_cat4.textContent = "Spring";
                a1 = document.getElementById("a4");
                sub_cat4.href = "/seasonal_plants/spring";
                a1.href = "/seasonal_plants/spring";

                var sub_cat5 = document.getElementById("sub_cat5");
                var sub_cat_img5 = document.getElementById("sub_cat_img5");
                sub_cat_img5.src = "../images/autumn.jpeg";
                sub_cat5.textContent = "Autumn";
                a1 = document.getElementById("a5");
                sub_cat5.href = "/seasonal_plants/autumn";
                a1.href = "/seasonal_plants/autumn";

                var sub_cat6 = document.getElementById("sub_cat6");
                var sub_cat_img6 = document.getElementById("sub_cat_img6");
                sub_cat_img6.src = "../images/homeplant.jpg";
                sub_cat6.textContent = "All Season";
                a1 = document.getElementById("a6");
                sub_cat6.href = "/seasonal_plants/all-seasons";
                a1.href = "/seasonal_plants/all-seasons";

                document.getElementById("sub_cat7").hidden = true;
                document.getElementById("sub_cat_img7").hidden = true;
                break;
              case "suitable_locations":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Suitable Locations";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Suitable Locations";

                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Snake Plant (Sansevieria) is a fantastic choice for offices or rooms in a house. It's incredibly low-maintenance and thrives in low-light conditions, making it perfect for spaces with limited natural sunlight. Plus, it helps purify the air by removing toxins like formaldehyde and benzene. Placing a snake plant in your bedroom or office can improve air quality and create a more pleasant environment. 🌿";
                plantsdata = data;
                var tp = document.getElementById("tp");
                tp.textContent = data.count;

                var sub_cat1 = document.getElementById("sub_cat1");
                var sub_cat_img1 = document.getElementById("sub_cat_img1");
                sub_cat_img1.src = "../images/plant1.jpeg";
                sub_cat1.textContent = "Indoor";
                var a1 = document.getElementById("a1");
                sub_cat1.href = "/suitable_locations/indoor";
                a1.href = "/suitable_locations/indoor";

                var sub_cat2 = document.getElementById("sub_cat2");
                var sub_cat_img2 = document.getElementById("sub_cat_img2");
                sub_cat_img2.src = "../images/outdoor.jpeg";
                sub_cat2.textContent = "Outdoor";
                a1 = document.getElementById("a2");
                sub_cat2.href = "/suitable_locations/outdoor";
                a1.href = "/suitable_locations/outdoor";

                var sub_cat3 = document.getElementById("sub_cat3");
                var sub_cat_img3 = document.getElementById("sub_cat_img3");
                sub_cat_img3.src = "../images/office.jpeg";
                sub_cat3.textContent = "Office";
                a1 = document.getElementById("a3");
                sub_cat3.href = "/suitable_locations/office";
                a1.href = "/suitable_locations/office";

                var sub_cat4 = document.getElementById("sub_cat4");
                var sub_cat_img4 = document.getElementById("sub_cat_img4");
                sub_cat_img4.src = "../images/balcony.jpeg";
                sub_cat4.textContent = "Balcony";
                a1 = document.getElementById("a4");
                sub_cat4.href = "/suitable_locations/balcony";
                a1.href = "/suitable_locations/balcony";

                var sub_cat5 = document.getElementById("sub_cat5");
                var sub_cat_img5 = document.getElementById("sub_cat_img5");
                sub_cat_img5.src = "../images/bedroom.jpeg";
                sub_cat5.textContent = "Bedroom";
                a1 = document.getElementById("a5");
                sub_cat5.href = "/suitable_locations/bedroom";
                a1.href = "/suitable_locations/bedroom";

                var sub_cat6 = document.getElementById("sub_cat6");
                var sub_cat_img6 = document.getElementById("sub_cat_img6");
                sub_cat_img6.src = "../images/terrace.jpeg";
                sub_cat6.textContent = "Terrace";
                a1 = document.getElementById("a6");
                sub_cat6.href = "/suitable_locations/terrace";
                a1.href = "/suitable_locations/terrace";

                var sub_cat7 = document.getElementById("sub_cat7");
                var sub_cat_img7 = document.getElementById("sub_cat_img7");
                sub_cat_img7.src = "../images/livingroom.jpeg";
                sub_cat7.textContent = "Living Room";
                a1 = document.getElementById("a7");
                sub_cat7.href = "/suitable_locations/living-room";
                a1.href = "/suitable_locations/living-room";
                break;
              case "plant_types":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Plant Types";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Plant Types";

                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Bamboo is the fastest-growing plant on Earth. Some species of bamboo can grow up to 35 inches (91 centimeters) in a single day! 🌱";
                plantsdata = data;
                var tp = document.getElementById("tp");
                tp.textContent = data.count;

                var sub_cat1 = document.getElementById("sub_cat1");
                var sub_cat_img1 = document.getElementById("sub_cat_img1");
                sub_cat_img1.src = "../images/air plant.jpeg";
                sub_cat1.textContent = "Air Plants";
                var a1 = document.getElementById("a1");
                sub_cat1.href = "/plant_types/air-plants";
                a1.href = "/plant_types/air-plants";

                var sub_cat2 = document.getElementById("sub_cat2");
                var sub_cat_img2 = document.getElementById("sub_cat_img2");
                sub_cat_img2.src = "../images/bamboo.jpeg";
                sub_cat2.textContent = "Bamboo";
                a1 = document.getElementById("a2");
                sub_cat2.href = "/plant_types/bamboo";
                a1.href = "/plant_types/bamboo";

                var sub_cat3 = document.getElementById("sub_cat3");
                var sub_cat_img3 = document.getElementById("sub_cat_img3");
                sub_cat_img3.src = "../images/climber.jpeg";
                sub_cat3.textContent = "Climber";
                a1 = document.getElementById("a3");
                sub_cat3.href = "/plant_types/climber";
                a1.href = "/plant_types/climber";

                var sub_cat4 = document.getElementById("sub_cat4");
                var sub_cat_img4 = document.getElementById("sub_cat_img4");
                sub_cat_img4.src = "../images/creeper.jpeg";
                sub_cat4.textContent = "Creeper";
                a1 = document.getElementById("a4");
                sub_cat4.href = "/plant_types/creeper";
                a1.href = "/plant_types/creeper";

                var sub_cat5 = document.getElementById("sub_cat5");
                var sub_cat_img5 = document.getElementById("sub_cat_img5");
                sub_cat_img5.src = "../images/cactus.jpeg";
                sub_cat5.textContent = "Cactus";
                a1 = document.getElementById("a5");
                sub_cat5.href = "/plant_types/cactus";
                a1.href = "/plant_types/cactus";

                var sub_cat6 = document.getElementById("sub_cat6");
                var sub_cat_img6 = document.getElementById("sub_cat_img6");
                sub_cat_img6.src = "../images/herbs.jpeg";
                sub_cat6.textContent = "Herbs";
                a1 = document.getElementById("a6");
                sub_cat6.href = "/plant_types/herb";
                a1.href = "/plant_types/herb";

                var sub_cat7 = document.getElementById("sub_cat7");
                var sub_cat_img7 = document.getElementById("sub_cat_img7");
                sub_cat_img7.src = "../images/shrubs.jpeg";
                sub_cat7.textContent = "Shrubs";
                a1 = document.getElementById("a7");
                sub_cat7.href = "/plant_types/shrubs";
                a1.href = "/plant_types/shrubs";
                break;
              case "flower_varieties":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Flower Varieties";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Flower Varieties";

                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Did you know that flowers have been used in traditional medicines for thousands of years? Many plants, like chamomile and lavender, are known for their calming properties.🌻";
                plantsdata = data;
                var tp = document.getElementById("tp");
                tp.textContent = data.count;

                var sub_cat1 = document.getElementById("sub_cat1");
                var sub_cat_img1 = document.getElementById("sub_cat_img1");
                sub_cat_img1.src = "../images/adenium.jpeg";
                sub_cat1.textContent = "Adenium";
                var a1 = document.getElementById("a1");
                sub_cat1.href = "/flower_varieties/adenium";
                a1.href = "/flower_varieties/adenium";

                var sub_cat2 = document.getElementById("sub_cat2");
                var sub_cat_img2 = document.getElementById("sub_cat_img2");
                sub_cat_img2.src = "../images/rose.jpeg";
                sub_cat2.textContent = "Rose";
                a1 = document.getElementById("a2");
                sub_cat2.href = "/flower_varieties/rose";
                a1.href = "/flower_varieties/rose";

                var sub_cat3 = document.getElementById("sub_cat3");
                var sub_cat_img3 = document.getElementById("sub_cat_img3");
                sub_cat_img3.src = "../images/lily.jpeg";
                sub_cat3.textContent = "Lily";
                a1 = document.getElementById("a3");
                sub_cat3.href = "/flower_varieties/lily";
                a1.href = "/flower_varieties/lily";

                var sub_cat4 = document.getElementById("sub_cat4");
                var sub_cat_img4 = document.getElementById("sub_cat_img4");
                sub_cat_img4.src = "../images/hibiscus.jpeg";
                sub_cat4.textContent = "Hibiscus";
                a1 = document.getElementById("a4");
                sub_cat4.href = "/flower_varieties/hibiscus";
                a1.href = "/flower_varieties/hibiscus";

                var sub_cat5 = document.getElementById("sub_cat5");
                var sub_cat_img5 = document.getElementById("sub_cat_img5");
                sub_cat_img5.src = "../images/jasmine.jpeg";
                sub_cat5.textContent = "Jasmine";
                a1 = document.getElementById("a5");
                sub_cat5.href = "/flower_varieties/jasmine";
                a1.href = "/flower_varieties/jasmine";

                var sub_cat6 = document.getElementById("sub_cat6");
                var sub_cat_img6 = document.getElementById("sub_cat_img6");
                sub_cat_img6.src = "../images/marigold.jpeg";
                sub_cat6.textContent = "Marigold";
                a1 = document.getElementById("a6");
                sub_cat6.href = "/flower_varieties/marigold";
                a1.href = "/flower_varieties/marigold";

                var sub_cat7 = document.getElementById("sub_cat7");
                var sub_cat_img7 = document.getElementById("sub_cat_img7");
                sub_cat_img7.src = "../images/carnation.jpeg";
                sub_cat7.textContent = "Carnation";
                a1 = document.getElementById("a7");
                sub_cat7.href = "/flower_varieties/carnation";
                a1.href = "/flower_varieties/carnation";

                break;
            }
            for (var i = 0; i < data.items.length; i++) {
              var newImagePath = "../" + data.items[i].image;
              data.items[i].image = newImagePath;
            }

            // console.log(data);
            displayProducts(data);
            break;
          case "bouquets":
            switch (subcategory) {
              case "occassion_type":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Bouquets > Occassion Type";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Occassion Type";

                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Kraft paper wraps are popular for bouquets because they provide a rustic and eco-friendly charm. 🌿 This type of wrapping adds a natural look, often complemented with simple twine or ribbon, making the flowers stand out beautifully.";
                plantsdata = data;
                var tp = document.getElementById("tp");
                tp.textContent = data.count;

                var sub_cat1 = document.getElementById("sub_cat1");
                var sub_cat_img1 = document.getElementById("sub_cat_img1");
                sub_cat_img1.src = "../images/summer.jpeg";
                sub_cat1.textContent = "Birthday";
                var a1 = document.getElementById("a1");
                sub_cat1.href = "/occassion/birthday";
                a1.href = "/occassion/birthday";

                var sub_cat2 = document.getElementById("sub_cat2");
                var sub_cat_img2 = document.getElementById("sub_cat_img2");
                sub_cat_img2.src = "../images/winter.jpeg";
                sub_cat2.textContent = "Anniversary";
                a1 = document.getElementById("a2");
                sub_cat2.href = "/occassion/anniversary";
                a1.href = "/occassion/anniversary";

                var sub_cat3 = document.getElementById("sub_cat3");
                var sub_cat_img3 = document.getElementById("sub_cat_img3");
                sub_cat_img3.src = "../images/monsoon.jpeg";
                sub_cat3.textContent = "Congratulations";
                a1 = document.getElementById("a3");
                sub_cat3.href = "/occassion/congratulations";
                a1.href = "/occassion/congratulations";

                var sub_cat4 = document.getElementById("sub_cat4");
                var sub_cat_img4 = document.getElementById("sub_cat_img4");
                sub_cat_img4.src = "../images/spring.jpeg";
                sub_cat4.textContent = "Get Well Soon";
                a1 = document.getElementById("a4");
                sub_cat4.href = "/occassion/get-well-soon";
                a1.href = "/occassion/get-well-soon";

                var sub_cat5 = document.getElementById("sub_cat5");
                var sub_cat_img5 = document.getElementById("sub_cat_img5");
                sub_cat_img5.src = "../images/autumn.jpeg";
                sub_cat5.textContent = "Farewell";
                a1 = document.getElementById("a5");
                sub_cat5.href = "/occassion/farewell";
                a1.href = "/occassion/farewell";

                var sub_cat6 = document.getElementById("sub_cat6");
                var sub_cat_img6 = document.getElementById("sub_cat_img6");
                sub_cat_img6.src = "../images/homeplant.jpg";
                sub_cat6.textContent = "Condolences";
                a1 = document.getElementById("a6");
                sub_cat6.href = "/occassion/condolences";
                a1.href = "/occassion/condolences";

                document.getElementById("sub_cat7").hidden = true;
                document.getElementById("sub_cat_img7").hidden = true;
                break;
              case "wrapping_style":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Bouquets > Wrapping Style";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Wrapping Style";

                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Fabric wraps, like burlap, add a rustic, reusable, and eco-friendly touch to bouquets. 😊";
                plantsdata = data;
                var tp = document.getElementById("tp");
                tp.textContent = data.count;

                var sub_cat1 = document.getElementById("sub_cat1");
                var sub_cat_img1 = document.getElementById("sub_cat_img1");
                sub_cat_img1.src = "../images/summer.jpeg";
                sub_cat1.textContent = "Flowers in Box";
                var a1 = document.getElementById("a1");
                sub_cat1.href = "/wrapping-style/flowers-in-a-box";
                a1.href = "/wrapping-style/flowers-in-a-box";

                var sub_cat2 = document.getElementById("sub_cat2");
                var sub_cat_img2 = document.getElementById("sub_cat_img2");
                sub_cat_img2.src = "../images/winter.jpeg";
                sub_cat2.textContent = "Flowers in Vase";
                a1 = document.getElementById("a2");
                sub_cat2.href = "/wrapping-style/flowers-in-vase";
                a1.href = "/wrapping-style/flowers-in-vase";

                var sub_cat3 = document.getElementById("sub_cat3");
                var sub_cat_img3 = document.getElementById("sub_cat_img3");
                sub_cat_img3.src = "../images/monsoon.jpeg";
                sub_cat3.textContent = "Ribbon Wrapped";
                a1 = document.getElementById("a3");
                sub_cat3.href = "/wrapping-style/ribbon-wrapped";
                a1.href = "/wrapping-style/ribbon-wrapped";

                var sub_cat4 = document.getElementById("sub_cat4");
                var sub_cat_img4 = document.getElementById("sub_cat_img4");
                sub_cat_img4.src = "../images/spring.jpeg";
                sub_cat4.textContent = "Flower Basket";
                a1 = document.getElementById("a4");
                sub_cat4.href = "/wrapping-style/flower-basket";
                a1.href = "/wrapping-style/flower-basket";

                var sub_cat5 = document.getElementById("sub_cat5");
                var sub_cat_img5 = document.getElementById("sub_cat_img5");
                sub_cat_img5.src = "../images/autumn.jpeg";
                sub_cat5.textContent = "Cellophane Wrapped";
                a1 = document.getElementById("a5");
                sub_cat5.href = "/wrapping-style/cellophane-wrapped";
                a1.href = "/wrapping-style/cellophane-wrapped";

                var sub_cat6 = document.getElementById("sub_cat6");
                var sub_cat_img6 = document.getElementById("sub_cat_img6");
                sub_cat_img6.src = "../images/homeplant.jpg";
                sub_cat6.textContent = "Tissue Wrapped";
                a1 = document.getElementById("a6");
                sub_cat6.href = "/wrapping-style/tissue-wrapped";
                a1.href = "/wrapping-style/tissue-wrapped";

                document.getElementById("sub_cat7").hidden = true;
                document.getElementById("sub_cat_img7").hidden = true;
                break;
              case "arrangement_type":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Bouquets > Arrangement Style";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Arrangement Style";

                var info1 = document.getElementById("info1");
                info1.textContent =
                  "The spiral technique in bouquet arrangement helps create a fuller and balanced look. 🌸";
                plantsdata = data;
                var tp = document.getElementById("tp");
                tp.textContent = data.count;

                var sub_cat1 = document.getElementById("sub_cat1");
                var sub_cat_img1 = document.getElementById("sub_cat_img1");
                sub_cat_img1.src = "../images/summer.jpeg";
                sub_cat1.textContent = "Heart Shape";
                var a1 = document.getElementById("a1");
                sub_cat1.href = "/arrangement-type/heart-shape";
                a1.href = "/arrangement-type/heart-shape";

                var sub_cat2 = document.getElementById("sub_cat2");
                var sub_cat_img2 = document.getElementById("sub_cat_img2");
                sub_cat_img2.src = "../images/winter.jpeg";
                sub_cat2.textContent = "Flowers Basket";
                a1 = document.getElementById("a2");
                sub_cat2.href = "/arrangement-type/flower-basket";
                a1.href = "/arrangement-type/flower-basket";

                var sub_cat3 = document.getElementById("sub_cat3");
                var sub_cat_img3 = document.getElementById("sub_cat_img3");
                sub_cat_img3.src = "../images/monsoon.jpeg";
                sub_cat3.textContent = "Flowers in Glass";
                a1 = document.getElementById("a3");
                sub_cat3.href = "/arrangement-type/flower-in-glass";
                a1.href = "/arrangement-type/flower-in-glass";

                var sub_cat4 = document.getElementById("sub_cat4");
                var sub_cat_img4 = document.getElementById("sub_cat_img4");
                sub_cat_img4.src = "../images/spring.jpeg";
                sub_cat4.textContent = "Hand Bouquet";
                a1 = document.getElementById("a4");
                sub_cat4.href = "/arrangement-type/hand-bouquet";
                a1.href = "/arrangement-type/hand-bouquet";

                document.getElementById("sub_cat5").hidden = true;
                document.getElementById("sub_cat_img5").hidden = true;
                document.getElementById("sub_cat6").hidden = true;
                document.getElementById("sub_cat_img6").hidden = true;
                document.getElementById("sub_cat7").hidden = true;
                document.getElementById("sub_cat_img7").hidden = true;
                break;
              case "flower_varieties":
                endpoint = "/header/flower_varieties";
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Bouquets > Flower Varieties";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Flower Varieties";

                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Bouquets can feature a variety of flowers such as roses, lilies, tulips, and daisies, each adding unique beauty and fragrance.";
                plantsdata = data;
                var tp = document.getElementById("tp");
                tp.textContent = data.count;

                var sub_cat1 = document.getElementById("sub_cat1");
                var sub_cat_img1 = document.getElementById("sub_cat_img1");
                sub_cat_img1.src = "../images/summer.jpeg";
                sub_cat1.textContent = "Rose";
                var a1 = document.getElementById("a1");
                sub_cat1.href = "/flower-varieties/rose-bouquet";
                a1.href = "/flower-varieties/rose-bouquet";

                var sub_cat2 = document.getElementById("sub_cat2");
                var sub_cat_img2 = document.getElementById("sub_cat_img2");
                sub_cat_img2.src = "../images/winter.jpeg";
                sub_cat2.textContent = "Carnations";
                a1 = document.getElementById("a2");
                sub_cat2.href = "/flower-varieties/carnations-bouquet";
                a1.href = "/flower-varieties/carnations-bouquet";

                var sub_cat3 = document.getElementById("sub_cat3");
                var sub_cat_img3 = document.getElementById("sub_cat_img3");
                sub_cat_img3.src = "../images/monsoon.jpeg";
                sub_cat3.textContent = "Lilies";
                a1 = document.getElementById("a3");
                sub_cat3.href = "/flower-varieties/lily-bouquet";
                a1.href = "/flower-varieties/lily-bouquet";

                var sub_cat4 = document.getElementById("sub_cat4");
                var sub_cat_img4 = document.getElementById("sub_cat_img4");
                sub_cat_img4.src = "../images/spring.jpeg";
                sub_cat4.textContent = "Mixed Flowers";
                a1 = document.getElementById("a4");
                sub_cat4.href = "/flower-varieties/mixed-flowers-bouquet";
                a1.href = "/flower-varieties/mixed-flowers-bouquet";

                document.getElementById("sub_cat5").hidden = true;
                document.getElementById("sub_cat_img5").hidden = true;
                document.getElementById("sub_cat6").hidden = true;
                document.getElementById("sub_cat_img6").hidden = true;
                document.getElementById("sub_cat7").hidden = true;
                document.getElementById("sub_cat_img7").hidden = true;
                break;
            }
            for (var i = 0; i < data.items.length; i++) {
              var newImagePath = "../" + data.items[i].image;
              data.items[i].image = newImagePath;
            }

            // console.log(data);
            displayProducts(data);
            break;
        }
      } else {
        switch (category) {
          case "plants":
            document.getElementById("breadcrumb1").innerHTML = "Plants";
            var heading = document.getElementById("heading");
            heading.textContent = "Plants";

            var info1 = document.getElementById("info1");
            info1.textContent =
              "Plants produce their own food through a process called photosynthesis, where they convert sunlight, carbon dioxide, and water into glucose and oxygen.";
            var plantsdata;
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

            displayProducts(data);
            break;
          case "bouquets":
            document.getElementById("breadcrumb1").innerHTML = "Bouquets";
            var heading = document.getElementById("heading");
            heading.textContent = "Bouquets";

            var info1 = document.getElementById("info1");
            info1.textContent =
              "The tradition of giving floral bouquets dates back thousands of years. In ancient times, the Greeks, Romans, and Egyptians created bouquets to honor gods and celebrate special occasions. Each flower carried its own symbolism, conveying messages and emotions without words.";
            var plantsdata;
            plantsdata = data;
            var tp = document.getElementById("tp");
            tp.textContent = data.count;
            var sub_cat1 = document.getElementById("sub_cat1");
            var sub_cat_img1 = document.getElementById("sub_cat_img1");
            sub_cat_img1.src = "../images/season.jpeg";
            sub_cat1.textContent = "Occassion";
            var a1 = document.getElementById("a1");
            sub_cat1.href = "/bouquets/occassion_type";
            a1.href = "/bouquets/occassion_type";

            var sub_cat2 = document.getElementById("sub_cat2");
            var sub_cat_img2 = document.getElementById("sub_cat_img2");
            sub_cat_img2.src = "../images/suitable location.jpeg";
            sub_cat2.textContent = "Wrapping Type";
            a1 = document.getElementById("a2");
            sub_cat2.href = "/bouquets/wrapping_style";
            a1.href = "/bouquets/wrapping_style";

            var sub_cat3 = document.getElementById("sub_cat3");
            var sub_cat_img3 = document.getElementById("sub_cat_img3");
            sub_cat_img3.src = "../images/plant types.jpeg";
            sub_cat3.textContent = "Bouquet Types";
            a1 = document.getElementById("a3");
            sub_cat3.href = "/bouquets/arrangement_type";
            a1.href = "/bouquets/arrangement_type";

            var sub_cat4 = document.getElementById("sub_cat4");
            var sub_cat_img4 = document.getElementById("sub_cat_img4");
            sub_cat_img4.src = "../images/flower varieties.jpeg";
            sub_cat4.textContent = "Flower Varieties";
            a1 = document.getElementById("a4");
            sub_cat4.href = "/bouquets/flower_varieties";
            a1.href = "/bouquets/flower_varieties";

            document.getElementById("sub_cat5").hidden = true;
            document.getElementById("sub_cat_img5").hidden = true;
            document.getElementById("sub_cat6").hidden = true;
            document.getElementById("sub_cat_img6").hidden = true;
            document.getElementById("sub_cat7").hidden = true;
            document.getElementById("sub_cat_img7").hidden = true;

            displayProducts(data);
            break;
          case "pots":
            document.getElementById("breadcrumb1").innerHTML = "Pots";
            var heading = document.getElementById("heading");
            heading.textContent = "Pots";

            var info1 = document.getElementById("info1");
            info1.textContent =
              "The art of pottery dates back to prehistoric times. The oldest known ceramic artifact, the Venus of Dolní Věstonice, is around 29,000 years old. Pottery allowed ancient humans to store food, water, and other goods, revolutionizing daily life and enabling settled communities.";
            var plantsdata;
            plantsdata = data;
            var tp = document.getElementById("tp");
            tp.textContent = data.count;
            var sub_cat1 = document.getElementById("sub_cat1");
            var sub_cat_img1 = document.getElementById("sub_cat_img1");
            sub_cat_img1.src = "../images/season.jpeg";
            sub_cat1.textContent = "Plastic";
            var a1 = document.getElementById("a1");
            sub_cat1.href = "/pots/plastic";
            a1.href = "/pots/plastic";

            var sub_cat2 = document.getElementById("sub_cat2");
            var sub_cat_img2 = document.getElementById("sub_cat_img2");
            sub_cat_img2.src = "../images/suitable location.jpeg";
            sub_cat2.textContent = "Ceramic";
            a1 = document.getElementById("a2");
            sub_cat2.href = "/pots/ceramic";
            a1.href = "/pots/ceramic";

            var sub_cat3 = document.getElementById("sub_cat3");
            var sub_cat_img3 = document.getElementById("sub_cat_img3");
            sub_cat_img3.src = "../images/plant types.jpeg";
            sub_cat3.textContent = "Glass";
            a1 = document.getElementById("a3");
            sub_cat3.href = "/pots/glass";
            a1.href = "/pots/glass";

            var sub_cat4 = document.getElementById("sub_cat4");
            var sub_cat_img4 = document.getElementById("sub_cat_img4");
            sub_cat_img4.src = "../images/flower varieties.jpeg";
            sub_cat4.textContent = "Resin";
            a1 = document.getElementById("a4");
            sub_cat4.href = "/pots/resin";
            a1.href = "/pots/resin";

            var sub_cat5 = document.getElementById("sub_cat5");
            var sub_cat_img5 = document.getElementById("sub_cat_img5");
            sub_cat_img5.src = "../images/flower varieties.jpeg";
            sub_cat5.textContent = "Vases";
            a1 = document.getElementById("a5");
            sub_cat5.href = "/pots/vase";
            a5.href = "/pots/vase";

            var sub_cat6 = document.getElementById("sub_cat6");
            var sub_cat_img6 = document.getElementById("sub_cat_img6");
            sub_cat_img6.src = "../images/flower varieties.jpeg";
            sub_cat6.textContent = "Hanging Pots";
            a1 = document.getElementById("a6");
            sub_cat6.href = "/pots/hanging-pots";
            a1.href = "/pots/hanging-pots";

            document.getElementById("sub_cat7").hidden = true;
            document.getElementById("sub_cat_img7").hidden = true;

            displayProducts(data);
            break;
          case "fertilizers":
            document.getElementById("breadcrumb1").innerHTML = "Fertilizers";
            var heading = document.getElementById("heading");
            heading.textContent = "Fertilizers";

            var info1 = document.getElementById("info1");
            info1.textContent =
              "Fertilizers provide plants with essential nutrients like nitrogen (N), phosphorus (P), and potassium (K). These nutrients help plants grow better, develop strong roots, and resist diseases.";
            var plantsdata;
            plantsdata = data;
            var tp = document.getElementById("tp");
            tp.textContent = data.count;
            var sub_cat1 = document.getElementById("sub_cat1");
            var sub_cat_img1 = document.getElementById("sub_cat_img1");
            sub_cat_img1.src = "../images/season.jpeg";
            sub_cat1.textContent = "Organic";
            var a1 = document.getElementById("a1");
            sub_cat1.href = "/fertilizers/organic";
            a1.href = "/fertilizers/organic";

            var sub_cat2 = document.getElementById("sub_cat2");
            var sub_cat_img2 = document.getElementById("sub_cat_img2");
            sub_cat_img2.src = "../images/suitable location.jpeg";
            sub_cat2.textContent = "Potting Soil";
            a1 = document.getElementById("a2");
            sub_cat2.href = "/fertilizers/potting-soil";
            a1.href = "/fertilizers/potting-soil";

            var sub_cat3 = document.getElementById("sub_cat3");
            var sub_cat_img3 = document.getElementById("sub_cat_img3");
            sub_cat_img3.src = "../images/plant types.jpeg";
            sub_cat3.textContent = "Cocopeat";
            a1 = document.getElementById("a3");
            sub_cat3.href = "/fertilizers/cocopeat";
            a1.href = "/fertilizers/cocopeat";

            var sub_cat4 = document.getElementById("sub_cat4");
            var sub_cat_img4 = document.getElementById("sub_cat_img4");
            sub_cat_img4.src = "../images/flower varieties.jpeg";
            sub_cat4.textContent = "Manure";
            a1 = document.getElementById("a4");
            sub_cat4.href = "/fertilizers/manure";
            a1.href = "/fertilizers/manure";

            var sub_cat5 = document.getElementById("sub_cat5");
            var sub_cat_img5 = document.getElementById("sub_cat_img5");
            sub_cat_img5.src = "../images/flower varieties.jpeg";
            sub_cat5.textContent = "Compost";
            a1 = document.getElementById("a5");
            sub_cat5.href = "/fertilizers/compost";
            a5.href = "/fertilizers/compost";

            document.getElementById("sub_cat6").hidden = true;
            document.getElementById("sub_cat_img6").hidden = true;
            document.getElementById("sub_cat7").hidden = true;
            document.getElementById("sub_cat_img7").hidden = true;
            displayProducts(data);
            break;
          case "tools":
            document.getElementById("breadcrumb1").innerHTML = "Tools";
            var heading = document.getElementById("heading");
            heading.textContent = "Tools";

            var info1 = document.getElementById("info1");
            info1.textContent =
              "Did you know that one of the smallest and simplest gardening tools is the hand trowel? It's a small, handheld tool with a pointed, scoop-shaped metal blade. The hand trowel is perfect for digging small holes, planting seedlings, and transplanting flowers. Despite its size, it's incredibly versatile and a must-have for any gardener's toolkit.";
            var plantsdata;
            plantsdata = data;
            var tp = document.getElementById("tp");
            tp.textContent = data.count;

            document.getElementById("sub_cat1").hidden = true;
            document.getElementById("sub_cat_img1").hidden = true;
            document.getElementById("sub_cat2").hidden = true;
            document.getElementById("sub_cat_img2").hidden = true;
            document.getElementById("sub_cat3").hidden = true;
            document.getElementById("sub_cat_img3").hidden = true;
            document.getElementById("sub_cat4").hidden = true;
            document.getElementById("sub_cat_img4").hidden = true;
            document.getElementById("sub_cat5").hidden = true;
            document.getElementById("sub_cat_img5").hidden = true;
            document.getElementById("sub_cat6").hidden = true;
            document.getElementById("sub_cat_img6").hidden = true;
            document.getElementById("sub_cat7").hidden = true;
            document.getElementById("sub_cat_img7").hidden = true;
            displayProducts(data);
            break;
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

function displayProducts(data) {
  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = "";
  var product = data.items;

  product.forEach((data) => {
    const productHTML = `
      <div class="product-card">
        <img src="${data.image}" alt="${data.name}" class="product-image">
        <h3 class="product-name">${data.name}</h3>
        <p class="product-price">₹${data.price}</p>
      </div>
    `;
    productContainer.innerHTML += productHTML;
  });
}

function displayNewArrivals(data) {
  const productContainer = document.getElementById("newarrival-container");
  productContainer.innerHTML = "";
  var products = data;

  products.forEach((item) => {
    const productHTML = `
      <div class="product-card">
        <img src="${item.PATH1}" alt="${item.P_NAME}" class="product-image">
        <h3 class="product-name">${item.P_NAME}</h3>
        <p class="product-price">₹${item.P_PRICE}</p>
      </div>
    `;
    productContainer.innerHTML += productHTML;
  });
}

function setupSlider(containerId, leftBtnId, rightBtnId) {
  const container = document.getElementById(containerId);
  const btnLeft = document.getElementById(leftBtnId);
  const btnRight = document.getElementById(rightBtnId);

  if (!container || !btnLeft || !btnRight) {
    console.error("Slider elements not found");
    return;
  }

  let scrollAmount = 0;
  const productWidth = container.clientWidth / 4; // Show 4 products at a time
  const maxScroll = container.scrollWidth - container.clientWidth;

  btnRight.addEventListener("click", function () {
    scrollAmount = Math.min(scrollAmount + productWidth, maxScroll);
    container.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });

  btnLeft.addEventListener("click", function () {
    scrollAmount = Math.max(scrollAmount - productWidth, 0);
    container.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });
}

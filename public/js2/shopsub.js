const pathname = window.location.pathname;
const category = pathname.split("/")[1];
const subcategory = pathname.split("/")[2];
// console.log(category);
// const pathSegments = pathname.split("/").filter((segment) => segment);
document.addEventListener("DOMContentLoaded", () => {
  // Determine the endpoint based on the category
  let endpoint;
  switch (category) {
    case "seasonal_plants":
      endpoint = `/header/season/${subcategory}`;
      break;
    case "suitable_locations":
      endpoint = `/header/suitable_locations/${subcategory}`;
      break;
    case "plant_types":
      endpoint = `/header/plant_types/${subcategory}`;
      break;
    case "flower_varieties":
      endpoint = `/header/flower_varieties/${subcategory}`;
      break;
    case "occassion":
      endpoint = `/header/bouquet/occassion/${subcategory}`;
      break;
    case "wrapping-style":
      endpoint = `/header/bouquet/wrapping/${subcategory}`;
      break;
    case "arrangement-type":
      endpoint = `/header/bouquet/type/${subcategory}`;
      break;
    case "flower-varieties":
      endpoint = `/header/bouquet/flowers/${subcategory}`;
      break;
    case "pots":
      endpoint = `/header/pots/type/${subcategory}`;
      break;
    case "fertilizers":
      endpoint = `/header/fertilizers/type/${subcategory}`;
      break;
  }
  // Call the fetchData function with the determined endpoint
  fetchData(endpoint);
});
const fetchData = (endpoint) => {
  console.log(endpoint);
  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      plantsdata = data;
      var tp = document.getElementById("tp");
      tp.textContent = data.count;
      switch (category) {
        case "seasonal_plants":
          {
            switch (subcategory) {
              case "summer":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Seasonal Plants > Summer";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Summer";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Aloe vera is a plant often called the 'plant of immortality' due to its ability to survive for long periods without water. Its thick, fleshy leaves store water, allowing it to thrive in hot, dry climates.";
                break;
              case "winter":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Seasonal Plants > Winter";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Winter";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Holly bushes are winter champions with their bright red berries and glossy, spiky leaves that add a splash of color to the otherwise bleak winter landscape. These plants are resilient and can withstand cold temperatures, making them a popular choice for winter gardens.";
                break;
              case "monsoon":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Seasonal Plants > Monsoon";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Monsoon";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Moss thrives during the monsoon season. This tiny, green plant loves the moist and shaded conditions brought by the rains, and it can quickly spread over rocks, tree trunks, and soil, adding a lush green carpet to the environment.";
                break;
              case "spring":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Seasonal Plants > Spring";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Spring";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Cherry blossoms bloom in spring and create breathtaking pink and white displays.";
                break;
              case "autumn":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent = "Plants > Seasonal Plants > Autumn";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Autumn";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Maple trees turn brilliant shades of red, orange, and yellow in the fall.";
                break;
              case "all-seasons":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent =
                    "Plants > Seasonal Plants > All Seasons";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "All Season";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Lavender can thrive in various seasons and is known for its fragrant purple flowers.";
                break;
            }
          }
          break;
        case "suitable_locations":
          {
            switch (subcategory) {
              case "indoor":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent =
                    "Plants > Suitable Locations > Indoor";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Indoor";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Spider plants are great air purifiers and easy to care for indoors.";
                break;
              case "outdoor":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent =
                    "Plants > Suitable Locations > Outdoor";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Outdoor";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Marigolds are hardy flowers that thrive in outdoor gardens and repel pests.";
                break;
              case "office":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent =
                    "Plants > Suitable Locations > Office";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Office";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Snake plants (Sansevieria) are low-maintenance and can thrive in low light, perfect for office desks.";
                break;
              case "balcony":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent =
                    "Plants > Suitable Locations > Balcony";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Balcony";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Herbs like basil and mint are great for growing on balconies and can be used in cooking.";
                break;
              case "bedroom":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent =
                    "Plants > Suitable Locations > Bedroom";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Bedroom";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Peace lilies are known to improve air quality and are ideal for bedrooms.";
                break;
              case "terrace":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent =
                    "Plants > Suitable Locations > Terrace";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Terrace";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Bougainvillea is a vibrant, flowering plant that can withstand strong sunlight, perfect for terraces.";
                break;
              case "living-room":
                var breadcrumb = document.getElementById("breadcrumb1");
                if (breadcrumb) {
                  breadcrumb.textContent =
                    "Plants > Suitable Locations > Living Room";
                }
                var heading = document.getElementById("heading");
                heading.textContent = "Living Room";
                var info1 = document.getElementById("info1");
                info1.textContent =
                  "Fiddle leaf fig is a trendy, large plant that adds a touch of greenery to living rooms.";
                break;
            }
          }
          break;
        case "plant_types":
          switch (subcategory) {
            case "air-plants":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Plant Types > Air Plants";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Air Plants";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Air plants (Tillandsia) don't need soil to grow and absorb moisture and nutrients through their leaves.";
              break;
            case "bamboo":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Plant Types > Bamboo";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Bamboo";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Bamboo is one of the fastest-growing plants in the world, with some species growing up to 35 inches per day.";
              break;
            case "climber":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Plant Types > Climber";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Climber";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Climbing plants, like ivy, use tendrils or other structures to attach themselves to surfaces and grow upwards.";
              break;
            case "creeper":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Plant Types > Creeper";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Creeper";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Creeping plants, like groundcover, spread along the ground and are great for preventing soil erosion.";
              break;
            case "herb":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Plant Types > Herbs";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Herbs";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Herbs, like basil and mint, are valued for their aromatic leaves and are often used in cooking and medicine.";
              break;
            case "shrubs":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Plant Types > Shrubs";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Shrubs";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Shrubs are woody plants that have multiple stems and are typically shorter than trees.";
              break;
            case "cactus":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Plant Types > Cactus";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Cactus";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Cacti have thick, fleshy stems that store water, allowing them to survive in arid environments.";
              break;
          }
          break;
        case "flower_varieties":
          switch (subcategory) {
            case "rose":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Flower Varieties > Rose";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Rose";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Roses are known for their beautiful and fragrant flowers, often symbolizing love and admiration.";
              break;
            case "adenium":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Flower Varieties > Adenium";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Adenium";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Adenium, also known as the desert rose, has thick, succulent stems and produces stunning, trumpet-shaped flowers.";
              break;
            case "lily":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Flower Varieties > Lily";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Lily";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Lilies have large, fragrant blooms and are often used in floral arrangements and gardens.";
              break;
            case "hibiscus":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Flower Varieties > Hibiscus";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Hibiscus";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Hibiscus plants produce large, colorful flowers and are often used to make herbal teas.";
              break;
            case "jasmine":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Flower Varieities > Jasmine";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Jasmine";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Jasmine plants are known for their sweetly scented flowers, which are often used in perfumes and teas.";
              break;
            case "marigold":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Plants > Flower Varieties > Marigold";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Marigold";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Marigolds are hardy, vibrant flowers that can repel pests and are often used in companion planting.";
              break;
            case "carnation":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Plants > Flower Varieties > Carnation";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Carnation";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Carnations have ruffled, fragrant flowers and are popular in floral arrangements and bouquets.";
              break;
          }
          break;
        case "occassion":
          switch (subcategory) {
            case "birthday":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Bouquets > Occassion > Birthday";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Birthday";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Birthday bouquets often feature bright and cheerful flowers like roses, lilies, and daisies to celebrate the joyous occasion.";
              break;
            case "anniversary":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Bouquets > Occassion > Anniversary";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Anniversary";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Anniversary bouquets often include romantic flowers like red roses or elegant orchids to symbolize love and commitment.";
              break;
            case "congratulations":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Occassion > Congratulations";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Congratulations";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Congratulatory bouquets are typically vibrant and celebratory, with flowers like sunflowers and tulips to mark the achievement.";
              break;
            case "get-well-soon":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Bouquets > Occassion > Get Well Soon";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Get Well Soon";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Bouquets for wishing someone to get well soon often include calming and uplifting flowers like daisies and chrysanthemums.";
              break;
            case "farewell":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Bouquets > Occassion > Farewell";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Farewell";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Farewell bouquets may include a mix of flowers that signify good luck and well wishes, such as daisies and lilies.";
              break;
            case "condolences":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Bouquets > Occassion > Condolences";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Condolences";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Condolence bouquets often feature white flowers like lilies and roses, which symbolize peace and remembrance.";
              break;
          }
          break;
        case "wrapping-style":
          switch (subcategory) {
            case "flowers-in-a-box":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Wrapping Style > Flowers in a Box";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Flowers in a Box";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Flowers presented in a box are elegantly arranged and often used for special and sophisticated presentations.";
              break;
            case "flowers-in-vase":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Wrapping Style > Flowers in Vase";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Flowers in Vase";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Bouquets in a vase are ready to display and can be a thoughtful gift that adds lasting beauty to any space.";
              break;
            case "ribbon-wrapped":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Wrapping Style > Ribbon Wrapped";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Ribbon Wrapped";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Ribbon-wrapped bouquets are aesthetically pleasing and add a touch of charm with the carefully tied ribbon.";
              break;
            case "flower-basket":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Wrapping Style > Flower Basket";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Flower Basket";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Flower baskets offer a rustic and charming presentation, perfect for various occasions and easy to carry.";
              break;
            case "cellophane-wrapped":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Wrapping Style > Cellophane Wrapped";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Cellophane Wrapped";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Cellophane-wrapped bouquets are commonly used for their practicality and the ability to display the flowers clearly.";
              break;
            case "tissue-wrapped":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Wrapping Style > Tissue Wrapped";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Tissue Wrapped";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Tissue-wrapped bouquets provide a soft and delicate presentation, often used for intimate and heartfelt occasions.";
              break;
          }
          break;
        case "arrangement-type":
          switch (subcategory) {
            case "heart-shape":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Arrangement Type > Heart Shape";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Heart Shape";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Heart-shaped arrangements are often used for romantic occasions, symbolizing love and affection.";
              break;
            case "flower-basket":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Arrangement Type > Flower Basket";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Flower Basket";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Flower baskets are charming and practical, making them great for gifting and easy to carry.";
              break;
            case "flower-in-glass":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Arangement Type > Flowers in Glass";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Flowers in Glass";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Flowers in glass arrangements are elegant and offer a clear view of the flowers' beauty and stems.";
              break;
            case "hand-bouquet":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Arrangement Type > Hand Bouquet";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Hand Bouquet";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Hand bouquets are versatile and can be given for various occasions, easily customizable with different flowers and wrapping styles.";
              break;
          }
          break;
        case "flower-varieties":
          switch (subcategory) {
            case "rose-bouquet":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Flower Varieties > Rose Bouquet";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Rose Bouquet";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Roses are timeless symbols of love and beauty, available in various colors, each with its own meaning.";
              break;
            case "carnations-bouquet":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Flower Varieties > Carnations Bouquet";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Carnations Bouquet";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Carnations are known for their ruffled petals and long-lasting blooms, often used in bouquets for their durability.";
              break;
            case "lily-bouquet":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Flower Varieties > Lily Bouquet";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Lily Bouquet";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Lilies have large, fragrant flowers and come in many varieties, often symbolizing purity and renewal.";
              break;
            case "mixed-flowers-bouquet":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent =
                  "Bouquets > Flower Varieties > Mixed Flowers Bouquet";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Mixed Flowers Bouquet";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Mixed flower bouquets combine different types of flowers, creating a diverse and visually appealing arrangement.";
              break;
          }
          break;
        case "pots":
          switch (subcategory) {
            case "plastic":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Pots > Plastic";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Plastic Pots";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Lightweight and durable, plastic pots are easy to move and are less likely to break.";
              break;
            case "ceramic":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Pots > Ceramic";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Ceramic pots";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Porous and heavier, ceramic pots allow for better air circulation and prevent soil from becoming waterlogged.";
              break;
            case "glass":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Pots > Glass";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Glass pots";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Glass pots are decorative and great for displaying water plants or hydroponic arrangements.";
              break;
            case "resin":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Pots > Resin";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Resin Pots";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Resin pots are weather-resistant and can mimic the appearance of more expensive materials like stone or wood.";
              break;
            case "vase":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Pots > Vase";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Vase";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Vases are typically used for cut flowers and can come in various shapes and sizes to match any decor.";
              break;
            case "hanging-pots":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Pots > Hanging-pots";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Hanging Pots";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Ideal for saving space, hanging pots are great for trailing plants and can add greenery to vertical spaces";
              break;
          }
          break;
        case "fertilizers":
          switch (subcategory) {
            case "organic":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Fertilizers > Organic";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Organic Fertilizer";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Made from natural materials like plant and animal waste, organic fertilizers release nutrients slowly and improve soil health over time.";
              break;
            case "potting-soil":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Fertilizers > Potting Soil";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Potting Soil";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "A well-draining, sterile mix specifically designed for container gardening, usually containing peat moss, perlite, and composted bark.";
              break;
            case "cocopeat":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Fertilizers > Cocopeat";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Cocopeat";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Derived from coconut husks, cocopeat is an excellent soil conditioner that retains moisture well and is environmentally friendly.";
              break;
            case "manure":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Fertilizers > Manure";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Manure";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Animal waste, such as cow or chicken manure, is rich in nutrients and helps improve soil structure and fertility.";
              break;
            case "compost":
              var breadcrumb = document.getElementById("breadcrumb1");
              if (breadcrumb) {
                breadcrumb.textContent = "Pots > Compost";
              }
              var heading = document.getElementById("heading");
              heading.textContent = "Compost";
              var info1 = document.getElementById("info1");
              info1.textContent =
                "Decomposed organic matter, compost enriches the soil with essential nutrients and beneficial microorganisms, promoting healthy plant growth.";
              break;
          }
          break;
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

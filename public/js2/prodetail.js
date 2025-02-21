fetch("/product/Loving Touch - Air Plant")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    document.getElementById("product-title").textContent = data.name;
    document.getElementById("product-price").textContent += data.price;
    document.getElementById("product-description").innerHTML = data.description;
    document.getElementById("featured-image").src = "../" + data.images[0];
    const thumbnailContainer = document.getElementById("thumbnail-container");
    data.images.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = "../" + src;
      img.alt = `Thumbnail ${index + 1}`;
      img.classList.add("small-Img");
      img.addEventListener("click", () => {
        document.getElementById("featured-image").src = "../" + src;
      });
      thumbnailContainer.appendChild(img);
    });
    console.log(data.productId);
  });

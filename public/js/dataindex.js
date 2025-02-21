fetch("http://localhost:3000/best-selling")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    if (data.length > 0) {
      const plnt1_title = document.getElementById("plnt1_title");
      const plnt1_price = document.getElementById("plnt1_price");

      const plnt2_title = document.getElementById("plnt2_title");
      const plnt2_price = document.getElementById("plnt2_price");

      const plnt3_title = document.getElementById("plnt3_title");
      const plnt3_price = document.getElementById("plnt3_price");

      const plnt4_title = document.getElementById("plnt4_title");
      const plnt4_price = document.getElementById("plnt4_price");

      const plnt5_title = document.getElementById("plnt5_title");
      const plnt5_price = document.getElementById("plnt5_price");

      const plnt6_title = document.getElementById("plnt6_title");
      const plnt6_price = document.getElementById("plnt6_price");

      const plnt7_title = document.getElementById("plnt7_title");
      const plnt7_price = document.getElementById("plnt7_price");

      const plnt8_title = document.getElementById("plnt8_title");
      const plnt8_price = document.getElementById("plnt8_price");

      const img1 = document.getElementById("pimg1_1");
      const img2 = document.getElementById("pimg1_2");
      const img3 = document.getElementById("pimg2_1");
      const img4 = document.getElementById("pimg2_2");
      const img5 = document.getElementById("pimg3_1");
      const img6 = document.getElementById("pimg3_2");
      const img7 = document.getElementById("pimg4_1");
      const img8 = document.getElementById("pimg4_2");
      const img9 = document.getElementById("pimg5_1");
      const img10 = document.getElementById("pimg5_2");
      const img11 = document.getElementById("pimg6_1");
      const img12 = document.getElementById("pimg6_2");
      const img13 = document.getElementById("pimg7_1");
      const img14 = document.getElementById("pimg7_2");
      const img15 = document.getElementById("pimg8_1");
      const img16 = document.getElementById("pimg8_2");
      
      if (data[0]) {
        plnt1_title.textContent = data[0].P_NAME;
        plnt1_price.textContent += data[0].P_PRICE;
        img1.src = data[0].PATH1;
        img2.src = data[0].PATH2;
      }
      if (data[1]) {
        plnt2_title.textContent = data[1].P_NAME;
        plnt2_price.textContent += data[1].P_PRICE;
        img3.src = data[1].PATH1;
        img4.src = data[1].PATH2;
      }
      if (data[2]) {
        plnt3_title.textContent = data[2].P_NAME;
        plnt3_price.textContent += data[2].P_PRICE;
        img5.src = data[2].PATH1;
        img6.src = data[2].PATH2;
      }
      if (data[3]) {
        plnt4_title.textContent = data[3].P_NAME;
        plnt4_price.textContent += data[3].P_PRICE;
        img7.src = data[3].PATH1;
        img8.src = data[3].PATH2;
      }
      if (data[4]) {
        plnt5_title.textContent = data[4].P_NAME;
        plnt5_price.textContent += data[4].P_PRICE;
        img9.src = data[4].PATH1;
        img10.src = data[4].PATH2;
      }
      if (data[5]) {
        plnt6_title.textContent = data[5].P_NAME;
        plnt6_price.textContent += data[5].P_PRICE;
        img11.src = data[5].PATH1;
        img12.src = data[5].PATH2;
      }
      if (data[6]) {
        plnt7_title.textContent = data[6].P_NAME;
        plnt7_price.textContent += data[6].P_PRICE;
        img13.src = data[6].PATH1;
        img14.src = data[6].PATH2;
      }
      if (data[7]) {
        plnt8_title.textContent = data[7].P_NAME;
        plnt8_price.textContent += data[7].P_PRICE;
        img15.src = data[7].PATH1;
        img16.src = data[7].PATH2;
      }
    } else {
      console.error("No best-selling products found.");
    }
  })
  .catch((error) => {
    console.error("Error fetching best-selling products: " + error.message);
  });

  fetch("http://localhost:3000/images")
  .then((response) => response.json())
  .then((data) => {
    const img1 = document.getElementById("pimg1_1");
    const img2 = document.getElementById("pimg1_2");
    const img3 = document.getElementById("pimg2_1");
    const img4 = document.getElementById("pimg2_2");
    const img5 = document.getElementById("pimg3_1");
    const img6 = document.getElementById("pimg3_2");
    const img7 = document.getElementById("pimg4_1");
    const img8 = document.getElementById("pimg4_2");
    const img9 = document.getElementById("pimg5_1");
    const img10 = document.getElementById("pimg5_2");
    const img11 = document.getElementById("pimg6_1");
    const img12 = document.getElementById("pimg6_2");
    const img13 = document.getElementById("pimg7_1");
    const img14 = document.getElementById("pimg7_2");
    const img15 = document.getElementById("pimg8_1");
    const img16 = document.getElementById("pimg8_2");

    if (data.length > 0) {
      if (data[0]) img1.src = data[0].PATH2;
      if (data[0]) img2.src = data[0].PATH1;
      if (data[1]) img3.src = data[1].PATH1;
      if (data[1]) img4.src = data[1].PATH2;
      if (data[2]) img5.src = data[2].PATH1;
      if (data[2]) img6.src = data[2].PATH2;
      if (data[3]) img7.src = data[3].PATH1;
      if (data[3]) img8.src = data[3].PATH2;
      if (data[4]) img9.src = data[4].PATH1;
      if (data[4]) img10.src = data[4].PATH2;
      if (data[5]) img11.src = data[5].PATH2;
      if (data[5]) img12.src = data[5].PATH1;
      if (data[6]) img13.src = data[6].PATH1;
      if (data[6]) img14.src = data[6].PATH2;
      if (data[7]) img15.src = data[7].PATH1;
      if (data[7]) img16.src = data[7].PATH2;
    } else {
      console.error("No images found.");
    }
  })
  .catch((error) => {
    console.error("Error fetching images: " + error.message);
  });

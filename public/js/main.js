const mobileMenuOpenBtn = document.querySelectorAll(
  "[data-mobile-menu-open-btn]"
);
const mobileMenu = document.querySelectorAll("[data-mobile-menu]");
const mobileMenuCloseBtn = document.querySelectorAll(
  "[data-mobile-menu-close-btn]"
);
const overlay = document.querySelector("[data-overlay]");

for (let i = 0; i < mobileMenuOpenBtn.length; i++) {
  // mobile menu function
  const mobileMenuCloseFunc = function () {
    mobileMenu[i].classList.remove("active");
    overlay.classList.remove("active");
  };

  mobileMenuOpenBtn[i].addEventListener("click", function () {
    mobileMenu[i].classList.add("active");
    overlay.classList.add("active");
  });

  mobileMenuCloseBtn[i].addEventListener("click", mobileMenuCloseFunc);
  overlay.addEventListener("click", mobileMenuCloseFunc);
}

// accordion variables
const accordionBtn = document.querySelectorAll("[data-accordion-btn]");
const accordion = document.querySelectorAll("[data-accordion]");

for (let i = 0; i < accordionBtn.length; i++) {
  accordionBtn[i].addEventListener("click", function () {
    const clickedBtn = this.nextElementSibling.classList.contains("active");

    for (let i = 0; i < accordion.length; i++) {
      if (clickedBtn) break;

      if (accordion[i].classList.contains("active")) {
        accordion[i].classList.remove("active");
        accordionBtn[i].classList.remove("active");
      }
    }

    this.nextElementSibling.classList.toggle("active");
    this.classList.toggle("active");
  });
}

/*=============== PRODUCTS TABS ===============*/
const tabs = document.querySelectorAll("[data-target]"),
  tabsContents = document.querySelectorAll("[content]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = document.querySelector(tab.dataset.target);

    tabsContents.forEach((tabsContent) => {
      tabsContent.classList.remove("active-tab");
    });

    target.classList.add("active-tab");

    tabs.forEach((tab) => {
      tab.classList.remove("active-tab");
    });

    tab.classList.add("active-tab");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const buttonHidder = document.querySelector("#button-hidder");
  const buttonHidder1 = document.querySelector("#button-hidder-1");
  const editButton = document.querySelector(".edit");

  if (buttonHidder) {
    buttonHidder.addEventListener("click", function () {
      this.style.display = "none";
      if (buttonHidder1) {
        buttonHidder1.style.display = "block";
      }
    });
  }

  if (buttonHidder1) {
    buttonHidder1.addEventListener("click", function () {
      if (buttonHidder) {
        buttonHidder.style.display = "block";
      }
      this.style.display = "none";
    });
  }

  if (editButton) {
    editButton.addEventListener("click", function () {
      const hideForFront = document.querySelector(".hide-for-front");
      const showForFront = document.querySelector(".show-for-front");
      if (hideForFront) {
        hideForFront.style.display = "none";
      }
      if (showForFront) {
        showForFront.style.display = "block";
      }
    });
  }
});

//product details page
const trigger = document.querySelectorAll(".tabbed-trigger");
content = document.querySelectorAll(".tabbed>div");
trigger.forEach((btn) => {
  btn.addEventListener("click", function () {
    let dataTarget = this.dataset.id,
      body = document.querySelector(`#${dataTarget}`);

    trigger.forEach((b) => b.parentNode.classList.remove("active"));
    content.forEach((s) => s.classList.remove("active"));
    this.parentNode.classList.add("active");
    body.classList.add("active");
  });
});

async function updateWishlistCount() {
  try {
    const response = await fetch("/wishlist/wishlistCount");
    const data = await response.json();
    document.getElementById("wishlist_count").textContent = data.count;
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
  }
}

async function updateCartCount() {
  try {
    const response = await fetch("/cart/cartCount");
    const data = await response.json();
    if (data.status == 401) {
      document.getElementById("cart_count").textContent = 0;
    }
    document.getElementById("cart_count").textContent = data.count;
  } catch (error) {
    console.error("Error fetching cart count:", error);
  }
}

function updateCartAndWishlistCounts() {
  updateCartCount();
  updateWishlistCount();
}
// Helper function to clean titles
function cleanTitle(title) {
  return title.replace(/_/g, " ");
}
document.addEventListener("DOMContentLoaded", function () {
  fetch("/header/menu/categories")
    .then((response) => response.json())
    .then((data) => {
      const containerElement = document.getElementById(
        "dynamic-categories-container"
      );
      if (containerElement) {
        const container = containerElement.querySelector(".dropdown-panel");
        if (container) {
          container.innerHTML = data
            .map((category) => {
              return `
                <ul class="dropdown-panel-list">
                  <li class="menu-title">
                    <a href="/${category.title
                      .toLowerCase()
                      .replace(/ /g, "_")}">${cleanTitle(category.title)}</a>
                  </li>
                  ${category.links
                    .map(
                      (link) => `
                      <li class="panel-list-item">
                        <a href="${link.url}" class="dynamic-link">${cleanTitle(
                        link.name
                      )}</a>
                      </li>
                    `
                    )
                    .join("")}
                </ul>
              `;
            })
            .join("");
        } else {
          console.error("Dropdown panel not found.");
        }
      } else {
        console.error("Dynamic categories container not found.");
      }

      const mobileMenu = document.getElementById("dynamic-mobile-menu");
      if (mobileMenu) {
        mobileMenu.innerHTML = data
          .map((category) => {
            return `
              <li class="menu-category">
                <button class="accordion-menu" data-accordion-btn>
                  <p class="menu-title">${cleanTitle(category.title)}</p>
                  <div>
                    <ion-icon name="add-outline" class="add-icon"></ion-icon>
                    <ion-icon name="remove-outline" class="remove-icon"></ion-icon>
                  </div>
                </button>
                <ul class="submenu-category-list" data-accordion>
                  ${category.links
                    .map(
                      (link) => `
                      <li class="submenu-category">
                        <a href="${link.url}" class="dynamic-link">${cleanTitle(
                        link.name
                      )}</a>
                      </li>
                    `
                    )
                    .join("")}
                </ul>
              </li>
            `;
          })
          .join("");
      } else {
        console.error("Mobile menu container not found.");
      }
    })
    .catch((error) => console.error("Error fetching categories:", error));
});

// Call the function to update the cart count on page load
window.onload = updateCartAndWishlistCounts;

fetch("/feedback/")
  .then((response) => response.json())
  .then((data) => {
    const feedback = document.getElementById("feedback");

    // Limit the number of feedback items to display
    const limitedData = data.slice(0, 3);

    feedback.innerHTML = limitedData
      .map(
        (item) => `
        <div class="feedback-item">
          <div class="feedback-row">
            <div class="feedback-category"><strong>Category:</strong> ${item.CY_NAME}</div>
            <div class="feedback-comment"><strong>Comment:</strong> ${item.F_DESC}</div>
            <div class="feedback-author"><strong>Author:</strong> ${item.C_USERNAME}</div>
          </div>
        </div>
      `
      )
      .join("");
  })
  .catch((error) => console.error("Error fetching feedback:", error));

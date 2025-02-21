const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
const overlay = document.querySelector('[data-overlay]');

for (let i = 0; i < mobileMenuOpenBtn.length; i++) {

  // mobile menu function
  const mobileMenuCloseFunc = function () {
    mobileMenu[i].classList.remove('active');
    overlay.classList.remove('active');
  }

  mobileMenuOpenBtn[i].addEventListener('click', function () {
    mobileMenu[i].classList.add('active');
    overlay.classList.add('active');
  });

  mobileMenuCloseBtn[i].addEventListener('click', mobileMenuCloseFunc);
  overlay.addEventListener('click', mobileMenuCloseFunc);

}

// accordion variables
const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
const accordion = document.querySelectorAll('[data-accordion]');

for (let i = 0; i < accordionBtn.length; i++) {

  accordionBtn[i].addEventListener('click', function () {

    const clickedBtn = this.nextElementSibling.classList.contains('active');

    for (let i = 0; i < accordion.length; i++) {

      if (clickedBtn) break;

      if (accordion[i].classList.contains('active')) {

        accordion[i].classList.remove('active');
        accordionBtn[i].classList.remove('active');

      }

    }

    this.nextElementSibling.classList.toggle('active');
    this.classList.toggle('active');

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

// let featuredImg = document.getElementById("featured-image");
// let smallImgs = document.getElementsByClassName("small-Img");

// for (let i = 0; i < smallImgs.length; i++) {
//   smallImgs[i].addEventListener("click", () => {
//     featuredImg.src = smallImgs[i].src;
//     for (let j = 0; j < smallImgs.length; j++) {
//       if (i === j) {
//         smallImgs[j].classList.add("sm-card");
//       } else {
//         smallImgs[j].classList.remove("sm-card");
//       }
//     }
//   });
// }

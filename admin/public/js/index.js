
// Document operation functions
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

// Show Sidebar
menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

// Hide Sidebar
closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});

// Change Theme
themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");

  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
});

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

const trigger=document.querySelectorAll('.tabbed-trigger');
    content=document.querySelectorAll('.tabbed>div');
    trigger.forEach((btn)=>{
        btn.addEventListener('click',function(){
            let dataTarget=this.dataset.id,
                body=document.querySelector(`#${dataTarget}`);

            trigger.forEach((b)=>b.parentNode.classList.remove('active'));
            content.forEach((s)=>s.classList.remove('active'));
            this.parentNode.classList.add('active');
            body.classList.add('active');
        });
    });


// document.addEventListener("DOMContentLoaded", function() {
//   const toggle = document.querySelector(".dropdown-toggle");
//   const dropdown = document.querySelector(".dropdown-menu");

//   toggle.addEventListener("click", function(event) {
//       event.preventDefault();
//       dropdown.classList.toggle("open");
//   });

//   document.addEventListener("click", function(event) {
//       if (!event.target.closest(".info")) {
//           dropdown.classList.remove("open");
//       }
//   });
// })

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

function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.toggle('active');
}

window.onclick = function(event) {
    if (!event.target.matches('.profile-photo')) {
        var dropdowns = document.getElementsByClassName("dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('active')) {
                openDropdown.classList.remove('active');
            }
        }
    }
}

// Toggle Export Menu
// const exportBtn = document.querySelector('.export-btn');
// const exportMenu = document.querySelector('.export-menu');

// exportBtn.addEventListener('click', function() {
//     exportMenu.classList.toggle('show');
// });

// Close menu if clicked outside
// document.addEventListener('click', function(event) {
//     if (!exportBtn.contains(event.target) && !exportMenu.contains(event.target)) {
//         exportMenu.classList.remove('show');
//     }
// });

// // Export Functionality
// const exportOptions = document.querySelectorAll('.export-option');
// exportOptions.forEach(option => {
//     option.addEventListener('click', function(e) {
//         e.preventDefault();
//         const type = this.getAttribute('data-type');
//         alert(`Export as ${type} - Feature coming soon!`);
//     });
// });

// Assuming this is in your client-side JS file

document.getElementById('add-field').addEventListener('click', function() {
  const fieldName = document.getElementById('field-name').value;
  const fieldType = document.getElementById('field-type').value;
  
  if (!fieldName || !fieldType) {
      alert('Please enter both field name and type.');
      return;
  }
  
  const list = document.getElementById('field-list');
  const item = document.createElement('div');
  item.innerHTML = `<span>${fieldName} (${fieldType})</span> 
                    <button onclick="removeField(this)">Remove</button>`;
  list.appendChild(item);

  document.getElementById('field-name').value = '';
  document.getElementById('field-type').selectedIndex = 0;
});

function removeField(button) {
  button.parentElement.remove();
}

document.getElementById('create-table').addEventListener('click', async function (event) {
  event.preventDefault();

  const createButton = event.target;
  createButton.disabled = true; // Prevent multiple clicks

  const categorySelect = document.getElementById('prod-cat');
  const categoryID = categorySelect.value.trim();
  const categoryName = categorySelect.options[categorySelect.selectedIndex]?.text.trim();

  if (!categoryID || categoryID === '') {
      alert('Error: Category must be selected.');
      createButton.disabled = false;
      return;
  }

  const fieldElements = Array.from(document.getElementById('field-list').children);

  const fields = fieldElements.map(div => {
      const span = div.querySelector('span');
      if (!span) return null;

      const fieldParts = span.textContent.split('(').map(s => s.trim());
      if (fieldParts.length < 2) {
          console.error('Invalid field format:', span.textContent);
          return null;
      }

      const fieldName = fieldParts[0];
      const fieldType = fieldParts[1].slice(0, -1); // Remove the closing parenthesis

      if (!fieldName || !fieldType) return null;
      return { name: fieldName, type: fieldType.toUpperCase() };
  }).filter(field => field !== null);

  if (fields.length === 0) {
      alert('Error: No valid fields detected.');
      createButton.disabled = false;
      return;
  }

  console.log("Sending request with data:", { categoryName, fields });

  try {
      const response = await fetch('/category/create-table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryName, fields }) // Send categoryName instead of ID
      });

      const result = await response.json();
      console.log("Response from server:", result);

      if (result.success) {
          alert(`Table '${categoryName}' created successfully!`);
          document.getElementById('field-list').innerHTML = ''; // Clear fields after success
      } else {
          alert('Error: ' + result.error);
      }
  } catch (error) {
      console.error('Request Error:', error);
      alert('An error occurred while creating the table.');
  } finally {
      createButton.disabled = false; // Re-enable button after request
  }
});


function loadCategories() {
  fetch('/category/get-categories')
      .then(response => response.json())
      .then(categories => {
          const categorySelect = document.getElementById("prod-cat");
          categorySelect.innerHTML = '<option value="">Select Category</option>';
          categories.forEach(cat => {
              // Using uppercase property names as per the JSON response
              categorySelect.innerHTML += `<option value="${cat.CY_ID}">${cat.CY_NAME}</option>`;
          });
      })
      .catch(error => console.error('Error fetching categories:', error));
}

  document.addEventListener("DOMContentLoaded", function() {
    loadCategories(); // Load first page
  });
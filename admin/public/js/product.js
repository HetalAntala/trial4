let currentPage = 1;

function fetchProducts(page = 1) {
    fetch(`/product/products?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const productTable = document.getElementById("product-details");
            productTable.innerHTML = ""; // Clear existing data

            if (Array.isArray(data.products) && data.products.length > 0) {
                data.products.forEach(product => {
                    const row = `
                        <tr>
                            <td>${product.Product_id}</td>
                            <td>${product.product_name || 'N/A'}</td>
                            <td>${product.description || 'N/A'}</td>
                            <td>${product.price || 'N/A'}</td>
                            <td>
                                <img src="/${product.image}" alt="${product.product_name}" width="100">
                            </td>
                            <td>${product.category}</td>
                        </tr>
                    `;
                    productTable.innerHTML += row;
                });
                updatePagination(data.totalPages, data.currentPage);
            } else {
                productTable.innerHTML = `<tr><td colspan="6">No products found.</td></tr>`;
            }
        })
        .catch(error => {
            console.error("Error fetching products:", error);
        });
}

function updatePagination(totalPages, currentPage) {
    const paginationControls = document.getElementById("pagination-controls");
    paginationControls.innerHTML = "";

    // Previous Button
    if (currentPage > 1) {
        paginationControls.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">&lt;</a>
            </li>`;
    }

    // Page Numbers (Display max 3 at a time)
    const maxPages = 3;
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(startPage + maxPages - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        paginationControls.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>`;
    }

    // Next Button
    if (currentPage < totalPages) {
        paginationControls.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">&gt;</a>
            </li>`;
    }
}

function changePage(page) {
    currentPage = page;
    fetchProducts(page);
}
function fetchCategories2() {
    fetch('/product/categories2')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById("prod_catt");
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat.CY_ID}">${cat.CY_NAME}</option>`;
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}
// function fetchProductsByCategory() {
//     const categoryId = document.getElementById("prod_catt").value;
//     if (!categoryId) return;

//     fetch(`/product/category/${categoryId}/products`)
//         .then(response => response.json())
//         .then(products => {
//             const productTable = document.getElementById("product-details");
//             productTable.innerHTML = "";

//             if (products.length === 0) {
//                 productTable.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
//                 return;
//             }

//             products.forEach(product => {
//                 productTable.innerHTML += `
//                     <tr>
//                         <td>${product.P_ID}</td>
//                         <td>${product.P_NAME}</td>
//                         <td>${product.P_DESC}</td>
//                         <td>${product.P_PRICE}</td>
//                         <td><img src="${product.P_IMAGE}" alt="Product Image" width="50"></td>
//                         <td>${product.CY_NAME}</td>
//                     </tr>
//                 `;
//             });
//         })
//         .catch(error => console.error('Error fetching products:', error));
// }
// document.getElementById("prod_catt").addEventListener("change", async function() {
//     const categoryId = this.value;
    
//     if (!categoryId) return;

//     try {
//         const response = await fetch(`/product/get-products?category=${categoryId}`);
//         const data = await response.json();
        
//         if (data.success) {
//             displayProducts(data.products);
//         } else {
//             console.error("Error fetching products:", data.error);
//         }
//     } catch (error) {
//         console.error("Network error:", error);
//     }
// });


function displayProducts(products) {
    const tableBody = document.getElementById('product-details');
    tableBody.innerHTML = ""; // Clear previous data

    if (products.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='6' class='text-center'>No products found</td></tr>";
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${product.P_ID || 'N/A'}</td>
            <td>${product.P_NAME || 'N/A'}</td>
            <td>${product.P_DESC || 'N/A'}</td>
            <td>${product.P_PRICE || 'N/A'}</td>
            <td><img src="/uploads/${product.P_IMAGE || 'default.jpg'}" alt="Product Image" width="50"></td>
            <td>${product.CY_ID || 'N/A'}</td>
        `;

        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    fetchProducts(); // Load first page
    fetchCategories1();
    fetchCategories2();
});
function fetchCategories1() {
    fetch('/product/categories1')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById("prodcat");
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat.CY_ID}">${cat.CY_NAME}</option>`; // ✅ Correctly setting ID
            });
              categorySelect.addEventListener("change", handleCategoryChange1);
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// ✅ Fetch Categories for the first dropdown
// function fetchCategories1() {
//     fetch('/product/categories1')
//         .then(response => response.json())
//         .then(categories => {
//             const categorySelect = document.getElementById("prodcat");
//             categorySelect.innerHTML = '<option value="">Select Category</option>';

//             if (categories.length === 0) {
//                 categorySelect.innerHTML = '<option value="">No categories found</option>';
//                 return;
//             }

//             categories.forEach(cat => {
//                 const option = document.createElement("option");
//                 option.value = cat.CY_ID;
//                 option.textContent = cat.CY_NAME;
//                 categorySelect.appendChild(option);
//             });

//             // ✅ Attach event listener for category change
//             categorySelect.addEventListener("change", handleCategoryChange1);
//         })
//         .catch(error => console.error("Error fetching categories:", error));
// }

// ✅ Fetch Subcategories based on selected Category
function handleCategoryChange1() {
    const categoryId = document.getElementById("prodcat").value;
    const subcategorySelect = document.getElementById("prodsubcat");
    const subsubCategorySelect = document.getElementById("prodsubsubcat");

    // Clear previous selections
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    subsubCategorySelect.innerHTML = '<option value="">Select Sub Subcategory</option>';

    if (!categoryId) return;

    fetch(`/product/category/${categoryId}/subcategories`)
        .then(response => response.json())
        .then(subcategories => {
            if (subcategories.length === 0) {
                subcategorySelect.innerHTML = '<option value="">No subcategories found</option>';
                return;
            }

            subcategories.forEach(sub => {
                const option = document.createElement("option");
                option.value = sub.sub_id;
                option.textContent = sub.sub_name;
                subcategorySelect.appendChild(option);
            });

            // ✅ Attach event listener for subcategory change
            subcategorySelect.addEventListener("change", handleSubcategoryChange1);
        })
        .catch(error => console.error("Error fetching subcategories:", error));
}

// ✅ Fetch Sub-Subcategories based on selected Subcategory
function handleSubcategoryChange1() {
    const subcategoryId = document.getElementById("prodsubcat").value;
    const subsubCategorySelect = document.getElementById("prodsubsubcat");

    // Clear previous selection
    subsubCategorySelect.innerHTML = '<option value="">Select Sub Subcategory</option>';

    if (!subcategoryId) return;

    fetch(`/product/subcategory/${subcategoryId}/subsubcategories`)
        .then(response => response.json())
        .then(subsubcategories => {
            if (subsubcategories.length === 0) {
                subsubCategorySelect.innerHTML = '<option value="">No sub-subcategories found</option>';
                return;
            }

            subsubcategories.forEach(subsub => {
                const option = document.createElement("option");
                option.value = subsub.subsub_id;
                option.textContent = subsub.subsub_name;
                subsubCategorySelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching sub-subcategories:", error));
}


// Fetch Sub-Subcategories based on selected Subcategory
// document.getElementById("prod_subcat").addEventListener('change', function() {
//     const subcategoryId = document.getElementById("prod_subcat").value;
//     fetch(`/product/subcategory/${subcategoryId}/subsubcategories`)
//         .then(response => response.json())
//         .then(subsubcategories => {
//             const subsubcategorySelect = document.getElementById("prod_subsubcat");
//             subsubcategorySelect.innerHTML = '<option value="">Select Sub-Subcategory</option>';
//             subsubcategories.forEach(subsub => {
//                 subsubcategorySelect.innerHTML += `<option value="${subsub.ss_id}">${subsub.ss_name}</option>`;
//             });
//         })
//         .catch(error => console.error('Error fetching sub-subcategories:', error));
// });

// document.getElementById('addProductForm').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const data = Object.fromEntries(formData);

//     const response = await fetch('/product/products', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     });

//     const result = await response.json();
//     alert(result.message);
// });

document.getElementById('prodcat').addEventListener('change', async function () {
    const categoryId = this.value;  // ✅ Get the selected category ID
    const categoryName = this.options[this.selectedIndex]?.text.trim(); // ✅ Get category name

    if (!categoryId) {
        console.error("Category ID is undefined");
        return;
    }

    try {
        const response = await fetch(`/product/get-fields?category=${encodeURIComponent(categoryName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            generateForm(data.fields, categoryName, categoryId); // ✅ Pass categoryId correctly
        } else {
            alert("Error fetching fields: " + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch fields. Check console for details.');
    }
});


async function fetchFieldTypes(tableName) {
    try {
        const response = await fetch(`/product/get-field-types?tableName=${tableName}`);
        const data = await response.json();
        return data.fields || []; // Returns [{ name: 'P_PRICE', type: 'int' }, { name: 'P_NAME', type: 'varchar(255)' }]
    } catch (error) {
        console.error("Error fetching field types:", error);
        return [];
    }
}


// async function generateForm(fields, categoryName, categoryId) {
//     const formContainer = document.getElementById('product-form-container');
//     formContainer.innerHTML = `<h3>Add Product to ${categoryName}</h3>`;

//     const form = document.createElement('form');
//     form.id = 'product-form';
//     form.enctype = 'multipart/form-data';

//     // Get Table Name
//     let tableName = categoryName.toLowerCase().replace(/\s+/g, '_');

//     // Fetch primary key dynamically
//     let primaryKey = await fetchPrimaryKey(tableName);
//     let newProductId = await fetchLastProductId(tableName, primaryKey);

//     // ✅ Hidden Category ID Field
//     form.appendChild(createHiddenField('categoryId', categoryId));

//     // ✅ Read-Only Product ID Field
//     form.appendChild(createReadOnlyField("Product ID", primaryKey, newProductId));

//     // ✅ Read-Only Category ID Field
//     form.appendChild(createReadOnlyField("Category ID", "CY_ID", categoryId));

//     // ✅ Generate fields dynamically with correct input types
//     fields.forEach(field => {
//         if (field.name === primaryKey || field.name === "CY_ID") return;
//         form.appendChild(createInputField(field));
//     });

//     // ✅ Image Upload Fields
//     for (let i = 1; i <= 3; i++) {
//         form.appendChild(createFileInputField(`Upload Image ${i}`, `prod_img${i}`));
//     }

//     // ✅ Submit Button
//     const submitButton = document.createElement('button');
//     submitButton.textContent = 'Add Product';
//     submitButton.type = 'submit';
//     submitButton.className = 'btn';
//     form.appendChild(submitButton);

//     formContainer.appendChild(form);

//     // ✅ Handle Form Submission
//     form.addEventListener('submit', async function (event) {
//         event.preventDefault();
//         const formData = new FormData(form);

//         const productData = {};
//         formData.forEach((value, key) => {
//             if (!value || value === 'undefined') return;
//             productData[key] = value;
//         });

//         // ✅ Extract Image File Names
//         const images = [];
//         for (let i = 1; i <= 3; i++) {
//             let fileInput = formData.get(`prod_img${i}`);
//             if (fileInput && fileInput.name) {
//                 images.push(fileInput.name);
//             }
//         }

//         console.log("Final Collected Data:", { categoryId, productData, images });

//         if (!categoryId || Object.keys(productData).length === 0) {
//             alert('Error: Missing required product details.');
//             return;
//         }

//         try {
//             const response = await fetch('/product/add', {
//                 method: 'POST',
//                 body: JSON.stringify({ categoryId, productData, images }),
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             const result = await response.json();
//             if (result.success) {
//                 alert('Product added successfully!');
//                 form.reset();
//             } else {
//                 alert('Error: ' + result.error);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             alert('Failed to add product.');
//         }
//     });
// }


// ✅ Create a Read-Only Field
function createReadOnlyField(labelText, name, value) {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `<label>${labelText}:</label><input type="text" name="${name}" value="${value}" readonly>`;
    return div;
}

// ✅ Create a Hidden Field
function createHiddenField(name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
}

async function generateForm(fields, categoryName, categoryId) {
    const formContainer = document.getElementById('product-form-container');
    formContainer.innerHTML = `<h3>Add Product to ${categoryName}</h3>`;

    const form = document.createElement('form');
    form.id = 'product-form';
    form.enctype = 'multipart/form-data';

    // Get Table Name
    let tableName = categoryName.toLowerCase().replace(/\s+/g, '_');

    // Fetch primary key dynamically
    let primaryKey = await fetchPrimaryKey(tableName);
    let newProductId = await fetchLastProductId(tableName, primaryKey);

    // ✅ Hidden Category ID Field
    form.appendChild(createHiddenField('categoryId', categoryId));

    // ✅ Read-Only Product ID Field
    form.appendChild(createReadOnlyField("Product ID", primaryKey, newProductId));

    // ✅ Read-Only Category ID Field
    form.appendChild(createReadOnlyField("Category ID", "CY_ID", categoryId));

    // ✅ Generate fields dynamically with correct input types
    fields.forEach(field => {
        if (field.name === primaryKey || field.name === "CY_ID") return;
        form.appendChild(createInputField(field));
    });

    // ✅ Image Upload Fields
    for (let i = 1; i <= 3; i++) {
        form.appendChild(createFileInputField(`Upload Image ${i}`, `prod_img${i}`));
    }

    // ✅ Submit Button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Add Product';
    submitButton.type = 'submit';
    submitButton.className = 'btn';
    form.appendChild(submitButton);

    formContainer.appendChild(form);

    // ✅ Handle Form Submission
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(form);

        const productData = {};
        formData.forEach((value, key) => {
            if (!value || value === 'undefined') return;
            productData[key] = value;
        });

        // ✅ Extract Image File Names
        const images = [];
        for (let i = 1; i <= 3; i++) {
            let fileInput = formData.get(`prod_img${i}`);
            if (fileInput && fileInput.name) {
                images.push(fileInput.name);
            }
        }

        console.log("Final Collected Data:", { categoryId, productData, images });

        if (!categoryId || Object.keys(productData).length === 0) {
            alert('Error: Missing required product details.');
            return;
        }

        try {
            const response = await fetch('/product/add', {
                method: 'POST',
                body: JSON.stringify({ categoryId, productData, images }),
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();
            if (result.success) {
                alert('Product added successfully!');
                form.reset();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add product.');
        }
    });
}


// ✅ Create a File Input Field for Images
function createFileInputField(labelText, name) {
    const div = document.createElement('div');
    div.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = labelText;
    div.appendChild(label);

    const input = document.createElement('input');
    input.type = 'file';
    input.name = name;
    input.accept = "image/*";
    div.appendChild(input);

    return div;
}
function createInputField(field) {
    const div = document.createElement('div');
    div.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = field.name;
    div.appendChild(label);

    const input = document.createElement('input');
    input.name = field.name;
    input.required = true;

    // ✅ Dynamically set input type based on database field type
    if (field.type.includes('int') || field.type.includes('decimal') || field.type.includes('float') || field.type.includes('double')) {
        input.type = 'number';
    } else if (field.type.includes('varchar') || field.type.includes('text')) {
        input.type = 'text';
    } else if (field.type.includes('date') || field.type.includes('datetime') || field.type.includes('timestamp')) {
        input.type = 'date';
    } else if (field.type.includes('boolean') || field.type.includes('tinyint(1)')) {
        input.type = 'checkbox';
    } else {
        input.type = 'text'; // Default fallback
    }

    div.appendChild(input);
    return div;
}


async function fetchPrimaryKey(tableName) {
    try {
        const response = await fetch(`/product/get-primary-key?tableName=${tableName}`);
        const data = await response.json();
        return data.primaryKey || "P_ID"; // Default Primary Key if not found
    } catch (error) {
        console.error("Error fetching primary key:", error);
        return "P_ID";
    }
}

async function fetchLastProductId(tableName, primaryKey) {
    try {
        const response = await fetch(`/product/last-id?tableName=${tableName}`);
        const data = await response.json();

        if (data.lastId) {
            // ✅ Extract numeric part & increment it properly
            const lastIdNumber = parseInt(data.lastId.replace(/\D/g, ''), 10) || 0;
            const prefix = data.lastId.match(/[A-Za-z]+/)[0]; // Extract letters (prefix)
            return `${prefix}${String(lastIdNumber + 1).padStart(4, '0')}`;
        }
    } catch (error) {
        console.error('Error fetching last product ID:', error);
    }
    return `${primaryKey.split('_')[0]}0001`; // Default if no previous product exists
}

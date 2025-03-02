let currentPage = 1;
let currentCategoryId = null; // Track the currently selected category ID
let currentTableName = null; // Track the currently selected table name

// Fetch categories for the dropdown
function fetchCategories2() {
    fetch('/product/categories2', { credentials: 'include' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(categories => {
            const categorySelect = document.getElementById("prod_catt");
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            if (categories.length === 0) {
                categorySelect.innerHTML += '<option value="">No categories found</option>';
            } else {
                categories.forEach(cat => {
                    categorySelect.innerHTML += `<option value="${cat.CY_ID}" data-name="${cat.CY_NAME}">${cat.CY_NAME}</option>`;
                });
            }
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            document.getElementById("product-details").innerHTML = `
                <tr><td colspan="6" class="text-center">Error loading categories</td></tr>
            `;
        });
}

// Fetch products by category and table name when dropdown changes
function fetchProductsByCategory(page = 1) {
    const categorySelect = document.getElementById("prod_catt");
    const categoryId = categorySelect.value;
    const categoryName = categorySelect.options[categorySelect.selectedIndex]?.getAttribute('data-name') || '';

    currentCategoryId = categoryId; // Update the current category
    currentPage = page; // Update the current page

    if (!categoryId || !categoryName) {
        // Clear the table if no category is selected
        const productTable = document.getElementById("product-details");
        productTable.innerHTML = `
            <tr><td colspan="6" class="text-center">Please select a category to view products</td></tr>
        `;
        document.getElementById("pagination-controls").innerHTML = "";
        return;
    }

    // Derive the table name from the category name (e.g., "Plants" -> "plants")
    currentTableName = categoryName.toLowerCase().replace(/\s+/g, '_');

    fetch(`/product/table/${currentTableName}/products?page=${page}`, { credentials: 'include' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const productTable = document.getElementById("product-details");
            productTable.innerHTML = "";

            if (data.products && data.products.length > 0) {
                data.products.forEach(product => {
                    const row = `
                        <tr>
                            <td>${product.Product_id || product.P_ID || 'N/A'}</td>
                            <td>${product.product_name || product.P_NAME || 'N/A'}</td>
                            <td>${product.description || product.P_DESC || 'N/A'}</td>
                            <td>${product.price || product.P_PRICE || 'N/A'}</td>
                            <td>
                                <img src="${product.image || product.P_IMAGE || 'default.jpg'}" alt="${product.product_name || product.P_NAME || 'Product'}" width="50">
                            </td>
                            <td>${categoryName}</td>
                            <td>
                                <button class="btn" onclick="openEditModal('${product.Product_id}', '${product.product_name}', '${product.description || ''}', '${product.price}')">Edit</button>
                                <button class="btn" onclick="deleteProduct('${product.Product_id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                    productTable.innerHTML += row;
                });
                updatePagination(data.totalPages, data.currentPage);
            } else {
                productTable.innerHTML = `<tr><td colspan="6" class="text-center">No products found for this category</td></tr>`;
                document.getElementById("pagination-controls").innerHTML = "";
            }
        })
        .catch(error => {
            console.error("Error fetching products:", error);
            document.getElementById("product-details").innerHTML = `
                <tr><td colspan="6" class="text-center">Error loading products: ${error.message}</td></tr>
            `;
            document.getElementById("pagination-controls").innerHTML = "";
        });
}

function updatePagination(totalPages, currentPage) {
    const paginationControls = document.getElementById("pagination-controls");
    paginationControls.innerHTML = "";

    // Previous Button
    if (currentPage > 1) {
        paginationControls.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="fetchProductsByCategory(${currentPage - 1}); return false;"><</a>
            </li>`;
    }

    // Page Numbers (Display max 3 at a time)
    const maxPages = 3;
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(startPage + maxPages - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        paginationControls.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="fetchProductsByCategory(${i}); return false;">${i}</a>
            </li>`;
    }

    // Next Button
    if (currentPage < totalPages) {
        paginationControls.innerHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="fetchProductsByCategory(${currentPage + 1}); return false;">></a>
            </li>`;
    }
}

// Open edit modal
function openEditModal(productId, name, description, price) {
    const modal = document.getElementById("editProductModal");
    document.getElementById("edit-product-id").value = productId;
    document.getElementById("edit-product-name").value = name;
    document.getElementById("edit-product-desc").value = description;
    document.getElementById("edit-product-price").value = price;
    modal.style.display = "block";
}

// Close edit modal
function closeEditModal() {
    document.getElementById("editProductModal").style.display = "none";
}

// Handle edit form submission
document.getElementById("editProductForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const productId = document.getElementById("edit-product-id").value;
    const productData = {
        product_name: document.getElementById("edit-product-name").value,
        description: document.getElementById("edit-product-desc").value,
        price: document.getElementById("edit-product-price").value
    };
    const images = [
        document.getElementById("edit-prod-img1").files[0]?.name || null,
        document.getElementById("edit-prod-img2").files[0]?.name || null,
        document.getElementById("edit-prod-img3").files[0]?.name || null
    ].filter(img => img); // Filter out null values

    try {
        const response = await fetch('/product/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName: currentTableName, productId, productData, images }),
            credentials: 'include'
        });

        const result = await response.json();
        if (result.success) {
            alert("Product updated successfully!");
            closeEditModal();
            fetchProductsByCategory(currentPage); // Refresh table
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error updating product:", error);
        alert("Failed to update product.");
    }
});
// Delete product
function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    fetch(`/product/delete/${currentTableName}/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Product deleted successfully!");
            fetchProductsByCategory(currentPage); // Refresh table
        } else {
            alert("Error: " + result.error);
        }
    })
    .catch(error => {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
    });
}
// Unchanged functions below
function fetchCategories1() {
    fetch('/product/categories1', { credentials: 'include' })
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById("prodcat");
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat.CY_ID}">${cat.CY_NAME}</option>`;
            });
            categorySelect.addEventListener("change", handleCategoryChange1);
        })
        .catch(error => console.error('Error fetching categories:', error));
}

function handleCategoryChange1() {
    const categoryId = document.getElementById("prodcat").value;
    const subcategorySelect = document.getElementById("prodsubcat");
    const subsubCategorySelect = document.getElementById("prodsubsubcat");

    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    subsubCategorySelect.innerHTML = '<option value="">Select Sub Subcategory</option>';

    if (!categoryId) return;

    fetch(`/product/category/${categoryId}/subcategories`, { credentials: 'include' })
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

            subcategorySelect.addEventListener("change", handleSubcategoryChange1);
        })
        .catch(error => console.error("Error fetching subcategories:", error));
}

function handleSubcategoryChange1() {
    const subcategoryId = document.getElementById("prodsubcat").value;
    const subsubCategorySelect = document.getElementById("prodsubsubcat");

    subsubCategorySelect.innerHTML = '<option value="">Select Sub Subcategory</option>';

    if (!subcategoryId) return;

    fetch(`/product/subcategory/${subcategoryId}/subsubcategories`, { credentials: 'include' })
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

document.getElementById('prodcat').addEventListener('change', async function () {
    const categoryId = this.value;
    const categoryName = this.options[this.selectedIndex]?.text.trim();

    if (!categoryId) {
        console.error("Category ID is undefined");
        return;
    }

    try {
        const response = await fetch(`/product/get-fields?category=${encodeURIComponent(categoryName)}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            generateForm(data.fields, categoryName, categoryId);
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
        const response = await fetch(`/product/get-field-types?tableName=${tableName}`, { credentials: 'include' });
        const data = await response.json();
        return data.fields || [];
    } catch (error) {
        console.error("Error fetching field types:", error);
        return [];
    }
}

async function generateForm(fields, categoryName, categoryId) {
    const formContainer = document.getElementById('product-form-container');
    formContainer.innerHTML = `<h3>Add Product to ${categoryName}</h3>`;

    const form = document.createElement('form');
    form.id = 'product-form';
    form.enctype = 'multipart/form-data';

    let tableName = categoryName.toLowerCase().replace(/\s+/g, '_');
    let primaryKey = await fetchPrimaryKey(tableName);
    let newProductId = await fetchLastProductId(tableName, primaryKey);

    form.appendChild(createHiddenField('categoryId', categoryId));
    form.appendChild(createReadOnlyField("Product ID", primaryKey, newProductId));
    form.appendChild(createReadOnlyField("Category ID", "CY_ID", categoryId));

    fields.forEach(field => {
        if (field.name === primaryKey || field.name === "CY_ID") return;
        form.appendChild(createInputField(field));
    });

    for (let i = 1; i <= 3; i++) {
        form.appendChild(createFileInputField(`Upload Image ${i}`, `prod_img${i}`));
    }

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Add Product';
    submitButton.type = 'submit';
    submitButton.className = 'btn';
    form.appendChild(submitButton);

    formContainer.appendChild(form);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(form);

        const productData = {};
        formData.forEach((value, key) => {
            if (!value || value === 'undefined') return;
            productData[key] = value;
        });

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
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
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

function createReadOnlyField(labelText, name, value) {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `<label>${labelText}:</label><input type="text" name="${name}" value="${value}" readonly>`;
    return div;
}

function createHiddenField(name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
}

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

    if (field.type.includes('int') || field.type.includes('decimal') || field.type.includes('float') || field.type.includes('double')) {
        input.type = 'number';
    } else if (field.type.includes('varchar') || field.type.includes('text')) {
        input.type = 'text';
    } else if (field.type.includes('date') || field.type.includes('datetime') || field.type.includes('timestamp')) {
        input.type = 'date';
    } else if (field.type.includes('boolean') || field.type.includes('tinyint(1)')) {
        input.type = 'checkbox';
    } else {
        input.type = 'text';
    }

    div.appendChild(input);
    return div;
}

async function fetchPrimaryKey(tableName) {
    try {
        const response = await fetch(`/product/get-primary-key?tableName=${tableName}`, { credentials: 'include' });
        const data = await response.json();
        return data.primaryKey || "P_ID";
    } catch (error) {
        console.error("Error fetching primary key:", error);
        return "P_ID";
    }
}

async function fetchLastProductId(tableName, primaryKey) {
    try {
        const response = await fetch(`/product/last-id?tableName=${tableName}`, { credentials: 'include' });
        const data = await response.json();

        if (data.lastId) {
            const lastIdNumber = parseInt(data.lastId.replace(/\D/g, ''), 10) || 0;
            const prefix = data.lastId.match(/[A-Za-z]+/)[0];
            return `${prefix}${String(lastIdNumber + 1).padStart(4, '0')}`;
        }
    } catch (error) {
        console.error('Error fetching last product ID:', error);
    }
    return `${primaryKey.split('_')[0]}0001`;
}

document.addEventListener("DOMContentLoaded", function() {
    fetchCategories1();
    fetchCategories2();
});
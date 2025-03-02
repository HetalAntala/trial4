

const fetchCategories = async () => {
    try {
        console.log('Fetching categories...');
        const response = await fetch('/category/categories');
        console.log('Response Status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categories = await response.json();
        console.log('Fetched Categories:', categories);
        
        const tableBody = document.getElementById('cat-list');
        tableBody.innerHTML = ''; // Clear existing data

        categories.forEach(category => {
            // Display Category Row
            let row = `
                <tr id="category-row-${category.category_id}">
                    <td>${category.category_id}</td>
                    <td id="cat-name-${category.category_id}">${category.category_name}</td>
                    <td>${category.category_desc ? category.category_desc : 'No description'}</td>
                    <td>
                        <img src="/images/${category.category_image}" alt="${category.category_name}" width="50">
                    </td>
                    <td>
                        <button class="btn" onclick="openUpdateModal('${category.category_id}', '${category.category_name}', '${category.category_desc ? category.category_desc : ''}', '${category.category_image ? category.category_image : ''}')">Update</button>
                        <button class="btn" onclick="removeCategory('${category.category_id}')">Remove</button>
                    </td>
                </tr>
            `;


            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

function handleCategoryChange() {
    fetch('/category/get-categories') // ✅ Fetch categories from backend
        .then(response => response.json())
        .then(categories => {
            const categoryDropdowns = document.querySelectorAll(".category-dropdown"); // Select all dropdowns
            categoryDropdowns.forEach(dropdown => {
                dropdown.innerHTML = '<option value="">Select Category</option>'; // Reset dropdown
                categories.forEach(cat => {
                    dropdown.innerHTML += `<option value="${cat.CY_ID}">${cat.CY_NAME}</option>`;
                });
            });
        })
        .catch(error => console.error('❌ Error fetching categories:', error));
}

// Call the function when the page loads
window.onload = fetchCategories;
document.getElementById("category-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    // ✅ Fetch input values safely
    const name = document.getElementById("cy-name")?.value.trim() || "";
    const desc = document.getElementById("cy-desc")?.value.trim() || "";
    const imageInput = document.getElementById("cy-image")?.files[0] || null;

    if (!name || !desc) {
        alert("Category name and description cannot be empty!");
        return;
    }

    const formData = new FormData();
    formData.append("cy_name", name);
    formData.append("cy_desc", desc);
    if (imageInput) {
        formData.append("cy_image", imageInput);
    }

    try {
        const response = await fetch("/category/categories", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.error) {
            alert("Error adding category: " + data.error);
        } else {
            alert("Category added successfully!");
            fetchCategories(); // Refresh category list
            document.getElementById("category-form").reset(); // Reset form
        }
    } catch (error) {
        console.error("Error adding category:", error);
    }
});

function removeCategory(categoryId) {
    fetch(`/category/rcategories/${encodeURIComponent(categoryId)}`, { method: "PUT" })
        .then(response => response.json())
        .then(data => {
            alert(data.message); // Show success message
            
            // Hide the category from the UI if the element exists
            const row = document.getElementById(`category-row-${categoryId}`);
            if (row) {
                row.style.display = "none";
            } else {
                console.warn(`⚠ Category row with ID "category-row-${categoryId}" not found in DOM`);
            }
        })
        .catch(error => console.error("❌ Error removing category:", error));
}


function openUpdateModal(categoryId, categoryName, categoryDesc, categoryImage) {
    document.getElementById("updateCategoryModal").classList.remove("hidden");
    document.getElementById("updateCategoryId").value = categoryId;
    document.getElementById("updateCategoryName").value = categoryName;
    document.getElementById("updateCategoryDescription").value = categoryDesc ? categoryDesc : ""; // Prevents undefined

    // Show existing image name
    if (categoryImage) {
        document.getElementById("updateCategoryImageName").innerText = `Current Image: ${categoryImage}`;
    } else {
        document.getElementById("updateCategoryImageName").innerText = "No image uploaded";
    }
}

function closeUpdateModal() {
    document.getElementById("updateCategoryModal").classList.add("hidden");
}

document.getElementById('updateCategoryForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const categoryId = document.getElementById('updateCategoryId').value;
    const categoryName = document.getElementById('updateCategoryName').value;
    const categoryDescription = document.getElementById('updateCategoryDescription').value; // Make sure this exists
    const categoryImage = document.getElementById('updateCategoryImage').files[0];

    if (!categoryName.trim()) {
        alert("Category name cannot be empty!");
        return;
    }

    const formData = new FormData();
    formData.append('cy_name', categoryName);
    formData.append('cy_desc', categoryDescription); // Ensure this is added

    if (categoryImage) {
        formData.append('cy_image', categoryImage);
    }

    fetch(`/category/categories/${categoryId}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Update Response:", data); // Debugging log
        alert(data.message);
        closeUpdateModal();
        fetchCategories(); // Refresh category list
        document.getElementById('updateCategoryDescription').value = '';
    })
    .catch(error => console.error('Error updating category:', error));
});




document.addEventListener("DOMContentLoaded", function () {
    handleCategoryChange(); // Load categories in dropdown
});

// ✅ Open Add Subcategory Modal
function openSubcategoryModal(categoryId) {
    document.getElementById('parent-category-id').value = categoryId;
    document.getElementById('subcategory-form-container').style.display = 'block';
}

// ✅ Close Add Subcategory Modal
function closeSubcategoryModal() {
    document.getElementById('subcategory-form-container').style.display = 'none';
}

// ✅ Handle Form Submission for Adding Subcategory
document.getElementById("subcategory-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const categoryId = document.getElementById("prod_cat").value;
    const subcategoryName = document.getElementById("sc-name").value.trim();
    const subcategoryDesc = document.getElementById("sc-desc").value.trim();
    const subcategoryImage = document.getElementById("sc-image").files[0];

    // ✅ Validation: Ensure all required fields are filled
    if (!categoryId || !subcategoryName || !subcategoryDesc || !subcategoryImage) {
        alert("⚠ All fields are required!");
        return;
    }

    // ✅ Prepare FormData
    const formData = new FormData();
    formData.append("cy_id", categoryId);
    formData.append("sub_name", subcategoryName);
    formData.append("sub_desc", subcategoryDesc);
    formData.append("sub_image", subcategoryImage);

    try {
        const response = await fetch("/category/subcategories", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("✅ Subcategory Added Successfully!");
            document.getElementById("subcategory-form").reset();
            fetchSubcategories(); // Refresh subcategory list
        } else {
            alert("❌ Error: " + result.error);
        }
    } catch (error) {
        console.error("❌ Error adding subcategory:", error);
        alert("❌ Something went wrong. Try again.");
    }
});


// ✅ Fetch Subcategories and Display in the Table Based on Selected Category
function fetchSubcategories() {
    const categoryId = document.getElementById("prod_cat1").value;

    if (!categoryId) {
        console.warn("⚠ Please select a category to fetch subcategories.");
        return;
    }

    fetch(`/category/subcategories/${categoryId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(subcategories => {
        console.log("✅ Subcategories:", subcategories); // Debugging
        const subcategoryTable = document.getElementById("subcat-list");
        subcategoryTable.innerHTML = ""; 

        if (subcategories.length > 0) {
            subcategories.forEach(sub => {
                let row = `
                    <tr>
                        <td>${sub.sub_id}</td>
                        <td>${sub.sub_name}</td>
                        <td>${sub.sub_desc || 'No description'}</td>
                        <td><img src="/images/${sub.sub_image}" alt="${sub.sub_name}" width="50"></td> 
                        <td>${categoryId}</td>
                        <td>
                            <button class="btn" onclick="openUpdateSubModal('${sub.sub_id}', '${sub.sub_name}', '${sub.sub_desc}')">Update</button>
                            <button class="btn" onclick="removeSubcategory('${sub.sub_id}')">Remove</button>
                        </td>
                    </tr>
                `;
                subcategoryTable.innerHTML += row;
            });
        } else {
            subcategoryTable.innerHTML = `<tr><td colspan="5">No subcategories found for this category.</td></tr>`;
        }
    })
    .catch(error => console.error('❌ Error fetching subcategories:', error));

}

function removeSubcategory(subId) {
    if (!confirm("Are you sure you want to remove this subcategory from the website?")) return;

    fetch(`/category/rsubcategories/${subId}`, { method: 'PUT' })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            alert(data.message);
            document.getElementById(`subcategory-row-${subId}`).style.display = "none"; // Hide row
        })
        .catch(error => console.error('Error removing subcategory:', error));
}

// ✅ Auto Fetch Subcategories When Category is Selected
document.getElementById("prod_cat1").addEventListener("change", fetchSubcategories);


function openUpdateSubModal(subId, subName, subDesc) {
    document.getElementById("updateSubcategoryModal").classList.remove("hidden");
    document.getElementById("updateSubcategoryId").value = subId;
    document.getElementById("updateSubcategoryName").value = subName;
    document.getElementById("updateSubcategoryDescription").value = subDesc || "";
}

// Close update subcategory modal
function closeUpdateSubModal() {
    document.getElementById("updateSubcategoryModal").classList.add("hidden");
}

// Handle Form Submission
document.getElementById('updateSubcategoryForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const subId = document.getElementById('updateSubcategoryId').value;
    const subName = document.getElementById('updateSubcategoryName').value;
    const subDesc = document.getElementById('updateSubcategoryDescription').value;
    const subImage = document.getElementById('updateSubcategoryImage').files[0];

    if (!subName.trim()) {
        alert("Subcategory name cannot be empty!");
        return;
    }

    const formData = new FormData();
    formData.append('sub_name', subName);
    formData.append('sub_desc', subDesc);
    if (subImage) {
        formData.append('sub_image', subImage);
    }

    fetch(`/category/subcategories/${subId}`, {
        method: 'PUT',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            closeUpdateSubModal();
            fetchSubcategories(); // Refresh the table
        })
        .catch(error => console.error('Error updating subcategory:', error));
});

function handleSubCategoryChange(dropdownId, subcategoryDropdownId) {
    const categoryId = document.getElementById(dropdownId).value;
    const subcategoryDropdown = document.getElementById(subcategoryDropdownId);

    if (!categoryId) {
        subcategoryDropdown.innerHTML = '<option value="">Select a category first</option>';
        return;
    }

    fetch(`/category/subcategories/${categoryId}`)
        .then(response => response.json())
        .then(subcategories => {
            subcategoryDropdown.innerHTML = '<option value="">Select Subcategory</option>';
            subcategories.forEach(sub => {
                subcategoryDropdown.innerHTML += `<option value="${sub.sub_id}">${sub.sub_name}</option>`;
            });
        })
        .catch(error => console.error('❌ Error fetching subcategories:', error));
}

// ✅ Fetch Sub-Subcategories for the table based on second subcategory selection
function fetchSubSubcategories() {
    const subcategoryId = document.getElementById("prod_subcat1").value;

    if (!subcategoryId) {
        console.warn("⚠ Please select a subcategory to fetch sub-subcategories.");
        return;
    }

    fetch(`/category/subsubcategories/${subcategoryId}`)
        .then(response => response.json())
        .then(subsubcategories => {
            const subsubTable = document.getElementById("subsubcat-list");
            subsubTable.innerHTML = ""; // Clear existing rows

            if (subsubcategories.length > 0) {
                subsubcategories.forEach(ssc => {
                    let row = `
                        <tr>
                            <td>${ssc.ss_id}</td>
                            <td>${ssc.ss_name}</td>
                            <td>${ssc.ss_desc || 'No description'}</td>
                            <td><img src="/images/${ssc.ss_image}" alt="${ssc.ss_name}" width="50"></td>
                            <td>${subcategoryId}</td>
                            <td>
                                <button class="btn" onclick="openUpdateSubSubModal('${ssc.ss_id}', '${ssc.ss_name}', '${ssc.ss_desc}')">Update</button>
                                <button class="btn" onclick="removeSubSubcategory('${ssc.ss_id}')">Remove</button>
                            </td>
                        </tr>
                    `;
                    subsubTable.innerHTML += row;
                });
            } else {
                subsubTable.innerHTML = `<tr><td colspan="6">No sub-subcategories found for this subcategory.</td></tr>`;
            }
        })
        .catch(error => console.error("❌ Error fetching sub-subcategories:", error));
}

// ✅ Add event listeners for category selection
document.getElementById("prod_cate").addEventListener("change", () => {
    handleSubCategoryChange("prod_cate", "prod_subcat");
});

document.getElementById("prod_cate_table").addEventListener("change", () => {
    handleSubCategoryChange("prod_cate_table", "prod_subcat1");
});

document.getElementById("prod_subcat1").addEventListener("change", fetchSubSubcategories);


function openSubSubcategoryModal(subcategoryId) {
    document.getElementById("parent-subcategory-id").value = subcategoryId;
    document.getElementById("subsubcategory-form-container").style.display = "block";
}

function closeSubSubcategoryModal() {
    document.getElementById("subsubcategory-form-container").style.display = "none";
}

document.getElementById("subsubcategory-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const subcategoryId = document.getElementById("prod_subcat").value;
    const ssName = document.getElementById("ssc-name").value.trim();
    const ssDesc = document.getElementById("ssc-desc").value.trim();
    const ssImage = document.getElementById("ssc-image").files[0];

    if (!subcategoryId || !ssName || !ssDesc || !ssImage) {
        alert("⚠ All fields are required!");
        return;
    }

    const formData = new FormData();
    formData.append("sub_id", subcategoryId);
    formData.append("ss_name", ssName);
    formData.append("ss_desc", ssDesc);
    formData.append("ss_image", ssImage);

    try {
        const response = await fetch("/category/subsubcategories", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("✅ Sub-Subcategory Added Successfully!");
            document.getElementById("subsubcategory-form").reset();
            fetchSubSubcategories(); // Refresh table
        } else {
            alert("❌ Error: " + result.error);
        }
    } catch (error) {
        console.error("❌ Error adding sub-subcategory:", error);
        alert("❌ Something went wrong. Try again.");
    }
});




// ✅ Open Update Modal and Prefill Data
function openUpdateSubSubModal(subSubcategoryId, subSubcategoryName, subSubcategoryDesc) {
    document.getElementById("updateSubSubcategoryModal").classList.remove("hidden");
    document.getElementById("updateSubSubcategoryId").value = subSubcategoryId;
    document.getElementById("updateSubSubcategoryName").value = subSubcategoryName;
    document.getElementById("updateSubSubcategoryDescription").value = subSubcategoryDesc || ""; 
}

// ✅ Close Modal
function closeUpdateSubSubModal() {
    document.getElementById("updateSubSubcategoryModal").classList.add("hidden");
}

// ✅ Handle Update Form Submission
document.getElementById("updateSubSubcategoryForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const ssId = document.getElementById("updateSubSubcategoryId").value;
    const ssName = document.getElementById("updateSubSubcategoryName").value.trim();
    const ssDesc = document.getElementById("updateSubSubcategoryDescription").value.trim();
    const ssImage = document.getElementById("updateSubSubcategoryImage").files[0];

    if (!ssName) {
        alert("⚠ Sub-Subcategory name cannot be empty!");
        return;
    }

    const formData = new FormData();
    formData.append("ss_name", ssName);
    formData.append("ss_desc", ssDesc);
    if (ssImage) {
        formData.append("ss_image", ssImage);
    }

    try {
        console.log(`Updating Sub-Subcategory ID: ${ssId}`);
        const response = await fetch(`/category/subsubcategories/${ssId}`, {
            method: "PUT",
            body: formData,
        });

        const result = await response.json();
        console.log("Server Response:", result);

        if (response.ok) {
            alert("✅ Sub-Subcategory Updated Successfully!");
            closeUpdateSubSubModal();
            fetchSubSubcategories(); // ✅ Refresh Table
        } else {
            alert("❌ Error: " + (result.error || "Failed to update sub-subcategory"));
        }
    } catch (error) {
        console.error("❌ Error updating sub-subcategory:", error);
        alert("❌ Something went wrong. Try again.");
    }
});



function removeSubSubcategory(ssId) {
    if (!confirm("Are you sure you want to remove this sub-subcategory from the website?")) return;

    fetch(`/category/rsubsubcategories/${ssId}`, { method: 'PUT' })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            alert(data.message);
            document.getElementById(`subsubcategory-row-${ssId}`).style.display = "none"; // Hide row
        })
        .catch(error => console.error('Error removing sub-subcategory:', error));
}



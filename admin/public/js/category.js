

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
                <tr>
                    <td>${category.category_id}</td>
                    <td id="cat-name-${category.category_id}">${category.category_name}</td>
                    <td>${category.category_desc ? category.category_desc : 'No description'}</td>
                    <td><img src="/uploads/${category.category_image}" alt="${category.category_name}" width="50"></td>
                    <td>
                        <button class="btn" onclick="openUpdateModal('${category.category_id}', '${category.category_name}')">Update</button>
                        <button class="btn" onclick="openSubcategoryModal('${category.category_id}')">Add Subcategory</button>

                    </td>
                </tr>
            `;

            // Display Subcategories
            Object.values(category.subcategories).forEach(sub => {
                let imageSrc = sub.subcategory_image ? `/uploads/${sub.subcategory_image}` : "/default-image.png"; // Handle missing image

                row += `
                    <tr>
                        <td>${sub.subcategory_id}</td>
                        <td id="sub-name-${sub.subcategory_id}">${sub.subcategory_name}</td>
                        <td id="sub-desc-${sub.subcategory_id}">${sub.subcategory_desc ? sub.subcategory_desc : 'No description available'}</td>
                        <td><img src="/uploads/${sub.subcategory_image}" alt="${sub.subcategory_name}" width="50"></td>
                        <td>
                            <button class="btn" onclick="opensubUpdateModal('${sub.subcategory_id}', '${sub.subcategory_name}', '${sub.subcategory_desc}')">Update</button>
                            <button class="btn" onclick="deleteSubCategory('${sub.subcategory_id}')">Delete</button>
                           <button class="btn" onclick="openSubSubcategoryModal('${sub.subcategory_id}')">Add Sub-Subcategory</button>
                        </td>
                    </tr>
                `;

                // Display Sub-Subcategories
                Object.values(sub.subsubcategories).forEach(subsub => {
                    row += `
                        <tr>
                            <td> ${subsub.subsubcategory_id}</td>
                            <td id="subsub-name-${subsub.subsubcategory_id}"> ${subsub.subsubcategory_name}</td>
                            <td><img src="/uploads/${subsub.subsubcategory_image}" alt="${subsub.subsubcategory_name}" width="50"></td>
                            <td>
                                <button class="btn" onclick="openUpdateSubSubModal('${subsub.subsubcategory_id}', '${subsub.subsubcategory_name}')">Update</button>

                                <button class="btn" onclick="deleteSubSubcategory('${subsub.subsubcategory_id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            });

            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

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

// function updateCategory(categoryId) {
//     const newName = prompt("Enter new category name:");
//     if (!newName || newName.trim() === "") {
//         alert("Category name cannot be empty!");
//         return;
//     }
  
//     fetch(`/category/categories/${categoryId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ cy_name: newName })
//     })
//     .then(response => response.json())
//     .then(data => {
//         alert("Category updated successfully!");
//         fetchCategories(); // Refresh category list
//     })
//     .catch(error => console.error('Error updating category:', error));
// }

function deleteCategory(categoryId) {
    if (!confirm("Are you sure you want to delete this category? All related subcategories will also be removed!")) return;
    
    fetch(`/category/categories/${categoryId}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        alert("Category deleted successfully!");
        fetchCategories(); // Refresh category list
    })
    .catch(error => console.error('Error deleting category:', error));
}

// Open Update Modal and Fill Form Fields
function openUpdateModal(categoryId, currentName, currentDescription) {
    // Ensure modal exists before updating values
    const modal = document.getElementById('updateCategoryModal');
    if (!modal) {
        console.error("Modal not found!");
        return;
    }

    document.getElementById('updateCategoryId').value = categoryId;
    document.getElementById('updateCategoryName').value = currentName;

    const descriptionField = document.getElementById('updateCategoryDesc'); // Ensure ID matches HTML
    if (descriptionField) {
        descriptionField.value = currentDescription || ''; // Set description, fallback to empty
    } else {
        console.error("Description field not found! Make sure your textarea has id='updateCategoryDesc'");
    }

    modal.style.display = 'block';
}

// Close Update Modal
function closeUpdateModal() {
    document.getElementById('updateCategoryModal').style.display = 'none';
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




function openSubcategoryModal(categoryId) {
    document.getElementById('parent-category-id').value = categoryId;
    document.getElementById('subcategory-form-container').style.display = 'block';
}

function closeSubcategoryModal() {
    document.getElementById('subcategory-form-container').style.display = 'none';
}
document.getElementById("subcategory-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const subcategoryName = document.getElementById("sc-name").value.trim();
    const subcategoryDescription = document.getElementById("sc-desc").value.trim();
    const categoryId = document.getElementById("parent-category-id").value;
    const subcategoryImage = document.getElementById("sc-image").files[0];

    if (!subcategoryName || !subcategoryDescription || !categoryId || !subcategoryImage) {
        alert("⚠ All fields are required!");
        return;
    }

    let formData = new FormData();
    formData.append("sub_name", subcategoryName);
    formData.append("sub_desc", subcategoryDescription);
    formData.append("cy_id", categoryId);
    formData.append("sub_image", subcategoryImage);

    fetch("/category/subcategories", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("❌ Error: " + data.error);
        } else {
            alert("✅ Subcategory Added: " + data.sub_id);
            closeSubcategoryModal();
            fetchCategories(); // Refresh subcategory list without reloading
        }
    })
    .catch(error => console.error("❌ Error adding subcategory:", error));
});


function opensubUpdateModal(subcategoryId, subcategoryName, subcategoryDesc) {
    const modal = document.getElementById("update-subcategory-modal");
    if (!modal) {
        console.error("Modal not found!");
        return;
    }

    document.getElementById("update-sub-id").value = subcategoryId;
    document.getElementById("update-sub-name").value = subcategoryName;

    const descriptionField = document.getElementById("update-sub-desc");
    if (descriptionField) {
        descriptionField.value = subcategoryDesc || "";
    } else {
        console.error("Description field not found! Make sure your textarea has id='update-sub-desc'");
    }

    modal.style.display = "block";
}

function closesubUpdateModal() {
    document.getElementById("update-subcategory-modal").style.display = "none";
}

document.getElementById("update-subcategory-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const subcategoryId = document.getElementById("update-sub-id").value;
    const subcategoryName = document.getElementById("update-sub-name").value.trim();
    const subcategoryDescription = document.getElementById("update-sub-desc").value;
    const subcategoryImage = document.getElementById("update-sub-image").files[0];

    if (!subcategoryName) {
        alert("Subcategory name cannot be empty!");
        return;
    }

    const formData = new FormData();
    formData.append('sub_id', subcategoryId);
    formData.append("sub_name", subcategoryName);
    formData.append("sub_desc", subcategoryDescription);

    if (subcategoryImage) {
        formData.append("sub_image", subcategoryImage);
    }

    fetch(`/category/subcategories/${subcategoryId}`, {
        method: "PUT",
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(text);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log("✅ Update Response:", data);
            alert(data.message);
            closesubUpdateModal();
            fetchCategories(); // Refresh category list
        })
        .catch((error) => console.error("❌ Error updating subcategory:", error));
});



// Open Update Modal and Pre-fill Fields
// function openUpdateSubModal(subcategoryId, subcategoryName,subcategoryDesc) {
//     document.getElementById("update-sub-id").value = subcategoryId;
//     document.getElementById("update-sub-name").value = subcategoryName;
//     document.getElementById("update-sub-desc").value = subcategoryDesc;

//     document.getElementById("update-subcategory-modal").style.display = "block";
// }

// // Close Update Modal
// function closeUpdateSubModal() {
//     document.getElementById('update-subcategory-modal').style.display = 'none';
// }

// // Function to Update Subcategory
// function updateSubCategory(subcategoryId) {
//     console.log("Subcategory ID:", subcategoryId);
    
//     const subNameElement = document.querySelector(`#sub-name-${subcategoryId}`);
//     const subDescElement = document.querySelector(`#sub-desc-${subcategoryId}`); // Fetch description

//     if (!subNameElement || !subDescElement) {
//         alert("Subcategory name or description element not found!");
//         return;
//     }

//     const currentName = subNameElement.textContent.trim();
//     const currentDesc = subDescElement.textContent.trim();

//     console.log("Subcategory Name:", currentName);
//     console.log("Subcategory Description:", currentDesc);

//     openUpdateSubModal(subcategoryId, currentName, currentDesc);
// }



// Submit Update Subcategory Form
document.getElementById('update-subcategory-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const subcategoryId = document.getElementById('update-sub-id').value;
    const subcategoryName = document.getElementById('update-sub-name').value;
    const subcategoryImage = document.getElementById('update-sub-image').files[0];

    if (!subcategoryName || subcategoryName.trim() === "") {
        alert("Subcategory name cannot be empty!");
        return;
    }

    const formData = new FormData();
    formData.append('sub_name', subcategoryName);

    if (subcategoryImage) {
        formData.append('sub_image', subcategoryImage);
    }

    fetch(`/category/subcategories/${subcategoryId}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        closeUpdateSubModal();
        fetchCategories(); // Refresh category list
    })
    .catch(error => console.error('Error updating subcategory:', error));
});

// Delete Subcategory
function deleteSubCategory(subId) {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    fetch(`/category/subcategories/${subId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert("Subcategory deleted successfully!");
            fetchCategories(); // Refresh category list
        })
        .catch(error => console.error('Error deleting subcategory:', error));
}

  
// Fetch and Populate Subcategories for a Specific Category
function fetchSubCategory(categoryId) {
    console.log('Fetching subcategories for category:', categoryId);

    fetch(`/category/subcategories/${categoryId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched Subcategories:', data);
            const subcategorySelect = document.getElementById('parent-subcategory');

            // Clear existing options
            subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';

            // Populate Dropdown with Subcategories
            data.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.sub_id;
                option.textContent = subcategory.sub_name;
                subcategorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching subcategories:', error));
}


// Show the Form and Set Selected Subcategory
function openSubSubcategoryModal(subcategoryId) {
    document.getElementById('parent-sub-id').value = subcategoryId;
    document.getElementById('subsubcategory-form-container').style.display = 'block';
}
function closeSubSubcategoryModal() {
    document.getElementById('subsubcategory-form-container').style.display = 'none';
}

document.getElementById('subcategory-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('sc-name').value;
    const description = document.getElementById('sc-desc').value; // ✅ Fetch Description
    const categoryId = document.getElementById('parent-category-id').value;
    const image = document.getElementById('sc-image').files[0];

    if (!name || !description || !categoryId || !image) {
        alert("All fields are required!");
        return;
    }

    const formData = new FormData();
    formData.append('sub_name', name);
    formData.append('sub_desc', description); // ✅ Ensure Description is Sent
    formData.append('cy_id', categoryId);
    formData.append('sub_image', image);

    fetch('/category/subcategories', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        closeSubcategoryModal();
        fetchCategories(); // Refresh category list
        document.getElementById('subcategory-form').reset(); // ✅ Reset form properly
    })
    .catch(error => console.error('Error adding subcategory:', error));
});


// Function to Open Update Modal for Sub-Subcategory
function openUpdateSubSubModal(subsubcategoryId, subsubcategoryName) {
    console.log("Sub-Subcategory ID:", subsubcategoryId);

    // Get modal elements
    const ssIdElement = document.getElementById('update-ss-id');
    const ssNameElement = document.getElementById('update-ss-name');

    // Debugging logs
    console.log("Sub-Subcategory ID Element:", ssIdElement);
    console.log("Sub-Subcategory Name Element:", ssNameElement);

    // Check if elements exist
    if (!ssIdElement || !ssNameElement) {
        console.error("Modal elements not found!");
        return;
    }

    // Set values in modal
    ssIdElement.value = subsubcategoryId;
    ssNameElement.value = subsubcategoryName;

    // Show the modal
    document.getElementById('update-subsubcategory-modal').style.display = 'block';
}


// Close Update Modal
function closeUpdateSubSubModal() {
    document.getElementById('update-subsubcategory-modal').style.display = 'none';
}



// Handle Update Form Submission
document.getElementById('update-subsubcategory-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const subsubcategoryId = document.getElementById('update-ss-id').value;
    const subsubcategoryName = document.getElementById('update-ss-name').value;
    const subsubcategoryImage = document.getElementById('update-ss-image').files[0];

    // Validation: Check if Sub-Subcategory Name is not empty
    if (!subsubcategoryName || subsubcategoryName.trim() === "") {
        alert("Sub-Subcategory name cannot be empty!");
        return;
    }

    // Create FormData to send data including optional image
    const formData = new FormData();
    formData.append('ss_name', subsubcategoryName);

    // Append Image only if a new one is selected
    if (subsubcategoryImage) {
        formData.append('ss_image', subsubcategoryImage);
    }

    // Send PUT request to update the Sub-Subcategory
    fetch(`/category/subsubcategories/${subsubcategoryId}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        closeUpdateSubSubModal(); // Close the Modal
        fetchCategories(); // Refresh Sub-Subcategory list
    })
    .catch(error => console.error('Error updating sub-subcategory:', error));
});

// Function to Update Sub-Subcategory
function updateSubSubCategory(subsubcategoryId) {
    console.log("Sub-Subcategory ID:", subsubcategoryId);

    const subSubNameElement = document.querySelector(`#subsub-name-${subsubcategoryId}`);
    console.log("Sub-Subcategory Name Element:", subSubNameElement);
    
    if (!subSubNameElement) {
        alert("Sub-Subcategory name element not found!");
        return;
    }
    
    const currentName = subSubNameElement.textContent;
    openUpdateSubSubModal(subsubcategoryId, currentName);
}

// Make the function globally accessible
window.updateSubSubCategory = updateSubSubCategory;


function deleteSubSubcategory(ssId) {
    if (!confirm("Are you sure you want to delete this sub-subcategory?")) return;

    fetch(`/category/subsubcategories/${ssId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert("Sub-Subcategory deleted successfully!");
            fetchCategories(); 
        })
        .catch(error => console.error('Error deleting sub-subcategory:', error));
}



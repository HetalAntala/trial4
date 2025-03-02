const mysql = require("mysql");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');  // Store in 'public/uploads'
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });



// Database connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hetalsql@1405',
  database: 'main_project',
});

conn.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


const getCategories = (req, res) => {
    const query = `
        SELECT 
            c.cy_id AS category_id, c.cy_name AS category_name, c.cy_desc AS category_desc, c.cy_image AS category_image
        FROM 
            category c
    `;

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Organize the data into a hierarchical structure
        const categories = [];
        const categoryMap = {};

        results.forEach(row => {
            // ✅ Category Level
            if (!categoryMap[row.category_id]) {
                categoryMap[row.category_id] = {
                    category_id: row.category_id,
                    category_name: row.category_name,
                    category_desc: row.category_desc,  // ✅ Fetching category description
                    category_image: row.category_image,
                    subcategories: []
                };
                categories.push(categoryMap[row.category_id]);
            }

            // ✅ Subcategory Level
            if (row.subcategory_id) {
                let subcategory = categoryMap[row.category_id].subcategories.find(sub => sub.subcategory_id === row.subcategory_id);
                if (!subcategory) {
                    subcategory = {
                        subcategory_id: row.subcategory_id,
                        subcategory_name: row.subcategory_name,
                        subcategory_desc: row.subcategory_desc, // ✅ Fetching subcategory description
                        subcategory_image: row.subcategory_image,
                        subsubcategories: []
                    };
                    categoryMap[row.category_id].subcategories.push(subcategory);
                }

                // ✅ Sub-Subcategory Level
                if (row.subsubcategory_id) {
                    subcategory.subsubcategories.push({
                        subsubcategory_id: row.subsubcategory_id,
                        subsubcategory_name: row.subsubcategory_name,
                        subsubcategory_desc: row.subsubcategory_desc, // ✅ Fetching subsubcategory description
                        subsubcategory_image: row.subsubcategory_image
                    });
                }
            }
        });

        res.json(categories); // ✅ Return JSON data
    });
};

const getSubcategoriesByCategory = (req, res) => {
    const { categoryId } = req.params;

    if (!categoryId) {
        return res.status(400).json({ error: "Category ID is required" });
    }

    const query = "SELECT * FROM subcategory WHERE cy_id = ? AND is_deleted = 0";
    conn.query(query, [categoryId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching subcategories:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};

const getSubSubcategories = (req, res) => {
    const { subcategoryId } = req.params;

    if (!subcategoryId) {
        return res.status(400).json({ error: "Subcategory ID is required" });
    }

    const query = "SELECT * FROM subsubcategory WHERE sub_id = ? AND is_deleted = 0";
    conn.query(query, [subcategoryId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching sub-subcategories:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};


const addCategory = (req, res) => {
    const { cy_name, cy_desc } = req.body;
    const cy_image = req.file ? `../images/${req.file.filename}` : null; // Set image if uploaded, otherwise null

    if (!cy_name || !cy_desc) {
        return res.status(400).json({ error: "Category name and description are required." });
    }

    const getMaxCategoryIdQuery = `SELECT MAX(cy_id) AS maxId FROM category`;

    conn.query(getMaxCategoryIdQuery, (err, result) => {
        if (err) {
            console.error("Error fetching max category ID:", err);
            return res.status(500).json({ error: "Database error: " + err.message });
        }

        let newCategoryId;
        if (result[0].maxId) {
            const lastIdNumber = parseInt(result[0].maxId.replace(/\D/g, ""), 10) + 1;
            newCategoryId = `CY${String(lastIdNumber).padStart(2, "0")}`;
        } else {
            newCategoryId = "CY01";
        }

        // ✅ Ensure all 4 columns are filled correctly
        const insertQuery = `INSERT INTO category (cy_id, cy_name, cy_desc, cy_image) VALUES (?, ?, ?, ?)`;
        conn.query(insertQuery, [newCategoryId, cy_name, cy_desc, cy_image || null], (err) => {
            if (err) {
                console.error("Error inserting category:", err);
                return res.status(500).json({ error: "Database error: " + err.message });
            }

            res.json({ message: "Category added successfully", id: newCategoryId });
        });
    });
};

const addSubCategory = (req, res) => {  
    const { sub_name, sub_desc, cy_id } = req.body;
    const sub_image = req.file ?`../images/${req.file.filename}` : null;

    if (!sub_name || !sub_desc || !cy_id || !sub_image) {
        return res.status(400).json({ error: "All fields are required" });
    }

    conn.beginTransaction((err) => {
        if (err) {
            console.error("❌ Error starting transaction:", err);
            return res.status(500).json({ error: "Database transaction error" });
        }

        // ✅ Fetch the maximum subcategory ID
        const getMaxSubIdQuery = `SELECT MAX(CAST(SUBSTRING(sub_id, 4) AS UNSIGNED)) AS maxId FROM subcategory`;

        conn.query(getMaxSubIdQuery, (err, results) => {
            if (err) {
                console.error("❌ Error fetching max subcategory ID:", err);
                return rollbackTransaction(res, "Database error while fetching subcategory ID");
            }

            let newSubId = results.length > 0 && results[0].maxId !== null
                ? `SUB${String(results[0].maxId + 1).padStart(2, "0")}`
                : "SUB01";

            console.log("✅ Generated Unique Subcategory ID:", newSubId);

            // ✅ Insert New Subcategory
            const insertQuery = `INSERT INTO subcategory (sub_id, sub_name, sub_desc, cy_id, sub_image) VALUES (?, ?, ?, ?, ?)`;
            conn.query(insertQuery, [newSubId, sub_name, sub_desc, cy_id, sub_image], (err, result) => {
                if (err) {
                    console.error("❌ Error inserting subcategory:", err);
                    return rollbackTransaction(res, "Database error while inserting subcategory");
                }

                // ✅ Commit Transaction
                conn.commit((err) => {
                    if (err) {
                        console.error("❌ Error committing transaction:", err);
                        return rollbackTransaction(res, "Error committing transaction");
                    }

                    console.log("✅ Subcategory added successfully:", newSubId);
                    res.json({ message: "Subcategory added successfully", sub_id: newSubId });
                });
            });
        });
    });
};

// ✅ Utility Function to Rollback Transaction
function rollbackTransaction(res, message) {
    conn.rollback(() => {
        res.status(500).json({ error: message });
    });
}


const addSubSubCategory = (req, res) => {
    const { ss_name, ss_desc, sub_id } = req.body;
    const ss_image = req.file ? `../images/${req.file.filename}` : null;

    if (!ss_name || !ss_desc || !sub_id) {
        return res.status(400).json({ error: "All fields (name, description, subcategory ID) are required" });
    }

    const getMaxSsIdQuery = `SELECT MAX(CAST(SUBSTRING(ss_id, 3) AS UNSIGNED)) AS maxId FROM subsubcategory`;

    conn.query(getMaxSsIdQuery, (err, result) => {
        if (err) {
            console.error("❌ Error fetching max sub-subcategory ID:", err);
            return res.status(500).json({ error: "Database error" });
        }

        let newSsId = result[0].maxId ? `SS${String(result[0].maxId + 1).padStart(2, "0")}` : `SS01`;

        const insertQuery = `INSERT INTO subsubcategory (ss_id, ss_name, ss_desc, sub_id, ss_image) VALUES (?, ?, ?, ?, ?)`;
        conn.query(insertQuery, [newSsId, ss_name, ss_desc, sub_id, ss_image], (err, result) => {
            if (err) {
                console.error("❌ Error inserting sub-subcategory:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "✅ Sub-Subcategory added successfully", ss_id: newSsId });
        });
    });
};

// ✅ Update Category with Image
const updateCategory = (req, res) => {
    const categoryId = req.params.id;
    const { cy_name, cy_desc } = req.body;
    const cy_image = req.file ? `${req.file.filename}` : null;

    if (!cy_name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    let query = 'UPDATE category SET cy_name = ?, cy_desc = ? WHERE cy_id = ?';
    let params = [cy_name, cy_desc, categoryId];

    if (cy_image) {
        query = 'UPDATE category SET cy_name = ?, cy_desc = ?, cy_image = ? WHERE cy_id = ?';
        params = [cy_name, cy_desc, cy_image, categoryId];
    }

    conn.query(query, params, (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Category updated successfully' });
    });
};

const updateSubcategory = (req, res) => {
    const subcategoryId = req.params.id;
    const { sub_name, sub_desc } = req.body;
    const sub_image = req.file ? req.file.filename : null;

    if (!sub_name || !sub_desc) {
        return res.status(400).json({ error: "Subcategory name and description are required" });
    }

    // ✅ Step 1: Get Old Image Path (if exists)
    const getImageQuery = "SELECT sub_image FROM subcategory WHERE sub_id = ?";
    conn.query(getImageQuery, [subcategoryId], (err, result) => {
        if (err) {
            console.error("❌ Error fetching old image:", err);
            return res.status(500).json({ error: "Database error" });
        }

        const oldImagePath = result.length > 0 ? result[0].sub_image : null;

        // ✅ Step 2: Update Subcategory
        let query, params;

        if (sub_image) {
            query = "UPDATE subcategory SET sub_name = ?, sub_desc = ?, sub_image = ? WHERE sub_id = ?";
            params = [sub_name, sub_desc, sub_image, subcategoryId];
        } else {
            query = "UPDATE subcategory SET sub_name = ?, sub_desc = ? WHERE sub_id = ?";
            params = [sub_name, sub_desc, subcategoryId];
        }

        conn.query(query, params, (err, result) => {
            if (err) {
                console.error("❌ Error updating subcategory:", err);
                return res.status(500).json({ error: "Database error" });
            }

            // ✅ Step 3: Delete Old Image (if a new one is uploaded)
            if (sub_image && oldImagePath) {
                const oldImageFullPath = path.join(__dirname, "..", "public", "images", oldImagePath);
                fs.unlink(oldImageFullPath, (err) => {
                    if (err) console.error("❌ Error deleting old image:", err);
                });
            }

            console.log("✅ Subcategory updated successfully:", subcategoryId);
            res.json({ message: "Subcategory updated successfully" });
        });
    });
};

const updateSubSubcategory = (req, res) => {
    const subsubcategoryId = req.params.id;
    const { ss_name, ss_desc } = req.body;
    const ss_image = req.file ? req.file.filename : null;

    if (!ss_name) {
        return res.status(400).json({ error: 'Sub-Subcategory name is required' });
    }

    // Get Old Image Path
    const getImageQuery = 'SELECT ss_image FROM subsubcategory WHERE ss_id = ?';
    conn.query(getImageQuery, [subsubcategoryId], (err, result) => {
        if (err) {
            console.error('❌ Error fetching old image:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Handle case when no record is found
        if (result.length === 0) {
            return res.status(404).json({ error: 'Sub-Subcategory not found' });
        }

        const oldImagePath = result[0].ss_image;

        // Prepare Query and Parameters
        let query, params;
        if (ss_image) {
            query = "UPDATE subsubcategory SET ss_name = ?, ss_desc = ?, ss_image = ? WHERE ss_id = ?";
            params = [ss_name, ss_desc, ss_image, subsubcategoryId];
        } else {
            query = "UPDATE subsubcategory SET ss_name = ?, ss_desc = ? WHERE ss_id = ?";
            params = [ss_name, ss_desc, subsubcategoryId];
        }

        // Execute Update Query
        conn.query(query, params, (err, result) => {
            if (err) {
                console.error('❌ Error updating sub-subcategory:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Delete old image if a new one is uploaded
            if (ss_image && oldImagePath) {
                const oldImageFullPath = path.join(__dirname, '..', 'public', 'images', oldImagePath);
                fs.unlink(oldImageFullPath, (err) => {
                    if (err) console.error('⚠ Error deleting old image:', err);
                });
            }

            res.json({ message: '✅ Sub-Subcategory updated successfully' });
        });
    });
};
const removeCategory=(req,res)=>{
    const categoryId = req.params.id;

    // Ensure correct column name (CY_ID instead of id)
    const query = "UPDATE category SET is_deleted = 1 WHERE CY_ID = ?";  

    conn.query(query, [categoryId], (err, result) => {
        if (err) {
            console.error("❌ Error marking category as deleted:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "✅ Category removed successfully (soft delete)" });
    });
};

const removeSubCategory = (req, res) => {
    const subcategoryId = req.params.id;

    if (!subcategoryId) {
        return res.status(400).json({ error: "Subcategory ID is required" });
    }

    const query = "UPDATE subcategory SET is_deleted = 1 WHERE sub_id = ?";
    conn.query(query, [subcategoryId], (err, result) => {
        if (err) {
            console.error("❌ Error marking subcategory as deleted:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Subcategory not found" });
        }
        res.json({ message: "✅ Subcategory removed successfully (soft delete)" });
    });
};

const removeSubSubCategory = (req, res) => {
    const subsubcategoryId = req.params.id;

    if (!subsubcategoryId) {
        return res.status(400).json({ error: "Sub-subcategory ID is required" });
    }

    const query = "UPDATE subsubcategory SET is_deleted = 1 WHERE ss_id = ?";
    conn.query(query, [subsubcategoryId], (err, result) => {
        if (err) {
            console.error("❌ Error marking sub-subcategory as deleted:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Sub-subcategory not found" });
        }
        res.json({ message: "✅ Sub-subcategory removed successfully (soft delete)" });
    });
};
function deleteSubCategory(req, res) {
    const { id } = req.params;

    if (!id) {
        console.error('❌ ID not received in request');
        return res.status(400).json({ error: 'Missing subcategory ID' });
    }

    console.log(`🛑 Deleting subcategory: ${id}`);

    conn.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
        if (err) {
            console.error('❌ Error disabling foreign key checks:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const deleteSubSubcategoriesQuery = 'DELETE FROM subsubcategory WHERE sub_id = ?';
        conn.query(deleteSubSubcategoriesQuery, [id], (err) => {
            if (err) {
                console.error('❌ Error deleting related sub-subcategories:', err);
                return res.status(500).json({ error: 'Database error while deleting sub-subcategories' });
            }

            console.log(`✅ Related sub-subcategories deleted for: ${id}`);

            const deleteQuery = 'DELETE FROM subcategory WHERE sub_id = ?';
            conn.query(deleteQuery, [id], (err, result) => {
                if (err) {
                    console.error('❌ Error deleting subcategory:', err);
                    return res.status(500).json({ error: 'Database error while deleting subcategory' });
                }

                if (result.affectedRows === 0) {
                    console.warn('⚠ Warning: Subcategory not found or already deleted.');
                    return res.status(404).json({ error: 'Subcategory not found' });
                }

                console.log(`✅ Subcategory ${id} deleted successfully.`);

                reorderSubcategoryIDs((err, idMapping) => {
                    if (err) return res.status(500).json({ error: 'Error while reordering subcategory IDs' });

                    updateSubSubcategoryIDs(idMapping, (err) => {
                        if (err) return res.status(500).json({ error: 'Error while updating sub-subcategory IDs' });

                        reorderSubSubcategoryIDs((err) => {
                            if (err) return res.status(500).json({ error: 'Error while reordering sub-subcategory IDs' });

                            conn.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
                                if (err) {
                                    console.error('❌ Error enabling foreign key checks:', err);
                                    return res.status(500).json({ error: 'Database error' });
                                }
                                res.json({ message: '✅ Subcategory deleted, IDs reordered, and sub-subcategory IDs updated successfully' });
                            });
                        });
                    });
                });
            });
        });
    });
}

// ✅ Function to Reorder Subcategory IDs
function reorderSubcategoryIDs(callback) {
    const fetchQuery = `SELECT sub_id FROM subcategory ORDER BY LENGTH(sub_id), sub_id`;

    conn.query(fetchQuery, (err, rows) => {
        if (err) {
            console.error('❌ Error fetching subcategories:', err);
            return callback(err);
        }

        let idMapping = {};
        let queries = rows.map((row, index) => {
            let newId = `SUB${String(index + 1).padStart(2, '0')}`;
            idMapping[row.sub_id] = newId;
            return [newId, row.sub_id];
        });

        if (queries.length === 0) {
            console.log('✅ No subcategories to reorder.');
            return callback(null, {});
        }

        const updateQuery = `UPDATE subcategory SET sub_id = CASE 
            ${queries.map(([newId, oldId]) => `WHEN sub_id = '${oldId}' THEN '${newId}'`).join(' ')}
            ELSE sub_id END`;

        conn.query(updateQuery, (err) => {
            if (err) {
                console.error('❌ Error updating subcategory IDs:', err);
                return callback(err);
            }
            console.log('✅ All subcategory IDs reordered successfully');
            return callback(null, idMapping);
        });
    });
}

// ✅ Function to Update Sub-Subcategory sub_id Based on New Mapping
function updateSubSubcategoryIDs(idMapping, callback) {
    if (!Object.keys(idMapping).length) {
        console.log('✅ No sub-subcategories to update.');
        return callback(null);
    }

    const updateQueries = Object.entries(idMapping)
        .map(([oldId, newId]) => `WHEN sub_id = '${oldId}' THEN '${newId}'`)
        .join(' ');

    const updateQuery = `UPDATE subsubcategory SET sub_id = CASE ${updateQueries} ELSE sub_id END`;

    conn.query(updateQuery, (err) => {
        if (err) {
            console.error('❌ Error updating sub-subcategory sub_ids:', err);
            return callback(err);
        }
        console.log('✅ Sub-subcategory sub_ids updated successfully');
        return callback(null);
    });
}

// ✅ New Function to Reorder `ss_id` in `subsubcategory`
function reorderSubSubcategoryIDs(callback) {
    const fetchQuery = `SELECT ss_id FROM subsubcategory ORDER BY LENGTH(ss_id), ss_id`;

    conn.query(fetchQuery, (err, rows) => {
        if (err) {
            console.error('❌ Error fetching sub-subcategories:', err);
            return callback(err);
        }

        let queries = rows.map((row, index) => {
            let newId = `SS${String(index + 1).padStart(2, '0')}`;
            return [newId, row.ss_id];
        });

        if (queries.length === 0) {
            console.log('✅ No sub-subcategories to reorder.');
            return callback(null);
        }

        const updateQuery = `UPDATE subsubcategory SET ss_id = CASE 
            ${queries.map(([newId, oldId]) => `WHEN ss_id = '${oldId}' THEN '${newId}'`).join(' ')}
            ELSE ss_id END`;

        conn.query(updateQuery, (err) => {
            if (err) {
                console.error('❌ Error updating sub-subcategory IDs:', err);
                return callback(err);
            }
            console.log('✅ All sub-subcategory IDs reordered successfully');
            return callback(null);
        });
    });
}




const deleteSubSubCategory = (req, res) => {
    const ssId = req.params.id;

    // Get Image Path
    const getImageQuery = 'SELECT ss_image FROM subsubcategory WHERE ss_id = ?';
    conn.query(getImageQuery, [ssId], (err, result) => {
        if (err) {
            console.error('Error fetching sub-subcategory image:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log("🔍 Retrieved Sub-Subcategory Data:", result);
        // Delete Image File
        if (result.length > 0 && result[0].ss_image) {
            const imageFileName = result[0].ss_image.trim(); // Ensure there's no extra spaces
            const oldImagePath = path.join(__dirname, '..', 'public', 'images', imageFileName);

            console.log("🗑 Attempting to delete image:", oldImagePath);

            // Check if file exists before deleting
            fs.access(oldImagePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error('❌ Error deleting sub-subcategory image:', err);
                        } else {
                            console.log('✅ Old image deleted successfully:', oldImagePath);
                        }
                    });
                } else {
                    console.warn('⚠ Image file does not exist, skipping deletion:', oldImagePath);
                }
            });
        } else {
            console.warn('⚠ No image found for this sub-subcategory.');
        }


        // Delete Sub-Subcategory from DB
        const deleteQuery = 'DELETE FROM subsubcategory WHERE ss_id = ?';
        conn.query(deleteQuery, [ssId], (err, result) => {
            if (err) {
                console.error('Error deleting sub-subcategory:', err);
                return res.status(500).json({ error: 'Database error' });
            }
           
            // Reset Counter for Reordering
            const setCounterQuery = 'SET @count = 0';
            conn.query(setCounterQuery, (err) => {
                if (err) {
                    console.error('Error setting sub-subcategory counter:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                // Reorder Sub-Subcategory IDs Dynamically
                const reorderQuery = `
                    UPDATE subsubcategory 
                    JOIN (
                        SELECT ss_id, sub_id, (@count := @count + 1) AS newId
                        FROM subsubcategory
                        ORDER BY sub_id, ss_id
                    ) AS orderedSS
                    ON subsubcategory.ss_id = orderedSS.ss_id
                    SET subsubcategory.ss_id = CONCAT('SS', LPAD(orderedSS.newId, 2, '0'));
                `;

                conn.query(reorderQuery, (err) => {
                    if (err) {
                        console.error('Error reordering sub-subcategory IDs:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json({ message: 'Sub-Subcategory deleted and IDs reordered successfully' });
                });
            });
        });
    });
};

const getAllCategories = (req, res) => {
    const query = "SELECT * FROM category WHERE is_deleted = 0"; // ✅ Fetch all categories

    conn.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching categories:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
};


const createTableAndView = async (req, res) => {
    try {
        const { categoryName, fields } = req.body;

        if (!categoryName || !Array.isArray(fields) || fields.length === 0) {
            return res.json({ success: false, error: "Category name or fields are missing/invalid" });
        }

        const tableName = categoryName.replace(/\s+/g, '_').toLowerCase(); // Normalize table name
        const viewName = `${tableName}`;

        // **Step 1: Fetch CY_ID from category table**
        const getCategorySQL = `SELECT cy_id FROM category WHERE cy_name = ? LIMIT 1`;
        conn.query(getCategorySQL, [categoryName], (err, categoryResult) => {
            if (err || categoryResult.length === 0) {
                console.error("❌ Error fetching category ID:", err);
                return res.json({ success: false, error: "Category not found" });
            }

            const cy_id = categoryResult[0].cy_id;

            // **Step 2: Define valid SQL types**
            const fieldDefinitions = fields.map(field => {
                let type = field.type.toUpperCase();

                if (type === "VARCHA") type = "VARCHAR(255)"; // Fix typo
                if (type === "DECIMA") type = "DECIMAL(10,2)";

                if (type.startsWith("VARCHAR")) {
                    type = `VARCHAR(255)`;
                } else if (type === "TEXT") {
                    type = "TEXT";
                } else if (type === "INT") {
                    type = "INT";
                } else if (type === "CHAR") {
                    type = "CHAR(5)";
                } else if (type === "DECIMAL") {
                    type = "DECIMAL(10,2)";
                } else {
                    console.warn(`⚠️ Invalid field type '${field.type}' for column '${field.name}'`);
                    return null;
                }
                return `\`${field.name}\` ${type}`;
            }).filter(Boolean);

            if (fieldDefinitions.length === 0) {
                return res.json({ success: false, error: "No valid fields found. Please check field types." });
            }

            fieldDefinitions.unshift("id CHAR(5) PRIMARY KEY"); // Add ID column
            fieldDefinitions.push("CY_ID CHAR(4) NOT NULL"); // Add CY_ID

            // **Step 3: Construct CREATE TABLE Query**
            const createTableSQL = `CREATE TABLE IF NOT EXISTS \`${tableName}_table\` (${fieldDefinitions.join(', ')})`;

            conn.query(createTableSQL, (err, result) => {
                if (err) {
                    console.error("❌ Table Creation Error:", err);
                    return res.json({ success: false, error: "SQL Table Error: " + err.message });
                }

                console.log(`✅ Table '${tableName}' created successfully.`);

                // **Step 4: Find the Correct Table Name**
                setTimeout(() => {
                    const checkTableSQL = `SHOW TABLES LIKE ?`;
                    conn.query(checkTableSQL, [`${tableName}%`], (err, tables) => {
                        if (err || tables.length === 0) {
                            console.error("❌ Error finding table:", err);
                            return res.json({ success: false, error: "Table not found in database." });
                        }

                        // ✅ Extract the correct table name
                        const correctTableName = Object.values(tables[0])[0]; // Get actual table name

                        console.log(`🟢 Correct Table Name Found: '${correctTableName}'`);

                        // **Step 5: Fetch Columns from the Correct Table**
                        const checkColumnsSQL = `SHOW COLUMNS FROM \`${correctTableName}\``;
                        conn.query(checkColumnsSQL, (err, columns) => {
                            if (err || columns.length === 0) {
                                console.error("❌ Error fetching table columns:", err);
                                return res.json({ success: false, error: "Error fetching table columns. Table may not exist." });
                            }

                            const validColumns = columns.map(col => col.Field);
                            console.log(`🟢 Valid Columns in '${correctTableName}':`, validColumns);

                            // **Step 6: Construct CREATE VIEW Query**
                            const selectFields = fields
                                .map(field => (validColumns.includes(field.name) ? `\`${field.name}\`` : null))
                                .filter(Boolean)
                                .join(', ');

                            let additionalField = validColumns.includes("CY_ID") ? ", CY_ID AS category_id" : "";

                            if (!selectFields) {
                                console.error(`❌ No valid columns for creating the view '${viewName}'`);
                                return res.json({ success: false, error: `No valid columns available to create view '${viewName}'.` });
                            }

                            const createViewSQL = `CREATE VIEW \`${viewName}\` AS 
                                                   SELECT id, ${selectFields} ${additionalField} 
                                                   FROM \`${correctTableName}\``;

                            conn.query(createViewSQL, (err, result) => {
                                if (err) {
                                    console.error("❌ View Creation Error:", err);
                                    return res.json({ success: false, error: "SQL View Error: " + err.message });
                                }

                                console.log(`✅ View '${viewName}' created successfully.`);
                                res.json({ success: true, message: `Table '${correctTableName}' and View '${viewName}' created successfully.` });
                            });
                        });
                    });
                }, 500); // Delay before checking table name
            });
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ success: false, error: "Server error occurred." });
    }
};


module.exports = {
    createTableAndView,
    getCategories,
    addCategory,
    addSubCategory,
    addSubSubCategory,
    updateCategory,
    updateSubcategory,
    updateSubSubcategory,
    removeCategory,
    removeSubCategory,      
    removeSubSubCategory,
    getSubcategoriesByCategory,
    getAllCategories,
    getSubSubcategories,
    upload,
};

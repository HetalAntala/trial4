const mysql = require("mysql");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');  // Store in 'public/uploads'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
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
            c.cy_id AS category_id, c.cy_name AS category_name, c.cy_desc AS category_desc, c.cy_image AS category_image,
            s.sub_id AS subcategory_id, s.sub_name AS subcategory_name, s.sub_desc AS subcategory_desc, s.sub_image AS subcategory_image,
            ss.ss_id AS subsubcategory_id, ss.ss_name AS subsubcategory_name, ss.ss_desc AS subsubcategory_desc, ss.ss_image AS subsubcategory_image
        FROM 
            category c
        LEFT JOIN 
            subcategory s ON c.cy_id = s.cy_id
        LEFT JOIN 
            subsubcategory ss ON s.sub_id = ss.sub_id
        ORDER BY 
            c.cy_id, s.sub_id, ss.ss_id;
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


const getSubcategories = (req, res) => {
    const categoryId = req.params.categoryId;
    const query = `SELECT sub_id, sub_name FROM subcategory WHERE cy_id = ?`;

    conn.query(query, [categoryId], (err, results) => {
        if (err) {
            console.error('Error fetching subcategories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};

// ✅ Fetch all categories, subcategories, and sub-subcategories
// const addCategory = (req, res) => {
//     const { cy_name , cy_desc} = req.body;
//     const cy_image = req.file ? `${req.file.filename}` : null; 

//     if (!cy_name) {
//         return res.status(400).json({ error: 'Category name is required' });
//     }

//     const getMaxCategoryIdQuery = `SELECT MAX(cy_id) AS maxId FROM category`;

//     conn.query(getMaxCategoryIdQuery, (err, result) => {
//         if (err) {
//             console.error('Error fetching max category ID:', err);
//             return res.status(500).json({ error: 'Database error' });
//         }

//         let newCategoryId;
//         if (result[0].maxId) {
//             const lastIdNumber = parseInt(result[0].maxId.replace(/\D/g, ""), 10);
//             newCategoryId = `CY${String(lastIdNumber + 1).padStart(2, '0')}`;
//         } else {
//             newCategoryId = `CY01`;
//         }

//         const insertQuery = 'INSERT INTO category (cy_id, cy_name, cy_desc, cy_image) VALUES (?, ?, ?)';
//         conn.query(insertQuery, [newCategoryId, cy_name, cy_desc, cy_image], (err, result) => {
//             if (err) {
//                 console.error('Error inserting category:', err);
//                 return res.status(500).json({ error: 'Database error' });
//             }
//             res.json({ message: 'Category added successfully', id: newCategoryId });
//         });
//     });
// };

const addCategory = (req, res) => {
    const { cy_name, cy_desc } = req.body;
    const cy_image = req.file ? req.file.filename : null; // Set image if uploaded, otherwise null

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
    const sub_image = req.file ? req.file.filename : null;

    if (!sub_name || !sub_desc || !cy_id) {
        return res.status(400).json({ error: "Subcategory name, description, and category ID are required" });
    }

    conn.beginTransaction((err) => {
        if (err) {
            console.error("❌ Error starting transaction:", err);
            return res.status(500).json({ error: "Database transaction error" });
        }

        // ✅ Fetch the maximum subcategory ID from the entire subcategory table
        const getMaxSubIdQuery = `SELECT MAX(CAST(SUBSTRING(sub_id, 4) AS UNSIGNED)) AS maxId FROM subcategory`;

        conn.query(getMaxSubIdQuery, (err, results) => {
            if (err) {
                console.error("❌ Error fetching max subcategory ID:", err);
                return rollbackTransaction(res, "Database error while fetching subcategory ID");
            }

            let newSubId;
            if (results.length > 0 && results[0].maxId !== null) {
                newSubId = `SUB${String(results[0].maxId + 1).padStart(2, "0")}`;
            } else {
                newSubId = `SUB01`;
            }

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
const rollbackTransaction = (res, errorMessage) => {
    conn.rollback(() => {
        console.error("🔄 Transaction Rolled Back");
        return res.status(500).json({ error: errorMessage });
    });
};



const addSubSubCategory = (req, res) => {
    const { ss_name, sub_id } = req.body;
    const ss_image = req.file ? req.file.filename : null;

    if (!ss_name || !sub_id) {
        return res.status(400).json({ error: 'Sub-Subcategory name and Subcategory ID are required' });
    }

    // ✅ Get Maximum ss_id across all sub-subcategories
    const getMaxSsIdQuery = `SELECT MAX(CAST(SUBSTRING(ss_id, 3) AS UNSIGNED)) AS maxId FROM subsubcategory`;

    conn.query(getMaxSsIdQuery, (err, result) => {
        if (err) {
            console.error('Error fetching max sub-subcategory ID:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // ✅ Generate New Unique ss_id
        let newSsId;
        if (result[0].maxId) {
            newSsId = `SS${String(result[0].maxId + 1).padStart(2, '0')}`;
        } else {
            newSsId = `SS01`;
        }

        const insertQuery = 'INSERT INTO subsubcategory (ss_id, ss_name, sub_id, ss_image) VALUES (?, ?, ?, ?)';
        conn.query(insertQuery, [newSsId, ss_name, sub_id, ss_image], (err, result) => {
            if (err) {
                console.error('Error inserting sub-subcategory:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Sub-Subcategory added successfully', ss_id: newSsId });
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

    if (!sub_name) {
        return res.status(400).json({ error: "Subcategory name is required" });
    }

    // Check if subcategory exists
    const checkQuery = "SELECT sub_image FROM subcategory WHERE sub_id = ?";
    conn.query(checkQuery, [subcategoryId], (err, result) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Subcategory not found" });
        }

        const oldImagePath = result[0].sub_image;
        let query, params;

        if (sub_image) {
            query = "UPDATE subcategory SET sub_name = ?, sub_desc = ?, sub_image = ? WHERE sub_id = ?";
            params = [sub_name, sub_desc, sub_image, subcategoryId];
        } else {
            query = "UPDATE subcategory SET sub_name = ?, sub_desc = ? WHERE sub_id = ?";
            params = [sub_name, sub_desc, subcategoryId];
        }

        conn.query(query, params, (err, updateResult) => {
            if (err) {
                console.error("❌ Error updating subcategory:", err);
                return res.status(500).json({ error: "Database error" });
            }

            // Delete old image if a new one is uploaded
            if (sub_image && oldImagePath) {
                const oldImageFullPath = path.join(__dirname, "..", "public", "uploads", oldImagePath);
                fs.unlink(oldImageFullPath, (err) => {
                    if (err) console.error("❌ Error deleting old image:", err);
                });
            }

            res.json({ success: true, message: "Subcategory updated successfully" });
        });
    });
};

const updateSubSubcategory = (req, res) => {
    const subsubcategoryId = req.params.id;
    const { ss_name } = req.body;
    const ss_image = req.file ? req.file.filename : null;

    if (!ss_name) {
        return res.status(400).json({ error: 'Sub-Subcategory name is required' });
    }

    // Get Old Image Path
    const getImageQuery = 'SELECT ss_image FROM subsubcategory WHERE ss_id = ?';
    conn.query(getImageQuery, [subsubcategoryId], (err, result) => {
        if (err) {
            console.error('Error fetching old image:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const oldImagePath = result[0].ss_image;

        // Prepare Query and Parameters
        const query = ss_image ? 
            'UPDATE subsubcategory SET ss_name = ?, ss_image = ? WHERE ss_id = ?' :
            'UPDATE subsubcategory SET ss_name = ? WHERE ss_id = ?';

        const params = ss_image ? [ss_name, ss_image, subsubcategoryId] : [ss_name, subsubcategoryId];

        // Execute Update Query
        conn.query(query, params, (err, result) => {
            if (err) {
                console.error('Error updating sub-subcategory:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Delete old image if a new one is uploaded
            if (ss_image && oldImagePath) {
                const oldImageFullPath = path.join(__dirname, '..', 'public', 'uploads', oldImagePath);
                fs.unlink(oldImageFullPath, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }

            res.json({ message: 'Sub-Subcategory updated successfully' });
        });
    });
};

// ✅ Delete Category and Image
const deleteCategory = (req, res) => {
    const categoryId = req.params.id;
    const getImageQuery = 'SELECT cy_image FROM category WHERE cy_id = ?';

    // 1. Get Image Path
    conn.query(getImageQuery, [categoryId], (err, result) => {
        if (err) {
            console.error('Error fetching image:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // 2. Delete Image File
        if (result[0] && result[0].cy_image) {
            const oldImagePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(result[0].cy_image));
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                } else {
                    console.log('Old image deleted successfully:', oldImagePath);
                }
            });
        }

        // 3. Delete Category from DB
        const deleteQuery = 'DELETE FROM category WHERE cy_id = ?';
        conn.query(deleteQuery, [categoryId], (err, result) => {
            if (err) {
                console.error('Error deleting category:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // 4. Initialize Counter
            const setCounterQuery = 'SET @count = 0';
            conn.query(setCounterQuery, (err) => {
                if (err) {
                    console.error('Error setting counter:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                // 5. Reorder IDs Dynamically
                const reorderQuery = `
                    UPDATE category 
                    SET cy_id = CONCAT('CY', LPAD(@count := @count + 1, 2, '0'))
                    ORDER BY cy_id;
                `;
                conn.query(reorderQuery, (err) => {
                    if (err) {
                        console.error('Error reordering IDs:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json({ message: 'Category deleted and IDs reordered successfully' });
                });
            });
        });
    });
};

const deleteSubCategory = (req, res) => {
    const subId = req.params.id;

    // ✅ Step 1: Get Image Path
    const getImageQuery = 'SELECT sub_image FROM subcategory WHERE sub_id = ?';
    conn.query(getImageQuery, [subId], (err, result) => {
        if (err) {
            console.error('❌ Error fetching subcategory image:', err);
            return res.status(500).json({ error: 'Database error while fetching image' });
        }

        if (result.length > 0 && result[0].sub_image) {
            const oldImagePath = path.join(__dirname, '..', 'public', 'uploads', result[0].sub_image);

            // ✅ Step 2: Delete Image File (if exists)
            fs.access(oldImagePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('❌ Error deleting subcategory image:', err);
                        else console.log('✅ Image deleted successfully:', oldImagePath);
                    });
                } else {
                    console.warn('⚠ Warning: Image file not found:', oldImagePath);
                }
            });
        }

        // ✅ Step 3: Delete Subcategory from Database
        const deleteQuery = 'DELETE FROM subcategory WHERE sub_id = ?';
        conn.query(deleteQuery, [subId], (err, result) => {
            if (err) {
                console.error('❌ Error deleting subcategory:', err);
                return res.status(500).json({ error: 'Database error while deleting subcategory' });
            }

            console.log('✅ Subcategory deleted successfully:', subId);

            // ✅ Step 4: Fetch all remaining subcategories ordered by `cy_id` and `sub_id`
            const fetchQuery = `SELECT sub_id FROM subcategory ORDER BY cy_id, CAST(SUBSTRING(sub_id, 4) AS UNSIGNED)`;
            conn.query(fetchQuery, (err, rows) => {
                if (err) {
                    console.error('❌ Error fetching subcategories:', err);
                    return res.status(500).json({ error: 'Database error while fetching subcategories' });
                }

                // ✅ Step 5: Reorder Subcategory IDs one by one using recursive function
                let count = 1;

                function updateNext(index) {
                    if (index >= rows.length) {
                        console.log('✅ Subcategory IDs reordered successfully');
                        return res.json({ message: 'Subcategory deleted and IDs reordered successfully' });
                    }

                    const oldSubId = rows[index].sub_id;
                    const newSubId = `SUB${String(count++).padStart(2, '0')}`;

                    conn.query('UPDATE subcategory SET sub_id = ? WHERE sub_id = ?', [newSubId, oldSubId], (err) => {
                        if (err) {
                            console.error('❌ Error updating subcategory ID:', err);
                            return res.status(500).json({ error: 'Database error while reordering IDs' });
                        }
                        updateNext(index + 1);
                    });
                }

                // Start recursive renaming process
                updateNext(0);
            });
        });
    });
};



const deleteSubSubCategory = (req, res) => {
    const ssId = req.params.id;

    // Get Image Path
    const getImageQuery = 'SELECT ss_image FROM subsubcategory WHERE ss_id = ?';
    conn.query(getImageQuery, [ssId], (err, result) => {
        if (err) {
            console.error('Error fetching sub-subcategory image:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Delete Image File
        if (result[0] && result[0].ss_image) {
            const oldImagePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(result[0].ss_image));
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting sub-subcategory image:', err);
                } else {
                    console.log('Old image deleted successfully:', oldImagePath);
                }
            });
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

// const createProductTable = (category) => {
//     // Generate dynamic field names
//     const idField = category.slice(0, 2).toUpperCase() + '_id';
//     const nameField = category.slice(0, 2).toUpperCase() + '_name';
//     const descField = category.slice(0, 2).toUpperCase() + '_desc';
//     const priceField = category.slice(0, 2).toUpperCase() + '_price';
//     const stockfield=category.slice(0,2).toUpperCase()+'_stock';
    
//     // Create table query for the category
//     const createTableQuery = `
//         CREATE TABLE IF NOT EXISTS ${category} (
//             ${idField} VARCHAR(10) PRIMARY KEY,
//             ${nameField} VARCHAR(255) NOT NULL,
//             ${descField} TEXT,
//             ${priceField} DECIMAL(10, 2) NOT NULL,
//             ${stockfield} INT NOT NULL,
//             Cy_id VARCHAR(10),
//             FOREIGN KEY (Cy_id) REFERENCES category(Cy_id)
//         )
//     `;

//     // Execute the query
//     conn.query(createTableQuery, (err, result) => {
//         if (err) {
//             console.error("Error creating category table:", err);
//             return;
//         }
//         console.log(`Table ${category} created successfully or already exists`);

//         // Create or modify image table to link with this category
//         const alterImageTableQuery = `
//             ALTER TABLE image
//             ADD CONSTRAINT fk_${category}_product
//             FOREIGN KEY (Product_id) REFERENCES ${category}(${idField})
//             ON DELETE CASCADE
//             ON UPDATE CASCADE;
//         `;

//         // Execute the alter table query
//         db.query(alterImageTableQuery, (err, result) => {
//             if (err) {
//                 if (err.code === 'ER_DUP_KEYNAME') {
//                     console.log(`Foreign key for ${category} already exists in image table.`);
//                 } else {
//                     console.error("Error adding foreign key:", err);
//                 }
//                 return;
//             }
//             console.log(`Foreign key added for ${category} in image table.`);
//         });
//     });
// };
const getAllCategories = (req, res) => {
    conn.query('SELECT CY_ID,CY_NAME FROM category', (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};


const createTable = async (req, res) => {

    try {
        const { categoryName , fields } = req.body;

        if (!categoryName || !Array.isArray(fields) || fields.length === 0) {
            return res.json({ success: false, error: "Category name or fields are missing/invalid" });
        }

        const tableName = categoryName.replace(/\s+/g, '_'); // Ensure a valid SQL table name

        // **Fix: Ensure valid SQL data types**
        const fieldDefinitions = fields.map(field => {
            let type = field.type.toUpperCase(); // Normalize type names
            if (type.startsWith("VARCHAR")) {
                type = `VARCHAR(255)`; // Default to VARCHAR(255) if no length is specified
            } else if (type === "VARCHA") { 
                type = "VARCHAR(255)"; // Fix common typo
            } else if (type === "TEXT") {
                type = "TEXT"; // Allow TEXT
            } else if (type === "INT") {
                type = "INT"; // Ensure INT remains correct
            } else {
                return null; // Invalid type
            }
            return `\`${field.name}\` ${type}`;
        }).filter(Boolean); // Remove invalid entries

        if (fieldDefinitions.length === 0) {
            return res.json({ success: false, error: "Invalid fields provided." });
        }

        // **Fix: Construct correct SQL query**
        const sql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (id INT AUTO_INCREMENT PRIMARY KEY, ${fieldDefinitions.join(', ')})`;

        conn.query(sql, (err, result) => {
            if (err) {
                console.error("SQL Error:", err);
                return res.json({ success: false, error: "SQL Error: " + err.message });
            }
            res.json({ success: true, message: `Table '${tableName}' created successfully.` });
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: "Server error occurred." });
    }
};


module.exports = {
    createTable,
    getCategories,
    addCategory,
    addSubCategory,
    addSubSubCategory,
    updateCategory,
    updateSubcategory,
    updateSubSubcategory,
    deleteCategory,
    deleteSubCategory,
    deleteSubSubCategory,
    getSubcategories,
    getAllCategories,
    upload,
};

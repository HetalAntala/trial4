const mysql = require("mysql");
const crypto = require("crypto");
const { tableExists, createCategoryTable } = require('./categoryController');
// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hetalsql@1405',
  database: 'main_project',
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

const getAllProducts = (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Get current page number, default to 1
    const limit = 10;  // Number of products per page
    const offset = (page - 1) * limit;  // Calculate offset

    const query = `
        SELECT 
            P.P_ID as Product_id, 
            P.P_NAME as product_name, 
            P.P_DESC as description, 
            P.P_PRICE as price, 
            I.PATH1 as image, 
            'Plant' as category
        FROM plants P
        LEFT JOIN image I ON P.P_ID = I.PRODUCT_ID
        
        UNION ALL
        
        SELECT 
            B.B_ID as Product_id, 
            B.B_NAME as product_name, 
            B.B_DESC as description, 
            B.B_PRICE as price, 
            I.PATH1 as image, 
            'Bouquet' as category
        FROM bouquet B
        LEFT JOIN image I ON B.B_ID = I.PRODUCT_ID
        
        UNION ALL
        
        SELECT 
            PT.PT_ID as Product_id, 
            PT.PT_NAME as product_name, 
            PT.PT_DESC as description, 
            PT.PT_PRICE as price, 
            I.PATH1 as image, 
            'Pot' as category
        FROM pots PT
        LEFT JOIN image I ON PT.PT_ID = I.PRODUCT_ID
        
        ORDER BY Product_id
        LIMIT ${limit} OFFSET ${offset};
    `;

    const countQuery = `
        SELECT (
            (SELECT COUNT(*) FROM plants) +
            (SELECT COUNT(*) FROM bouquet) +
            (SELECT COUNT(*) FROM pots)
        ) as total
    `;


    Promise.all([
        new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(countQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].total);
            });
        })
    ])
    .then(results => {
        const allProducts = results[0];
        const totalProducts = results[1];
        res.json({
            products: allProducts,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page
        });
    })
    .catch(err => {
        console.error("Error fetching products:", err);
        res.status(500).json({ error: "Internal server error" });
    });
};
const getCategories = (req, res) => {
    db.query('SELECT CY_ID,CY_NAME FROM category', (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};

const getAllCategories = (req, res) => {
    db.query('SELECT CY_ID,CY_NAME FROM category', (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};

// Fetch Subcategories for a Category
const getSubcategories = (req, res) => {
    const categoryId = req.params.cy_id;
    db.query('SELECT * FROM subcategory WHERE cy_id = ?', [categoryId], (err, results) => {
        if (err) {
            console.error('Error fetching subcategories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};

// Fetch Sub-Subcategories for a Subcategory
const getSubSubcategories = (req, res) => {
    const subcategoryId = req.params.sub_id;
    db.query('SELECT * FROM subsubcategory WHERE sub_id = ?', [subcategoryId], (err, results) => {
        if (err) {
            console.error('Error fetching sub-subcategories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};
// const getProductsByCategory = async (req, res) => {
//     const { category } = req.query;

//     if (!category) {
//         return res.status(400).json({ success: false, error: "Category ID is required" });
//     }

//     try {
//         const categoryQuery = "SELECT CY_NAME FROM category WHERE CY_ID = ?";
//         db.query(categoryQuery, [category], (error, categoryResult) => {
//             if (error) {
//                 console.error("❌ Error fetching category name:", error);
//                 return res.status(500).json({ success: false, error: "Database error", details: error.message });
//             }
            
//             if (categoryResult.length === 0) {
//                 console.error(`❌ No category found for ID: ${category}`);
//                 return res.status(404).json({ success: false, error: "Category not found" });
//             }

//             const tableName = categoryResult[0].name.toLowerCase().replace(/\s+/g, '_');
//             console.log("✅ Resolved Table Name:", tableName);

//             const checkTableQuery = `SHOW TABLES LIKE ?`;
//             db.query(checkTableQuery, [tableName], (error, tableResult) => {
//                 if (error) {
//                     console.error("❌ Error checking table existence:", error);
//                     return res.status(500).json({ success: false, error: "Database error", details: error.message });
//                 }

//                 if (tableResult.length === 0) {
//                     console.error(`❌ Table '${tableName}' does not exist in the database.`);
//                     return res.status(404).json({ success: false, error: `Table '${tableName}' does not exist.` });
//                 }

//                 const query = `SELECT * FROM \`${tableName}\``;
//                 db.query(query, (error, results) => {
//                     if (error) {
//                         console.error("❌ SQL Error:", error);
//                         return res.status(500).json({ success: false, error: "Database error", details: error.message });
//                     }
//                     res.json({ success: true, products: results });
//                 });
//             });
//         });

//     } catch (error) {
//         console.error("❌ Unexpected Server Error:", error);
//         res.status(500).json({ success: false, error: "Unexpected server error", details: error.message });
//     }
// };

const getField = async (req, res) => {
    const { category } = req.query;
    if (!category) {
        return res.status(400).json({ success: false, error: "Category is required" });
    }

    try {
        db.query(`SHOW COLUMNS FROM \`${category}\``, (error, results) => {
            if (error) {
                console.error("Error fetching fields:", error);
                return res.json({ success: false, error: "Database error" });
            }
            const formattedFields = results.map(field => ({
                name: field.Field,
                type: field.Type.includes('int') ? 'INT' : 'VARCHAR'
            }));
            res.json({ success: true, fields: formattedFields });
        });
        
    } catch (error) {
        console.error("Error fetching fields:", error);
        res.status(500).json({ success: false, error: "Database error" });
    }
};

const addProduct = (req, res) => {
    console.log("Received Request:", req.body);

    let { categoryId, productData, images } = req.body;

    if (!categoryId || !productData || Object.keys(productData).length === 0) {
        return res.status(400).json({ success: false, error: "Missing required product details." });
    }

    db.query("SELECT CY_NAME FROM category WHERE CY_ID = ?", [categoryId], (err, rows) => {
        if (err) {
            console.error("Error fetching category:", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }

        if (rows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid category ID" });
        }

        const categoryName = rows[0].CY_NAME;
        console.log("Resolved Category Name:", categoryName);

        let tableName = categoryName.toLowerCase().replace(/\s+/g, '_');

        db.query(`SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`, (err, keyResults) => {
            if (err) {
                console.error("Error fetching primary key:", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }

            if (keyResults.length === 0) {
                return res.status(500).json({ success: false, error: "No primary key found for the category table" });
            }

            const primaryKey = keyResults[0].Column_name;
            console.log("Resolved Primary Key Column:", primaryKey);

            // ✅ Generate New Product ID
            db.query(`SELECT ${primaryKey} FROM ${tableName} ORDER BY ${primaryKey} DESC LIMIT 1`, (err, result) => {
                if (err) {
                    console.error("Error fetching last product ID:", err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }

                let newProductId;
                if (result.length > 0) {
                    const lastId = result[0][primaryKey];
                    const numericPart = parseInt(lastId.match(/\d+/)[0], 10) + 1;
                    const prefix = lastId.match(/[A-Za-z]+/)[0];
                    newProductId = `${prefix}${String(numericPart).padStart(4, "0")}`;
                } else {
                    newProductId = `${primaryKey.split("_")[0]}0001`;
                }

                console.log("Generated New Product ID:", newProductId);
                productData[primaryKey] = newProductId;

                // ✅ Remove categoryId (it should NOT be in the table)
                delete productData.categoryId;

                // ❌ Remove images from the product insert query
                delete productData.prod_img1;
                delete productData.prod_img2;
                delete productData.prod_img3;

                const query = `INSERT INTO ${tableName} SET ?`;
                db.query(query, productData, (err, result) => {
                    if (err) {
                        console.error("Error inserting product:", err);
                        return res.status(500).json({ success: false, error: "Database error" });
                    }

                    console.log("Product inserted successfully:", productData);

                    // ✅ Insert Images into `image` table
                    if (images.length > 0) {
                        insertImages(newProductId, images, res);
                    } else {
                        res.json({ success: true, message: "Product added successfully!", productId: newProductId });
                    }
                });
            });
        });
    });
};

// ✅ Function to Insert Images
function insertImages(productId, images, res) {
    db.query(
        `SELECT IMG_ID FROM image ORDER BY CAST(SUBSTRING(IMG_ID, 4) AS UNSIGNED) DESC LIMIT 1`,
        (err, imgResult) => {
            if (err) return res.status(500).json({ error: "Database error" });

            let newImgId = imgResult.length > 0
                ? `IMG${String(parseInt(imgResult[0].IMG_ID.replace(/\D/g, ''), 10) + 1).padStart(3, "0")}`
                : "IMG001";

            let filteredImages = images.filter(img => img); // Remove null values
            if (filteredImages.length === 0) return res.json({ success: true, message: "No images uploaded." });

            let placeholders = new Array(filteredImages.length).fill('?').join(', ');
            let imageQuery = `INSERT INTO image (IMG_ID, ${filteredImages.map((_, i) => `PATH${i + 1}`).join(', ')}, PRODUCT_ID) VALUES (?, ${placeholders}, ?)`;

            db.query(imageQuery, [newImgId, ...filteredImages, productId], (err) => {
                if (err) return res.status(500).json({ error: "Image insertion failed" });

                res.json({
                    success: true,
                    message: "Product and images added successfully",
                    insertedProductId: productId,
                    insertedImageId: newImgId
                });
            });
        }
    );
}



const lastId = (req, res) => {
    const { tableName } = req.query;
    if (!tableName) {
        return res.status(400).json({ error: 'Missing table name' });
    }

    // Query to get the primary key column name dynamically
    const columnQuery = `SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`;
    db.query(`SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`, (error, keyResults) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        if (keyResults.length === 0) {
            return res.status(400).json({ error: 'No primary key found' });
        }

        const primaryKey = keyResults[0].Column_name;
        db.query(`SELECT ${primaryKey} FROM ${tableName} ORDER BY ${primaryKey} DESC LIMIT 1`, (error, results) => {
            if (error) return res.status(500).json({ error: 'Database error' });
            res.json({ lastId: results.length > 0 ? results[0][primaryKey] : null });
        });
    });
};

const getPK = (req, res) => {
    const { tableName } = req.query;
    if (!tableName) return res.status(400).json({ error: 'Missing table name' });

    db.query(`SHOW KEYS FROM ${tableName} WHERE Key_name = 'PRIMARY'`, (error, keyResults) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        if (keyResults.length === 0) {
            return res.status(400).json({ error: 'No primary key found for this table' });
        }

        res.json({ primaryKey: keyResults[0].Column_name });
    });
};

function generateProductId(lastId, primaryKey) {
    let prefix = primaryKey.split('_')[0];

    if (!lastId) return `${prefix}0001`;

    const numericPartMatch = lastId.match(/\d+/);
    const numericPart = numericPartMatch ? parseInt(numericPartMatch[0], 10) + 1 : 1;

    return `${prefix}${String(numericPart).padStart(4, '0')}`;
}



module.exports = {
    getCategories,
    getField,
    getAllProducts,
    getAllCategories,
    getSubcategories,
    getSubSubcategories,
    addProduct,
    lastId,
    getPK,
};
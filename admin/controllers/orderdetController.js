const mysql = require("mysql");

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

// Define the base URL for the client-side images
const CLIENT_IMAGE_BASE_URL = 'http://localhost:3000/images/'; // Adjust this to your client server's URL

// Fetch all orders
exports.getAllOrders = (req, res) => {
    const query = `
        SELECT 
            O_id, 
            O_date, 
            O_status, 
            C_id
        FROM order_master
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            console.log('Fetched orders:', results);
            res.json(results);
        }
    });
};

// Fetch detailed product info for a specific order dynamically
exports.getOrderDetails = (req, res) => {
    const orderId = req.params.id;

    // Step 1: Fetch the products for the order
    const initialQuery = `
        SELECT 
            od.Odetails_id,
            od.Product_id,
            od.O_Qty,
            od.O_price,
            od.O_id
        FROM order_details od
        WHERE od.O_id = ?
    `;

    db.query(initialQuery, [orderId], (err, orderDetails) => {
        if (err) {
            console.error('Error fetching initial order details:', err.sqlMessage);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }

        console.log(`Initial order details for O_id ${orderId}:`, orderDetails);

        if (orderDetails.length === 0) {
            return res.status(404).json({ error: 'No details found for this order in order_details' });
        }

        // Step 2: Fetch all categories
        db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
            if (err) {
                console.error('Error fetching categories:', err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }

            // Step 3: Validate which tables exist and fetch their primary keys
            const tablePromises = categories.map(category => {
                const tableName = category.CY_NAME.toLowerCase().replace(/\s+/g, '_');
                return new Promise((resolve) => {
                    // Check if the table exists
                    db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                        if (err) {
                            console.error(`Error checking table ${tableName} existence:`, err);
                            resolve({ tableName, exists: false, primaryKey: null });
                            return;
                        }
                        if (result.length === 0) {
                            resolve({ tableName, exists: false, primaryKey: null });
                            return;
                        }

                        // Fetch the primary key for the table
                        db.query(`SHOW KEYS FROM \`${tableName}\` WHERE Key_name = 'PRIMARY'`, (err, keyResult) => {
                            if (err) {
                                console.error(`Error fetching primary key for table ${tableName}:`, err);
                                resolve({ tableName, exists: true, primaryKey: null });
                                return;
                            }
                            const primaryKey = keyResult.length > 0 ? keyResult[0].Column_name : null;
                            resolve({ tableName, exists: true, primaryKey });
                        });
                    });
                });
            });

            Promise.all(tablePromises).then(tableResults => {
                // Filter to only include tables that exist and have a primary key
                const validTables = tableResults.filter(table => table.exists && table.primaryKey);
                console.log(`Valid tables for O_id ${orderId}:`, validTables);

                if (validTables.length === 0) {
                    return res.status(404).json({ error: 'No valid product tables with primary keys found for the categories' });
                }

                // Step 4: Dynamically determine the table for each Product_id
                const productIds = orderDetails.map(detail => `'${detail.Product_id}'`).join(',');

                // Construct a UNION query for all existing tables with their primary keys
                const categoryQuery = validTables.map(table => {
                    const { tableName, primaryKey } = table;
                    return `
                        SELECT 
                            t.${primaryKey} AS Product_id,
                            c.CY_ID,
                            c.CY_NAME
                        FROM \`${tableName}\` t
                        JOIN category c ON t.CY_ID = c.CY_ID
                        WHERE t.${primaryKey} IN (${productIds})
                    `;
                }).join(' UNION ALL ');

                db.query(categoryQuery, (err, productCategories) => {
                    if (err) {
                        console.error('Error fetching product categories:', err);
                        return res.status(500).json({ error: 'Database error', details: err.message });
                    }

                    console.log(`Product categories for O_id ${orderId}:`, productCategories);

                    // Step 5: Group products by category (CY_ID) to determine which tables to query
                    const detailsByCategory = {};
                    orderDetails.forEach(detail => {
                        const productCategory = productCategories.find(pc => pc.Product_id === detail.Product_id);
                        if (!productCategory || !productCategory.CY_ID || !productCategory.CY_NAME) {
                            console.warn(`No category found for Product_id ${detail.Product_id} in order ${detail.O_id}`);
                            return;
                        }
                        const tableName = productCategory.CY_NAME.toLowerCase().replace(/\s+/g, '_');
                        if (!detailsByCategory[tableName]) {
                            detailsByCategory[tableName] = [];
                        }
                        detailsByCategory[tableName].push({
                            Odetails_id: detail.Odetails_id,
                            Product_id: detail.Product_id,
                            O_Qty: detail.O_Qty,
                            O_price: detail.O_price
                        });
                    });

                    // Step 6: Log the grouped details
                    console.log(`Details by Category for O_id ${orderId}:`, detailsByCategory);

                    if (Object.keys(detailsByCategory).length === 0) {
                        return res.status(404).json({ error: 'No valid categories found for the products in this order' });
                    }

                    // Step 7: Construct dynamic queries for each table
                    const queries = Object.keys(detailsByCategory).map(tableName => {
                        const productIds = detailsByCategory[tableName].map(detail => `'${detail.Product_id}'`).join(',');
                        return new Promise((resolve, reject) => {
                            // Fetch the schema of the table to map columns
                            db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
                                if (err) {
                                    console.error(`Error fetching schema for table ${tableName}:`, err);
                                    return reject(err);
                                }

                                const columnMap = {
                                    id: null,
                                    name: null,
                                    desc: null,
                                    price: null
                                };

                                columns.forEach(col => {
                                    const field = col.Field.toLowerCase();
                                    if (field.includes('id')) columnMap.id = col.Field;
                                    else if (field.includes('name')) columnMap.name = col.Field;
                                    else if (field.includes('desc')) columnMap.desc = col.Field;
                                    else if (field.includes('price')) columnMap.price = col.Field;
                                });

                                if (!columnMap.id || !columnMap.name || !columnMap.price) {
                                    console.error(`Required columns (id, name, price) not found in table '${tableName}'`);
                                    return reject(new Error(`Required columns (id, name, price) not found in table '${tableName}'`));
                                }

                                // Construct query for this table with LEFT JOIN on plants to handle missing products
                                const productQuery = `
                                    SELECT 
                                        od.Odetails_id,
                                        od.Product_id,
                                        od.O_Qty,
                                        od.O_price,
                                        t.${columnMap.name} AS product_name,
                                        ${columnMap.desc ? `t.${columnMap.desc}` : 'NULL'} AS description,
                                        IFNULL(CONCAT(?, i.PATH1), CONCAT(?, 'default.jpg')) AS image,
                                        c.CY_NAME AS category_name
                                    FROM order_details od
                                    LEFT JOIN \`${tableName}\` t ON od.Product_id = t.${columnMap.id}
                                    LEFT JOIN image i ON t.${columnMap.id} = i.PRODUCT_ID
                                    LEFT JOIN category c ON t.CY_ID = c.CY_ID
                                    WHERE od.O_id = ? AND od.Product_id IN (${productIds})
                                `;

                                db.query(productQuery, [
                                    CLIENT_IMAGE_BASE_URL,
                                    CLIENT_IMAGE_BASE_URL,
                                    orderId
                                ], (err, results) => {
                                    if (err) {
                                        console.error(`Error fetching details from table ${tableName}:`, err);
                                        return reject(err);
                                    }
                                    console.log(`Results from table ${tableName}:`, results);
                                    resolve(results);
                                });
                            });
                        });
                    });

                    // Step 8: Execute all queries and combine results
                    Promise.all(queries)
                        .then(results => {
                            // Flatten the results from all tables
                            const combinedResults = results.flat();
                            console.log(`Combined order details for O_id ${orderId}:`, combinedResults);
                            res.json(combinedResults);
                        })
                        .catch(err => {
                            console.error('Error fetching order details:', err);
                            res.status(500).json({ error: 'Database error', details: err.message });
                        });
                });
            });
        });
    });
};


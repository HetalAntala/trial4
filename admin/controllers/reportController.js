const mysql = require("mysql");
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

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


// Dashboard Data
exports.getDashboardData = (req, res) => {
    const today = new Date();
    const startOfDay = today.toISOString().split('T')[0];
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

    const dailySalesQuery = `
        SELECT SUM(od.O_price * od.O_Qty) as totalSales
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        WHERE om.O_status = 'Delivered' AND om.O_date >= ?
    `;
    const weeklySalesQuery = `
        SELECT SUM(od.O_price * od.O_Qty) as totalSales
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        WHERE om.O_status = 'Delivered' AND om.O_date >= ?
    `;
    const monthlySalesQuery = `
        SELECT SUM(od.O_price * od.O_Qty) as totalSales
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        WHERE om.O_status = 'Delivered' AND om.O_date >= ?
    `;
    const totalOrdersQuery = `
        SELECT COUNT(*) as totalOrders
        FROM order_master
    `;
    const totalActiveCustomersQuery = `
        SELECT COUNT(*) as totalActiveCustomers
        FROM customer
        WHERE c_status = 'active'
    `;
    const salesTrendQuery = `
        SELECT 
            DATE(om.O_date) as date,
            SUM(od.O_price * od.O_Qty) as totalSales
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        WHERE om.O_status = 'Delivered' AND om.O_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(om.O_date)
        ORDER BY DATE(om.O_date)
    `;
    const orderStatusQuery = `
        SELECT 
            O_status as status,
            COUNT(*) as count
        FROM order_master
        GROUP BY O_status
    `;
    const recentActivityQuery = `
        SELECT 
            'New Order' as activityType,
            O_id as identifier,
            O_date as activityDate
        FROM order_master
        WHERE O_date >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        UNION
        SELECT 
            'New Customer' as activityType,
            C_id as identifier,
            c_reg_date as activityDate
        FROM customer
        WHERE c_reg_date >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ORDER BY activityDate DESC
        LIMIT 5
    `;

    // Fetch all categories first
    db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }

        // Map category names to table names
        const categoryTableMap = new Map(
            categories.map(c => [c.CY_NAME.trim().toLowerCase(), c.CY_NAME.trim().toLowerCase().replace(/\s+/g, '_')])
        );

        console.log("Category Table Map:", Array.from(categoryTableMap.entries()));

        // Dynamic Total Inventory
        const inventoryPromises = [];
        for (const [categoryName, tableName] of categoryTableMap) {
            inventoryPromises.push(
                new Promise((resolve, reject) => {
                    db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        if (result.length === 0) {
                            console.log(`Table ${tableName} does not exist.`);
                            resolve({ tableName, totalStock: 0 });
                            return;
                        }

                        db.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE '%stock%'`, (err, columns) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            if (columns.length === 0) {
                                console.warn(`Table ${tableName} has no stock column.`);
                                resolve({ tableName, totalStock: 0 });
                                return;
                            }

                            const stockColumn = columns[0].Field;
                            const query = `
                                SELECT SUM(\`${stockColumn}\`) as totalStock
                                FROM \`${tableName}\`
                            `;
                            db.query(query, (err, result) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                resolve({ tableName, totalStock: result[0]?.totalStock || 0 });
                            });
                        });
                    });
                })
            );
        }

        // Dynamic Best Sellers with Category Name
        const bestSellersPromises = [];
        for (const [categoryName, tableName] of categoryTableMap) {
            bestSellersPromises.push(
                new Promise((resolve, reject) => {
                    db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        if (result.length === 0) {
                            console.log(`Table ${tableName} does not exist.`);
                            resolve([]);
                            return;
                        }

                        db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            const columnMap = {
                                id: null,
                                name: null
                            };

                            columns.forEach(col => {
                                const field = col.Field.toLowerCase();
                                if (field.includes('id') && !field.includes('cy_id')) columnMap.id = col.Field;
                                else if (field === 'p_name' || field.includes('name') || field === 'title' || field === 'description' || field === 'product_name') columnMap.name = col.Field;
                            });

                            if (!columnMap.id || !columnMap.name) {
                                console.warn(`Table ${tableName} missing required columns (id, name)`);
                                resolve([]);
                                return;
                            }

                            const query = `
                                SELECT 
                                    od.Product_id,
                                    \`${tableName}\`.${columnMap.name} as productName,
                                    SUM(od.O_Qty) as totalSold,
                                    SUM(od.O_price * od.O_Qty) as totalRevenue,
                                    ? as category
                                FROM order_details od
                                JOIN order_master om ON od.O_id = om.O_id
                                LEFT JOIN \`${tableName}\` ON od.Product_id = \`${tableName}\`.${columnMap.id}
                                WHERE om.O_status = 'Delivered'
                                GROUP BY od.Product_id, \`${tableName}\`.${columnMap.name}
                                HAVING SUM(od.O_Qty) > 0
                            `;
                            db.query(query, [categoryName], (err, result) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                console.log(`Best sellers for category ${categoryName}:`, result);
                                resolve(result);
                            });
                        });
                    });
                })
            );
        }

        // Wait for inventory and best-sellers queries to complete
        Promise.all([Promise.all(inventoryPromises), Promise.all(bestSellersPromises)])
            .then(([inventoryResults, bestSellersResults]) => {
                const totalInventory = inventoryResults.reduce((sum, item) => sum + (item.totalStock || 0), 0);
                const bestSellers = bestSellersResults.flat()
                    .filter(item => item.totalSold > 0)
                    .sort((a, b) => b.totalSold - a.totalSold)
                    .slice(0, 5);

                console.log("Best Sellers Data:", bestSellers);

                // Proceed with the rest of the queries
                Promise.all([
                    new Promise((resolve, reject) => db.query(dailySalesQuery, [startOfDay], (err, result) => err ? reject(err) : resolve(result))),
                    new Promise((resolve, reject) => db.query(weeklySalesQuery, [startOfWeek], (err, result) => err ? reject(err) : resolve(result))),
                    new Promise((resolve, reject) => db.query(monthlySalesQuery, [startOfMonth], (err, result) => err ? reject(err) : resolve(result))),
                    new Promise((resolve, reject) => db.query(totalOrdersQuery, (err, result) => err ? reject(err) : resolve(result))),
                    new Promise((resolve, reject) => db.query(totalActiveCustomersQuery, (err, result) => err ? reject(err) : resolve(result))),
                    new Promise((resolve, reject) => db.query(salesTrendQuery, (err, result) => err ? reject(err) : resolve(result))),
                    new Promise((resolve, reject) => db.query(orderStatusQuery, (err, result) => err ? reject(err) : resolve(result))),
                    new Promise((resolve, reject) => db.query(recentActivityQuery, (err, result) => err ? reject(err) : resolve(result)))
                ])
                .then(([
                    dailySales,
                    weeklySales,
                    monthlySales,
                    totalOrders,
                    totalActiveCustomers,
                    salesTrend,
                    orderStatus,
                    recentActivity
                ]) => {
                    res.json({
                        keyMetrics: {
                            dailySales: dailySales[0]?.totalSales || 0,
                            weeklySales: weeklySales[0]?.totalSales || 0,
                            monthlySales: monthlySales[0]?.totalSales || 0,
                            totalOrders: totalOrders[0]?.totalOrders || 0,
                            totalActiveCustomers: totalActiveCustomers[0]?.totalActiveCustomers || 0,
                            totalInventory: totalInventory
                        },
                        charts: {
                            salesTrend: salesTrend || [],
                            bestSellers: bestSellers || [],
                            orderStatus: orderStatus || []
                        },
                        recentActivity: recentActivity || []
                    });
                })
                .catch(err => {
                    console.error('Error fetching dashboard data:', err);
                    res.status(500).json({ error: 'Database error', details: err.message });
                });
            })
            .catch(err => {
                console.error('Error calculating total inventory or best sellers:', err);
                res.status(500).json({ error: 'Database error', details: err.message });
            });
    });
};

exports.getInventoryCategories = (req, res) => {
    const query = `SELECT CY_NAME FROM category`;
    console.log('Fetching categories from database...');
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching inventory categories:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        console.log('Categories fetched:', results);
        const categories = results.map(row => row.CY_NAME);
        res.json(categories);
    });
};

exports.getFeedbackReport = (req, res) => {
    const { startDate, endDate, rating } = req.query;

    let query = `
        SELECT 
            f.F_id AS feedback_id,
            c.C_username AS customer_name,
            f.F_desc AS feedback_desc,
            DATE_FORMAT(f.F_date, '%Y-%m-%d') AS feedback_date,
            f.product_id,
            f.star_rating AS rating
        FROM Feedback f
        JOIN customer c ON f.C_id = c.C_id
    `;
    const queryParams = [];

    // Apply filters
    let whereClauses = [];
    if (startDate) {
        whereClauses.push('f.F_date >= ?');
        queryParams.push(startDate);
    }
    if (endDate) {
        whereClauses.push('f.F_date <= ?');
        queryParams.push(endDate);
    }
    if (rating) {
        whereClauses.push('f.star_rating = ?');
        queryParams.push(rating);
    }
    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Sort by date descending (most recent first)
    query += ` ORDER BY f.F_date DESC`;

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching feedback report:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        console.log('Feedback Report Results:', results);
        res.json(results);
    });
};



exports.getInventoryStatus = (req, res) => {
    const lowStockThreshold = 5;
    const { category } = req.query;

    db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }

        const categoryTableMap = new Map(
            categories.map(c => [c.CY_NAME, c.CY_NAME.toLowerCase().replace(/\s+/g, '_')])
        );

        const queryPromises = [];
        for (const [categoryName, tableName] of categoryTableMap) {
            if (category && category !== categoryName) continue;

            queryPromises.push(
                new Promise((resolve, reject) => {
                    db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                        if (err) {
                            console.error(`Error checking table ${tableName}:`, err);
                            reject(err);
                            return;
                        }
                        if (result.length === 0) {
                            console.log(`Table ${tableName} does not exist.`);
                            resolve({ lowStock: [], outOfStock: [] });
                            return;
                        }

                        db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
                            if (err) {
                                console.error(`Error fetching schema for ${tableName}:`, err);
                                reject(err);
                                return;
                            }

                            const columnMap = {
                                id: null,
                                name: null,
                                stock: null
                            };

                            columns.forEach(col => {
                                const field = col.Field.toLowerCase();
                                if (field.includes('id') && !field.includes('cy_id')) columnMap.id = col.Field;
                                else if (field.includes('name')) columnMap.name = col.Field;
                                else if (field.includes('stock')) columnMap.stock = col.Field;
                            });

                            if (!columnMap.id || !columnMap.name || !columnMap.stock) {
                                console.warn(`Table ${tableName} missing required columns (id, name, or stock)`);
                                resolve({ lowStock: [], outOfStock: [] });
                                return;
                            }

                            const lowStockQuery = `
                                SELECT 
                                    \`${tableName}\`.${columnMap.id} as productId, 
                                    \`${tableName}\`.${columnMap.name} as productName, 
                                    \`${tableName}\`.${columnMap.stock} as stock,
                                    '${categoryName}' as category
                                FROM \`${tableName}\` 
                                WHERE \`${tableName}\`.${columnMap.stock} <= ? AND \`${tableName}\`.${columnMap.stock} > 0
                            `;
                            const outOfStockQuery = `
                                SELECT 
                                    \`${tableName}\`.${columnMap.id} as productId, 
                                    \`${tableName}\`.${columnMap.name} as productName, 
                                    \`${tableName}\`.${columnMap.stock} as stock,
                                    '${categoryName}' as category
                                FROM \`${tableName}\` 
                                WHERE \`${tableName}\`.${columnMap.stock} = 0
                            `;

                            Promise.all([
                                new Promise((resolve, reject) => db.query(lowStockQuery, [lowStockThreshold], (err, result) => err ? reject(err) : resolve(result))),
                                new Promise((resolve, reject) => db.query(outOfStockQuery, [], (err, result) => err ? reject(err) : resolve(result)))
                            ])
                            .then(([lowStock, outOfStock]) => {
                                resolve({ lowStock, outOfStock });
                            })
                            .catch(err => reject(err));
                        });
                    });
                })
            );
        }

        Promise.all(queryPromises)
            .then(results => {
                const lowStock = results.flatMap(result => result.lowStock).sort((a, b) => a.stock - b.stock);
                const outOfStock = results.flatMap(result => result.outOfStock);
                const criticalStock = lowStock.filter(item => item.stock <= 2);

                res.json({
                    lowStock,
                    outOfStock,
                    criticalStock
                });
            })
            .catch(err => {
                console.error('Error fetching inventory status:', err);
                res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
            });
    });
};

// Fetch All Categories for Inventory Filter
exports.getInventoryCategories = (req, res) => {
    const query = `SELECT CY_NAME FROM category`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching inventory categories:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        const categories = results.map(row => row.CY_NAME);
        res.json(categories);
    });
};

// Sales Report Data
// reportController.js (relevant part)
exports.getSalesReport = (req, res) => {
    const { startDate, endDate, groupBy } = req.query;

    let salesQuery = `
        SELECT 
            SUM(od.O_price * od.O_Qty) as totalSales,
            DATE_FORMAT(om.O_date, '%Y-%m') as period
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        WHERE om.O_status = 'Delivered'
    `;
    let salesByProductQuery = `
        SELECT 
            od.Product_id,
            SUM(od.O_Qty) as totalUnitsSold,
            SUM(od.O_price * od.O_Qty) as totalRevenue,
            c.CY_NAME as categoryName
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        JOIN plants p ON od.Product_id = p.P_ID
        JOIN category c ON p.CY_ID = c.CY_ID
        WHERE om.O_status = 'Delivered'
    `;
    let salesByCategoryQuery = `
        SELECT 
            c.CY_NAME as categoryName,
            SUM(od.O_Qty) as totalUnitsSold,
            SUM(od.O_price * od.O_Qty) as totalRevenue
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        JOIN plants p ON od.Product_id = p.P_ID
        JOIN category c ON p.CY_ID = c.CY_ID
        WHERE om.O_status = 'Delivered'
    `;
    const queryParams = [];

    if (startDate) {
        salesQuery += ` AND om.O_date >= ?`;
        salesByProductQuery += ` AND om.O_date >= ?`;
        salesByCategoryQuery += ` AND om.O_date >= ?`;
        queryParams.push(startDate);
    }
    if (endDate) {
        salesQuery += ` AND om.O_date <= ?`;
        salesByProductQuery += ` AND om.O_date <= ?`;
        salesByCategoryQuery += ` AND om.O_date <= ?`;
        queryParams.push(endDate);
    }

    if (groupBy === 'daily') {
        salesQuery = salesQuery.replace('%Y-%m', '%Y-%m-%d');
        salesQuery += ` GROUP BY DATE_FORMAT(om.O_date, '%Y-%m-%d')`;
    } else if (groupBy === 'weekly') {
        salesQuery = salesQuery.replace('DATE_FORMAT(om.O_date, \'%Y-%m\')', 'YEARWEEK(om.O_date)');
        salesQuery += ` GROUP BY YEARWEEK(om.O_date)`;
    } else {
        salesQuery += ` GROUP BY DATE_FORMAT(om.O_date, '%Y-%m')`;
    }

    salesByProductQuery += ` GROUP BY od.Product_id, c.CY_NAME ORDER BY totalRevenue DESC LIMIT 10`;
    salesByCategoryQuery += ` GROUP BY c.CY_NAME ORDER BY totalRevenue DESC`;

    Promise.all([
        new Promise((resolve, reject) => db.query(salesQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(salesByProductQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(salesByCategoryQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
    ])
    .then(([totalSales, salesByProductRaw, salesByCategory]) => {
        console.log("salesByProductRaw:", salesByProductRaw);
        db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
            if (err) {
                console.error('Error fetching categories:', err);
                return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
            }

            const categoryTableMap = new Map(
                categories.map(c => [c.CY_NAME.trim().toLowerCase(), c.CY_NAME.trim().toLowerCase().replace(/\s+/g, '_')])
            );

            console.log("Category Table Map:", Array.from(categoryTableMap.entries()));

            const namePromises = salesByProductRaw.map(item => {
                return new Promise((resolve) => {
                    const productId = item.Product_id;
                    const categoryName = item.categoryName.trim().toLowerCase();
                    const tableName = categoryTableMap.get(categoryName);

                    console.log(`Processing Product_id: ${productId}, Category: ${categoryName}, Table: ${tableName}`);

                    if (!tableName) {
                        console.warn(`No table found for category ${categoryName}`);
                        resolve({
                            Product_id: item.Product_id,
                            productName: `Unknown Product (Category: ${item.categoryName})`,
                            totalUnitsSold: item.totalUnitsSold,
                            totalRevenue: item.totalRevenue
                        });
                        return;
                    }

                    db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                        if (err || result.length === 0) {
                            console.warn(`Table ${tableName} does not exist for category ${categoryName}`);
                            resolve({
                                Product_id: item.Product_id,
                                productName: `Unknown Product (Category: ${item.categoryName})`,
                                totalUnitsSold: item.totalUnitsSold,
                                totalRevenue: item.totalRevenue
                            });
                            return;
                        }

                        // Try multiple column name patterns for the product name
                        db.query(`SHOW COLUMNS FROM \`${tableName}\` WHERE Field LIKE '%name%' OR Field IN ('title', 'description', 'product_name', 'p_name')`, (err, columns) => {
                            if (err || columns.length === 0) {
                                console.warn(`Table ${tableName} has no name column for category ${categoryName}`);
                                resolve({
                                    Product_id: item.Product_id,
                                    productName: `Unknown Product (Category: ${item.categoryName})`,
                                    totalUnitsSold: item.totalUnitsSold,
                                    totalRevenue: item.totalRevenue
                                });
                                return;
                            }

                            const nameColumn = columns[0].Field;
                            const idColumn = columns.find(col => col.Field.toLowerCase().includes('id') && !col.Field.includes('cy_id'))?.Field || 'P_ID';
                            console.log(`Using nameColumn: ${nameColumn}, idColumn: ${idColumn}`);

                            if (!idColumn) {
                                console.warn(`Table ${tableName} has no ID column for category ${categoryName}`);
                                resolve({
                                    Product_id: item.Product_id,
                                    productName: `Unknown Product (Category: ${item.categoryName})`,
                                    totalUnitsSold: item.totalUnitsSold,
                                    totalRevenue: item.totalRevenue
                                });
                                return;
                            }

                            const query = `
                                SELECT \`${nameColumn}\` as productName
                                FROM \`${tableName}\`
                                WHERE \`${idColumn}\` = ?
                            `;
                            db.query(query, [productId], (err, result) => {
                                if (err || result.length === 0) {
                                    console.warn(`Product_id ${productId} not found in table ${tableName}. Query: ${query}`);
                                    resolve({
                                        Product_id: item.Product_id,
                                        productName: `Unknown Product (Category: ${item.categoryName})`,
                                        totalUnitsSold: item.totalUnitsSold,
                                        totalRevenue: item.totalRevenue
                                    });
                                    return;
                                }
                                console.log(`Found product name for Product_id ${productId}: ${result[0].productName}`);
                                resolve({
                                    Product_id: item.Product_id,
                                    productName: result[0].productName,
                                    totalUnitsSold: item.totalUnitsSold,
                                    totalRevenue: item.totalRevenue
                                });
                            });
                        });
                    });
                });
            });

            Promise.all(namePromises).then(salesByProduct => {
                console.log("Final Sales by Product with Names:", salesByProduct);
                res.json({
                    totalSales: totalSales || [],
                    salesByProduct: salesByProduct || [],
                    salesByCategory: salesByCategory || []
                });
            }).catch(err => {
                console.error('Error fetching product names:', err);
                res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
            });
        });
    })
    .catch(err => {
        console.error('Error fetching sales report:', err);
        res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
    });
};
// Customer Report Data
exports.getCustomerReport = (req, res) => {
    const { startDate, endDate } = req.query;

    let demographicsQuery = `
        SELECT 
            c.Area_id as areaId,
            COUNT(*) as customerCount
        FROM customer c
        GROUP BY c.Area_id
    `;
    let purchaseHistoryQuery = `
        SELECT 
            om.C_id,
            COUNT(om.O_id) as totalOrders,
            SUM(od.O_price * od.O_Qty) as totalSpent
        FROM order_master om
        JOIN order_details od ON om.O_id = od.O_id
        WHERE om.O_status = 'Delivered'
    `;
    let lifetimeValueQuery = `
        SELECT 
            om.C_id,
            SUM(od.O_price * od.O_Qty) as lifetimeValue
        FROM order_master om
        JOIN order_details od ON om.O_id = od.O_id
        WHERE om.O_status = 'Delivered'
    `;
    const queryParams = [];

    let whereClauses = [];
    if (startDate) {
        whereClauses.push('O_date >= ?');
        queryParams.push(startDate);
    }
    if (endDate) {
        whereClauses.push('O_date <= ?');
        queryParams.push(endDate);
    }
    if (whereClauses.length > 0) {
        const whereClause = ` AND ${whereClauses.join(' AND ')}`;
        purchaseHistoryQuery += whereClause;
        lifetimeValueQuery += whereClause;
    }

    purchaseHistoryQuery += ` GROUP BY om.C_id ORDER BY totalSpent DESC LIMIT 10`;
    lifetimeValueQuery += ` GROUP BY om.C_id ORDER BY lifetimeValue DESC LIMIT 10`;

    console.log('demographicsQuery:', demographicsQuery);
    console.log('purchaseHistoryQuery:', purchaseHistoryQuery, queryParams);
    console.log('lifetimeValueQuery:', lifetimeValueQuery, queryParams);

    Promise.all([
        new Promise((resolve, reject) => db.query(demographicsQuery, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(purchaseHistoryQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(lifetimeValueQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
    ])
    .then(([demographics, purchaseHistory, lifetimeValue]) => {
        console.log('Demographics Data:', demographics);
        console.log('Purchase History Data:', purchaseHistory);
        console.log('Lifetime Value Data:', lifetimeValue);
        res.json({
            demographics: demographics || [],
            purchaseHistory: purchaseHistory || [],
            lifetimeValue: lifetimeValue || []
        });
    })
    .catch(err => {
        console.error('Error fetching customer report:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    });
};
// Inventory Report Data
exports.getInventoryReport = (req, res) => {
    const lowStockThreshold = 5;
    const { category } = req.query;

    db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }

        const categoryTableMap = new Map(
            categories.map(c => [c.CY_NAME, c.CY_NAME.toLowerCase().replace(/\s+/g, '_')])
        );

        const stockQueries = [];
        const turnoverQueries = [];
        const queryParams = [];

        for (const [categoryName, tableName] of categoryTableMap) {
            if (category && category !== categoryName) continue;

            db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                if (err || result.length === 0) {
                    console.log(`Table ${tableName} does not exist:`, err?.sqlMessage);
                    return;
                }

                db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
                    if (err) return;

                    const columnMap = {
                        id: null,
                        name: null,
                        stock: null,
                        price: null
                    };

                    columns.forEach(col => {
                        const field = col.Field.toLowerCase();
                        if (field.includes('id') && !field.includes('cy_id')) columnMap.id = col.Field;
                        else if (field.includes('name')) columnMap.name = col.Field;
                        else if (field.includes('stock')) columnMap.stock = col.Field;
                        else if (field.includes('price')) columnMap.price = col.Field;
                    });

                    if (!columnMap.id || !columnMap.name || !columnMap.stock) return;

                    stockQueries.push(`
                        SELECT 
                            \`${tableName}\`.${columnMap.id} as productId, 
                            \`${tableName}\`.${columnMap.name} as productName, 
                            \`${tableName}\`.${columnMap.stock} as stock,
                            '${categoryName}' as category
                        FROM \`${tableName}\` 
                        WHERE \`${tableName}\`.${columnMap.stock} <= ? AND \`${tableName}\`.${columnMap.stock} >= 0
                    `);
                    queryParams.push(lowStockThreshold);

                    turnoverQueries.push(`
                        SELECT 
                            \`${tableName}\`.${columnMap.id} as productId,
                            \`${tableName}\`.${columnMap.name} as productName,
                            \`${tableName}\`.${columnMap.stock} as stock,
                            COALESCE(SUM(od.O_Qty), 0) as totalSold,
                            '${categoryName}' as category
                        FROM \`${tableName}\`
                        LEFT JOIN order_details od ON \`${tableName}\`.${columnMap.id} = od.Product_id
                        LEFT JOIN order_master om ON od.O_id = om.O_id AND om.O_status = 'Delivered'
                        GROUP BY \`${tableName}\`.${columnMap.id}, \`${tableName}\`.${columnMap.name}, \`${tableName}\`.${columnMap.stock}
                    `);
                });
            });
        }

        setTimeout(() => {
            if (stockQueries.length === 0) {
                return res.json({ stockLevels: [], turnover: [], slowMoving: [] });
            }

            const finalStockQuery = stockQueries.join(' UNION ') + ' ORDER BY stock ASC';
            const finalTurnoverQuery = turnoverQueries.join(' UNION ');

            Promise.all([
                new Promise((resolve, reject) => db.query(finalStockQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
                new Promise((resolve, reject) => db.query(finalTurnoverQuery, [], (err, result) => err ? reject(err) : resolve(result)))
            ])
            .then(([stockLevels, turnover]) => {
                const slowMoving = turnover.filter(item => item.totalSold <= 5);
                res.json({
                    stockLevels: stockLevels || [],
                    turnover: turnover || [],
                    slowMoving: slowMoving || []
                });
            })
            .catch(err => {
                console.error('Error fetching inventory report:', err);
                res.status(500).json({ error: 'Database error', details: err.message });
            });
        }, 1000);
    });
};

// Order Report Data
exports.getOrderReport = (req, res) => {
    const { startDate, endDate, status } = req.query;

    let statusQuery = `
        SELECT 
            O_status as status,
            COUNT(*) as count
        FROM order_master om
    `;
    let shippingDetailsQuery = `
        SELECT 
            om.O_id,
            om.C_id,
            c.C_address as customerAddress,
            c.C_pincode as customerPincode,
            dp.D_NAME as deliveryPerson
        FROM order_master om
        JOIN customer c ON om.C_id = c.C_id
        LEFT JOIN deliveries d ON om.O_id = d.O_id
        LEFT JOIN delivery_persons dp ON d.D_id = dp.D_id
    `;
    const queryParams = [];

    let whereClauses = [];
    if (startDate) {
        whereClauses.push('om.O_date >= ?');
        queryParams.push(startDate);
    }
    if (endDate) {
        whereClauses.push('om.O_date <= ?');
        queryParams.push(endDate);
    }
    if (status && ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'].includes(status)) {
        whereClauses.push('om.O_status = ?');
        queryParams.push(status);
    } 


    statusQuery += ` GROUP BY O_status`;
    shippingDetailsQuery += ` LIMIT 10`;

    console.log('statusQuery:', statusQuery, queryParams);
    console.log('shippingDetailsQuery:', shippingDetailsQuery, queryParams);

    Promise.all([
        new Promise((resolve, reject) => db.query(statusQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(shippingDetailsQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
    ])
    .then(([statusSummary,  shippingDetails]) => {
        res.json({
            statusSummary: statusSummary || [],
            shippingDetails: shippingDetails || []
        });
    })
    .catch(err => {
        console.error('Error fetching order report:', err);
        res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
    });
};

// Export Sales Report as CSV
exports.exportSalesReportCSV = (req, res) => {
    const { startDate, endDate, groupBy } = req.query;

    let totalSalesQuery = `
        SELECT 
            SUM(od.O_price * od.O_Qty) as totalSales,
            DATE_FORMAT(om.O_date, '%Y-%m') as period
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        WHERE om.O_status = 'Delivered'
    `;
    let salesByProductQuery = `
        SELECT 
            od.Product_id,
            SUM(od.O_Qty) as totalUnitsSold,
            SUM(od.O_price * od.O_Qty) as totalRevenue,
            c.CY_NAME as categoryName
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        JOIN plants p ON od.Product_id = p.P_ID
        JOIN category c ON p.CY_ID = c.CY_ID
        WHERE om.O_status = 'Delivered'
    `;
    let salesByCategoryQuery = `
        SELECT 
            c.CY_NAME as categoryName,
            SUM(od.O_Qty) as totalUnitsSold,
            SUM(od.O_price * od.O_Qty) as totalRevenue
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        JOIN plants p ON od.Product_id = p.P_ID
        JOIN category c ON p.CY_ID = c.CY_ID
        WHERE om.O_status = 'Delivered'
    `;
    const queryParams = [];

    if (startDate) {
        totalSalesQuery += ` AND om.O_date >= ?`;
        salesByProductQuery += ` AND om.O_date >= ?`;
        salesByCategoryQuery += ` AND om.O_date >= ?`;
        queryParams.push(startDate);
    }
    if (endDate) {
        totalSalesQuery += ` AND om.O_date <= ?`;
        salesByProductQuery += ` AND om.O_date <= ?`;
        salesByCategoryQuery += ` AND om.O_date <= ?`;
        queryParams.push(endDate);
    }

    if (groupBy === 'daily') {
        totalSalesQuery = totalSalesQuery.replace('%Y-%m', '%Y-%m-%d');
        totalSalesQuery += ` GROUP BY DATE_FORMAT(om.O_date, '%Y-%m-%d')`;
    } else if (groupBy === 'weekly') {
        totalSalesQuery = totalSalesQuery.replace('DATE_FORMAT(om.O_date, \'%Y-%m\')', 'YEARWEEK(om.O_date)');
        totalSalesQuery += ` GROUP BY YEARWEEK(om.O_date)`;
    } else {
        totalSalesQuery += ` GROUP BY DATE_FORMAT(om.O_date, '%Y-%m')`;
    }

    salesByProductQuery += ` GROUP BY od.Product_id, c.CY_NAME ORDER BY totalRevenue DESC LIMIT 10`;
    salesByCategoryQuery += ` GROUP BY c.CY_NAME ORDER BY totalRevenue DESC`;

    Promise.all([
        new Promise((resolve, reject) => db.query(totalSalesQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(salesByProductQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(salesByCategoryQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
    ])
    .then(([totalSales, salesByProductRaw, salesByCategory]) => {
        console.log("salesByProductRaw (CSV):", salesByProductRaw);
        db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
            if (err) {
                console.error('Error fetching categories:', err);
                return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
            }

            const categoryTableMap = new Map(
                categories.map(c => [c.CY_NAME.trim().toLowerCase(), c.CY_NAME.trim().toLowerCase().replace(/\s+/g, '_')])
            );

            console.log("Category Table Map:", Array.from(categoryTableMap.entries()));

            const namePromises = salesByProductRaw.map(item => {
                return new Promise((resolve) => {
                    const productId = item.Product_id;
                    const categoryName = item.categoryName ? item.categoryName.trim().toLowerCase() : null;
                    const tableName = categoryName ? categoryTableMap.get(categoryName) : null;

                    console.log(`Fetching product name for Product_id: ${productId}, Category: ${categoryName}, Table: ${tableName}`);

                    if (!tableName) {
                        console.warn(`No table found for category ${categoryName}`);
                        resolve({
                            Product_id: item.Product_id,
                            productName: `Unknown Product (Category: ${item.categoryName || 'Not Specified'})`,
                            totalUnitsSold: item.totalUnitsSold || 0,
                            totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                        });
                        return;
                    }

                    db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                        if (err || result.length === 0) {
                            console.warn(`Table ${tableName} does not exist for category ${categoryName}`);
                            resolve({
                                Product_id: item.Product_id,
                                productName: `Unknown Product (Category: ${item.categoryName || 'Not Specified'})`,
                                totalUnitsSold: item.totalUnitsSold || 0,
                                totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                            });
                            return;
                        }

                        db.query(`SHOW COLUMNS FROM \`${tableName}\` WHERE Field LIKE '%name%' OR Field IN ('title', 'description', 'product_name', 'p_name')`, (err, columns) => {
                            if (err || columns.length === 0) {
                                console.warn(`Table ${tableName} has no name column for category ${categoryName}`);
                                resolve({
                                    Product_id: item.Product_id,
                                    productName: `Unknown Product (Category: ${item.categoryName || 'Not Specified'})`,
                                    totalUnitsSold: item.totalUnitsSold || 0,
                                    totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                                });
                                return;
                            }

                            const nameColumn = columns[0].Field;
                            const idColumn = columns.find(col => col.Field.toLowerCase().includes('id') && !col.Field.includes('cy_id'))?.Field || 'P_ID';
                            console.log(`Using nameColumn: ${nameColumn}, idColumn: ${idColumn}`);

                            const query = `
                                SELECT \`${nameColumn}\` as productName
                                FROM \`${tableName}\`
                                WHERE \`${idColumn}\` = ?
                            `;
                            db.query(query, [productId], (err, result) => {
                                if (err || result.length === 0) {
                                    console.warn(`Product_id ${productId} not found in table ${tableName}. Query: ${query}`);
                                    resolve({
                                        Product_id: item.Product_id,
                                        productName: `Unknown Product (Category: ${item.categoryName || 'Not Specified'})`,
                                        totalUnitsSold: item.totalUnitsSold || 0,
                                        totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                                    });
                                    return;
                                }
                                console.log(`Found product name for Product_id ${productId}: ${result[0].productName}`);
                                resolve({
                                    Product_id: item.Product_id,
                                    productName: result[0].productName,
                                    totalUnitsSold: item.totalUnitsSold || 0,
                                    totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                                });
                            });
                        });
                    });
                });
            });

            Promise.all(namePromises).then(salesByProduct => {
                console.log("Final Sales by Product with Names (CSV):", salesByProduct);
                const totalSalesData = totalSales.map(item => ({
                    Section: 'Total Sales by Period',
                    Period: item.period,
                    TotalSales: item.totalSales ? item.totalSales.toFixed(2) : '0.00'
                }));
                const salesByProductData = salesByProduct.map(item => ({
                    Section: 'Sales by Product',
                    ProductID: item.Product_id,
                    ProductName: item.productName,
                    TotalUnitsSold: item.totalUnitsSold,
                    TotalRevenue: item.totalRevenue
                }));
                const salesByCategoryData = salesByCategory.map(item => ({
                    Section: 'Sales by Category',
                    CategoryName: item.categoryName,
                    TotalUnitsSold: item.totalUnitsSold || 0,
                    TotalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                }));

                const csvData = [
                    ...totalSalesData,
                    { Section: '' },
                    ...salesByProductData,
                    { Section: '' },
                    ...salesByCategoryData
                ];

                const fields = ['Section', 'Period', 'TotalSales', 'ProductID', 'ProductName', 'TotalUnitsSold', 'TotalRevenue', 'CategoryName'];
                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(csvData);

                res.header('Content-Type', 'text/csv');
                res.header('Content-Disposition', 'attachment; filename="sales_report.csv"');
                res.send(csv);
            }).catch(err => {
                console.error('Error fetching product names for CSV export:', err);
                res.status(500).json({ error: 'Database error', details: err.message });
            });
        });
    })
    .catch(err => {
        console.error('Error exporting sales report as CSV:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    });
};
// Export Sales Report as PDF
exports.exportSalesReportPDF = (req, res) => {
    const { startDate, endDate, groupBy } = req.query;

    let totalSalesQuery = `
        SELECT 
            SUM(od.O_price * od.O_Qty) as totalSales,
            DATE_FORMAT(om.O_date, '%Y-%m') as period
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        WHERE om.O_status = 'Delivered'
    `;
    let salesByProductQuery = `
        SELECT 
            od.Product_id,
            SUM(od.O_Qty) as totalUnitsSold,
            SUM(od.O_price * od.O_Qty) as totalRevenue,
            c.CY_NAME as categoryName
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        JOIN plants p ON od.Product_id = p.P_ID
        JOIN category c ON p.CY_ID = c.CY_ID
        WHERE om.O_status = 'Delivered'
    `;
    let salesByCategoryQuery = `
        SELECT 
            c.CY_NAME as categoryName,
            SUM(od.O_Qty) as totalUnitsSold,
            SUM(od.O_price * od.O_Qty) as totalRevenue
        FROM order_details od
        JOIN order_master om ON od.O_id = om.O_id
        JOIN plants p ON od.Product_id = p.P_ID
        JOIN category c ON p.CY_ID = c.CY_ID
        WHERE om.O_status = 'Delivered'
    `;
    const queryParams = [];

    if (startDate) {
        totalSalesQuery += ` AND om.O_date >= ?`;
        salesByProductQuery += ` AND om.O_date >= ?`;
        salesByCategoryQuery += ` AND om.O_date >= ?`;
        queryParams.push(startDate);
    }
    if (endDate) {
        totalSalesQuery += ` AND om.O_date <= ?`;
        salesByProductQuery += ` AND om.O_date <= ?`;
        salesByCategoryQuery += ` AND om.O_date <= ?`;
        queryParams.push(endDate);
    }

    if (groupBy === 'daily') {
        totalSalesQuery = totalSalesQuery.replace('%Y-%m', '%Y-%m-%d');
        totalSalesQuery += ` GROUP BY DATE_FORMAT(om.O_date, '%Y-%m-%d')`;
    } else if (groupBy === 'weekly') {
        totalSalesQuery = totalSalesQuery.replace('DATE_FORMAT(om.O_date, \'%Y-%m\')', 'YEARWEEK(om.O_date)');
        totalSalesQuery += ` GROUP BY YEARWEEK(om.O_date)`;
    } else {
        totalSalesQuery += ` GROUP BY DATE_FORMAT(om.O_date, '%Y-%m')`;
    }

    salesByProductQuery += ` GROUP BY od.Product_id, c.CY_NAME ORDER BY totalRevenue DESC LIMIT 10`;
    salesByCategoryQuery += ` GROUP BY c.CY_NAME ORDER BY totalRevenue DESC`;

    db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }

        const categoryTableMap = new Map(
            categories.map(c => [c.CY_NAME.trim().toLowerCase(), c.CY_NAME.trim().toLowerCase().replace(/\s+/g, '_')])
        );

        console.log("Category Table Map:", Array.from(categoryTableMap.entries()));

        Promise.all([
            new Promise((resolve, reject) => db.query(totalSalesQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(salesByProductQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(salesByCategoryQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
        ])
        .then(([totalSales, salesByProductRaw, salesByCategory]) => {
            console.log("salesByProductRaw (PDF):", salesByProductRaw);
            const namePromises = salesByProductRaw.map(item => {
                return new Promise((resolve) => {
                    const productId = item.Product_id;
                    const categoryName = item.categoryName ? item.categoryName.trim().toLowerCase() : null;
                    const tableName = categoryName ? categoryTableMap.get(categoryName) : null;

                    console.log(`Fetching product name for Product_id: ${productId}, Category: ${categoryName}, Table: ${tableName}`);

                    if (!tableName) {
                        console.warn(`No table found for category ${categoryName}`);
                        resolve({
                            Product_id: item.Product_id,
                            productName: `Unknown Product (Category: ${item.categoryName || 'Not Specified'})`,
                            totalUnitsSold: item.totalUnitsSold || 0,
                            totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                        });
                        return;
                    }

                    db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                        if (err || result.length === 0) {
                            console.warn(`Table ${tableName} does not exist for category ${categoryName}`);
                            resolve({
                                Product_id: item.Product_id,
                                productName: `Unknown Product (Category: ${item.categoryName || 'Not Specified'})`,
                                totalUnitsSold: item.totalUnitsSold || 0,
                                totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                            });
                            return;
                        }

                        db.query(`SHOW COLUMNS FROM \`${tableName}\` WHERE Field LIKE '%name%' OR Field IN ('title', 'description', 'product_name', 'p_name')`, (err, columns) => {
                            if (err || columns.length === 0) {
                                console.warn(`Table ${tableName} has no name column for category ${categoryName}`);
                                resolve({
                                    Product_id: item.Product_id,
                                    productName: `Unknown Product (Category: ${item.categoryName || 'Not Specified'})`,
                                    totalUnitsSold: item.totalUnitsSold || 0,
                                    totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                                });
                                return;
                            }

                            const nameColumn = columns[0].Field;
                            const idColumn = columns.find(col => col.Field.toLowerCase().includes('id') && !col.Field.includes('cy_id'))?.Field || 'P_ID';
                            console.log(`Using nameColumn: ${nameColumn}, idColumn: ${idColumn}`);

                            const query = `
                                SELECT \`${nameColumn}\` as productName
                                FROM \`${tableName}\`
                                WHERE \`${idColumn}\` = ?
                            `;
                            db.query(query, [productId], (err, result) => {
                                if (err || result.length === 0) {
                                    console.warn(`Product_id ${productId} not found in table ${tableName}. Query: ${query}`);
                                    resolve({
                                        Product_id: item.Product_id,
                                        productName: `Unknown Product (Category: ${item.categoryName || 'Not Specified'})`,
                                        totalUnitsSold: item.totalUnitsSold || 0,
                                        totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                                    });
                                    return;
                                }
                                console.log(`Found product name for Product_id ${productId}: ${result[0].productName}`);
                                resolve({
                                    Product_id: item.Product_id,
                                    productName: result[0].productName,
                                    totalUnitsSold: item.totalUnitsSold || 0,
                                    totalRevenue: item.totalRevenue ? item.totalRevenue.toFixed(2) : '0.00'
                                });
                            });
                        });
                    });
                });
            });

            Promise.all(namePromises).then(salesByProduct => {
                console.log("Final Sales by Product with Names (PDF):", salesByProduct);
                const doc = new PDFDocument();
                let buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    res.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="sales_report.pdf"',
                        'Content-Length': pdfData.length
                    });
                    res.end(pdfData);
                });

                doc.fontSize(20).text('Sales Report', { align: 'center' });
                doc.moveDown();

                doc.fontSize(14).text('Total Sales by Period', { underline: true });
                doc.moveDown(0.5);
                if (totalSales.length > 0) {
                    totalSales.forEach(item => {
                        doc.fontSize(12).text(`Period: ${item.period}, Total Sales: Rs. ${item.totalSales ? item.totalSales.toFixed(2) : '0.00'}`);
                    });
                } else {
                    doc.fontSize(12).text('No sales data available for the selected period.');
                }
                doc.moveDown();

                doc.fontSize(14).text('Sales by Product', { underline: true });
                doc.moveDown(0.5);
                if (salesByProduct.length > 0) {
                    salesByProduct.forEach(item => {
                        doc.fontSize(12).text(`Product: ${item.productName || 'Unknown Product'}, Units Sold: ${item.totalUnitsSold || 0}, Revenue: Rs. ${item.totalRevenue || '0.00'}`);
                    });
                } else {
                    doc.fontSize(12).text('No product sales data available.');
                }
                doc.moveDown();

                doc.fontSize(14).text('Sales by Category', { underline: true });
                doc.moveDown(0.5);
                if (salesByCategory.length > 0) {
                    salesByCategory.forEach(item => {
                        doc.fontSize(12).text(`Category: ${item.categoryName}, Units Sold: ${item.totalUnitsSold || 0}, Revenue: Rs. ${item.totalRevenue || '0.00'}`);
                    });
                } else {
                    doc.fontSize(12).text('No category sales data available.');
                }

                doc.end();
            }).catch(err => {
                console.error('Error fetching product names for PDF export:', err);
                res.status(500).json({ error: 'Database error', details: err.message });
            });
        })
        .catch(err => {
            console.error('Error exporting sales report as PDF:', err);
            res.status(500).json({ error: 'Database error', details: err.message });
        });
    });
};

// Export Customer Report as CSV
exports.exportCustomerReportCSV = (req, res) => {
    const { startDate, endDate } = req.query;

    let demographicsQuery = `
        SELECT 
            c.Area_id as areaId,
            COUNT(*) as customerCount
        FROM customer c
        GROUP BY c.Area_id
    `;
    let purchaseHistoryQuery = `
        SELECT 
            om.C_id,
            COUNT(om.O_id) as totalOrders,
            SUM(od.O_price * od.O_Qty) as totalSpent
        FROM order_master om
        JOIN order_details od ON om.O_id = od.O_id
        WHERE om.O_status = 'Delivered'
    `;
    let lifetimeValueQuery = `
        SELECT 
            om.C_id,
            SUM(od.O_price * od.O_Qty) as lifetimeValue
        FROM order_master om
        JOIN order_details od ON om.O_id = od.O_id
        WHERE om.O_status = 'Delivered'
    `;
    const queryParams = [];

    let whereClauses = [];
    if (startDate) {
        whereClauses.push('O_date >= ?');
        queryParams.push(startDate);
    }
    if (endDate) {
        whereClauses.push('O_date <= ?');
        queryParams.push(endDate);
    }
    if (whereClauses.length > 0) {
        const whereClause = ` AND ${whereClauses.join(' AND ')}`;
        purchaseHistoryQuery += whereClause;
        lifetimeValueQuery += whereClause;
    }

    purchaseHistoryQuery += ` GROUP BY om.C_id ORDER BY totalSpent DESC LIMIT 10`;
    lifetimeValueQuery += ` GROUP BY om.C_id ORDER BY lifetimeValue DESC LIMIT 10`;

    Promise.all([
        new Promise((resolve, reject) => db.query(demographicsQuery, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(purchaseHistoryQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(lifetimeValueQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
    ])
    .then(([demographics, purchaseHistory, lifetimeValue]) => {
        const demographicsData = demographics.map(item => ({
            Section: 'Customer Demographics',
            AreaID: item.areaId,
            CustomerCount: item.customerCount
        }));
        const purchaseHistoryData = purchaseHistory.map(item => ({
            Section: 'Purchase History',
            CustomerID: item.C_id,
            TotalOrders: item.totalOrders,
            TotalSpent: item.totalSpent
        }));
        const lifetimeValueData = lifetimeValue.map(item => ({
            Section: 'Customer Lifetime Value',
            CustomerID: item.C_id,
            LifetimeValue: item.lifetimeValue
        }));

        const csvData = [
            ...demographicsData,
            { Section: '' },
            ...purchaseHistoryData,
            { Section: '' },
            ...lifetimeValueData
        ];

        const fields = ['Section', 'AreaID', 'CustomerCount', 'CustomerID', 'TotalOrders', 'TotalSpent', 'LifetimeValue'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="customer_report.csv"');
        res.send(csv);
    })
    .catch(err => {
        console.error('Error exporting customer report as CSV:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    });
};

// Export Customer Report as PDF
exports.exportCustomerReportPDF = (req, res) => {
    const { startDate, endDate } = req.query;

    let demographicsQuery = `
        SELECT 
            c.Area_id as areaId,
            COUNT(*) as customerCount
        FROM customer c
        GROUP BY c.Area_id
    `;
    let purchaseHistoryQuery = `
        SELECT 
            om.C_id,
            COUNT(om.O_id) as totalOrders,
            SUM(od.O_price * od.O_Qty) as totalSpent
        FROM order_master om
        JOIN order_details od ON om.O_id = od.O_id
        WHERE om.O_status = 'Delivered'
    `;
    let lifetimeValueQuery = `
        SELECT 
            om.C_id,
            SUM(od.O_price * od.O_Qty) as lifetimeValue
        FROM order_master om
        JOIN order_details od ON om.O_id = od.O_id
        WHERE om.O_status = 'Delivered'
    `;
    const queryParams = [];

    let whereClauses = [];
    if (startDate) {
        whereClauses.push('O_date >= ?');
        queryParams.push(startDate);
    }
    if (endDate) {
        whereClauses.push('O_date <= ?');
        queryParams.push(endDate);
    }
    if (whereClauses.length > 0) {
        const whereClause = ` AND ${whereClauses.join(' AND ')}`;
        purchaseHistoryQuery += whereClause;
        lifetimeValueQuery += whereClause;
    }

    purchaseHistoryQuery += ` GROUP BY om.C_id ORDER BY totalSpent DESC LIMIT 10`;
    lifetimeValueQuery += ` GROUP BY om.C_id ORDER BY lifetimeValue DESC LIMIT 10`;

    Promise.all([
        new Promise((resolve, reject) => db.query(demographicsQuery, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(purchaseHistoryQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(lifetimeValueQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
    ])
    .then(([demographics, purchaseHistory, lifetimeValue]) => {
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="customer_report.pdf"',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        doc.fontSize(20).text('Customer Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text('Customer Demographics', { underline: true });
        doc.moveDown(0.5);
        demographics.forEach(item => {
            doc.fontSize(12).text(`Area ID: ${item.areaId}, Customer Count: ${item.customerCount}`);
        });
        doc.moveDown();

        doc.fontSize(14).text('Purchase History', { underline: true });
        doc.moveDown(0.5);
        purchaseHistory.forEach(item => {
            doc.fontSize(12).text(`Customer ID: ${item.C_id}, Total Orders: ${item.totalOrders}, Total Spent: $${item.totalSpent.toFixed(2)}`);
        });
        doc.moveDown();

        doc.fontSize(14).text('Customer Lifetime Value', { underline: true });
        doc.moveDown(0.5);
        lifetimeValue.forEach(item => {
            doc.fontSize(12).text(`Customer ID: ${item.C_id}, Lifetime Value: $${item.lifetimeValue.toFixed(2)}`);
        });

        doc.end();
    })
    .catch(err => {
        console.error('Error exporting customer report as PDF:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    });
};

// Export Inventory Report as CSV
exports.exportInventoryReportCSV = (req, res) => {
    const lowStockThreshold = 5;
    const { category } = req.query;

    db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }

        const categoryTableMap = new Map(
            categories.map(c => [c.CY_NAME, c.CY_NAME.toLowerCase().replace(/\s+/g, '_')])
        );

        const stockQueries = [];
        const turnoverQueries = [];
        const queryParams = [];

        for (const [categoryName, tableName] of categoryTableMap) {
            if (category && category !== categoryName) continue;

            db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                if (err || result.length === 0) {
                    console.log(`Table ${tableName} does not exist:`, err?.sqlMessage);
                    return;
                }

                db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
                    if (err) return;

                    const columnMap = {
                        id: null,
                        name: null,
                        stock: null,
                        price: null
                    };

                    columns.forEach(col => {
                        const field = col.Field.toLowerCase();
                        if (field.includes('id') && !field.includes('cy_id')) columnMap.id = col.Field;
                        else if (field.includes('name')) columnMap.name = col.Field;
                        else if (field.includes('stock')) columnMap.stock = col.Field;
                        else if (field.includes('price')) columnMap.price = col.Field;
                    });

                    if (!columnMap.id || !columnMap.name || !columnMap.stock) return;

                    stockQueries.push(`
                        SELECT 
                            \`${tableName}\`.${columnMap.id} as productId, 
                            \`${tableName}\`.${columnMap.name} as productName, 
                            \`${tableName}\`.${columnMap.stock} as stock,
                            '${categoryName}' as category
                        FROM \`${tableName}\` 
                        WHERE \`${tableName}\`.${columnMap.stock} <= ? AND \`${tableName}\`.${columnMap.stock} >= 0
                    `);
                    queryParams.push(lowStockThreshold);

                    turnoverQueries.push(`
                        SELECT 
                            \`${tableName}\`.${columnMap.id} as productId,
                            \`${tableName}\`.${columnMap.name} as productName,
                            \`${tableName}\`.${columnMap.stock} as stock,
                            COALESCE(SUM(od.O_Qty), 0) as totalSold,
                            '${categoryName}' as category
                        FROM \`${tableName}\`
                        LEFT JOIN order_details od ON \`${tableName}\`.${columnMap.id} = od.Product_id
                        LEFT JOIN order_master om ON od.O_id = om.O_id AND om.O_status = 'Delivered'
                        GROUP BY \`${tableName}\`.${columnMap.id}, \`${tableName}\`.${columnMap.name}, \`${tableName}\`.${columnMap.stock}
                    `);
                });
            });
        }

        setTimeout(() => {
            if (stockQueries.length === 0) {
                return res.json({ stockLevels: [], turnover: [], slowMoving: [] });
            }

            const finalStockQuery = stockQueries.join(' UNION ') + ' ORDER BY stock ASC';
            const finalTurnoverQuery = turnoverQueries.join(' UNION ');

            Promise.all([
                new Promise((resolve, reject) => db.query(finalStockQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
                new Promise((resolve, reject) => db.query(finalTurnoverQuery, [], (err, result) => err ? reject(err) : resolve(result)))
            ])
            .then(([stockLevels, turnover]) => {
                const slowMoving = turnover.filter(item => item.totalSold <= 5);

                const stockLevelsData = stockLevels.map(item => ({
                    Section: 'Stock Levels',
                    ProductID: item.productId,
                    ProductName: item.productName,
                    Stock: item.stock,
                    Category: item.category
                }));
                const turnoverData = turnover.map(item => ({
                    Section: 'Inventory Turnover',
                    ProductID: item.productId,
                    ProductName: item.productName,
                    Stock: item.stock,
                    TotalSold: item.totalSold,
                    Category: item.category
                }));
                const slowMovingData = slowMoving.map(item => ({
                    Section: 'Slow Moving Products',
                    ProductID: item.productId,
                    ProductName: item.productName,
                    Stock: item.stock,
                    TotalSold: item.totalSold,
                    Category: item.category
                }));

                const csvData = [
                    ...stockLevelsData,
                    { Section: '' },
                    ...turnoverData,
                    { Section: '' },
                    ...slowMovingData
                ];

                const fields = ['Section', 'ProductID', 'ProductName', 'Stock', 'TotalSold', 'Category'];
                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(csvData);

                res.header('Content-Type', 'text/csv');
                res.header('Content-Disposition', 'attachment; filename="inventory_report.csv"');
                res.send(csv);
            })
            .catch(err => {
                console.error('Error exporting inventory report as CSV:', err);
                res.status(500).json({ error: 'Database error', details: err.message });
            });
        }, 1000);
    });
};

// Export Inventory Report as PDF
exports.exportInventoryReportPDF = (req, res) => {
    const lowStockThreshold = 5;
    const { category } = req.query;

    db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }

        const categoryTableMap = new Map(
            categories.map(c => [c.CY_NAME, c.CY_NAME.toLowerCase().replace(/\s+/g, '_')])
        );

        const stockQueries = [];
        const turnoverQueries = [];
        const queryParams = [];

        for (const [categoryName, tableName] of categoryTableMap) {
            if (category && category !== categoryName) continue;

            db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                if (err || result.length === 0) {
                    console.log(`Table ${tableName} does not exist:`, err?.sqlMessage);
                    return;
                }

                db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
                    if (err) return;

                    const columnMap = {
                        id: null,
                        name: null,
                        stock: null,
                        price: null
                    };

                    columns.forEach(col => {
                        const field = col.Field.toLowerCase();
                        if (field.includes('id') && !field.includes('cy_id')) columnMap.id = col.Field;
                        else if (field.includes('name')) columnMap.name = col.Field;
                        else if (field.includes('stock')) columnMap.stock = col.Field;
                        else if (field.includes('price')) columnMap.price = col.Field;
                    });

                    if (!columnMap.id || !columnMap.name || !columnMap.stock) return;

                    stockQueries.push(`
                        SELECT 
                            \`${tableName}\`.${columnMap.id} as productId, 
                            \`${tableName}\`.${columnMap.name} as productName, 
                            \`${tableName}\`.${columnMap.stock} as stock,
                            '${categoryName}' as category
                        FROM \`${tableName}\` 
                        WHERE \`${tableName}\`.${columnMap.stock} <= ? AND \`${tableName}\`.${columnMap.stock} >= 0
                    `);
                    queryParams.push(lowStockThreshold);

                    turnoverQueries.push(`
                        SELECT 
                            \`${tableName}\`.${columnMap.id} as productId,
                            \`${tableName}\`.${columnMap.name} as productName,
                            \`${tableName}\`.${columnMap.stock} as stock,
                            COALESCE(SUM(od.O_Qty), 0) as totalSold,
                            '${categoryName}' as category
                        FROM \`${tableName}\`
                        LEFT JOIN order_details od ON \`${tableName}\`.${columnMap.id} = od.Product_id
                        LEFT JOIN order_master om ON od.O_id = om.O_id AND om.O_status = 'Delivered'
                        GROUP BY \`${tableName}\`.${columnMap.id}, \`${tableName}\`.${columnMap.name}, \`${tableName}\`.${columnMap.stock}
                    `);
                });
            });
        }

        setTimeout(() => {
            if (stockQueries.length === 0) {
                return res.json({ stockLevels: [], turnover: [], slowMoving: [] });
            }

            const finalStockQuery = stockQueries.join(' UNION ') + ' ORDER BY stock ASC';
            const finalTurnoverQuery = turnoverQueries.join(' UNION ');

            Promise.all([
                new Promise((resolve, reject) => db.query(finalStockQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
                new Promise((resolve, reject) => db.query(finalTurnoverQuery, [], (err, result) => err ? reject(err) : resolve(result)))
            ])
            .then(([stockLevels, turnover]) => {
                const slowMoving = turnover.filter(item => item.totalSold <= 5);

                const doc = new PDFDocument();
                let buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    res.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="inventory_report.pdf"',
                        'Content-Length': pdfData.length
                    });
                    res.end(pdfData);
                });

                doc.fontSize(20).text('Inventory Report', { align: 'center' });
                doc.moveDown();

                doc.fontSize(14).text('Stock Levels (Low and Out of Stock)', { underline: true });
                doc.moveDown(0.5);
                stockLevels.forEach(item => {
                    doc.fontSize(12).text(`Product: ${item.productName}, Stock: ${item.stock}, Category: ${item.category}`);
                });
                doc.moveDown();

                doc.fontSize(14).text('Inventory Turnover', { underline: true });
                doc.moveDown(0.5);
                turnover.forEach(item => {
                    doc.fontSize(12).text(`Product: ${item.productName}, Stock: ${item.stock}, Total Sold: ${item.totalSold}, Category: ${item.category}`);
                });
                doc.moveDown();

                doc.fontSize(14).text('Slow Moving Products (Total Sold ≤ 5)', { underline: true });
                doc.moveDown(0.5);
                slowMoving.forEach(item => {
                    doc.fontSize(12).text(`Product: ${item.productName}, Stock: ${item.stock}, Total Sold: ${item.totalSold}, Category: ${item.category}`);
                });

                doc.end();
            })
            .catch(err => {
                console.error('Error exporting inventory report as PDF:', err);
                res.status(500).json({ error: 'Database error', details: err.message });
            });
        }, 1000);
    });
};

// Export Order Report as CSV
exports.exportOrderReportCSV = (req, res) => {
    const { startDate, endDate, status } = req.query;

    let statusQuery = `
        SELECT 
            O_status as status,
            COUNT(*) as count
        FROM order_master om
    `;
    let shippingDetailsQuery = `
        SELECT 
            om.O_id,
            om.C_id,
            c.C_address as customerAddress,
            c.C_pincode as customerPincode,
            dp.D_NAME as deliveryPerson
        FROM order_master om
        JOIN customer c ON om.C_id = c.C_id
        LEFT JOIN deliveries d ON om.O_id = d.O_id
        LEFT JOIN delivery_persons dp ON d.D_id = dp.D_id
    `;
    const queryParams = [];

    let whereClauses = [];
    if (startDate) {
        whereClauses.push('O_date >= ?');
        queryParams.push(startDate);
    }
    if (endDate) {
        whereClauses.push('O_date <= ?');
        queryParams.push(endDate);
    }
    if (status && ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'].includes(status)) {
        whereClauses.push('O_status = ?');
        queryParams.push(status);
    }
    if (whereClauses.length > 0) {
        const whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
        statusQuery += whereClause;
        shippingDetailsQuery += whereClause;
    }

    statusQuery += ` GROUP BY O_status`;
    shippingDetailsQuery += ` LIMIT 10`;

    Promise.all([
        new Promise((resolve, reject) => db.query(statusQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(shippingDetailsQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
    ])
    .then(([statusSummary, shippingDetails]) => {
        const statusSummaryData = statusSummary.map(item => ({
            Section: 'Order Status Summary',
            Status: item.status,
            Count: item.count
        }));
        const shippingDetailsData = shippingDetails.map(item => ({
            Section: 'Shipping Details',
            OrderID: item.O_id,
            CustomerID: item.C_id,
            CustomerAddress: item.customerAddress,
            CustomerPincode: item.customerPincode,
            DeliveryPerson: item.deliveryPerson || 'N/A'
        }));

        const csvData = [
            ...statusSummaryData,
            { Section: '' },
            ...shippingDetailsData
        ];

        const fields = ['Section', 'Status', 'Count', 'OrderID', 'OrderDate', 'DeliveryDate', 'CustomerID', 'CustomerAddress', 'CustomerPincode', 'DeliveryPerson'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="order_report.csv"');
        res.send(csv);
    })
    .catch(err => {
        console.error('Error exporting order report as CSV:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    });
};

// Export Order Report as PDF
exports.exportOrderReportPDF = (req, res) => {
    const { startDate, endDate, status } = req.query;

    let statusQuery = `
        SELECT 
            O_status as status,
            COUNT(*) as count
        FROM order_master om
    `;
    let shippingDetailsQuery = `
        SELECT 
            om.O_id,
            om.C_id,
            c.C_address as customerAddress,
            c.C_pincode as customerPincode,
            dp.D_NAME as deliveryPerson
        FROM order_master om
        JOIN customer c ON om.C_id = c.C_id
        LEFT JOIN deliveries d ON om.O_id = d.O_id
        LEFT JOIN delivery_persons dp ON d.D_id = dp.D_id
    `;
    const queryParams = [];

    let whereClauses = [];
    if (startDate) {
        whereClauses.push('O_date >= ?');
        queryParams.push(startDate);
    }
    if (endDate) {
        whereClauses.push('O_date <= ?');
        queryParams.push(endDate);
    }
    if (status && ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'].includes(status)) {
        whereClauses.push('O_status = ?');
        queryParams.push(status);
    }
    if (whereClauses.length > 0) {
        const whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
        statusQuery += whereClause;
        shippingDetailsQuery += whereClause;
    }

    statusQuery += ` GROUP BY O_status`;
    shippingDetailsQuery += ` LIMIT 10`;

    Promise.all([
        new Promise((resolve, reject) => db.query(statusQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
        new Promise((resolve, reject) => db.query(shippingDetailsQuery, queryParams, (err, result) => err ? reject(err) : resolve(result)))
    ])
    .then(([statusSummary, shippingDetails]) => {
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="order_report.pdf"',
                'Content-Length': pdfData.length
            });
            res.end(pdfData);
        });

        doc.fontSize(20).text('Order Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text('Order Status Summary', { underline: true });
        doc.moveDown(0.5);
        statusSummary.forEach(item => {
            doc.fontSize(12).text(`Status: ${item.status}, Count: ${item.count}`);
        });
        doc.moveDown();

        doc.fontSize(14).text('Shipping Details', { underline: true });
        doc.moveDown(0.5);
        shippingDetails.forEach(item => {
            doc.fontSize(12).text(`Order ID: ${item.O_id}, Customer ID: ${item.C_id}, Address: ${item.customerAddress}, Pincode: ${item.customerPincode}, Delivery Person: ${item.deliveryPerson || 'N/A'}`);
        });

        doc.end();
    })
    .catch(err => {
        console.error('Error exporting order report as PDF:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    });
};
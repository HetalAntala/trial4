const mysql = require("mysql");
const { Parser } = require('json2csv');


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

// Inventory Status Data
exports.getInventoryStatus = (req, res) => {
    const lowStockThreshold = 5; // Define threshold for low stock
    const { category } = req.query; // Get category filter

    // Step 1: Fetch all categories from the category table
    db.query('SELECT CY_ID, CY_NAME FROM category', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage });
        }

        // Step 2: Map category names to table names
        const categoryTableMap = new Map(
            categories.map(c => [c.CY_NAME, c.CY_NAME.toLowerCase().replace(/\s+/g, '_')])
        );

        // Step 3: Build dynamic queries for low stock and out of stock
        const lowStockQueries = [];
        const outOfStockQueries = [];
        const queryParams = [];
        const outOfStockParams = [];

        for (const [categoryName, tableName] of categoryTableMap) {
            // Skip if a specific category filter is applied and doesn't match
            if (category && category !== categoryName) continue;

            // Step 4: Check if the table exists
            db.query(`SHOW TABLES LIKE ?`, [tableName], (err, result) => {
                if (err || result.length === 0) {
                    console.log(`Table ${tableName} does not exist:`, err?.sqlMessage);
                    return; // Skip this table
                }

                // Step 5: Fetch table schema to map columns dynamically
                db.query(`SHOW COLUMNS FROM \`${tableName}\``, (err, columns) => {
                    if (err) {
                        console.error(`Error fetching schema for ${tableName}:`, err.sqlMessage);
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
                        return;
                    }

                    // Step 6: Build the query for low stock
                    const lowStockQueryPart = `
                        SELECT 
                            \`${tableName}\`.${columnMap.id} as productId, 
                            \`${tableName}\`.${columnMap.name} as productName, 
                            \`${tableName}\`.${columnMap.stock} as stock,
                            '${categoryName}' as category
                        FROM \`${tableName}\` 
                        WHERE \`${tableName}\`.${columnMap.stock} <= ? AND \`${tableName}\`.${columnMap.stock} > 0
                    `;
                    lowStockQueries.push(lowStockQueryPart);
                    queryParams.push(lowStockThreshold);

                    // Step 7: Build the query for out of stock
                    const outOfStockQueryPart = `
                        SELECT 
                            \`${tableName}\`.${columnMap.id} as productId, 
                            \`${tableName}\`.${columnMap.name} as productName, 
                            \`${tableName}\`.${columnMap.stock} as stock,
                            '${categoryName}' as category
                        FROM \`${tableName}\` 
                        WHERE \`${tableName}\`.${columnMap.stock} = 0
                    `;
                    outOfStockQueries.push(outOfStockQueryPart);
                });
            });
        }

        // Step 8: Combine queries with UNION and execute
        setTimeout(() => { // Allow time for async table checks
            if (lowStockQueries.length === 0) {
                return res.json({ lowStock: [], outOfStock: [], criticalStock: [] });
            }

            const finalLowStockQuery = lowStockQueries.join(' UNION ') + ' ORDER BY stock ASC';
            const finalOutOfStockQuery = outOfStockQueries.join(' UNION ');

            Promise.all([
                new Promise((resolve, reject) => db.query(finalLowStockQuery, queryParams, (err, result) => err ? reject(err) : resolve(result))),
                new Promise((resolve, reject) => db.query(finalOutOfStockQuery, outOfStockParams, (err, result) => err ? reject(err) : resolve(result)))
            ])
            .then(([lowStock, outOfStock]) => {
                const criticalStock = lowStock.filter(item => item.stock <= 2);
                res.json({
                    lowStock: lowStock,
                    outOfStock: outOfStock,
                    criticalStock: criticalStock
                });
            })
            .catch(err => {
                console.error('Error fetching inventory status:', err);
                res.status(500).json({ error: 'Database error', details: err.message });
            });
        }, 1000); // Delay to ensure all table checks complete
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



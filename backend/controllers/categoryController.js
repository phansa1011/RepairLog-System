const db = require("../db/db");

// GET all categories (for dropdown)
exports.getAllCategories = (req, res) => {
    const sql = `
        SELECT category_id, category_name
        FROM categories
        ORDER BY category_name ASC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching device categories:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(rows);
    });
};


// CREATE category
exports.createCategory = (req, res) => {
    const { category_name } = req.body;

    if (!category_name || category_name.trim() === "") {
        return res.status(400).json({ message: "Category name is required" });
    }

    const sql = `
        INSERT INTO categories (category_name)
        VALUES (?)
    `;

    db.run(sql, [category_name.trim()], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(400).json({ message: "Category already exists" });
            }

            console.error("Error creating category:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        res.status(201).json({
            message: "Category created successfully",
            category_id: this.lastID
        });
    });
};


// UPDATE category name
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { category_name } = req.body;

    if (!category_name || category_name.trim() === "") {
        return res.status(400).json({ message: "Category name is required" });
    }

    const sql = `
        UPDATE categories
        SET category_name = ?, update_at = datetime('now', '+7 hours')
        WHERE category_id = ?
    `;

    db.run(sql, [category_name.trim(), id], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(400).json({ message: "Category already exists" });
            }

            console.error("Error updating category:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category updated successfully" });
    });
};
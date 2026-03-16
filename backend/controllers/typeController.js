const db = require("../db/db");

// GET all types (for dropdown)
exports.getAllTypes = (req, res) => {
    const sql = `
        SELECT type_id, type_name
        FROM types
        ORDER BY type_name ASC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching types:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(rows);
    });
};


// CREATE type
exports.createType = (req, res) => {
    const { type_name } = req.body;

    const name = type_name?.trim();

    if (!name) {
        return res.status(400).json({ message: "Type name is required" });
    }

    const sql = `
        INSERT INTO types (type_name)
        VALUES (?)
    `;

    db.run(sql, [name], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(400).json({ message: "Type already exists" });
            }

            console.error("Error creating type:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        res.status(201).json({
            message: "Type created successfully",
            type_id: this.lastID
        });
    });
};


// UPDATE type
exports.updateType = (req, res) => {
    const { id } = req.params;
    const { type_name } = req.body;

    const name = type_name?.trim();

    if (!name) {
        return res.status(400).json({ message: "Type name is required" });
    }

    const sql = `
        UPDATE types
        SET type_name = ?, update_at = datetime('now', '+7 hours')
        WHERE type_id = ?
    `;

    db.run(sql, [name, id], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(400).json({ message: "Type already exists" });
            }

            console.error("Error updating type:", err.message);
            return res.status(500).json({ message: "Database error" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Type not found" });
        }

        res.json({ message: "Type updated successfully" });
    });
};
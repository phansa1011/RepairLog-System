const db = require('../db/db');

exports.getAllPart = (req, res) => {
    const sql = "SELECT * FROM parts ORDER BY create_at DESC";

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }
        res.status(200).json(rows);
    });
};

exports.getPartById = (req, res) => {
    const sql = "SELECT * FROM parts WHERE part_id = ? AND is_active = 1";

    db.get(sql, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Part not found"
            });
        } else
            res.status(200).json(rows);
    });
};

exports.createPart = (req, res) => {
    const { part_name, part_type } = req.body;

    //validation
    if (!part_name || !part_name.trim()) {
        return res.status(400).json({
            message: "part_name is required"
        });
    }
    if (!part_type || !part_type.trim()) {
        return res.status(400).json({
            message: "มีอะไหล่นี้อยู่แล้ว"
        });
    }

    const sql = "INSERT INTO parts (part_name, part_type) VALUES (?, ?)";

    db.run(sql, [part_name, part_type], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({
                    message: "Part name already exists"
                });
            }
            return res.status(500).json({
                message: "Database error"
            });
        }
        res.status(201).json({
            message: "Part created",
            part_id: this.lastID,
            part_name: part_name,
            part_type: part_type
        })
    })
}

exports.updatePart = (req, res) => {
    const { id } = req.params;
    const { part_name, part_type } = req.body;

    //validation
    if (!part_name || !part_name.trim()) {
        return res.status(400).json({
            message: "part_name is required"
        });
    }
    if (!part_type || !part_type.trim()) {
        return res.status(400).json({
            message: "part_type is required"
        });
    }
    //check record มีไหม
    const checkSql = "SELECT * FROM parts WHERE part_id = ? AND is_active = 1";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (!rows) {
            return res.status(404).json({ message: "part not found" });
        }

        //update
        const updateSql = `
            UPDATE parts
            SET part_name = ?, part_type = ?, update_at = datetime('now', '+7 hours')
            WHERE part_id = ? AND is_active = 1
        `;

        db.run(updateSql, [part_name, part_type, id], function (err) {
            if (err) {
                //ถ้ามี UNIQUE constraint
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        message: "มีอะไหล่นี้อยู่แล้ว"
                    });
                }
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Part update",
                changes: this.changes
            });
        });
    })
}

//soft delete
exports.deletePart = (req, res) => {
    const { id } = req.params;

    //validation id
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: "Invalid part id"
        });
    }
    //มี record ไหม
    const checkSql = "SELECT * FROM parts WHERE part_id = ?";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Part not found"
            });
        }
        if (rows.is_active === 0) {
            return res.status(400).json({
                message: "Part already inactive"
            });
        }

        //soft delete (update is_active = 0)
        const updateSql = `
            UPDATE parts
            SET is_active = 0,
                update_at = datetime('now', '+7 hours')
            WHERE part_id = ?
        `;

        db.run(updateSql, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Part deactivated",
                changes: this.changes
            });
        });
    });
};

exports.restorePart = (req, res) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: "Invalid part id"
        });
    }

    const checkSql = "SELECT * FROM parts WHERE part_id = ?";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (!rows) {
            return res.status(404).json({
                message: "Part not found"
            });
        }

        if (rows.is_active === 1) {
            return res.status(400).json({
                message: "Part already active"
            });
        }

        const restoreSql = `
            UPDATE parts
            SET is_active = 1,
                update_at = datetime('now', '+7 hours')
            WHERE part_id = ?
        `;

        db.run(restoreSql, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Part restored",
                changes: this.changes
            });
        });
    });
};
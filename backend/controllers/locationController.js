const db = require('../db/db');

exports.getAllLocation = (req, res) => {
    const sql = "SELECT * FROM locations ORDER BY create_at DESC";

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

exports.getLocationById = (req, res) => {
    const sql = "SELECT * FROM locations WHERE location_id = ?";

    db.get(sql, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Location not found"
            });
        } else
            res.status(200).json(rows);
    });
};

exports.createLocation = (req, res) => {
    const { location_name } = req.body;

    //validation
    if (!location_name || !location_name.trim()) {
        return res.status(400).json({
            message: "location_name is required"
        });
    }

    const sql = "INSERT INTO locations (location_name) VALUES (?)";

    db.run(sql, [location_name], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({
                    message: "Location name already exists"
                });
            }
            return res.status(500).json({
                message: "Database error"
            });
        }
        res.status(201).json({
            message: "Location created",
            location_id: this.lastID,
            location_name: location_name
        })
    })
}

exports.updateLocation = (req, res) => {
    const { id } = req.params;
    const { location_name } = req.body;

    //validation
    if (!location_name || !location_name.trim()) {
        return res.status(400).json({
            message: "location_name is required"
        });
    }
    //check record มีไหม
    const checkSql = "SELECT * FROM locations WHERE location_id = ? AND is_active = 1";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (!rows) {
            return res.status(404).json({ message: "Location not found" });
        }

        //update
        const updateSql = `
            UPDATE locations
            SET location_name =?, update_at = datetime('now', '+7 hours')
            WHERE location_id = ? AND is_active = 1
        `;

        db.run(updateSql, [location_name, id], function (err) {
            if (err) {
                //ถ้ามี UNIQUE constraint
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        message: "Location name already exists"
                    });
                }
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Location update",
                changes: this.changes
            });
        });
    })
}

//soft delete
exports.deleteLocation = (req, res) => {
    const { id } = req.params;

    //validation id
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: "Invalid location id"
        });
    }
    //มี record ไหม
    const checkSql = "SELECT * FROM locations WHERE location_id = ?";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Location not found"
            });
        }
        if (rows.is_active === 0) {
            return res.status(400).json({
                message: "Location already inactive"
            });
        }

        //soft delete (update is_active = 0)
        const updateSql = `
            UPDATE locations
            SET is_active = 0,
                update_at = datetime('now', '+7 hours')
            WHERE location_id = ?
        `;

        db.run(updateSql, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Location deactivated",
                changes: this.changes
            });
        });
    });
};

exports.restoreLocation = (req, res) => {
    const { id } = req.params;
    const checkSql = "SELECT * FROM locations WHERE location_id = ?";

    db.get(checkSql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (!row) {
            return res.status(404).json({
                message: "Location not found"
            });
        }

        if (row.is_active === 1) {
            return res.status(400).json({
                message: "Location already active"
            });
        }

        const restoreSql = `
            UPDATE locations
            SET is_active = 1,
                update_at = datetime('now', '+7 hours')
            WHERE location_id = ?
        `;

        db.run(restoreSql, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Location restored",
                changes: this.changes
            });
        });
    });
};
const db = require('../db/db');

exports.getAllDevice = (req, res) => {
    const sql = "SELECT * FROM devices ORDER BY create_at DESC";

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

exports.getDeviceById = (req, res) => {
    const sql = "SELECT * FROM devices WHERE device_id = ? AND is_active = 1";

    db.get(sql, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Device not found"
            });
        } else
            res.status(200).json(rows);
    });
};

exports.createDevice = (req, res) => {
    const { device_name, device_brand, device_category } = req.body;

    //validation
    if (!device_name || !device_name.trim()) {
        return res.status(400).json({
            message: "device_name is required"
        });
    }

    const sql = `
        INSERT INTO devices (device_name, device_brand, device_category, is_active)
        VALUES (?, ?, ?, 1)
        `;

    db.run(sql, [device_name, device_brand, device_category], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({
                    message: "Device name already exists"
                });
            }
            return res.status(500).json({
                message: "Database error"
            });
        }
        res.status(201).json({
            message: "Device created",
            device_id: this.lastID,
            device_name: device_name
        })
    })
}

exports.updateDevice = (req, res) => {
    const { id } = req.params;
    const { device_name, device_brand, device_category } = req.body;

    //validation
    if (!device_name || !device_name.trim()) {
        return res.status(400).json({
            message: "device_name is required"
        });
    }

    if (!device_category) {
        return res.status(400).json({
            message: "device_category is required"
        });
    }

    //check record มีไหม
    const checkSql = "SELECT * FROM devices WHERE device_id = ? AND is_active = 1";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (!rows) {
            return res.status(404).json({ message: "Device not found" });
        }

        //update
        const updateSql = `
            UPDATE devices
            SET device_name = ?, 
                device_brand = ?, 
                device_category = ?, 
                update_at = datetime('now', '+7 hours')
            WHERE device_id = ? AND is_active = 1
        `;

        db.run(updateSql, [device_name, device_brand, device_category, id], function (err) {
            if (err) {
                //ถ้ามี UNIQUE constraint
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        message: "Device name already exists"
                    });
                }
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Device update",
                changes: this.changes
            });
        });
    })
}

//soft delete
exports.deleteDevice = (req, res) => {
    const { id } = req.params;

    //validation id
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: "Invalid device id"
        });
    }
    //มี record ไหม
    const checkSql = "SELECT * FROM devices WHERE device_id = ?";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Device not found"
            });
        }
        if (rows.is_active === 0) {
            return res.status(400).json({
                message: "Device already inactive"
            });
        }

        //soft delete (update is_active = 0)
        const updateSql = `
            UPDATE devices
            SET is_active = 0,
                update_at = datetime('now', '+7 hours')
            WHERE device_id = ?
        `;

        db.run(updateSql, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Device deactivated",
                changes: this.changes
            });
        });
    });
};
const db = require('../db/db');

exports.getAllWorks = (req, res) => {
    const sql = "SELECT * FROM workers ORDER BY create_at DESC";

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

exports.getWorkerById = (req, res) => {
    const sql = "SELECT * FROM workers WHERE worker_id = ? AND is_active = 1";

    db.get(sql, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Worker not found"
            });
        } else
            res.status(200).json(rows);
    });
};

exports.createWorker = (req, res) => {
    const { staff_id, name, lastname } = req.body;

    //validation
    if (!staff_id || !staff_id.trim()) {
        return res.status(400).json({
            message: "staff_id is required"
        });
    }

    //ให้ใช้แค่ตัวอักษรและตัวเลขเท่านั้น
    const staffIdRegex = /^[A-Za-z0-9]+$/;
    if (!staffIdRegex.test(staff_id)) {
        return res.status(400).json({
            message: "staff_id must contain only letters and numbers"
        });
    }

    if (!name || !name.trim()) {
        return res.status(400).json({
            message: "name is required "
        })
    }
    if (!lastname || !lastname.trim()) {
        return res.status(400).json({
            message: "lastname is required "
        })
    }

    const sql = "INSERT INTO workers (staff_id, name, lastname) VALUES (?,?,?)";

    db.run(sql, [staff_id, name, lastname], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({
                    message: "Staff id already exists"
                });
            }
            return res.status(500).json({
                message: "Database error"
            });
        }
        res.status(201).json({
            message: "Worker created",
            worker_id: this.lastID,
            staff_id: staff_id
        })
    })
}

exports.updateWorker = (req, res) => {
    const { id } = req.params;
    const { staff_id, name, lastname } = req.body;

    //validation
    if (!staff_id || !staff_id.trim()) {
        return res.status(400).json({
            message: "Staff id is required"
        });
    }

    const checkSql = "SELECT * FROM workers WHERE worker_id = ? AND is_active = 1";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }
        //update
        const updateSql = `
            UPDATE workers
            SET staff_id = ?, name = ?, lastname = ?, update_at = datetime('now', '+7 hours')
            WHERE worker_id = ? AND is_active = 1 
        `;

        db.run(updateSql, [staff_id, name, lastname, id], function (err) {
            if (err) {
                //ถ้ามี UNIQUE constraint
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        message: "Staff id already exists"
                    });
                }
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Worker update",
                changes: this.changes
            });
        });
    })
}

exports.deleteWorker = (req, res) => {
    const { id } = req.params;

    //validation id
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            message: "Invalid worker id"
        });
    }
    //มี record ไหม
    const checkSql = "SELECT * FROM workers WHERE worker_id = ?";

    db.get(checkSql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }
        if (!rows) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }
        if (rows.is_active === 0) {
            return res.status(400).json({
                message: "Worker already inactive"
            });
        }

        //soft delete (update is_active = 0)
        const updateSql = `
            UPDATE workers
            SET is_active = 0,
                update_at = datetime('now', '+7 hours')
            WHERE worker_id = ?
        `;

        db.run(updateSql, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }
            res.status(200).json({
                message: "Worker deactivated",
                changes: this.changes
            });
        });
    });
};

exports.restoreWorker = (req, res) => {
    const { id } = req.params;

    const checkSql = "SELECT * FROM workers WHERE worker_id = ?";

    db.get(checkSql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (!row) {
            return res.status(404).json({ message: "Worker not found" });
        }

        if (row.is_active === 1) {
            return res.status(400).json({
                message: "Worker already active"
            });
        }

        const restoreSql = `
            UPDATE workers
            SET is_active = 1,
                update_at = datetime('now', '+7 hours')
            WHERE worker_id = ?
        `;

        db.run(restoreSql, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.status(200).json({
                message: "Worker restored",
                changes: this.changes
            });
        });
    });
};
const db = require('../db/db');

exports.getAllDevicePart = (req, res) => {
    const sql = `
        SELECT 
            dp.device_part_id,
            dp.device_id,
            dp.part_id,
            p.part_name,
            t.type_name
        FROM device_parts dp
        LEFT JOIN parts p ON dp.part_id = p.part_id
        LEFT JOIN types t ON p.type_id = t.type_id
        AND p.is_active = 1
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.log("DEVICE_PART ERROR:", err.message);
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }
        res.status(200).json(rows);
    });
};

exports.addPartsToDevice = (req, res) => {

    const { device_id, part_ids } = req.body;

    if (!device_id) {
        return res.status(400).json({
            message: "device_id is required"
        });
    }

    if (!Array.isArray(part_ids) || part_ids.length === 0) {
        return res.status(400).json({
            message: "part_ids must be a non-empty array"
        });
    }

    db.serialize(() => {

        db.run("BEGIN TRANSACTION");

        let completed = 0;   // นับจำนวนที่ insert สำเร็จ
        let hasError = false; // กันยิง response ซ้ำ

        part_ids.forEach((part_id) => {

            const sql = `
                INSERT INTO device_parts (device_id, part_id)
                VALUES (?, ?)
            `;

            db.run(sql, [device_id, part_id], function (err) {

                if (err && !hasError) {

                    hasError = true;

                    db.run("ROLLBACK");

                    return res.status(400).json({
                        message: "Insert failed",
                        error: err.message
                    });
                }

                if (!hasError) {
                    completed++;

                    // ถ้าจำนวนที่เสร็จ = จำนวนทั้งหมด
                    if (completed === part_ids.length) {

                        db.run("COMMIT");

                        return res.status(201).json({
                            message: "All parts added successfully"
                        });
                    }
                }

            });
        });

    });
};

exports.updateDevicePart = (req, res) => {

    const { id } = req.params;          // device_part_id
    const { part_id } = req.body;

    if (!part_id) {
        return res.status(400).json({
            message: "part_id is required"
        });
    }

    const sql = `
        UPDATE device_parts
        SET part_id = ?
        WHERE device_part_id = ?
    `;

    db.run(sql, [part_id, id], function (err) {

        if (err) {
            console.log("DEVICE_PART ERROR:", err.message);
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Device part not found"
            });
        }

        res.status(200).json({
            message: "Part updated successfully"
        });

    });
};

//not soft delete
exports.deleteDevicePart = (req, res) => {

    // 1️⃣ ดึง id จาก url
    const { id } = req.params;   // device_part_id

    // 2️⃣ ตรวจสอบว่ามี id ไหม
    if (!id) {
        return res.status(400).json({
            message: "device_part_id is required"
        });
    }

    // 3️⃣ SQL สำหรับลบข้อมูล
    const sql = `
        DELETE FROM device_parts
        WHERE device_part_id = ?
    `;

    // 4️⃣ รันคำสั่งลบ
    db.run(sql, [id], function (err) {

        // 5️⃣ ถ้า database error
        if (err) {
            console.log("DEVICE_PART ERROR:", err.message);
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        // 6️⃣ ถ้าไม่มี row ถูกลบ
        if (this.changes === 0) {
            return res.status(404).json({
                message: "Device part not found"
            });
        }

        // 7️⃣ ลบสำเร็จ
        res.status(200).json({
            message: "Device part deleted successfully"
        });

    });
};
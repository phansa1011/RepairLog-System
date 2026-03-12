const db = require('../db/db');

//ดึงข้อมูล repair พร้อม worker ที่เกี่ยวข้อง ใช้ LEFT JOIN เพื่อให้ repair ที่ยังไม่มี worker ก็แสดงได้
exports.getAllRepairs = (req, res) => {

    // 1. SQL JOIN 2 ตาราง
    const sql = `
    SELECT 
        r.repair_id,
        r.location_id,
        r.device_id,
        r.part_id,
        r.cause,
        r.repair_date,
        r.request_channel,
        r.note,
        r.create_at,
        r.update_at,

        d.device_name,

        p.part_name,
        p.part_type,

        rw.repair_worker_id,
        rw.worker_id,
        
        w.name,
        w.lastname

    FROM repairs r

    LEFT JOIN devices d
        ON r.device_id = d.device_id

    LEFT JOIN parts p
        ON r.part_id = p.part_id

    LEFT JOIN repair_workers rw
        ON r.repair_id = rw.repair_id

    LEFT JOIN workers w
        ON rw.worker_id = w.worker_id

    ORDER BY r.create_at DESC
  `;

    // 2. Query ข้อมูลทั้งหมด
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        // 3. แปลงข้อมูลให้รวม worker เป็น array เพราะ JOIN จะทำให้ repair ซ้ำหลายแถว
        const repairsMap = {};

        rows.forEach(row => {
            // ถ้ายังไม่มี repair นี้ใน object
            if (!repairsMap[row.repair_id]) {
                repairsMap[row.repair_id] = {
                    repair_id: row.repair_id,
                    location_id: row.location_id,
                    device_id: row.device_id,
                    part_id: row.part_id,
                    cause: row.cause,
                    repair_date: row.repair_date,
                    request_channel: row.request_channel,
                    note: row.note,
                    create_at: row.create_at,
                    update_at: row.update_at,
                    device_name: row.device_name,
                    part_name: row.part_name,
                    part_type: row.part_type,
                    workers: [] // เตรียม array สำหรับ worker
                };
            }

            // ถ้ามี worker จริง (ไม่ใช่ null จาก LEFT JOIN)
            if (row.repair_worker_id) {
                repairsMap[row.repair_id].workers.push({
                    repair_worker_id: row.repair_worker_id,
                    worker_id: row.worker_id,
                    name: row.name,
                    lastname: row.lastname
                });
            }
        });

        // 4. แปลง object → array
        const result = Object.values(repairsMap);
        res.status(200).json(result);
    });
};

//ดึง repair แบบละเอียด (join ทุกตารางที่เกี่ยวข้อง)
exports.getRepairById = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "Repair id is required"
        });
    }

    const sql = `
    SELECT
      r.repair_id,
      r.cause,
      r.repair_date,
      r.request_channel,
      r.note,
      r.create_at,
      r.update_at,

      l.location_id,
      l.location_name,

      d.device_id,
      d.device_name,

      p.part_id,
      p.part_name,
      p.part_type,

      rw.repair_worker_id,

      w.worker_id,
      w.name,
      w.lastname

    FROM repairs r

    LEFT JOIN locations l
      ON r.location_id = l.location_id

    LEFT JOIN devices d
      ON r.device_id = d.device_id

    LEFT JOIN parts p
      ON r.part_id = p.part_id

    LEFT JOIN repair_workers rw
      ON r.repair_id = rw.repair_id

    LEFT JOIN workers w
      ON rw.worker_id = w.worker_id

    WHERE r.repair_id = ?
  `;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }
        if (rows.length === 0) {
            return res.status(404).json({
                message: "Repair not found"
            });
        }

        // สร้าง object หลักจาก row แรก
        const repair = {
            repair_id: rows[0].repair_id,
            cause: rows[0].cause,
            repair_date: rows[0].repair_date,
            request_channel: rows[0].request_channel,
            note: rows[0].note,
            create_at: rows[0].create_at,
            update_at: rows[0].update_at,

            location: {
                location_id: rows[0].location_id,
                location_name: rows[0].location_name
            },

            device: {
                device_id: rows[0].device_id,
                device_name: rows[0].device_name
            },

            part: {
                part_id: rows[0].part_id,
                part_name: rows[0].part_name,
                part_type: rows[0].part_type
            },

            workers: []
        };

        // รวม workers
        rows.forEach(row => {
            if (row.repair_worker_id) {
                repair.workers.push({
                    repair_worker_id: row.repair_worker_id,
                    worker_id: row.worker_id,
                    name: row.name,
                    lastname: row.lastname
                });
            }
        });
        res.status(200).json(repair);
    });
};

//สร้าง repair พร้อม repair_workers หลายคน
exports.createRepairWithWorkers = (req, res) => {
    // 1. ดึงข้อมูลจาก request body
    const {
        location_id,
        device_id,
        part_id,
        cause,
        repair_date,
        request_channel,
        note,
        worker_ids
    } = req.body;

    // 2. Validation เบื้องต้น
    if (
        !location_id ||
        !device_id ||
        !part_id ||
        !cause ||
        !repair_date ||
        !request_channel ||
        !Array.isArray(worker_ids) ||
        worker_ids.length === 0
    ) {
        return res.status(400).json({
            message: "Missing required fields or worker_ids must be a non-empty array"
        });
    }

    // 3. เริ่ม Transaction
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 4. Insert repair ก่อน
        const repairSql = `
      INSERT INTO repairs
      (location_id, device_id, part_id, cause, repair_date, request_channel, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        db.run(
            repairSql,
            [
                location_id,
                device_id,
                part_id,
                cause,
                repair_date,
                request_channel,
                note || null
            ],
            function (err) {
                // ถ้า insert repair พัง → rollback
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({
                        message: "Error inserting repair",
                        error: err.message
                    });
                }

                // เก็บ repair_id ที่เพิ่งสร้าง
                const repairId = this.lastID;

                // 5. Insert repair_workers ทีละคน
                const workerSql = `
          INSERT INTO repair_workers
          (repair_id, worker_id)
          VALUES (?, ?)
        `;

                let hasError = false;

                worker_ids.forEach((worker_id) => {
                    db.run(workerSql, [repairId, worker_id], (workerErr) => {
                        if (workerErr && !hasError) {
                            hasError = true;

                            // ถ้ามี error ใด ๆ → rollback ทั้งหมด
                            db.run("ROLLBACK");

                            return res.status(500).json({
                                message: "Error inserting repair workers",
                                error: workerErr.message
                            });
                        }
                    });
                });

                // 6. Commit ถ้าไม่มี error
                if (!hasError) {
                    db.run("COMMIT");
                    return res.status(201).json({
                        message: "Repair and workers created successfully",
                        repair_id: repairId
                    });
                }
            }
        );
    });
};

exports.updateRepair = (req, res) => {
    const { id } = req.params;
    const {
        location_id,
        device_id,
        part_id,
        cause,
        repair_date,
        request_channel,
        note,
        worker_ids
    } = req.body;

    if (!Array.isArray(worker_ids)) {
        return res.status(400).json({
            message: "worker_ids must be array"
        });
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const updateSql = `
      UPDATE repairs
      SET
        location_id = ?,
        device_id = ?,
        part_id = ?,
        cause = ?,
        repair_date = ?,
        request_channel = ?,
        note = ?,
        update_at = datetime('now', '+7 hours')
      WHERE repair_id = ?
    `;

        db.run(
            updateSql,
            [
                location_id,
                device_id,
                part_id,
                cause,
                repair_date,
                request_channel,
                note || null,
                id
            ],
            function (err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({
                        error: err.message
                    });
                }

                // ❗ เช็คว่ามี repair นี้จริงไหม
                if (this.changes === 0) {
                    db.run("ROLLBACK");
                    return res.status(404).json({
                        message: "Repair not found"
                    });
                }

                // ลบ worker เดิม
                db.run(
                    "DELETE FROM repair_workers WHERE repair_id = ?",
                    [id],
                    (deleteErr) => {
                        if (deleteErr) {
                            db.run("ROLLBACK");
                            return res.status(500).json({
                                error: deleteErr.message
                            });
                        }

                        // ถ้าไม่มี worker ใหม่เลย
                        if (worker_ids.length === 0) {
                            db.run("COMMIT");
                            return res.status(200).json({
                                message: "Repair updated (no workers assigned)"
                            });
                        }

                        const insertSql = `
              INSERT INTO repair_workers
              (repair_id, worker_id)
              VALUES (?, ?)
            `;

                        let completed = 0;
                        let hasError = false;

                        worker_ids.forEach(worker_id => {
                            db.run(insertSql, [id, worker_id], (insertErr) => {
                                if (insertErr && !hasError) {
                                    hasError = true;
                                    db.run("ROLLBACK");
                                    return res.status(500).json({
                                        error: insertErr.message
                                    });
                                }
                                completed++;

                                // ✅ รอจน insert ครบทุกตัว
                                if (completed === worker_ids.length && !hasError) {
                                    db.run("COMMIT");
                                    res.status(200).json({
                                        message: "Repair updated successfully"
                                    });
                                }
                            });
                        });
                    }
                );
            }
        );
    });
};

//ลบ repair พร้อม worker ที่เกี่ยวข้อง
exports.deleteRepair = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            message: "Repair id is required"
        });
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1️⃣ เช็คว่ามี repair นี้จริงไหม
        db.get(
            "SELECT repair_id FROM repairs WHERE repair_id = ?",
            [id],
            (err, row) => {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({
                        error: err.message
                    });
                }

                if (!row) {
                    db.run("ROLLBACK");
                    return res.status(404).json({
                        message: "Repair not found"
                    });
                }

                // 2️⃣ ลบ worker ที่เกี่ยวข้องก่อน
                db.run(
                    "DELETE FROM repair_workers WHERE repair_id = ?",
                    [id],
                    (workerErr) => {
                        if (workerErr) {
                            db.run("ROLLBACK");
                            return res.status(500).json({
                                error: workerErr.message
                            });
                        }

                        // 3️⃣ ลบ repair หลัก
                        db.run(
                            "DELETE FROM repairs WHERE repair_id = ?",
                            [id],
                            (repairErr) => {
                                if (repairErr) {
                                    db.run("ROLLBACK");
                                    return res.status(500).json({
                                        error: repairErr.message
                                    });
                                }

                                // 4️⃣ สำเร็จ → commit
                                db.run("COMMIT");

                                res.status(200).json({
                                    message: "Repair deleted successfully"
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};
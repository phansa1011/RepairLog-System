const sqlite3 = require('sqlite3').verbose();

//connect to database.db
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Failed to connect to the database', err.message);
    } else {
        console.log('Successfully connected to SQLite');
        db.run(`PRAGMA foreign_keys = ON;`);
    }
});

//create teble
//workers
db.run(`
    CREATE TABLE IF NOT EXISTS workers (
        worker_id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        lastname TEXT NOT NULL,
        create_at DATETIME DEFAULT (datetime('now', '+7 hours')),
        update_at DATETIME,
        is_active INTEGER DEFAULT 1
    )`
);

//locations
db.run(`
    CREATE TABLE IF NOT EXISTS locations (
        location_id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_name TEXT UNIQUE NOT NULL,
        create_at DATETIME DEFAULT (datetime('now', '+7 hours')),
        update_at DATETIME,
        is_active INTEGER DEFAULT 1
    )`
);

//devices
db.run(`
    CREATE TABLE IF NOT EXISTS devices (
        device_id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_name TEXT UNIQUE NOT NULL,
        device_brand TEXT NOT NULL,
        device_category TEXT NOT NULL,
        create_at DATETIME DEFAULT (datetime('now', '+7 hours')),
        update_at DATETIME,
        is_active INTEGER DEFAULT 1
    )`
);

//part
db.run(`
    CREATE TABLE IF NOT EXISTS parts (
        part_id INTEGER PRIMARY KEY AUTOINCREMENT,
        part_name TEXT UNIQUE NOT NULL,
        part_type TEXT NOT NULL,
        create_at DATETIME DEFAULT (datetime('now', '+7 hours')),
        update_at DATETIME,
        is_active INTEGER DEFAULT 1
    )`
);

//device_part
db.run(`
    CREATE TABLE IF NOT EXISTS device_parts (
        device_part_id INTEGER PRIMARY KEY AUTOINCREMENT,
        part_id INTEGER NOT NULL,
        device_id INTEGER NOT NULL,

        FOREIGN KEY (part_id) REFERENCES parts(part_id),
        FOREIGN KEY (device_id) REFERENCES devices(device_id)

        UNIQUE(device_id, part_id)
    )`
);

//repair
db.run(`
    CREATE TABLE IF NOT EXISTS repairs (
        repair_id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id INTEGER NOT NULL,
        device_id INTEGER NOT NULL,
        part_id INTEGER NOT NULL,
        cause TEXT NOT NULL,
        repair_date DATE NOT NULL,
        request_channel TEXT NOT NULL,
        note TEXT,
        create_at DATETIME DEFAULT (datetime('now', '+7 hours')),
        update_at DATETIME,

        FOREIGN KEY (location_id) REFERENCES locations(location_id),
        FOREIGN KEY (part_id) REFERENCES parts(part_id),
        FOREIGN KEY (device_id) REFERENCES devices(device_id)
    )`
);

//repair_worker
db.run(`
    CREATE TABLE IF NOT EXISTS repair_workers (
        repair_worker_id INTEGER PRIMARY KEY AUTOINCREMENT,
        repair_id INTEGER NOT NULL,
        worker_id INTEGER NOT NULL,

        FOREIGN KEY (repair_id) REFERENCES repairs(repair_id),
        FOREIGN KEY (worker_id) REFERENCES workers(worker_id)

        UNIQUE(repair_id, worker_id)
    )`
);

module.exports = db;
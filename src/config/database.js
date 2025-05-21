// src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './database.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDb();
    }
});

const initializeDb = () => {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 username TEXT UNIQUE NOT NULL,
                                                 email TEXT UNIQUE NOT NULL,
                                                 password TEXT NOT NULL,
                                                 role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
                                                 createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS magazines (
                                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                     title TEXT NOT NULL,
                                                     description TEXT,
                                                     price REAL NOT NULL,
                                                     coverImage TEXT, -- URL или путь к файлу
                                                     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS articles (
                                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                    magazineId INTEGER NOT NULL,
                                                    title TEXT NOT NULL,
                                                    content TEXT NOT NULL,
                                                    publicationDate DATETIME NOT NULL,
                                                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                    FOREIGN KEY (magazineId) REFERENCES magazines(id) ON DELETE CASCADE
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         userId INTEGER NOT NULL,
                                                         magazineId INTEGER NOT NULL,
                                                         startDate DATETIME NOT NULL,
                                                         endDate DATETIME NOT NULL,
                                                         status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'expired', 'cancelled')),
                                                         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                         FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                                                         FOREIGN KEY (magazineId) REFERENCES magazines(id) ON DELETE CASCADE
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS transactions (
                                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        subscriptionId INTEGER NOT NULL,
                                                        userId INTEGER NOT NULL,
                                                        amount REAL NOT NULL,
                                                        paymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
                                                        paymentMethod TEXT, -- e.g., 'simulated_card'
                                                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                        FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id) ON DELETE CASCADE,
                                                        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Seed admin user if not exists
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        db.get('SELECT * FROM users WHERE username = ?', [adminUsername], (err, row) => {
            if (err) {
                console.error('Error checking for admin user:', err.message);
                return;
            }
            if (!row) {
                bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error('Error hashing admin password:', err.message);
                        return;
                    }
                    db.run(
                        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                        [adminUsername, adminEmail, hashedPassword, 'admin'],
                        (err) => {
                            if (err) {
                                console.error('Error seeding admin user:', err.message);
                            } else {
                                console.log('Admin user created.');
                            }
                        }
                    );
                });
            } else {
                console.log('Admin user already exists.');
            }
        });
        console.log('Database tables ensured/created.');
    });
};

module.exports = db;
const db = require('../config/database');

const Subscription = {
    create: (data, callback) => {
        const { userId, magazineId, startDate, endDate, status = 'pending' } = data;
        const sql = 'INSERT INTO subscriptions (userId, magazineId, startDate, endDate, status) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [userId, magazineId, startDate, endDate, status], function (err) {
            callback(err, { id: this.lastID });
        });
    },
    findByUserId: (userId, callback) => {
        const sql = `
            SELECT s.*, m.title as magazineTitle, m.coverImage as magazineCover
            FROM subscriptions s
            JOIN magazines m ON s.magazineId = m.id
            WHERE s.userId = ?
            ORDER BY s.createdAt DESC
        `;
        db.all(sql, [userId], callback);
    },
    findById: (id, callback) => {
        db.get('SELECT * FROM subscriptions WHERE id = ?', [id], callback);
    },
    updateStatus: (id, status, callback) => {
        const sql = 'UPDATE subscriptions SET status = ? WHERE id = ?';
        db.run(sql, [status, id], function (err) {
            callback(err, { changes: this.changes });
        });
    },
    findActiveByUserAndMagazine: (userId, magazineId, callback) => {
        const sql = `
            SELECT * FROM subscriptions 
            WHERE userId = ? AND magazineId = ? AND status = 'active' AND endDate > datetime('now')
        `;
        db.get(sql, [userId, magazineId], callback);
    },
    deleteByUserAndMagazine: (userId, magazineId, callback) => {
        const sql = 'DELETE FROM subscriptions WHERE userId = ? AND magazineId = ?';
        db.run(sql, [userId, magazineId], function (err) {
            callback(err, { changes: this.changes });
        });
    }
};
module.exports = Subscription;
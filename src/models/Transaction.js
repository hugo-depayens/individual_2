const db = require('../config/database');

const Transaction = {
    create: (data, callback) => {
        const { subscriptionId, userId, amount, status = 'pending', paymentMethod } = data;
        const sql = 'INSERT INTO transactions (subscriptionId, userId, amount, status, paymentMethod) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [subscriptionId, userId, amount, status, paymentMethod], function (err) {
            callback(err, { id: this.lastID });
        });
    },
    updateStatus: (id, status, callback) => {
        const sql = 'UPDATE transactions SET status = ? WHERE id = ?';
        db.run(sql, [status, id], function (err) {
            callback(err, { changes: this.changes });
        });
    },
    findBySubscriptionId: (subscriptionId, callback) => {
        db.all('SELECT * FROM transactions WHERE subscriptionId = ? ORDER BY paymentDate DESC', [subscriptionId], callback);
    }
};
module.exports = Transaction;
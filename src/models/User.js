const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    create: (data, callback) => {
        const { username, email, password, role = 'user' } = data;
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return callback(err);
            const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
            db.run(sql, [username, email, hashedPassword, role], function (err) {
                callback(err, { id: this.lastID });
            });
        });
    },
    findByEmail: (email, callback) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], callback);
    },
    findById: (id, callback) => {
        db.get('SELECT id, username, email, role, createdAt FROM users WHERE id = ?', [id], callback);
    }
};
module.exports = User;
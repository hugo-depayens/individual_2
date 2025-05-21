const db = require('../config/database');

const Magazine = {
    create: (data, callback) => {
        const { title, description, price, coverImage } = data;
        const sql = 'INSERT INTO magazines (title, description, price, coverImage) VALUES (?, ?, ?, ?)';
        db.run(sql, [title, description, price, coverImage], function (err) {
            callback(err, { id: this.lastID });
        });
    },
    findAll: (callback) => {
        db.all('SELECT * FROM magazines ORDER BY createdAt DESC', callback);
    },
    findById: (id, callback) => {
        db.get('SELECT * FROM magazines WHERE id = ?', [id], callback);
    },
    update: (id, data, callback) => {
        const { title, description, price, coverImage } = data;
        const sql = 'UPDATE magazines SET title = ?, description = ?, price = ?, coverImage = ? WHERE id = ?';
        db.run(sql, [title, description, price, coverImage, id], function (err) {
            callback(err, { changes: this.changes });
        });
    },
    delete: (id, callback) => {
        db.run('DELETE FROM magazines WHERE id = ?', [id], function (err) {
            callback(err, { changes: this.changes });
        });
    }
};
module.exports = Magazine;
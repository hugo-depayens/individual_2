const db = require('../config/database');

const Article = {
    create: (data, callback) => {
        const { magazineId, title, content, publicationDate } = data;
        const sql = 'INSERT INTO articles (magazineId, title, content, publicationDate) VALUES (?, ?, ?, ?)';
        db.run(sql, [magazineId, title, content, publicationDate], function (err) {
            callback(err, { id: this.lastID });
        });
    },
    findAll: (callback) => {
        db.all('SELECT * FROM articles ORDER BY publicationDate DESC', [], callback);
    },
    findByMagazineId: (magazineId, callback) => {
        db.all('SELECT * FROM articles WHERE magazineId = ? ORDER BY publicationDate DESC', [magazineId], callback);
    },
    findById: (id, callback) => {
        db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, row);
            }
        });
    },
    update: (id, data, callback) => {
        const { title, content, publicationDate } = data; // magazineId не меняем при редактировании статьи
        const sql = 'UPDATE articles SET title = ?, content = ?, publicationDate = ? WHERE id = ?';
        db.run(sql, [title, content, publicationDate, id], function (err) {
            callback(err, { changes: this.changes });
        });
    },
    delete: (id, callback) => {
        db.run('DELETE FROM articles WHERE id = ?', [id], function (err) {
            callback(err, { changes: this.changes });
        });
    }
};
module.exports = Article;
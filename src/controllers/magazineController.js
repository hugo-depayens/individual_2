const Magazine = require('../models/Magazine');
const Article = require('../models/Article');
const Subscription = require('../models/Subscription');

exports.getAllMagazines = (req, res) => {
    Magazine.findAll((err, magazines) => {
        if (err) return res.status(500).json({ message: 'Error fetching magazines', error: err.message });
        res.json(magazines);
    });
};

exports.getMagazineById = (req, res) => {
    const magazineId = req.params.id;
    Magazine.findById(magazineId, (err, magazine) => {
        if (err) return res.status(500).json({ message: 'Error fetching magazine', error: err.message });
        if (!magazine) return res.status(404).json({ message: 'Magazine not found' });

        // Если пользователь авторизован, проверяем подписку для доступа к статьям
        if (req.user) {
            Subscription.findActiveByUserAndMagazine(req.user.id, magazineId, (err, subscription) => {
                if (err) console.error("Error checking subscription:", err.message); // Не блокируем, просто логируем

                if (subscription || req.user.role === 'admin') { // Админ имеет доступ ко всему
                    Article.findByMagazineId(magazineId, (err, articles) => {
                        if (err) return res.status(500).json({ message: 'Error fetching articles', error: err.message });
                        res.json({ ...magazine, articles });
                    });
                } else {
                    // Пользователь не подписан, отдаем только информацию о журнале
                    res.json({ ...magazine, articles: [], message: "Subscribe to view articles." });
                }
            });
        } else {
            // Неавторизованный пользователь видит только описание журнала
            res.json({ ...magazine, articles: [], message: "Login and subscribe to view articles." });
        }
    });
};
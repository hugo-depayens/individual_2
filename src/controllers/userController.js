const Subscription = require('../models/Subscription');
const Article = require('../models/Article'); // Понадобится для доступа к выпускам

exports.getUserProfile = (req, res) => {
    // req.user уже содержит id, username, email, role из токена
    // Можно добавить больше информации, если нужно, запросив из User.findById
    res.json({ user: req.user });
};

exports.getUserSubscriptions = (req, res) => {
    const userId = req.user.id;
    Subscription.findByUserId(userId, (err, subscriptions) => {
        if (err) return res.status(500).json({ message: 'Error fetching subscriptions', error: err.message });
        res.json(subscriptions);
    });
};

exports.unsubscribeMagazine = (req, res) => {
    const userId = req.user.id;
    const magazineId = parseInt(req.params.magazineId, 10);

    if (isNaN(magazineId)) {
        return res.status(400).json({ message: 'Invalid magazine ID' });
    }

    Subscription.deleteByUserAndMagazine(userId, magazineId, (err) => {
        if (err) return res.status(500).json({ message: 'Error unsubscribing', error: err.message });
        res.json({ message: 'Unsubscribed successfully' });
    });
}

// Доступ к статьям конкретного журнала, на который есть активная подписка
exports.getSubscribedMagazineArticles = (req, res) => {
    const userId = req.user.id;
    const magazineId = parseInt(req.params.magazineId, 10);

    if (isNaN(magazineId)) {
        return res.status(400).json({ message: 'Invalid magazine ID' });
    }

    Subscription.findActiveByUserAndMagazine(userId, magazineId, (err, subscription) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });

        if (!subscription && req.user.role !== 'admin') { // Админ имеет доступ ко всему
            return res.status(403).json({ message: 'No active subscription for this magazine or access denied.' });
        }

        Article.findByMagazineId(magazineId, (err, articles) => {
            if (err) return res.status(500).json({ message: 'Error fetching articles', error: err.message });
            res.json(articles);
        });
    });
};
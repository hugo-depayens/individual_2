const Magazine = require('../models/Magazine');
const Article = require('../models/Article');

// --- Magazine Management ---
exports.addMagazine = (req, res) => {
    const { title, description, price, coverImage } = req.body;
    if (!title || price === undefined) {
        return res.status(400).json({ message: 'Title and price are required' });
    }
    Magazine.create({ title, description, price, coverImage }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error adding magazine', error: err.message });
        res.status(201).json({ message: 'Magazine added successfully', magazineId: result.id });
    });
};

exports.getAllArticles = (req, res) => {
    Article.findAll((err, articles) => {
        if (err) return res.status(500).json({ message: 'Error fetching articles', error: err.message });
        res.json(articles);
    });
}

exports.getArticle = (req, res) => {
    const articleId = req.params.id;
    Article.findById(articleId, (err, article) => {
        if (err) return res.status(500).json({ message: 'Error fetching article', error: err.message });
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.json(article);
    });
}

exports.editMagazine = (req, res) => {
    const magazineId = req.params.id;
    const { title, description, price, coverImage } = req.body;
    if (!title || price === undefined) {
        return res.status(400).json({ message: 'Title and price are required' });
    }
    Magazine.update(magazineId, { title, description, price, coverImage }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating magazine', error: err.message });
        if (result.changes === 0) return res.status(404).json({ message: 'Magazine not found or no changes made' });
        res.json({ message: 'Magazine updated successfully' });
    });
};

exports.deleteMagazine = (req, res) => {
    const magazineId = req.params.id;
    // При удалении журнала, статьи и подписки удалятся каскадно (ON DELETE CASCADE)
    Magazine.delete(magazineId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting magazine', error: err.message });
        if (result.changes === 0) return res.status(404).json({ message: 'Magazine not found' });
        res.json({ message: 'Magazine deleted successfully' });
    });
};

// --- Article Management ---
exports.addArticle = (req, res) => {
    const { magazineId, title, content, publicationDate } = req.body;
    if (!magazineId || !title || !content || !publicationDate) {
        return res.status(400).json({ message: 'Magazine ID, title, content, and publication date are required' });
    }
    // Проверка, существует ли журнал
    Magazine.findById(magazineId, (err, magazine) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });
        if (!magazine) return res.status(404).json({ message: 'Magazine not found' });

        Article.create({ magazineId, title, content, publicationDate }, (err, result) => {
            if (err) return res.status(500).json({ message: 'Error adding article', error: err.message });
            res.status(201).json({ message: 'Article added successfully', articleId: result.id });
        });
    });
};

exports.editArticle = (req, res) => {
    const articleId = req.params.id;
    const { title, content, publicationDate } = req.body; // magazineId не меняем
    if (!title || !content || !publicationDate) {
        return res.status(400).json({ message: 'Title, content, and publication date are required' });
    }
    Article.update(articleId, { title, content, publicationDate }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating article', error: err.message });
        if (result.changes === 0) return res.status(404).json({ message: 'Article not found or no changes made' });
        res.json({ message: 'Article updated successfully' });
    });
};

exports.deleteArticle = (req, res) => {
    const articleId = req.params.id;
    Article.delete(articleId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting article', error: err.message });
        if (result.changes === 0) return res.status(404).json({ message: 'Article not found' });
        res.json({ message: 'Article deleted successfully' });
    });
};

exports.getAllArticlesForMagazine = (req, res) => {
    const magazineId = req.params.magazineId;
    Article.findByMagazineId(magazineId, (err, articles) => {
        if (err) return res.status(500).json({ message: 'Error fetching articles', error: err.message });
        res.json(articles);
    });
};
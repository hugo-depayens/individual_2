const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Все маршруты здесь требуют аутентификации и роли администратора
router.use(authenticateToken, isAdmin);

// Magazine management
router.post('/magazines', adminController.addMagazine);
router.put('/magazines/:id', adminController.editMagazine);
router.delete('/magazines/:id', adminController.deleteMagazine);

// Article management
router.get('/articles', adminController.getAllArticles); // Админ может видеть все статьи
router.post('/articles', adminController.addArticle);
router.get('/articles/:id', adminController.getArticle);
router.put('/articles/:id', adminController.editArticle);
router.delete('/articles/:id', adminController.deleteArticle);
router.get('/magazines/:magazineId/articles', adminController.getAllArticlesForMagazine); // Админ может видеть все статьи

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/me', authenticateToken, userController.getUserProfile);
router.get('/me/subscriptions', authenticateToken, userController.getUserSubscriptions);
router.get('/me/magazines/:magazineId/articles', authenticateToken, userController.getSubscribedMagazineArticles);

router.delete('/unsubscribe/:magazineId', authenticateToken, userController.unsubscribeMagazine);

module.exports = router;
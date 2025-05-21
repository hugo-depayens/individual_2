const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, subscriptionController.createSubscription);
router.post('/pay', authenticateToken, subscriptionController.simulatePayment);

module.exports = router;
const express = require('express');
const router = express.Router();
const magazineController = require('../controllers/magazineController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Для getMagazineById, чтобы проверять подписку

router.get('/', magazineController.getAllMagazines);
// authenticateToken здесь опционален, но если он есть, контроллер сможет проверить подписку
router.get('/:id', authenticateToken, magazineController.getMagazineById);

module.exports = router;
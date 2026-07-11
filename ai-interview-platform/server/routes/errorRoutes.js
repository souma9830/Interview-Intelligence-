const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/authMiddleware');
const errorController = require('../controllers/errorController');

router.get('/errors', protect, adminOnly, errorController.listErrors);
router.get('/errors/stats', protect, adminOnly, errorController.getErrorStats);
router.get('/errors/:id', protect, adminOnly, errorController.getErrorDetail);
router.patch('/errors/:id/resolve', protect, adminOnly, errorController.resolveError);

module.exports = router;
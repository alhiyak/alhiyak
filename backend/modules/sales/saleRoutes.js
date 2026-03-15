const express = require('express');
const router = express.Router();
const saleController = require('./saleController');
const authMiddleware = require('../auth/authMiddleware');

// جميع المسارات محمية بمصادقة
router.use(authMiddleware);

// GET /api/sales
router.get('/', saleController.getAllSales);

// GET /api/sales/:id
router.get('/:id', saleController.getSaleById);

// POST /api/sales
router.post('/', saleController.createSale);

// PUT /api/sales/:id
router.put('/:id', saleController.updateSale);

// (اختياري) DELETE /api/sales/:id - يمكن إضافته لاحقاً إذا أردت
// router.delete('/:id', saleController.deleteSale);

module.exports = router;
const express = require('express');
const {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase
} = require('../modules/purchases/purchaseController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllPurchases);
router.get('/:id', authMiddleware, getPurchaseById);
router.post('/', authMiddleware, createPurchase);
router.put('/:id', authMiddleware, updatePurchase);

module.exports = router;
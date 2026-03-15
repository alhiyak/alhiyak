const express = require('express');
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  upload
} = require('../modules/inventory/itemController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllItems);
router.get('/:id', authMiddleware, getItemById);
router.post('/', authMiddleware, upload, createItem);
router.put('/:id', authMiddleware, upload, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
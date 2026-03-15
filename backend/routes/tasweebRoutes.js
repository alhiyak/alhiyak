const express = require('express');
const {
  getAllTasweeb,
  createTasweeb,
  updateTasweeb,
  deleteTasweeb
} = require('../modules/tasweeb/tasweebController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllTasweeb);
router.post('/', authMiddleware, createTasweeb);
router.put('/:id', authMiddleware, updateTasweeb);
router.delete('/:id', authMiddleware, deleteTasweeb);

module.exports = router;

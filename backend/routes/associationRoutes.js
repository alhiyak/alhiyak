const express = require('express');
const {
  getAllAssociations,
  createAssociation,
  updateAssociation,
  deleteAssociation
} = require('../modules/associations/associationController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllAssociations);
router.post('/', authMiddleware, createAssociation);
router.put('/:id', authMiddleware, updateAssociation);
router.delete('/:id', authMiddleware, deleteAssociation);

module.exports = router;

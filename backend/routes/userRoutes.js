const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../modules/users/userController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;

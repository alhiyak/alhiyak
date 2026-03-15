const express = require('express');
const {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember
} = require('../modules/members/memberController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllMembers);
router.post('/', authMiddleware, createMember);
router.put('/:id', authMiddleware, updateMember);
router.delete('/:id', authMiddleware, deleteMember);

module.exports = router;
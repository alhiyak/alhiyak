const express = require('express');
const { login, register } = require('../modules/auth/authController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', authMiddleware, register);

module.exports = router;

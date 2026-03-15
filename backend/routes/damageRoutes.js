const express = require('express');
const { createDamage, getAllDamages } = require('../modules/damages/damageController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllDamages);
router.post('/', authMiddleware, createDamage);

module.exports = router;

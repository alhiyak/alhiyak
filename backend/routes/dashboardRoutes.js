const express = require('express');
const { getSummary } = require('../modules/dashboard/dashboardController');
const authMiddleware = require('../modules/auth/authMiddleware');

const router = express.Router();

router.get('/summary', authMiddleware, getSummary);

module.exports = router;

const express = require('express');
const router = express.Router();
const { sendVerificationCode, verifyCode, resetPassword } = require('../middlewares/passwordResetController');
const jwt = require('jsonwebtoken');
const { Account } = require('../models');


require('dotenv').config();

// Reset password
router.post('/request', sendVerificationCode);
router.post('/verify', verifyCode);
router.post('/reset', resetPassword);

module.exports = router;
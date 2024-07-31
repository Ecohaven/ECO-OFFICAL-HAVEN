const express = require('express');
const router = express.Router();
const { sendVerificationCode, verifyCode, resetPassword,
        sendVerificationCodeStaff, verifyCodeStaff, resetPasswordStaff
 } = require('../middlewares/passwordResetController');
const jwt = require('jsonwebtoken');
const { Account } = require('../models');


require('dotenv').config();

// Reset password
router.post('/request', sendVerificationCode);
router.post('/verify', verifyCode);
router.post('/reset', resetPassword);

router.post('/request/staff', sendVerificationCodeStaff);
router.post('/verify/staff', verifyCodeStaff);
router.post('/reset/staff', resetPasswordStaff);

module.exports = router;
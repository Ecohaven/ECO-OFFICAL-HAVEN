const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const yup = require('yup');
const { Account, StaffAccount } = require('../models');

require('dotenv').config();

// Reset Password for user accounts

// Generate and send reset token
const sendVerificationCode = async (req, res) => {
    let validationSchema = yup.object({
            email: yup.string().email().required()
        });
    try {
        // Validate request body
        await validationSchema.validate(req.body);

        const { email } = req.body;
        const account = await Account.findOne({ where: { email } });

        // Check if account exists
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Generate a verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code

        // Save verification code and expiration time
        account.verificationCode = verificationCode;
        account.verificationCodeExpires = Date.now() + 600000; // 10 minutes

        await account.save();

        // Configure the email transport to Send email 
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EcoHaven: Password Reset',
            text: `Your verification code is ${verificationCode}`
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        // create a reset token
        const resetToken = jwt.sign({ email, verificationCode }, process.env.APP_SECRET, { expiresIn: '10m' });
        // store the reset token in the local storage
        res.json({ 
            resetToken: resetToken,
            message: "Verification code sent"
        });
    }
    catch (err) {
        console.log(err);
        if (err.errors) {
            return res.status(400).json({ message: err.errors[0] });
        }
        else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

// Verify code
const verifyCode = async (req, res) => {
    const validationSchema = yup.object({
      verificationCode: yup.string().required(),
      resetToken: yup.string().required() // Add resetToken to validation schema
    });

    try {
        // Validate request body
        await validationSchema.validate(req.body);
        const { verificationCode, resetToken } = req.body;

        // Verify and decode the reset token
        const decoded = jwt.verify(resetToken, process.env.APP_SECRET);
        const email = decoded.email;

        const account = await Account.findOne({ where: { email } });

        // Check if account exists
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Check if verification code is valid
        if (account.verificationCode !== verificationCode || Date.now() > account.verificationCodeExpires) {
            // If time is expired, clear verification code and expiration time
            if (Date.now() > account.verificationCodeExpires) {
                account.verificationCode = null;
                account.verificationCodeExpires = null;
                await account.save();
                return res.status(400).json({ message: "Verification code has expired" });
            }
            return res.status(400).json({ message: "Invalid verification code" });
        }
        return res.status(200).json({ message: "Verification code is valid" });
    }
    catch (err) {
        console.log(err);
        if (err.errors) {
            return res.status(400).json({ message: err.errors[0] });
        }
        else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

// Reset password
const resetPassword = async (req, res) => {
    let validationSchema = yup.object({
        resetToken: yup.string().required(),
        newPassword: yup.string().trim().min(8).max(50).required()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
        "password must have a mix of lower and uppercase letters and at least 1 number")
    });
    try {
        // Validate request body
        await validationSchema.validate(req.body);
        const { resetToken, newPassword } = req.body;

        // Verify and decode the reset token
        const decoded = jwt.verify(resetToken, process.env.APP_SECRET);
        const email = decoded.email;

        // Find account by email
        const account = await Account.findOne({ where: { email } });

        // Check if account exists
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Check if password is the same as the previous password
        const isSamePassword = await bcrypt.compare(newPassword, account.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "Please enter a new password" });
        }

        // Check if the verification code has expired
        if (Date.now() > account.verificationCodeExpires) {
            // Clear verification code and expiration time
            account.verificationCode = null;
            account.verificationCodeExpires = null;
            await account.save();
            return res.status(400).json({ message: "Verification code has expired" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        account.password = hashedPassword;

        // Clear verification code and expiration time
        account.verificationCode = null;
        account.verificationCodeExpires = null;

        await account.save();

        return res.status(200).json({ message: "Password updated" });
    }
    catch (err) {
        console.log(err);
        if (err.errors) {
            return res.status(400).json({ message: err.errors[0] });
        }
        else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

// Reset Password for staff accounts
const sendVerificationCodeStaff = async (req, res) => {
    let validationSchema = yup.object({
            email: yup.string().email().required()
        });
    try {
        // Validate request body
        await validationSchema.validate(req.body);

        const { email } = req.body;
        const account = await StaffAccount.findOne({ where: { email } });

        // Check if account exists
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Generate a verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code

        // Save verification code and expiration time
        account.verificationCode = verificationCode;
        account.verificationCodeExpires = Date.now() + 600000; // 10 minutes

        await account.save();

        // Configure the email transport to Send email 
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EcoHaven: Password Reset',
            text: `Your verification code is ${verificationCode}`
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        // create a reset token
        const resetToken = jwt.sign({ email, verificationCode }, process.env.APP_SECRET, { expiresIn: '10m' });
        // store the reset token in the local storage
        res.json({ 
            resetTokenStaff: resetToken,
            message: "Verification code sent"
        });
    }
    catch (err) {
        console.log(err);
        if (err.errors) {
            return res.status(400).json({ message: err.errors[0] });
        }
        else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

const verifyCodeStaff = async (req, res) => {
    const validationSchema = yup.object({
      verificationCode: yup.string().required(),
      resetTokenStaff: yup.string().required() // Add resetToken to validation schema
    });

    try {
        // Validate request body
        await validationSchema.validate(req.body);
        const { verificationCode, resetTokenStaff } = req.body;

        // Verify and decode the reset token
        const decoded = jwt.verify(resetTokenStaff, process.env.APP_SECRET);
        const email = decoded.email;

        const account = await StaffAccount.findOne({ where: { email } });

        // Check if account exists
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Check if verification code is valid
        if (account.verificationCode !== verificationCode || Date.now() > account.verificationCodeExpires) {
            // If time is expired, clear verification code and expiration time
            if (Date.now() > account.verificationCodeExpires) {
                account.verificationCode = null;
                account.verificationCodeExpires = null;
                await account.save();
                return res.status(400).json({ message: "Verification code has expired" });
            }
            return res.status(400).json({ message: "Invalid verification code" });
        }
        return res.status(200).json({ message: "Verification code is valid" });
    }
    catch (err) {
        console.log(err);
        if (err.errors) {
            return res.status(400).json({ message: err.errors[0] });
        }
        else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

const resetPasswordStaff = async (req, res) => {
    let validationSchema = yup.object({
        resetTokenStaff: yup.string().required(),
        newPassword: yup.string().trim().min(8).max(50).required()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
        "password must have a mix of lower and uppercase letters and at least 1 number")
    });
    try {
        // Validate request body
        await validationSchema.validate(req.body);
        const { resetTokenStaff, newPassword } = req.body;

        // Verify and decode the reset token
        const decoded = jwt.verify(resetTokenStaff, process.env.APP_SECRET);
        const email = decoded.email;

        // Find account by email
        const account = await StaffAccount.findOne({ where: { email } });

        // Check if account exists
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Check if password is the same as the previous password
        const isSamePassword = await bcrypt.compare(newPassword, account.password);
        if (isSamePassword) {
            return res.status(400).json({ message: "Please enter a new password" });
        }

        // Check if the verification code has expired
        if (Date.now() > account.verificationCodeExpires) {
            // Clear verification code and expiration time
            account.verificationCode = null;
            account.verificationCodeExpires = null;
            await account.save();
            return res.status(400).json({ message: "Verification code has expired" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        account.password = hashedPassword;

        // Clear verification code and expiration time
        account.verificationCode = null;
        account.verificationCodeExpires = null;

        await account.save();

        return res.status(200).json({ message: "Password updated" });
    }
    catch (err) {
        console.log(err);
        if (err.errors) {
            return res.status(400).json({ message: err.errors[0] });
        }
        else {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = { sendVerificationCode, verifyCode, resetPassword,
    sendVerificationCodeStaff, verifyCodeStaff, resetPasswordStaff
 };
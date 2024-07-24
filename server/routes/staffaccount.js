const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { StaffAccount } = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
require('dotenv').config();
const { validateToken, checkRole } = require('../middlewares/auth');

router.post('/create_new_account', async (req, res) => {
    let data = req.body;
    const allowedRoles = ['Admin']; // define allowed roles

    // Validate request body
    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z ]+$/,
            "name only allows letters and spaces"),
        phone_no: yup.string().trim().min(8, "phone number must be 8 digits long").max(8, "phone number must be 8 digits long").required("phone number is a required field")
            .matches(/^\d+$/, "phone number must only contain numbers"), // only allow numbers
        email: yup.string().trim().email("Invalid email").required(),
        birthdate: yup.date("Invalid Birthdate").required("birthdate is a required field")
            .max(new Date(), "Birthdate cannot be in the future") // Check if birthdate is in the future
            .test('age', 'Staff must be at least 18 years old', function (value) { // Check if age is at least 18
                const today = new Date();
                const birthDate = new Date(value);
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDifference = today.getMonth() - birthDate.getMonth();
                const dayDifference = today.getDate() - birthDate.getDate();
                if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
                    return age - 1 >= 18;
                }
                return age >= 18;
            }),
        role: yup.string().trim().required()
            .oneOf(allowedRoles, "Role must be one of the allowed values"),
        password: yup.string().trim().min(8).max(50).required()
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
            "password must have a mix of lower and uppercase letters and at least 1 number")
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });

        // Check if email exists in the database
        let staffAccount = await StaffAccount.findOne({ where: { email: data.email } });
        if (staffAccount) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Process valid data
        // Hash password
        data.password = await bcrypt.hash(data.password, 10);
        // Create Account
        let result = await StaffAccount.create(data);
        let newStaffAccount = {
            id: result.id,
            name: result.name,
            phone_no: result.phone_no,
            email: result.email,
            birthdate: result.birthdate,
            role: result.role,
            password: result.password,
            status: 'Active'
        };
        res.json({
            account: newStaffAccount,
            message: `Account ${result.email} was created successfully.`
        });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

router.post('/login', async (req, res) => {
    let data = req.body;

    // Validate request body
    let validationSchema = yup.object({
        email: yup.string().trim().email("Invalid email").required("This is a required field"),
        password: yup.string().trim().required("This is a required field")
    });

    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        let errorMsg = "Email or Password is incorrect.";

        // Check if email exists in the database
        let staffAccount = await StaffAccount.findOne({ where: { email: data.email } });
        if (!staffAccount) {
            return res.status(404).json({ message: errorMsg });
        }
        // Check if password is correct
        let isPasswordValid = await bcrypt.compare(data.password, staffAccount.password);
        if (!isPasswordValid) {
            return res.status(404).json({ message: errorMsg });
        }

        // Return user info
        let staffInfo = {
            id: staffAccount.id,
            name: staffAccount.name,
            email: staffAccount.email,
            phone_no: staffAccount.phone_no,
            birthdate: staffAccount.birthdate,
            role: staffAccount.role,
            status: staffAccount.status
        };
        // Create token
        let accessToken = sign(staffInfo, process.env.APP_SECRET, { expiresIn: '1h' });
        // Send response with token and user info
        res.json({ 
            accessToken: accessToken,
            account: staffInfo,
            message: `Email ${staffInfo.email} was logged in successfully.`
        });
    }
    catch (err) {
        console.log("Validation or other error:", err); // Debugging
        res.status(400).json({ errors: err.errors });
    }
});

router.get ('/auth', validateToken, checkRole(['Admin']), async (req, res) => { // Validate token
    try {
        let staffInfo = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            phone_no: req.user.phone_no,
            birthdate: req.user.birthdate,
            role: req.user.role,
            status: req.user.status
        };
        res.json({ user: staffInfo }); // Send user info
    } catch (err) {
        res.status(400).json({ message: "Error validating token" });
    }
});

router.post('/logout', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        req.user = null; // Invalidate token
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(400).json({ message: "Error logging out" });
    }
});

router.get('/get_accounts', validateToken, checkRole(['Admin']),  async (req, res) => {
    try {
        let staffAccounts = await StaffAccount.findAll();
        res.json({ accounts: staffAccounts });
    } catch (err) {
        res.status(400).json({ message: "Error fetching accounts" });
    }
});

router.get('/get_account', validateToken, checkRole(['Admin']),  async (req, res) => {
    try {
        // Access account ID from the decoded token data
        const accountId = req.user.id;

        // Fetch account details from the database using the account ID
        let staffAccount = await StaffAccount.findByPk(accountId);
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.json({ account: staffAccount });
    } catch (err) {
        res.status(400).json({ message: "Error fetching account" });
    }
});

router.put('/update_account/:id', validateToken, checkRole(['Admin']),  async (req, res) => {
    let data = req.body;
    const allowedRoles = ['Admin']; // define allowed roles

    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z ]+$/,
            "name only allows letters and spaces"),
        phone_no: yup.string().trim().min(8, "phone number must be 8 digits long").max(8, "phone number must be 8 digits long").required("phone number is a required field")
            .matches(/^\d+$/, "phone number must only contain numbers"), // only allow numbers
        email: yup.string().trim().email("Invalid email").required(),
        birthdate: yup.date("Invalid Birthdate").required("birthdate is a required field")
            .max(new Date(), "Birthdate cannot be in the future") // Check if birthdate is in the future
            .test('age', 'Staff must be at least 18 years old', function (value) { // Check if age is at least 18
                const today = new Date();
                const birthDate = new Date(value);
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDifference = today.getMonth() - birthDate.getMonth();
                const dayDifference = today.getDate() - birthDate.getDate();
                if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
                    return age - 1 >= 18;
                }
                return age >= 18;
            }),
        role: yup.string().trim().required()
            .oneOf(allowedRoles, "Role must be one of the allowed values"),
        password: yup.string().trim().min(8).max(50).required()
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
            "password must have a mix of lower and uppercase letters and at least 1 number")
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });

        let staffAccount = await StaffAccount.findByPk(req.params.id);
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        // Check if email exists in the database
        let existingStaffAccount = await StaffAccount.findOne({ where: { email: data.email } });
        if (existingStaffAccount && existingStaffAccount.id !== staffAccount.id) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Process valid data
        // Hash password
        data.password = await bcrypt.hash(data.password, 10);
        // Update Account
        let result = await staffAccount.update(data);
        let updatedStaffAccount = {
            id: result.id,
            name: result.name,
            phone_no: result.phone_no,
            email: result.email,
            birthdate: result.birthdate,
            role: result.role,
            password: result.password,
            status: result.status
        };
        res.json({
            account: updatedStaffAccount,
            message: `Account ${result.email} was updated successfully.`
        });
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});


module.exports = router;
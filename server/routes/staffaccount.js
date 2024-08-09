const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { StaffAccount } = require('../models');
const { Account } = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
require('dotenv').config();
const { validateToken, checkRole } = require('../middlewares/auth');

router.post('/create_new_account', async (req, res) => {
    let data = req.body;
    const allowedRoles = ['Admin', 'Staff']; // define allowed roles

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
            .test('age', 'Age must be between 18 and 100', (value) => { // Check if age is between 18 and 100
                let birthdate = new Date(value);
                let age = new Date().getFullYear() - birthdate.getFullYear();
                return age >= 18 && age < 100;
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
            return res.status(400).json({ message: "Email already exists." });
        }
        // Check if phone number exists in the database
        let staffAccountWithPhoneNo = await StaffAccount.findOne({ where: { phone_no: data.phone_no } });
        if (staffAccountWithPhoneNo) {
            return res.status(400).json({ message: "Phone number already exists." });
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
            last_login: null,
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
        
        // Check status of account
        if (staffAccount.status !== 'Active') {
            return res.status(404).json({ message: "Your account has been deactivated. Please contact the administrator for support." });
        }

        // Check if password is correct
        let isPasswordValid = await bcrypt.compare(data.password, staffAccount.password);
        if (!isPasswordValid) {
            return res.status(404).json({ message: errorMsg });
        }

        // Update last login time
        staffAccount.last_login = new Date();
        await staffAccount.save();

        // Return user info
        let staffInfo = {
            id: staffAccount.id,
            name: staffAccount.name,
            email: staffAccount.email,
            phone_no: staffAccount.phone_no,
            birthdate: staffAccount.birthdate,
            role: staffAccount.role,
            last_login: staffAccount.last_login,
            status: staffAccount.status
        };
        // Create token
        let accessToken = sign(staffInfo, process.env.APP_SECRET, { expiresIn: '12h' });
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

router.get('/auth', validateToken, checkRole(['Admin', 'Staff']), async (req, res) => { // Validate token
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

router.post('/logout', validateToken, checkRole(['Admin', 'Staff']), async (req, res) => {
    try {
        req.user = null; // Invalidate token
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(400).json({ message: "Error logging out" });
    }
});

router.get('/get_account', validateToken, checkRole(['Admin', 'Staff']),  async (req, res) => {
    try {
        // Access account ID from the decoded token data
        const accountId = req.user.id;

        // Fetch account details from the database using the account ID
        let staffAccount = await StaffAccount.findByPk(accountId);
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        if (staffAccount.status !== 'Active') {
            return res.status(404).json({ message: "Your account has been deactivated. Please contact the administrator for support." });
        }
        res.json({ account: staffAccount });
    } catch (err) {
        res.status(400).json({ message: "Error fetching account" });
    }
});

// update password
router.put('/update_password/:id', validateToken, checkRole(['Admin', 'Staff']), async (req, res) => {
    let id = req.params.id;
    let validationSchema = yup.object({
        current_password: yup.string().trim().required("This is a required field"),
        new_password: yup.string().trim().min(8).max(50).required("This is a required field")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
        "password must have a mix of lower and uppercase letters and at least 1 number")
    });
    try {
        req.body = await validationSchema.validate(req.body, { abortEarly: false }); // Validate request body
        // Process valid data
        let staffAccount = await StaffAccount.findOne({ where: { id: id } });
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        if (staffAccount.status !== 'Active') {
            return res.status(404).json({ message: "Your account has been deactivated. Please contact the administrator for support." });
        }
        // Check if current password is correct
        let isPasswordValid = await bcrypt.compare(req.body.current_password, staffAccount.password); // Check passwords
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Password is not correct" });
        }
        // Hash new password
        let newPassword = await bcrypt.hash(req.body.new_password, 10);
        // Update password
        await StaffAccount.update({ password: newPassword }, { where: { id: id } });
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }
});



// get all staff accounts (accessible by staff with Admin role)
router.get('/get_staff_accounts', validateToken, checkRole(['Admin']),  async (req, res) => {
    try {
        let staffAccounts = await StaffAccount.findAll();
        res.json({ accounts: staffAccounts });
    } catch (err) {
        res.status(400).json({ message: "Error fetching accounts" });
    }
});

// get staff account (accessible by staff with Admin role)
router.get('/get_staff_account/:id', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let staffAccount = await StaffAccount.findByPk(req.params.id);
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.json({ account: staffAccount });
    } catch (err) {
        res.status(400).json({ message: "Error fetching account" });
    }
});

// update staff account (accessible by staff with Admin role)
router.put('/update_staff_account/:id', validateToken, checkRole(['Admin']),  async (req, res) => {
    let data = req.body;
    const allowedRoles = ['Admin', 'Staff']; // define allowed roles

    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z ]+$/, "name only allows letters and spaces"),
        phone_no: yup.string().trim().min(8, "phone number must be 8 digits long").max(8, "phone number must be 8 digits long").required("phone number is a required field")
            .matches(/^\d+$/, "phone number must only contain numbers"), // only allow numbers
        email: yup.string().trim().lowercase().email().max(50).required(),
        birthdate: yup.date("Invalid Birthdate").required()
            .max(new Date(), "Birthdate cannot be in the future") // Check if birthdate is in the future
            .test('age', 'Age must be between 18 and 100', (value) => { // Check if age is between 18 and 100
                let birthdate = new Date(value);
                let age = new Date().getFullYear() - birthdate.getFullYear();
                return age >= 18 && age < 100;
            }),
        role: yup.string().trim().required()
            .oneOf(allowedRoles, "Role must be one of the allowed values")
    });
    try {
        req.body = await validationSchema.validate(req.body, { abortEarly: false }); // Validate request body

        // Process valid data
        // Check if account exists

        let staffAccount = await StaffAccount.findByPk(req.params.id);
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        // check if email exists
        let staffAccountWithEmail = await StaffAccount.findOne({ where: { email: req.body.email } });
        if (staffAccountWithEmail && staffAccountWithEmail.id !== staffAccount.id) {
            return res.status(400).json({ message: "Email already exists." });
        }
        // check if phone number exists
        let staffAccountWithPhoneNo = await StaffAccount.findOne({ where: { phone_no: req.body.phone_no } });
        if (staffAccountWithPhoneNo && staffAccountWithPhoneNo.id !== staffAccount.id) {
            return res.status(400).json({ message: "Phone number already exists." });
        }

        // Update Account
        let data = req.body;
        await StaffAccount.update(data, { where: { id: req.params.id } });
        res.json({ message: `Account ${staffAccount.id} was updated successfully` });
    }
    catch (err) {
        console.error(err); // Log the error to the server console
        res.status(400).json({ errors: err.errors });
    }
});

// delete staff account (accessible by staff with Admin role)
router.delete('/delete_staff_account/:id', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let staffAccount = await StaffAccount.findByPk(req.params.id);
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        await staffAccount.destroy();
        res.json({ message: `Account ${staffAccount.id} was deleted successfully` });
    } catch (err) {
        res.status(400).json({ message: "Error deleting account" });
    }
});


// get all user accounts (accessible by staff with Admin role)
router.get('/get_user_accounts', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let accounts = await Account.findAll();
        res.json({ accounts });
    } catch (err) {
        res.status(400).json({ message: "Error fetching accounts" });
    }
});

// get user account (accessible by staff with Admin role)
router.get('/get_user_account/:id', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let account = await Account.findByPk(req.params.id);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.json({ account });
    } catch (err) {
        res.status(400).json({ message: "Error fetching account" });
    }
});

// update user account (accessible by staff with Admin role)
router.put('/update_user_account/:id', validateToken, checkRole(['Admin']),  async (req, res) => {
    let data = req.body;
    const allowedRoles = ['Admin']; // define allowed roles

    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z ]+$/, "name only allows letters and spaces"),
        username: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z0-9]+$/, "username only allows letters and numbers"),
        phone_no: yup.string().trim().min(8, "phone number must be 8 digits long").max(8, "phone number must be 8 digits long").required("phone number is a required field")
            .matches(/^\d+$/, "phone number must only contain numbers"), // only allow numbers
        email: yup.string().trim().lowercase().email().max(50).required()
    });
    try {
        req.body = await validationSchema.validate(req.body, { abortEarly: false }); // Validate request body
        
        // Process valid data
        // Check if account exists
        let account = await Account.findByPk(req.params.id);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        // check if email or username exists
        let accountWithUsername = await Account.findOne({ where: { username: req.body.username } });
        if (accountWithUsername && accountWithUsername.id !== account.id) {
            return res.status(400).json({ message: "Username already exists." });
        }
        let accountWithEmail = await Account.findOne({ where: { email: req.body.email } });
        if (accountWithEmail && accountWithEmail.id !== account.id) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // Update Account
        let data = req.body;
        await Account.update(data, { where: { id: req.params.id } });
        res.json({ message: `Account ${account.id} was updated successfully` });
    }
    catch (err) {
        console.error(err); // Log the error to the server console
        res.status(400).json({ errors: err.errors });
    }
});

// delete user account (accessible by staff with Admin role)
router.delete('/delete_user_account/:id', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let account = await Account.findByPk(req.params.id);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        await account.destroy();
        res.json({ message: `Account ${account.id} was deleted successfully` });
    } catch (err) {
        res.status(400).json({ message: "Error deleting account" });
    }
});


// make user account inactive (accessible by staff with Admin role)
router.put('/deactivate_user_account/:id', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let account = await Account.findByPk(req.params.id);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        await Account.update({ status: 'Inactive' }, { where: { id: req.params.id } });
        res.json({ message: `Account ${account.id} was deactivated successfully` });
    } catch (err) {
        res.status(400).json({ message: "Error deactivating account" });
    }
});

// make user account active (accessible by staff with Admin role)
router.put('/activate_user_account/:id', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let account = await Account.findByPk(req.params.id);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        await Account.update({ status: 'Active' }, { where: { id: req.params.id } });
        res.json({ message: `Account ${account.id} was activated successfully` });
    } catch (err) {
        res.status(400).json({ message: "Error activating account" });
    }
});

// make staff account inactive (accessible by staff with Admin role)
router.put('/deactivate_staff_account/:id', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let staffAccount = await StaffAccount.findByPk(req.params.id);
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        await StaffAccount.update({ status: 'Inactive' }, { where: { id: req.params.id } });
        res.json({ message: `Account ${staffAccount.id} was deactivated successfully` });
    } catch (err) {
        res.status(400).json({ message: "Error deactivating account" });
    }
});

// make staff account active (accessible by staff with Admin role)
router.put('/activate_staff_account/:id', validateToken, checkRole(['Admin']), async (req, res) => {
    try {
        let staffAccount = await StaffAccount.findByPk(req.params.id);
        if (!staffAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        await StaffAccount.update({ status: 'Active' }, { where: { id: req.params.id } });
        res.json({ message: `Account ${staffAccount.id} was activated successfully` });
    } catch (err) {
        res.status(400).json({ message: "Error activating account" });
    }
});


module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Account } = require('../models');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
require('dotenv').config();
const { validateToken } = require('../middlewares/auth');
const fs = require('fs');
const path = require('path');



router.post("/register", async (req, res) => {
    let data = req.body;
    console.log(data); // Debugging
    
    // Validate request body
    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z ]+$/,
            "name only allows letters and spaces"),
        username: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z0-9]+$/, "username only allows letters and numbers"),
        phone_no: yup.string().trim().min(8, "phone number must be 8 digits long").max(8, "phone number must be 8 digits long").required("phone number is a required field")
            .matches(/^\d+$/, "phone number must only contain numbers"), // only allow numbers
        email: yup.string().trim().lowercase().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required()
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
            "password must have a mix of lower and uppercase letters and at least 1 number")

    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        
        // Check email and username
        let emailExists = await Account.findOne({ where: { email: data.email } });
        let usernameExists = await Account.findOne({ where: { username: data.username } });
      
        if (emailExists || usernameExists) {
            if (emailExists) {
                res.status(400).json({ message: "Email already exists." });
            } 
            else {
                res.status(400).json({ message: "Username already exists." });
            }
            return;
        }

        // Process valid data
        // Hash password
        data.password = await bcrypt.hash(data.password, 10);
        // Create Account
        let result = await Account.create(data);
        let userInfo = {
            id: result.id,
            name: result.name,
            username: result.username,
            email: result.email,
            phone_no: result.phone_no,
            profile_pic: result.profile_pic
        };
        let accessToken = sign(userInfo, process.env.APP_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRES_IN });
        res.json({
            accessToken: accessToken,
            account: userInfo,
            message: `Email ${result.email} was registered successfully.`
        });
        
    } catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

router.post("/login", async (req, res) => {
    let data = req.body;

    // Validate request body
    let validationSchema = yup.object({
        usernameoremail: yup.string().trim().required("This is a required field"), // Allow email or username
        password: yup.string().trim().required("This is a required field")
    });

    try {
        data = await validationSchema.validate(data, { abortEarly: false });

        // Check if identifier is an email or username
        let isEmail = /^\S+@\S+$/.test(data.usernameoremail); // Check if identifier is email
        let query = isEmail? { email: data.usernameoremail } : { username: data.usernameoremail }; // Check if identifier is username

        // Check email/username and password
        let errorMsg = "Email or Username or Password is not correct.";

        // Check email/username and password
        let account = await Account.findOne({ where: query }); // Check email or username
        if (!account) {
            res.status(400).json({ message: errorMsg });
            return;
        }
        let match = await bcrypt.compare(data.password, account.password); // Check password
        if (!match) {
            res.status(400).json({ message: errorMsg });
            return;
        }

        // Return user info
        let userInfo = {
            id: account.id,
            name: account.name,
            username: account.username,
            email: account.email,
            phone_no: account.phone_no,
            profile_pic: account.profile_pic
        };
        let accessToken = sign(userInfo, process.env.APP_SECRET, // Create token
            { expiresIn: process.env.TOKEN_EXPIRES_IN });
        res.json({ // Send response with token and user info
            accessToken: accessToken,
            account: userInfo,
            message: `Email ${userInfo.email} was logged in successfully.`
        });
    } catch (err) {
        console.log("Validation or other error:", err); // Debugging
        res.status(400).json({ errors: err.errors });
    }
});

router.get("/auth", validateToken, (req, res) => { // Validate token
    let userInfo = {
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        phone_no: req.user.phone_no,
        profile_pic: req.user.profile_pic
    };
    res.json({
        user: userInfo
    });
});

// Logout
router.post("/logout", validateToken, async (req, res) => { // Logout
    try {
      req.user = null; // Invalidate token
      res.json({ message: "Logged out successfully" });
    } catch (err) {
      res.status(400).json({ message: "Error logging out" });
    }
});

router.get("/:username", async (req, res) => {
    let username = req.params.username;
    console.log(username); // Debugging
    let account = await Account.findOne({ where: { username: username } });
    console.log(account); // Debugging
    if (account) {
        let userInfo = {
            id: account.id,
            name: account.name,
            username: account.username,
            email: account.email,
            phone_no: account.phone_no,
            profile_pic: account.profile_pic
        };
        res.json({
            user: userInfo
        });
    } else {
        res.status(400).json({ message: "User not found" });
    }
});

// update account
router.put("/:username", async (req, res) => {
    let username = req.params.username;
    // Validate request body
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
        
        // Check if account exists
        let account = await Account.findOne({ where: { username: username } });
        if (!account) {
            res.status(400).json({ message: "Account not found" });
            return;
        }
        // check if email or username exists
        let emailExists = await Account.findOne({ where: { email: req.body.email } });
        let usernameExists = await Account.findOne({ where: { username: req.body.username } });
        if (emailExists && emailExists.username !== username) {
            res.status(400).json({ message: "Email already exists." });
            return;
        }
        if (usernameExists && usernameExists.username !== username) {
            res.status(400).json({ message: "Username already exists." });
            return;
        }

        // Update account
        let data = req.body;
        await Account.update(data, { where: { username: username } });
        res.json({ message: "Account updated successfully" });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }
});

// update password
router.put("/:username/password", async (req, res) => {
    let username = req.params.username;
    // Validate request body
    let validationSchema = yup.object({
        current_password: yup.string().trim().required("This is a required field"),
        new_password: yup.string().trim().min(8).max(50).required("This is a required field")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/,
        "password must have a mix of lower and uppercase letters and at least 1 number")
    });
    try {
        req.body = await validationSchema.validate(req.body, { abortEarly: false }); // Validate request body
        // check if old password matches
        let account = await Account.findOne({ where: { username: username } });
        if (!account) {
            res.status(400).json({ message: "Account not found" });
            return;
        }
        
        let match = await bcrypt.compare(req.body.current_password, account.password); // Check password
        if (!match) {
            res.status(400).json({ message: "Password is not correct" });
            return;
        }
        // Update password
        let new_password = await bcrypt.hash(req.body.new_password, 10);
        await Account.update({ password: new_password }, { where: { username: username } });
        res.json({ message: "Password updated successfully." });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }
});

// delete profile pic in server before deleting account
async function deleteProfilePic(userId) {
    try {
        const user = await Account.findOne({ where: { id: userId } });
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return;
        }
        const oldProfilePic = user.profile_pic;
        if (oldProfilePic) {
            const oldProfilePicPath = path.join(__dirname, '../public/uploads/', oldProfilePic);
            fs.unlink(oldProfilePicPath, (err) => {
                if (err) {
                    console.error(`Error deleting profile picture ${oldProfilePic}: ${err}`);
                } else {
                    console.log(`Profile picture ${oldProfilePic} deleted successfully`);
                }
            });
            await Account.update({ profile_pic: null }, { where: { id: userId } });
        }
    } catch (err) {
        console.error(`Error deleting profile picture: ${err}`);
    }
}
// delete account
router.delete("/:username", async (req, res) => {
    let username = req.params.username;
    // Validate request body
    let validationSchema = yup.object({
        password: yup.string().trim().required("This is a required field")
    });
    try {
        req.body = await validationSchema.validate(req.body, { abortEarly: false }); // Validate request body
        // check if password matches and delete account
        let account = await Account.findOne({ where: { username: username } });
        if (!account) {
            res.status(400).json({ message: "Account not found" });
            return;
        }
        let match = await bcrypt.compare(req.body.password, account.password); // Check password
        if (!match) {
            res.status(400).json({ message: "Password is not correct" });
            return;
        }
        await deleteProfilePic(account.id); // Delete profile picture

        await Account.destroy({ where: { username: username } }); // Delete account
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }
});

module.exports = router;
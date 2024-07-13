// const express = require('express');
// const router = express.Router();
// const { Account } = require('../models');
// require('dotenv').config();

// router.put('/account/suspend/:id', async (req, res) => {
//     const { id } = req.params.id;
//     try {
//         const account = await Account.findOneByPk(id);
//         if (!account) {
//             return res.status(404).json({ message: "Account not found" });
//         }
//         account.status = 'Inactive';
//         await account.save();
//         return res.json({ message: "Account suspended successfully" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "An error occurred" });
//     }
// });

// router.put('/account/activate/:id', async (req, res) => {
//     const { id } = req.params.id;
//     try {
//         const account = await Account.findOneByPk(id);
//         if (!account) {
//             return res.status(404).json({ message: "Account not found" });
//         }
//         account.status = 'Active';
//         await account.save();
//         return res.json({ message: "Account activated successfully" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "An error occurred" });
//     }
// });
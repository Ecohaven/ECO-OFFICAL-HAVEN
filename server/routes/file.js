const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { Account } = require('../models');
const fs = require('fs');
const path = require('path');

router.post('/upload_profile_pic', validateToken, (req, res) => { 
    upload(req, res, (err) => {
        if (err) {
            res.status(400).json(err);
        }
        else if (req.file == undefined) {
            res.status(400).json({ message: "No file uploaded" });
        }
        else {
            Account.findOne({ where: { id: req.user.id } }) // get the user by id
            .then((user) => {
                const oldProfilePic = user.profile_pic; // Get the old profile pic from the database
                // update user profile pic in database
                return { oldProfilePic, updatePromise: Account.update({ profile_pic: req.file.filename }, {
                    where: { id: req.user.id }
                }) };
            })
            .then(({ oldProfilePic, updatePromise }) => {
                // check if user has already a profile pic
                return updatePromise.then(() => {
                    // check if user has already a profile pic
                    if (oldProfilePic!== null) {
                        // Delete the old profile pic from the server
                        const oldProfilePicPath = path.join(__dirname, '../public/uploads/', oldProfilePic);
                        fs.unlink(oldProfilePicPath, (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    }
                    res.json({ filename: req.file.filename, message: "Profile pic updated successfully" });
                });
            })
            .catch((err) => {
                console.error(err);
                res.status(400).json({ message: "An error occurred" });
            });
        }
    })
});

router.delete('/delete_profile_pic', validateToken, (req, res) => {
    Account.findOne({ where: { id: req.user.id } }) // get the user by id
    .then((user) => {
        const oldProfilePic = user.profile_pic; // Get the old profile pic from the database
        // update user profile pic in database
        return { oldProfilePic, updatePromise: Account.update({ profile_pic: null }, {
            where: { id: req.user.id }
        }) };
    })
    .then(({ oldProfilePic, updatePromise }) => {
        return updatePromise.then(() => {
            // check if user has already a profile pic
            if (oldProfilePic!== null) {
                // Delete the old profile pic from the server
                const oldProfilePicPath = path.join(__dirname, '../public/uploads/', oldProfilePic);
                fs.unlink(oldProfilePicPath, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            res.json({ message: "Profile pic deleted successfully" });
        });
    })
    .catch((err) => {
        console.error(err);
        res.status(400).json({ message: "An error occurred" });
    });
});

module.exports = router;
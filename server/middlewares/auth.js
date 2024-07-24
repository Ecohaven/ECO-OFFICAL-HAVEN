const { verify } = require('jsonwebtoken');
require('dotenv').config();

const validateToken = (req, res, next) => {
    try {
        const accessToken = req.header("Authorization").split(" ")[1]; // Get token from header
        if (!accessToken) {
            return res.sendStatus(401); // unauthorized if no token
        }
        const payload = verify(accessToken, process.env.APP_SECRET); // Verify token
        req.user = payload; // Save user info to req.user
        return next(); // Next middleware
    }
    catch (err) {
        return res.sendStatus(401);
    }
}

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log("No user found in request");
            return res.sendStatus(401); // unauthorized if no user
        }
        if (!roles.includes(req.user.role)) {
            console.log(`User role ${req.user.role} is not authorized`);
            return res.sendStatus(401); // unauthorized if role does not match
        }
        return next(); // Next middleware
    }
}

module.exports = { validateToken, checkRole };
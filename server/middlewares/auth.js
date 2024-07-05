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

module.exports = { validateToken };
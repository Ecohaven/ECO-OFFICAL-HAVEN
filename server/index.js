const cors = require('cors'); // import cors
require('dotenv').config(); // read environment variable from .env file
const express = require('express'); // import express
const app = express(); // initialize express
const db = require('./models'); // import models

app.use(express.json()); // enable json request body

app.use(express.urlencoded({ extended: false })); // enable x-www-form-urlencoded request body
app.use(express.static('public')); // serve public folder as static

app.use(cors({
    origin: process.env.CLIENT_URL
}));

// Simple Route
app.get("/", (req, res) => {
res.send("Welcome to the learning space."); // Change to Homepage response
});

// Sync Models with Database
db.sequelize.sync({alter: true}).then(() => {
    let port = process.env.APP_PORT;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
})
.catch((err) => {
    console.log('Error starting server: ', err);
});


// Account Routes
const accountRoute = require('./routes/account');
app.use("/account", accountRoute);

//Account file route 
const fileRoute = require('./routes/file');
app.use("/file", fileRoute);

// item upload image route
const ecoRoute = require('./routes/eco');
app.use("/eco", ecoRoute);

// Collection route
const collectionRoute = require('./routes/collection');
app.use("/collect", collectionRoute);
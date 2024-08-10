const cors = require('cors'); // import cors
require('dotenv').config(); // read environment variable from .env file
const express = require('express'); // import express
const app = express(); // initialize express
const db = require('./models'); // import models
const mockpayment = require('./routes/mockpayment'); // simulate mockpayment

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

// Staff Account Routes
const staffAccountRoute = require('./routes/staffaccount');
app.use("/staff", staffAccountRoute);

// Reset Password Routes
const resetPasswordRoute = require('./routes/reset_password');
app.use("/reset_password", resetPasswordRoute);

//Account file route 
const fileRoute = require('./routes/file');
app.use("/file", fileRoute);

// item upload route
const ecoRoute = require('./routes/eco');
app.use("/eco", ecoRoute);

// Collection route
const collectionRoute = require('./routes/collection');
app.use("/collect", collectionRoute);


//Volunteer form
const volunteerRoute = require('./routes/volunteer');
app.use("/volunteer", volunteerRoute);

//events route
const eventsRoute = require('./routes/event');
app.use("/api/", eventsRoute);

const bookingsRoute = require('./routes/Booking');
app.use("/api/bookings", bookingsRoute);


//Booking summary route - display of 3 boxes 
const bookingSummaryRouter = require('./routes/summary');
app.use('/api/booking-summary', bookingSummaryRouter);

//Check in routes (QrCodeText & QrcodePicture)
const checkInRoutes = require('./routes/checkin');
app.use('/checkin',checkInRoutes);

//search for search in backend bookings
const SearchRoutes = require('./routes/search');
app.use('/search', SearchRoutes);


//Dashboard - Dashboard displays of informations:
const dashboardRoutes = require('./routes/dashboard');
app.use('/dash/', dashboardRoutes);

// Sending mail API 
const mailerRoutes = require('./routes/mailer');
app.use('/send-email', mailerRoutes);

 //Filter Route
const FilterRoutes = require('./routes/Filter');
app.use('/api/', FilterRoutes);

//Payment 
const paymentRoutes = require('./routes/payment');
app.use('/pay/', paymentRoutes);

//refund
const refundRoutes = require('./routes/refund');
app.use('/refund/', refundRoutes);

//review 
const ReviewRoutes = require('./routes/review');
app.use('/review', ReviewRoutes);

//faq
const faqRoutes = require('./routes/faq');
app.use('/api/faqs', faqRoutes);

// subscribe
const subscribeRoute = require('./routes/subscribe');
app.use('/subscribe', subscribeRoute);
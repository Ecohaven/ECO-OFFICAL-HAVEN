const cors = require('cors');
require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models');
const mockpayment = require('./routes/mockpayment');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(cors({
    origin: process.env.CLIENT_URL
}));

// Simple Route
app.get("/", (req, res) => {
    res.send("Welcome to the learning space.");
});

// Sync Models (do not start server manually)
db.sequelize.sync({ alter: true })
  .then(() => console.log("Database synced"))
  .catch((err) => console.log('Error syncing database: ', err));

// Routes
const accountRoute = require('./routes/account');
app.use("/api/account", accountRoute);

const staffAccountRoute = require('./routes/staffaccount');
app.use("/api/staff", staffAccountRoute);

const resetPasswordRoute = require('./routes/reset_password');
app.use("/api/reset_password", resetPasswordRoute);

const fileRoute = require('./routes/file');
app.use("/api/file", fileRoute);

const ecoRoute = require('./routes/eco');
app.use("/api/eco", ecoRoute);

const collectionRoute = require('./routes/collection');
app.use("/api/collect", collectionRoute);

const volunteerRoute = require('./routes/volunteer');
app.use("/api/volunteer", volunteerRoute);

const eventsRoute = require('./routes/event');
app.use("/api/events", eventsRoute);

const bookingsRoute = require('./routes/Booking');
app.use("/api/bookings", bookingsRoute);

const bookingSummaryRouter = require('./routes/summary');
app.use('/api/booking-summary', bookingSummaryRouter);

const checkInRoutes = require('./routes/checkin');
app.use('/api/checkin', checkInRoutes);

const SearchRoutes = require('./routes/search');
app.use('/api/search', SearchRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dash', dashboardRoutes);

const mailerRoutes = require('./routes/mailer');
app.use('/api/send-email', mailerRoutes);

const FilterRoutes = require('./routes/Filter');
app.use('/api/filter', FilterRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/pay', paymentRoutes);

const refundRoutes = require('./routes/refund');
app.use('/api/refund', refundRoutes);

const ReviewRoutes = require('./routes/review');
app.use('/api/review', ReviewRoutes);

const faqRoutes = require('./routes/faq');
app.use('/api/faqs', faqRoutes);

const subscribeRoute = require('./routes/subscribe');
app.use('/api/subscribe', subscribeRoute);

// Export app for Vercel
module.exports = app;

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./models');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for your frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*', // allow your frontend
  })
);

// Simple root route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the EcoHaven backend!');
});

// Import routes
const accountRoute = require('./routes/account');
app.use('/api/account', accountRoute);

const bookingsRoute = require('./routes/Booking');
app.use('/api/bookings', bookingsRoute);

const bookingSummaryRouter = require('./routes/summary');
app.use('/api/booking-summary', bookingSummaryRouter);

const eventsRoute = require('./routes/event');
app.use('/api/events', eventsRoute);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dash', dashboardRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/pay', paymentRoutes);

const refundRoutes = require('./routes/refund');
app.use('/api/refund', refundRoutes);

// Add other routes as needed, all under /api/ prefix
// Example: volunteer, search, file, review, faq, subscribe, etc.
app.use('/api/volunteer', require('./routes/volunteer'));
app.use('/api/search', require('./routes/search'));
app.use('/api/file', require('./routes/file'));
app.use('/api/review', require('./routes/review'));
app.use('/api/faqs', require('./routes/faq'));
app.use('/api/subscribe', require('./routes/subscribe'));

// Export app for Vercel serverless function
module.exports = app;

// If running locally
if (require.main === module) {
  const port = process.env.APP_PORT || 3001;
  db.sequelize.sync({ alter: true }).then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  });
}

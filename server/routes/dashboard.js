const express = require('express');
const router = express.Router();
const { events, Booking, Payment, Account, Volunteer, sequelize } = require('../models');
const { Op } = require("sequelize");

// Total volunteers
router.get('/totalVolunteers', async (req, res) => {
  try {
    const totalVolunteers = await Volunteer.count();
    res.status(200).json({ totalVolunteers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Revenue by day (PostgreSQL version)
router.get("/revenueByDay", async (req, res) => {
  try {
    const dailyRevenue = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'day'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue']
      ],
      where: {
        status: { [Op.ne]: 'Refunded' } // Exclude refunded payments
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    res.json({ dailyRevenue });
  } catch (error) {
    console.error("Error fetching revenue by day", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Account with highest leaf points
router.get('/highestLeafPoints', async (req, res) => {
  try {
    const accounts = await Account.findAll();
    if (!accounts.length) return res.status(404).json({ message: 'No accounts found' });

    const highestLeafPointsAccount = accounts.reduce((max, account) => 
      account.leafPoints > max.leafPoints ? account : max, accounts[0]);

    res.json(highestLeafPointsAccount);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// New sign-ups today
router.get("/newSignUpsToday", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const newSignUpsToday = await Account.findAll({
      where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } }
    });

    res.json({ newSignUpsToday });
  } catch (error) {
    console.error("Error fetching new sign-ups for today", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get event names
// Get event names
router.get("/events", async (req, res) => {
  try {
    const eventList = await events.findAll({
      attributes: ['eventName', 'startDate', 'endDate']
    });

    const formattedEvents = eventList.map(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      return {
        eventName: event.eventName,
        date: startDate.getTime() === endDate.getTime()
          ? startDate.toISOString().split('T')[0] // format as YYYY-MM-DD
          : `${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`
      };
    });

    res.json({ events: formattedEvents });
  } catch (error) {
    console.error("Error fetching events", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Total refunds (use correct enum value)
router.get('/totalRefunds', async (req, res) => {
  try {
    const totalRefunds = await Payment.sum('amount', { where: { status: 'Refunded' } });
    res.json({ totalRefunds });
  } catch (error) {
    console.error('Error fetching total refunds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancelled bookings count
router.get('/cancelledBookingsCount', async (req, res) => {
  try {
    const cancelledBookingsCount = await Booking.count({
      where: { status: 'cancelled' },
      distinct: true,
      col: 'id'
    });

    res.json({ cancelledBookingsCount });
  } catch (error) {
    console.error('Error fetching cancelled bookings count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

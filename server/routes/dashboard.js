const express = require('express');
const router = express.Router();
const { events,Booking,Payment,Account,Reward,Refund,Collection,sequelize } = require('../models');
const { Op } = require("sequelize");



// Get revenue by day
router.get("/revenueByDay", async (req, res) => {
    try {
        const dailyRevenue = await Payment.findAll({
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d'), 'day'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue']
            ],
            group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d')],
            order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d'), 'ASC']]
        });

        res.json({ dailyRevenue });
    } catch (error) {
        console.error("Error fetching revenue by day", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//Get highest customer leaf points 
// Route to get the account with the highest leaf points
router.get('/highestLeafPoints', async (req, res) => {
    try {
        const accounts = await Account.findAll();
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts found' });
        }

        // Find the account with the highest leaf points
        const highestLeafPointsAccount = accounts.reduce((max, account) => 
            account.leafPoints > max.leafPoints ? account : max, accounts[0]);

        res.json(highestLeafPointsAccount);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//Account new sign ups 
router.get("/newSignUpsToday", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const newSignUpsToday = await Account.findAll({
            where: {
                createdAt: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            }
        });

        res.json({ newSignUpsToday });
    } catch (error) {
        console.error("Error fetching new sign-ups for today", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//get event Names 
router.get("/events", async (req, res) => {
    try {
        const eventList = await events.findAll({
            attributes: [
                'eventName',
                'startDate',
                'endDate'
            ]
        });

        const formattedEvents = eventList.map(event => ({
            eventName: event.eventName,
            date: event.startDate === event.endDate 
                ? event.startDate 
                : `${event.startDate} - ${event.endDate}`
        }));

        res.json({ events: formattedEvents });
    } catch (error) {
        console.error("Error fetching events", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to get the total refunds
router.get('/totalRefunds', async (req, res) => {
    try {
        // Sum the amount of payments where the status is 'refunded'
        const totalRefunds = await Payment.sum('amount', { where: { status: 'refunded' } });
        res.json({ totalRefunds });
    } catch (error) {
        console.error('Error fetching total refunds:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Route to count the number of users with canceled bookings
router.get('/cancelledBookingsCount', async (req, res) => {
    try {
        // Count the number of distinct users who have canceled their bookings
        const cancelledBookingsCount = await Booking.count({
            where: {
                status: 'cancelled'  
            },
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
const express = require('express');
const router = express.Router();
const { Booking, events,CheckIn } = require('../models'); // Ensure your model imports are correct
const { Op } = require("sequelize");

// Filter bookings
// Example URL: http://localhost:3001/api/filter?event=eventID&date=2024-07-15&status=Active&eventName=EventName
router.get('/filter', async (req, res) => {
    const { event, date, status, eventName } = req.query;

    let condition = {};

    if (event) {
        condition.eventId = event; 
    }
    if (date) {
        condition.bookingDate = { [Op.gte]: new Date(date) }; // Filter by date using greater than or equal
    }
    if (status) {
        condition.status = status;
    }
    if (eventName) {
        // Filter by exact eventName match
        condition['$eventDetails.eventName$'] = eventName;
    }

    try {
        const bookings = await Booking.findAll({
            where: condition,
            include: {
                model: events, 
                as: 'eventDetails', //  Match the alias defined in the association
                attributes: ['eventName'] 
            }
        });

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found with the specified filters' });
        }

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Server error');
    }
});

// Example URL: http://localhost:3001/api/filter-records?eventName=EventName&date=2024-07-15&eventId=123
// for check in
router.get('/filter-records', async (req, res) => {
    const { eventName, date, qrCodeStatus} = req.query;

    let condition = {};

    if (eventName) {
        condition.eventName = eventName; // Filter by exact eventName match
    }
    if (date) {
        condition.checkInTime = { [Op.gte]: new Date(date) }; // Filter by check-in date using greater than or equal
    }
    if (qrCodeStatus) {
        condition.qrCodeStatus = qrCodeStatus;
    }

    try {
        const checkIns = await CheckIn.findAll({
            where: condition
        });

        res.json({ checkIns });
    } catch (error) {
        console.error('Error fetching check-in records:', error);
        res.status(500).json({ error: 'Failed to fetch check-in records', details: error.message });
    }
});

module.exports = router;

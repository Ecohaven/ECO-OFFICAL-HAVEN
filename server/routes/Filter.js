const express = require('express');
const router = express.Router();
const { Booking, events, CheckIn } = require('../models'); // Ensure your model imports are correct
const { Op } = require("sequelize");

// Filter bookings
// Example URL: http://localhost:3001/api/filter?event=eventID&date=2024-07-15&status=Active&eventName=EventName
router.get('/filter', async (req, res) => {
    const { date, status, numberOfPax, eventName } = req.query;

    // Construct condition object
    let condition = {};

    // Add eventName filter if provided
    if (eventName) {
        condition.eventName = { [Op.like]: `%${eventName}%` }; // Partial match, case-insensitive
    }

    // Add date filter if provided
    if (date) {
        condition.bookingDate = { [Op.gte]: new Date(date) }; // Greater than or equal to provided date
    }

    // Add status filter if provided
    if (status) {
        condition.status = status;
    }

    // Add numberOfPax filter if provided
    if (numberOfPax) {
        condition.numberOfPax = parseInt(numberOfPax, 5); // Ensure it is an integer
    }

    try {
        const bookings = await Booking.findAll({
            where: condition,
            include: {
                model: events, // Ensure this matches the model name
                as: 'eventDetails', // This should match the alias used in your model associations
                attributes: ['eventName'] // Include eventName if needed in response
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

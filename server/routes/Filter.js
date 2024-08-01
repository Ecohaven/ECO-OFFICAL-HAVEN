const express = require('express');
const router = express.Router();
const { Booking, events, CheckIn, ProductDetail } = require('../models'); // Ensure your model imports are correct
const { Op } = require("sequelize");

// Filter bookings
// Example URL: http://localhost:3001/api/filter?event=eventID&date=2024-07-15&status=Active&eventName=EventName
router.get('/filter', async (req, res) => {
    const { date, status, numberOfPax, eventName } = req.query;

    // Construct condition object
    let condition = {};


    if (eventName) {
        condition.eventName = { [Op.like]: `%${eventName}%` }; // Partial match, case-insensitive
    }

    if (status) {
        condition.status = status;
    }


    if (numberOfPax) {
        condition.numberOfPax = parseInt(numberOfPax, 5); // Ensure it is an integer
    }

    try {
        const bookings = await Booking.findAll({
            where: condition,
            include: {
                model: events, 
                as: 'eventDetails', 
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

// Route to filter products
// Example URL: http://localhost:3001/api/filter-products?category=Electronics&itemName=Smartphone
router.get('/filter-products', async (req, res) => {
    const { category, itemName } = req.query;

    try {
        // Construct condition object for products
        let condition = {};
        if (category) {
            condition.category = category; // Filter by exact category match
        }
        if (itemName) {
            condition.itemName = { [Op.like]: `%${itemName}%` }; // Partial match, case-insensitive
        }

        // Fetch products
        const products = await ProductDetail.findAll({
            where: condition
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
});

// Route to filter events
// Example URL: http://localhost:3001/api/filter-events?eventName=EventName
router.get('/filter-events', async (req, res) => {
    const { eventName } = req.query;

    try {
        // Construct condition object for events
        let condition = {};
        if (eventName) {
            condition.eventName = { [Op.like]: `%${eventName}%` }; // Partial match, case-insensitive
        }

        // Fetch events
        const eventsData = await events.findAll({
            where: condition
        });

        res.json(eventsData);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events', details: error.message });
    }
});
module.exports = router;

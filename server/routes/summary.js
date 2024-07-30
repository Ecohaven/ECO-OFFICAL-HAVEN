const express = require('express');
const router = express.Router();
const { Booking,Payment,Event,Volunteer } = require('../models');
const yup = require('yup');
const { Op } = require("sequelize");


// GET route to fetch new bookings today
router.get("/new-bookings-today", async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const newBookingsToday = await Booking.count({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });
    res.json({ newBookingsToday });
  } catch (error) {
    console.error("Error fetching new bookings today:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//for dashboard , tbc 
router.get('/newestBooking', async (req, res) => {
    try {
        // Fetch the latest booking across all events
        const newestBooking = await Booking.findOne({
            order: [['bookingDate', 'DESC']] // Assuming you have a field named 'bookingDate'
        });
        
        if (!newestBooking) {
            return res.status(404).json({ error: "No bookings found." });
        }
        
        res.json(newestBooking);
    } catch (error) {
        console.error("Error fetching the newest booking:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});




//get total bookings
router.get("/totalBookings", async (req, res) => {
    try {
       const totalBookings = await Booking.count();
        res.json({totalBookings});
    } catch (error) {
        console.error("Error fetching total bookings ", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get total revenue
router.get("/totalRevenue", async (req, res) => {
    try {
        // Calculate the total revenue by summing the amounts of non-refunded payments
        const totalRevenue = await Payment.sum('amount', {
            where: {
                status: {
                    [Op.ne]: 'refunded'
                }
            }
        });

        // Calculate the total refunded amount
        const totalRefunded = await Payment.sum('amount', {
            where: {
                status: 'refunded'
            }
        });

        // Subtract the total refunded amount from the total revenue
        const netRevenue = totalRevenue - totalRefunded;

        res.json({ totalRevenue: netRevenue });
    } catch (error) {
        console.error("Error fetching total revenue", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
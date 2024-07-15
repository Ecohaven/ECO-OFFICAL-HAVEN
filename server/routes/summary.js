const express = require('express');
const router = express.Router();
const { Booking } = require('../models');
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

// //get total revenue 
// router.get("/totalRevenue", async (req, res) => {
//     try {
//        const totalRevenue = await Booking.sum('totalAmount');
//         res.json({totalRevenue});
//     } catch (error) {
//         console.error("Error fetching total revenue ", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

module.exports = router;
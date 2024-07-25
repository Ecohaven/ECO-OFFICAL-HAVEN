const express = require('express');
const router = express.Router();
const { Booking,Payment,Account,Reward,Collection } = require('../models');
const yup = require('yup');
const { Op } = require("sequelize");


// Get revenue by week
router.get("/revenueByWeek", async (req, res) => {
    try {
        const weeklyRevenue = await Payment.findAll({
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%u'), 'week'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue']
            ],
            group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%u')],
            order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%u'), 'ASC']]
        });

        res.json({ weeklyRevenue });
    } catch (error) {
        console.error("Error fetching revenue by week", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
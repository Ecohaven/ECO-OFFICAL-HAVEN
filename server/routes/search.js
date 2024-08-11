const express = require('express');
const router = express.Router();
const { Volunteer } = require('../models'); 
const { Op } = require('sequelize');


// Search volunteers endpoint: GET /volunteers/search?query=query
router.get('/volunteers/search', async (req, res) => {
    const { query } = req.query; // single search query
    try {
        // Create a condition that searches across both name and interest fields
        let condition = query ? {
            [Op.or]: [
                { name: { [Op.like]: `%${query}%` } },
                { interest: { [Op.like]: `%${query}%` } },
            ]
        } : {};

        const volunteers = await Volunteer.findAll({
            where: condition,
            order: [['createdAt', 'ASC']]
        });

        res.json(volunteers);
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
  
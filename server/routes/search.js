const express = require('express');
const router = express.Router();
const { Booking, Event } = require('../models'); 
const { Op } = require("sequelize");

// ///search
// // Search bookings endpoint: GET /search?search=query
// router.get("/", async (req, res) => {
//     const { search } = req.query;
//     try {
//         let condition = {
//             [Op.or]: [
//                 { id: { [Op.like]: `%${search}%` } },
//                 { status: { [Op.like]: `%${search}%` } },
//                 { name: { [Op.like]: `%${search}%` } }, 
//                 { email: { [Op.like]: `%${search}%` } },
//                 { phoneNumber: { [Op.like]: `%${search}%` } },
//                 { address: { [Op.like]: `%${search}%` } },
//                 { eventName: { [Op.like]: `%${search}%` } }, 
//                 { numberOfPax: { [Op.like]: `%${search}%` } }
//             ]
//         };
//         const bookings = await Booking.findAll({
//             where: condition,
//             order: [['createdAt', 'ASC']]
//         });
//         res.json(bookings);
//     } catch (error) {
//         console.error("Error fetching search results:", error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Search events endpoint: GET /events/search?search=query
// router.get("/events/search", async (req, res) => {
//     const { eventsearch } = req.query;
//     try {
//         const condition = eventsearch ? {
//             [Op.or]: [
//                 { id: { [Op.like]: `%${eventsearch}%` } },
//                 { eventName: { [Op.like]: `%${eventsearch}%` } },
//                 { description: { [Op.like]: `%${eventsearch}%` } },
//                 { location: { [Op.like]: `%${eventsearch}%` } },
//                 { startDate: { [Op.like]: `%${eventsearch}%` } },
//                 { endDate: { [Op.like]: `%${eventsearch}%` } },
//                 { time: { [Op.like]: `%${eventsearch}%` } },
//                 { leafPoints: { [Op.like]: `%${eventsearch}%` } },
//                 { status: { [Op.like]: `%${eventsearch}%` } },
//             ]
//         } : {};

//         // Fetch events based on the search condition
//         const events = await Event.findAll({
//             where: condition,
//             order: [['createdAt', 'ASC']]
//         });

//         // Check if events array is empty
//         if (events.length === 0) {
//             return res.status(404).json({ message: `No events found matching '${eventsearch}'` });
//         }

//         res.json(events);
//     } catch (error) {
//         console.error("Error fetching search results:", error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



module.exports = router;

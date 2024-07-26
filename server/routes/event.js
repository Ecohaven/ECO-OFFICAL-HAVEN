const express = require('express');
const router = express.Router();
const db = require('../models');
const multer = require('multer');
const path = require('path');
const { events, Booking } = require('../models'); // Import your models


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'event-picture/');  // Destination folder for uploaded event pictures
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);  // Use the original filename
    }
});

const upload = multer({ storage: storage });

// POST endpoint to create a new event with file upload
router.post('/eventcreation', upload.single('picture'), async (req, res) => {
    const {
        eventName,
        description,
        location,
        category,
        organiser,
        leafPoints,
        startDate,
        endDate,
        time,
        status,
        amount,
        chosenDate
    } = req.body;
    const eventPicture = req.file;  // Uploaded file (event picture)

    try {
        // Handle file upload if exists
        let picture = null;
        if (eventPicture) {
            picture = '/event-picture/' + eventPicture.filename;  // Save the relative file path to the database
        }

        // Create new event in database
        const newEvent = await db.events.create({
            eventName,
            description,
            location,
            category,
            organiser,
            leafPoints,
            startDate,
            endDate,
            time,
            status,
            amount,
            chosenDate,
            picture
        });

        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: 'Failed to create event', details: err.message });
    }
});

// PUT endpoint to update an existing event by its ID
router.put('/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const {
        eventName,
        description,
        location,
        category,
        organiser,
        leafPoints,
        startDate,
        endDate,
        time,
        status,
        amount,
        chosenDate
    } = req.body;

    try {
        // Find the event by id
        let eventToUpdate = await db.events.findByPk(eventId);

        if (!eventToUpdate) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Update event attributes with request data
        if (eventName) {
            eventToUpdate.eventName = eventName;
        }
        if (description) {
            eventToUpdate.description = description;
        }
        if (location) {
            eventToUpdate.location = location;
        }
        if (category) {
            eventToUpdate.category = category;
        }
        if (organiser) {
            eventToUpdate.organiser = organiser;
        }
        if (leafPoints) {
            eventToUpdate.leafPoints = leafPoints;
        }
        if (startDate) {
            eventToUpdate.startDate = startDate;
        }
        if (endDate) {
            eventToUpdate.endDate = endDate;
        }
        if (time) {
            eventToUpdate.time = time;
        }
        if (status) {
            eventToUpdate.status = status;
        }
        if (amount) {
            eventToUpdate.amount = amount;
        }
        if (chosenDate) {
            eventToUpdate.chosenDate = chosenDate;
        }
      
        // Save the updated event to the database
        await eventToUpdate.save();

        // Fetch the updated event again from the database 
        eventToUpdate = await db.events.findByPk(eventId);

        res.status(200).json({ message: 'Event updated successfully', event: eventToUpdate });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event', details: error.message });
    }
});

// Route to fetch booked events by account name
router.get("/account/:accountName/events", async (req, res) => {
  const { accountName } = req.params;

  try {
    // Find events associated with the accountName
    const event = await events.findAll({
      include: [{
        model: Booking,
        required: true, // Ensure only booked events are fetched
        where: { Name: accountName }
      }],
      attributes: ['eventId', 'eventName', 'description','organiser','picture','leafPoints','amount'] // Specify event attributes to retrieve
    });

    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'No booked events found for this account' });
    }

    res.json(event); // Return events as JSON response
  } catch (error) {
    console.error('Error fetching booked events by accountName:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET event picture by event ID
router.get('/event-picture/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await db.events.findByPk(eventId);

        if (!event || !event.picture) {
            return res.status(404).json({ error: 'Event picture not found' });
        }

        // Construct the absolute file path
        const filePath = path.resolve(__dirname, '..', 'event-picture', path.basename(event.picture));

        // Send the file as a response
        res.sendFile(filePath);
    } catch (err) {
        console.error('Error fetching event picture:', err);
        res.status(500).json({ error: 'Failed to fetch event picture', details: err.message });
    }
});

// Get all events
router.get('/events', async (req, res) => {
    try {
        const events = await db.events.findAll();
        res.status(200).json(events);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Failed to fetch events', details: err.message });
    }
});
// Route to get all event names
router.get('/event-names', async (req, res) => {
    try {
        const eventNames = await db.events.findAll({
            attributes: ['eventName'] 
        });
        res.status(200).json(eventNames);
    } catch (err) {
        console.error('Error fetching event names:', err);
        res.status(500).json({ error: 'Failed to fetch event names', details: err.message });
    }
});

// GET event by ID
router.get('/events/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await db.events.findByPk(eventId);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json(event);
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).json({ error: 'Failed to fetch event', details: err.message });
    }
});



// DELETE event by id
router.delete('/events/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        // Find the event to delete
        const eventToDelete = await events.findByPk(eventId);

        if (!eventToDelete) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Update associated bookings
        const [updated] = await Booking.update(
            { 
                eventId: null,
                eventName: 'Deleted Event',
                status: 'Cancelled'
            },
            { where: { eventId } }
        );

        if (updated === 0) {
            console.warn('No bookings found for this event or update failed');
        }

        // Delete the event
        await eventToDelete.destroy();

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Failed to delete event', details: err.message });
    }
});


module.exports = router;

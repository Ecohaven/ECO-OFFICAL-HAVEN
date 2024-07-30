const express = require('express');
const router = express.Router();
const db = require('../models');
const Volunteer = db.Volunteer; 


router.post('/', async (req, res) => {
  try {
    const { name, email, phone, interests, availabilityDate } = req.body;

    // Basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    const volunteer = await Volunteer.create({ 
      name, 
      email, 
      phone, 
      interest: interests, // Save interests array
      availabilityDate 
    });

    res.status(201).json({
      message: 'Volunteer created successfully',
      volunteer
    });
  } catch (err) {
    // Log the error for debugging
    console.error(err);

    // Return a more generic error message
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Retrieve all volunteers
router.get('/getvolunteer', async (req, res) => {
  try {
    const volunteers = await Volunteer.findAll();
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Retrieve a volunteer by ID
router.get('/getvolunteer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByPk(id);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a volunteer by ID
router.put('/updatevolunteer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, interest } = req.body;
    
    // Find volunteer by ID
    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Update volunteer details
    const updatedFields = {};
    if (name !== undefined) updatedFields.name = name;
    if (email !== undefined) updatedFields.email = email;
    if (phone !== undefined) updatedFields.phone = phone;
    if (interest !== undefined) updatedFields.interest = interest;

    // Only update fields that were provided
    await volunteer.update(updatedFields);

    // Respond with updated volunteer details
    res.json({ message: 'Volunteer updated successfully', volunteer });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a volunteer by ID
router.delete('/deletevolunteer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByPk(id);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    await volunteer.destroy();
    res.json({ message: 'Volunteer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
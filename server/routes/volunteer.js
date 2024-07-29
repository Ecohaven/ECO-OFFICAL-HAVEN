const express = require('express');
const router = express.Router();
const db = require('../models');
const Volunteer = db.Volunteer; 


router.post('/', async (req, res) => {
  try {
    const { name, email, phone, interest } = req.body;
    const volunteer = await Volunteer.create({ name, email, phone, interest });
    res.status(201).json(volunteer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add other CRUD routes (GET, PUT, DELETE) here
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
    const volunteer = await Volunteer.findByPk(id);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    await volunteer.update({ name, email, phone, interest });
    res.json({ message: 'Volunteer updated successfully', volunteer });
  } catch (err) {
    res.status(400).json({ message: err.message });
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
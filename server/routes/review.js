const express = require('express');
const router = express.Router();
const db = require('../models');

// Create a new review
router.post('/reviews', async (req, res) => {
  try {
    // Extract the fields from the request body
    const { firstName, lastName, email, event, rating, reviewDescription } = req.body;

    // Create the review in the database
    const newReview = await db.Review.create({ 
      firstName, 
      lastName, 
      email, 
      event, 
      rating, 
      reviewDescription 
    });

    // Respond with the created review
    res.status(201).json({ message: 'Review created successfully', review: newReview });
  } catch (err) {
    // Log and respond with an error message
    console.error('Error creating review:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await db.Review.findAll();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a review
router.put('/:id', async (req, res) => {
  try {
    const { reviewDescription, event } = req.body; // Update fields allowed for editing
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Update only reviewDescription and event
    if (reviewDescription !== undefined) review.reviewDescription = reviewDescription;
    if (event !== undefined) review.event = event;

    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    await review.destroy();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

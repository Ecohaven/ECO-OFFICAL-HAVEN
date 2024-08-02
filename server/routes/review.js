const express = require('express');
const router = express.Router();
const db = require('../models');

// Create a new review
router.post('/reviews', async (req, res) => {
  try {
    const { title, content, rating } = req.body;
    const newReview = await db.Review.create({ title, content, rating });
    res.json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const { title, content, rating } = req.body;
    const review = await db.Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    review.title = title;
    review.content = content;
    review.rating = rating;
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

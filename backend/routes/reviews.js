const express = require('express');
const Review = require('../models/Review');
const Fruit = require('../models/Fruit');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews — add a review (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { fruit_id, rating, comment } = req.body;

    if (!fruit_id || !rating) {
      return res.status(400).json({ error: 'Fruit ID and rating are required' });
    }

    const review = await Review.create({
      user_id: req.user._id,
      fruit_id,
      rating: parseInt(rating),
      comment: comment || '',
    });

    // Update average rating for the fruit
    const reviews = await Review.find({ fruit_id });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Fruit.findByIdAndUpdate(fruit_id, { rating: avgRating.toFixed(1) });

    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// GET /api/reviews/fruit/:id — get reviews for a fruit
router.get('/fruit/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ fruit_id: req.params.id })
      .populate('user_id', 'name')
      .sort({ created_at: -1 });
    res.json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews — get all latest reviews (public)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user_id', 'name')
      .populate('fruit_id', 'name image_url')
      .sort({ created_at: -1 })
      .limit(10);
    res.json({ reviews });
  } catch (err) {
    console.error('Get all reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;


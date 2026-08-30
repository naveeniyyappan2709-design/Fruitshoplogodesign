const express = require('express');
const SiteReview = require('../models/SiteReview');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/site-reviews — get recent site reviews and average rating
router.get('/', async (req, res) => {
  try {
    const reviews = await SiteReview.find()
      .populate('user_id', 'name')
      .sort({ created_at: -1 })
      .limit(10);
      
    // Calculate average rating
    const stats = await SiteReview.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    const average = stats.length > 0 ? stats[0].averageRating : 0;
    const total = stats.length > 0 ? stats[0].totalReviews : 0;

    res.json({ reviews, averageRating: average, totalReviews: total });
  } catch (err) {
    console.error('Get site reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch site reviews' });
  }
});

// POST /api/site-reviews — submit a new site review (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed the site (optional: could allow multiple, but let's restrict to 1 per user or just allow updates)
    let review = await SiteReview.findOne({ user_id: req.user._id });

    if (review) {
      // Update existing
      review.rating = rating;
      review.comment = comment || '';
      await review.save();
      return res.json({ message: 'Site review updated successfully', review });
    }

    // Create new
    review = await SiteReview.create({
      user_id: req.user._id,
      rating,
      comment: comment || '',
    });

    res.status(201).json({ message: 'Site review submitted successfully', review });
  } catch (err) {
    console.error('Submit site review error:', err);
    res.status(500).json({ error: 'Failed to submit site review' });
  }
});

module.exports = router;

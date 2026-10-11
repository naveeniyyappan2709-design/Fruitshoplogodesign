const express = require('express');
const Wishlist = require('../models/Wishlist');
const Fruit = require('../models/Fruit');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user_id: req.user._id }).populate('fruits');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id: req.user._id, fruits: [] });
    }
    res.json({ wishlist });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { fruit_id } = req.body;
    if (!fruit_id) return res.status(400).json({ error: 'Fruit ID required' });

    let wishlist = await Wishlist.findOne({ user_id: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id: req.user._id, fruits: [] });
    }

    if (!wishlist.fruits.includes(fruit_id)) {
      wishlist.fruits.push(fruit_id);
      await wishlist.save();
    }

    const updated = await Wishlist.findById(wishlist._id).populate('fruits');
    res.json({ wishlist: updated });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/remove/:fruit_id', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user_id: req.user._id });
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });

    wishlist.fruits = wishlist.fruits.filter(id => id.toString() !== req.params.fruit_id);
    await wishlist.save();

    const updated = await Wishlist.findById(wishlist._id).populate('fruits');
    res.json({ wishlist: updated });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

module.exports = router;

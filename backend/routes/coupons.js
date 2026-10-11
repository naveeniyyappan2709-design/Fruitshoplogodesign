const express = require('express');
const Coupon = require('../models/Coupon');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all coupons (Admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ created_at: -1 });
    res.json({ coupons });
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Create coupon (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, type, value, minOrder, maxDiscount, endDate, usageLimit } = req.body;
    
    if (!code || !type || !value || !endDate) {
      return res.status(400).json({ error: 'Code, type, value, and endDate are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrder,
      maxDiscount,
      endDate,
      usageLimit,
    });

    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Delete coupon (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// Validate coupon (Customer)
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    if (new Date() > coupon.endDate) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    if (cartTotal < coupon.minOrder) {
      return res.status(400).json({ error: `Minimum order of ₹${coupon.minOrder} required` });
    }

    let discountValue = 0;
    if (coupon.type === 'flat') {
      discountValue = coupon.value;
    } else if (coupon.type === 'percentage') {
      discountValue = (cartTotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountValue > coupon.maxDiscount) {
        discountValue = coupon.maxDiscount;
      }
    }

    res.json({ 
      valid: true,
      discount: discountValue,
      coupon_code: coupon.code
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

module.exports = router;

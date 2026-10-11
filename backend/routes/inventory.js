const express = require('express');
const Fruit = require('../models/Fruit');
const StockHistory = require('../models/StockHistory');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/inventory/history
router.get('/history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const history = await StockHistory.find()
      .populate('fruit_id', 'name image_url')
      .populate('user_id', 'name email')
      .sort({ created_at: -1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

// POST /api/inventory/update
router.post('/update', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fruit_id, quantity_to_add, reason } = req.body;
    
    if (!fruit_id || !quantity_to_add) {
      return res.status(400).json({ error: 'Fruit ID and quantity are required' });
    }

    const fruit = await Fruit.findById(fruit_id);
    if (!fruit) {
      return res.status(404).json({ error: 'Fruit not found' });
    }

    const previousStock = fruit.quantity;
    fruit.quantity += Number(quantity_to_add);
    if (fruit.quantity > 0 && fruit.status === 'Out of Stock') {
      fruit.status = 'Available';
    }
    await fruit.save();

    await StockHistory.create({
      fruit_id,
      previousStock,
      changeQuantity: Number(quantity_to_add),
      newStock: fruit.quantity,
      reason: reason || 'Admin Stock Update',
      user_id: req.user._id,
    });

    res.json({ message: 'Stock updated successfully', fruit });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

module.exports = router;

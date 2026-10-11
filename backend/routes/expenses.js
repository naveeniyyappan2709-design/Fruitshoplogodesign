const express = require('express');
const Expense = require('../models/Expense');
const Fruit = require('../models/Fruit');
const StockHistory = require('../models/StockHistory');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/expenses
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const expenses = await Expense.find().populate('fruit_id').sort({ date: -1 });
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses (record loss/expense)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fruit_id, quantity, cost, reason } = req.body;
    
    const expense = await Expense.create({
      fruit_id: fruit_id || null,
      quantity: quantity || 0,
      cost,
      reason,
    });

    if (fruit_id && quantity) {
      // Reduce stock if it's a damaged stock expense
      const fruit = await Fruit.findById(fruit_id);
      if (fruit) {
        const previousStock = fruit.quantity;
        fruit.quantity = Math.max(0, fruit.quantity - quantity);
        if (fruit.quantity === 0) fruit.status = 'Out of Stock';
        await fruit.save();

        await StockHistory.create({
          fruit_id,
          previousStock,
          changeQuantity: -quantity,
          newStock: fruit.quantity,
          reason: `Expense/Loss: ${reason}`,
          user_id: req.user._id,
        });
      }
    }

    res.status(201).json({ message: 'Expense recorded', expense });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record expense' });
  }
});

module.exports = router;

const express = require('express');
const Sale = require('../models/Sale');
const Fruit = require('../models/Fruit');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/sales — create a new sale (admin or system)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fruitId, quantity, customerId } = req.body;

    if (!fruitId || !quantity) {
      return res.status(400).json({ error: 'Fruit ID and quantity are required' });
    }

    const fruit = await Fruit.findById(fruitId);
    if (!fruit) {
      return res.status(404).json({ error: 'Fruit not found' });
    }

    if (fruit.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const sellingPrice = fruit.sellingPrice;
    const purchasePrice = fruit.purchasePrice;
    const totalAmount = sellingPrice * quantity;
    const profit = (sellingPrice - purchasePrice) * quantity;

    // Create sale
    const sale = await Sale.create({
      customerId: customerId || null,
      fruitId,
      quantity,
      sellingPrice,
      totalAmount,
      profit
    });

    // Reduce fruit stock
    fruit.quantity -= quantity;
    if (fruit.quantity === 0) {
      fruit.status = 'Out of Stock';
    }
    await fruit.save();

    res.status(201).json({ message: 'Sale completed', sale });
  } catch (err) {
    console.error('Create sale error:', err);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// GET /api/sales — get all sales
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sales = await Sale.find().populate('fruitId', 'name category').sort({ saleDate: -1 });
    res.json({ sales });
  } catch (err) {
    console.error('Get sales error:', err);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

module.exports = router;

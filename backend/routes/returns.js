const express = require('express');
const Return = require('../models/Return');
const Sale = require('../models/Sale');
const Fruit = require('../models/Fruit');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/returns — create a return request
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { saleId, quantity, reason } = req.body;

    if (!saleId || !quantity || !reason) {
      return res.status(400).json({ error: 'Sale ID, quantity, and reason are required' });
    }

    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    if (quantity > sale.quantity) {
      return res.status(400).json({ error: 'Cannot return more than purchased quantity' });
    }

    const refundAmount = sale.sellingPrice * quantity;

    const returnRequest = await Return.create({
      saleId,
      fruitId: sale.fruitId,
      quantity,
      reason,
      refundAmount,
      returnStatus: 'Pending',
      refundStatus: 'Refund Pending'
    });

    res.status(201).json({ message: 'Return request created', returnRequest });
  } catch (err) {
    console.error('Create return error:', err);
    res.status(500).json({ error: 'Failed to create return request' });
  }
});

// GET /api/returns — get all returns
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('saleId')
      .populate('fruitId', 'name category')
      .sort({ returnDate: -1 });
    res.json({ returns });
  } catch (err) {
    console.error('Get returns error:', err);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

// PUT /api/returns/:id/approve — approve a return
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ error: 'Return request not found' });
    }

    if (returnRequest.returnStatus !== 'Pending') {
      return res.status(400).json({ error: 'Return request is already processed' });
    }

    const sale = await Sale.findById(returnRequest.saleId);
    if (!sale) {
      return res.status(404).json({ error: 'Original sale not found' });
    }

    const fruit = await Fruit.findById(returnRequest.fruitId);
    if (!fruit) {
      return res.status(404).json({ error: 'Fruit not found' });
    }

    // 1. Add returned quantity back to stock
    fruit.quantity += returnRequest.quantity;
    if (fruit.quantity > 0) {
      fruit.status = 'Available';
    }
    await fruit.save();

    // 2. Update original sale record (reduce quantity, totalAmount, profit)
    // Note: To preserve history, sometimes we don't modify the original sale, but according to prompt:
    // "The original sale record should be updated."
    // Let's recalculate profit after return. 
    // Profit per unit = sale.profit / sale.quantity (originally)
    const profitPerUnit = (sale.profit / sale.quantity);
    sale.quantity -= returnRequest.quantity;
    sale.totalAmount -= returnRequest.refundAmount;
    sale.profit = profitPerUnit * sale.quantity; // Automatically recalculate profit
    await sale.save();

    // 3. Update return status
    returnRequest.returnStatus = 'Approved';
    await returnRequest.save();

    res.json({ message: 'Return approved', returnRequest });
  } catch (err) {
    console.error('Approve return error:', err);
    res.status(500).json({ error: 'Failed to approve return' });
  }
});

// PUT /api/returns/:id/reject — reject a return
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ error: 'Return request not found' });
    }
    returnRequest.returnStatus = 'Rejected';
    await returnRequest.save();
    res.json({ message: 'Return rejected', returnRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject return' });
  }
});

// PUT /api/returns/:id/refund — mark refund as processed
router.put('/:id/refund', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ error: 'Return request not found' });
    }
    if (returnRequest.returnStatus !== 'Approved') {
      return res.status(400).json({ error: 'Only approved returns can be refunded' });
    }
    returnRequest.refundStatus = 'Refund Processed';
    await returnRequest.save();
    res.json({ message: 'Refund marked as processed', returnRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

module.exports = router;

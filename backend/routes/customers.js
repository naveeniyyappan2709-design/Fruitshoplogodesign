const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/customers — get all customers with their stats (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password -__v').lean();
    
    // Fetch all orders for aggregation
    const allOrders = await Order.find({ status: { $ne: 'cancelled' } }).lean();

    const customerStatsMap = {};
    allOrders.forEach(order => {
      const uid = order.user_id.toString();
      if (!customerStatsMap[uid]) {
        customerStatsMap[uid] = { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
      }
      customerStatsMap[uid].totalOrders += 1;
      customerStatsMap[uid].totalSpent += order.total_amount;
      
      if (!customerStatsMap[uid].lastOrderDate || new Date(order.created_at) > new Date(customerStatsMap[uid].lastOrderDate)) {
        customerStatsMap[uid].lastOrderDate = order.created_at;
      }
    });

    const populatedCustomers = customers.map(c => {
      const stats = customerStatsMap[c._id.toString()] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
      return {
        ...c,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    res.json({ customers: populatedCustomers });
  } catch (err) {
    console.error('Fetch customers error:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Fruit = require('../models/Fruit');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — place a bulk order (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, delivery_address, phone, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!delivery_address) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const fruit = await Fruit.findOne({ _id: item.fruit_id, available: 1 }).session(session);
      if (!fruit) {
        throw new Error(`Fruit with ID ${item.fruit_id} not found or unavailable`);
      }

      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid quantity for ${fruit.name}`);
      }

      if (item.quantity > fruit.stock_kg) {
        throw new Error(`Insufficient stock for ${fruit.name}. Available: ${fruit.stock_kg} ${fruit.unit}`);
      }

      const itemTotal = fruit.price * item.quantity;
      totalAmount += itemTotal;
      validatedItems.push({
        fruit_id: fruit._id,
        quantity: item.quantity,
        price_at_order: fruit.price,
      });

      // Decrement stock
      fruit.stock_kg -= item.quantity;
      await fruit.save({ session });
    }

    // Create order
    const order = await Order.create([{
      user_id: req.user._id,
      status: 'pending',
      total_amount: totalAmount,
      delivery_address,
      phone: phone || req.user.phone,
      notes: notes || '',
      items: validatedItems
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Re-fetch to populate virtuals for response
    const populatedOrder = await Order.findById(order[0]._id).populate('items.fruit_id');

    res.status(201).json({
      message: 'Order placed successfully!',
      order: populatedOrder
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create order error:', err);
    res.status(400).json({ error: err.message || 'Failed to place order' });
  }
});

// GET /api/orders — list user's orders (authenticated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .populate('items.fruit_id');
      
    res.json({ orders });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id — single order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.fruit_id');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Security check
    if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:id/status — update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If cancelling, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Fruit.updateOne(
          { _id: item.fruit_id },
          { $inc: { stock_kg: item.quantity } }
        );
      }
    }

    order.status = status;
    await order.save();

    res.json({ message: `Order status updated to ${status}` });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/admin/orders — list all orders (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ created_at: -1 })
      .populate('user_id', 'name email phone')
      .populate('items.fruit_id');

    // The frontend expects customer details flattened in older SQLite logic
    const formattedOrders = orders.map(order => {
      const obj = order.toJSON();
      if (obj.user_id) {
        obj.customer_name = obj.user_id.name;
        obj.customer_email = obj.user_id.email;
        obj.customer_phone = obj.user_id.phone;
        obj.user_id = obj.user_id.id; 
      }
      return obj;
    });

    res.json({ orders: formattedOrders });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/admin/stats — dashboard stats (admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalFruits = await Fruit.countDocuments();

    // Recent 5 orders
    const rawRecentOrders = await Order.find()
      .sort({ created_at: -1 })
      .limit(5)
      .populate('user_id', 'name');
      
    const recentOrders = rawRecentOrders.map(o => {
      const obj = o.toJSON();
      obj.customer_name = obj.user_id?.name;
      return obj;
    });

    // Popular fruits aggregation via embedded items array
    const popularFruits = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
          _id: '$items.fruit_id',
          total_ordered: { $sum: '$items.quantity' }
      }},
      { $sort: { total_ordered: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'fruits',
          localField: '_id',
          foreignField: '_id',
          as: 'fruitDetails'
      }},
      { $unwind: '$fruitDetails' },
      { $project: {
          _id: 0,
          name: '$fruitDetails.name',
          total_ordered: 1
      }}
    ]);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalCustomers,
        totalFruits
      },
      recentOrders,
      popularFruits
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;

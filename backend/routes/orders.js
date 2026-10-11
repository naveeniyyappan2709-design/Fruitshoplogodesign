const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Fruit = require('../models/Fruit');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — place a bulk order (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, delivery_address, phone, notes, delivery_fee, discount, coupon_code } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!delivery_address) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    let totalAmount = 0;
    const validatedItems = [];
    const StockHistory = require('../models/StockHistory');
    const Notification = require('../models/Notification');
    const Sale = require('../models/Sale');

    for (const item of items) {
      const fruit = await Fruit.findOne({ _id: item.fruit_id });
      if (!fruit) {
        throw new Error(`Fruit with ID ${item.fruit_id} not found or unavailable`);
      }

      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid quantity for ${fruit.name}`);
      }

      if (item.quantity > fruit.quantity) {
        throw new Error(`Insufficient stock for ${fruit.name}. Available: ${fruit.quantity} ${fruit.unit}`);
      }

      const itemTotal = fruit.sellingPrice * item.quantity;
      totalAmount += itemTotal;
      validatedItems.push({
        fruit_id: fruit._id,
        quantity: item.quantity,
        price_at_order: fruit.sellingPrice,
        purchase_price_at_order: fruit.purchasePrice,
      });

      const previousStock = fruit.quantity;
      fruit.quantity -= item.quantity;
      fruit.totalSoldAllTime += item.quantity;
      fruit.totalSoldToday += item.quantity;

      // Update status if out of stock
      if (fruit.quantity <= 0) {
        fruit.quantity = 0;
        fruit.status = 'Out of Stock';
      }
      await fruit.save();

      // Stock history
      await StockHistory.create([{
        fruit_id: fruit._id,
        previousStock,
        changeQuantity: -item.quantity,
        newStock: fruit.quantity,
        reason: 'Order placed',
        user_id: req.user._id,
      }]);

      // Notifications for low stock
      if (fruit.quantity === 0) {
        await Notification.create([{
          type: 'Out of Stock',
          message: `Out of Stock: ${fruit.name} is currently unavailable.`,
          relatedId: fruit._id,
        }]);
      } else if (fruit.quantity <= fruit.minStock) {
        await Notification.create([{
          type: 'Low Stock',
          message: `Low Stock Alert: Only ${fruit.quantity} ${fruit.unit.replace('per ', '')} of ${fruit.name} is remaining.`,
          relatedId: fruit._id,
        }]);
      }
    }

    // Create order
    const order = await Order.create([{
      user_id: req.user._id,
      status: 'pending',
      total_amount: totalAmount,
      delivery_fee: delivery_fee || 0,
      discount: discount || 0,
      coupon_code: coupon_code || '',
      delivery_address,
      phone: phone || req.user.phone,
      notes: notes || '',
      items: validatedItems,
      timeline: { placed_at: new Date() }
    }]);

    // Calculate profit and create Sale records for each item
    const salesData = [];
    for (const vItem of validatedItems) {
      const itemProfit = (vItem.price_at_order - vItem.purchase_price_at_order) * vItem.quantity;
      salesData.push({
        customerId: req.user._id,
        fruitId: vItem.fruit_id,
        quantity: vItem.quantity,
        sellingPrice: vItem.price_at_order,
        totalAmount: vItem.price_at_order * vItem.quantity,
        profit: itemProfit,
        saleDate: new Date(),
      });
    }
    await Sale.create(salesData);

    // Notification for new order
    await Notification.create([{
      type: 'New Order',
      message: `New Order #${order[0]._id.toString().substring(0,6)} received for ₹${totalAmount}.`,
      relatedId: order[0]._id,
    }]);

    // Re-fetch to populate virtuals for response
    const populatedOrder = await Order.findById(order[0]._id).populate('items.fruit_id');

    res.status(201).json({
      message: 'Order placed successfully!',
      order: populatedOrder
    });

  } catch (err) {
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
    const validStatuses = ['pending', 'confirmed', 'processing', 'preparing', 'out for delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id).populate('items.fruit_id').session(session);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If cancelling, restore stock, adjust history, adjust sales
    if (status.toLowerCase() === 'cancelled' && order.status !== 'cancelled') {
      const StockHistory = require('../models/StockHistory');
      const Sale = require('../models/Sale');
      
      for (const item of order.items) {
        if (!item.fruit_id) continue;
        
        const fruit = await Fruit.findById(item.fruit_id._id);
        if (fruit) {
          const previousStock = fruit.quantity;
          fruit.quantity += item.quantity;
          
          fruit.totalSoldAllTime = Math.max(0, fruit.totalSoldAllTime - item.quantity);
          fruit.totalSoldToday = Math.max(0, fruit.totalSoldToday - item.quantity);
          
          if (fruit.quantity > 0 && fruit.status === 'Out of Stock') {
            fruit.status = 'In Stock';
          }
          await fruit.save();
          
          await StockHistory.create([{
            fruit_id: fruit._id,
            previousStock,
            changeQuantity: item.quantity,
            newStock: fruit.quantity,
            reason: 'Order cancelled (Admin)',
            user_id: req.user._id,
          }]);
        }
        
        const timeWindow = new Date(order.created_at);
        const windowStart = new Date(timeWindow.getTime() - 120000); 
        const windowEnd = new Date(timeWindow.getTime() + 120000);
        
        await Sale.findOneAndDelete({
          customerId: order.user_id,
          fruitId: item.fruit_id._id,
          quantity: item.quantity,
          saleDate: { $gte: windowStart, $lte: windowEnd }
        });
      }
    }

    order.status = status.toLowerCase();
    
    let timelineKey = '';
    if (order.status === 'confirmed') timelineKey = 'confirmed_at';
    if (order.status === 'processing' || order.status === 'preparing') timelineKey = 'processing_at';
    if (order.status === 'out for delivery') timelineKey = 'out_for_delivery_at';
    if (order.status === 'delivered') timelineKey = 'delivered_at';
    if (order.status === 'cancelled') timelineKey = 'cancelled_at';
    
    if (timelineKey && !order.timeline[timelineKey]) {
      order.timeline[timelineKey] = new Date();
    }
    
    await order.save();

    res.json({ message: `Order status updated to ${status}`, order });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// PUT /api/orders/:id/cancel — cancel order (customer)
router.put('/:id/cancel', authenticateToken, async (req, res) => {

  try {
    const order = await Order.findById(req.params.id).populate('items.fruit_id');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    const StockHistory = require('../models/StockHistory');
    const Sale = require('../models/Sale');

    // Restore stock and delete sale records
    for (const item of order.items) {
      if (!item.fruit_id) continue;
      
      const fruit = await Fruit.findById(item.fruit_id._id);
      if (fruit) {
        const previousStock = fruit.quantity;
        fruit.quantity += item.quantity;
        fruit.totalSoldAllTime = Math.max(0, fruit.totalSoldAllTime - item.quantity);
        fruit.totalSoldToday = Math.max(0, fruit.totalSoldToday - item.quantity);
        if (fruit.quantity > 0 && fruit.status === 'Out of Stock') {
          fruit.status = 'In Stock';
        }
        await fruit.save();
        
        await StockHistory.create([{
          fruit_id: fruit._id,
          previousStock,
          changeQuantity: item.quantity,
          newStock: fruit.quantity,
          reason: 'Order cancelled (Customer)',
          user_id: req.user._id,
        }]);
      }
      
      const timeWindow = new Date(order.created_at);
      const windowStart = new Date(timeWindow.getTime() - 120000); 
      const windowEnd = new Date(timeWindow.getTime() + 120000);
      
      await Sale.findOneAndDelete({
        customerId: order.user_id,
        fruitId: item.fruit_id._id,
        quantity: item.quantity,
        saleDate: { $gte: windowStart, $lte: windowEnd }
      });
    }

    order.status = 'cancelled';
    order.timeline.cancelled_at = new Date();
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
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

    // Daily sales volume for the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const dailySales = await Order.aggregate([
      { $match: { 
          created_at: { $gte: last7Days },
          status: { $ne: 'cancelled' }
      }},
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          amount: { $sum: "$total_amount" },
          count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);

    // Daily sales per fruit
    const dailyFruitSales = await Order.aggregate([
      { $match: { 
          created_at: { $gte: last7Days },
          status: { $ne: 'cancelled' }
      }},
      { $unwind: '$items' },
      { $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            fruit_id: '$items.fruit_id'
          },
          total_quantity: { $sum: '$items.quantity' },
          total_revenue: { $sum: { $multiply: ['$items.quantity', '$items.price_at_order'] } }
      }},
      { $lookup: {
          from: 'fruits',
          localField: '_id.fruit_id',
          foreignField: '_id',
          as: 'fruitDetails'
      }},
      { $unwind: '$fruitDetails' },
      { $project: {
          _id: 0,
          date: '$_id.date',
          fruit_name: '$fruitDetails.name',
          total_quantity: 1,
          total_revenue: 1
      }},
      { $sort: { "date": 1, "total_quantity": -1 } }
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
      popularFruits,
      dailySales,
      dailyFruitSales
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
// PUT /api/orders/:id/status — update order status (admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status.toLowerCase() === 'cancelled') {
      return res.status(400).json({ error: 'Use the /cancel endpoint to cancel orders' });
    }

    order.status = status.toLowerCase();
    
    // Update timeline
    let timelineKey = '';
    if (order.status === 'confirmed') timelineKey = 'confirmed_at';
    if (order.status === 'preparing') timelineKey = 'preparing_at';
    if (order.status === 'out for delivery') timelineKey = 'out_for_delivery_at';
    if (order.status === 'delivered') timelineKey = 'delivered_at';
    
    if (timelineKey && !order.timeline[timelineKey]) {
      order.timeline[timelineKey] = new Date();
    }

    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/orders/:id/cancel — cancel order (admin)
router.put('/:id/cancel', authenticateToken, requireAdmin, async (req, res) => {
  
  try {
    const order = await Order.findById(req.params.id).populate('items.fruit_id');
    if (!order) throw new Error('Order not found');
    
    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    const StockHistory = require('../models/StockHistory');
    const Sale = require('../models/Sale');
    
    for (const item of order.items) {
      if (!item.fruit_id) continue;
      
      const fruit = await Fruit.findById(item.fruit_id._id);
      if (fruit) {
        const previousStock = fruit.quantity;
        fruit.quantity += item.quantity;
        
        fruit.totalSoldAllTime = Math.max(0, fruit.totalSoldAllTime - item.quantity);
        fruit.totalSoldToday = Math.max(0, fruit.totalSoldToday - item.quantity);
        
        if (fruit.quantity > 0 && fruit.status === 'Out of Stock') {
          fruit.status = 'In Stock';
        }
        await fruit.save();
        
        await StockHistory.create([{
          fruit_id: fruit._id,
          previousStock,
          changeQuantity: item.quantity,
          newStock: fruit.quantity,
          reason: 'Order cancelled',
          user_id: req.user._id,
        }]);
      }
    }

    for (const item of order.items) {
      if (!item.fruit_id) continue;
      
      const timeWindow = new Date(order.created_at);
      const windowStart = new Date(timeWindow.getTime() - 120000); 
      const windowEnd = new Date(timeWindow.getTime() + 120000);
      
      await Sale.findOneAndDelete({
        customerId: order.user_id,
        fruitId: item.fruit_id._id,
        quantity: item.quantity,
        saleDate: { $gte: windowStart, $lte: windowEnd }
      });
    }
    
    order.status = 'cancelled';
    order.timeline.cancelled_at = new Date();
    await order.save();
    
    res.json({ message: 'Order cancelled successfully and stock restored', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

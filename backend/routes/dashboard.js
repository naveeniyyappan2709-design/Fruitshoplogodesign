const express = require('express');
const Fruit = require('../models/Fruit');
const Sale = require('../models/Sale');
const Order = require('../models/Order');
const User = require('../models/User');
const Expense = require('../models/Expense');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Basic Counts
    const totalFruits = await Fruit.countDocuments();
    const lowStockFruits = await Fruit.countDocuments({ $expr: { $lte: ['$quantity', '$minStock'] } });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const todayOrders = await Order.countDocuments({ created_at: { $gte: today } });

    // Revenue & Profit
    const sales = await Sale.find();
    let totalRevenue = 0;
    let totalProfit = 0;
    
    sales.forEach(sale => {
      totalRevenue += sale.totalAmount;
      totalProfit += sale.profit;
    });

    const todaySales = await Sale.find({ saleDate: { $gte: today } });
    let todayRevenue = 0;
    let todayProfit = 0;
    let unitsSoldToday = 0;
    todaySales.forEach(sale => {
      todayRevenue += sale.totalAmount;
      todayProfit += sale.profit;
      unitsSoldToday += (sale.quantity || 0);
    });

    // Loss (from Expenses)
    const expenses = await Expense.find();
    let totalLoss = 0;
    let todayLoss = 0;
    expenses.forEach(e => {
      totalLoss += e.cost;
      if (new Date(e.expenseDate) >= today) {
        todayLoss += e.cost;
      }
    });

    const netProfit = totalProfit - totalLoss;
    const todayNetProfit = todayProfit - todayLoss;

    // Charts Data
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const dailySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: last7Days } } },
      { $group: {
          _id: { $dateToString: { format: "%m-%d", date: "$saleDate" } },
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$profit" }
      }},
      { $sort: { "_id": 1 } }
    ]);

    const last4Weeks = new Date();
    last4Weeks.setDate(last4Weeks.getDate() - 28);
    const weeklySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: last4Weeks } } },
      { $group: {
          _id: { $isoWeek: "$saleDate" },
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$profit" }
      }},
      { $sort: { "_id": 1 } }
    ]);

    const last12Months = new Date();
    last12Months.setMonth(last12Months.getMonth() - 12);
    const monthlySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: last12Months } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$saleDate" } },
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$profit" }
      }},
      { $sort: { "_id": 1 } }
    ]);

    // Tables Data
    const bestSellingFruits = await Fruit.find().sort({ totalSoldAllTime: -1 }).limit(5);
    const fastMovingFruits = await Fruit.find().sort({ totalSoldToday: -1 }).limit(5);
    const lowStockData = await Fruit.find({ $expr: { $lte: ['$quantity', '$minStock'] } }).limit(10);
    const rawRecentOrders = await Order.find()
      .sort({ created_at: -1 })
      .limit(5)
      .populate('user_id', 'name email phone')
      .populate('items.fruit_id');
      
    const recentOrders = rawRecentOrders.map(o => {
      const obj = o.toJSON();
      if (obj.user_id) {
        obj.customer_name = obj.user_id.name;
        obj.customer_email = obj.user_id.email;
        obj.customer_phone = obj.user_id.phone;
        obj.user_id = obj.user_id.id; 
      }
      return obj;
    });

    res.json({
      totalFruits,
      lowStockFruits,
      totalCustomers,
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalProfit,
      todayProfit,
      totalLoss,
      todayLoss,
      netProfit,
      todayNetProfit,
      unitsSoldToday,
      dailySales,
      weeklySales,
      monthlySales,
      bestSellingFruits,
      fastMovingFruits,
      lowStockData,
      recentOrders
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;

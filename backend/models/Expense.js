const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  fruit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fruit',
  },
  quantity: {
    type: Number,
  },
  cost: {
    type: Number,
    required: true,
  },
  reason: {
    type: String, // e.g., 'Damaged stock', 'Expired', 'Delivery Expense', 'Other'
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
});

module.exports = mongoose.model('Expense', expenseSchema);

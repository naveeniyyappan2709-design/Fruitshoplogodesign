const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
  },
  fruitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fruit',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  refundAmount: {
    type: Number,
    required: true,
  },
  returnStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  refundStatus: {
    type: String,
    enum: ['Refund Pending', 'Refund Processed'],
    default: 'Refund Pending',
  },
  returnDate: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Return', returnSchema);

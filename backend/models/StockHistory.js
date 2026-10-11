const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  fruit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fruit',
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
  },
  changeQuantity: {
    type: Number,
    required: true, // Positive for added stock, negative for sold/removed
  },
  newStock: {
    type: Number,
    required: true,
  },
  reason: {
    type: String, // e.g., 'Order placed', 'Restock', 'Damaged', 'Correction'
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The admin who changed it, or null if system (order)
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
});

module.exports = mongoose.model('StockHistory', stockHistorySchema);

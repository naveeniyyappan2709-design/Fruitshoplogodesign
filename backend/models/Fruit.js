const mongoose = require('mongoose');

const fruitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    default: 'per kg',
  },
  stock_kg: {
    type: Number,
    default: 0,
  },
  image_url: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['seasonal', 'everyday', 'exotic'],
    default: 'everyday',
  },
  available: {
    type: Number,
    default: 1, // 1 for true, 0 for false to maintain frontend compatibility
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Fruit', fruitSchema);

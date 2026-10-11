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
  purchasePrice: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    default: 'per kg',
  },
  quantity: {
    type: Number,
    default: 0,
  },
  image_url: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'everyday',
  },
  status: {
    type: String,
    enum: ['Available', 'Out of Stock'],
    default: 'Available',
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  is_deal: {
    type: Boolean,
    default: false,
  },
  minStock: {
    type: Number,
    default: 10,
  },
  originalPrice: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
  },
  supplier: {
    type: String,
    default: '',
  },
  totalSoldAllTime: {
    type: Number,
    default: 0,
  },
  totalSoldToday: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Fruit', fruitSchema);

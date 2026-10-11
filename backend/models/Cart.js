const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  fruit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fruit',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Cart', cartSchema);

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  fruit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fruit',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price_at_order: {
    type: Number,
    required: true,
  },
});

// Since the old SQLite database sent these fields to the frontend, 
// we will add them virtually here so the frontend code doesn't break.
orderItemSchema.virtual('fruit_name').get(function() {
  return this.fruit_id && this.fruit_id.name ? this.fruit_id.name : undefined;
});

orderItemSchema.virtual('unit').get(function() {
  return this.fruit_id && this.fruit_id.unit ? this.fruit_id.unit : undefined;
});

orderItemSchema.virtual('image_url').get(function() {
  return this.fruit_id && this.fruit_id.image_url ? this.fruit_id.image_url : undefined;
});

orderItemSchema.set('toJSON', { virtuals: true });
orderItemSchema.set('toObject', { virtuals: true });


const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'],
    default: 'pending',
  },
  total_amount: {
    type: Number,
    required: true,
  },
  delivery_address: {
    type: String,
  },
  phone: {
    type: String,
  },
  notes: {
    type: String,
  },
  items: [orderItemSchema], // Embed items directly into the order!
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Order', orderSchema);

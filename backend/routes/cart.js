const express = require('express');
const Cart = require('../models/Cart');
const Fruit = require('../models/Fruit');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user._id }).populate('items.fruit_id');
    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id, items: [] });
    }
    // Filter out items where fruit was deleted
    cart.items = cart.items.filter(item => item.fruit_id);
    await cart.save();
    res.json({ cart });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { fruit_id, quantity } = req.body;
    
    if (!fruit_id || quantity <= 0) {
      return res.status(400).json({ error: 'Valid fruit ID and quantity required' });
    }

    const fruit = await Fruit.findById(fruit_id);
    if (!fruit || fruit.quantity < quantity) {
      return res.status(400).json({ error: 'Fruit not found or insufficient stock' });
    }

    let cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.fruit_id.toString() === fruit_id);
    
    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (newQty > fruit.quantity) {
        return res.status(400).json({ error: 'Cannot add more than available stock' });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({ fruit_id, quantity });
    }

    await cart.save();
    
    // Repopulate to return full details
    cart = await Cart.findById(cart._id).populate('items.fruit_id');
    res.json({ cart });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update quantity
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { fruit_id, quantity } = req.body;
    
    if (!fruit_id || quantity < 0) {
      return res.status(400).json({ error: 'Valid fruit ID and positive quantity required' });
    }

    const fruit = await Fruit.findById(fruit_id);
    if (!fruit || fruit.quantity < quantity) {
      return res.status(400).json({ error: 'Fruit not found or insufficient stock' });
    }

    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    if (quantity === 0) {
      cart.items = cart.items.filter(item => item.fruit_id.toString() !== fruit_id);
    } else {
      const itemIndex = cart.items.findIndex(item => item.fruit_id.toString() === fruit_id);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.fruit_id');
    res.json({ cart: updatedCart });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item
router.delete('/remove/:fruit_id', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => item.fruit_id.toString() !== req.params.fruit_id);
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.fruit_id');
    res.json({ cart: updatedCart });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared', cart });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;

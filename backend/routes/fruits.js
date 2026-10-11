const express = require('express');
const Fruit = require('../models/Fruit');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/fruits — list all available fruits (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, all } = req.query;

    const query = {};

    if (!all) {
      query.status = 'Available';
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (req.query.is_deal === 'true') {
      query.is_deal = true;
    }

    if (req.query.max_price) {
      query.sellingPrice = { $lte: parseFloat(req.query.max_price) };
    }

    let sortObj = { category: 1, name: 1 };
    if (req.query.sort) {
      switch(req.query.sort) {
        case 'price_asc': sortObj = { sellingPrice: 1 }; break;
        case 'price_desc': sortObj = { sellingPrice: -1 }; break;
        case 'newest': sortObj = { created_at: -1 }; break;
        case 'popular': sortObj = { totalSoldAllTime: -1 }; break;
        case 'rating': sortObj = { rating: -1 }; break;
      }
    }

    const fruits = await Fruit.find(query).sort(sortObj);
    res.json({ fruits });
  } catch (err) {
    console.error('Get fruits error:', err);
    res.status(500).json({ error: 'Failed to fetch fruits' });
  }
});

// GET /api/fruits/recommendations — get top sellers and budget picks
router.get('/recommendations', async (req, res) => {
  try {
    // Trending: Let's assume fruits with higher ratings are trending for now
    // In a real app, this would be based on sales data
    const trending = await Fruit.find({ status: 'Available' })
      .sort({ rating: -1 })
      .limit(4);

    // Budget: Lowest price
    const budget = await Fruit.find({ status: 'Available' })
      .sort({ sellingPrice: 1 })
      .limit(4);

    res.json({ trending, budget });
  } catch (err) {
    console.error('Get recommendations error:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// GET /api/fruits/:id — single fruit
router.get('/:id', async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);
    if (!fruit) {
      return res.status(404).json({ error: 'Fruit not found' });
    }
    res.json({ fruit });
  } catch (err) {
    console.error('Get fruit error:', err);
    res.status(500).json({ error: 'Failed to fetch fruit' });
  }
});

// POST /api/fruits — add fruit (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, purchasePrice, sellingPrice, unit, quantity, image_url, category, status, minStock, originalPrice, discount, supplier } = req.body;

    if (!name || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ error: 'Name, purchasePrice, and sellingPrice are required' });
    }

    const fruit = await Fruit.create({
      name,
      description: description || '',
      purchasePrice,
      sellingPrice,
      unit: unit || 'per kg',
      quantity: quantity || 0,
      image_url: image_url || '',
      category: category || 'everyday',
      status: status || 'Available',
      minStock: minStock || 10,
      originalPrice,
      discount: discount || 0,
      supplier: supplier || ''
    });

    res.status(201).json({ message: 'Fruit added', fruit });
  } catch (err) {
    console.error('Add fruit error:', err);
    res.status(500).json({ error: 'Failed to add fruit' });
  }
});

// PUT /api/fruits/:id — update fruit (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);
    if (!fruit) {
      return res.status(404).json({ error: 'Fruit not found' });
    }

    // Only update fields that were provided
    const updatableFields = ['name', 'description', 'purchasePrice', 'sellingPrice', 'unit', 'quantity', 'image_url', 'category', 'status', 'is_deal', 'minStock', 'originalPrice', 'discount', 'supplier'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fruit[field] = req.body[field];
      }
    });

    await fruit.save();
    res.json({ message: 'Fruit updated', fruit });
  } catch (err) {
    console.error('Update fruit error:', err);
    res.status(500).json({ error: 'Failed to update fruit' });
  }
});

// DELETE /api/fruits/:id — remove fruit (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await Fruit.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Fruit not found' });
    }

    res.json({ message: 'Fruit deleted' });
  } catch (err) {
    console.error('Delete fruit error:', err);
    res.status(500).json({ error: 'Failed to delete fruit' });
  }
});

module.exports = router;


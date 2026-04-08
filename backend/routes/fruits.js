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
      query.available = 1;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const fruits = await Fruit.find(query).sort({ category: 1, name: 1 });
    res.json({ fruits });
  } catch (err) {
    console.error('Get fruits error:', err);
    res.status(500).json({ error: 'Failed to fetch fruits' });
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
    const { name, description, price, unit, stock_kg, image_url, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const fruit = await Fruit.create({
      name,
      description: description || '',
      price,
      unit: unit || 'per kg',
      stock_kg: stock_kg || 0,
      image_url: image_url || '',
      category: category || 'everyday',
      available: 1
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
    const updatableFields = ['name', 'description', 'price', 'unit', 'stock_kg', 'image_url', 'category', 'available'];
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

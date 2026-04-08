const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Fruit = require('../models/Fruit');

async function initializeDatabase() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    const mongoURI = process.env.MONGODB_URL || 'mongodb://localhost:27017/freshfruit';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully');

    // Seed Admin Data
    const adminExists = await User.findOne({ email: 'admin@freshfruit.com' });
    if (!adminExists) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@freshfruit.com',
        password_hash: passwordHash,
        phone: '+918438487646',
        role: 'admin',
      });
      console.log('✅ Default admin created: admin@freshfruit.com / admin123');
    }

    // Seed Fruits Data
    const fruitCount = await Fruit.countDocuments();
    if (fruitCount === 0) {
      const fruitsToSeed = [
        {name: 'Bananas', description: 'Fresh yellow bananas, naturally ripened. Perfect for smoothies and snacking.', price: 40, unit: 'per dozen', stock_kg: 500, image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600', category: 'everyday'},
        {name: 'Mangoes', description: 'Premium Alphonso mangoes, handpicked from Ratnagiri farms. Sweet and juicy.', price: 120, unit: 'per kg', stock_kg: 300, image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600', category: 'seasonal'},
        {name: 'Guavas', description: 'Crisp and fragrant guavas, rich in vitamin C. Great for health-conscious buyers.', price: 60, unit: 'per kg', stock_kg: 200, image_url: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600', category: 'everyday'},
        {name: 'Seasonal Mix', description: 'A curated mix of the best seasonal fruits available today.', price: 80, unit: 'per kg', stock_kg: 400, image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600', category: 'seasonal'},
        {name: 'Watermelon', description: 'Juicy and refreshing watermelons, perfect for summer. Sweet red flesh.', price: 30, unit: 'per kg', stock_kg: 800, image_url: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=600', category: 'seasonal'},
        {name: 'Pomegranate', description: 'Ruby red pomegranates with sweet-tart seeds. Packed with antioxidants.', price: 150, unit: 'per kg', stock_kg: 150, image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600', category: 'everyday'},
        {name: 'Papaya', description: 'Sweet and tender papayas, rich in digestive enzymes. Excellent for gut health.', price: 45, unit: 'per kg', stock_kg: 250, image_url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600', category: 'everyday'},
        {name: 'Dragon Fruit', description: 'Exotic pink dragon fruit with white flesh dotted with tiny seeds. Mildly sweet.', price: 200, unit: 'per kg', stock_kg: 80, image_url: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600', category: 'exotic'},
        {name: 'Kiwi', description: 'Tangy green kiwi fruit imported from New Zealand. Rich in vitamin C and fiber.', price: 180, unit: 'per kg', stock_kg: 100, image_url: 'https://images.unsplash.com/photo-1585059895524-72f6f4260004?w=600', category: 'exotic'},
        {name: 'Sapota (Chiku)', description: 'Sweet and grainy sapota fruit, a beloved Indian favourite. Natural energy booster.', price: 70, unit: 'per kg', stock_kg: 180, image_url: 'https://images.unsplash.com/photo-1602813812581-0713a2b70ddf?w=600', category: 'everyday'},
        {name: 'Oranges', description: 'Nagpur oranges, bursting with citrusy flavour. Freshly picked and naturally sweet.', price: 55, unit: 'per kg', stock_kg: 350, image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600', category: 'everyday'},
        {name: 'Grapes', description: 'Seedless green grapes, crisp and juicy. Perfect for snacking and fruit salads.', price: 90, unit: 'per kg', stock_kg: 200, image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600', category: 'everyday'},
      ];

      await Fruit.insertMany(fruitsToSeed);
      console.log(`✅ Seeded ${fruitsToSeed.length} fruits`);
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };

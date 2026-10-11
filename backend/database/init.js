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

    // Always reseed fruits to match new schema
    await Fruit.deleteMany({});
    const fruitsToSeed = [
  {
    name: "Apple",
    description: "Fresh and crispy red apples.",
    purchasePrice: 150,
    sellingPrice: 180,
    unit: "per kg",
    quantity: 500,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
    category: "everyday",
    status: "Available"
  },
  {
    name: "Banana",
    description: "Sweet and nutritious bananas.",
    purchasePrice: 40,
    sellingPrice: 60,
    unit: "per dozen",
    quantity: 1000,
    image_url: "/fruits/bananas_1775554021235.png",
    category: "everyday",
    status: "Available"
  },
  {
    name: "Mango",
    description: "Juicy Alphonso mangoes.",
    purchasePrice: 200,
    sellingPrice: 250,
    unit: "per kg",
    quantity: 300,
    image_url: "/fruits/mangoes_1775554060469.png",
    category: "seasonal",
    status: "Available"
  },
  {
    name: "Orange",
    description: "Citrusy fresh oranges packed with Vitamin C.",
    purchasePrice: 80,
    sellingPrice: 120,
    unit: "per kg",
    quantity: 600,
    image_url: "/fruits/oranges_fresh.png",
    category: "everyday",
    status: "Available"
  },
  {
    name: "Pomegranate",
    description: "Sweet ruby red pomegranates.",
    purchasePrice: 180,
    sellingPrice: 220,
    unit: "per kg",
    quantity: 400,
    image_url: "/fruits/pomegranate_1775554228161.png",
    category: "everyday",
    status: "Available"
  },
  {
    name: "Watermelon",
    description: "Refreshing and hydrating watermelon.",
    purchasePrice: 30,
    sellingPrice: 50,
    unit: "per kg",
    quantity: 1500,
    image_url: "/fruits/watermelon_1775554195708.png",
    category: "seasonal",
    status: "Available"
  },
  {
    name: "Grapes",
    description: "Seedless green grapes.",
    purchasePrice: 120,
    sellingPrice: 160,
    unit: "per kg",
    quantity: 350,
    image_url: "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=600",
    category: "everyday",
    status: "Available"
  },
  {
    name: "Papaya",
    description: "Ripe and sweet papaya, great for digestion.",
    purchasePrice: 40,
    sellingPrice: 60,
    unit: "per piece",
    quantity: 250,
    image_url: "/fruits/papaya_fresh.png",
    category: "everyday",
    status: "Available"
  },
  {
    name: "Pineapple",
    description: "Tangy and sweet tropical pineapple.",
    purchasePrice: 60,
    sellingPrice: 90,
    unit: "per piece",
    quantity: 300,
    image_url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Guava",
    description: "Fresh green guava.",
    purchasePrice: 50,
    sellingPrice: 80,
    unit: "per kg",
    quantity: 450,
    image_url: "/fruits/guavas_1775554138369.png",
    category: "seasonal",
    status: "Available"
  },
  {
    name: "Kiwi",
    description: "Zesty green kiwis.",
    purchasePrice: 150,
    sellingPrice: 200,
    unit: "per box",
    quantity: 200,
    image_url: "/fruits/kiwi_fresh.png",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Dragon Fruit",
    description: "Vibrant and exotic dragon fruit.",
    purchasePrice: 200,
    sellingPrice: 250,
    unit: "per kg",
    quantity: 150,
    image_url: "/fruits/dragon_fruit_fresh.png",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Strawberry",
    description: "Fresh and sweet red strawberries.",
    purchasePrice: 250,
    sellingPrice: 350,
    unit: "per box",
    quantity: 200,
    image_url: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=600",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Blueberry",
    description: "Antioxidant-rich fresh blueberries.",
    purchasePrice: 400,
    sellingPrice: 500,
    unit: "per box",
    quantity: 100,
    image_url: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Avocado",
    description: "Creamy Hass avocados.",
    purchasePrice: 300,
    sellingPrice: 400,
    unit: "per kg",
    quantity: 150,
    image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Jackfruit",
    description: "Sweet and fleshy jackfruit pieces.",
    purchasePrice: 100,
    sellingPrice: 150,
    unit: "per kg",
    quantity: 250,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/The_jackfruit_is_holding_on_to_the_tree.jpg/960px-The_jackfruit_is_holding_on_to_the_tree.jpg",
    category: "seasonal",
    status: "Available"
  },
  {
    name: "Rambutan",
    description: "Sweet and hairy exotic rambutan.",
    purchasePrice: 350,
    sellingPrice: 450,
    unit: "per kg",
    quantity: 100,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Rambutan_white_background_alt.jpg/960px-Rambutan_white_background_alt.jpg",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Custard Apple",
    description: "Creamy and sweet sitaphal.",
    purchasePrice: 150,
    sellingPrice: 200,
    unit: "per kg",
    quantity: 200,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Berthe_Hoola_van_Nooten53.jpg/960px-Berthe_Hoola_van_Nooten53.jpg",
    category: "seasonal",
    status: "Available"
  },
  {
    name: "Peach",
    description: "Soft and juicy peaches.",
    purchasePrice: 200,
    sellingPrice: 280,
    unit: "per kg",
    quantity: 150,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Illustration_Prunus_persica_clean_no_descr.jpg/960px-Illustration_Prunus_persica_clean_no_descr.jpg",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Cherry",
    description: "Premium dark sweet cherries.",
    purchasePrice: 600,
    sellingPrice: 800,
    unit: "per box",
    quantity: 80,
    image_url: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Plum",
    description: "Sweet and tart fresh plums.",
    purchasePrice: 180,
    sellingPrice: 250,
    unit: "per kg",
    quantity: 120,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Plums_African_Rose_-_whole%2C_halved_and_slice.jpg/960px-Plums_African_Rose_-_whole%2C_halved_and_slice.jpg",
    category: "seasonal",
    status: "Available"
  },
  {
    name: "Pear",
    description: "Crisp green pears.",
    purchasePrice: 120,
    sellingPrice: 180,
    unit: "per kg",
    quantity: 300,
    image_url: "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600",
    category: "everyday",
    status: "Available"
  },
  {
    name: "Lychee",
    description: "Sweet and fragrant lychee.",
    purchasePrice: 250,
    sellingPrice: 350,
    unit: "per kg",
    quantity: 150,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Litchi_chinensis_fruits.JPG/960px-Litchi_chinensis_fruits.JPG",
    category: "seasonal",
    status: "Available"
  },
  {
    name: "Blackberry",
    description: "Fresh and plump blackberries.",
    purchasePrice: 350,
    sellingPrice: 450,
    unit: "per box",
    quantity: 120,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Ripe%2C_ripening%2C_and_green_blackberries.jpg/960px-Ripe%2C_ripening%2C_and_green_blackberries.jpg",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Raspberry",
    description: "Sweet and tart red raspberries.",
    purchasePrice: 400,
    sellingPrice: 500,
    unit: "per box",
    quantity: 100,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Raspberry_-_halved_%28Rubus_idaeus%29.jpg/960px-Raspberry_-_halved_%28Rubus_idaeus%29.jpg",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Lemon",
    description: "Zesty and fresh yellow lemons.",
    purchasePrice: 60,
    sellingPrice: 100,
    unit: "per kg",
    quantity: 500,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/P1030323.JPG/960px-P1030323.JPG",
    category: "everyday",
    status: "Available"
  },
  
  {
    name: "Grapefruit",
    description: "Ruby red refreshing grapefruit.",
    purchasePrice: 120,
    sellingPrice: 180,
    unit: "per piece",
    quantity: 200,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Grapefruits_-_whole-halved-segments.jpg/960px-Grapefruits_-_whole-halved-segments.jpg",
    category: "exotic",
    status: "Available"
  },
  
  
  {
    name: "Fig",
    description: "Fresh and sweet Anjeer.",
    purchasePrice: 200,
    sellingPrice: 280,
    unit: "per box",
    quantity: 150,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Ficus_carica_L%2C_1771.jpg",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Dates",
    description: "Premium sweet dates.",
    purchasePrice: 300,
    sellingPrice: 450,
    unit: "per box",
    quantity: 250,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Dates005.jpg/960px-Dates005.jpg",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Passion Fruit",
    description: "Tangy and tropical passion fruit.",
    purchasePrice: 350,
    sellingPrice: 450,
    unit: "per kg",
    quantity: 100,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Passiflora_edulis_forma_flavicarpa.jpg",
    category: "exotic",
    status: "Available"
  },
  {
    name: "Starfruit",
    description: "Crunchy and juicy Carambola.",
    purchasePrice: 150,
    sellingPrice: 220,
    unit: "per kg",
    quantity: 150,
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Averrhoa_carambola_ARS_k5735-7.jpg/960px-Averrhoa_carambola_ARS_k5735-7.jpg",
    category: "exotic",
    status: "Available"
  },
  
  
  
  
  {
    name: "Sapota (Chikoo)",
    description: "Sweet and grainy Chikoo.",
    purchasePrice: 80,
    sellingPrice: 120,
    unit: "per kg",
    quantity: 400,
    image_url: "/fruits/sapota_fresh.png",
    category: "everyday",
    status: "Available"
  },
  {
    name: "Gooseberry (Amla)",
    description: "Vitamin C rich fresh Amla.",
    purchasePrice: 60,
    sellingPrice: 90,
    unit: "per kg",
    quantity: 500,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Phyllanthus_officinalis.jpg",
    category: "everyday",
    status: "Available"
  },
  
  {
    name: "Seasonal Mix",
    description: "A curated mix of the best seasonal fruits available today.",
    purchasePrice: 50,
    sellingPrice: 80,
    unit: "per kg",
    quantity: 400,
    image_url: "/fruits/seasonal_mix_1775554180768.png",
    category: "seasonal",
    status: "Available"
  }
];

    await Fruit.insertMany(fruitsToSeed);
    console.log(`✅ Seeded ${fruitsToSeed.length} fruits`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };

const mongoose = require('mongoose');
require('dotenv').config();
const Fruit = require('./models/Fruit');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/freshfruit';

const fruitsData = [
  {
    name: 'Apple',
    description: 'Fresh and crispy red apples.',
    purchasePrice: 150,
    sellingPrice: 180,
    originalPrice: 200,
    discount: 10,
    unit: 'per kg',
    quantity: 50,
    category: 'everyday',
    rating: 4.8,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg'
  },
  {
    name: 'Banana',
    description: 'Sweet and nutritious bananas.',
    purchasePrice: 40,
    sellingPrice: 60,
    unit: 'per dozen',
    quantity: 100,
    category: 'everyday',
    rating: 4.6,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg'
  },
  {
    name: 'Mango',
    description: 'Juicy Alphonso mangoes.',
    purchasePrice: 200,
    sellingPrice: 250,
    originalPrice: 300,
    discount: 15,
    unit: 'per kg',
    quantity: 30,
    category: 'seasonal',
    rating: 4.9,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg'
  },
  {
    name: 'Orange',
    description: 'Citrusy fresh oranges packed with Vitamin C.',
    purchasePrice: 80,
    sellingPrice: 120,
    unit: 'per kg',
    quantity: 60,
    category: 'everyday',
    rating: 4.5,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg'
  },
  {
    name: 'Pomegranate',
    description: 'Sweet ruby red pomegranates.',
    purchasePrice: 180,
    sellingPrice: 220,
    unit: 'per kg',
    quantity: 40,
    category: 'seasonal',
    rating: 4.7,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Pomegranate.jpg'
  },
  {
    name: 'Watermelon',
    description: 'Refreshing and hydrating watermelon.',
    purchasePrice: 30,
    sellingPrice: 50,
    unit: 'per kg',
    quantity: 150,
    category: 'seasonal',
    rating: 4.4,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Watermelon_whole.jpg'
  },
  {
    name: 'Grapes',
    description: 'Seedless green grapes.',
    purchasePrice: 120,
    sellingPrice: 160,
    unit: 'per kg',
    quantity: 35,
    category: 'everyday',
    rating: 4.6,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Kyoho-grape.jpg'
  },
  {
    name: 'Papaya',
    description: 'Ripe and sweet papaya, great for digestion.',
    purchasePrice: 40,
    sellingPrice: 60,
    unit: 'per piece',
    quantity: 25,
    category: 'everyday',
    rating: 4.3,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Papaya_cross_section_BNC.jpg'
  },
  {
    name: 'Pineapple',
    description: 'Tangy and sweet tropical pineapple.',
    purchasePrice: 60,
    sellingPrice: 90,
    unit: 'per piece',
    quantity: 30,
    category: 'exotic',
    rating: 4.5,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Pineapple_and_cross_section.jpg'
  },
  {
    name: 'Guava',
    description: 'Fresh green guava.',
    purchasePrice: 50,
    sellingPrice: 80,
    unit: 'per kg',
    quantity: 45,
    category: 'seasonal',
    rating: 4.4,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Guava_ID.jpg'
  },
  {
    name: 'Kiwi',
    description: 'Zesty green kiwis.',
    purchasePrice: 150,
    sellingPrice: 200,
    unit: 'per box',
    quantity: 20,
    category: 'exotic',
    rating: 4.8,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Kiwi_aka.jpg'
  },
  {
    name: 'Dragon Fruit',
    description: 'Vibrant and exotic dragon fruit.',
    purchasePrice: 200,
    sellingPrice: 250,
    originalPrice: 300,
    discount: 15,
    unit: 'per kg',
    quantity: 15,
    category: 'exotic',
    rating: 4.7,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Pitaya_cross_section_ed2.jpg'
  },
  {
    name: 'Strawberry',
    description: 'Fresh and sweet red strawberries.',
    purchasePrice: 250,
    sellingPrice: 350,
    unit: 'per box',
    quantity: 20,
    category: 'exotic',
    rating: 4.9,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/PerfectStrawberry.jpg'
  },
  {
    name: 'Blueberry',
    description: 'Antioxidant-rich fresh blueberries.',
    purchasePrice: 400,
    sellingPrice: 500,
    unit: 'per box',
    quantity: 10,
    category: 'exotic',
    rating: 4.9,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Blueberries.jpg'
  },
  {
    name: 'Avocado',
    description: 'Creamy Hass avocados.',
    purchasePrice: 300,
    sellingPrice: 400,
    unit: 'per kg',
    quantity: 15,
    category: 'exotic',
    rating: 4.8,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Avocado_Hass_-_single_and_halved.jpg'
  },
  {
    name: 'Jackfruit',
    description: 'Sweet and fleshy jackfruit pieces.',
    purchasePrice: 100,
    sellingPrice: 150,
    unit: 'per kg',
    quantity: 25,
    category: 'seasonal',
    rating: 4.5,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Jackfruit_cut_and_whole.jpg'
  },
  {
    name: 'Rambutan',
    description: 'Sweet and hairy exotic rambutan.',
    purchasePrice: 350,
    sellingPrice: 450,
    unit: 'per kg',
    quantity: 10,
    category: 'exotic',
    rating: 4.6,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Rambutan_fruit.jpg'
  },
  {
    name: 'Custard Apple',
    description: 'Creamy and sweet sitaphal.',
    purchasePrice: 150,
    sellingPrice: 200,
    unit: 'per kg',
    quantity: 20,
    category: 'seasonal',
    rating: 4.7,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Custard_apple.jpg'
  },
  // Additional fruits
  {
    name: 'Peach',
    description: 'Soft and juicy peaches.',
    purchasePrice: 200,
    sellingPrice: 280,
    unit: 'per kg',
    quantity: 15,
    category: 'exotic',
    rating: 4.6,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Peach-Macro.jpg'
  },
  {
    name: 'Cherry',
    description: 'Premium dark sweet cherries.',
    purchasePrice: 600,
    sellingPrice: 800,
    unit: 'per box',
    quantity: 8,
    category: 'exotic',
    rating: 4.9,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Cherry_Stella444.jpg'
  },
  {
    name: 'Plum',
    description: 'Sweet and tart fresh plums.',
    purchasePrice: 180,
    sellingPrice: 250,
    unit: 'per kg',
    quantity: 12,
    category: 'seasonal',
    rating: 4.4,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Plums_in_a_basket.jpg'
  },
  {
    name: 'Pear',
    description: 'Crisp green pears.',
    purchasePrice: 120,
    sellingPrice: 180,
    unit: 'per kg',
    quantity: 30,
    category: 'everyday',
    rating: 4.5,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Pears.jpg'
  },
  {
    name: 'Lychee',
    description: 'Sweet and fragrant lychee.',
    purchasePrice: 250,
    sellingPrice: 350,
    unit: 'per kg',
    quantity: 15,
    category: 'seasonal',
    rating: 4.8,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Litchi_chinensis_Luc_Viatour.jpg'
  },
  {
    name: 'Blackberry',
    description: 'Fresh and plump blackberries.',
    purchasePrice: 350,
    sellingPrice: 450,
    unit: 'per box',
    quantity: 12,
    category: 'exotic',
    rating: 4.7,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Blackberry_fruit_and_leaves.jpg'
  },
  {
    name: 'Raspberry',
    description: 'Sweet and tart red raspberries.',
    purchasePrice: 400,
    sellingPrice: 500,
    unit: 'per box',
    quantity: 10,
    category: 'exotic',
    rating: 4.8,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Raspberries_%281%29.jpg'
  },
  {
    name: 'Lemon',
    description: 'Zesty and fresh yellow lemons.',
    purchasePrice: 60,
    sellingPrice: 100,
    unit: 'per kg',
    quantity: 50,
    category: 'everyday',
    rating: 4.6,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Lemon.jpg'
  },
  
  {
    name: 'Grapefruit',
    description: 'Ruby red refreshing grapefruit.',
    purchasePrice: 120,
    sellingPrice: 180,
    unit: 'per piece',
    quantity: 20,
    category: 'exotic',
    rating: 4.4,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Grapefruit.jpg'
  },
  
  
  {
    name: 'Fig',
    description: 'Fresh and sweet Anjeer.',
    purchasePrice: 200,
    sellingPrice: 280,
    unit: 'per box',
    quantity: 15,
    category: 'exotic',
    rating: 4.6,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Ficus_carica_007.JPG'
  },
  {
    name: 'Dates',
    description: 'Premium sweet dates.',
    purchasePrice: 300,
    sellingPrice: 450,
    unit: 'per box',
    quantity: 25,
    category: 'exotic',
    rating: 4.9,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Dates-on-a-plate.jpg'
  },
  {
    name: 'Passion Fruit',
    description: 'Tangy and tropical passion fruit.',
    purchasePrice: 350,
    sellingPrice: 450,
    unit: 'per kg',
    quantity: 10,
    category: 'exotic',
    rating: 4.5,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Passion_Fruit_Macro.jpg'
  },
  {
    name: 'Starfruit',
    description: 'Crunchy and juicy Carambola.',
    purchasePrice: 150,
    sellingPrice: 220,
    unit: 'per kg',
    quantity: 15,
    category: 'exotic',
    rating: 4.3,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Carambola_Starfruit.jpg'
  },
  
  
  
  
  {
    name: 'Sapota',
    description: 'Sweet and grainy Chikoo.',
    purchasePrice: 80,
    sellingPrice: 120,
    unit: 'per kg',
    quantity: 40,
    category: 'everyday',
    rating: 4.6,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Sapodilla_fruit.jpg'
  },
  {
    name: 'Gooseberry',
    description: 'Vitamin C rich fresh Amla.',
    purchasePrice: 60,
    sellingPrice: 90,
    unit: 'per kg',
    quantity: 50,
    category: 'everyday',
    rating: 4.4,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Indian_Gooseberry.jpg'
  },
  
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');

    let inserted = 0;
    for (const fruit of fruitsData) {
      // Use upsert to avoid creating duplicate fruits if they already exist
      const res = await Fruit.updateOne(
        { name: fruit.name },
        { $set: fruit },
        { upsert: true }
      );
      if (res.upsertedCount > 0 || res.modifiedCount > 0) {
        inserted++;
      }
    }

    console.log(`Upserted ${inserted} fruits successfully!`);
  } catch (err) {
    console.error('Error seeding fruits:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();

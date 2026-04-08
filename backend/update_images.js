const mongoose = require('mongoose');
const Fruit = require('./models/Fruit');

const imageMapping = {
  'Bananas': '/fruits/bananas_1775554021235.png',
  'Mangoes': '/fruits/mangoes_1775554060469.png',
  'Guavas': '/fruits/guavas_1775554138369.png',
  'Seasonal Mix': '/fruits/seasonal_mix_1775554180768.png',
  'Watermelon': '/fruits/watermelon_1775554195708.png',
  'Pomegranate': '/fruits/pomegranate_1775554228161.png',
  'Papaya': 'https://upload.wikimedia.org/wikipedia/commons/6/68/Papaya_cross_section_BGI.jpg',
  'Dragon Fruit': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Pitaya_cross_section_ed2.jpg',
  'Kiwi': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Kiwi_%28Actinidia_chinensis%29_1_Luc_Viatour.jpg',
  'Sapota (Chiku)': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Sapodilla_fruit.jpg',
  'Oranges': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg',
  'Grapes': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Table_grapes_on_white.jpg',
};

async function updateImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/freshfruit');
    console.log('Connected.');

    for (const [fruitName, imgUrl] of Object.entries(imageMapping)) {
      const result = await Fruit.updateOne({ name: fruitName }, { image_url: imgUrl });
      console.log(`Updated ${fruitName}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    }

    console.log('All image URLs have been updated.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateImages();

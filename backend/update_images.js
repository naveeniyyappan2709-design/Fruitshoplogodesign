const mongoose = require('mongoose');
const Fruit = require('./models/Fruit');

const imageMapping = {
  'Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600',
  'Mangoes': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600',
  'Guavas': 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600',
  'Seasonal Mix': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
  'Watermelon': 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=600',
  'Pomegranate': '/pomegranate.png',
  'Papaya': 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600',
  'Dragon Fruit': 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600',
  'Kiwi': '/kiwi.png',
  'Sapota (Chiku)': '/sapota.png',
  'Oranges': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600',
  'Grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600',
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

const mongoose = require('mongoose');
const Fruit = require('./models/Fruit');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/freshfruit';

const imageMapping = {
  'Apple': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg',
  'Banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=1000',
  'Mango': 'https://images.unsplash.com/photo-1553279768-865429fd41ce?q=80&w=1000',
  'Orange': 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=1000',
  'Pomegranate': 'https://images.unsplash.com/photo-1615486171448-4fd13dbd0889?q=80&w=1000',
  'Watermelon': 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?q=80&w=1000',
  'Grapes': 'https://images.unsplash.com/photo-1596363505729-4190a9506133?q=80&w=1000',
  'Papaya': 'https://images.unsplash.com/photo-1617112848923-cc2234394a8a?q=80&w=1000',
  'Pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=1000',
  'Guava': 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?q=80&w=1000',
  'Kiwi': 'https://images.unsplash.com/photo-1585059895524-72359e06138a?q=80&w=1000',
  'Dragon Fruit': 'https://images.unsplash.com/photo-1527325678964-54921661f888?q=80&w=1000',
  'Strawberry': 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?q=80&w=1000',
  'Blueberry': 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80&w=1000',
  'Avocado': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=1000',
  'Jackfruit': 'https://images.unsplash.com/photo-1534062118335-e110b893f4ee?q=80&w=1000',
  'Rambutan': 'https://images.unsplash.com/photo-1590005075670-681b9e289f68?q=80&w=1000',
  'Custard Apple': 'https://images.unsplash.com/photo-1628156641885-3b952f43709f?q=80&w=1000',
  'Peach': 'https://images.unsplash.com/photo-1629824647317-024213197116?q=80&w=1000',
  'Cherry': 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?q=80&w=1000',
  'Plum': 'https://images.unsplash.com/photo-1601614761421-eb37937dae61?q=80&w=1000',
  'Pear': 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?q=80&w=1000',
  'Lychee': 'https://images.unsplash.com/photo-1594910118546-5e0427ec50c7?q=80&w=1000',
  'Blackberry': 'https://images.unsplash.com/photo-1615485966391-768a4d70bba3?q=80&w=1000',
  'Raspberry': 'https://images.unsplash.com/photo-1577006859367-a06518170b67?q=80&w=1000',
  'Lemon': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000',
  'Lime': 'https://images.unsplash.com/photo-1599818817290-7d63630f9cc9?q=80&w=1000',
  'Grapefruit': 'https://images.unsplash.com/photo-1557088924-a78b54b0c797?q=80&w=1000',
  'Sweet Lime': 'https://images.unsplash.com/photo-1596489438908-01e4ecb74de1?q=80&w=1000',
  'Coconut': 'https://images.unsplash.com/photo-1526424345638-095a5fbc40d2?q=80&w=1000',
  'Fig': 'https://images.unsplash.com/photo-1596704104975-d2fc751a084c?q=80&w=1000',
  'Dates': 'https://images.unsplash.com/photo-1596547610099-a9a3f9e984cc?q=80&w=1000',
  'Passion Fruit': 'https://images.unsplash.com/photo-1563223126-78b17643e260?q=80&w=1000',
  'Starfruit': 'https://images.unsplash.com/photo-1582800378051-51fbb3a9254d?q=80&w=1000',
  'Mangosteen': 'https://images.unsplash.com/photo-1596207869631-0df042b568c0?q=80&w=1000',
  'Cantaloupe': 'https://images.unsplash.com/photo-1598268121084-c8f7126e0cef?q=80&w=1000',
  'Honeydew Melon': 'https://images.unsplash.com/photo-1629235070267-33ee66b442be?q=80&w=1000',
  'Apricot': 'https://images.unsplash.com/photo-1589139989824-c13f69b83b6f?q=80&w=1000',
  'Sapota (Chikoo)': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Sapodilla_fruit.jpg',
  'Sapota': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Sapodilla_fruit.jpg',
  'Gooseberry (Amla)': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Indian_Gooseberry.jpg',
  'Gooseberry': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Indian_Gooseberry.jpg',
  'Tamarind': 'https://images.unsplash.com/photo-1592652194689-08200dd881d7?q=80&w=1000',
  'Seasonal Mix': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=1000'
};

async function fix() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');

    for (const [name, url] of Object.entries(imageMapping)) {
      const res = await Fruit.updateMany({ name: name }, { $set: { image_url: url } });
      console.log(`Updated ${name} to ${url} - Modified: ${res.modifiedCount}`);
    }

    console.log('Done fixing external images.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();

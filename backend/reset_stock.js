const mongoose = require('mongoose');
const Fruit = require('./models/Fruit');
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/freshfruit';

async function resetStock() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');

    const result = await Fruit.updateMany(
      {},
      { 
        $set: { 
          quantity: 100, 
          minStock: 10,
          status: 'Available'
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} fruits successfully to 100kg quantity.`);
  } catch (err) {
    console.error('Error updating fruits:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetStock();

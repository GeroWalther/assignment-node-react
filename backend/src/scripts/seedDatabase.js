const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Item = require('../models/Item');

// Load environment variables
require('dotenv').config();

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    const mongoURI =
      process.env.MONGODB_URI ||
      'mongodb://admin:password123@localhost:27017/assessment_db?authSource=admin';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if items already exist
    const existingCount = await Item.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} items`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        readline.question(
          'Do you want to clear existing data and reseed? (y/N): ',
          resolve
        );
      });
      readline.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Seeding cancelled');
        process.exit(0);
      }

      // Clear existing data
      await Item.deleteMany({});
      console.log('🗑️  Cleared existing items');
    }

    // Read JSON data
    console.log('📖 Reading items from JSON file...');
    const rawData = await fs.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(rawData);
    console.log(`📊 Found ${items.length} items to import`);

    // Insert items into MongoDB
    console.log('💾 Inserting items into MongoDB...');
    const result = await Item.insertMany(items);
    console.log(`✅ Successfully inserted ${result.length} items`);

    // Verify the data
    const totalItems = await Item.countDocuments();
    console.log(`🔍 Total items in database: ${totalItems}`);

    // Show some sample data
    const sampleItems = await Item.find().limit(3);
    console.log('📋 Sample items:');
    sampleItems.forEach((item) => {
      console.log(`   - ${item.name} (${item.category}) - $${item.price}`);
    });

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

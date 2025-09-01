const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string for Docker container
    const mongoURI =
      process.env.MONGODB_URI ||
      'mongodb://admin:password123@localhost:27017/assessment_db?authSource=admin';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;

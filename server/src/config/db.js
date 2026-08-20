const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-quiz-platform');
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn('[MongoDB Warning]: Server will continue running, but database operations may fail until MongoDB is connected.');
  }
};

module.exports = connectDB;

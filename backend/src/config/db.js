const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Mongoose 8 defaults are already sane (no need for useNewUrlParser etc.)
// Connection pooling is tuned so a single Node process can serve many
// concurrent requests without exhausting Mongo connections when we later
// scale horizontally behind a load balancer (see README "Scalability").
const connectDB = async () => {
  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 50, // per instance; keep total (instances * poolSize) under Atlas connection limit
    minPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  logger.info(`MongoDB connected: ${conn.connection.host}`);

  mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  return conn;
};

module.exports = connectDB;

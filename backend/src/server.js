require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`);
  server?.close(() => process.exit(1));
});

// Render sends SIGTERM on deploy/scale-down — shut down cleanly so
// in-flight requests finish (important behind a load balancer).
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server?.close(() => logger.info('Process terminated'));
});

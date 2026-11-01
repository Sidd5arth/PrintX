require('dotenv').config();

const { createApp } = require('./app');
const { initDb, closeDb } = require('./config/db2');
const logger = require('./utils/logger');

const PORT = Number(process.env.PORT || 4000);

async function start() {
  await initDb();
  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`printX API listening on port ${PORT}`, {
      env: process.env.NODE_ENV || 'development',
    });
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down`);
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) });
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

start().catch((err) => {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  process.exit(1);
});

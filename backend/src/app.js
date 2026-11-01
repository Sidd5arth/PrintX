const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { assignRequestId, httpLogger } = require('./middleware/requestLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const invoicesRouter = require('./routes/invoices');
const receiptsRouter = require('./routes/receipts');
const db2 = require('./config/db2');

function createApp() {
  const app = express();

  const origins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: origins.includes('*') ? true : origins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(assignRequestId);
  app.use(httpLogger);

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      status: 'ok',
      service: 'printx-api',
      db2Mock: db2.isMockMode(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/invoices', invoicesRouter);
  app.use('/api/receipts', receiptsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

const crypto = require('crypto');
const morgan = require('morgan');
const logger = require('../utils/logger');

function assignRequestId(req, res, next) {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

morgan.token('request-id', (req) => req.requestId);

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

const httpLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms rid=:request-id',
  { stream }
);

module.exports = { assignRequestId, httpLogger };

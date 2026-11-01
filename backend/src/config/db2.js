const logger = require('../utils/logger');

const useMock = String(process.env.DB2_MOCK || 'true').toLowerCase() === 'true';

let ibmdb = null;
let pool = null;

function getConnectionString() {
  return process.env.DB2_DSN || '';
}

async function initDb() {
  if (useMock) {
    logger.warn('DB2_MOCK=true — using in-memory sample data');
    return;
  }

  try {
    ibmdb = require('ibm_db');
    const connStr = getConnectionString();
    if (!connStr) {
      throw new Error('DB2_DSN is required when DB2_MOCK=false');
    }
    pool = await new Promise((resolve, reject) => {
      ibmdb.open(connStr, (err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });
    logger.info('Connected to IBM DB2');
  } catch (err) {
    logger.error('Failed to connect to DB2', { error: err.message });
    throw err;
  }
}

/**
 * Execute a parameterized SQL statement or CALL to a stored procedure.
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  if (useMock) {
    throw new Error('query() should not be called in mock mode — use services mock paths');
  }

  return new Promise((resolve, reject) => {
    pool.prepare(sql, (prepErr, stmt) => {
      if (prepErr) {
        return reject(prepErr);
      }
      stmt.execute(params, (execErr, result) => {
        if (execErr) {
          stmt.close(() => {});
          return reject(execErr);
        }
        result.fetchAll((fetchErr, data) => {
          result.closeSync();
          stmt.close(() => {});
          if (fetchErr) reject(fetchErr);
          else resolve(data || []);
        });
      });
    });
  });
}

/**
 * Call a DB2 stored procedure and return result sets.
 * Example: CALL PRINTX.GET_INVOICE_REPORT(?)
 */
async function callProcedure(procedureName, params = []) {
  const placeholders = params.map(() => '?').join(', ');
  const schema = process.env.DB2_SCHEMA || 'PRINTX';
  const sql = `CALL ${schema}.${procedureName}(${placeholders})`;
  logger.debug('Calling stored procedure', { procedureName, paramCount: params.length });
  return query(sql, params);
}

async function closeDb() {
  if (pool && typeof pool.close === 'function') {
    await new Promise((resolve) => {
      pool.close(() => resolve());
    });
    logger.info('DB2 connection closed');
  }
}

function isMockMode() {
  return useMock;
}

module.exports = {
  initDb,
  query,
  callProcedure,
  closeDb,
  isMockMode,
};

const db2 = require('../config/db2');
const mock = require('../data/mockStore');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

function mapReceiptRow(header, lines) {
  return {
    receiptId: header.RECEIPT_ID,
    receiptNumber: header.RECEIPT_NUMBER,
    status: header.STATUS,
    currency: header.CURRENCY,
    receiptDate: header.RECEIPT_DATE,
    paymentMethod: header.PAYMENT_METHOD,
    paymentReference: header.PAYMENT_REF,
    relatedInvoiceId: header.INVOICE_ID,
    relatedInvoiceNumber: header.INVOICE_NUMBER,
    company: {
      name: header.COMPANY_NAME,
      addressLine1: header.COMPANY_ADDR1,
      addressLine2: header.COMPANY_ADDR2,
      city: header.COMPANY_CITY,
      state: header.COMPANY_STATE,
      postalCode: header.COMPANY_POSTAL,
      country: header.COMPANY_COUNTRY,
      phone: header.COMPANY_PHONE,
      email: header.COMPANY_EMAIL,
      taxId: header.COMPANY_TAX_ID,
    },
    customer: {
      customerId: header.CUSTOMER_ID,
      name: header.CUSTOMER_NAME,
      addressLine1: header.CUSTOMER_ADDR1,
      city: header.CUSTOMER_CITY,
      state: header.CUSTOMER_STATE,
      postalCode: header.CUSTOMER_POSTAL,
      country: header.CUSTOMER_COUNTRY,
      email: header.CUSTOMER_EMAIL,
    },
    cashier: header.CASHIER,
    terminalId: header.TERMINAL_ID,
    notes: header.NOTES,
    lineItems: (lines || []).map((l) => ({
      lineNo: l.LINE_NO,
      description: l.DESCRIPTION,
      quantity: Number(l.QUANTITY),
      unitPrice: Number(l.UNIT_PRICE),
      amount: Number(l.AMOUNT),
    })),
    totals: {
      subtotal: Number(header.SUBTOTAL),
      taxTotal: Number(header.TAX_TOTAL),
      tip: Number(header.TIP),
      grandTotal: Number(header.GRAND_TOTAL),
      amountTendered: Number(header.AMOUNT_TENDERED),
      changeDue: Number(header.CHANGE_DUE),
    },
  };
}

async function getReceipt(id) {
  logger.info('Fetching receipt', { receiptId: id });

  if (db2.isMockMode()) {
    const data = mock.getReceiptById(id);
    if (!data) {
      throw new AppError(`Receipt not found: ${id}`, 404, 'RECEIPT_NOT_FOUND');
    }
    return data;
  }

  try {
    const headerRows = await db2.callProcedure('GET_RECEIPT_HEADER', [id]);
    if (!headerRows.length) {
      throw new AppError(`Receipt not found: ${id}`, 404, 'RECEIPT_NOT_FOUND');
    }
    const lineRows = await db2.callProcedure('GET_RECEIPT_LINES', [id]);
    return mapReceiptRow(headerRows[0], lineRows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error('DB2 receipt fetch failed', { receiptId: id, error: err.message });
    throw new AppError('Failed to load receipt from database', 502, 'DB2_ERROR', {
      cause: err.message,
    });
  }
}

async function searchReceipts(filters = {}) {
  logger.info('Searching receipts', filters);

  if (db2.isMockMode()) {
    return mock.listReceipts(filters).map((rcp) => ({
      receiptId: rcp.receiptId,
      receiptNumber: rcp.receiptNumber,
      customerName: rcp.customer.name,
      customerId: rcp.customer.customerId,
      receiptDate: rcp.receiptDate,
      status: rcp.status,
      grandTotal: rcp.totals.grandTotal,
      currency: rcp.currency,
      relatedInvoiceNumber: rcp.relatedInvoiceNumber,
    }));
  }

  try {
    const rows = await db2.query(
      `SELECT RECEIPT_ID, RECEIPT_NUMBER, CUSTOMER_ID, CUSTOMER_NAME,
              RECEIPT_DATE, STATUS, GRAND_TOTAL, CURRENCY, INVOICE_NUMBER
       FROM ${process.env.DB2_SCHEMA || 'PRINTX'}.RECEIPT_HEADER
       WHERE (? IS NULL OR CUSTOMER_ID = ?)
         AND (? IS NULL OR RECEIPT_DATE >= ?)
         AND (? IS NULL OR RECEIPT_DATE <= ?)
       ORDER BY RECEIPT_DATE DESC`,
      [
        filters.customerId || null,
        filters.customerId || null,
        filters.from || null,
        filters.from || null,
        filters.to || null,
        filters.to || null,
      ]
    );

    return rows.map((r) => ({
      receiptId: r.RECEIPT_ID,
      receiptNumber: r.RECEIPT_NUMBER,
      customerId: r.CUSTOMER_ID,
      customerName: r.CUSTOMER_NAME,
      receiptDate: r.RECEIPT_DATE,
      status: r.STATUS,
      grandTotal: Number(r.GRAND_TOTAL),
      currency: r.CURRENCY,
      relatedInvoiceNumber: r.INVOICE_NUMBER,
    }));
  } catch (err) {
    logger.error('DB2 receipt search failed', { error: err.message });
    throw new AppError('Failed to search receipts', 502, 'DB2_ERROR', {
      cause: err.message,
    });
  }
}

module.exports = { getReceipt, searchReceipts };

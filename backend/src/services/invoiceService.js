const db2 = require('../config/db2');
const mock = require('../data/mockStore');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

function mapInvoiceRow(header, lines) {
  return {
    invoiceId: header.INVOICE_ID,
    invoiceNumber: header.INVOICE_NUMBER,
    status: header.STATUS,
    currency: header.CURRENCY,
    issueDate: header.ISSUE_DATE,
    dueDate: header.DUE_DATE,
    paidDate: header.PAID_DATE,
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
      addressLine2: header.CUSTOMER_ADDR2,
      city: header.CUSTOMER_CITY,
      state: header.CUSTOMER_STATE,
      postalCode: header.CUSTOMER_POSTAL,
      country: header.CUSTOMER_COUNTRY,
      email: header.CUSTOMER_EMAIL,
      phone: header.CUSTOMER_PHONE,
    },
    billTo: {
      name: header.BILLTO_NAME,
      addressLine1: header.BILLTO_ADDR1,
      city: header.BILLTO_CITY,
      state: header.BILLTO_STATE,
      postalCode: header.BILLTO_POSTAL,
      country: header.BILLTO_COUNTRY,
    },
    shipTo: {
      name: header.SHIPTO_NAME,
      addressLine1: header.SHIPTO_ADDR1,
      city: header.SHIPTO_CITY,
      state: header.SHIPTO_STATE,
      postalCode: header.SHIPTO_POSTAL,
      country: header.SHIPTO_COUNTRY,
    },
    purchaseOrder: header.PO_NUMBER,
    paymentTerms: header.PAYMENT_TERMS,
    notes: header.NOTES,
    lineItems: (lines || []).map((l) => ({
      lineNo: l.LINE_NO,
      sku: l.SKU,
      description: l.DESCRIPTION,
      quantity: Number(l.QUANTITY),
      unit: l.UNIT,
      unitPrice: Number(l.UNIT_PRICE),
      discountPct: Number(l.DISCOUNT_PCT),
      taxPct: Number(l.TAX_PCT),
      amount: Number(l.AMOUNT),
    })),
    totals: {
      subtotal: Number(header.SUBTOTAL),
      discountTotal: Number(header.DISCOUNT_TOTAL),
      taxTotal: Number(header.TAX_TOTAL),
      shipping: Number(header.SHIPPING),
      grandTotal: Number(header.GRAND_TOTAL),
      amountPaid: Number(header.AMOUNT_PAID),
      balanceDue: Number(header.BALANCE_DUE),
    },
  };
}

async function getInvoice(id) {
  logger.info('Fetching invoice', { invoiceId: id });

  if (db2.isMockMode()) {
    const data = mock.getInvoiceById(id);
    if (!data) {
      throw new AppError(`Invoice not found: ${id}`, 404, 'INVOICE_NOT_FOUND');
    }
    return data;
  }

  try {
    const headerRows = await db2.callProcedure('GET_INVOICE_HEADER', [id]);
    if (!headerRows.length) {
      throw new AppError(`Invoice not found: ${id}`, 404, 'INVOICE_NOT_FOUND');
    }
    const lineRows = await db2.callProcedure('GET_INVOICE_LINES', [id]);
    return mapInvoiceRow(headerRows[0], lineRows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error('DB2 invoice fetch failed', { invoiceId: id, error: err.message });
    throw new AppError('Failed to load invoice from database', 502, 'DB2_ERROR', {
      cause: err.message,
    });
  }
}

async function searchInvoices(filters = {}) {
  logger.info('Searching invoices', filters);

  if (db2.isMockMode()) {
    return mock.listInvoices(filters).map((inv) => ({
      invoiceId: inv.invoiceId,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer.name,
      customerId: inv.customer.customerId,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      grandTotal: inv.totals.grandTotal,
      currency: inv.currency,
    }));
  }

  try {
    const rows = await db2.query(
      `SELECT INVOICE_ID, INVOICE_NUMBER, CUSTOMER_ID, CUSTOMER_NAME,
              ISSUE_DATE, DUE_DATE, STATUS, GRAND_TOTAL, CURRENCY
       FROM ${process.env.DB2_SCHEMA || 'PRINTX'}.INVOICE_HEADER
       WHERE (? IS NULL OR CUSTOMER_ID = ?)
         AND (? IS NULL OR ISSUE_DATE >= ?)
         AND (? IS NULL OR ISSUE_DATE <= ?)
       ORDER BY ISSUE_DATE DESC`,
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
      invoiceId: r.INVOICE_ID,
      invoiceNumber: r.INVOICE_NUMBER,
      customerId: r.CUSTOMER_ID,
      customerName: r.CUSTOMER_NAME,
      issueDate: r.ISSUE_DATE,
      dueDate: r.DUE_DATE,
      status: r.STATUS,
      grandTotal: Number(r.GRAND_TOTAL),
      currency: r.CURRENCY,
    }));
  } catch (err) {
    logger.error('DB2 invoice search failed', { error: err.message });
    throw new AppError('Failed to search invoices', 502, 'DB2_ERROR', {
      cause: err.message,
    });
  }
}

module.exports = { getInvoice, searchInvoices };

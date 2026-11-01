const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

process.env.DB2_MOCK = 'true';

const invoiceService = require('../src/services/invoiceService');

describe('invoiceService', () => {
  it('returns mock invoice by id', async () => {
    const inv = await invoiceService.getInvoice('INV-2026-00042');
    assert.equal(inv.invoiceNumber, 'INV-2026-00042');
    assert.ok(inv.lineItems.length >= 1);
    assert.equal(typeof inv.totals.grandTotal, 'number');
  });

  it('searches invoices', async () => {
    const list = await invoiceService.searchInvoices({ customerId: 'CUST-1001' });
    assert.ok(list.length >= 1);
    assert.equal(list[0].customerId, 'CUST-1001');
  });
});

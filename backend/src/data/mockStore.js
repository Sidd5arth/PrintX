const invoices = [
  {
    invoiceId: 'INV-2026-00042',
    invoiceNumber: 'INV-2026-00042',
    status: 'PAID',
    currency: 'USD',
    issueDate: '2026-10-15',
    dueDate: '2026-11-14',
    paidDate: '2026-10-28',
    company: {
      name: 'PrintX Solutions Inc.',
      addressLine1: '1200 Commerce Parkway',
      addressLine2: 'Suite 400',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
      phone: '+1 (512) 555-0142',
      email: 'billing@printx.example',
      taxId: 'EIN 98-7654321',
    },
    customer: {
      customerId: 'CUST-1001',
      name: 'Northwind Retail Group',
      addressLine1: '88 Market Street',
      addressLine2: 'Floor 12',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
      email: 'ap@northwind.example',
      phone: '+1 (312) 555-0199',
    },
    billTo: {
      name: 'Accounts Payable — Northwind Retail',
      addressLine1: '88 Market Street',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
    },
    shipTo: {
      name: 'Northwind DC #4',
      addressLine1: '4100 Logistics Blvd',
      city: 'Joliet',
      state: 'IL',
      postalCode: '60436',
      country: 'USA',
    },
    purchaseOrder: 'PO-88421',
    paymentTerms: 'Net 30',
    notes:
      'Thank you for your business. Please reference invoice number on all remittances. Late payments subject to 1.5% monthly finance charge.',
    lineItems: [
      {
        lineNo: 1,
        sku: 'PX-SVC-100',
        description: 'Enterprise reporting platform — annual license',
        quantity: 1,
        unit: 'EA',
        unitPrice: 12000.0,
        discountPct: 10,
        taxPct: 8.25,
        amount: 10800.0,
      },
      {
        lineNo: 2,
        sku: 'PX-IMP-210',
        description: 'Implementation & onboarding (40 hours)',
        quantity: 40,
        unit: 'HR',
        unitPrice: 185.0,
        discountPct: 0,
        taxPct: 8.25,
        amount: 7400.0,
      },
      {
        lineNo: 3,
        sku: 'PX-PRT-330',
        description: 'Print template pack — invoice & receipt suite',
        quantity: 3,
        unit: 'EA',
        unitPrice: 450.0,
        discountPct: 5,
        taxPct: 8.25,
        amount: 1282.5,
      },
      {
        lineNo: 4,
        sku: 'PX-SUP-401',
        description: 'Premium support retainer — Q4 2026',
        quantity: 1,
        unit: 'QTR',
        unitPrice: 2500.0,
        discountPct: 0,
        taxPct: 0,
        amount: 2500.0,
      },
      {
        lineNo: 5,
        sku: 'PX-TRN-505',
        description: 'Administrator training workshop',
        quantity: 2,
        unit: 'DAY',
        unitPrice: 1200.0,
        discountPct: 0,
        taxPct: 8.25,
        amount: 2400.0,
      },
      {
        lineNo: 6,
        sku: 'PX-CUS-612',
        description: 'Custom header/footer branding kit',
        quantity: 1,
        unit: 'EA',
        unitPrice: 750.0,
        discountPct: 0,
        taxPct: 8.25,
        amount: 750.0,
      },
      {
        lineNo: 7,
        sku: 'PX-API-720',
        description: 'DB2 connector add-on module',
        quantity: 1,
        unit: 'EA',
        unitPrice: 3200.0,
        discountPct: 15,
        taxPct: 8.25,
        amount: 2720.0,
      },
      {
        lineNo: 8,
        sku: 'PX-PDF-801',
        description: 'Server-side PDF rendering capacity (1M pages)',
        quantity: 1,
        unit: 'PKG',
        unitPrice: 900.0,
        discountPct: 0,
        taxPct: 8.25,
        amount: 900.0,
      },
    ],
    totals: {
      subtotal: 28752.5,
      discountTotal: 2170.0,
      taxTotal: 2167.08,
      shipping: 0,
      grandTotal: 30919.58,
      amountPaid: 30919.58,
      balanceDue: 0,
    },
  },
];

const receipts = [
  {
    receiptId: 'RCP-2026-00991',
    receiptNumber: 'RCP-2026-00991',
    status: 'COMPLETE',
    currency: 'USD',
    receiptDate: '2026-10-28',
    paymentMethod: 'ACH Transfer',
    paymentReference: 'ACH-77291044',
    relatedInvoiceId: 'INV-2026-00042',
    relatedInvoiceNumber: 'INV-2026-00042',
    company: {
      name: 'PrintX Solutions Inc.',
      addressLine1: '1200 Commerce Parkway',
      addressLine2: 'Suite 400',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
      phone: '+1 (512) 555-0142',
      email: 'billing@printx.example',
      taxId: 'EIN 98-7654321',
    },
    customer: {
      customerId: 'CUST-1001',
      name: 'Northwind Retail Group',
      addressLine1: '88 Market Street',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
      email: 'ap@northwind.example',
    },
    cashier: 'System Settlement',
    terminalId: 'WEB-API',
    notes: 'Payment applied in full against invoice INV-2026-00042.',
    lineItems: [
      {
        lineNo: 1,
        description: 'Payment toward INV-2026-00042 — Enterprise license',
        quantity: 1,
        unitPrice: 10800.0,
        amount: 10800.0,
      },
      {
        lineNo: 2,
        description: 'Payment toward INV-2026-00042 — Implementation',
        quantity: 1,
        unitPrice: 7400.0,
        amount: 7400.0,
      },
      {
        lineNo: 3,
        description: 'Payment toward INV-2026-00042 — Template pack',
        quantity: 1,
        unitPrice: 1282.5,
        amount: 1282.5,
      },
      {
        lineNo: 4,
        description: 'Payment toward INV-2026-00042 — Support retainer',
        quantity: 1,
        unitPrice: 2500.0,
        amount: 2500.0,
      },
      {
        lineNo: 5,
        description: 'Payment toward INV-2026-00042 — Training',
        quantity: 1,
        unitPrice: 2400.0,
        amount: 2400.0,
      },
      {
        lineNo: 6,
        description: 'Payment toward INV-2026-00042 — Branding kit',
        quantity: 1,
        unitPrice: 750.0,
        amount: 750.0,
      },
      {
        lineNo: 7,
        description: 'Payment toward INV-2026-00042 — DB2 connector',
        quantity: 1,
        unitPrice: 2720.0,
        amount: 2720.0,
      },
      {
        lineNo: 8,
        description: 'Payment toward INV-2026-00042 — PDF capacity',
        quantity: 1,
        unitPrice: 900.0,
        amount: 900.0,
      },
      {
        lineNo: 9,
        description: 'Sales tax collected',
        quantity: 1,
        unitPrice: 2167.08,
        amount: 2167.08,
      },
    ],
    totals: {
      subtotal: 28752.5,
      taxTotal: 2167.08,
      tip: 0,
      grandTotal: 30919.58,
      amountTendered: 30919.58,
      changeDue: 0,
    },
  },
];

function listInvoices({ customerId, from, to } = {}) {
  return invoices.filter((inv) => {
    if (customerId && inv.customer.customerId !== customerId) return false;
    if (from && inv.issueDate < from) return false;
    if (to && inv.issueDate > to) return false;
    return true;
  });
}

function getInvoiceById(id) {
  return invoices.find((i) => i.invoiceId === id || i.invoiceNumber === id) || null;
}

function listReceipts({ customerId, from, to } = {}) {
  return receipts.filter((rcp) => {
    if (customerId && rcp.customer.customerId !== customerId) return false;
    if (from && rcp.receiptDate < from) return false;
    if (to && rcp.receiptDate > to) return false;
    return true;
  });
}

function getReceiptById(id) {
  return receipts.find((r) => r.receiptId === id || r.receiptNumber === id) || null;
}

module.exports = {
  listInvoices,
  getInvoiceById,
  listReceipts,
  getReceiptById,
};

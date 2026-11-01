const puppeteer = require('puppeteer');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    Number(amount || 0)
  );
}

function formatAddress(addr = {}) {
  return [
    addr.name,
    addr.addressLine1,
    addr.addressLine2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', '),
    addr.country,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join('<br/>');
}

function invoiceHtml(data) {
  const rows = data.lineItems
    .map(
      (item) => `
      <tr>
        <td>${item.lineNo}</td>
        <td>${escapeHtml(item.sku)}</td>
        <td>${escapeHtml(item.description)}</td>
        <td class="num">${item.quantity}</td>
        <td>${escapeHtml(item.unit)}</td>
        <td class="num">${formatMoney(item.unitPrice, data.currency)}</td>
        <td class="num">${item.discountPct}%</td>
        <td class="num">${item.taxPct}%</td>
        <td class="num">${formatMoney(item.amount, data.currency)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Invoice ${escapeHtml(data.invoiceNumber)}</title>
<style>
  @page { size: letter; margin: 18mm 16mm 22mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; color: #1a1a1a; margin: 0; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0b3d2e; padding-bottom: 12px; margin-bottom: 16px; }
  .brand { font-size: 22pt; font-weight: 700; color: #0b3d2e; letter-spacing: 0.04em; }
  .meta td { padding: 2px 8px 2px 0; }
  .meta .label { color: #555; }
  .parties { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 18px 0; }
  .party h4 { margin: 0 0 6px; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.08em; color: #0b3d2e; }
  .party p { margin: 0; line-height: 1.35; }
  table.lines { width: 100%; border-collapse: collapse; margin-top: 8px; }
  table.lines thead { display: table-header-group; }
  table.lines tfoot { display: table-footer-group; }
  table.lines th { background: #0b3d2e; color: #fff; font-size: 8.5pt; text-align: left; padding: 7px 6px; }
  table.lines td { border-bottom: 1px solid #d8d8d8; padding: 6px; vertical-align: top; }
  table.lines tr { page-break-inside: avoid; }
  .num { text-align: right; white-space: nowrap; }
  .totals { width: 280px; margin-left: auto; margin-top: 14px; }
  .totals td { padding: 4px 0; }
  .totals .grand { font-weight: 700; font-size: 12pt; border-top: 2px solid #0b3d2e; }
  .notes { margin-top: 24px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9pt; color: #444; }
  .footer { position: running(footer); font-size: 8pt; color: #666; }
</style>
</head>
<body>
  <header class="header">
    <div>
      <div class="brand">${escapeHtml(data.company.name)}</div>
      <p>${formatAddress(data.company)}<br/>${escapeHtml(data.company.phone)} · ${escapeHtml(data.company.email)}</p>
    </div>
    <div>
      <h1 style="margin:0;font-size:18pt;">INVOICE</h1>
      <table class="meta">
        <tr><td class="label">Invoice #</td><td><strong>${escapeHtml(data.invoiceNumber)}</strong></td></tr>
        <tr><td class="label">Issue date</td><td>${escapeHtml(data.issueDate)}</td></tr>
        <tr><td class="label">Due date</td><td>${escapeHtml(data.dueDate)}</td></tr>
        <tr><td class="label">PO #</td><td>${escapeHtml(data.purchaseOrder)}</td></tr>
        <tr><td class="label">Status</td><td>${escapeHtml(data.status)}</td></tr>
        <tr><td class="label">Terms</td><td>${escapeHtml(data.paymentTerms)}</td></tr>
      </table>
    </div>
  </header>
  <section class="parties">
    <div class="party"><h4>Bill To</h4><p>${formatAddress(data.billTo)}</p></div>
    <div class="party"><h4>Ship To</h4><p>${formatAddress(data.shipTo)}</p></div>
    <div class="party"><h4>Customer</h4><p>${escapeHtml(data.customer.name)}<br/>${escapeHtml(data.customer.customerId)}<br/>${escapeHtml(data.customer.email)}</p></div>
  </section>
  <table class="lines">
    <thead>
      <tr>
        <th>#</th><th>SKU</th><th>Description</th><th>Qty</th><th>Unit</th>
        <th>Price</th><th>Disc</th><th>Tax</th><th>Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals">
    <tr><td>Subtotal</td><td class="num">${formatMoney(data.totals.subtotal, data.currency)}</td></tr>
    <tr><td>Discount</td><td class="num">-${formatMoney(data.totals.discountTotal, data.currency)}</td></tr>
    <tr><td>Tax</td><td class="num">${formatMoney(data.totals.taxTotal, data.currency)}</td></tr>
    <tr><td>Shipping</td><td class="num">${formatMoney(data.totals.shipping, data.currency)}</td></tr>
    <tr class="grand"><td>Grand Total</td><td class="num">${formatMoney(data.totals.grandTotal, data.currency)}</td></tr>
    <tr><td>Amount Paid</td><td class="num">${formatMoney(data.totals.amountPaid, data.currency)}</td></tr>
    <tr><td>Balance Due</td><td class="num">${formatMoney(data.totals.balanceDue, data.currency)}</td></tr>
  </table>
  <div class="notes"><strong>Notes</strong><br/>${escapeHtml(data.notes)}</div>
</body>
</html>`;
}

function receiptHtml(data) {
  const rows = data.lineItems
    .map(
      (item) => `
      <tr>
        <td>${item.lineNo}</td>
        <td>${escapeHtml(item.description)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${formatMoney(item.unitPrice, data.currency)}</td>
        <td class="num">${formatMoney(item.amount, data.currency)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Receipt ${escapeHtml(data.receiptNumber)}</title>
<style>
  @page { size: letter; margin: 16mm; }
  body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; color: #1a1a1a; margin: 0; }
  .header { text-align: center; border-bottom: 2px solid #1f3a5f; padding-bottom: 12px; margin-bottom: 16px; }
  .brand { font-size: 20pt; font-weight: 700; color: #1f3a5f; }
  .meta { width: 100%; margin: 12px 0; }
  .meta td { padding: 3px 0; }
  table.lines { width: 100%; border-collapse: collapse; }
  table.lines thead { display: table-header-group; }
  table.lines th { background: #1f3a5f; color: #fff; padding: 7px 6px; font-size: 8.5pt; text-align: left; }
  table.lines td { border-bottom: 1px solid #ddd; padding: 6px; }
  table.lines tr { page-break-inside: avoid; }
  .num { text-align: right; }
  .totals { width: 260px; margin-left: auto; margin-top: 14px; }
  .totals .grand { font-weight: 700; border-top: 2px solid #1f3a5f; }
  .notes { margin-top: 20px; font-size: 9pt; color: #444; border-top: 1px solid #ccc; padding-top: 10px; }
</style>
</head>
<body>
  <header class="header">
    <div class="brand">${escapeHtml(data.company.name)}</div>
    <div>${formatAddress(data.company)}</div>
    <h1 style="margin:10px 0 0;font-size:16pt;">PAYMENT RECEIPT</h1>
  </header>
  <table class="meta">
    <tr><td>Receipt #</td><td><strong>${escapeHtml(data.receiptNumber)}</strong></td><td>Date</td><td>${escapeHtml(data.receiptDate)}</td></tr>
    <tr><td>Customer</td><td>${escapeHtml(data.customer.name)}</td><td>Invoice</td><td>${escapeHtml(data.relatedInvoiceNumber)}</td></tr>
    <tr><td>Method</td><td>${escapeHtml(data.paymentMethod)}</td><td>Reference</td><td>${escapeHtml(data.paymentReference)}</td></tr>
    <tr><td>Terminal</td><td>${escapeHtml(data.terminalId)}</td><td>Cashier</td><td>${escapeHtml(data.cashier)}</td></tr>
  </table>
  <table class="lines">
    <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals">
    <tr><td>Subtotal</td><td class="num">${formatMoney(data.totals.subtotal, data.currency)}</td></tr>
    <tr><td>Tax</td><td class="num">${formatMoney(data.totals.taxTotal, data.currency)}</td></tr>
    <tr><td>Tip</td><td class="num">${formatMoney(data.totals.tip, data.currency)}</td></tr>
    <tr class="grand"><td>Total Paid</td><td class="num">${formatMoney(data.totals.grandTotal, data.currency)}</td></tr>
    <tr><td>Tendered</td><td class="num">${formatMoney(data.totals.amountTendered, data.currency)}</td></tr>
    <tr><td>Change</td><td class="num">${formatMoney(data.totals.changeDue, data.currency)}</td></tr>
  </table>
  <div class="notes">${escapeHtml(data.notes)}</div>
</body>
</html>`;
}

async function renderPdf(html) {
  const timeout = Number(process.env.PDF_TIMEOUT_MS || 30000);
  let browser;
  try {
    const launchOpts = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout });
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size:8px;width:100%;padding:0 16mm;color:#666;display:flex;justify-content:space-between;">
          <span>printX Confidential</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
      margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
    });
    return pdf;
  } catch (err) {
    logger.error('PDF generation failed', { error: err.message });
    throw new AppError('Failed to generate PDF', 500, 'PDF_ERROR', { cause: err.message });
  } finally {
    if (browser) await browser.close();
  }
}

async function invoicePdf(data) {
  return renderPdf(invoiceHtml(data));
}

async function receiptPdf(data) {
  return renderPdf(receiptHtml(data));
}

module.exports = { invoicePdf, receiptPdf, invoiceHtml, receiptHtml };

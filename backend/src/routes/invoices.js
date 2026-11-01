const express = require('express');
const invoiceService = require('../services/invoiceService');
const pdfService = require('../services/pdfService');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { customerId, from, to } = req.query;
    const data = await invoiceService.searchInvoices({ customerId, from, to });
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await invoiceService.getInvoice(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoice(req.params.id);
    logger.info('Generating invoice PDF', { invoiceId: req.params.id });
    const pdf = Buffer.from(await pdfService.invoicePdf(invoice));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoice.invoiceNumber}.pdf"`
    );
    res.end(pdf);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

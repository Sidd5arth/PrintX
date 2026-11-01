const express = require('express');
const receiptService = require('../services/receiptService');
const pdfService = require('../services/pdfService');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { customerId, from, to } = req.query;
    const data = await receiptService.searchReceipts({ customerId, from, to });
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await receiptService.getReceipt(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceipt(req.params.id);
    logger.info('Generating receipt PDF', { receiptId: req.params.id });
    const pdf = Buffer.from(await pdfService.receiptPdf(receipt));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${receipt.receiptNumber}.pdf"`
    );
    res.end(pdf);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

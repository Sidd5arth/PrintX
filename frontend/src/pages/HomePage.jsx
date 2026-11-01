import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listInvoices, listReceipts } from '../api/client';
import { formatMoney, formatDate } from '../utils/format';

export default function HomePage() {
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [invRes, rcpRes] = await Promise.all([listInvoices(), listReceipts()]);
        if (!cancelled) {
          setInvoices(invRes.data || []);
          setReceipts(rcpRes.data || []);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load reports');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page no-print">
      <header className="home-hero">
        <p className="eyebrow">Reporting suite</p>
        <h1>printX</h1>
        <p className="lede">
          Pixel-perfect, print-ready invoices and receipt reports with PDF export.
        </p>
      </header>

      {loading && <p className="status-line">Loading reports…</p>}
      {error && <p className="status-line status-error">{error}</p>}

      <section className="home-section">
        <h2>Invoices</h2>
        <div className="report-list">
          {invoices.map((inv) => (
            <Link key={inv.invoiceId} to={`/invoices/${inv.invoiceId}`} className="report-row">
              <span className="report-id">{inv.invoiceNumber}</span>
              <span>{inv.customerName}</span>
              <span>{formatDate(inv.issueDate)}</span>
              <span className="status-pill">{inv.status}</span>
              <span className="amount">{formatMoney(inv.grandTotal, inv.currency)}</span>
            </Link>
          ))}
          {!loading && invoices.length === 0 ? <p>No invoices found.</p> : null}
        </div>
      </section>

      <section className="home-section">
        <h2>Receipts</h2>
        <div className="report-list">
          {receipts.map((rcp) => (
            <Link key={rcp.receiptId} to={`/receipts/${rcp.receiptId}`} className="report-row">
              <span className="report-id">{rcp.receiptNumber}</span>
              <span>{rcp.customerName}</span>
              <span>{formatDate(rcp.receiptDate)}</span>
              <span className="status-pill">{rcp.status}</span>
              <span className="amount">{formatMoney(rcp.grandTotal, rcp.currency)}</span>
            </Link>
          ))}
          {!loading && receipts.length === 0 ? <p>No receipts found.</p> : null}
        </div>
      </section>
    </div>
  );
}

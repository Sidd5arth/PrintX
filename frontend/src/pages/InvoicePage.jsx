import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { downloadInvoicePdf, getInvoice } from '../api/client';
import InvoiceReport from '../components/InvoiceReport';
import ReportToolbar from '../components/ReportToolbar';

export default function InvoicePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getInvoice(id);
        if (!cancelled) {
          setData(res.data);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err.message || 'Failed to load invoice');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handlePdf() {
    try {
      setPdfLoading(true);
      setPdfError('');
      await downloadInvoicePdf(id, `${id}.pdf`);
    } catch (err) {
      setPdfError(err.message || 'PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="report-page">
      <ReportToolbar
        title={`Invoice ${id}`}
        onPrint={() => window.print()}
        onPdf={handlePdf}
        pdfLoading={pdfLoading}
        error={error || pdfError}
      />
      {data ? <InvoiceReport data={data} /> : null}
      {!data && !error ? <p className="status-line no-print">Loading invoice…</p> : null}
    </div>
  );
}

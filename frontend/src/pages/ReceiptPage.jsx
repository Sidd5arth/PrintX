import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { downloadReceiptPdf, getReceipt } from '../api/client';
import ReceiptReport from '../components/ReceiptReport';
import ReportToolbar from '../components/ReportToolbar';

export default function ReceiptPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getReceipt(id);
        if (!cancelled) {
          setData(res.data);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err.message || 'Failed to load receipt');
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
      await downloadReceiptPdf(id, `${id}.pdf`);
    } catch (err) {
      setPdfError(err.message || 'PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="report-page">
      <ReportToolbar
        title={`Receipt ${id}`}
        onPrint={() => window.print()}
        onPdf={handlePdf}
        pdfLoading={pdfLoading}
        error={error || pdfError}
      />
      {data ? <ReceiptReport data={data} /> : null}
      {!data && !error ? <p className="status-line no-print">Loading receipt…</p> : null}
    </div>
  );
}

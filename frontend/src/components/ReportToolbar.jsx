export default function ReportToolbar({
  title,
  onPrint,
  onPdf,
  pdfLoading,
  error,
}) {
  return (
    <div className="report-toolbar no-print">
      <div>
        <h1>{title}</h1>
        {error ? <p className="toolbar-error">{error}</p> : null}
      </div>
      <div className="toolbar-actions">
        <button type="button" className="btn btn-secondary" onClick={onPrint}>
          Print
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onPdf}
          disabled={pdfLoading}
        >
          {pdfLoading ? 'Generating PDF…' : 'Export PDF'}
        </button>
      </div>
    </div>
  );
}

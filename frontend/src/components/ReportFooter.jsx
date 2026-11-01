export default function ReportFooter({ notes, left, right }) {
  return (
    <footer className="report-footer">
      {notes ? (
        <div className="report-notes">
          <strong>Notes</strong>
          <p>{notes}</p>
        </div>
      ) : null}
      <div className="report-footer__bar">
        <span>{left || 'printX Confidential'}</span>
        <span className="page-indicator">{right || 'Page numbers appear in print/PDF'}</span>
      </div>
    </footer>
  );
}

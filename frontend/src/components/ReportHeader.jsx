import { addressLines, formatDate } from '../utils/format';

export default function ReportHeader({
  company,
  documentTitle,
  meta = [],
  accent = 'invoice',
}) {
  const lines = addressLines(company);

  return (
    <header className={`report-header report-header--${accent}`}>
      <div className="report-header__brand">
        <div className="report-logo">printX</div>
        <div className="company-block">
          <strong>{company?.name}</strong>
          {lines.slice(1).map((line) => (
            <div key={line}>{line}</div>
          ))}
          {(company?.phone || company?.email) && (
            <div className="company-contact">
              {[company.phone, company.email].filter(Boolean).join(' · ')}
            </div>
          )}
          {company?.taxId ? <div className="company-tax">{company.taxId}</div> : null}
        </div>
      </div>
      <div className="report-header__meta">
        <h1 className="doc-title">{documentTitle}</h1>
        <table className="meta-table">
          <tbody>
            {meta.map((row) => (
              <tr key={row.label}>
                <th>{row.label}</th>
                <td>
                  {row.type === 'date' ? formatDate(row.value) : row.value || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </header>
  );
}

import { formatMoney } from '../utils/format';

export default function LineItemsTable({
  columns,
  rows,
  currency = 'USD',
  emptyMessage = 'No line items',
}) {
  return (
    <table className="line-items">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={col.align === 'right' ? 'num' : undefined}
              style={col.width ? { width: col.width } : undefined}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>{emptyMessage}</td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.lineNo ?? row.id}>
              {columns.map((col) => {
                const raw = row[col.key];
                let value = raw;
                if (col.format === 'money') value = formatMoney(raw, currency);
                if (col.format === 'pct') value = `${raw}%`;
                return (
                  <td
                    key={col.key}
                    className={col.align === 'right' ? 'num' : undefined}
                  >
                    {value ?? '—'}
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

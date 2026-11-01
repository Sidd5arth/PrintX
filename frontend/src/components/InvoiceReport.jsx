import ReportHeader from './ReportHeader';
import ReportFooter from './ReportFooter';
import LineItemsTable from './LineItemsTable';
import { addressLines, formatMoney } from '../utils/format';
import '../styles/invoice.css';

const COLUMNS = [
  { key: 'lineNo', label: '#', width: '36px' },
  { key: 'sku', label: 'SKU', width: '100px' },
  { key: 'description', label: 'Description' },
  { key: 'quantity', label: 'Qty', align: 'right', width: '56px' },
  { key: 'unit', label: 'Unit', width: '48px' },
  { key: 'unitPrice', label: 'Price', align: 'right', format: 'money', width: '88px' },
  { key: 'discountPct', label: 'Disc', align: 'right', format: 'pct', width: '52px' },
  { key: 'taxPct', label: 'Tax', align: 'right', format: 'pct', width: '52px' },
  { key: 'amount', label: 'Amount', align: 'right', format: 'money', width: '96px' },
];

function Party({ title, addr }) {
  const lines = addressLines(addr);
  return (
    <div className="party-block">
      <h3>{title}</h3>
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}

export default function InvoiceReport({ data }) {
  if (!data) return null;

  return (
    <article className="print-sheet invoice-sheet" id="invoice-print-root">
      <ReportHeader
        accent="invoice"
        company={data.company}
        documentTitle="INVOICE"
        meta={[
          { label: 'Invoice #', value: data.invoiceNumber },
          { label: 'Issue date', value: data.issueDate, type: 'date' },
          { label: 'Due date', value: data.dueDate, type: 'date' },
          { label: 'PO #', value: data.purchaseOrder },
          { label: 'Status', value: data.status },
          { label: 'Terms', value: data.paymentTerms },
        ]}
      />

      <section className="parties-grid">
        <Party title="Bill To" addr={data.billTo} />
        <Party title="Ship To" addr={data.shipTo} />
        <Party
          title="Customer"
          addr={{
            name: data.customer?.name,
            addressLine1: data.customer?.customerId,
            addressLine2: data.customer?.email,
            city: data.customer?.phone,
          }}
        />
      </section>

      <LineItemsTable
        columns={COLUMNS}
        rows={data.lineItems || []}
        currency={data.currency}
      />

      <table className="totals-table">
        <tbody>
          <tr>
            <th>Subtotal</th>
            <td>{formatMoney(data.totals.subtotal, data.currency)}</td>
          </tr>
          <tr>
            <th>Discount</th>
            <td>-{formatMoney(data.totals.discountTotal, data.currency)}</td>
          </tr>
          <tr>
            <th>Tax</th>
            <td>{formatMoney(data.totals.taxTotal, data.currency)}</td>
          </tr>
          <tr>
            <th>Shipping</th>
            <td>{formatMoney(data.totals.shipping, data.currency)}</td>
          </tr>
          <tr className="totals-grand">
            <th>Grand Total</th>
            <td>{formatMoney(data.totals.grandTotal, data.currency)}</td>
          </tr>
          <tr>
            <th>Amount Paid</th>
            <td>{formatMoney(data.totals.amountPaid, data.currency)}</td>
          </tr>
          <tr>
            <th>Balance Due</th>
            <td>{formatMoney(data.totals.balanceDue, data.currency)}</td>
          </tr>
        </tbody>
      </table>

      <ReportFooter notes={data.notes} left={`${data.company?.name} · ${data.invoiceNumber}`} />
    </article>
  );
}

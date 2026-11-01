import ReportHeader from './ReportHeader';
import ReportFooter from './ReportFooter';
import LineItemsTable from './LineItemsTable';
import { formatMoney } from '../utils/format';
import '../styles/receipt.css';

const COLUMNS = [
  { key: 'lineNo', label: '#', width: '40px' },
  { key: 'description', label: 'Description' },
  { key: 'quantity', label: 'Qty', align: 'right', width: '56px' },
  { key: 'unitPrice', label: 'Price', align: 'right', format: 'money', width: '100px' },
  { key: 'amount', label: 'Amount', align: 'right', format: 'money', width: '100px' },
];

export default function ReceiptReport({ data }) {
  if (!data) return null;

  return (
    <article className="print-sheet receipt-sheet" id="receipt-print-root">
      <ReportHeader
        accent="receipt"
        company={data.company}
        documentTitle="PAYMENT RECEIPT"
        meta={[
          { label: 'Receipt #', value: data.receiptNumber },
          { label: 'Date', value: data.receiptDate, type: 'date' },
          { label: 'Invoice', value: data.relatedInvoiceNumber },
          { label: 'Method', value: data.paymentMethod },
          { label: 'Reference', value: data.paymentReference },
          { label: 'Status', value: data.status },
        ]}
      />

      <section className="receipt-parties">
        <div>
          <h3>Received From</h3>
          <div>{data.customer?.name}</div>
          <div>{data.customer?.customerId}</div>
          <div>{data.customer?.email}</div>
        </div>
        <div>
          <h3>Settlement</h3>
          <div>Terminal: {data.terminalId}</div>
          <div>Cashier: {data.cashier}</div>
          <div>Currency: {data.currency}</div>
        </div>
      </section>

      <LineItemsTable
        columns={COLUMNS}
        rows={data.lineItems || []}
        currency={data.currency}
      />

      <table className="totals-table totals-table--receipt">
        <tbody>
          <tr>
            <th>Subtotal</th>
            <td>{formatMoney(data.totals.subtotal, data.currency)}</td>
          </tr>
          <tr>
            <th>Tax</th>
            <td>{formatMoney(data.totals.taxTotal, data.currency)}</td>
          </tr>
          <tr>
            <th>Tip</th>
            <td>{formatMoney(data.totals.tip, data.currency)}</td>
          </tr>
          <tr className="totals-grand">
            <th>Total Paid</th>
            <td>{formatMoney(data.totals.grandTotal, data.currency)}</td>
          </tr>
          <tr>
            <th>Tendered</th>
            <td>{formatMoney(data.totals.amountTendered, data.currency)}</td>
          </tr>
          <tr>
            <th>Change</th>
            <td>{formatMoney(data.totals.changeDue, data.currency)}</td>
          </tr>
        </tbody>
      </table>

      <ReportFooter notes={data.notes} left={`${data.company?.name} · ${data.receiptNumber}`} />
    </article>
  );
}

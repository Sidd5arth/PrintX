import { Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InvoicePage from './pages/InvoicePage';
import ReceiptPage from './pages/ReceiptPage';

export default function App() {
  return (
    <div className="app-shell">
      <nav className="app-nav no-print">
        <NavLink to="/" className="brand-link">
          printX
        </NavLink>
        <div className="nav-links">
          <NavLink to="/invoices/INV-2026-00042">Invoice</NavLink>
          <NavLink to="/receipts/RCP-2026-00991">Receipt</NavLink>
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/invoices/:id" element={<InvoicePage />} />
          <Route path="/receipts/:id" element={<ReceiptPage />} />
        </Routes>
      </main>
    </div>
  );
}

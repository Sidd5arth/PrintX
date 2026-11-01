const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) {
    if (!res.ok) {
      throw new Error(`PDF request failed (${res.status})`);
    }
    return res.blob();
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const message = body?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.code = body?.error?.code;
    err.status = res.status;
    throw err;
  }
  return body;
}

export function listInvoices(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  return request(`/api/invoices${qs ? `?${qs}` : ''}`);
}

export function getInvoice(id) {
  return request(`/api/invoices/${encodeURIComponent(id)}`);
}

export function listReceipts(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  return request(`/api/receipts${qs ? `?${qs}` : ''}`);
}

export function getReceipt(id) {
  return request(`/api/receipts/${encodeURIComponent(id)}`);
}

export async function downloadInvoicePdf(id, filename) {
  const blob = await fetchPdf(`/api/invoices/${encodeURIComponent(id)}/pdf`);
  triggerDownload(blob, filename || `${id}.pdf`);
}

export async function downloadReceiptPdf(id, filename) {
  const blob = await fetchPdf(`/api/receipts/${encodeURIComponent(id)}/pdf`);
  triggerDownload(blob, filename || `${id}.pdf`);
}

async function fetchPdf(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/pdf' },
  });
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    const body = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : {};
    throw new Error(body?.error?.message || `PDF request failed (${res.status})`);
  }
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const header = String.fromCharCode(...bytes.slice(0, 4));
  if (header !== '%PDF') {
    throw new Error('Downloaded file is not a valid PDF');
  }
  return new Blob([buffer], { type: 'application/pdf' });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

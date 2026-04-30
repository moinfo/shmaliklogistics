const fmt = n => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const DOC_TITLES = { quote: 'QUOTATION', proforma: 'PROFORMA INVOICE', invoice: 'TAX INVOICE' };
const WATERMARKS  = {
    paid:      { text: 'PAID',      color: '#16a34a' },
    cancelled: { text: 'CANCELLED', color: '#dc2626' },
    draft:     { text: 'DRAFT',     color: '#94a3b8' },
    overdue:   { text: 'OVERDUE',   color: '#d97706' },
    void:      { text: 'VOID',      color: '#dc2626' },
};

function openBlob(html) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const w    = window.open(url, '_blank');
    if (!w) { alert('Allow pop-ups for this site to print documents.'); }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function buildDocHTML(doc, company, docType) {
    const base     = window.location.origin;
    const logoSrc  = company?.company_logo ? `${base}/storage/${esc(company.company_logo)}` : `${base}/logo-full.png`;
    const compName = esc(company?.company_name  ?? 'YOUR COMPANY LIMITED');
    const compAddr = esc([company?.company_address, company?.company_city, company?.company_country].filter(Boolean).join(', '));
    const compPhone= esc(company?.company_phone ?? '');
    const compEmail= esc(company?.company_email ?? '');
    const compTIN  = esc(company?.company_tin   ?? '');
    const compPO   = esc(company?.company_po_box ?? '');

    const title = DOC_TITLES[docType] ?? 'DOCUMENT';
    const wm    = WATERMARKS[doc.status];
    const cur   = esc(doc.currency ?? 'TZS');

    const itemRows = (doc.items ?? []).map((item, i) => `
        <tr>
            <td class="td-n">${i+1}</td>
            <td class="td-desc">${esc(item.description)}</td>
            <td class="td-c">${esc(item.quantity)}</td>
            <td class="td-c">${esc(item.unit) || '—'}</td>
            <td class="td-r">${cur} ${fmt(item.unit_price)}</td>
            <td class="td-r td-bold">${cur} ${fmt(item.total)}</td>
        </tr>`).join('');

    const payRows = (doc.payments ?? []).map(p => `
        <tr>
            <td class="td-sm">${fmtDate(p.payment_date)}</td>
            <td class="td-sm">${esc((p.payment_method ?? '').replace(/_/g,' '))}</td>
            <td class="td-sm mono">${esc(p.reference_number) || '—'}</td>
            <td class="td-sm td-r green">${cur} ${fmt(p.amount)}</td>
        </tr>`).join('');

    const paySection = (doc.payments ?? []).length > 0 ? `
        <div class="section-title">PAYMENT HISTORY</div>
        <table class="items-table">
            <thead><tr>
                <th class="th-l">Date</th><th class="th-l">Method</th>
                <th class="th-l">Reference</th><th class="th-r">Amount</th>
            </tr></thead>
            <tbody>${payRows}</tbody>
        </table>` : '';

    const notesSection = (doc.notes || doc.terms_conditions) ? `
        <div class="notes-grid${doc.notes && doc.terms_conditions ? '' : ' single'}">
            ${doc.notes ? `<div class="note-box"><div class="note-label">NOTES</div><div class="note-body">${esc(doc.notes)}</div></div>` : ''}
            ${doc.terms_conditions ? `<div class="note-box"><div class="note-label">TERMS &amp; CONDITIONS</div><div class="note-body">${esc(doc.terms_conditions)}</div></div>` : ''}
        </div>` : '';

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${title} — ${esc(doc.document_number)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:13px}
@page{size:A4;margin:15mm 15mm 20mm}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{max-width:794px;margin:0 auto;padding:28px 36px 36px;position:relative}
.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:80px;font-weight:900;opacity:.055;letter-spacing:8px;pointer-events:none;z-index:0;text-transform:uppercase}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}
.logo-wrap img{max-height:56px;max-width:180px;object-fit:contain;display:block}
.logo-name{font-size:20px;font-weight:900;color:#1565c0;display:none}
.comp-info{font-size:11px;color:#64748b;line-height:1.9;margin-top:8px}
.doc-title{font-size:24px;font-weight:900;color:#1565c0;letter-spacing:2px;text-align:right;margin-bottom:10px}
.doc-meta{font-size:11px;text-align:right;line-height:2.1}
.doc-meta .label{color:#64748b;font-weight:600;padding-right:10px}
.doc-meta .value{font-weight:700;color:#1e293b}
.doc-meta .mono{font-family:monospace;font-size:12px}
.chip{display:inline-block;background:#eff6ff;color:#1565c0;border:1px solid #bfdbfe;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.rule{height:3px;background:linear-gradient(90deg,#1565c0,#2196f3,transparent);border-radius:2px;margin-bottom:18px}
.bill-to{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;display:inline-block;min-width:240px;margin-bottom:18px}
.bt-label{font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px}
.bt-name{font-size:14px;font-weight:800;color:#1e293b}
.bt-sub{font-size:11px;color:#64748b;line-height:1.7}
.trip-ref{font-size:11px;color:#64748b;margin-bottom:16px}
.trip-ref strong{color:#2196f3}
.items-table{width:100%;border-collapse:collapse}
.items-table thead tr{background:#1565c0}
th{padding:10px 11px;font-size:10px;font-weight:700;color:#fff;letter-spacing:.3px}
.th-l{text-align:left}.th-r{text-align:right}
.items-table tbody tr{border-bottom:1px solid #f0f0f0}
.items-table tbody tr:nth-child(even){background:#fafafa}
.td-n{padding:10px 11px;font-size:11px;color:#94a3b8;width:28px}
.td-desc{padding:10px 11px;font-size:12px;color:#1e293b}
.td-c{padding:10px 11px;font-size:12px;color:#64748b;text-align:center;width:56px}
.td-r{padding:10px 11px;font-size:12px;color:#64748b;text-align:right;width:130px}
.td-bold{font-weight:700;color:#1e293b}
.td-sm{padding:8px 11px;font-size:11px;color:#64748b}
.mono{font-family:monospace;font-size:10px}
.green{color:#059669;font-weight:700}
.totals{display:flex;justify-content:flex-end;border-top:2px solid #1565c0}
.totals table{border-collapse:collapse;min-width:280px}
.t-row td{padding:7px 12px;font-size:12px;border-bottom:1px solid #f0f0f0}
.t-label{color:#64748b}
.t-value{text-align:right;color:#1e293b}
.t-red{color:#ef4444;text-align:right}
.t-total{background:#1565c0}
.t-total td{padding:10px 12px;color:#fff;font-weight:800;font-size:14px;border-bottom:none}
.t-balance td{font-weight:700;font-size:12px}
.section-title{font-size:10px;font-weight:700;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;margin:22px 0 8px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}
.notes-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px}
.notes-grid.single{grid-template-columns:1fr}
.note-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:13px 15px}
.note-label{font-size:9px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px}
.note-body{font-size:11px;color:#475569;line-height:1.7;white-space:pre-wrap}
.footer{margin-top:28px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center}
.footer-thanks{font-size:12px;font-weight:700;color:#1565c0;margin-bottom:4px}
.footer-contact{font-size:10px;color:#94a3b8}
.footer-gen{font-size:9px;color:#cbd5e1;margin-top:3px}
</style>
</head>
<body>
<div class="page">
${wm ? `<div class="watermark" style="color:${wm.color}">${wm.text}</div>` : ''}
<div class="header">
    <div>
        <div class="logo-wrap">
            <img src="${logoSrc}" alt="${compName}" onerror="this.style.display='none';this.parentNode.nextSibling.style.display='block'">
        </div>
        <div class="logo-name">${compName}</div>
        <div class="comp-info">
            ${compAddr  ? `<div>${compAddr}</div>` : ''}
            ${compPO    ? `<div>P.O. Box ${compPO}</div>` : ''}
            ${compPhone ? `<div>Tel: ${compPhone}</div>` : ''}
            ${compEmail ? `<div>${compEmail}</div>` : ''}
            ${compTIN   ? `<div>TIN: ${compTIN}</div>` : ''}
        </div>
    </div>
    <div>
        <div class="doc-title">${title}</div>
        <table class="doc-meta">
            <tr><td class="label">Number:</td><td class="value mono">${esc(doc.document_number)}</td></tr>
            <tr><td class="label">Issue Date:</td><td class="value">${fmtDate(doc.issue_date)}</td></tr>
            ${doc.due_date    ? `<tr><td class="label">Due Date:</td><td class="value">${fmtDate(doc.due_date)}</td></tr>` : ''}
            ${doc.valid_until ? `<tr><td class="label">Valid Until:</td><td class="value">${fmtDate(doc.valid_until)}</td></tr>` : ''}
            <tr><td class="label">Status:</td><td class="value"><span class="chip">${esc(doc.status)}</span></td></tr>
            ${doc.currency !== 'TZS' ? `<tr><td class="label">Currency:</td><td class="value">${cur}</td></tr>` : ''}
        </table>
    </div>
</div>
<div class="rule"></div>
<div class="bill-to">
    <div class="bt-label">BILL TO</div>
    <div class="bt-name">${esc(doc.client?.name) || '—'}</div>
    ${doc.client?.company_name ? `<div class="bt-sub">${esc(doc.client.company_name)}</div>` : ''}
    ${doc.client?.address      ? `<div class="bt-sub">${esc(doc.client.address)}</div>` : ''}
    ${doc.client?.phone        ? `<div class="bt-sub">Tel: ${esc(doc.client.phone)}</div>` : ''}
    ${doc.client?.email        ? `<div class="bt-sub">${esc(doc.client.email)}</div>` : ''}
    ${doc.client?.tin_number   ? `<div class="bt-sub" style="font-size:10px;color:#94a3b8;margin-top:3px">TIN: ${esc(doc.client.tin_number)}</div>` : ''}
</div>
${doc.trip ? `<div class="trip-ref">Trip: <strong>${esc(doc.trip.trip_number)}</strong>${doc.trip.route_from ? ` &mdash; ${esc(doc.trip.route_from)} &rarr; ${esc(doc.trip.route_to)}` : ''}</div>` : ''}
<table class="items-table">
    <thead><tr>
        <th class="th-l">#</th>
        <th class="th-l">Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:center">Unit</th>
        <th class="th-r">Unit Price</th>
        <th class="th-r">Total</th>
    </tr></thead>
    <tbody>${itemRows || '<tr><td colspan="6" style="padding:16px;text-align:center;color:#94a3b8">No items</td></tr>'}</tbody>
</table>
<div class="totals">
    <table>
        <tr class="t-row"><td class="t-label">Subtotal</td><td class="t-value">${cur} ${fmt(doc.subtotal)}</td></tr>
        ${Number(doc.discount_amount) > 0 ? `<tr class="t-row"><td class="t-label">Discount</td><td class="t-red">− ${cur} ${fmt(doc.discount_amount)}</td></tr>` : ''}
        ${Number(doc.tax_rate) > 0 ? `<tr class="t-row"><td class="t-label">VAT (${esc(doc.tax_rate)}%)</td><td class="t-value">${cur} ${fmt(doc.tax_amount)}</td></tr>` : ''}
        <tr class="t-total"><td>TOTAL</td><td style="text-align:right;font-size:15px">${cur} ${fmt(doc.total)}</td></tr>
        ${docType === 'invoice' && doc.amount_paid != null ? `
        <tr class="t-row"><td class="t-label">Amount Paid</td><td style="text-align:right;color:#059669">${cur} ${fmt(doc.amount_paid)}</td></tr>
        <tr class="t-balance" style="background:${doc.balance_due > 0 ? '#fffbeb' : '#f0fdf4'}">
            <td style="color:${doc.balance_due > 0 ? '#d97706' : '#059669'}">Balance Due</td>
            <td style="text-align:right;color:${doc.balance_due > 0 ? '#d97706' : '#059669'};font-size:13px">${cur} ${fmt(doc.balance_due)}</td>
        </tr>` : ''}
    </table>
</div>
${paySection}
${notesSection}
<div class="footer">
    <div class="footer-thanks">Thank you for your business!</div>
    <div class="footer-contact">${[compPhone, compEmail].filter(Boolean).join(' &nbsp;&bull;&nbsp; ')}</div>
    <div class="footer-gen">Generated by ${compName}</div>
</div>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`;
}

export function printBillingDoc(doc, company, docType) {
    openBlob(buildDocHTML(doc, company, docType));
}

export function printPaymentsReport(payments, company, filters = {}) {
    const base     = window.location.origin;
    const logoSrc  = company?.company_logo ? `${base}/storage/${esc(company.company_logo)}` : `${base}/logo-full.png`;
    const compName = esc(company?.company_name ?? 'YOUR COMPANY LIMITED');
    const compAddr = esc([company?.company_address, company?.company_city, company?.company_country].filter(Boolean).join(', '));

    const rows = payments.map((p, i) => `
        <tr>
            <td class="td">${i+1}</td>
            <td class="td">${fmtDate(p.payment_date)}</td>
            <td class="td mono">${esc(p.invoice?.document_number) || '—'}</td>
            <td class="td">${esc(p.invoice?.client?.name) || '—'}</td>
            <td class="td">${esc((p.payment_method ?? '').replace(/_/g,' '))}</td>
            <td class="td mono">${esc(p.reference_number) || '—'}</td>
            <td class="td" style="text-align:right;font-weight:700;color:#059669">${esc(p.invoice?.currency ?? 'TZS')} ${fmt(p.amount)}</td>
        </tr>`).join('');

    const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Payments Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;font-size:12px}
@page{size:A4 landscape;margin:12mm 15mm}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{padding:24px 28px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
.logo img{max-height:48px;object-fit:contain}
.meta{text-align:right;font-size:11px;color:#64748b;line-height:1.8}
.rpt-title{font-size:18px;font-weight:900;color:#1565c0;letter-spacing:2px}
.rule{height:3px;background:linear-gradient(90deg,#1565c0,#2196f3,transparent);border-radius:2px;margin-bottom:16px}
table{width:100%;border-collapse:collapse}
thead tr{background:#1565c0}
th{padding:9px 10px;font-size:10px;font-weight:700;color:#fff;text-align:left}
.th-r{text-align:right}
.td{padding:8px 10px;font-size:11px;color:#1e293b;border-bottom:1px solid #f0f0f0}
tr:nth-child(even){background:#fafafa}
.mono{font-family:monospace;font-size:10px}
.t-footer td{padding:10px;font-weight:800;font-size:13px;background:#1565c0;color:#fff;border:none}
.page-foot{margin-top:18px;text-align:center;font-size:10px;color:#94a3b8}
</style>
</head>
<body><div class="page">
<div class="header">
    <div class="logo">
        <img src="${logoSrc}" alt="${compName}" onerror="this.style.display='none'">
        <div style="font-size:11px;color:#64748b;margin-top:6px">${compAddr}</div>
    </div>
    <div class="meta">
        <div class="rpt-title">PAYMENTS REPORT</div>
        <div>Generated: ${fmtDate(new Date().toISOString())}</div>
        ${filters.search ? `<div>Filter: &ldquo;${esc(filters.search)}&rdquo;</div>` : ''}
        <div>${payments.length} record${payments.length !== 1 ? 's' : ''}</div>
    </div>
</div>
<div class="rule"></div>
<table>
    <thead><tr>
        <th>#</th><th>Date</th><th>Invoice</th><th>Client</th>
        <th>Method</th><th>Reference</th><th class="th-r">Amount</th>
    </tr></thead>
    <tbody>
        ${rows || '<tr><td colspan="7" style="padding:20px;text-align:center;color:#94a3b8">No payments found.</td></tr>'}
        <tr class="t-footer">
            <td colspan="6">TOTAL (${payments.length} payment${payments.length !== 1 ? 's' : ''})</td>
            <td style="text-align:right">TZS ${fmt(total)}</td>
        </tr>
    </tbody>
</table>
<div class="page-foot">Generated by ${compName}</div>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`;

    openBlob(html);
}

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
@php
  $labels    = ['quote' => 'QUOTATION', 'proforma' => 'PROFORMA INVOICE', 'invoice' => 'TAX INVOICE'];
  $label     = $labels[$doc->type] ?? strtoupper($doc->type);
  $currency  = $doc->currency ?? 'TZS';
  $fmt       = fn($n) => number_format((float) $n, 2);
  $fmtDate   = fn($d) => $d ? (is_string($d) ? \Carbon\Carbon::parse($d)->format('d M Y') : $d->format('d M Y')) : '—';
  $brand     = '#1565C0';
  $brandDk   = '#0A1628';
  $logoPath  = $company->company_logo && file_exists(storage_path('app/public/' . $company->company_logo))
    ? storage_path('app/public/' . $company->company_logo)
    : (file_exists(public_path('logo-full.png')) ? public_path('logo-full.png') : null);
  $paidSum   = $doc->type === 'invoice' ? (float) ($doc->payments->sum('amount') ?? 0) : 0;
  $balance   = (float) $doc->total - $paidSum;
  $isPaid    = $doc->type === 'invoice' && $balance <= 0.01;
@endphp
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #0F172A; background: #fff; }
  .page { padding: 28px 34px 26px; }

  /* Header band */
  .header { width: 100%; border-collapse: collapse; margin-bottom: 0; }
  .header td { vertical-align: top; }
  .logo-cell { width: 60%; }
  .logo-img  { height: 56px; margin-bottom: 8px; }
  .company-name { font-size: 14px; font-weight: bold; color: {{ $brandDk }}; letter-spacing: 0.2px; }
  .company-meta { font-size: 9px; color: #64748B; line-height: 1.55; margin-top: 3px; }
  .doc-cell { width: 40%; text-align: right; }
  .doc-type { font-size: 22px; font-weight: bold; color: {{ $brand }}; letter-spacing: 2px; text-transform: uppercase; line-height: 1; margin-bottom: 6px; }
  .doc-number { font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 6px; }
  .status-badge { display: inline-block; padding: 3px 10px; font-size: 8.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 12px; }

  /* Accent band below header */
  .accent { height: 4px; background: {{ $brand }}; margin: 14px 0 20px; }

  /* Info row */
  .info-row { width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 16px; }
  .info-row td { vertical-align: top; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 11px 13px; width: 50%; }
  .info-label { font-size: 8px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 5px; }
  .info-value { font-size: 11px; color: #0F172A; font-weight: bold; line-height: 1.4; }
  .info-sub { font-size: 9px; color: #64748B; line-height: 1.5; margin-top: 2px; }

  /* Dates strip */
  .dates { width: 100%; border-collapse: collapse; background: #F1F5F9; margin-bottom: 22px; }
  .dates td { padding: 9px 14px; border-right: 1px solid #E2E8F0; }
  .dates td:last-child { border-right: none; }
  .date-label { font-size: 8px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 2px; }
  .date-value { font-size: 10px; font-weight: bold; color: #0F172A; }

  /* Line items */
  .section-title { font-size: 9px; font-weight: bold; color: #64748B; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 7px; }
  .items { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  .items thead th { background: {{ $brand }}; color: #fff; padding: 9px 11px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: bold; }
  .items thead th.right { text-align: right; }
  .items tbody td { padding: 9px 11px; border-bottom: 1px solid #E2E8F0; vertical-align: top; font-size: 10px; }
  .items tbody tr:nth-child(even) td { background: #F8FAFC; }
  .items td.right { text-align: right; }
  .item-desc { font-weight: 600; color: #0F172A; }
  .item-sub  { color: #64748B; font-size: 9px; margin-top: 2px; }

  /* Unified totals card (right-aligned) */
  .totals-wrap { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  .totals-wrap > tbody > tr > td.spacer { width: auto; }
  .totals-wrap > tbody > tr > td.totals-col { width: 280px; padding: 0; }
  .totals { width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0; }
  .totals td { padding: 7px 13px; font-size: 10px; border-bottom: 1px solid #F1F5F9; }
  .totals tr:last-child td { border-bottom: none; }
  .totals .label { color: #64748B; }
  .totals .value { text-align: right; font-weight: 600; color: #0F172A; }
  .totals .row-total td { background: {{ $brand }}; color: #fff; padding: 11px 13px; }
  .totals .row-total .label { color: #fff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .totals .row-total .value { color: #fff; font-size: 14px; font-weight: bold; }
  .totals .row-paid .value { color: #059669; font-weight: bold; }
  .totals .row-balance td { background: {{ $isPaid ? '#F0FDF4' : '#FFFBEB' }}; padding: 10px 13px; }
  .totals .row-balance .label { color: {{ $isPaid ? '#047857' : '#B45309' }}; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; font-size: 9.5px; }
  .totals .row-balance .value { color: {{ $isPaid ? '#047857' : '#B45309' }}; font-weight: bold; font-size: 12px; }

  /* Payments table */
  .pay { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #E2E8F0; }
  .pay th { background: #F1F5F9; padding: 7px 11px; font-size: 9px; color: #475569; text-align: left; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
  .pay td { padding: 7px 11px; border-bottom: 1px solid #F1F5F9; font-size: 9.5px; }
  .pay tr:last-child td { border-bottom: none; }
  .pay .right { text-align: right; }

  /* Paid stamp */
  .paid-stamp { display: inline-block; padding: 7px 18px; background: #DCFCE7; color: #15803D; border: 1.5px solid #15803D; font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; transform: rotate(-3deg); margin-top: 8px; }

  /* Notes / Terms blocks */
  .note { background: #F8FAFC; border-left: 3px solid {{ $brand }}; padding: 10px 14px; margin-bottom: 12px; }
  .note-title { font-size: 8px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px; }
  .note-text  { font-size: 9.5px; color: #334155; line-height: 1.6; }

  /* Footer */
  .footer-wrap { margin-top: 24px; }
  .footer { background: {{ $brandDk }}; color: rgba(255,255,255,0.85); padding: 12px 14px; font-size: 8.5px; text-align: center; line-height: 1.6; }
  .footer .strong { color: #fff; font-weight: bold; font-size: 9.5px; letter-spacing: 0.3px; }
  .footer .muted  { color: rgba(255,255,255,0.45); font-size: 7.5px; margin-top: 4px; }

  /* Page break safety */
  table { page-break-inside: avoid; }
  .items tbody tr { page-break-inside: avoid; }
</style>
</head>
<body>
<div class="page">

  {{-- Header --}}
  <table class="header">
    <tr>
      <td class="logo-cell">
        @if($logoPath)
          <img src="{{ $logoPath }}" alt="{{ $company->company_name }}" class="logo-img">
        @endif
        <div class="company-name">{{ $company->company_name }}</div>
        <div class="company-meta">
          {{ $company->company_address }}@if($company->company_city), {{ $company->company_city }}@endif@if($company->company_country), {{ $company->company_country }}@endif
          @if($company->company_po_box) · P.O. Box {{ $company->company_po_box }}@endif<br>
          @if($company->company_phone)Tel: {{ $company->company_phone }}@endif
          @if($company->company_phone && $company->company_email) · @endif
          @if($company->company_email){{ $company->company_email }}@endif
          @if($company->company_tin)<br>TIN: {{ $company->company_tin }}@endif
        </div>
      </td>
      <td class="doc-cell">
        <div class="doc-type">{{ $label }}</div>
        <div class="doc-number">{{ $doc->document_number }}</div>
        @php $st = $statuses[$doc->status] ?? ['label' => $doc->status, 'color' => '#94A3B8']; @endphp
        <span class="status-badge" style="background:{{ $st['color'] }}1F; color:{{ $st['color'] }}; border: 1px solid {{ $st['color'] }}55;">{{ $st['label'] }}</span>
        @if($isPaid)
          <div><span class="paid-stamp">✓ Paid in Full</span></div>
        @endif
      </td>
    </tr>
  </table>

  <div class="accent"></div>

  {{-- Bill-to + Trip Reference --}}
  <table class="info-row">
    <tr>
      <td>
        <div class="info-label">Bill To</div>
        <div class="info-value">{{ $doc->client?->name ?? '—' }}</div>
        @if($doc->client?->company_name)<div class="info-sub">{{ $doc->client->company_name }}</div>@endif
        @if($doc->client?->address)<div class="info-sub">{{ $doc->client->address }}</div>@endif
        @if($doc->client?->phone)<div class="info-sub">{{ $doc->client->phone }}</div>@endif
        @if($doc->client?->email)<div class="info-sub">{{ $doc->client->email }}</div>@endif
        @if($doc->client?->tax_id)<div class="info-sub">TIN: {{ $doc->client->tax_id }}</div>@endif
      </td>
      <td>
        @if($doc->trip)
          <div class="info-label">Trip Reference</div>
          <div class="info-value">{{ $doc->trip->trip_number }}</div>
          <div class="info-sub">{{ $doc->trip->route_from }} → {{ $doc->trip->route_to }}</div>
        @else
          <div class="info-label">Document</div>
          <div class="info-value">{{ $label }}</div>
          <div class="info-sub">Reference: {{ $doc->document_number }}</div>
        @endif
      </td>
    </tr>
  </table>

  {{-- Dates strip --}}
  <table class="dates">
    <tr>
      <td>
        <span class="date-label">Issue Date</span>
        <span class="date-value">{{ $fmtDate($doc->issue_date) }}</span>
      </td>
      @if($doc->due_date)
      <td>
        <span class="date-label">Due Date</span>
        <span class="date-value">{{ $fmtDate($doc->due_date) }}</span>
      </td>
      @endif
      @if($doc->valid_until)
      <td>
        <span class="date-label">Valid Until</span>
        <span class="date-value">{{ $fmtDate($doc->valid_until) }}</span>
      </td>
      @endif
      <td>
        <span class="date-label">Currency</span>
        <span class="date-value">{{ $currency }}</span>
      </td>
    </tr>
  </table>

  {{-- Line items --}}
  <div class="section-title">Line Items</div>
  <table class="items">
    <thead>
      <tr>
        <th style="width:46%">Description</th>
        <th style="width:14%" class="right">Qty</th>
        <th style="width:20%" class="right">Unit Price</th>
        <th style="width:20%" class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      @forelse($doc->items as $item)
      <tr>
        <td>
          <div class="item-desc">{{ $item->description }}</div>
          @if($item->notes)<div class="item-sub">{{ $item->notes }}</div>@endif
        </td>
        <td class="right">{{ number_format($item->quantity, 2) }}{{ $item->unit ? ' ' . $item->unit : '' }}</td>
        <td class="right">{{ $fmt($item->unit_price) }}</td>
        <td class="right">{{ $fmt($item->quantity * $item->unit_price) }}</td>
      </tr>
      @empty
      <tr><td colspan="4" style="text-align:center; color:#94A3B8; padding:18px;">No line items.</td></tr>
      @endforelse
    </tbody>
  </table>

  {{-- Unified totals card --}}
  <table class="totals-wrap">
    <tr>
      <td class="spacer">&nbsp;</td>
      <td class="totals-col">
        <table class="totals">
          <tr>
            <td class="label">Subtotal</td>
            <td class="value">{{ $currency }} {{ $fmt($doc->subtotal) }}</td>
          </tr>
          @if($doc->discount_amount > 0)
          <tr>
            <td class="label">Discount</td>
            <td class="value" style="color:#EF4444">− {{ $currency }} {{ $fmt($doc->discount_amount) }}</td>
          </tr>
          @endif
          @if($doc->tax_rate > 0)
          <tr>
            <td class="label">VAT ({{ $doc->tax_rate }}%)</td>
            <td class="value">{{ $currency }} {{ $fmt($doc->tax_amount) }}</td>
          </tr>
          @endif
          <tr class="row-total">
            <td class="label">Total</td>
            <td class="value">{{ $currency }} {{ $fmt($doc->total) }}</td>
          </tr>
          @if($doc->type === 'invoice' && $paidSum > 0)
          <tr class="row-paid">
            <td class="label">Amount Paid</td>
            <td class="value">{{ $currency }} {{ $fmt($paidSum) }}</td>
          </tr>
          @endif
          @if($doc->type === 'invoice')
          <tr class="row-balance">
            <td class="label">Balance Due</td>
            <td class="value">{{ $currency }} {{ $fmt(max(0, $balance)) }}</td>
          </tr>
          @endif
        </table>
      </td>
    </tr>
  </table>

  {{-- Payments table (invoices only) --}}
  @if($doc->type === 'invoice' && $doc->payments->count() > 0)
  <div class="section-title">Payments Received</div>
  <table class="pay">
    <thead>
      <tr>
        <th>Date</th>
        <th>Method</th>
        <th>Reference</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      @foreach($doc->payments as $pay)
      <tr>
        <td>{{ $pay->paid_at?->format('d M Y') ?? '—' }}</td>
        <td>{{ $pay->method ?? '—' }}</td>
        <td>{{ $pay->reference ?? '—' }}</td>
        <td class="right">{{ $currency }} {{ $fmt($pay->amount) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @endif

  {{-- Notes & Terms --}}
  @if($doc->notes)
  <div class="note">
    <div class="note-title">Notes</div>
    <div class="note-text">{{ $doc->notes }}</div>
  </div>
  @endif

  @if($doc->terms_conditions)
  <div class="note">
    <div class="note-title">Terms &amp; Conditions</div>
    <div class="note-text">{{ $doc->terms_conditions }}</div>
  </div>
  @endif

  {{-- Footer --}}
  <div class="footer-wrap">
    <div class="footer">
      <div class="strong">{{ $company->company_name }}</div>
      <div>
        @if($company->company_address){{ $company->company_address }}@endif@if($company->company_city), {{ $company->company_city }}@endif@if($company->company_country), {{ $company->company_country }}@endif
        @if($company->company_phone) · Tel: {{ $company->company_phone }}@endif
        @if($company->company_email) · {{ $company->company_email }}@endif
      </div>
      <div class="muted">Generated {{ now()->format('d M Y H:i') }} · {{ $doc->document_number }} · © {{ date('Y') }} {{ $company->company_name }}</div>
    </div>
  </div>

</div>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1E293B; background: #fff; }
.page { padding: 32px 36px; }

/* Header */
.header-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
.company-name  { font-size: 18px; font-weight: bold; color: #1565C0; letter-spacing: -0.5px; }
.company-sub   { font-size: 9px; color: #64748B; margin-top: 2px; line-height: 1.5; }
.doc-badge     { text-align: right; }
.doc-type      { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
.doc-type.invoice  { color: #1565C0; }
.doc-type.quote    { color: #065F46; }
.doc-type.proforma { color: #6D28D9; }
.doc-number    { font-size: 12px; color: #64748B; margin-top: 4px; }

/* Status badge */
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; margin-top: 4px; }

/* Divider */
.divider { border: none; border-top: 2px solid #1565C0; margin: 0 0 22px 0; }

/* Info blocks */
.info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
.info-block { width: 50%; vertical-align: top; }
.info-label { font-size: 8px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
.info-value { font-size: 10px; color: #1E293B; font-weight: 600; }
.info-secondary { font-size: 9px; color: #64748B; margin-top: 2px; }

.dates-table { width: 100%; border-collapse: collapse; background: #F8FAFC; border: 1px solid #E2E8F0; margin-bottom: 24px; }
.dates-table td { padding: 8px 14px; }
.dates-table .date-label { font-size: 8px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.8px; display: block; }
.dates-table .date-value { font-size: 10px; font-weight: 700; color: #1E293B; }

/* Items table */
.items-section-title { font-size: 9px; font-weight: bold; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.items-table th { background: #1565C0; color: #fff; padding: 8px 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
.items-table th.right { text-align: right; }
.items-table td { padding: 8px 10px; border-bottom: 1px solid #F1F5F9; vertical-align: top; }
.items-table td.right { text-align: right; }
.items-table tr:nth-child(even) td { background: #F8FAFC; }
.item-desc { font-weight: 600; color: #1E293B; font-size: 10px; }
.item-sub  { color: #64748B; font-size: 9px; margin-top: 2px; }

/* Totals */
.totals-table { width: 280px; border-collapse: collapse; margin-left: auto; margin-bottom: 24px; }
.totals-table td { padding: 5px 10px; font-size: 10px; }
.totals-table .label { color: #64748B; }
.totals-table .value { text-align: right; font-weight: 600; color: #1E293B; }
.totals-table .total-row td { background: #1565C0; color: #fff; font-size: 12px; font-weight: bold; padding: 8px 10px; }
.totals-table .total-row .value { color: #fff; text-align: right; }

/* Payments */
.pay-table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 20px; }
.pay-table th { background: #F1F5F9; padding: 6px 10px; font-size: 9px; color: #64748B; text-align: left; font-weight: bold; text-transform: uppercase; }
.pay-table td { padding: 6px 10px; border-bottom: 1px solid #F1F5F9; font-size: 9px; }
.pay-table .right { text-align: right; }
.balance-due { background: #FEF2F2; border: 1px solid #FECACA; padding: 10px 14px; text-align: right; font-size: 11px; font-weight: bold; color: #DC2626; margin-bottom: 20px; }

/* Notes/Terms */
.notes-box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 14px; margin-bottom: 16px; }
.notes-title { font-size: 8px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
.notes-text  { font-size: 9px; color: #475569; line-height: 1.5; }

/* Footer */
.footer { border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 24px; text-align: center; color: #94A3B8; font-size: 8px; }
</style>
</head>
<body>
<div class="page">

{{-- Header --}}
<table class="header-table">
  <tr>
    <td>
      @if($company->company_logo && file_exists(storage_path('app/public/' . $company->company_logo)))
        <img src="{{ storage_path('app/public/' . $company->company_logo) }}" alt="{{ $company->company_name }}" style="height:48px; margin-bottom:6px;">
      @endif
      <div class="company-name">{{ $company->company_name }}</div>
      <div class="company-sub">
        {{ $company->company_address }}@if($company->company_city), {{ $company->company_city }}@endif<br>
        @if($company->company_country){{ $company->company_country }} @endif
        @if($company->company_po_box)· P.O. Box {{ $company->company_po_box }}@endif<br>
        @if($company->company_phone)Tel: {{ $company->company_phone }} @endif
        @if($company->company_email)· {{ $company->company_email }}@endif<br>
        @if($company->company_tin)TIN: {{ $company->company_tin }}@endif
      </div>
    </td>
    <td class="doc-badge">
      <div class="doc-type {{ $doc->type }}">{{ strtoupper($doc->type === 'proforma' ? 'Pro-forma Invoice' : $doc->type) }}</div>
      <div class="doc-number">{{ $doc->document_number }}</div>
      <div>
        @php $st = $statuses[$doc->status] ?? ['label' => $doc->status, 'color' => '#94A3B8']; @endphp
        <span class="status-badge" style="background:{{ $st['color'] }}22; color:{{ $st['color'] }}; border: 1px solid {{ $st['color'] }}44;">{{ $st['label'] }}</span>
      </div>
    </td>
  </tr>
</table>

<hr class="divider">

{{-- Bill-to + Dates --}}
<table class="info-table">
  <tr>
    <td class="info-block">
      <div class="info-label">Bill To</div>
      <div class="info-value">{{ $doc->client?->name }}</div>
      @if($doc->client?->address)   <div class="info-secondary">{{ $doc->client->address }}</div> @endif
      @if($doc->client?->phone)     <div class="info-secondary">{{ $doc->client->phone }}</div> @endif
      @if($doc->client?->email)     <div class="info-secondary">{{ $doc->client->email }}</div> @endif
      @if($doc->client?->tax_id)    <div class="info-secondary">TIN: {{ $doc->client->tax_id }}</div> @endif
    </td>
    <td class="info-block">
      @if($doc->trip)
        <div class="info-label">Trip Reference</div>
        <div class="info-value">{{ $doc->trip->trip_number }}</div>
        <div class="info-secondary">{{ $doc->trip->route_from }} → {{ $doc->trip->route_to }}</div>
      @endif
    </td>
  </tr>
</table>

<table class="dates-table">
  <tr>
    <td>
      <span class="date-label">Issue Date</span>
      <span class="date-value">{{ $doc->issue_date?->format('d M Y') ?? '—' }}</span>
    </td>
    @if($doc->due_date)
    <td>
      <span class="date-label">Due Date</span>
      <span class="date-value">{{ $doc->due_date->format('d M Y') }}</span>
    </td>
    @endif
    @if($doc->valid_until)
    <td>
      <span class="date-label">Valid Until</span>
      <span class="date-value">{{ $doc->valid_until->format('d M Y') }}</span>
    </td>
    @endif
    <td>
      <span class="date-label">Currency</span>
      <span class="date-value">{{ $doc->currency ?? 'TZS' }}</span>
    </td>
  </tr>
</table>

{{-- Line Items --}}
<div class="items-section-title">Line Items</div>
<table class="items-table">
  <thead>
    <tr>
      <th style="width:40%">Description</th>
      <th style="width:15%" class="right">Qty</th>
      <th style="width:20%" class="right">Unit Price</th>
      <th style="width:25%" class="right">Amount</th>
    </tr>
  </thead>
  <tbody>
    @forelse($doc->items as $item)
    <tr>
      <td>
        <div class="item-desc">{{ $item->description }}</div>
        @if($item->notes)<div class="item-sub">{{ $item->notes }}</div>@endif
      </td>
      <td class="right">{{ number_format($item->quantity, 2) }} {{ $item->unit }}</td>
      <td class="right">{{ number_format($item->unit_price, 2) }}</td>
      <td class="right">{{ number_format($item->quantity * $item->unit_price, 2) }}</td>
    </tr>
    @empty
    <tr><td colspan="4" style="text-align:center; color:#94A3B8; padding:16px;">No line items.</td></tr>
    @endforelse
  </tbody>
</table>

{{-- Totals --}}
<table class="totals-table">
  <tr>
    <td class="label">Subtotal</td>
    <td class="value">{{ number_format($doc->subtotal, 2) }}</td>
  </tr>
  @if($doc->discount_amount > 0)
  <tr>
    <td class="label">Discount</td>
    <td class="value" style="color:#EF4444">− {{ number_format($doc->discount_amount, 2) }}</td>
  </tr>
  @endif
  @if($doc->tax_rate > 0)
  <tr>
    <td class="label">VAT ({{ $doc->tax_rate }}%)</td>
    <td class="value">{{ number_format($doc->tax_amount, 2) }}</td>
  </tr>
  @endif
  <tr class="total-row">
    <td class="label">TOTAL ({{ $doc->currency ?? 'TZS' }})</td>
    <td class="value">{{ number_format($doc->total, 2) }}</td>
  </tr>
</table>

{{-- Payments (invoices only) --}}
@if($doc->type === 'invoice' && $doc->payments->count() > 0)
<div class="items-section-title">Payments Received</div>
<table class="pay-table">
  <thead>
    <tr>
      <th>Date</th><th>Method</th><th>Reference</th><th class="right">Amount</th>
    </tr>
  </thead>
  <tbody>
    @foreach($doc->payments as $pay)
    <tr>
      <td>{{ $pay->paid_at?->format('d M Y') }}</td>
      <td>{{ $pay->method ?? '—' }}</td>
      <td>{{ $pay->reference ?? '—' }}</td>
      <td class="right">{{ number_format($pay->amount, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
</table>
@php $balance = $doc->total - $doc->payments->sum('amount'); @endphp
@if($balance > 0.01)
<div class="balance-due">Balance Due: {{ $doc->currency ?? 'TZS' }} {{ number_format($balance, 2) }}</div>
@elseif($balance <= 0.01)
<div style="background:#F0FDF4; border:1px solid #BBF7D0; padding:10px 14px; text-align:right; font-size:11px; font-weight:bold; color:#15803D; margin-bottom:20px;">✓ PAID IN FULL</div>
@endif
@endif

{{-- Notes --}}
@if($doc->notes)
<div class="notes-box">
  <div class="notes-title">Notes</div>
  <div class="notes-text">{{ $doc->notes }}</div>
</div>
@endif

@if($doc->terms_conditions)
<div class="notes-box">
  <div class="notes-title">Terms & Conditions</div>
  <div class="notes-text">{{ $doc->terms_conditions }}</div>
</div>
@endif

<div class="footer">
  {{ $company->company_name }} — {{ $company->company_address }}{{ $company->company_city ? ', ' . $company->company_city : '' }}, {{ $company->company_country ?? 'Tanzania' }}<br>
  Generated on {{ now()->format('d M Y H:i') }} · {{ $doc->document_number }}
</div>

</div>
</body>
</html>

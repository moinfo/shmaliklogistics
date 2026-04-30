<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $emailSubject ?? $document->document_number }}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  {{-- Header --}}
  <tr>
    <td style="background:linear-gradient(135deg,#0a1628,#1565c0);border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
      <img src="{{ url('/logo-full.png') }}" alt="{{ $company->company_name }}" style="max-height:52px;max-width:180px;object-fit:contain;display:inline-block;">
      <div style="margin-top:10px;font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:.5px;">
        {{ $company->company_name }}
      </div>
    </td>
  </tr>

  {{-- Doc type banner --}}
  <tr>
    <td style="background:#1565c0;padding:10px 36px;">
      @php
        $labels = ['quote'=>'QUOTATION','proforma'=>'PROFORMA INVOICE','invoice'=>'TAX INVOICE'];
        $label  = $labels[$document->type] ?? strtoupper($document->type);
        $fmt    = fn($n) => number_format(round((float)$n), 0, '.', ',');
        $fmtDate = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('d M Y') : '—';
      @endphp
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#fff;font-size:18px;font-weight:900;letter-spacing:2px;">{{ $label }}</td>
          <td align="right" style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;font-family:monospace;">{{ $document->document_number }}</td>
        </tr>
      </table>
    </td>
  </tr>

  {{-- Body --}}
  <tr>
    <td style="background:#ffffff;padding:28px 36px;">

      {{-- Custom message --}}
      @if($customMessage)
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.8;white-space:pre-line;">{{ $customMessage }}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;">
      @else
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.8;">
        Dear {{ $document->client?->name ?? 'Valued Customer' }},<br><br>
        Please find the details of your
        <strong style="color:#1e293b;">{{ strtolower($label) }} #{{ $document->document_number }}</strong> below.
      </p>
      @endif

      {{-- Summary cards --}}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td width="48%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
            <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">BILL TO</div>
            <div style="font-size:14px;font-weight:800;color:#1e293b;">{{ $document->client?->name ?? '—' }}</div>
            @if($document->client?->company_name)
            <div style="font-size:12px;color:#64748b;">{{ $document->client->company_name }}</div>
            @endif
            @if($document->client?->tin_number)
            <div style="font-size:11px;color:#94a3b8;margin-top:3px;">TIN: {{ $document->client->tin_number }}</div>
            @endif
          </td>
          <td width="4%"></td>
          <td width="48%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;">
            <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">DOCUMENT DETAILS</div>
            <table cellpadding="0" cellspacing="0" style="font-size:12px;">
              <tr><td style="color:#64748b;padding-right:10px;padding-bottom:3px;">Issue Date:</td><td style="font-weight:600;color:#1e293b;">{{ $fmtDate($document->issue_date) }}</td></tr>
              @if($document->due_date)
              <tr><td style="color:#64748b;padding-right:10px;padding-bottom:3px;">Due Date:</td><td style="font-weight:600;color:#1e293b;">{{ $fmtDate($document->due_date) }}</td></tr>
              @endif
              @if($document->valid_until)
              <tr><td style="color:#64748b;padding-right:10px;">Valid Until:</td><td style="font-weight:600;color:#1e293b;">{{ $fmtDate($document->valid_until) }}</td></tr>
              @endif
            </table>
          </td>
        </tr>
      </table>

      {{-- Line items --}}
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:0;">
        <thead>
          <tr style="background:#1565c0;">
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;color:#fff;letter-spacing:.3px;">Description</th>
            <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:700;color:#fff;width:50px;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;color:#fff;width:120px;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;color:#fff;width:120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          @foreach($document->items ?? [] as $item)
          <tr style="border-bottom:1px solid #f0f0f0;{{ $loop->even ? 'background:#fafafa;' : '' }}">
            <td style="padding:10px 12px;font-size:12px;color:#1e293b;">{{ $item->description }}</td>
            <td style="padding:10px 12px;font-size:12px;color:#64748b;text-align:center;">{{ $item->quantity }}</td>
            <td style="padding:10px 12px;font-size:12px;color:#64748b;text-align:right;">{{ $document->currency }} {{ $fmt($item->unit_price) }}</td>
            <td style="padding:10px 12px;font-size:12px;font-weight:700;color:#1e293b;text-align:right;">{{ $document->currency }} {{ $fmt($item->total) }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>

      {{-- Totals --}}
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #1565c0;">
        <tr>
          <td></td>
          <td width="280" style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              @if((float)$document->discount_amount > 0)
              <tr>
                <td style="padding:6px 12px;font-size:12px;color:#64748b;border-bottom:1px solid #f0f0f0;">Subtotal</td>
                <td style="padding:6px 12px;font-size:12px;text-align:right;color:#1e293b;border-bottom:1px solid #f0f0f0;">{{ $document->currency }} {{ $fmt($document->subtotal) }}</td>
              </tr>
              <tr>
                <td style="padding:6px 12px;font-size:12px;color:#64748b;border-bottom:1px solid #f0f0f0;">Discount</td>
                <td style="padding:6px 12px;font-size:12px;text-align:right;color:#ef4444;border-bottom:1px solid #f0f0f0;">− {{ $document->currency }} {{ $fmt($document->discount_amount) }}</td>
              </tr>
              @endif
              @if((float)$document->tax_rate > 0)
              <tr>
                <td style="padding:6px 12px;font-size:12px;color:#64748b;border-bottom:1px solid #f0f0f0;">VAT ({{ $document->tax_rate }}%)</td>
                <td style="padding:6px 12px;font-size:12px;text-align:right;color:#1e293b;border-bottom:1px solid #f0f0f0;">{{ $document->currency }} {{ $fmt($document->tax_amount) }}</td>
              </tr>
              @endif
              <tr style="background:#1565c0;">
                <td style="padding:10px 12px;font-size:13px;font-weight:800;color:#fff;">TOTAL</td>
                <td style="padding:10px 12px;font-size:15px;font-weight:900;color:#fff;text-align:right;">{{ $document->currency }} {{ $fmt($document->total) }}</td>
              </tr>
              @if($document->type === 'invoice')
              <tr>
                <td style="padding:6px 12px;font-size:12px;color:#64748b;">Amount Paid</td>
                <td style="padding:6px 12px;font-size:12px;text-align:right;color:#059669;font-weight:600;">{{ $document->currency }} {{ $fmt($document->amount_paid ?? 0) }}</td>
              </tr>
              <tr style="background:{{ ($document->balance_due ?? 0) > 0 ? '#fffbeb' : '#f0fdf4' }};">
                <td style="padding:8px 12px;font-size:12px;font-weight:700;color:{{ ($document->balance_due ?? 0) > 0 ? '#d97706' : '#059669' }};">Balance Due</td>
                <td style="padding:8px 12px;font-size:13px;font-weight:800;text-align:right;color:{{ ($document->balance_due ?? 0) > 0 ? '#d97706' : '#059669' }};">{{ $document->currency }} {{ $fmt($document->balance_due ?? 0) }}</td>
              </tr>
              @endif
            </table>
          </td>
        </tr>
      </table>

      {{-- Notes --}}
      @if($document->notes)
      <div style="margin-top:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;">
        <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">NOTES</div>
        <div style="font-size:12px;color:#475569;line-height:1.7;white-space:pre-line;">{{ $document->notes }}</div>
      </div>
      @endif

      {{-- CTA --}}
      <div style="text-align:center;margin-top:28px;">
        <a href="{{ url("/system/billing/{$document->type}s/{$document->id}") }}"
           style="display:inline-block;padding:13px 32px;background:linear-gradient(135deg,#1565c0,#2196f3);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:.3px;">
          View {{ ucfirst($document->type) }} Online →
        </a>
      </div>

    </td>
  </tr>

  {{-- Footer --}}
  <tr>
    <td style="background:#0a1628;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
      <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:6px;">{{ $company->company_name }}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.5);line-height:1.9;">
        @if($company->company_address){{ $company->company_address }}, {{ $company->company_city }}, {{ $company->company_country }}<br>@endif
        @if($company->company_phone)Tel: {{ $company->company_phone }}&nbsp;&nbsp;&bull;&nbsp;&nbsp;@endif
        @if($company->company_email){{ $company->company_email }}@endif
      </div>
      <div style="margin-top:10px;font-size:10px;color:rgba(255,255,255,0.25);">
        This email was sent by {{ $company->company_name }} logistics management system.
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>

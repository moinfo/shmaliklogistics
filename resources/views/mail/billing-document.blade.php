<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>{{ $emailSubject ?? $document->document_number }}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;-webkit-text-size-adjust:100%;">

@php
  $labels  = ['quote'=>'QUOTATION','proforma'=>'PROFORMA INVOICE','invoice'=>'TAX INVOICE'];
  $label   = $labels[$document->type] ?? strtoupper($document->type);
  $fmt     = fn($n) => number_format(round((float)$n), 0, '.', ',');
  $fmtDate = fn($d) => $d ? \Carbon\Carbon::parse($d)->format('d M Y') : '—';
  $logoSrc = $message->embed(public_path('logo-email.jpg'));
  $brand   = '#1565c0';
  $brandDk = '#0a1628';
  $accent  = '#0d47a1';
  $balanceDue = (float)($document->balance_due ?? 0);
@endphp

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f7;padding:32px 16px;">
<tr><td align="center">

<table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,.06);">

  {{-- Header --}}
  <tr>
    <td style="background:{{ $brandDk }};background-image:linear-gradient(135deg,{{ $brandDk }} 0%,{{ $accent }} 100%);padding:32px 40px 24px;text-align:center;">
      <img src="{{ $logoSrc }}" alt="{{ $company->company_name }}" width="200" style="width:200px;max-width:60%;height:auto;display:inline-block;border:0;outline:none;text-decoration:none;border-radius:6px;">
    </td>
  </tr>

  {{-- Doc type banner --}}
  <tr>
    <td style="background:{{ $brand }};padding:14px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:2.5px;">{{ $label }}</td>
          <td align="right" style="color:rgba(255,255,255,.85);font-size:12px;font-weight:600;font-family:'SF Mono',Menlo,Consolas,monospace;letter-spacing:.5px;">{{ $document->document_number }}</td>
        </tr>
      </table>
    </td>
  </tr>

  {{-- Body --}}
  <tr>
    <td style="background:#ffffff;padding:32px 40px 8px;">

      {{-- Greeting / custom message --}}
      @if($customMessage)
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;white-space:pre-line;">{{ $customMessage }}</p>
      @else
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">
          Dear {{ $document->client?->name ?? 'Valued Customer' }},<br><br>
          Please find the details of your <strong style="color:#1e293b;">{{ strtolower($label) }} #{{ $document->document_number }}</strong> below.
        </p>
      @endif

      {{-- Summary cards --}}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td width="48%" valign="top" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;">
            <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Bill To</div>
            <div style="font-size:15px;font-weight:800;color:#0f172a;line-height:1.3;">{{ $document->client?->name ?? '—' }}</div>
            @if($document->client?->company_name)
              <div style="font-size:13px;color:#475569;margin-top:2px;">{{ $document->client->company_name }}</div>
            @endif
            @if($document->client?->tin_number)
              <div style="font-size:11px;color:#94a3b8;margin-top:6px;">TIN: {{ $document->client->tin_number }}</div>
            @endif
          </td>
          <td width="4%">&nbsp;</td>
          <td width="48%" valign="top" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;">
            <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Document Details</div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:12px;width:100%;">
              <tr>
                <td style="color:#64748b;padding-bottom:4px;">Issue Date</td>
                <td align="right" style="font-weight:700;color:#0f172a;padding-bottom:4px;">{{ $fmtDate($document->issue_date) }}</td>
              </tr>
              @if($document->due_date)
              <tr>
                <td style="color:#64748b;padding-bottom:4px;">Due Date</td>
                <td align="right" style="font-weight:700;color:#0f172a;padding-bottom:4px;">{{ $fmtDate($document->due_date) }}</td>
              </tr>
              @endif
              @if($document->valid_until)
              <tr>
                <td style="color:#64748b;">Valid Until</td>
                <td align="right" style="font-weight:700;color:#0f172a;">{{ $fmtDate($document->valid_until) }}</td>
              </tr>
              @endif
            </table>
          </td>
        </tr>
      </table>

      {{-- Line items --}}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <thead>
          <tr style="background:{{ $brand }};">
            <th align="left"   style="padding:11px 14px;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">Description</th>
            <th align="center" style="padding:11px 10px;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:1px;text-transform:uppercase;width:50px;">Qty</th>
            <th align="right"  style="padding:11px 14px;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:1px;text-transform:uppercase;width:120px;">Unit Price</th>
            <th align="right"  style="padding:11px 14px;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:1px;text-transform:uppercase;width:120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          @foreach($document->items ?? [] as $item)
          <tr style="background:{{ $loop->even ? '#f8fafc' : '#ffffff' }};">
            <td style="padding:12px 14px;font-size:13px;color:#0f172a;border-top:1px solid #f1f5f9;">{{ $item->description }}</td>
            <td align="center" style="padding:12px 10px;font-size:13px;color:#475569;border-top:1px solid #f1f5f9;">{{ $item->quantity }}</td>
            <td align="right"  style="padding:12px 14px;font-size:13px;color:#475569;border-top:1px solid #f1f5f9;font-variant-numeric:tabular-nums;">{{ $document->currency }} {{ $fmt($item->unit_price) }}</td>
            <td align="right"  style="padding:12px 14px;font-size:13px;font-weight:700;color:#0f172a;border-top:1px solid #f1f5f9;font-variant-numeric:tabular-nums;">{{ $document->currency }} {{ $fmt($item->total) }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>

      {{-- Unified totals card --}}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr>
          <td>&nbsp;</td>
          <td width="300" style="padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">

              @if((float)$document->discount_amount > 0)
              <tr>
                <td style="padding:9px 16px;font-size:12px;color:#64748b;">Subtotal</td>
                <td align="right" style="padding:9px 16px;font-size:12px;color:#0f172a;font-variant-numeric:tabular-nums;">{{ $document->currency }} {{ $fmt($document->subtotal) }}</td>
              </tr>
              <tr>
                <td style="padding:9px 16px;font-size:12px;color:#64748b;border-top:1px solid #f1f5f9;">Discount</td>
                <td align="right" style="padding:9px 16px;font-size:12px;color:#ef4444;border-top:1px solid #f1f5f9;font-variant-numeric:tabular-nums;">− {{ $document->currency }} {{ $fmt($document->discount_amount) }}</td>
              </tr>
              @endif

              @if((float)$document->tax_rate > 0)
              <tr>
                <td style="padding:9px 16px;font-size:12px;color:#64748b;{{ (float)$document->discount_amount > 0 ? 'border-top:1px solid #f1f5f9;' : '' }}">VAT ({{ $document->tax_rate }}%)</td>
                <td align="right" style="padding:9px 16px;font-size:12px;color:#0f172a;{{ (float)$document->discount_amount > 0 ? 'border-top:1px solid #f1f5f9;' : '' }}font-variant-numeric:tabular-nums;">{{ $document->currency }} {{ $fmt($document->tax_amount) }}</td>
              </tr>
              @endif

              {{-- TOTAL row (visually dominant) --}}
              <tr style="background:{{ $brand }};">
                <td style="padding:14px 16px;font-size:13px;font-weight:800;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;">Total</td>
                <td align="right" style="padding:14px 16px;font-size:18px;font-weight:900;color:#ffffff;font-variant-numeric:tabular-nums;">{{ $document->currency }} {{ $fmt($document->total) }}</td>
              </tr>

              @if($document->type === 'invoice')
              <tr>
                <td style="padding:9px 16px;font-size:12px;color:#64748b;">Amount Paid</td>
                <td align="right" style="padding:9px 16px;font-size:12px;font-weight:700;color:#059669;font-variant-numeric:tabular-nums;">{{ $document->currency }} {{ $fmt($document->amount_paid ?? 0) }}</td>
              </tr>
              <tr style="background:{{ $balanceDue > 0 ? '#fffbeb' : '#f0fdf4' }};">
                <td style="padding:12px 16px;font-size:12px;font-weight:800;color:{{ $balanceDue > 0 ? '#b45309' : '#047857' }};letter-spacing:.5px;text-transform:uppercase;border-top:1px solid {{ $balanceDue > 0 ? '#fde68a' : '#bbf7d0' }};">Balance Due</td>
                <td align="right" style="padding:12px 16px;font-size:15px;font-weight:900;color:{{ $balanceDue > 0 ? '#b45309' : '#047857' }};font-variant-numeric:tabular-nums;border-top:1px solid {{ $balanceDue > 0 ? '#fde68a' : '#bbf7d0' }};">{{ $document->currency }} {{ $fmt($balanceDue) }}</td>
              </tr>
              @endif

            </table>
          </td>
        </tr>
      </table>

      {{-- Notes --}}
      @if($document->notes)
      <div style="margin-top:24px;background:#f8fafc;border-left:3px solid {{ $brand }};border-radius:0 8px 8px 0;padding:14px 18px;">
        <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Notes</div>
        <div style="font-size:13px;color:#334155;line-height:1.7;white-space:pre-line;">{{ $document->notes }}</div>
      </div>
      @endif

      {{-- CTA --}}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
        <tr>
          <td align="center">
            <a href="{{ url("/system/billing/{$document->type}s/{$document->id}") }}"
               style="display:inline-block;padding:14px 36px;background:{{ $brand }};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:.5px;mso-padding-alt:0;">
              <!--[if mso]>&nbsp;&nbsp;<![endif]-->View {{ ucfirst($document->type) }} Online&nbsp;→<!--[if mso]>&nbsp;&nbsp;<![endif]-->
            </a>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  {{-- Spacer --}}
  <tr><td style="background:#ffffff;height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>

  {{-- Footer --}}
  <tr>
    <td style="background:{{ $brandDk }};padding:24px 40px;text-align:center;">
      <div style="font-size:13px;font-weight:700;color:#ffffff;letter-spacing:.3px;margin-bottom:8px;">{{ $company->company_name }}</div>
      <div style="font-size:11px;color:rgba(255,255,255,.55);line-height:1.9;">
        @if($company->company_address){{ $company->company_address }}@if($company->company_city), {{ $company->company_city }}@endif@if($company->company_country), {{ $company->company_country }}@endif<br>@endif
        @if($company->company_phone)<span style="color:rgba(255,255,255,.7);">Tel:</span> {{ $company->company_phone }}@endif
        @if($company->company_phone && $company->company_email)&nbsp;&nbsp;·&nbsp;&nbsp;@endif
        @if($company->company_email)<a href="mailto:{{ $company->company_email }}" style="color:rgba(255,255,255,.85);text-decoration:none;">{{ $company->company_email }}</a>@endif
      </div>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);font-size:10px;color:rgba(255,255,255,.35);letter-spacing:.2px;">
        This {{ strtolower($label) }} was issued by {{ $company->company_name }}. © {{ date('Y') }} All rights reserved.
      </div>
    </td>
  </tr>

</table>

</td></tr>
</table>

</body>
</html>

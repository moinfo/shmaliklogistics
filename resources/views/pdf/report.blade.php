@php use App\Support\ReportExport; @endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #1E293B; font-size: 10px; margin: 0; }
        .header { border-bottom: 2px solid #1565C0; padding-bottom: 8px; margin-bottom: 14px; }
        .header h1 { margin: 0; font-size: 18px; color: #0E4FA0; }
        .header .sub { color: #64748B; font-size: 11px; margin-top: 2px; }
        .header .gen { color: #94A3B8; font-size: 9px; margin-top: 2px; }
        .summary { width: 100%; margin-bottom: 14px; border-collapse: collapse; }
        .summary td { padding: 5px 8px; border: 1px solid #E2E8F0; }
        .summary td.k { background: #F1F5F9; font-weight: bold; color: #475569; width: 22%; }
        h2.section { font-size: 12px; color: #0E4FA0; margin: 16px 0 6px; border-left: 3px solid #2196F3; padding-left: 6px; }
        table.data { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
        table.data th { background: #1565C0; color: #fff; text-align: left; padding: 5px 7px; font-size: 9px; }
        table.data td { padding: 4px 7px; border-bottom: 1px solid #E2E8F0; }
        table.data tr:nth-child(even) td { background: #F8FAFC; }
        td.num, th.num { text-align: right; }
        .empty { color: #94A3B8; font-style: italic; padding: 6px 0; }
        .foot { margin-top: 18px; color: #94A3B8; font-size: 8px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $report['title'] }}</h1>
        @if(!empty($report['subtitle']))
            <div class="sub">{{ $report['subtitle'] }}</div>
        @endif
        <div class="gen">Generated {{ now()->format('d M Y, H:i') }}</div>
    </div>

    @if(!empty($report['summary']))
        <table class="summary">
            @foreach($report['summary'] as $label => $value)
                <tr>
                    <td class="k">{{ $label }}</td>
                    <td>{{ is_numeric($value) ? number_format((float) $value, 0) : $value }}</td>
                </tr>
            @endforeach
        </table>
    @endif

    @foreach($report['sections'] as $section)
        <h2 class="section">{{ $section['heading'] ?? '' }}</h2>
        @php $cols = $section['columns']; $rows = $section['rows']; @endphp
        @if(count($rows) === 0)
            <div class="empty">No data for this section.</div>
        @else
            <table class="data">
                <thead>
                    <tr>
                        @foreach($cols as $c)
                            @php $isNum = in_array($c['type'] ?? 'text', ['int','money','percent','tons'], true); @endphp
                            <th class="{{ $isNum ? 'num' : '' }}">{{ $c['label'] }}</th>
                        @endforeach
                    </tr>
                </thead>
                <tbody>
                    @foreach($rows as $row)
                        <tr>
                            @foreach($cols as $c)
                                @php $type = $c['type'] ?? 'text'; $isNum = in_array($type, ['int','money','percent','tons'], true); @endphp
                                <td class="{{ $isNum ? 'num' : '' }}">{{ ReportExport::formatCell($row[$c['key']] ?? null, $type) }}</td>
                            @endforeach
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endforeach

    <div class="foot">SH Malik Logistics Company Limited — confidential management report</div>
</body>
</html>
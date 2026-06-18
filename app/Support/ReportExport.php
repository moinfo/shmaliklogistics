<?php

namespace App\Support;

use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Renders a structured "report" array into a downloadable PDF or XLSX.
 *
 * The report shape (built by each controller) is:
 *   [
 *     'title'       => 'Route Profitability',
 *     'subtitle'    => 'Year 2026 · All months',   // optional
 *     'filename'    => 'route-profitability-2026',
 *     'orientation' => 'landscape',                  // optional: portrait|landscape
 *     'summary'     => ['Total Revenue' => 1000000, ...],   // optional key=>value cards
 *     'sections'    => [
 *        [
 *          'heading' => 'By Route',
 *          'columns' => [
 *             ['label' => 'Route',   'key' => 'route', 'type' => 'text'],
 *             ['label' => 'Revenue', 'key' => 'rev',   'type' => 'money'],
 *          ],
 *          'rows' => [ ['route' => 'Dar → Mwanza', 'rev' => 1200000], ... ],
 *        ],
 *     ],
 *   ]
 *
 * Column types: text | int | money | percent | tons. Numbers are passed RAW;
 * formatting (thousands separators, % suffix) happens here so PDF and Excel stay
 * consistent and Excel keeps real numeric cells it can sum.
 */
class ReportExport
{
    public static function pdf(array $report)
    {
        $report = self::normalise($report);

        $pdf = Pdf::loadView('pdf.report', ['report' => $report])
            ->setPaper('a4', $report['orientation']);

        return $pdf->download($report['filename'] . '.pdf');
    }

    public static function xlsx(array $report): StreamedResponse
    {
        $report = self::normalise($report);

        $ss = new Spreadsheet();
        $ss->removeSheetByIndex(0); // start clean; we add named sheets below

        // Summary sheet (if any)
        if (! empty($report['summary'])) {
            $sheet = new Worksheet($ss, self::sheetTitle('Summary'));
            $ss->addSheet($sheet);
            $sheet->setCellValue('A1', $report['title']);
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
            if ($report['subtitle']) {
                $sheet->setCellValue('A2', $report['subtitle']);
            }
            $r = 4;
            foreach ($report['summary'] as $label => $value) {
                $sheet->setCellValue("A{$r}", $label);
                $sheet->setCellValue("B{$r}", $value);
                $sheet->getStyle("A{$r}")->getFont()->setBold(true);
                if (is_numeric($value)) {
                    $sheet->getStyle("B{$r}")->getNumberFormat()->setFormatCode('#,##0');
                }
                $r++;
            }
            $sheet->getColumnDimension('A')->setWidth(32);
            $sheet->getColumnDimension('B')->setWidth(22);
        }

        foreach ($report['sections'] as $i => $section) {
            $sheet = new Worksheet($ss, self::sheetTitle($section['heading'] ?: ('Sheet ' . ($i + 1))));
            $ss->addSheet($sheet);
            self::writeSheet($sheet, $section);
        }

        if ($ss->getSheetCount() === 0) {
            $ss->addSheet(new Worksheet($ss, 'Empty'));
        }
        $ss->setActiveSheetIndex(0);

        $writer = new Xlsx($ss);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $report['filename'] . '.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private static function writeSheet(Worksheet $sheet, array $section): void
    {
        $columns = $section['columns'];
        $rows    = $section['rows'];

        // Header row
        $col = 1;
        foreach ($columns as $c) {
            $cell = self::colLetter($col) . '1';
            $sheet->setCellValue($cell, $c['label']);
            $sheet->getColumnDimension(self::colLetter($col))->setWidth(max(12, strlen($c['label']) + 4));
            $col++;
        }
        $lastCol = self::colLetter(count($columns));
        $sheet->getStyle("A1:{$lastCol}1")->getFont()->setBold(true);
        $sheet->freezePane('A2');

        // Data rows
        $rowNum = 2;
        foreach ($rows as $row) {
            $col = 1;
            foreach ($columns as $c) {
                $letter = self::colLetter($col);
                $cell   = $letter . $rowNum;
                $value  = $row[$c['key']] ?? null;
                $type   = $c['type'] ?? 'text';

                if ($value !== null && in_array($type, ['int', 'money', 'percent', 'tons'], true)) {
                    $sheet->setCellValueExplicit($cell, (float) $value, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
                    $sheet->getStyle($cell)->getNumberFormat()->setFormatCode(self::excelFormat($type));
                } else {
                    $sheet->setCellValue($cell, $value === null ? '' : (string) $value);
                }
                $col++;
            }
            $rowNum++;
        }
    }

    private static function excelFormat(string $type): string
    {
        return match ($type) {
            'money', 'int' => '#,##0',
            'tons'         => '#,##0.0',
            'percent'      => '0.0"%"',
            default        => '@',
        };
    }

    /** Format a raw value to a display string for the PDF. */
    public static function formatCell($value, string $type): string
    {
        if ($value === null || $value === '') {
            return $type === 'text' ? '' : '0';
        }
        return match ($type) {
            'money', 'int' => number_format((float) $value, 0),
            'tons'         => number_format((float) $value, 1),
            'percent'      => number_format((float) $value, 1) . '%',
            default        => (string) $value,
        };
    }

    /** Fill in defaults so renderers can rely on every key existing. */
    private static function normalise(array $report): array
    {
        return array_merge([
            'title'       => 'Report',
            'subtitle'    => '',
            'filename'    => 'report',
            'orientation' => 'landscape',
            'summary'     => [],
            'sections'    => [],
        ], $report);
    }

    // Excel sheet titles: max 31 chars, and Excel forbids these chars: \ / ? * [ ] :
    private static function sheetTitle(string $name): string
    {
        $clean = preg_replace('#[\\\\/?*\[\]:]#', ' ', $name);
        return mb_substr(trim($clean), 0, 31) ?: 'Sheet';
    }

    private static function colLetter(int $index): string
    {
        return \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index);
    }
}
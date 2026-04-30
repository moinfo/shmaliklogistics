import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useRef, useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function fmt2(n) { return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmt0(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

// ─── Printable Payslip ───────────────────────────────────────────────────────
function Payslip({ slip, run, bankDetail, company, nssfRate }) {
    const MONTHS_FULL = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const emp = slip?.employee;
    const monthYear = `${MONTHS_FULL[run?.month ?? 1]} ${run?.year ?? ''}`;

    const row = (label, value, bold = false, color = '#374151') => (
        <tr>
            <td style={{ padding: '7px 0', fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6' }}>{label}</td>
            <td style={{ padding: '7px 0', fontSize: 13, fontWeight: bold ? 700 : 400, color, textAlign: 'right', borderBottom: '1px solid #F3F4F6' }}>{value}</td>
        </tr>
    );

    return (
        <Box id="payslip-doc" style={{ background: '#fff', maxWidth: 780, margin: '0 auto', fontFamily: "'Segoe UI', Arial, sans-serif", border: '1px solid #E5E7EB', borderRadius: 4 }}>
            {/* Header */}
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 32px 20px', borderBottom: '3px solid #0F4C75' }}>
                <Group gap={16} align="flex-start">
                    {/* Company logo circle */}
                    <Box style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid #0F4C75', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {company?.company_logo
                            ? <img src={`/storage/${company.company_logo}`} alt="logo" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'contain' }} />
                            : <Text style={{ fontSize: 22, color: '#1565C0', fontWeight: 800 }}>{(company?.company_name ?? 'C').charAt(0)}</Text>
                        }
                    </Box>
                    <div>
                        <Text style={{ fontSize: 15, fontWeight: 800, color: '#0F4C75', letterSpacing: 0.3, textTransform: 'uppercase' }}>{company?.company_name ?? 'YOUR COMPANY LIMITED'}</Text>
                        {company?.company_address && <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{company.company_address}</Text>}
                        {(company?.company_po_box || company?.company_city) && (
                            <Text style={{ fontSize: 11, color: '#6B7280' }}>
                                {company?.company_po_box ? `P.O. Box ${company.company_po_box}, ` : ''}{company?.company_city} {company?.company_country ?? 'Tanzania'}
                            </Text>
                        )}
                        {(company?.company_phone || company?.company_email) && (
                            <Text style={{ fontSize: 11, color: '#6B7280' }}>
                                {company?.company_phone}{company?.company_phone && company?.company_email ? ' · ' : ''}{company?.company_email}
                            </Text>
                        )}
                    </div>
                </Group>
                <div style={{ textAlign: 'right' }}>
                    <Box style={{ display: 'inline-block', border: '1px solid #0D9488', color: '#0D9488', padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 8 }}>APPROVED PAYROLL</Box>
                    <Text style={{ fontSize: 28, fontWeight: 900, color: '#0F4C75', lineHeight: 1, letterSpacing: 1 }}>PAYSLIP</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{monthYear}</Text>
                </div>
            </Box>

            {/* Employee info grid */}
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, borderBottom: '1px solid #E5E7EB' }}>
                {[
                    ['PAYROLL NUMBER',  run?.payroll_number ?? '—'],
                    ['PAYROLL MONTH',   monthYear],
                    ['EMPLOYEE NUMBER', emp?.employee_number ?? '—'],
                    ['EMPLOYEE NAME',   emp?.name ?? '—'],
                    ['DEPARTMENT',      emp?.department ?? '—'],
                    ['DESIGNATION',     emp?.position ?? '—'],
                    ['BANK NAME',       bankDetail?.bank_name ?? '—'],
                    ['ACCOUNT NUMBER',  bankDetail?.account_number ?? '—'],
                ].map(([label, value], i) => (
                    <Box key={label} style={{ padding: '12px 16px', borderRight: (i + 1) % 4 !== 0 ? '1px solid #E5E7EB' : 'none', borderBottom: i < 4 ? '1px solid #E5E7EB' : 'none' }}>
                        <Text style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>{label}</Text>
                        <Text style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{value}</Text>
                    </Box>
                ))}
            </Box>

            {/* Income / Deductions */}
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, padding: '0 0 0 0', borderBottom: '1px solid #E5E7EB' }}>
                {/* Income */}
                <Box style={{ borderRight: '1px solid #E5E7EB', padding: '0 0 0 0' }}>
                    <Box style={{ padding: '10px 16px', background: '#E6F7F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #B2DFDB' }}>
                        <Text style={{ fontSize: 11, fontWeight: 700, color: '#0D9488', letterSpacing: 0.8 }}>EMPLOYEE INCOME</Text>
                        <Text style={{ fontSize: 12, fontWeight: 800, color: '#0D9488' }}>{fmt2(slip?.gross_salary)}</Text>
                    </Box>
                    <Box style={{ padding: '4px 16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {row('Basic Salary', fmt2(slip?.basic_salary))}
                                {slip?.allowances > 0 && row('Allowances', fmt2(slip?.allowances))}
                                {slip?.overtime > 0 && row('Overtime', fmt2(slip?.overtime))}
                                {row('Gross Salary', fmt2(slip?.gross_salary), true, '#0D9488')}
                            </tbody>
                        </table>
                    </Box>
                </Box>

                {/* Deductions */}
                <Box style={{ padding: '0 0 0 0' }}>
                    <Box style={{ padding: '10px 16px', background: '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FED7AA' }}>
                        <Text style={{ fontSize: 11, fontWeight: 700, color: '#EA580C', letterSpacing: 0.8 }}>DEDUCTIONS</Text>
                        <Text style={{ fontSize: 12, fontWeight: 800, color: '#EA580C' }}>{fmt2(slip?.total_deductions)}</Text>
                    </Box>
                    <Box style={{ padding: '4px 16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {row('Advance Salary', fmt2(slip?.advance_deduction))}
                                {row('Loan Deduction', fmt2(slip?.loan_deduction))}
                                {row('Loan Balance', fmt2(slip?.loan_balance))}
                                {row('PAYE', fmt2(slip?.paye), false, '#DC2626')}
                                {row(`NSSF (${nssfRate?.toFixed(4)}%)`, fmt2(slip?.nssf_employee), false, '#D97706')}
                                {row(`NHIF`, fmt2(slip?.nhif_employee), false, '#7C3AED')}
                                {slip?.heslb > 0 && row('HESLB', fmt2(slip?.heslb))}
                                {slip?.adjustment != 0 && row('Adjustment', fmt2(slip?.adjustment), false, '#F59E0B')}
                                {slip?.other_deductions > 0 && row('Other Deductions', fmt2(slip?.other_deductions))}
                                {row('Total Deductions', fmt2(slip?.total_deductions), true, '#EA580C')}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </Box>

            {/* Net salary footer */}
            <Box style={{ background: '#0F4C75', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 4px 4px' }}>
                <div>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, textTransform: 'uppercase' }}>NET SALARY</Text>
                    <Text style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: 0.5 }}>{fmt2(slip?.net_salary)}</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, textTransform: 'uppercase' }}>PAYMENT ACCOUNT</Text>
                    <Text style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                        {bankDetail?.bank_name ?? '—'}{bankDetail?.account_number ? ` / ${bankDetail.account_number}` : ''}
                    </Text>
                </div>
            </Box>
        </Box>
    );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function SalarySlipIndex({ slip, run, bankDetail, employees, company, nssfRate, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const [empId, setEmpId]   = useState(filters.employee_id ?? '');
    const [year, setYear]     = useState(String(filters.year ?? new Date().getFullYear()));
    const [month, setMonth]   = useState(String(filters.month ?? (new Date().getMonth() + 1)));

    const iS = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };

    const showSlip = () => router.get('/system/hr/salary-slips', { employee_id: empId, year, month }, { preserveState: true, replace: true });

    const handlePrint = () => window.print();

    const yearOptions = Array.from({ length: 6 }, (_, i) => {
        const y = new Date().getFullYear() - i;
        return { value: String(y), label: String(y) };
    });
    const monthOptions = MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m }));
    const empOptions   = employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }));

    return (
        <DashboardLayout title="Salary Slip">
            <Head title="Salary Slip" />

            {/* Print-only styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #payslip-doc, #payslip-doc * { visibility: visible !important; }
                    #payslip-doc { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
                }
            `}</style>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Salary Slip</Text>
                    <Text size="sm" style={{ color: textSec }}>Search and print individual employee payslips</Text>
                </Stack>
            </Group>

            {/* Filter bar */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                <Group gap="md" align="flex-end">
                    <Select label="Month" data={monthOptions} value={month} onChange={v => setMonth(v ?? String(new Date().getMonth() + 1))} styles={iS} style={{ width: 160 }} />
                    <Select label="Year" data={yearOptions} value={year} onChange={v => setYear(v ?? String(new Date().getFullYear()))} styles={iS} style={{ width: 110 }} />
                    <Select label="Employee" data={empOptions} value={empId} onChange={v => setEmpId(v ?? '')} searchable clearable placeholder="Select employee…" styles={iS} style={{ flex: 1 }} />
                    <Box component="button" onClick={showSlip} style={{ padding: '10px 24px', borderRadius: 9, background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        🔍 Show
                    </Box>
                </Group>
            </Box>

            {/* Summary cards */}
            {slip && (
                <>
                    <SimpleGrid cols={3} spacing="md" mb="md">
                        {[
                            ['GROSS SALARY', slip.gross_salary, '#3B82F6', '💼'],
                            ['TOTAL DEDUCTIONS', slip.total_deductions, '#EF4444', '🔻'],
                            ['NET SALARY', slip.net_salary, '#0D9488', '💰'],
                        ].map(([label, value, color, icon]) => (
                            <Box key={label} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '18px 22px' }}>
                                <Group gap={12}>
                                    <Box style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 20 }}>{icon}</Text>
                                    </Box>
                                    <div>
                                        <Text size="xs" fw={700} style={{ color: textSec, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</Text>
                                        <Text size="xl" fw={800} style={{ color, lineHeight: 1.2 }}>{Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                    </div>
                                </Group>
                            </Box>
                        ))}
                    </SimpleGrid>

                    {/* Action buttons */}
                    <Group justify="flex-end" mb="md" gap="sm">
                        <Box component="button" onClick={handlePrint}
                            style={{ padding: '10px 22px', borderRadius: 9, background: '#1F2937', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            🖨️ Print Payslip
                        </Box>
                        <Box component="button" onClick={handlePrint}
                            style={{ padding: '10px 22px', borderRadius: 9, background: '#F59E0B', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            📄 Export PDF
                        </Box>
                    </Group>

                    {/* The printable payslip document */}
                    <Payslip slip={slip} run={run} bankDetail={bankDetail} company={company} nssfRate={nssfRate} />
                </>
            )}

            {!slip && empId && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '60px', textAlign: 'center' }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
                    <Text fw={700} size="lg" style={{ color: textPri, marginBottom: 6 }}>No payslip found</Text>
                    <Text size="sm" style={{ color: textSec }}>No payroll run exists for {MONTHS[parseInt(month)]} {year}, or this employee has no slip for that period.</Text>
                </Box>
            )}

            {!slip && !empId && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '60px', textAlign: 'center' }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
                    <Text fw={700} size="lg" style={{ color: textPri, marginBottom: 6 }}>Select month, year and employee</Text>
                    <Text size="sm" style={{ color: textSec }}>Use the filters above to search for a salary slip.</Text>
                </Box>
            )}
        </DashboardLayout>
    );
}

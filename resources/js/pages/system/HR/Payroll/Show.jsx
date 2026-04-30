import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, Modal, NumberInput, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function EditSlipModal({ slip, run, onClose, isDark, cardBorder }) {
    const { data, setData, patch, processing, errors } = useForm({
        basic_salary:      slip.basic_salary ?? '',
        allowances:        slip.allowances ?? 0,
        overtime:          slip.overtime ?? 0,
        other_deductions:  slip.other_deductions ?? 0,
        advance_deduction: slip.advance_deduction ?? 0,
        loan_deduction:    slip.loan_deduction ?? 0,
        heslb:             slip.heslb ?? 0,
        adjustment:        slip.adjustment ?? 0,
        notes:             slip.notes ?? '',
    });

    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };

    const submit = (e) => {
        e.preventDefault();
        patch(`/system/hr/payroll/${run.id}/slips/${slip.id}`, { onSuccess: onClose });
    };

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 12 }}>Edit Slip: {slip.employee?.name}</Text>
            <Group grow gap="md" mb="md">
                <NumberInput label="Basic Salary (TZS) *" value={data.basic_salary} onChange={v => setData('basic_salary', v ?? 0)} min={0} hideControls error={errors.basic_salary} styles={inputStyles} />
                <NumberInput label="Allowances" value={data.allowances} onChange={v => setData('allowances', v ?? 0)} min={0} hideControls styles={inputStyles} />
            </Group>
            <Group grow gap="md" mb="md">
                <NumberInput label="Overtime" value={data.overtime} onChange={v => setData('overtime', v ?? 0)} min={0} hideControls styles={inputStyles} />
                <NumberInput label="Other Deductions" value={data.other_deductions} onChange={v => setData('other_deductions', v ?? 0)} min={0} hideControls styles={inputStyles} />
            </Group>
            <Group grow gap="md" mb="md">
                <NumberInput label="Advance Deduction" value={data.advance_deduction} onChange={v => setData('advance_deduction', v ?? 0)} min={0} hideControls styles={inputStyles} />
                <NumberInput label="Loan Deduction" value={data.loan_deduction} onChange={v => setData('loan_deduction', v ?? 0)} min={0} hideControls styles={inputStyles} />
            </Group>
            <Group grow gap="md" mb="md">
                <NumberInput label="HESLB" value={data.heslb} onChange={v => setData('heslb', v ?? 0)} min={0} hideControls styles={inputStyles} />
                <NumberInput label="Adjustment (± TZS)" value={data.adjustment} onChange={v => setData('adjustment', v ?? 0)} hideControls styles={inputStyles} />
            </Group>
            <Textarea label="Notes" value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyles} rows={2} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Recalculating…' : 'Recalculate & Save'}
                </Box>
            </Group>
        </Box>
    );
}

const TH = ({ children, right }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textSec = isDark ? dk.textSec : '#64748B';
    return <th style={{ padding: '9px 10px', textAlign: right ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: textSec, whiteSpace: 'nowrap', background: isDark ? 'var(--c-thead)' : '#EFF6FF' }}>{children}</th>;
};

export default function ShowPayroll({ run, slips, totals, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [editSlip, setEditSlip] = useState(null);
    const statusInfo = statuses[run.status] ?? { label: run.status, color: '#94A3B8' };

    const handleProcess = () => {
        if (!confirm('Mark this payroll run as Processed? This indicates salaries have been paid.')) return;
        router.post(`/system/hr/payroll/${run.id}/process`);
    };
    const handleClose = () => {
        if (!confirm('Close this payroll run? This action cannot be undone.')) return;
        router.post(`/system/hr/payroll/${run.id}/close`);
    };

    // Summary totals grid
    const summaryCards = [
        ['Gross Payroll', totals.gross, '#3B82F6'],
        ['PAYE', totals.paye, '#EF4444'],
        ['NSSF (Employee)', totals.nssf_emp, '#F59E0B'],
        ['NHIF (Employee)', totals.nhif, '#F59E0B'],
        ['HESLB', totals.heslb, '#8B5CF6'],
        ['Advances', totals.advances, '#F59E0B'],
        ['Loans', totals.loans, '#F59E0B'],
        ['Net Payable', totals.net, '#22C55E'],
        ['SDL (Employer)', totals.sdl, '#8B5CF6'],
        ['NSSF (Employer)', totals.nssf_er, '#8B5CF6'],
        ['WCF (Employer)', totals.wcf, '#8B5CF6'],
        ['Total Employer Cost', totals.employer_cost, '#475569'],
    ];

    const td = (value, color, bold = false) => (
        <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12, color: color ?? textSec, fontWeight: bold ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(value)}</td>
    );

    return (
        <DashboardLayout title="Payroll Run">
            <Head title={`Payroll — ${MONTHS[run.month]} ${run.year}`} />

            <Modal opened={!!editSlip} onClose={() => setEditSlip(null)} withCloseButton={false} size="lg"
                styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {editSlip && <EditSlipModal slip={editSlip} run={run} onClose={() => setEditSlip(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            {/* Header */}
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap="sm">
                        <Text fw={800} size="xl" style={{ color: textPri }}>{MONTHS[run.month]} {run.year} Payroll</Text>
                        <Badge size="md" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>{statusInfo.label}</Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>
                        {run.document_number && <span style={{ color: '#3B82F6', fontWeight: 700, marginRight: 10 }}>{run.document_number}</span>}
                        {slips.length} employee{slips.length !== 1 ? 's' : ''}
                    </Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/payroll" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back</Box>
                    {run.status === 'draft' && (
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" onClick={handleProcess} style={{ padding: '9px 18px', borderRadius: 9, background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✅ Mark Processed</Box>
                        </motion.div>
                    )}
                    {run.status === 'processed' && (
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" onClick={handleClose} style={{ padding: '9px 18px', borderRadius: 9, background: '#22C55E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>🔒 Close Run</Box>
                        </motion.div>
                    )}
                </Group>
            </Group>

            {/* Totals summary */}
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
                {summaryCards.map(([label, value, color]) => (
                    <Box key={label} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '12px 14px' }}>
                        <Text size="xs" style={{ color: textSec }}>{label}</Text>
                        <Text fw={800} size="sm" style={{ color }}>{fmt(value)}</Text>
                    </Box>
                ))}
            </Box>

            {/* Staff list — matches images 7-8 */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ padding: '12px 18px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                    <Text fw={700} size="sm" style={{ color: textPri }}>Staff List</Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <TH>#</TH>
                                <TH>NAME</TH>
                                <TH right>BASIC SALARY</TH>
                                <TH right>ALLOWANCE</TH>
                                <TH right>GROSS PAY</TH>
                                <TH right>EMPLOYER PENSION</TH>
                                <TH right>EMPLOYEE PENSION</TH>
                                <TH right>TAXABLE</TH>
                                <TH right>PAYE</TH>
                                <TH right>WCF</TH>
                                <TH right>SDL</TH>
                                <TH right>HESLB</TH>
                                <TH right>EMPLOYEE HEALTH</TH>
                                <TH right>ADVANCE SALARY</TH>
                                <TH right>LOAN DEDUCTION</TH>
                                <TH right>LOAN BALANCE</TH>
                                <TH right>ADJUSTMENT</TH>
                                <TH right>NET</TH>
                                <TH></TH>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Group label */}
                            {slips.length > 0 && (
                                <tr>
                                    <td colSpan={19} style={{ padding: '8px 14px', background: isDark ? 'var(--c-border-row)' : '#F0F9FF', fontSize: 12, fontWeight: 700, color: '#3B82F6' }}>
                                        HQ's Payroll
                                    </td>
                                </tr>
                            )}
                            {slips.length === 0 ? (
                                <tr><td colSpan={19} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No employee slips.</td></tr>
                            ) : slips.map((slip, idx) => {
                                const taxable = Math.max(0, (slip.gross_salary ?? 0) - (slip.nssf_employee ?? 0));
                                return (
                                    <tr key={slip.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '10px 10px', fontSize: 12, color: '#3B82F6', fontWeight: 700 }}>{idx + 1}</td>
                                        <td style={{ padding: '10px 10px', minWidth: 160 }}>
                                            <Text fw={600} size="xs" style={{ color: textPri }}>{slip.employee?.name}</Text>
                                        </td>
                                        {td(slip.basic_salary, '#3B82F6')}
                                        {td(slip.allowances, textSec)}
                                        {td(slip.gross_salary, '#3B82F6', true)}
                                        {td(slip.nssf_employer, '#8B5CF6')}
                                        {td(slip.nssf_employee, '#F59E0B')}
                                        {td(taxable, textSec)}
                                        {td(slip.paye, '#EF4444')}
                                        {td(slip.wcf_employer, '#8B5CF6')}
                                        {td(slip.sdl_employer, '#8B5CF6')}
                                        {td(slip.heslb, slip.heslb > 0 ? '#8B5CF6' : textSec)}
                                        {td(slip.nhif_employee, '#F59E0B')}
                                        {td(slip.advance_deduction, slip.advance_deduction > 0 ? '#F59E0B' : textSec)}
                                        {td(slip.loan_deduction, slip.loan_deduction > 0 ? '#F59E0B' : textSec)}
                                        {td(slip.loan_balance, textSec)}
                                        {td(slip.adjustment, slip.adjustment != 0 ? '#F59E0B' : textSec)}
                                        {td(slip.net_salary, '#22C55E', true)}
                                        <td style={{ padding: '10px 10px', textAlign: 'right' }}>
                                            {run.status === 'draft' && (
                                                <Box component="button" onClick={() => setEditSlip(slip)} style={{ padding: '4px 8px', borderRadius: 6, background: 'transparent', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 11 }}>✏️</Box>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* Totals row */}
                            {slips.length > 0 && (
                                <tr style={{ borderTop: `2px solid ${isDark ? dk.border : '#CBD5E1'}`, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                                    <td colSpan={2} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: textSec }}>TOTALS</td>
                                    {td(totals.gross, '#3B82F6', true)}
                                    <td />
                                    {td(totals.gross, '#3B82F6', true)}
                                    {td(totals.nssf_er, '#8B5CF6', true)}
                                    {td(totals.nssf_emp, '#F59E0B', true)}
                                    <td />
                                    {td(totals.paye, '#EF4444', true)}
                                    {td(totals.wcf, '#8B5CF6', true)}
                                    {td(totals.sdl, '#8B5CF6', true)}
                                    {td(totals.heslb, '#8B5CF6', true)}
                                    {td(totals.nhif, '#F59E0B', true)}
                                    {td(totals.advances, '#F59E0B', true)}
                                    {td(totals.loans, '#F59E0B', true)}
                                    <td /><td />
                                    {td(totals.net, '#22C55E', true)}
                                    <td />
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Box>
            </Box>
        </DashboardLayout>
    );
}

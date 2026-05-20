import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Modal, NumberInput, Textarea, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function PersonAvatar({ name, size = 36 }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text size="xs" fw={900} style={{ color }}>{initials}</Text>
        </Box>
    );
}

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

    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
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
            <Group gap={10} mb={16}>
                <PersonAvatar name={slip.employee?.name} size={38} />
                <Stack gap={1}>
                    <Text fw={700} style={{ color: textPri }}>Edit Slip</Text>
                    <Text size="sm" style={{ color: textSec }}>{slip.employee?.name}</Text>
                </Stack>
            </Group>
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
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Recalculating…' : 'Recalculate & Save'}
                </Box>
            </Group>
        </Box>
    );
}

export default function ShowPayroll({ run, slips, totals, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

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

    const summaryCards = [
        { label: 'Gross Payroll',     value: totals.gross,         grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { label: 'Net Payable',       value: totals.net,           grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { label: 'PAYE',              value: totals.paye,          grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)', glow: '0 8px 28px rgba(239,68,68,0.4)' },
        { label: 'NSSF (Employee)',   value: totals.nssf_emp,      grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.35)' },
        { label: 'NHIF (Employee)',   value: totals.nhif,          grad: 'linear-gradient(135deg, #7C2D8E 0%, #9333EA 60%, #A855F7 100%)', glow: '0 8px 28px rgba(168,85,247,0.35)' },
        { label: 'Total Employer Cost', value: totals.employer_cost, grad: 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)', glow: '0 8px 28px rgba(194,65,12,0.35)' },
    ];

    const td = (value, color, bold = false) => (
        <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 12, color: color ?? textSec, fontWeight: bold ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(value)}</td>
    );

    return (
        <DashboardLayout title="Payroll Run">
            <Head title={`Payroll — ${MONTHS[run.month]} ${run.year}`} />

            <Modal opened={!!editSlip} onClose={() => setEditSlip(null)} withCloseButton={false} size="lg"
                styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {editSlip && <EditSlipModal slip={editSlip} run={run} onClose={() => setEditSlip(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💼</Box>
                            <Stack gap={2}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white">{MONTHS[run.month]} {run.year} Payroll</Text>
                                    <Box style={{ background: statusInfo.color + '30', border: `1px solid ${statusInfo.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{statusInfo.label}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Group gap={8}>
                                    {run.document_number && <Text size="sm" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>{run.document_number}</Text>}
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.65)' }}>· {slips.length} employee{slips.length !== 1 ? 's' : ''}</Text>
                                </Group>
                            </Stack>
                        </Group>
                        <Group gap={8} wrap="wrap">
                            <Box component={Link} href="/system/hr/payroll"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                ← Back
                            </Box>
                            {run.status === 'draft' && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component="button" onClick={handleProcess}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ✅ Mark Processed
                                    </Box>
                                </motion.div>
                            )}
                            {run.status === 'processed' && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component="button" onClick={handleClose}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#059669', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        🔒 Close Run
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Summary stat cards */}
            <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md" mb={24}>
                {summaryCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -3 }}>
                        <Box style={{ background: s.grad, borderRadius: 14, padding: '16px 18px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 100 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -16, right: -16, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Text size="xs" c="white" style={{ opacity: 0.75, marginBottom: 6, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                            <Text fw={900} c="white" style={{ fontSize: '1.1rem', lineHeight: 1.2, position: 'relative', zIndex: 1 }}>TZS {fmt(s.value)}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Staff list table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    {/* Top accent */}
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C, #F97316)' }} />

                    {/* Toolbar */}
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Text size="sm">👥</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Staff List</Text>
                        </Group>
                        <Text size="xs" style={{ color: textMut }}>{slips.length} employee{slips.length !== 1 ? 's' : ''}</Text>
                    </Box>

                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['#', 'NAME', 'BASIC', 'ALLOWANCE', 'GROSS', 'EMP. PENSION', 'EE PENSION', 'TAXABLE', 'PAYE', 'WCF', 'SDL', 'HESLB', 'EE HEALTH', 'ADVANCE', 'LOAN DED.', 'LOAN BAL.', 'ADJ.', 'NET', ''].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 10px', textAlign: i > 1 ? 'right' : 'left', fontSize: 10, fontWeight: 800, color: textMut, whiteSpace: 'nowrap', letterSpacing: 0.7, textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {slips.length > 0 && (
                                    <tr>
                                        <td colSpan={19} style={{ padding: '8px 20px', background: isDark ? 'rgba(234,88,12,0.08)' : '#FFF7F0', fontSize: 12, fontWeight: 700, color: '#EA580C', borderBottom: `1px solid ${divider}` }}>
                                            HQ&apos;s Payroll
                                        </td>
                                    </tr>
                                )}
                                {slips.length === 0 ? (
                                    <tr>
                                        <td colSpan={19} style={{ padding: '48px', textAlign: 'center', color: textMut }}>
                                            <Box style={{ textAlign: 'center' }}>
                                                <Text size="2rem" style={{ marginBottom: 8 }}>👥</Text>
                                                <Text size="sm" style={{ color: textMut }}>No employee slips.</Text>
                                            </Box>
                                        </td>
                                    </tr>
                                ) : slips.map((slip, idx) => {
                                    const taxable = Math.max(0, (slip.gross_salary ?? 0) - (slip.nssf_employee ?? 0));
                                    return (
                                        <motion.tr key={slip.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                                            style={{ borderBottom: `1px solid ${divider}`, cursor: 'default' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '10px 10px', fontSize: 12, color: '#EA580C', fontWeight: 700 }}>{idx + 1}</td>
                                            <td style={{ padding: '10px 10px', minWidth: 180 }}>
                                                <Group gap={8} wrap="nowrap">
                                                    <PersonAvatar name={slip.employee?.name} size={28} />
                                                    <Text fw={600} size="xs" style={{ color: textPri, whiteSpace: 'nowrap' }}>{slip.employee?.name}</Text>
                                                </Group>
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
                                                    <Tooltip label="Edit slip" position="top" withArrow>
                                                        <ActionIcon variant="subtle" size={28} onClick={() => setEditSlip(slip)}
                                                            style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 7, color: '#EA580C' }}>
                                                            <Text size="xs">✏️</Text>
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                {/* Totals row */}
                                {slips.length > 0 && (
                                    <tr style={{ borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#CBD5E1'}`, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                                        <td colSpan={2} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: textMut, textTransform: 'uppercase' }}>Totals</td>
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
            </motion.div>
        </DashboardLayout>
    );
}

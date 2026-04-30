import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Badge, ActionIcon, Pagination, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function StatCard({ label, value, icon, color, isDark }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '16px 20px' }}>
            <Group gap={10}><Text style={{ fontSize: 22 }}>{icon}</Text><div>
                <Text size="xl" fw={800} style={{ color: color ?? (isDark ? dk.textPri : '#1E293B'), lineHeight: 1 }}>{value}</Text>
                <Text size="xs" style={{ color: isDark ? dk.textSec : '#64748B' }}>{label}</Text>
            </div></Group>
        </Box>
    );
}

function ApprovalModal({ loan, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '' });
    const textPri = isDark ? dk.textPri : '#1E293B'; const textSec = isDark ? dk.textSec : '#64748B';
    const isApprove = action === 'approve';
    const inputStyles = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 } };
    const submit = (e) => { e.preventDefault(); post(`/system/hr/loans/${loan.id}/${action}`, { onSuccess: onClose }); };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 8 }}>{isApprove ? '✅ Approve Loan' : '❌ Reject Loan'} — {loan.employee?.name}</Text>
            <Text size="xs" style={{ color: textSec, marginBottom: 14 }}>{loan.loan_number} · TZS {fmt(loan.principal)} · {loan.monthly_installment}/mo × {loan.total_months} months</Text>
            <Textarea label="Notes" value={data.approval_notes} onChange={e => setData('approval_notes', e.target.value)} rows={2} styles={inputStyles} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: isApprove ? '#22C55E' : '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : isApprove ? 'Approve & Activate' : 'Reject'}</Box>
            </Group>
        </Box>
    );
}

export default function LoansIndex({ loans, stats, statuses, employees, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [empId, setEmpId]   = useState(filters.employee_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [modal, setModal]   = useState(null);

    const applyFilters = (o = {}) => router.get('/system/hr/loans', { employee_id: empId, status, ...o }, { preserveState: true, replace: true });
    const handleDelete = (id) => { if (!confirm('Delete this loan?')) return; router.delete(`/system/hr/loans/${id}`, { preserveScroll: true }); };

    const empData    = [{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))];
    const statusData = [{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))];
    const iStyles    = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };

    return (
        <DashboardLayout title="Employee Loans">
            <Head title="Employee Loans" />
            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false} styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApprovalModal loan={modal.loan} action={modal.action} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Employee Loans</Text>
                    <Text size="sm" style={{ color: textSec }}>Monthly installments auto-deducted from payroll</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/hr/loans/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>+ New Loan</Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <StatCard label="Total Loans" value={stats.total} icon="🏦" isDark={isDark} />
                <StatCard label="Pending Approval" value={stats.pending} icon="⏳" color="#F59E0B" isDark={isDark} />
                <StatCard label="Active" value={stats.active} icon="📆" color="#3B82F6" isDark={isDark} />
                <StatCard label="Outstanding Balance (TZS)" value={`TZS ${fmt(stats.total_outstanding)}`} icon="💰" color="#EF4444" isDark={isDark} />
            </SimpleGrid>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
                <Group gap="md">
                    <Select placeholder="All employees" value={empId} onChange={v => { setEmpId(v ?? ''); applyFilters({ employee_id: v ?? '' }); }} data={empData} searchable clearable styles={iStyles} style={{ flex: 1 }} />
                    <Select placeholder="All statuses" value={status} onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }} data={statusData} styles={iStyles} style={{ width: 160 }} clearable />
                </Group>
            </Box>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['#', 'Employee', 'Principal', 'Monthly', 'Balance', 'Progress', 'Status', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loans.data.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No loans found.</td></tr>
                            ) : loans.data.map(loan => {
                                const pct = loan.total_months > 0 ? Math.round((loan.months_paid / loan.total_months) * 100) : 0;
                                return (
                                    <tr key={loan.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '13px 14px' }}><Text size="xs" fw={700} style={{ color: textSec, fontFamily: 'monospace' }}>{loan.loan_number}</Text></td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Text fw={600} size="sm" style={{ color: textPri }}>{loan.employee?.name}</Text>
                                            <Text size="xs" style={{ color: textSec }}>{loan.purpose ?? '—'}</Text>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: '#3B82F6' }}>TZS {fmt(loan.principal)}</Text></td>
                                        <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec }}>TZS {fmt(loan.monthly_installment)}/mo</Text></td>
                                        <td style={{ padding: '13px 14px' }}><Text size="sm" fw={700} style={{ color: Number(loan.balance_remaining) > 0 ? '#EF4444' : '#22C55E' }}>TZS {fmt(loan.balance_remaining)}</Text></td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Box>
                                                <Text size="xs" style={{ color: textSec, marginBottom: 3 }}>{loan.months_paid}/{loan.total_months} months ({pct}%)</Text>
                                                <Box style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', borderRadius: 3, width: 80 }}>
                                                    <Box style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#22C55E' : '#3B82F6', borderRadius: 3 }} />
                                                </Box>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Badge size="sm" style={{ background: statuses[loan.status]?.color + '22', color: statuses[loan.status]?.color, border: `1px solid ${statuses[loan.status]?.color}44` }}>
                                                {statuses[loan.status]?.label}
                                            </Badge>
                                        </td>
                                        <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                            <Group gap={6} justify="flex-end">
                                                <ActionIcon component={Link} href={`/system/hr/loans/${loan.id}`} variant="subtle" size="sm" style={{ color: '#3B82F6' }}>👁</ActionIcon>
                                                {loan.status === 'pending' && <>
                                                    <ActionIcon variant="subtle" size="sm" style={{ color: '#22C55E' }} onClick={() => setModal({ loan, action: 'approve' })}>✅</ActionIcon>
                                                    <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => setModal({ loan, action: 'reject' })}>❌</ActionIcon>
                                                </>}
                                                {(loan.status === 'pending' || loan.status === 'rejected') && <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => handleDelete(loan.id)}>🗑️</ActionIcon>}
                                            </Group>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
                {loans.last_page > 1 && (
                    <Box style={{ padding: '14px 18px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={loans.last_page} value={loans.current_page} onChange={p => router.get('/system/hr/loans', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Badge, ActionIcon, Pagination, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

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

function ApprovalModal({ advance, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '', deduction_month: '' });
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const isApprove = action === 'approve';
    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };
    const submit = (e) => {
        e.preventDefault();
        post(`/system/hr/advances/${advance.id}/${action}`, { onSuccess: onClose });
    };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 8 }}>{isApprove ? '✅ Approve' : '❌ Reject'} Advance — {advance.employee?.name}</Text>
            <Text size="xs" style={{ color: textSec, marginBottom: 16 }}>TZS {fmt(advance.amount)} · {advance.purpose ?? 'No purpose stated'}</Text>
            {isApprove && <DatePicker label="Deduct in payroll month" value={data.deduction_month} onChange={v => setData('deduction_month', v)} styles={inputStyles} mb="md" />}
            <Textarea label="Notes" value={data.approval_notes} onChange={e => setData('approval_notes', e.target.value)} rows={2} styles={inputStyles} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: isApprove ? '#22C55E' : '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : isApprove ? 'Approve' : 'Reject'}
                </Box>
            </Group>
        </Box>
    );
}

export default function AdvancesIndex({ advances, stats, statuses, employees, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [empId, setEmpId]   = useState(filters.employee_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [modal, setModal]   = useState(null);

    const applyFilters = (o = {}) => router.get('/system/hr/advances', { employee_id: empId, status, ...o }, { preserveState: true, replace: true });
    const handleDelete = (id) => { if (!confirm('Delete this advance request?')) return; router.delete(`/system/hr/advances/${id}`, { preserveScroll: true }); };

    const empData = [{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))];
    const statusData = [{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))];
    const iStyles = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };

    return (
        <DashboardLayout title="Salary Advances">
            <Head title="Salary Advances" />
            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false} styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApprovalModal advance={modal.advance} action={modal.action} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Salary Advances</Text>
                    <Text size="sm" style={{ color: textSec }}>One-time advance requests deducted from next payroll</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/hr/advances/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>+ New Advance</Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <StatCard label="Total Requests" value={stats.total} icon="💵" isDark={isDark} />
                <StatCard label="Pending Approval" value={stats.pending} icon="⏳" color="#F59E0B" isDark={isDark} />
                <StatCard label="Approved (awaiting deduction)" value={stats.approved} icon="✅" color="#3B82F6" isDark={isDark} />
                <StatCard label="Approved Amount (TZS)" value={`TZS ${fmt(stats.total_approved_amount)}`} icon="💰" color="#22C55E" isDark={isDark} />
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
                                {['Employee', 'Amount', 'Purpose', 'Requested', 'Deduct Month', 'Status', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {advances.data.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No advance requests found.</td></tr>
                            ) : advances.data.map(adv => (
                                <tr key={adv.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{adv.employee?.name}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{adv.employee?.employee_number}</Text>
                                    </td>
                                    <td style={{ padding: '13px 14px' }}><Text fw={700} size="sm" style={{ color: '#3B82F6' }}>TZS {fmt(adv.amount)}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec }}>{adv.purpose ?? '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{adv.requested_date}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{adv.deduction_month ? adv.deduction_month.slice(0, 7) : '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Badge size="sm" style={{ background: statuses[adv.status]?.color + '22', color: statuses[adv.status]?.color, border: `1px solid ${statuses[adv.status]?.color}44` }}>
                                            {statuses[adv.status]?.label}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon component={Link} href={`/system/hr/advances/${adv.id}`} variant="subtle" size="sm" style={{ color: '#3B82F6' }}>👁</ActionIcon>
                                            {adv.status === 'pending' && <>
                                                <ActionIcon variant="subtle" size="sm" style={{ color: '#22C55E' }} onClick={() => setModal({ advance: adv, action: 'approve' })}>✅</ActionIcon>
                                                <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => setModal({ advance: adv, action: 'reject' })}>❌</ActionIcon>
                                            </>}
                                            {adv.status !== 'deducted' && <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => handleDelete(adv.id)}>🗑️</ActionIcon>}
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {advances.last_page > 1 && (
                    <Box style={{ padding: '14px 18px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={advances.last_page} value={advances.current_page} onChange={p => router.get('/system/hr/advances', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

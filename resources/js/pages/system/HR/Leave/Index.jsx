import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Badge, ActionIcon, Pagination, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

function StatCard({ label, value, icon, color, isDark }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '16px 20px' }}>
            <Group gap={10}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
                <div>
                    <Text size="xl" fw={800} style={{ color: color ?? (isDark ? dk.textPri : '#1E293B'), lineHeight: 1 }}>{value}</Text>
                    <Text size="xs" style={{ color: isDark ? dk.textSec : '#64748B' }}>{label}</Text>
                </div>
            </Group>
        </Box>
    );
}

function ApprovalModal({ leave, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '' });
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const isApprove = action === 'approve';

    const submit = (e) => {
        e.preventDefault();
        post(`/system/hr/leave/${leave.id}/${action}`, { onSuccess: onClose });
    };

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 8 }}>
                {isApprove ? '✅ Approve' : '❌ Reject'} leave request for {leave.employee?.name}
            </Text>
            <Text size="xs" style={{ color: textSec, marginBottom: 16 }}>
                {leave.type} · {leave.start_date} → {leave.end_date} · {leave.days} day(s)
            </Text>
            <Textarea
                label="Notes (optional)"
                placeholder="Add a note for the employee…"
                value={data.approval_notes}
                onChange={e => setData('approval_notes', e.target.value)}
                rows={3}
                styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri }, label: { color: textSec, fontSize: 13, fontWeight: 600 } }}
                mb="md"
            />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 18px', borderRadius: 8, background: isApprove ? '#22C55E' : '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : isApprove ? 'Approve' : 'Reject'}
                </Box>
            </Group>
        </Box>
    );
}

export default function LeaveIndex({ leaves, stats, types, statuses, employees, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [empId, setEmpId]         = useState(filters.employee_id ?? '');
    const [status, setStatus]       = useState(filters.status ?? '');
    const [type, setType]           = useState(filters.type ?? '');
    const [modal, setModal]         = useState(null); // { leave, action }

    const applyFilters = (overrides = {}) => {
        router.get('/system/hr/leave', { employee_id: empId, status, type, ...overrides }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this leave request?')) return;
        router.delete(`/system/hr/leave/${id}`, { preserveScroll: true });
    };

    const empData = [{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))];
    const statusData = [{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))];
    const typeData = [{ value: '', label: 'All types' }, ...Object.entries(types).map(([k, v]) => ({ value: k, label: v.label }))];

    return (
        <DashboardLayout title="Leave Management">
            <Head title="Leave Management" />

            <Modal opened={!!modal} onClose={() => setModal(null)} title="" withCloseButton={false}
                styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApprovalModal leave={modal.leave} action={modal.action} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Leave Management</Text>
                    <Text size="sm" style={{ color: textSec }}>Staff leave requests and approvals</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/hr/leave/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        + New Request
                    </Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <StatCard label="Total Requests" value={stats.total} icon="📋" isDark={isDark} />
                <StatCard label="Pending" value={stats.pending} icon="⏳" color="#F59E0B" isDark={isDark} />
                <StatCard label="Approved" value={stats.approved} icon="✅" color="#22C55E" isDark={isDark} />
                <StatCard label="Rejected" value={stats.rejected} icon="❌" color="#EF4444" isDark={isDark} />
            </SimpleGrid>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <Select placeholder="All employees" value={empId} onChange={v => { setEmpId(v ?? ''); applyFilters({ employee_id: v ?? '' }); }} data={empData} searchable clearable styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} style={{ flex: 1 }} />
                    <Select placeholder="All types" value={type} onChange={v => { setType(v ?? ''); applyFilters({ type: v ?? '' }); }} data={typeData} styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} style={{ width: 180 }} clearable />
                    <Select placeholder="All statuses" value={status} onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }} data={statusData} styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} style={{ width: 150 }} clearable />
                </Group>
            </Box>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Employee', 'Type', 'Period', 'Days', 'Status', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.data.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No leave requests found.</td></tr>
                            ) : leaves.data.map(leave => (
                                <tr key={leave.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{leave.employee?.name ?? '—'}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{leave.employee?.employee_number}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Badge size="sm" style={{ background: types[leave.type]?.color + '22', color: types[leave.type]?.color, border: `1px solid ${types[leave.type]?.color}44` }}>
                                            {types[leave.type]?.label ?? leave.type}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{leave.start_date} → {leave.end_date}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" fw={700} style={{ color: textPri }}>{leave.days}d</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Badge size="sm" style={{ background: statuses[leave.status]?.color + '22', color: statuses[leave.status]?.color, border: `1px solid ${statuses[leave.status]?.color}44` }}>
                                            {statuses[leave.status]?.label}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon component={Link} href={`/system/hr/leave/${leave.id}`} variant="subtle" size="sm" style={{ color: '#3B82F6' }}>👁</ActionIcon>
                                            {leave.status === 'pending' && (
                                                <>
                                                    <ActionIcon variant="subtle" size="sm" style={{ color: '#22C55E' }} onClick={() => setModal({ leave, action: 'approve' })} title="Approve">✅</ActionIcon>
                                                    <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => setModal({ leave, action: 'reject' })} title="Reject">❌</ActionIcon>
                                                </>
                                            )}
                                            <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => handleDelete(leave.id)}>🗑️</ActionIcon>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {leaves.last_page > 1 && (
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={leaves.last_page} value={leaves.current_page} onChange={p => router.get('/system/hr/leave', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

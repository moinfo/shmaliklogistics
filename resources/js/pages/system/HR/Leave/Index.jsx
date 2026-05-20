import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, ActionIcon, Tooltip, Pagination, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

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

function StatusPill({ color, label }) {
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: `1px solid ${color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
            <Text size="xs" fw={700} style={{ color, letterSpacing: 0.4 }}>{label}</Text>
        </Box>
    );
}

function ApprovalModal({ leave, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '' });
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
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
                {leave.type} · {formatDate(leave.start_date)} → {formatDate(leave.end_date)} · {leave.days} day(s)
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

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const [empId, setEmpId]   = useState(filters.employee_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [type, setType]     = useState(filters.type ?? '');
    const [modal, setModal]   = useState(null);
    const can = useCan();

    const applyFilters = (overrides = {}) => {
        router.get('/system/hr/leave', { employee_id: empId, status, type, ...overrides }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this leave request?')) return;
        router.delete(`/system/hr/leave/${id}`, { preserveScroll: true });
    };

    const empData    = [{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))];
    const statusData = [{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))];
    const typeData   = [{ value: '', label: 'All types' }, ...Object.entries(types).map(([k, v]) => ({ value: k, label: v.label }))];

    const statCards = [
        { icon: '📋', label: 'Total Requests', value: String(stats.total),    grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '⏳', label: 'Pending',         value: String(stats.pending),  grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
        { icon: '✅', label: 'Approved',         value: String(stats.approved), grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { icon: '❌', label: 'Rejected',         value: String(stats.rejected), grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)', glow: '0 8px 28px rgba(239,68,68,0.4)' },
    ];

    const cols = '1fr 160px 220px 80px 160px 100px';

    return (
        <DashboardLayout title="Leave Management">
            <Head title="Leave Management" />

            <Modal opened={!!modal} onClose={() => setModal(null)} title="" withCloseButton={false}
                styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApprovalModal leave={modal.leave} action={modal.action} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            {/* ── Page header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={28} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '22px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }} wrap="wrap" gap="md">
                        <Group gap={10} align="center">
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                🏖️
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Leave Management</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Staff leave requests and approvals</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('hr_leave.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/hr/leave/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ New Request
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Stat cards ── */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── Filters ── */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <Select
                        placeholder="All employees"
                        value={empId}
                        onChange={v => { setEmpId(v ?? ''); applyFilters({ employee_id: v ?? '' }); }}
                        data={empData}
                        searchable clearable
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 }, dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 } }}
                    />
                    <Select
                        placeholder="All types"
                        value={type}
                        onChange={v => { setType(v ?? ''); applyFilters({ type: v ?? '' }); }}
                        data={typeData}
                        clearable
                        w={180}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 }, dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }}
                        data={statusData}
                        clearable
                        w={160}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 }, dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 } }}
                    />
                </Group>
            </Box>

            {/* ── Table card ── */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>Leave Requests</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {leaves.data.length > 0 ? `Showing ${leaves.from ?? 1}–${leaves.to ?? leaves.data.length} of ${leaves.total ?? leaves.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Employee', 'Type', 'Period', 'Days', 'Status', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {leaves.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                            🏖️
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No leave requests found</Text>
                        <Text size="sm" style={{ color: textMut }}>Try adjusting your filters or create a new request</Text>
                    </Box>
                ) : (
                    leaves.data.map((leave, i) => {
                        const typeInfo   = types[leave.type]      ?? { label: leave.type,   color: '#94A3B8' };
                        const statusInfo = statuses[leave.status] ?? { label: leave.status, color: '#94A3B8' };
                        return (
                            <motion.div key={leave.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, padding: '13px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${statusInfo.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/system/hr/leave/${leave.id}`)}>

                                    {/* Employee */}
                                    <Group gap={10} align="center">
                                        <PersonAvatar name={leave.employee?.name ?? '?'} />
                                        <Stack gap={2}>
                                            <Text size="sm" fw={700} style={{ color: textPri, lineHeight: 1.2 }}>{leave.employee?.name ?? '—'}</Text>
                                            <Text size="xs" style={{ color: textMut }}>{leave.employee?.employee_number}</Text>
                                        </Stack>
                                    </Group>

                                    {/* Type */}
                                    <StatusPill color={typeInfo.color} label={typeInfo.label} />

                                    {/* Period */}
                                    <Stack gap={2}>
                                        <Text size="xs" fw={600} style={{ color: textPri }}>{formatDate(leave.start_date)}</Text>
                                        <Text size="xs" style={{ color: textMut }}>→ {formatDate(leave.end_date)}</Text>
                                    </Stack>

                                    {/* Days */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 28, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}` }}>
                                        <Text size="xs" fw={700} style={{ color: textPri }}>{leave.days}d</Text>
                                    </Box>

                                    {/* Status */}
                                    <StatusPill color={statusInfo.color} label={statusInfo.label} />

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        {can('hr_leave.view') && (
                                            <Tooltip label="View" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/hr/leave/${leave.id}`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                    <Text size="xs">👁</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {can('hr_leave.approve') && leave.status === 'pending' && (
                                            <>
                                                <Tooltip label="Approve" position="top" withArrow>
                                                    <ActionIcon variant="subtle" size={30} onClick={() => setModal({ leave, action: 'approve' })}
                                                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#22C55E' }}>
                                                        <Text size="xs">✅</Text>
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Reject" position="top" withArrow>
                                                    <ActionIcon variant="subtle" size={30} onClick={() => setModal({ leave, action: 'reject' })}
                                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#EF4444' }}>
                                                        <Text size="xs">❌</Text>
                                                    </ActionIcon>
                                                </Tooltip>
                                            </>
                                        )}
                                        {can('hr_leave.delete') && (
                                            <Tooltip label="Delete" position="top" withArrow>
                                                <ActionIcon variant="subtle" size={30} onClick={() => handleDelete(leave.id)}
                                                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}>
                                                    <Text size="xs">🗑️</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {/* Footer */}
                {leaves.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>
                            {leaves.total ?? leaves.data.length} total request{(leaves.total ?? leaves.data.length) !== 1 ? 's' : ''}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* ── Pagination ── */}
            {leaves.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={leaves.current_page}
                        total={leaves.last_page}
                        onChange={p => router.get('/system/hr/leave', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

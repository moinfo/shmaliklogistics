import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, ActionIcon, Tooltip, Pagination, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

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

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}`, flexShrink: 0 }} />
            <Text size="xs" fw={700} style={{ color: meta.color, letterSpacing: 0.4 }}>{meta.label}</Text>
        </Box>
    );
}

function ApprovalModal({ advance, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '', deduction_month: '' });
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
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
            <Group gap={10} mb={12}>
                <PersonAvatar name={advance.employee?.name} size={38} />
                <Stack gap={1}>
                    <Text fw={700} style={{ color: textPri }}>{isApprove ? '✅ Approve' : '❌ Reject'} Advance</Text>
                    <Text size="sm" style={{ color: textSec }}>{advance.employee?.name} · TZS {fmt(advance.amount)}</Text>
                </Stack>
            </Group>
            <Text size="xs" style={{ color: textSec, marginBottom: 16 }}>{advance.purpose ?? 'No purpose stated'}</Text>
            {isApprove && <DatePicker label="Deduct in payroll month" value={data.deduction_month} onChange={v => setData('deduction_month', v)} styles={inputStyles} mb="md" />}
            <Textarea label="Notes" value={data.approval_notes} onChange={e => setData('approval_notes', e.target.value)} rows={2} styles={inputStyles} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: isApprove ? 'linear-gradient(135deg, #065F46, #059669)' : 'linear-gradient(135deg, #991B1B, #EF4444)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : isApprove ? 'Approve' : 'Reject'}
                </Box>
            </Group>
        </Box>
    );
}

export default function AdvancesIndex({ advances, stats, statuses, employees, filters }) {
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
    const [modal, setModal]   = useState(null);
    const can = useCan();

    const applyFilters = (o = {}) => router.get('/system/hr/advances', { employee_id: empId, status, ...o }, { preserveState: true, replace: true });
    const handleDelete = (id) => { if (!confirm('Delete this advance request?')) return; router.delete(`/system/hr/advances/${id}`, { preserveScroll: true }); };

    const empData = [{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))];
    const statusData = [{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))];
    const iStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
    };

    const statCards = [
        { icon: '💵', label: 'Total Requests',  value: String(stats.total),  grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '⏳', label: 'Pending Approval', value: String(stats.pending), grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.35)' },
        { icon: '✅', label: 'Approved',         value: String(stats.approved), grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { icon: '💰', label: 'Approved Amount',  value: `TZS ${fmt(stats.total_approved_amount)}`, valueSub: true, grad: 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)', glow: '0 8px 28px rgba(194,65,12,0.35)' },
    ];

    const cols = '1fr 160px 1fr 120px 120px 140px 100px';

    return (
        <DashboardLayout title="Salary Advances">
            <Head title="Salary Advances" />

            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false}
                styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApprovalModal advance={modal.advance} action={modal.action} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
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
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💵</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Salary Advances</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>One-time advance requests deducted from next payroll</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('hr_advances.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/hr/advances/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ New Advance
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat cards */}
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
                            <Text fw={900} c="white" style={{ fontSize: s.valueSub ? '1.1rem' : '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <Select placeholder="All employees" value={empId} onChange={v => { setEmpId(v ?? ''); applyFilters({ employee_id: v ?? '' }); }} data={empData} searchable clearable styles={iStyles} style={{ flex: 1 }} />
                    <Select placeholder="All statuses" value={status} onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }} data={statusData} styles={iStyles} style={{ width: 180 }} clearable />
                </Group>
            </Box>

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Advances</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {advances.data.length > 0 ? `Showing ${advances.from ?? 1}–${advances.to ?? advances.data.length} of ${advances.total ?? advances.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Employee', 'Amount', 'Purpose', 'Requested', 'Deduct Month', 'Status', 'Actions'].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {advances.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>💵</Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No advance requests found</Text>
                        <Text size="sm" style={{ color: textMut }}>Try adjusting your filters or create a new advance request</Text>
                    </Box>
                ) : (
                    advances.data.map((adv, i) => {
                        const meta = statuses[adv.status] ?? { label: adv.status, color: '#94A3B8' };
                        return (
                            <motion.div key={adv.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, padding: '13px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${meta.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/system/hr/advances/${adv.id}`)}>

                                    {/* Employee */}
                                    <Group gap={8} wrap="nowrap">
                                        <PersonAvatar name={adv.employee?.name} size={32} />
                                        <Stack gap={1}>
                                            <Text fw={600} size="sm" style={{ color: textPri }}>{adv.employee?.name}</Text>
                                            <Text size="xs" style={{ color: textMut }}>{adv.employee?.employee_number}</Text>
                                        </Stack>
                                    </Group>

                                    {/* Amount */}
                                    <Stack gap={1}>
                                        <Text fw={800} size="sm" style={{ color: '#22C55E' }}>TZS {fmt(adv.amount)}</Text>
                                    </Stack>

                                    {/* Purpose */}
                                    <Text size="sm" style={{ color: textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adv.purpose ?? '—'}</Text>

                                    {/* Requested */}
                                    <Text size="xs" fw={600} style={{ color: textPri, whiteSpace: 'nowrap' }}>{formatDate(adv.requested_date)}</Text>

                                    {/* Deduct Month */}
                                    <Text size="xs" style={{ color: textSec }}>{adv.deduction_month ? adv.deduction_month.slice(0, 7) : '—'}</Text>

                                    {/* Status */}
                                    <StatusPill status={adv.status} statuses={statuses} />

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        <Tooltip label="View" position="top" withArrow>
                                            <ActionIcon component={Link} href={`/system/hr/advances/${adv.id}`} variant="subtle" size={30}
                                                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                <Text size="xs">👁</Text>
                                            </ActionIcon>
                                        </Tooltip>
                                        {can('hr_advances.approve') && adv.status === 'pending' && (
                                            <>
                                                <Tooltip label="Approve" position="top" withArrow>
                                                    <ActionIcon variant="subtle" size={30} onClick={() => setModal({ advance: adv, action: 'approve' })}
                                                        style={{ background: isDark ? 'rgba(34,197,94,0.1)' : '#F0FDF4', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#22C55E' }}>
                                                        <Text size="xs">✅</Text>
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Reject" position="top" withArrow>
                                                    <ActionIcon variant="subtle" size={30} onClick={() => setModal({ advance: adv, action: 'reject' })}
                                                        style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}>
                                                        <Text size="xs">❌</Text>
                                                    </ActionIcon>
                                                </Tooltip>
                                            </>
                                        )}
                                        {can('hr_advances.delete') && adv.status !== 'deducted' && (
                                            <Tooltip label="Delete" position="top" withArrow>
                                                <ActionIcon variant="subtle" size={30} onClick={() => handleDelete(adv.id)}
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
                {advances.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{advances.total ?? advances.data.length} total advance request{(advances.total ?? advances.data.length) !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {advances.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination total={advances.last_page} value={advances.current_page} onChange={p => router.get('/system/hr/advances', { ...filters, page: p })} size="sm" styles={{ control: { borderRadius: 8 } }} />
                </Group>
            )}
        </DashboardLayout>
    );
}

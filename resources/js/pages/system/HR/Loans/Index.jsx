import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, ActionIcon, Tooltip, Pagination, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

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

function ApprovalModal({ loan, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '' });
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const isApprove = action === 'approve';
    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };
    const submit = (e) => { e.preventDefault(); post(`/system/hr/loans/${loan.id}/${action}`, { onSuccess: onClose }); };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Group gap={10} mb={12}>
                <PersonAvatar name={loan.employee?.name} size={38} />
                <Stack gap={1}>
                    <Text fw={700} style={{ color: textPri }}>{isApprove ? '✅ Approve Loan' : '❌ Reject Loan'}</Text>
                    <Text size="xs" style={{ color: textSec }}>{loan.loan_number} · TZS {fmt(loan.principal)} · {loan.monthly_installment}/mo × {loan.total_months} months</Text>
                </Stack>
            </Group>
            <Textarea label="Notes" value={data.approval_notes} onChange={e => setData('approval_notes', e.target.value)} rows={2} styles={inputStyles} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: isApprove ? 'linear-gradient(135deg, #065F46, #059669)' : 'linear-gradient(135deg, #991B1B, #EF4444)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : isApprove ? 'Approve & Activate' : 'Reject'}
                </Box>
            </Group>
        </Box>
    );
}

export default function LoansIndex({ loans, stats, statuses, employees, filters }) {
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

    const applyFilters = (o = {}) => router.get('/system/hr/loans', { employee_id: empId, status, ...o }, { preserveState: true, replace: true });
    const handleDelete = (id) => { if (!confirm('Delete this loan?')) return; router.delete(`/system/hr/loans/${id}`, { preserveScroll: true }); };

    const empData    = [{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))];
    const statusData = [{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))];
    const iStyles    = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
    };

    const statCards = [
        { icon: '🏦', label: 'Total Loans',        value: String(stats.total),   grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '⏳', label: 'Pending Approval',   value: String(stats.pending),  grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.35)' },
        { icon: '📆', label: 'Active',              value: String(stats.active),   grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { icon: '💰', label: 'Outstanding Balance', value: `TZS ${fmt(stats.total_outstanding)}`, valueSub: true, grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)', glow: '0 8px 28px rgba(239,68,68,0.4)' },
    ];

    const cols = '160px 1fr 150px 160px 160px 100px 140px 100px';

    return (
        <DashboardLayout title="Employee Loans">
            <Head title="Employee Loans" />

            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false}
                styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApprovalModal loan={modal.loan} action={modal.action} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏦</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Employee Loans</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Monthly installments auto-deducted from payroll</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('hr_loans.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/hr/loans/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ New Loan
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
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Loans</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {loans.data.length > 0 ? `Showing ${loans.from ?? 1}–${loans.to ?? loans.data.length} of ${loans.total ?? loans.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Loan #', 'Employee', 'Principal', 'Monthly', 'Balance', 'Progress', 'Status', 'Actions'].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {loans.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>🏦</Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No loans found</Text>
                        <Text size="sm" style={{ color: textMut }}>Try adjusting your filters or create a new loan</Text>
                    </Box>
                ) : (
                    loans.data.map((loan, i) => {
                        const pct = loan.total_months > 0 ? Math.round((loan.months_paid / loan.total_months) * 100) : 0;
                        const meta = statuses[loan.status] ?? { label: loan.status, color: '#94A3B8' };
                        return (
                            <motion.div key={loan.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, padding: '13px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${meta.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/system/hr/loans/${loan.id}`)}>

                                    {/* Loan # */}
                                    <Box>
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                            <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{loan.loan_number}</Text>
                                        </Box>
                                    </Box>

                                    {/* Employee */}
                                    <Group gap={8} wrap="nowrap">
                                        <PersonAvatar name={loan.employee?.name} size={30} />
                                        <Stack gap={1}>
                                            <Text fw={600} size="sm" style={{ color: textPri }}>{loan.employee?.name}</Text>
                                            <Text size="xs" style={{ color: textMut }}>{loan.purpose ?? '—'}</Text>
                                        </Stack>
                                    </Group>

                                    {/* Principal */}
                                    <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>TZS {fmt(loan.principal)}</Text>

                                    {/* Monthly */}
                                    <Text size="sm" style={{ color: textSec }}>TZS {fmt(loan.monthly_installment)}<Text component="span" size="xs" style={{ color: textMut }}>/mo</Text></Text>

                                    {/* Balance */}
                                    <Text size="sm" fw={800} style={{ color: Number(loan.balance_remaining) > 0 ? '#EF4444' : '#22C55E' }}>
                                        TZS {fmt(loan.balance_remaining)}
                                    </Text>

                                    {/* Progress */}
                                    <Stack gap={4}>
                                        <Text size="xs" style={{ color: textSec }}>{loan.months_paid}/{loan.total_months} ({pct}%)</Text>
                                        <Box style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', borderRadius: 3, width: 80 }}>
                                            <Box style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#22C55E' : 'linear-gradient(90deg, #EA580C, #F97316)', borderRadius: 3 }} />
                                        </Box>
                                    </Stack>

                                    {/* Status */}
                                    <StatusPill status={loan.status} statuses={statuses} />

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        <Tooltip label="View" position="top" withArrow>
                                            <ActionIcon component={Link} href={`/system/hr/loans/${loan.id}`} variant="subtle" size={30}
                                                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                <Text size="xs">👁</Text>
                                            </ActionIcon>
                                        </Tooltip>
                                        {can('hr_loans.approve') && loan.status === 'pending' && (
                                            <>
                                                <Tooltip label="Approve" position="top" withArrow>
                                                    <ActionIcon variant="subtle" size={30} onClick={() => setModal({ loan, action: 'approve' })}
                                                        style={{ background: isDark ? 'rgba(34,197,94,0.1)' : '#F0FDF4', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#22C55E' }}>
                                                        <Text size="xs">✅</Text>
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Reject" position="top" withArrow>
                                                    <ActionIcon variant="subtle" size={30} onClick={() => setModal({ loan, action: 'reject' })}
                                                        style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}>
                                                        <Text size="xs">❌</Text>
                                                    </ActionIcon>
                                                </Tooltip>
                                            </>
                                        )}
                                        {can('hr_loans.delete') && (loan.status === 'pending' || loan.status === 'rejected') && (
                                            <Tooltip label="Delete" position="top" withArrow>
                                                <ActionIcon variant="subtle" size={30} onClick={() => handleDelete(loan.id)}
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
                {loans.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{loans.total ?? loans.data.length} total loan{(loans.total ?? loans.data.length) !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {loans.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination total={loans.last_page} value={loans.current_page} onChange={p => router.get('/system/hr/loans', { ...filters, page: p })} size="sm" styles={{ control: { borderRadius: 8 } }} />
                </Group>
            )}
        </DashboardLayout>
    );
}

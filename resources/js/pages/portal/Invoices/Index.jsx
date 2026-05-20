import PortalLayout from '../../../layouts/PortalLayout';
import { Box, Text, Group, Stack, Select, SimpleGrid, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

const invoiceStatusColor = {
    draft: '#94A3B8', sent: '#2196F3', paid: '#22C55E',
    overdue: '#EF4444', partial: '#F59E0B', cancelled: '#64748B',
};

export default function PortalInvoicesIndex({ client, invoices, summary, filters }) {
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

    const [status, setStatus] = useState(filters.status || '');
    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));

    const applyFilter = (val) => {
        setStatus(val ?? '');
        router.get('/portal/invoices', (val && val !== '') ? { status: val } : {}, { preserveState: true, replace: true });
    };

    const statCards = [
        {
            icon: '📊', label: 'Total Billed', value: `TZS`, valueSub: ` ${fmt(summary.total_billed)}`,
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '✅', label: 'Total Paid', value: `TZS`, valueSub: ` ${fmt(summary.total_paid)}`,
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
        {
            icon: '⚠️', label: 'Balance Due', value: `TZS`, valueSub: ` ${fmt(summary.balance_due)}`,
            grad: 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)',
            glow: '0 8px 28px rgba(245,158,11,0.4)',
        },
    ];

    const statusOptions = [
        { value: '', label: 'All' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'partial', label: 'Partial' },
    ];

    return (
        <PortalLayout title="">
            {/* Page Header Banner */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📄</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">My Invoices</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Billing history &amp; payment status</Text>
                            </Stack>
                        </Group>
                        <Box style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '6px 16px' }}>
                            <Text size="sm" fw={700} c="white">{invoices.total} invoices</Text>
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            {/* Summary Stat Cards */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb={24}>
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
                            <Text fw={900} c="white" style={{ fontSize: '1.4rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>
                                {s.value}
                                {s.valueSub && <Text component="span" fw={500} style={{ fontSize: '0.85rem', opacity: 0.75 }}>{s.valueSub}</Text>}
                            </Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <Select
                        placeholder="All statuses"
                        value={status || null}
                        onChange={applyFilter}
                        clearable
                        data={statusOptions.filter(s => s.value !== '')}
                        w={160}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
                        }}
                    />
                    <Text size="sm" style={{ color: textSec }}>{invoices.total} invoices</Text>
                </Group>
            </Box>

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Invoices</Text>
                        {invoices.data.length > 0 && (
                            <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 12, padding: '1px 8px' }}>
                                <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{invoices.total}</Text>
                            </Box>
                        )}
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {invoices.data.length > 0 ? `${invoices.from ?? 1}–${invoices.to ?? invoices.data.length} of ${invoices.total}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: '160px 120px 160px 140px 120px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Invoice #', 'Date', 'Total', 'Balance Due', 'Status'].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {invoices.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>📄</Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No invoices yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Invoices will appear here</Text>
                    </Box>
                ) : (
                    invoices.data.map((inv, i) => {
                        const sc = invoiceStatusColor[inv.status] || '#94A3B8';
                        return (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: '160px 120px 160px 140px 120px', gap: 0,
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`,
                                        cursor: 'pointer', alignItems: 'center',
                                        transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${sc}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/portal/invoices/${inv.id}`)}
                                >
                                    {/* Invoice # */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px', width: 'fit-content' }}>
                                        <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{inv.document_number}</Text>
                                    </Box>

                                    {/* Date */}
                                    <Text size="xs" fw={600} style={{ color: textPri }}>
                                        {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </Text>

                                    {/* Total */}
                                    <Stack gap={1}>
                                        <Text size="sm" fw={800} style={{ color: textPri, fontVariantNumeric: 'tabular-nums' }}>TZS {fmt(inv.total)}</Text>
                                        <Text size="10px" style={{ color: textMut }}>Total amount</Text>
                                    </Stack>

                                    {/* Balance Due */}
                                    {inv.balance_due > 0 ? (
                                        <Stack gap={1}>
                                            <Text size="sm" fw={700} style={{ color: '#F59E0B' }}>TZS {fmt(inv.balance_due)}</Text>
                                            <Text size="10px" style={{ color: textMut }}>Outstanding</Text>
                                        </Stack>
                                    ) : (
                                        <Text size="sm" style={{ color: '#22C55E', fontWeight: 700 }}>Fully paid</Text>
                                    )}

                                    {/* Status */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sc + '18', border: `1px solid ${sc}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                                        <Box style={{ width: 7, height: 7, borderRadius: '50%', background: sc, boxShadow: `0 0 6px ${sc}`, flexShrink: 0 }} />
                                        <Text size="xs" fw={700} style={{ color: sc, letterSpacing: 0.4, textTransform: 'capitalize' }}>{inv.status}</Text>
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {invoices.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{invoices.total} total invoice{invoices.total !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {invoices.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={invoices.current_page}
                        total={invoices.last_page}
                        onChange={p => router.get('/portal/invoices', { ...(status ? { status } : {}), page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </PortalLayout>
    );
}

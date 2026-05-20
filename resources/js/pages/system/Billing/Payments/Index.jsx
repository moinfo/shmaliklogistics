import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { printPaymentsReport } from '../../../../utils/billingPrint';
import { useCan } from '../../../../lib/can';

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

export default function PaymentsIndex({ payments, stats, methods, stages, filters, company }) {
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

    const [search, setSearch] = useState(filters.search ?? '');
    const [method, setMethod] = useState(filters.method ?? '');
    const can = useCan();

    const applyFilters = (overrides = {}) =>
        router.get('/system/billing/payments', { search, method, ...overrides }, { preserveState: true, replace: true });

    const handleDelete = (id) => {
        if (confirm('Delete this payment? The invoice balance will be updated.')) {
            router.delete(`/system/billing/payments/${id}`, { preserveScroll: true });
        }
    };

    const statCards = [
        {
            icon: '💳', label: 'Total Payments', value: String(stats.total_payments),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '💰', label: 'Total Received', value: 'TZS', valueSub: ` ${fmt(stats.total_received)}`,
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
        {
            icon: '📅', label: 'This Month', value: 'TZS', valueSub: ` ${fmt(stats.this_month)}`,
            grad: 'linear-gradient(135deg, #0369A1 0%, #0284C7 60%, #0EA5E9 100%)',
            glow: '0 8px 28px rgba(14,165,233,0.4)',
        },
        {
            icon: '📆', label: 'This Week', value: 'TZS', valueSub: ` ${fmt(stats.this_week)}`,
            grad: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)',
            glow: '0 8px 28px rgba(139,92,246,0.4)',
        },
    ];

    const cols = '120px 140px 160px 1fr 150px 130px 150px 44px';

    return (
        <DashboardLayout title="Payments">
            <Head title="Payments" />

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
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={4}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💳</Box>
                                <Stack gap={1}>
                                    <Text fw={900} size="lg" c="white">Payments</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>All received payments across invoices</Text>
                                </Stack>
                            </Group>
                        </Stack>
                        <Group gap={10}>
                            <Box component={Link} href="/system/billing/invoices"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                Invoices →
                            </Box>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Box component="button" onClick={() => printPaymentsReport(payments.data, company, filters)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    🖨 Print Report
                                </Box>
                            </motion.div>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: s.valueSub ? '1.4rem' : '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>
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
                    <TextInput
                        placeholder="Search invoice #, client, reference…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        leftSection={<Text size="sm">🔍</Text>}
                        style={{ flex: 1 }}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                        }}
                    />
                    <Select
                        placeholder="All methods"
                        value={method}
                        onChange={v => { setMethod(v ?? ''); applyFilters({ method: v ?? '' }); }}
                        clearable
                        data={Object.entries(methods).map(([k, v]) => ({ value: k, label: v }))}
                        w={200}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
                        }}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters({ search })} size={38} radius={10}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Payments</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {payments.data.length > 0 ? `Showing ${payments.from ?? 1}–${payments.to ?? payments.data.length} of ${payments.total ?? payments.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Date', 'Stage', 'Invoice', 'Client', 'Amount', 'Method', 'Cheque / Ref', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {payments.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0',
                            border: '2px dashed rgba(234,88,12,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.4rem', margin: '0 auto 20px',
                        }}>
                            💳
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No payments recorded yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Payments will appear here once recorded on invoices</Text>
                    </Box>
                ) : (
                    payments.data.map((pay, i) => {
                        const stageMeta = (stages ?? {})[pay.payment_stage];
                        return (
                            <motion.div key={pay.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: cols, gap: 0,
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`,
                                        alignItems: 'center', transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = rowHov;
                                        e.currentTarget.style.borderLeft = '3px solid #22C55E';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderLeft = '3px solid transparent';
                                    }}>

                                    {/* Date */}
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(pay.payment_date)}</Text>

                                    {/* Stage */}
                                    <Box>
                                        {stageMeta ? (
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: stageMeta.color + '18', border: `1px solid ${stageMeta.color}35`, borderRadius: 20, padding: '3px 10px' }}>
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: stageMeta.color, boxShadow: `0 0 5px ${stageMeta.color}`, flexShrink: 0 }} />
                                                <Text size="xs" fw={700} style={{ color: stageMeta.color }}>{stageMeta.label}</Text>
                                            </Box>
                                        ) : <Text size="xs" style={{ color: textMut }}>—</Text>}
                                    </Box>

                                    {/* Invoice */}
                                    <Box>
                                        {pay.invoice && can('billing_payments.view') ? (
                                            <Box component={Link} href={`/system/billing/invoices/${pay.invoice.id}`}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px', textDecoration: 'none' }}>
                                                <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{pay.invoice.document_number}</Text>
                                            </Box>
                                        ) : pay.invoice ? (
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                                <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{pay.invoice.document_number}</Text>
                                            </Box>
                                        ) : <Text size="sm" style={{ color: textMut }}>—</Text>}
                                    </Box>

                                    {/* Client */}
                                    <Stack gap={2}>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{pay.invoice?.client?.name ?? '—'}</Text>
                                        {pay.invoice?.client?.company_name && (
                                            <Text size="xs" style={{ color: textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pay.invoice.client.company_name}</Text>
                                        )}
                                    </Stack>

                                    {/* Amount */}
                                    <Stack gap={1}>
                                        <Text size="sm" fw={800} style={{ color: '#22C55E', fontVariantNumeric: 'tabular-nums' }}>{fmt(pay.amount)}</Text>
                                        <Text size="10px" style={{ color: textMut }}>{pay.invoice?.currency ?? 'TZS'}</Text>
                                    </Stack>

                                    {/* Method */}
                                    <Box>
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', background: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 20, padding: '3px 10px' }}>
                                            <Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{methods[pay.payment_method] ?? pay.payment_method}</Text>
                                        </Box>
                                    </Box>

                                    {/* Cheque / Ref */}
                                    <Box>
                                        {pay.cheque_number ? (
                                            <Stack gap={0}>
                                                <Text size="xs" fw={700} style={{ color: textSec, fontFamily: 'monospace' }}>{pay.cheque_number}</Text>
                                                {pay.cheque_date && <Text size="xs" style={{ color: textMut }}>{fmtDate(pay.cheque_date)}</Text>}
                                            </Stack>
                                        ) : (
                                            <Text size="xs" style={{ color: textSec, fontFamily: 'monospace' }}>{pay.reference_number ?? '—'}</Text>
                                        )}
                                    </Box>

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap">
                                        {can('billing_payments.delete') && (
                                            <Tooltip label="Delete payment" position="top" withArrow>
                                                <ActionIcon variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}
                                                    onClick={() => handleDelete(pay.id)}>
                                                    <Text size="xs">🗑</Text>
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
                {payments.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>
                            {payments.total ?? payments.data.length} total payment{(payments.total ?? payments.data.length) !== 1 ? 's' : ''}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {payments.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={payments.current_page}
                        total={payments.last_page}
                        onChange={p => router.get('/system/billing/payments', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

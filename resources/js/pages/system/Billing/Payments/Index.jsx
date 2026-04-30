import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, Badge, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function PaymentsIndex({ payments, stats, methods, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover   = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [search, setSearch] = useState(filters.search ?? '');
    const [method, setMethod] = useState(filters.method ?? '');

    const applyFilters = (overrides = {}) =>
        router.get('/system/billing/payments', { search, method, ...overrides }, { preserveState: true, replace: true });

    const handleDelete = (id) => {
        if (confirm('Delete this payment? The invoice balance will be updated.')) {
            router.delete(`/system/billing/payments/${id}`, { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout title="Payments">
            <Head title="Payments" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Payments</Text>
                    <Text size="sm" style={{ color: textSec }}>All received payments across invoices</Text>
                </Stack>
                <Box component={Link} href="/system/billing/invoices" style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                    View Invoices →
                </Box>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {[
                    { label: 'Total Payments', value: stats.total_payments, icon: '💳', color: textPri },
                    { label: 'Total Received', value: `TZS ${fmt(stats.total_received)}`, icon: '💰', color: '#22C55E' },
                    { label: 'This Month', value: `TZS ${fmt(stats.this_month)}`, icon: '📅', color: '#60A5FA' },
                    { label: 'This Week', value: `TZS ${fmt(stats.this_week)}`, icon: '📆', color: '#A78BFA' },
                ].map(s => (
                    <Box key={s.label} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px' }}>
                        <Group gap={10}>
                            <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                            <div>
                                <Text size={s.label.includes('TZS') || s.label === 'Total Received' || s.label === 'This Month' || s.label === 'This Week' ? 'sm' : 'xl'} fw={800} style={{ color: s.color, lineHeight: 1.2 }}>{s.value}</Text>
                                <Text size="xs" style={{ color: textSec }}>{s.label}</Text>
                            </div>
                        </Group>
                    </Box>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search invoice #, client, reference…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 } }}
                    />
                    <Select
                        placeholder="All methods"
                        value={method}
                        onChange={v => { setMethod(v ?? ''); applyFilters({ method: v ?? '' }); }}
                        clearable
                        style={{ width: 200 }}
                        data={[
                            { value: '', label: 'All methods' },
                            ...Object.entries(methods).map(([k, v]) => ({ value: k, label: v })),
                        ]}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
                            dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
                        }}
                    />
                    <Box component="button" onClick={() => applyFilters({ search })} style={{ padding: '8px 18px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Search
                    </Box>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Date', 'Invoice', 'Client', 'Amount', 'Method', 'Reference', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: textSec }}>
                                        No payments recorded yet.
                                    </td>
                                </tr>
                            ) : payments.data.map(pay => (
                                <tr
                                    key={pay.id}
                                    style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(pay.payment_date)}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {pay.invoice ? (
                                            <Box
                                                component={Link}
                                                href={`/system/billing/invoices/${pay.invoice.id}`}
                                                style={{ color: '#22C55E', textDecoration: 'none', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}
                                            >
                                                {pay.invoice.document_number}
                                            </Box>
                                        ) : <Text size="sm" style={{ color: textSec }}>—</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{pay.invoice?.client?.name ?? '—'}</Text>
                                        {pay.invoice?.client?.company_name && (
                                            <Text size="xs" style={{ color: textSec }}>{pay.invoice.client.company_name}</Text>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" fw={800} style={{ color: '#22C55E' }}>
                                            {pay.invoice?.currency ?? 'TZS'} {fmt(pay.amount)}
                                        </Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Badge
                                            size="sm"
                                            style={{
                                                background: isDark ? 'rgba(33,150,243,0.12)' : '#EFF6FF',
                                                color: '#3B82F6',
                                                border: '1px solid rgba(33,150,243,0.3)',
                                            }}
                                        >
                                            {methods[pay.payment_method] ?? pay.payment_method}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="xs" style={{ color: textSec, fontFamily: 'monospace' }}>
                                            {pay.reference_number ?? '—'}
                                        </Text>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <ActionIcon
                                            variant="subtle"
                                            size="sm"
                                            style={{ color: '#EF4444' }}
                                            onClick={() => handleDelete(pay.id)}
                                        >
                                            🗑
                                        </ActionIcon>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>

                {payments.last_page > 1 && (
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination
                            total={payments.last_page}
                            value={payments.current_page}
                            onChange={p => router.get('/system/billing/payments', { ...filters, page: p })}
                            size="sm"
                        />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, Button } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PurchaseOrdersIndex({ orders, suppliers, statuses, stats, filters }) {
    const [status, setStatus] = useState(filters.status || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');
    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));

    const apply = (key, val) => {
        const p = { status, supplier_id: supplierId };
        p[key] = val;
        if (key === 'status') setStatus(val);
        if (key === 'supplier_id') setSupplierId(val);
        const params = {};
        if (p.status) params.status = p.status;
        if (p.supplier_id) params.supplier_id = p.supplier_id;
        router.get('/system/procurement/orders', params, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Purchase Orders">
            <Grid mb="xl" gutter="md">
                {[
                    { icon: '📋', label: 'Total POs', value: stats.total, color: '#94A3B8' },
                    { icon: '📝', label: 'Drafts', value: stats.draft, color: '#475569' },
                    { icon: '⏳', label: 'Pending', value: stats.pending, color: '#F59E0B' },
                    { icon: '✅', label: 'Received', value: stats.received, color: '#22C55E' },
                    { icon: '💰', label: 'Spend YTD', value: `TZS ${fmt(stats.spend_ytd)}`, color: '#2196F3' },
                ].map(s => (
                    <Grid.Col key={s.label} span={{ base: 6, sm: 4, lg: 'auto' }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '16px 20px' }}>
                            <Group gap="sm" mb={4}><Text style={{ fontSize: '1.1rem' }}>{s.icon}</Text><Text size="xs" style={{ color: '#64748B' }}>{s.label}</Text></Group>
                            <Text fw={800} size="lg" style={{ color: s.color }}>{s.value}</Text>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>

            <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
                <Group gap="sm">
                    <Select placeholder="All statuses" value={status} onChange={v => apply('status', v || '')}
                        data={[{ value: '', label: 'All' }, ...Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))]}
                        style={{ width: 160 }} styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }} />
                    <Select placeholder="All suppliers" value={supplierId} onChange={v => apply('supplier_id', v || '')}
                        data={[{ value: '', label: 'All Suppliers' }, ...suppliers.map(s => ({ value: String(s.id), label: s.name }))]}
                        style={{ width: 200 }} styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }} />
                </Group>
                <Button component={Link} href="/system/procurement/orders/create" style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}>
                    + New PO
                </Button>
            </Group>

            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '1px solid var(--c-border-strong)' }}>
                                {['PO Number', 'Supplier', 'Order Date', 'Expected', 'Total', 'Status', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map(o => {
                                const st = statuses[o.status] || { label: o.status, color: '#94A3B8' };
                                return (
                                    <tr key={o.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--c-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <Box component={Link} href={`/system/procurement/orders/${o.id}`} style={{ color: '#60A5FA', textDecoration: 'none', fontWeight: 800, fontSize: 14 }}>{o.po_number}</Box>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}><Text fw={600} size="sm" style={{ color: 'var(--c-text)' }}>{o.supplier?.name}</Text></td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#94A3B8' }}>{o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}</Text></td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{o.expected_date ? new Date(o.expected_date).toLocaleDateString() : '—'}</Text></td>
                                        <td style={{ padding: '14px 16px' }}><Text fw={700} size="sm" style={{ color: 'var(--c-text)' }}>TZS {fmt(o.total)}</Text></td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${st.color}22`, border: `1px solid ${st.color}44` }}>
                                                <Text size="xs" fw={700} style={{ color: st.color }}>{st.label}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Box component={Link} href={`/system/procurement/orders/${o.id}`} style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View →</Box>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {orders.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>🛒</Text>
                            <Text fw={600} style={{ color: 'var(--c-text)' }}>No purchase orders yet</Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </DashboardLayout>
    );
}

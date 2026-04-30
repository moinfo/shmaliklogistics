import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Text, Group, Select } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function InventoryMovements({ movements, items, movTypes, filters }) {
    const [itemId, setItemId] = useState(filters.item_id || '');
    const [type, setType] = useState(filters.type || '');

    const apply = (key, val) => {
        const p = { item_id: itemId, type };
        p[key] = val;
        if (key === 'item_id') setItemId(val);
        if (key === 'type') setType(val);
        const params = {};
        if (p.item_id) params.item_id = p.item_id;
        if (p.type) params.type = p.type;
        router.get('/system/inventory/movements', params, { preserveState: true, replace: true });
    };

    const fmt = (n, d = 2) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

    return (
        <DashboardLayout title="Stock Movement Log">
            <Group justify="space-between" mb="lg">
                <Box component={Link} href="/system/inventory" style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 14 }}>← Back to Inventory</Box>
            </Group>

            <Group mb="lg" gap="sm">
                <Select
                    placeholder="All items"
                    value={itemId}
                    onChange={v => apply('item_id', v || '')}
                    data={[{ value: '', label: 'All Items' }, ...items.map(i => ({ value: String(i.id), label: i.name }))]}
                    style={{ width: 220 }}
                    styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                />
                <Select
                    placeholder="All types"
                    value={type}
                    onChange={v => apply('type', v || '')}
                    data={[{ value: '', label: 'All Types' }, ...Object.entries(movTypes).map(([v, t]) => ({ value: v, label: t.label }))]}
                    style={{ width: 160 }}
                    styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                />
                <Text size="sm" style={{ color: '#64748B' }}>{movements.total} records</Text>
            </Group>

            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '1px solid var(--c-border-strong)' }}>
                                {['Date', 'Item', 'Category', 'Type', 'Qty', 'Balance After', 'Reference', 'Vehicle', 'By'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {movements.data.map(m => {
                                const mt = movTypes[m.type] || { label: m.type, color: '#94A3B8' };
                                const qtyColor = m.type === 'in' ? '#22C55E' : m.type === 'out' ? '#EF4444' : '#F59E0B';
                                const qtySign = m.type === 'in' ? '+' : m.type === 'out' ? '−' : '±';
                                return (
                                    <tr key={m.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--c-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px' }}><Text size="xs" style={{ color: '#64748B' }}>{new Date(m.created_at).toLocaleDateString()}</Text></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Box component={Link} href={`/system/inventory/${m.item?.id}`} style={{ color: '#60A5FA', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>{m.item?.name}</Box>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}><Text size="xs" style={{ color: '#64748B' }}>{m.item?.category?.name || '—'}</Text></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${mt.color}22`, border: `1px solid ${mt.color}44` }}>
                                                <Text size="xs" fw={700} style={{ color: mt.color }}>{mt.label}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}><Text fw={700} size="sm" style={{ color: qtyColor }}>{qtySign}{fmt(m.quantity)} {m.item?.unit}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: 'var(--c-text)' }}>{fmt(m.balance_after)}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{m.reference || '—'}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{m.vehicle?.registration_number || '—'}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{m.creator?.name || '—'}</Text></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {movements.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Text size="sm" style={{ color: '#475569' }}>No movements found</Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </DashboardLayout>
    );
}

import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Text, Group, Select, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function InventoryMovements({ movements, items, movTypes, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

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

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        dropdown: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

    return (
        <DashboardLayout title="Stock Movement Log">
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📊</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Stock Movement Log</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{movements.total} records</Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href="/system/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            ← Back to Inventory
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            {/* Filters */}
            <Box mb="lg" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', boxShadow: cardShadow }}>
                <Group gap="sm" wrap="wrap">
                    <Select
                        placeholder="All items"
                        value={itemId}
                        onChange={v => apply('item_id', v || '')}
                        data={[{ value: '', label: 'All Items' }, ...items.map(i => ({ value: String(i.id), label: i.name }))]}
                        style={{ width: 240 }}
                        styles={inputStyles}
                    />
                    <Select
                        placeholder="All types"
                        value={type}
                        onChange={v => apply('type', v || '')}
                        data={[{ value: '', label: 'All Types' }, ...Object.entries(movTypes).map(([v, t]) => ({ value: v, label: t.label }))]}
                        style={{ width: 180 }}
                        styles={inputStyles}
                    />
                </Group>
            </Box>

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                {['Date', 'Item', 'Category', 'Type', 'Qty', 'Balance After', 'Reference', 'Vehicle', 'By'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: textMut, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {movements.data.map(m => {
                                const mt = movTypes[m.type] || { label: m.type, color: '#94A3B8' };
                                const qtyColor = m.type === 'in' ? '#22C55E' : m.type === 'out' ? '#EF4444' : '#F59E0B';
                                const qtySign = m.type === 'in' ? '+' : m.type === 'out' ? '−' : '±';
                                return (
                                    <tr key={m.id} style={{ borderBottom: `1px solid ${divider}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="xs" style={{ color: textSec }}>{new Date(m.created_at).toLocaleDateString()}</Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Box component={Link} href={`/system/inventory/${m.item?.id}`} style={{ color: '#EA580C', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>{m.item?.name}</Box>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="xs" style={{ color: textSec }}>{m.item?.category?.name || '—'}</Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${mt.color}22`, border: `1px solid ${mt.color}44` }}>
                                                <Text size="xs" fw={700} style={{ color: mt.color }}>{mt.label}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text fw={700} size="sm" style={{ color: qtyColor }}>{qtySign}{fmt(m.quantity)} {m.item?.unit}</Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="sm" style={{ color: textPri }}>{fmt(m.balance_after)}</Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="sm" style={{ color: textSec }}>{m.reference || '—'}</Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="sm" style={{ color: textSec }}>{m.vehicle?.plate || '—'}</Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="sm" style={{ color: textSec }}>{m.creator?.name || '—'}</Text>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {movements.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Text size="2rem" style={{ marginBottom: 8 }}>📊</Text>
                            <Text size="sm" style={{ color: textMut }}>No movements found</Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </DashboardLayout>
    );
}

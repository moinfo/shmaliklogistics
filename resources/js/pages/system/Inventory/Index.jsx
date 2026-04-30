import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, Button } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const STAT_META = [
    { key: 'total_items',  icon: '📦', label: 'Total Items',  color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)'  },
    { key: 'low_stock',    icon: '⚠️', label: 'Low Stock',    color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
    { key: 'total_value',  icon: '💰', label: 'Stock Value',  color: '#34D399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)',  fmt: true },
    { key: 'categories',   icon: '🏷️', label: 'Categories',   color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
];

function StockBar({ current, reorder }) {
    if (!reorder || reorder <= 0) return null;
    const pct = Math.min((current / (reorder * 3)) * 100, 100);
    const color = current <= reorder ? '#F87171' : current <= reorder * 1.5 ? '#FBBF24' : '#34D399';
    return (
        <Box style={{ width: 64, height: 4, background: 'rgba(148,163,184,0.15)', borderRadius: 99, overflow: 'hidden', marginTop: 5 }}>
            <Box style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.3s' }} />
        </Box>
    );
}

function StockBadge({ current, reorder }) {
    const isLow  = reorder > 0 && Number(current) <= Number(reorder);
    const isWarn = !isLow && reorder > 0 && Number(current) <= Number(reorder) * 1.5;
    if (isLow)  return <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 8px', borderRadius: 99, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)' }}><Text size="xs" fw={700} style={{ color: '#F87171' }}>Low</Text></Box>;
    if (isWarn) return <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 8px', borderRadius: 99, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }}><Text size="xs" fw={700} style={{ color: '#FBBF24' }}>Watch</Text></Box>;
    return null;
}

export default function InventoryIndex({ items, categories, stats, filters }) {
    const [search, setSearch]   = useState(filters.search || '');
    const [catId,  setCatId]    = useState(filters.category_id || '');
    const [lowStock, setLowStock] = useState(filters.low_stock || '');

    const applyFilters = (overrides = {}) => {
        const p = { search, category_id: catId, ...overrides };
        if (overrides.low_stock !== undefined) setLowStock(overrides.low_stock);
        const params = {};
        if (p.search)      params.search      = p.search;
        if (p.category_id) params.category_id = p.category_id;
        if (p.low_stock)   params.low_stock   = '1';
        router.get('/system/inventory', params, { preserveState: true, replace: true });
    };

    const fmt = (n, d = 0) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

    return (
        <DashboardLayout title="Inventory">

            {/* Stats */}
            <Grid mb="xl" gutter="md">
                {STAT_META.map(s => {
                    const raw = stats[s.key];
                    const val = s.fmt ? `TZS ${fmt(raw)}` : raw ?? 0;
                    return (
                        <Grid.Col key={s.label} span={{ base: 6, sm: 3 }}>
                            <Box style={{
                                background: s.bg,
                                border: `1px solid ${s.border}`,
                                borderLeft: `3px solid ${s.color}`,
                                borderRadius: 12,
                                padding: '18px 20px',
                            }}>
                                <Group gap={8} mb={6}>
                                    <Box style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{s.icon}</Box>
                                    <Text size="xs" fw={600} style={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
                                </Group>
                                <Text fw={800} style={{ fontSize: s.fmt ? '1.35rem' : '2rem', color: s.color, lineHeight: 1.1 }}>{val}</Text>
                            </Box>
                        </Grid.Col>
                    );
                })}
            </Grid>

            {/* Toolbar */}
            <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
                <Group gap="sm" wrap="wrap">
                    <TextInput
                        leftSection={<Text size="sm">🔍</Text>}
                        placeholder="Search items..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        style={{ width: 240 }}
                        styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                    />
                    <Select
                        placeholder="All Categories"
                        value={catId}
                        onChange={v => { setCatId(v || ''); applyFilters({ category_id: v || '' }); }}
                        data={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]}
                        style={{ width: 180 }}
                        styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                    />
                    <Button
                        variant={lowStock ? 'filled' : 'default'}
                        onClick={() => applyFilters({ low_stock: lowStock ? '' : '1' })}
                        size="sm"
                        style={{
                            background: lowStock ? 'rgba(248,113,113,0.15)' : 'transparent',
                            border: `1px solid ${lowStock ? 'rgba(248,113,113,0.5)' : 'rgba(248,113,113,0.3)'}`,
                            color: '#F87171',
                            borderRadius: 8,
                            fontWeight: 600,
                        }}
                    >
                        ⚠️ Low Stock Only
                    </Button>
                </Group>
                <Group gap="sm">
                    <Button
                        component={Link}
                        href="/system/inventory/movements"
                        variant="default"
                        size="sm"
                        style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60A5FA', background: 'transparent', borderRadius: 10 }}
                    >
                        📋 Movement Log
                    </Button>
                    <Button
                        component={Link}
                        href="/system/inventory/create"
                        size="sm"
                        style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}
                    >
                        + Add Item
                    </Button>
                </Group>
            </Group>

            {/* Table */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '2px solid var(--c-border-strong)' }}>
                                {['Item', 'Part #', 'Category', 'Location', 'Stock Level', 'Reorder At', 'Unit Cost', 'Total Value', ''].map(h => (
                                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: '#64748B', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.data.map(item => {
                                const isLow     = item.reorder_level > 0 && Number(item.current_stock) <= Number(item.reorder_level);
                                const stockColor = isLow ? '#F87171' : '#34D399';
                                const totalVal   = item.unit_cost ? Number(item.unit_cost) * Number(item.current_stock) : null;
                                return (
                                    <tr
                                        key={item.id}
                                        style={{ borderBottom: '1px solid var(--c-border-row)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--c-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Item name */}
                                        <td style={{ padding: '13px 16px', minWidth: 160 }}>
                                            <Text fw={700} size="sm" style={{ color: 'var(--c-text)' }}>{item.name}</Text>
                                            {!item.is_active && (
                                                <Box style={{ display: 'inline-block', marginTop: 3, padding: '1px 7px', borderRadius: 99, background: 'rgba(100,116,139,0.15)' }}>
                                                    <Text size="xs" style={{ color: '#64748B' }}>Inactive</Text>
                                                </Box>
                                            )}
                                        </td>

                                        {/* Part # */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <Text size="xs" style={{ color: '#64748B', fontFamily: 'monospace', letterSpacing: 0.4 }}>{item.part_number || '—'}</Text>
                                        </td>

                                        {/* Category chip */}
                                        <td style={{ padding: '13px 16px' }}>
                                            {item.category ? (
                                                <Box style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 8, background: `${item.category.color}18`, border: `1px solid ${item.category.color}33` }}>
                                                    <Text size="xs" fw={700} style={{ color: item.category.color }}>{item.category.name}</Text>
                                                </Box>
                                            ) : <Text size="sm" style={{ color: '#475569' }}>—</Text>}
                                        </td>

                                        {/* Location */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <Text size="sm" style={{ color: '#94A3B8' }}>{item.location || '—'}</Text>
                                        </td>

                                        {/* Stock level: value + badge + mini bar */}
                                        <td style={{ padding: '13px 16px', minWidth: 130 }}>
                                            <Group gap={8} align="center" wrap="nowrap">
                                                <Text fw={700} size="sm" style={{ color: stockColor, whiteSpace: 'nowrap' }}>
                                                    {fmt(item.current_stock, 1)} <Text span size="xs" style={{ color: '#64748B', fontWeight: 400 }}>{item.unit}</Text>
                                                </Text>
                                                <StockBadge current={item.current_stock} reorder={item.reorder_level} />
                                            </Group>
                                            <StockBar current={Number(item.current_stock)} reorder={Number(item.reorder_level)} />
                                        </td>

                                        {/* Reorder level */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <Text size="sm" style={{ color: '#64748B' }}>{fmt(item.reorder_level, 1)} <Text span size="xs" style={{ color: '#475569' }}>{item.unit}</Text></Text>
                                        </td>

                                        {/* Unit cost */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <Text size="sm" style={{ color: '#94A3B8' }}>{item.unit_cost ? `TZS ${fmt(item.unit_cost)}` : '—'}</Text>
                                        </td>

                                        {/* Total value (unit_cost × stock) */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <Text size="sm" fw={600} style={{ color: totalVal ? '#60A5FA' : '#475569' }}>
                                                {totalVal ? `TZS ${fmt(totalVal)}` : '—'}
                                            </Text>
                                        </td>

                                        {/* Action */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <Box
                                                component={Link}
                                                href={`/system/inventory/${item.id}`}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    padding: '5px 12px', borderRadius: 8,
                                                    background: 'rgba(96,165,250,0.08)',
                                                    border: '1px solid rgba(96,165,250,0.25)',
                                                    color: '#60A5FA', textDecoration: 'none',
                                                    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                                                }}
                                            >
                                                View →
                                            </Box>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>

                {/* Empty state */}
                {items.data.length === 0 && (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '3rem', marginBottom: 12 }}>🏗️</Text>
                        <Text fw={700} size="lg" style={{ color: 'var(--c-text)' }}>No inventory items</Text>
                        <Text size="sm" style={{ color: '#475569', marginTop: 6 }}>Add spare parts and consumables to start tracking stock levels</Text>
                        <Box mt="md">
                            <Button component={Link} href="/system/inventory/create" style={{ background: 'linear-gradient(135deg,#1565C0,#2196F3)', border: 'none', borderRadius: 10 }}>
                                + Add First Item
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Pagination */}
                {items.last_page > 1 && (
                    <Group justify="center" gap="xs" py="md" style={{ borderTop: '1px solid var(--c-border-color)' }}>
                        {Array.from({ length: items.last_page }, (_, i) => i + 1).map(p => (
                            <Box
                                key={p}
                                onClick={() => router.get('/system/inventory', { ...filters, page: p }, { preserveState: true })}
                                style={{
                                    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: 13, fontWeight: p === items.current_page ? 700 : 400,
                                    background: p === items.current_page ? 'rgba(96,165,250,0.15)' : 'transparent',
                                    border: p === items.current_page ? '1px solid rgba(96,165,250,0.4)' : '1px solid transparent',
                                    color: p === items.current_page ? '#60A5FA' : '#64748B',
                                }}
                            >
                                {p}
                            </Box>
                        ))}
                    </Group>
                )}
            </Box>
        </DashboardLayout>
    );
}

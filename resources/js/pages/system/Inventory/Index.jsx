import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, Button, Stack, Badge } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function InventoryIndex({ items, categories, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [catId, setCatId] = useState(filters.category_id || '');
    const [lowStock, setLowStock] = useState(filters.low_stock || '');

    const applyFilters = (overrides = {}) => {
        const p = { search, category_id: catId, ...overrides };
        if (overrides.low_stock !== undefined) setLowStock(overrides.low_stock);
        const params = {};
        if (p.search) params.search = p.search;
        if (p.category_id) params.category_id = p.category_id;
        if (p.low_stock) params.low_stock = '1';
        router.get('/system/inventory', params, { preserveState: true, replace: true });
    };

    const fmt = (n, d = 0) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

    return (
        <DashboardLayout title="Inventory">
            {/* Stats */}
            <Grid mb="xl" gutter="md">
                {[
                    { icon: '📦', label: 'Total Items', value: stats.total_items, color: '#94A3B8' },
                    { icon: '⚠️', label: 'Low Stock', value: stats.low_stock, color: '#EF4444' },
                    { icon: '💰', label: 'Stock Value', value: `TZS ${fmt(stats.total_value)}`, color: '#22C55E' },
                    { icon: '🏷️', label: 'Categories', value: stats.categories, color: '#2196F3' },
                ].map(s => (
                    <Grid.Col key={s.label} span={{ base: 6, sm: 3 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '18px 22px' }}>
                            <Group gap="sm" mb={4}><Text style={{ fontSize: '1.2rem' }}>{s.icon}</Text><Text size="sm" style={{ color: '#64748B' }}>{s.label}</Text></Group>
                            <Text fw={800} size="xl" style={{ color: s.color }}>{s.value}</Text>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Toolbar */}
            <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
                <Group gap="sm" wrap="wrap">
                    <TextInput
                        placeholder="Search items..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        style={{ width: 220 }}
                        styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                    />
                    <Select
                        placeholder="All categories"
                        value={catId}
                        onChange={v => { setCatId(v || ''); applyFilters({ category_id: v || '' }); }}
                        data={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]}
                        style={{ width: 180 }}
                        styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                    />
                    <Button
                        variant={lowStock ? 'filled' : 'default'}
                        onClick={() => applyFilters({ low_stock: lowStock ? '' : '1' })}
                        style={{ background: lowStock ? 'rgba(239,68,68,0.15)' : 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: 8 }}
                        size="sm"
                    >
                        ⚠️ Low Stock Only
                    </Button>
                </Group>
                <Group gap="sm">
                    <Button component={Link} href="/system/inventory/movements" variant="default" style={{ borderColor: 'rgba(33,150,243,0.3)', color: '#60A5FA', background: 'transparent', borderRadius: 10 }}>
                        📋 Movement Log
                    </Button>
                    <Button component={Link} href="/system/inventory/create" style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}>
                        + Add Item
                    </Button>
                </Group>
            </Group>

            {/* Table */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '1px solid var(--c-border-strong)' }}>
                                {['Item', 'Part #', 'Category', 'Location', 'Stock', 'Reorder', 'Unit Cost', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.data.map(item => {
                                const isLow = item.reorder_level > 0 && Number(item.current_stock) <= Number(item.reorder_level);
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--c-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text fw={700} size="sm" style={{ color: 'var(--c-text)' }}>{item.name}</Text>
                                            {!item.is_active && <Text size="xs" style={{ color: '#475569' }}>Inactive</Text>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{item.part_number || '—'}</Text></td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {item.category ? (
                                                <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${item.category.color}22`, border: `1px solid ${item.category.color}44` }}>
                                                    <Text size="xs" fw={600} style={{ color: item.category.color }}>{item.category.name}</Text>
                                                </Box>
                                            ) : <Text size="sm" style={{ color: '#475569' }}>—</Text>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{item.location || '—'}</Text></td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text fw={700} size="sm" style={{ color: isLow ? '#EF4444' : '#22C55E' }}>{fmt(item.current_stock, 1)} {item.unit}</Text>
                                            {isLow && <Text size="xs" style={{ color: '#EF4444' }}>⚠️ Low</Text>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{fmt(item.reorder_level, 1)} {item.unit}</Text></td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#94A3B8' }}>{item.unit_cost ? `TZS ${fmt(item.unit_cost)}` : '—'}</Text></td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Box component={Link} href={`/system/inventory/${item.id}`} style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View →</Box>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
                {items.data.length === 0 && (
                    <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>🏗️</Text>
                        <Text fw={600} style={{ color: 'var(--c-text)' }}>No inventory items yet</Text>
                        <Text size="sm" style={{ color: '#475569', marginTop: 6 }}>Add spare parts and consumables to track stock levels</Text>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

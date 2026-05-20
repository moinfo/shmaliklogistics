import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Text, Group, Stack, Select, TextInput, SimpleGrid } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCan } from '../../../lib/can';
import { useMantineColorScheme } from '@mantine/core';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

const STAT_META = [
    { key: 'total_items', icon: '📦', label: 'Total Items',  grad: 'linear-gradient(135deg,#1D4ED8 0%,#2563EB 60%,#3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
    { key: 'low_stock',   icon: '⚠️', label: 'Low Stock',    grad: 'linear-gradient(135deg,#7F1D1D 0%,#991B1B 60%,#EF4444 100%)', glow: '0 8px 28px rgba(239,68,68,0.4)' },
    { key: 'total_value', icon: '💰', label: 'Stock Value',   grad: 'linear-gradient(135deg,#065F46 0%,#047857 60%,#10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)', fmt: true },
    { key: 'categories',  icon: '🏷️', label: 'Categories',   grad: 'linear-gradient(135deg,#5B21B6 0%,#7C3AED 60%,#8B5CF6 100%)', glow: '0 8px 28px rgba(139,92,246,0.4)' },
];

function StockBar({ current, reorder }) {
    if (!reorder || reorder <= 0) return null;
    const pct   = Math.min((current / (reorder * 3)) * 100, 100);
    const color = current <= reorder ? '#EF4444' : current <= reorder * 1.5 ? '#F59E0B' : '#22C55E';
    return (
        <Box style={{ width: 64, height: 4, background: 'rgba(148,163,184,0.15)', borderRadius: 99, overflow: 'hidden', marginTop: 5 }}>
            <Box style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.3s' }} />
        </Box>
    );
}

function StockBadge({ current, reorder }) {
    const isLow  = reorder > 0 && Number(current) <= Number(reorder);
    const isWarn = !isLow && reorder > 0 && Number(current) <= Number(reorder) * 1.5;
    if (isLow)  return <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}><Text size="xs" fw={700} style={{ color: '#EF4444' }}>Low</Text></Box>;
    if (isWarn) return <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}><Text size="xs" fw={700} style={{ color: '#F59E0B' }}>Watch</Text></Box>;
    return null;
}

export default function InventoryIndex({ items, categories, stats, filters }) {
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

    const [search,   setSearch]   = useState(filters.search || '');
    const [catId,    setCatId]    = useState(filters.category_id || '');
    const [lowStock, setLowStock] = useState(filters.low_stock || '');
    const can = useCan();

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

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

    return (
        <DashboardLayout title="Inventory">

            {/* Page Header Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)' : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Inventory</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Spare parts and consumables stock levels</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            <Box component={Link} href="/system/inventory/movements"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                📋 Movement Log
                            </Box>
                            {can('inventory.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/inventory/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        + Add Item
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat Cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {STAT_META.map((s, i) => {
                    const raw = stats[s.key];
                    const val = s.fmt ? `TZS ${fmt(raw)}` : String(raw ?? 0);
                    return (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                            <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                                <CardWave />
                                <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                                <Group justify="space-between" align="flex-start" mb={10}>
                                    <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</Box>
                                </Group>
                                <Text fw={900} c="white" style={{ fontSize: s.fmt ? '1.2rem' : '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{val}</Text>
                                <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                            </Box>
                        </motion.div>
                    );
                })}
            </SimpleGrid>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="sm" wrap="wrap">
                    <TextInput
                        leftSection={<Text size="sm">🔍</Text>}
                        placeholder="Search items..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        style={{ flex: 1, minWidth: 200 }}
                        styles={inputStyles}
                    />
                    <Select
                        placeholder="All Categories"
                        value={catId}
                        onChange={v => { setCatId(v || ''); applyFilters({ category_id: v || '' }); }}
                        data={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]}
                        style={{ width: 180 }}
                        styles={inputStyles}
                    />
                    <Box component="button"
                        onClick={() => applyFilters({ low_stock: lowStock ? '' : '1' })}
                        style={{
                            padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                            background: lowStock ? 'rgba(239,68,68,0.15)' : 'transparent',
                            border: `1px solid ${lowStock ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.3)'}`,
                            color: '#EF4444',
                        }}>
                        ⚠️ Low Stock Only
                    </Box>
                </Group>
            </Box>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />

                    {/* Table toolbar */}
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                            <Text size="sm" fw={700} style={{ color: textPri }}>Inventory Items</Text>
                        </Group>
                        <Text size="xs" style={{ color: textMut }}>
                            {items.data.length > 0 ? `${items.from ?? 1}–${items.to ?? items.data.length} of ${items.total ?? items.data.length}` : '0 results'}
                        </Text>
                    </Box>

                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['Item', 'Part #', 'Category', 'Location', 'Stock Level', 'Reorder At', 'Unit Cost', 'Total Value', ''].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: textMut, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.9, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.map((item, i) => {
                                    const isLow     = item.reorder_level > 0 && Number(item.current_stock) <= Number(item.reorder_level);
                                    const stockColor = isLow ? '#EF4444' : '#22C55E';
                                    const totalVal   = item.unit_cost ? Number(item.unit_cost) * Number(item.current_stock) : null;
                                    return (
                                        <motion.tr key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                            style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = '3px solid #EA580C'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>

                                            <td style={{ padding: '13px 16px', minWidth: 160 }}>
                                                <Text fw={700} size="sm" style={{ color: textPri }}>{item.name}</Text>
                                                {!item.is_active && (
                                                    <Box style={{ display: 'inline-block', marginTop: 3, padding: '1px 7px', borderRadius: 99, background: isDark ? 'rgba(100,116,139,0.15)' : '#F1F5F9' }}>
                                                        <Text size="xs" style={{ color: textMut }}>Inactive</Text>
                                                    </Box>
                                                )}
                                            </td>

                                            <td style={{ padding: '13px 16px' }}>
                                                <Text size="xs" style={{ color: textMut, fontFamily: 'monospace', letterSpacing: 0.4 }}>{item.part_number || '—'}</Text>
                                            </td>

                                            <td style={{ padding: '13px 16px' }}>
                                                {item.category ? (
                                                    <Box style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 8, background: `${item.category.color}18`, border: `1px solid ${item.category.color}33` }}>
                                                        <Text size="xs" fw={700} style={{ color: item.category.color }}>{item.category.name}</Text>
                                                    </Box>
                                                ) : <Text size="sm" style={{ color: textMut }}>—</Text>}
                                            </td>

                                            <td style={{ padding: '13px 16px' }}>
                                                <Text size="sm" style={{ color: textSec }}>{item.location || '—'}</Text>
                                            </td>

                                            <td style={{ padding: '13px 16px', minWidth: 130 }}>
                                                <Group gap={8} align="center" wrap="nowrap">
                                                    <Text fw={700} size="sm" style={{ color: stockColor, whiteSpace: 'nowrap' }}>
                                                        {fmt(item.current_stock, 1)} <Text span size="xs" style={{ color: textMut, fontWeight: 400 }}>{item.unit}</Text>
                                                    </Text>
                                                    <StockBadge current={item.current_stock} reorder={item.reorder_level} />
                                                </Group>
                                                <StockBar current={Number(item.current_stock)} reorder={Number(item.reorder_level)} />
                                            </td>

                                            <td style={{ padding: '13px 16px' }}>
                                                <Text size="sm" style={{ color: textSec }}>{fmt(item.reorder_level, 1)} <Text span size="xs" style={{ color: textMut }}>{item.unit}</Text></Text>
                                            </td>

                                            <td style={{ padding: '13px 16px' }}>
                                                <Text size="sm" style={{ color: textSec }}>{item.unit_cost ? `TZS ${fmt(item.unit_cost)}` : '—'}</Text>
                                            </td>

                                            <td style={{ padding: '13px 16px' }}>
                                                <Text size="sm" fw={600} style={{ color: totalVal ? '#3B82F6' : textMut }}>
                                                    {totalVal ? `TZS ${fmt(totalVal)}` : '—'}
                                                </Text>
                                            </td>

                                            <td style={{ padding: '13px 16px' }}>
                                                {can('inventory.view') && (
                                                    <Box component={Link} href={`/system/inventory/${item.id}`}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', color: '#EA580C', textDecoration: 'none', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                        View →
                                                    </Box>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Box>

                    {/* Empty state */}
                    {items.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                            <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>📦</Box>
                            <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No inventory items</Text>
                            <Text size="sm" style={{ color: textMut }}>Add spare parts and consumables to start tracking stock levels</Text>
                            {can('inventory.create') && (
                                <Box mt="md">
                                    <Box component={Link} href="/system/inventory/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#C2410C,#EA580C)', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(194,65,12,0.35)' }}>
                                        + Add First Item
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Pagination */}
                    {items.last_page > 1 && (
                        <Box style={{ padding: '14px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                            <Group justify="center" gap="xs">
                                {Array.from({ length: items.last_page }, (_, i) => i + 1).map(p => (
                                    <Box key={p} onClick={() => router.get('/system/inventory', { ...filters, page: p }, { preserveState: true })}
                                        style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, fontWeight: p === items.current_page ? 700 : 400, background: p === items.current_page ? 'rgba(234,88,12,0.15)' : 'transparent', border: p === items.current_page ? '1px solid rgba(234,88,12,0.4)' : '1px solid transparent', color: p === items.current_page ? '#EA580C' : textSec }}>
                                        {p}
                                    </Box>
                                ))}
                            </Group>
                        </Box>
                    )}
                </Box>
            </motion.div>
        </DashboardLayout>
    );
}

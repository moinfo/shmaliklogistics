import { Head, usePage, Link } from '@inertiajs/react';
import { Box, Title, Text, SimpleGrid, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = {
    card: '#0F1E32', cardHov: '#132436', border: 'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)',
};

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(n ?? 0));

export default function InventoryDashboard() {
    const { props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const {
        stats = {},
        valueByCategory = [],
        lowStockItems = [],
        topItemsByValue = [],
        recentMovements = [],
    } = props;

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? `1px solid ${dk.border}` : '1px solid #E2E8F0';
    const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)';
    const divider    = isDark ? `1px solid ${dk.divider}` : '1px solid #F1F5F9';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const rowHovBg   = isDark ? dk.cardHov : '#F8FAFC';

    const statCards = [
        {
            icon: '📦', label: 'Total Items',
            value: String(stats.total_items ?? 0),
            sub: 'active inventory items',
            badge: `${stats.movements_30d ?? 0} moves / 30d`, badgeColor: '#3B82F6',
            accent: ['#1565C0', '#2196F3'],
        },
        {
            icon: '💰', label: 'Stock Value',
            value: `TZS ${fmt(stats.total_stock_value)}`,
            sub: 'total value on hand',
            badge: `${stats.categories_count ?? 0} categories`, badgeColor: '#10B981',
            accent: ['#065F46', '#059669'],
        },
        {
            icon: '⚠️', label: 'Low Stock',
            value: String(stats.low_stock_count ?? 0),
            sub: 'at or below reorder level',
            badge: (stats.low_stock_count ?? 0) > 0 ? 'Reorder' : 'OK',
            badgeColor: (stats.low_stock_count ?? 0) > 0 ? '#F59E0B' : '#10B981',
            accent: ['#92400E', '#F59E0B'],
        },
        {
            icon: '🚫', label: 'Out of Stock',
            value: String(stats.out_of_stock_count ?? 0),
            sub: 'items at zero balance',
            badge: (stats.out_of_stock_count ?? 0) > 0 ? 'Act now' : 'OK',
            badgeColor: (stats.out_of_stock_count ?? 0) > 0 ? '#EF4444' : '#10B981',
            accent: ['#7F1D1D', '#DC2626'],
        },
        {
            icon: '🗂️', label: 'Categories',
            value: String(stats.categories_count ?? 0),
            sub: 'inventory categories',
            badge: `${stats.total_items ?? 0} items`, badgeColor: '#8B5CF6',
            accent: ['#5B21B6', '#8B5CF6'],
        },
    ];

    const totalCatValue = valueByCategory.reduce((s, c) => s + Number(c.stock_value), 0);

    return (
        <DashboardLayout title="Inventory Dashboard">
            <Head title="Inventory Dashboard" />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Group justify="space-between" align="flex-end" mb={28} wrap="wrap" gap="md">
                    <Stack gap={3}>
                        <Text size="xs" fw={500} style={{ color: textMut, letterSpacing: 0.3 }}>INVENTORY</Text>
                        <Title order={2} style={{ color: textPri, fontWeight: 800, lineHeight: 1.2 }}>
                            Inventory{' '}
                            <Text component="span" style={{ background: 'linear-gradient(135deg, #1565C0, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                Overview
                            </Text>
                        </Title>
                        <Text size="sm" style={{ color: textSec }}>Stock value, alerts, and recent movements at a glance.</Text>
                    </Stack>
                    <Box component={Link} href="/system/inventory" style={{ textDecoration: 'none', color: '#60A5FA', fontSize: 14, fontWeight: 600 }}>
                        View all items →
                    </Box>
                </Group>
            </motion.div>

            {/* KPI cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="lg" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, position: 'relative' }}>
                            <Box style={{ height: 3, background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` }} />
                            {isDark && <Box style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${s.accent[1]}22 0%, transparent 70%)`, pointerEvents: 'none' }} />}
                            <Box style={{ padding: '20px 22px 22px' }}>
                                <Group justify="space-between" mb={14} align="flex-start">
                                    <Box style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? `${s.accent[0]}30` : `${s.accent[1]}18`, border: isDark ? `1px solid ${s.accent[1]}30` : `1px solid ${s.accent[1]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {s.icon}
                                    </Box>
                                    <Box style={{ background: s.badgeColor + '22', border: `1px solid ${s.badgeColor}44`, borderRadius: 20, padding: '2px 10px' }}>
                                        <Text size="10px" fw={700} style={{ color: s.badgeColor, letterSpacing: 0.3 }}>{s.badge}</Text>
                                    </Box>
                                </Group>
                                <Text fw={900} style={{ fontSize: '1.6rem', lineHeight: 1.1, color: textPri, marginBottom: 4 }}>{s.value}</Text>
                                <Text fw={600} size="sm" style={{ color: isDark ? '#60A5FA' : s.accent[1], marginBottom: 4 }}>{s.label}</Text>
                                <Text size="xs" style={{ color: textMut }}>{s.sub}</Text>
                            </Box>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Stock Value by Category */}
            {valueByCategory.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <Box mb={24} style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>📊</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Stock Value by Category</Text>
                            </Group>
                            <Text size="xs" style={{ color: textMut }}>Total: <strong style={{ color: textPri }}>TZS {fmt(totalCatValue)}</strong></Text>
                        </Group>
                        <Box style={{ padding: '16px 22px' }}>
                            <Stack gap={10}>
                                {valueByCategory.slice(0, 8).map((c, i) => {
                                    const pct = totalCatValue > 0 ? Math.round(Number(c.stock_value) / totalCatValue * 100) : 0;
                                    const color = c.color || '#64748B';
                                    return (
                                        <Box key={c.name + i}>
                                            <Group justify="space-between" mb={3}>
                                                <Group gap={8}>
                                                    <Box style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                                                    <Text size="xs" style={{ color: textSec }}>{c.name || 'Uncategorized'}</Text>
                                                    <Text size="10px" style={{ color: textMut }}>· {c.items_count} item{c.items_count === 1 ? '' : 's'}</Text>
                                                </Group>
                                                <Group gap={8}>
                                                    <Text size="xs" fw={700} style={{ color: textPri }}>TZS {fmt(c.stock_value)}</Text>
                                                    <Text size="xs" style={{ color: textMut }}>{pct}%</Text>
                                                </Group>
                                            </Group>
                                            <Box style={{ height: 5, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }}>
                                                <Box style={{ height: 5, borderRadius: 3, width: `${pct}%`, background: color, transition: 'width 0.6s ease' }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Low Stock Alerts + Top Items by Value */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">

                {/* Low Stock Alerts */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>⚠️</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Low Stock Alerts</Text>
                                {lowStockItems.length > 0 && (
                                    <Box style={{ background: '#F59E0B20', border: '1px solid #F59E0B40', borderRadius: 20, padding: '1px 8px' }}>
                                        <Text size="xs" fw={700} style={{ color: '#F59E0B' }}>{lowStockItems.length}</Text>
                                    </Box>
                                )}
                            </Group>
                            <Box component={Link} href="/system/inventory?low_stock=1" style={{ textDecoration: 'none', color: '#60A5FA', fontSize: 13, fontWeight: 600 }}>View all →</Box>
                        </Group>

                        {lowStockItems.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>All stock levels are healthy.</Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {lowStockItems.map((item, i) => {
                                    const isOut = item.current_stock <= 0;
                                    const pillColor = isOut ? '#EF4444' : '#F59E0B';
                                    return (
                                        <Box key={item.id} style={{ padding: '12px 22px', borderBottom: i < lowStockItems.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <Group justify="space-between" wrap="nowrap">
                                                <Box style={{ minWidth: 0 }}>
                                                    <Text size="sm" fw={600} style={{ color: textPri }} truncate>{item.name}</Text>
                                                    <Text size="xs" style={{ color: textSec }}>
                                                        {item.part_number ? `${item.part_number} · ` : ''}{item.category_name || 'Uncategorized'}
                                                    </Text>
                                                </Box>
                                                <Box style={{ background: pillColor + '1A', border: `1px solid ${pillColor}44`, borderRadius: 20, padding: '2px 10px', flexShrink: 0 }}>
                                                    <Text size="11px" fw={700} style={{ color: pillColor }}>{fmt(item.current_stock)} / {fmt(item.reorder_level)} {item.unit}</Text>
                                                </Box>
                                            </Group>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </motion.div>

                {/* Top Items by Value */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>💎</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Top Items by Value</Text>
                            </Group>
                            <Box component={Link} href="/system/inventory" style={{ textDecoration: 'none', color: '#60A5FA', fontSize: 13, fontWeight: 600 }}>View all →</Box>
                        </Group>

                        {topItemsByValue.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>No items yet. <Link href="/system/inventory/create" style={{ color: '#3B82F6' }}>Add one →</Link></Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {topItemsByValue.map((item, i) => (
                                    <Box key={item.id} style={{ padding: '12px 22px', borderBottom: i < topItemsByValue.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Group justify="space-between" wrap="nowrap">
                                            <Box style={{ minWidth: 0 }}>
                                                <Text size="sm" fw={600} style={{ color: textPri }} truncate>{item.name}</Text>
                                                <Text size="xs" style={{ color: textSec }}>
                                                    {fmt(item.current_stock)} {item.unit} · {item.category_name || 'Uncategorized'}
                                                </Text>
                                            </Box>
                                            <Text size="sm" fw={700} style={{ color: isDark ? '#34D399' : '#059669', flexShrink: 0 }}>TZS {fmt(item.stock_value)}</Text>
                                        </Group>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </motion.div>
            </SimpleGrid>

            {/* Recent Movements */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <Box mt="xl" style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                        <Group gap="sm">
                            <Text style={{ fontSize: '1.1rem' }}>🔄</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Recent Movements</Text>
                        </Group>
                        <Box component={Link} href="/system/inventory/movements" style={{ textDecoration: 'none', color: '#60A5FA', fontSize: 13, fontWeight: 600 }}>View all →</Box>
                    </Group>

                    {recentMovements.length === 0 ? (
                        <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                            <Text size="sm" style={{ color: textMut }}>No movements recorded yet.</Text>
                        </Box>
                    ) : (
                        <Stack gap={0}>
                            {recentMovements.map((m, i) => {
                                const c = m.type_color || '#64748B';
                                const sign = m.type === 'in' ? '+' : m.type === 'out' ? '−' : '±';
                                const date = m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                                return (
                                    <Box key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 22px', borderBottom: i < recentMovements.length - 1 ? divider : 'none', transition: 'background 0.12s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Box style={{ background: c + '20', border: `1px solid ${c}40`, borderRadius: 20, padding: '2px 10px', flexShrink: 0, minWidth: 78, textAlign: 'center' }}>
                                            <Text size="10px" fw={700} style={{ color: c, letterSpacing: 0.5, textTransform: 'uppercase' }}>{m.type_label}</Text>
                                        </Box>
                                        <Box style={{ flex: 1, minWidth: 0 }}>
                                            <Text size="sm" fw={600} style={{ color: textPri }} truncate>{m.item_name || 'Unknown item'}</Text>
                                            <Text size="xs" style={{ color: textSec }}>{m.reference || 'No reference'}</Text>
                                        </Box>
                                        <Text size="sm" fw={700} style={{ color: c, flexShrink: 0 }}>{sign}{fmt(m.quantity)}</Text>
                                        <Text size="xs" style={{ color: textMut, flexShrink: 0, minWidth: 92, textAlign: 'right' }}>{date}</Text>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </motion.div>
        </DashboardLayout>
    );
}
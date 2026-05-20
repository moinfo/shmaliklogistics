import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';
import { formatDate } from '../../../lib/date';

function fmt(n) { return Number(n ?? 0).toLocaleString(); }

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

export default function ExpensesIndex({ expenses, stats, categories, filters }) {
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

    const [search, setSearch]     = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const can = useCan();

    const applyFilters = (overrides = {}) => {
        router.get('/system/expenses', { search, category, ...overrides }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this expense?')) return;
        router.delete(`/system/expenses/${id}`, { preserveScroll: true });
    };

    const catData = [{ value: '', label: 'All categories' }, ...Object.entries(categories).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))];

    const statCards = [
        { icon: '📋', label: 'Total Records',    value: String(stats.total_count),
          grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '💰', label: 'Total (TZS)',       value: `TZS ${fmt(stats.total_amount)}`,
          grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
        { icon: '📅', label: 'This Month (TZS)',  value: `TZS ${fmt(stats.this_month)}`,
          grad: 'linear-gradient(135deg, #0369A1 0%, #0284C7 60%, #0EA5E9 100%)', glow: '0 8px 28px rgba(14,165,233,0.4)' },
    ];

    const cols = '110px 140px 1fr 160px 130px 110px 80px';

    return (
        <DashboardLayout title="Expenses">
            <Head title="Expenses" />

            {/* Page header */}
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
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💸</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Expenses</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Track all operational costs</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('expenses.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/expenses/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ Record Expense
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat cards */}
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '1.4rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search description, plate, receipt…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        leftSection={<Text size="sm">🔍</Text>}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 } }}
                    />
                    <Select
                        placeholder="All categories"
                        value={category}
                        onChange={v => { setCategory(v ?? ''); applyFilters({ category: v ?? '' }); }}
                        data={catData}
                        clearable
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
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Expenses</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {expenses.total ?? expenses.data.length} total
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px', gap: 0 }}>
                    {['Date', 'Category', 'Description', 'Vehicle / Trip', 'Amount', 'Receipt', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {expenses.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                            💸
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No expenses found</Text>
                        <Text size="sm" style={{ color: textMut }}>Try adjusting your filters or record a new expense</Text>
                    </Box>
                ) : (
                    expenses.data.map((exp, i) => (
                        <motion.div key={exp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <Box
                                style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = '3px solid #F59E0B'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>

                                {/* Date */}
                                <Text size="xs" fw={600} style={{ color: textPri, whiteSpace: 'nowrap' }}>{formatDate(exp.expense_date)}</Text>

                                {/* Category */}
                                <Text size="sm" style={{ color: textSec }}>
                                    {categories[exp.category]?.icon} {categories[exp.category]?.label ?? exp.category}
                                </Text>

                                {/* Description */}
                                <Text size="sm" style={{ color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description ?? '—'}</Text>

                                {/* Vehicle / Trip */}
                                <Stack gap={2}>
                                    {exp.vehicle_plate && <Text size="xs" style={{ color: textSec }}>🚛 {exp.vehicle_plate}</Text>}
                                    {exp.trip && (
                                        <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 6, padding: '2px 8px', width: 'fit-content' }}>
                                            <Text size="xs" fw={700} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{exp.trip.trip_number}</Text>
                                        </Box>
                                    )}
                                    {!exp.vehicle_plate && !exp.trip && <Text size="xs" style={{ color: textMut }}>—</Text>}
                                </Stack>

                                {/* Amount */}
                                <Box>
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '4px 10px' }}>
                                        <Text size="xs" fw={800} style={{ color: '#F59E0B', whiteSpace: 'nowrap' }}>{exp.currency} {fmt(exp.amount)}</Text>
                                    </Box>
                                </Box>

                                {/* Receipt */}
                                <Text size="xs" style={{ color: textSec }}>{exp.receipt_number ?? '—'}</Text>

                                {/* Actions */}
                                <Group gap={4} wrap="nowrap">
                                    {can('expenses.edit') && (
                                        <Tooltip label="Edit" position="top" withArrow>
                                            <ActionIcon component={Link} href={`/system/expenses/${exp.id}/edit`} variant="subtle" size={30}
                                                style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, color: '#EA580C' }}>
                                                <Text size="xs">✏️</Text>
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    {can('expenses.delete') && (
                                        <Tooltip label="Delete" position="top" withArrow>
                                            <ActionIcon variant="subtle" size={30} onClick={() => handleDelete(exp.id)}
                                                style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}>
                                                <Text size="xs">🗑️</Text>
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Group>
                            </Box>
                        </motion.div>
                    ))
                )}

                {expenses.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{expenses.total ?? expenses.data.length} total expense{(expenses.total ?? expenses.data.length) !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {expenses.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        total={expenses.last_page}
                        value={expenses.current_page}
                        onChange={p => router.get('/system/expenses', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

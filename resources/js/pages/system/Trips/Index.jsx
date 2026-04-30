import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Badge, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = {
    card:    '#0F1E32',
    cardHov: '#132436',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: '#94A3B8',
    textMut: '#475569',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n));
}

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
            <Text size="xs" fw={600} style={{ color: meta.color }}>{meta.label}</Text>
        </Box>
    );
}

export default function TripsIndex({ trips, stats, statuses, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const rowHov     = isDark ? dk.cardHov : '#F8FAFC';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters = (s, st) => {
        router.get('/system/trips', { search: s, status: st }, { preserveState: true, replace: true });
    };

    const statCards = [
        { icon: '🚛', label: 'Total Trips',   value: stats.total,     accent: ['#1565C0', '#2196F3'] },
        { icon: '🔄', label: 'Active',         value: stats.active,    accent: ['#0E4FA0', '#3B82F6'] },
        { icon: '✅', label: 'Completed',      value: stats.completed, accent: ['#065F46', '#059669'] },
        { icon: '💰', label: 'This Month',     value: `TZS ${fmt(stats.month_revenue)}`, accent: ['#4C1D95', '#7C3AED'] },
    ];

    return (
        <DashboardLayout title="Trips">
            <Head title="Trips" />

            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Trip Management</Text>
                    <Text size="sm" style={{ color: textSec }}>All cargo trips — create, track and close</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component={Link}
                        href="/system/trips/create"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                            color: '#fff', fontWeight: 700, fontSize: 14,
                            padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(33,150,243,0.35)',
                        }}
                    >
                        <Text size="sm">＋</Text> New Trip
                    </Box>
                </motion.div>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` }} />
                            <Text style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</Text>
                            <Text fw={800} size="lg" style={{ color: textPri }}>{s.value}</Text>
                            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search trip, route, driver, plate…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(search, status)}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters(search, v ?? ''); }}
                        clearable
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        w={180}
                    />
                    <Tooltip label="Search">
                        <ActionIcon
                            onClick={() => applyFilters(search, status)}
                            style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', borderRadius: 8 }}
                            size={36}
                        >
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 160px 120px 140px 120px 60px', gap: 0, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Trip #', 'Route', 'Driver / Vehicle', 'Departure', 'Status', 'Freight (TZS)', ''].map(h => (
                        <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {trips.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚛</Text>
                        <Text fw={600} style={{ color: textPri }}>No trips yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Create the first trip to get started</Text>
                    </Box>
                ) : (
                    trips.data.map((trip, i) => {
                        const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
                        return (
                            <motion.div key={trip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: '120px 1fr 160px 120px 140px 120px 60px', gap: 0, padding: '14px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    onClick={() => router.visit(`/system/trips/${trip.id}`)}
                                >
                                    <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{trip.trip_number}</Text>
                                    <Stack gap={1}>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{trip.route_from} → {trip.route_to}</Text>
                                        <Text size="xs" style={{ color: textMut }}>{trip.cargo_description || '—'}</Text>
                                    </Stack>
                                    <Stack gap={1}>
                                        <Text size="sm" style={{ color: textSec }}>{trip.driver_name}</Text>
                                        <Text size="xs" style={{ color: textMut }}>{trip.vehicle_plate}</Text>
                                    </Stack>
                                    <Text size="sm" style={{ color: textSec }}>{trip.departure_date}</Text>
                                    <StatusPill status={trip.status} statuses={statuses} />
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{fmt(trip.freight_amount)}</Text>
                                    <Group gap={4} onClick={e => e.stopPropagation()}>
                                        <Tooltip label="Edit">
                                            <ActionIcon component={Link} href={`/system/trips/${trip.id}/edit`} variant="subtle" size="sm" style={{ color: textMut }}>✏️</ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Box>
                            </motion.div>
                        );
                    })
                )}
            </Box>

            {/* Pagination */}
            {trips.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={trips.current_page}
                        total={trips.last_page}
                        onChange={p => router.get('/system/trips', { ...filters, page: p })}
                        size="sm"
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

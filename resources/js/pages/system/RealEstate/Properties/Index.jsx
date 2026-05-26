import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

const dk = {
    card:    '#0F1E32',
    cardHov: '#132436',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
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

export default function PropertiesIndex({ properties, stats, types, statuses, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const rowHov     = isDark ? dk.cardHov : '#F8FAFC';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [type, setType]     = useState(filters.type ?? '');
    const can = useCan();

    const applyFilters = (s, st, ty) => {
        router.get('/system/real-estate/properties', { search: s, status: st, type: ty }, { preserveState: true, replace: true });
    };

    const statCards = [
        { icon: '🏠', label: 'Total Properties',  value: stats.total,                       accent: ['#1565C0', '#2196F3'] },
        { icon: '🔑', label: 'Occupied',           value: stats.occupied,                    accent: ['#065F46', '#059669'] },
        { icon: '🔨', label: 'Under Renovation',   value: stats.under_renovation,            accent: ['#4C1D95', '#7C3AED'] },
        { icon: '💰', label: 'Monthly Roll',       value: `TZS ${fmt(stats.monthly_roll)}`,  accent: ['#0E4FA0', '#3B82F6'] },
    ];

    return (
        <DashboardLayout title="Properties">
            <Head title="Properties" />

            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Properties</Text>
                    <Text size="sm" style={{ color: textSec }}>Real estate portfolio — houses, apartments, commercial & land</Text>
                </Stack>
                {can('realestate_properties.create') && (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box
                            component={Link}
                            href="/system/real-estate/properties/create"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                                color: '#fff', fontWeight: 700, fontSize: 14,
                                padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
                                boxShadow: '0 4px 16px rgba(33,150,243,0.35)',
                            }}
                        >
                            <Text size="sm">＋</Text> New Property
                        </Box>
                    </motion.div>
                )}
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
                        placeholder="Search code, name, address, region…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(search, status, type)}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters(search, v ?? '', type); }}
                        clearable
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        w={170}
                    />
                    <Select
                        placeholder="All types"
                        value={type}
                        onChange={v => { setType(v ?? ''); applyFilters(search, status, v ?? ''); }}
                        clearable
                        data={Object.entries(types).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        w={170}
                    />
                    <Tooltip label="Search">
                        <ActionIcon
                            onClick={() => applyFilters(search, status, type)}
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
                <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 130px 150px 1fr 110px 140px', gap: 0, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Code', 'Name', 'Type', 'Status', 'Address / Region', 'Units', 'Monthly Roll'].map(h => (
                        <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {properties.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏠</Text>
                        <Text fw={600} style={{ color: textPri }}>No properties yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Add the first property to get started</Text>
                    </Box>
                ) : (
                    properties.data.map((property, i) => {
                        const typeMeta = types[property.type] ?? { label: property.type };
                        return (
                            <motion.div key={property.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: '120px 1fr 130px 150px 1fr 110px 140px', gap: 0, padding: '14px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', transition: 'background 0.15s', alignItems: 'center' }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    onClick={() => router.visit(`/system/real-estate/properties/${property.id}`)}
                                >
                                    <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{property.code}</Text>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{property.name}</Text>
                                    <Text size="sm" style={{ color: textSec }}>{typeMeta.label}</Text>
                                    <StatusPill status={property.status} statuses={statuses} />
                                    <Stack gap={1}>
                                        <Text size="sm" style={{ color: textSec }}>{property.address || '—'}</Text>
                                        <Text size="xs" style={{ color: textMut }}>{property.region || '—'}</Text>
                                    </Stack>
                                    <Stack gap={1}>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{property.units_count ?? 0} units</Text>
                                        <Text size="xs" style={{ color: '#22C55E' }}>{property.occupied_units_count ?? 0} occupied</Text>
                                    </Stack>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>TZS {fmt(property.monthly_rent_roll)}</Text>
                                </Box>
                            </motion.div>
                        );
                    })
                )}
            </Box>

            {/* Pagination */}
            {properties.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={properties.current_page}
                        total={properties.last_page}
                        onChange={p => router.get('/system/real-estate/properties', { ...filters, page: p })}
                        size="sm"
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

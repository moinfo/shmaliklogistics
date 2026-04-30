import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = {
    card: '#0F1E32', cardHov: '#132436',
    border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569',
};

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
            <Text size="xs" fw={600} style={{ color: meta.color }}>{meta.label}</Text>
        </Box>
    );
}

function LicenceBadge({ expiry, isDark }) {
    if (!expiry) return <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>—</Text>;
    const days = Math.floor((new Date(expiry) - new Date()) / 86400000);
    const color = days < 0 ? '#EF4444' : days <= 30 ? '#F59E0B' : '#22C55E';
    const label = days < 0 ? 'EXPIRED' : days <= 30 ? `${days}d` : new Date(expiry).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: '2-digit' });
    return (
        <Box style={{ display: 'inline-block', background: color + '18', border: `1px solid ${color}40`, borderRadius: 6, padding: '2px 8px' }}>
            <Text size="10px" fw={700} style={{ color }}>{label}</Text>
        </Box>
    );
}

function Avatar({ name, size = 36 }) {
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(33,150,243,0.3)' }}>
            <Text c="white" fw={800} size="xs">{initials}</Text>
        </Box>
    );
}

export default function DriversIndex({ drivers, stats, statuses, filters }) {
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
        router.get('/system/drivers', { search: s, status: st }, { preserveState: true, replace: true });
    };

    const statCards = [
        { icon: '👤', label: 'Total Drivers',    value: stats.total,            accent: ['#1565C0', '#2196F3'] },
        { icon: '✅', label: 'Active / On Trip',  value: stats.active,           accent: ['#065F46', '#059669'] },
        { icon: '🚛', label: 'Currently On Trip', value: stats.on_trip,          accent: ['#0E4FA0', '#3B82F6'] },
        { icon: '⚠️', label: 'Licence Expiring',  value: stats.license_expiring, accent: ['#78350F', '#F59E0B'] },
    ];

    return (
        <DashboardLayout title="Drivers">
            <Head title="Drivers" />

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Drivers</Text>
                    <Text size="sm" style={{ color: textSec }}>Register and manage your driver roster</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component={Link} href="/system/drivers/create"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}
                    >
                        <Text size="sm">＋</Text> Add Driver
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
                        placeholder="Search name, phone, licence…"
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
                        <ActionIcon onClick={() => applyFilters(search, status)} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', borderRadius: 8 }} size={36}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 120px 130px 130px 60px', borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['', 'Name', 'Phone', 'Licence #', 'Licence Exp.', 'Status', ''].map((h, i) => (
                        <Text key={i} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {drivers.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>👤</Text>
                        <Text fw={600} style={{ color: textPri }}>No drivers registered</Text>
                        <Text size="sm" style={{ color: textMut }}>Add the first driver to get started</Text>
                    </Box>
                ) : (
                    drivers.data.map((d, i) => (
                        <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                            <Box
                                style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 120px 130px 130px 60px', padding: '12px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                onClick={() => router.visit(`/system/drivers/${d.id}`)}
                            >
                                <Box style={{ display: 'flex', alignItems: 'center' }}><Avatar name={d.name} size={30} /></Box>
                                <Stack gap={1}>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{d.name}</Text>
                                    <Text size="xs" style={{ color: textMut }}>{d.email || d.address || '—'}</Text>
                                </Stack>
                                <Text size="sm" style={{ color: textSec }}>{d.phone}</Text>
                                <Text size="sm" style={{ color: textSec }}>{d.license_number || '—'}</Text>
                                <LicenceBadge expiry={d.license_expiry} isDark={isDark} />
                                <StatusPill status={d.status} statuses={statuses} />
                                <Group gap={4} onClick={e => e.stopPropagation()}>
                                    <Tooltip label="Edit">
                                        <ActionIcon component={Link} href={`/system/drivers/${d.id}/edit`} variant="subtle" size="sm" style={{ color: textMut }}>✏️</ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Box>
                        </motion.div>
                    ))
                )}
            </Box>

            {drivers.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={drivers.current_page} total={drivers.last_page} onChange={p => router.get('/system/drivers', { ...filters, page: p })} size="sm" />
                </Group>
            )}
        </DashboardLayout>
    );
}

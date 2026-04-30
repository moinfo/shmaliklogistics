import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, Badge, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function PermitsIndex({ permits, stats, statuses, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover   = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters = (overrides = {}) => {
        router.get('/system/permits', { search, status, ...overrides }, { preserveState: true, replace: true });
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <DashboardLayout title="Permits">
            <Head title="Permits" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Border & Transit Permits</Text>
                    <Text size="sm" style={{ color: textSec }}>Track all permits for your fleet</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/permits/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        + New Permit
                    </Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {[
                    { label: 'Total', value: stats.total, icon: '🛂', color: undefined },
                    { label: 'Active', value: stats.active, icon: '✅', color: '#22C55E' },
                    { label: 'Expired', value: stats.expired, icon: '❌', color: '#EF4444' },
                    { label: 'Expiring (14d)', value: stats.expiring_soon, icon: '⚠️', color: '#F59E0B' },
                ].map(s => (
                    <Box key={s.label} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px' }}>
                        <Group gap={10}>
                            <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                            <div>
                                <Text size="xl" fw={800} style={{ color: s.color ?? textPri, lineHeight: 1 }}>{s.value}</Text>
                                <Text size="xs" style={{ color: textSec }}>{s.label}</Text>
                            </div>
                        </Group>
                    </Box>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput placeholder="Search plate, permit #, country…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters({ search })} style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 } }} />
                    <Select placeholder="All statuses" value={status} onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }} clearable style={{ width: 160 }}
                        data={[{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))]}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} />
                    <Box component="button" onClick={() => applyFilters({ search })} style={{ padding: '8px 18px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Search</Box>
                </Group>
            </Box>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Permit', 'Vehicle', 'Trip', 'Validity', 'Cost', 'Status', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permits.data.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: textSec }}>No permits found.</td></tr>
                            ) : permits.data.map(p => (
                                <tr key={p.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text fw={700} size="sm" style={{ color: textPri }}>{p.permit_type}</Text>
                                        {p.permit_number && <Text size="xs" style={{ color: textSec, fontFamily: 'monospace' }}>{p.permit_number}</Text>}
                                        {p.issuing_country && <Text size="xs" style={{ color: isDark ? '#475569' : '#94A3B8' }}>{p.issuing_country}</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" fw={600} style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{p.vehicle_plate}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {p.trip ? (
                                            <Box component={Link} href={`/system/trips/${p.trip.id}`} style={{ color: '#3B82F6', textDecoration: 'none', fontSize: 13 }}>{p.trip.trip_number}</Box>
                                        ) : <Text size="xs" style={{ color: isDark ? '#475569' : '#94A3B8' }}>—</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="xs" style={{ color: textSec }}>{formatDate(p.issue_date)} →</Text>
                                        <Text size="xs" fw={600} style={{ color: p.days_until_expiry !== null && p.days_until_expiry <= 14 ? '#F59E0B' : textPri }}>{formatDate(p.expiry_date)}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: textSec }}>{p.currency} {new Intl.NumberFormat().format(p.cost)}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Badge size="sm" style={{ background: statuses[p.status]?.color + '22', color: statuses[p.status]?.color, border: `1px solid ${statuses[p.status]?.color}44` }}>
                                            {statuses[p.status]?.label}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon component={Link} href={`/system/permits/${p.id}`} variant="subtle" size="sm" style={{ color: '#3B82F6' }}>👁</ActionIcon>
                                            <ActionIcon component={Link} href={`/system/permits/${p.id}/edit`} variant="subtle" size="sm" style={{ color: textSec }}>✏️</ActionIcon>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {permits.last_page > 1 && (
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={permits.last_page} value={permits.current_page} onChange={p => router.get('/system/permits', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

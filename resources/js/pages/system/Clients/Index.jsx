import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, Badge, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

function StatCard({ label, value, icon, color, isDark }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '16px 20px' }}>
            <Group gap={10}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
                <div>
                    <Text size="xl" fw={800} style={{ color: color ?? (isDark ? dk.textPri : '#1E293B'), lineHeight: 1 }}>{value}</Text>
                    <Text size="xs" style={{ color: isDark ? dk.textSec : '#64748B' }}>{label}</Text>
                </div>
            </Group>
        </Box>
    );
}

export default function ClientsIndex({ clients, stats, statuses, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [search, setSearch]   = useState(filters.search ?? '');
    const [status, setStatus]   = useState(filters.status ?? '');

    const applyFilters = (overrides = {}) => {
        router.get('/system/clients', { search, status, ...overrides }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Clients">
            <Head title="Clients" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Clients</Text>
                    <Text size="sm" style={{ color: textSec }}>Manage your customer base</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/clients/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        + New Client
                    </Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md" mb="xl">
                <StatCard label="Total Clients" value={stats.total} icon="👥" isDark={isDark} />
                <StatCard label="Active" value={stats.active} icon="✅" color="#22C55E" isDark={isDark} />
                <StatCard label="Inactive" value={stats.inactive} icon="⏸️" color="#94A3B8" isDark={isDark} />
            </SimpleGrid>

            {/* Filters */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search name, company, email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }}
                        data={[{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))]}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        style={{ width: 160 }}
                        clearable
                    />
                    <Box component="button" onClick={() => applyFilters({ search })} style={{ padding: '8px 18px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Search
                    </Box>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Client', 'Contact', 'TIN / VRN', 'Status', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {clients.data.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No clients found.</td></tr>
                            ) : clients.data.map(client => (
                                <tr key={client.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text fw={700} size="sm" style={{ color: textPri }}>{client.name}</Text>
                                        {client.company_name && <Text size="xs" style={{ color: textSec }}>{client.company_name}</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: textSec }}>{client.phone ?? '—'}</Text>
                                        {client.email && <Text size="xs" style={{ color: isDark ? '#475569' : '#94A3B8' }}>{client.email}</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {client.tin_number && <Text size="xs" style={{ color: textSec }}>TIN: {client.tin_number}</Text>}
                                        {client.vrn_number && <Text size="xs" style={{ color: textSec }}>VRN: {client.vrn_number}</Text>}
                                        {!client.tin_number && !client.vrn_number && <Text size="xs" style={{ color: isDark ? '#475569' : '#94A3B8' }}>—</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Badge size="sm" style={{ background: statuses[client.status]?.color + '22', color: statuses[client.status]?.color, border: `1px solid ${statuses[client.status]?.color}44` }}>
                                            {statuses[client.status]?.label}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon component={Link} href={`/system/clients/${client.id}`} variant="subtle" size="sm" style={{ color: '#3B82F6' }}>👁</ActionIcon>
                                            <ActionIcon component={Link} href={`/system/clients/${client.id}/edit`} variant="subtle" size="sm" style={{ color: textSec }}>✏️</ActionIcon>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>

                {clients.last_page > 1 && (
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={clients.last_page} value={clients.current_page} onChange={p => router.get('/system/clients', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

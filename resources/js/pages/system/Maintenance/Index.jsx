import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, Badge, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

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

function fmt(n) { return Number(n ?? 0).toLocaleString(); }

export default function MaintenanceIndex({ records, stats, vehicles, types, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [search, setSearch]       = useState(filters.search ?? '');
    const [vehicleId, setVehicleId] = useState(filters.vehicle_id ?? '');

    const applyFilters = (overrides = {}) => {
        router.get('/system/maintenance', { search, vehicle_id: vehicleId, ...overrides }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this service record?')) return;
        router.delete(`/system/maintenance/${id}`, { preserveScroll: true });
    };

    const vehicleOptions = [{ value: '', label: 'All vehicles' }, ...vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }))];

    return (
        <DashboardLayout title="Maintenance">
            <Head title="Maintenance" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Maintenance</Text>
                    <Text size="sm" style={{ color: textSec }}>Service records and scheduling</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/maintenance/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        + Add Service Record
                    </Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <StatCard label="Total Records" value={stats.total_records} icon="🔧" isDark={isDark} />
                <StatCard label="Total Cost (TZS)" value={`TZS ${fmt(stats.total_cost_tzs)}`} icon="💰" color="#F59E0B" isDark={isDark} />
                <StatCard label="This Month (TZS)" value={`TZS ${fmt(stats.this_month)}`} icon="📅" color="#3B82F6" isDark={isDark} />
                <StatCard label="Due Soon (≤14d)" value={stats.due_soon} icon="⚠️" color={stats.due_soon > 0 ? '#EF4444' : '#22C55E'} isDark={isDark} />
            </SimpleGrid>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search type, workshop, plate…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 } }}
                    />
                    <Select
                        placeholder="All vehicles"
                        value={vehicleId}
                        onChange={v => { setVehicleId(v ?? ''); applyFilters({ vehicle_id: v ?? '' }); }}
                        data={vehicleOptions}
                        searchable
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        style={{ width: 220 }}
                        clearable
                    />
                    <Box component="button" onClick={() => applyFilters({ search })} style={{ padding: '8px 18px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Search
                    </Box>
                </Group>
            </Box>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Vehicle', 'Service Type', 'Date', 'Workshop', 'Cost', 'Next Service', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.data.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No service records found.</td></tr>
                            ) : records.data.map(rec => (
                                <tr key={rec.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text fw={700} size="sm" style={{ color: textPri }}>{rec.vehicle?.plate ?? '—'}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{rec.vehicle?.make} {rec.vehicle?.model_name}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: textPri }}>{rec.service_type}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{rec.service_date}</Text>
                                        {rec.mileage_km && <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>{Number(rec.mileage_km).toLocaleString()} km</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: textSec }}>{rec.workshop_name ?? '—'}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {rec.cost ? <Text fw={700} size="sm" style={{ color: '#F59E0B', whiteSpace: 'nowrap' }}>{rec.currency} {fmt(rec.cost)}</Text> : <Text size="sm" style={{ color: textSec }}>—</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {rec.next_service_date ? (
                                            <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{rec.next_service_date}</Text>
                                        ) : <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>—</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon component={Link} href={`/system/maintenance/${rec.id}`} variant="subtle" size="sm" style={{ color: '#3B82F6' }}>👁</ActionIcon>
                                            <ActionIcon component={Link} href={`/system/maintenance/${rec.id}/edit`} variant="subtle" size="sm" style={{ color: textSec }}>✏️</ActionIcon>
                                            <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => handleDelete(rec.id)}>🗑️</ActionIcon>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {records.last_page > 1 && (
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={records.last_page} value={records.current_page} onChange={p => router.get('/system/maintenance', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

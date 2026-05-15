import { Box, Text, Group, Stack, SimpleGrid, Select, Pagination } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)' };

function StatCard({ icon, label, value, accent }) {
    return (
        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />
            <Text style={{ fontSize: '1.3rem', marginBottom: 4 }}>{icon}</Text>
            <Text fw={900} size="lg" style={{ color: 'var(--c-text)' }}>{value}</Text>
            <Text size="xs" style={{ color: 'var(--c-text-muted)', marginTop: 2 }}>{label}</Text>
        </Box>
    );
}

export default function AdminInspectionsIndex({ inspections, stats, vehicles, drivers, statuses, types, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const apply = (key, val) => {
        router.get('/system/inspections', { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: '1px solid var(--c-border-color)', color: 'var(--c-text)' },
    };

    return (
        <DashboardLayout title="Vehicle Inspections">
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>Vehicle Inspections</Text>
                <Text size="sm" style={{ color: 'var(--c-text-secondary)' }}>Driver-submitted pre-trip & on-route inspection reports</Text>
            </Stack>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <StatCard icon="📋" label="Total"          value={stats.total}    accent={['#0E4FA0', '#3B82F6']} />
                <StatCard icon="📅" label="Today"          value={stats.today}    accent={['#5B21B6', '#A78BFA']} />
                <StatCard icon="⚠️" label="Minor Issues"   value={stats.issues}   accent={['#78350F', '#F59E0B']} />
                <StatCard icon="🚨" label="Critical"       value={stats.critical} accent={['#7F1D1D', '#EF4444']} />
            </SimpleGrid>

            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
                <Group gap="md" wrap="wrap">
                    <Select placeholder="All vehicles" clearable value={filters.vehicle_id ?? null} onChange={v => apply('vehicle_id', v)}
                        data={vehicles.map(v => ({ value: String(v.id), label: v.plate }))}
                        styles={inputStyles} w={180} />
                    <Select placeholder="All drivers" clearable value={filters.driver_id ?? null} onChange={v => apply('driver_id', v)}
                        data={drivers.map(d => ({ value: String(d.id), label: d.name }))}
                        styles={inputStyles} w={200} />
                    <Select placeholder="Any status" clearable value={filters.status ?? null} onChange={v => apply('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={inputStyles} w={160} />
                    <Select placeholder="Any type" clearable value={filters.type ?? null} onChange={v => apply('type', v)}
                        data={Object.entries(types).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={inputStyles} w={160} />
                </Group>
            </Box>

            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ display: 'grid', gridTemplateColumns: '140px 1fr 160px 130px 130px 80px', padding: '10px 16px', borderBottom: '1px solid var(--c-border-subtle)' }}>
                    {['Inspected', 'Driver / Vehicle', 'Type', 'Status', 'Odometer', ''].map((h, i) => (
                        <Text key={i} size="10px" fw={700} style={{ color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {inspections.data.length === 0 ? (
                    <Box style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>No inspections match these filters</Text>
                    </Box>
                ) : (
                    inspections.data.map((i, idx) => {
                        const s = statuses[i.overall_status] ?? { label: i.overall_status, color: '#94A3B8' };
                        const t = types[i.inspection_type] ?? { label: i.inspection_type, color: '#94A3B8' };
                        return (
                            <motion.div key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}>
                                <Box
                                    component={Link}
                                    href={`/system/inspections/${i.id}`}
                                    style={{ display: 'grid', gridTemplateColumns: '140px 1fr 160px 130px 130px 80px', padding: '12px 16px', borderBottom: '1px solid var(--c-border-subtle)', textDecoration: 'none', alignItems: 'center' }}
                                >
                                    <Text size="xs" style={{ color: 'var(--c-text-secondary)' }}>{new Date(i.inspected_at).toLocaleString()}</Text>
                                    <Stack gap={2}>
                                        <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{i.driver?.name ?? '—'}</Text>
                                        <Text size="xs" style={{ color: 'var(--c-text-muted)' }}>{i.vehicle?.plate ?? '—'}</Text>
                                    </Stack>
                                    <Box style={{ display: 'inline-block', background: t.color + '22', border: `1px solid ${t.color}55`, borderRadius: 14, padding: '2px 10px', maxWidth: 'fit-content' }}>
                                        <Text size="10px" fw={700} style={{ color: t.color }}>{t.label}</Text>
                                    </Box>
                                    <Box style={{ display: 'inline-block', background: s.color + '22', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '2px 10px', maxWidth: 'fit-content' }}>
                                        <Text size="10px" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                    </Box>
                                    <Text size="xs" style={{ color: 'var(--c-text-secondary)' }}>{i.odometer_km ? `${Number(i.odometer_km).toLocaleString()} km` : '—'}</Text>
                                    <Text size="xs" style={{ color: '#60A5FA', textAlign: 'right' }}>View →</Text>
                                </Box>
                            </motion.div>
                        );
                    })
                )}
            </Box>

            {inspections.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={inspections.current_page} total={inspections.last_page} onChange={p => router.get('/system/inspections', { ...filters, page: p })} size="sm" />
                </Group>
            )}
        </DashboardLayout>
    );
}

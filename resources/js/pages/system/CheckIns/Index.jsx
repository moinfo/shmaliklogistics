import { Box, Text, Group, Stack, SimpleGrid, Select, Pagination } from '@mantine/core';
import { router } from '@inertiajs/react';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';

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

export default function AdminCheckInsIndex({ checkIns, stats, drivers, statuses, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const apply = (key, val) => {
        router.get('/system/check-ins', { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: '1px solid var(--c-border-color)', color: 'var(--c-text)' },
    };

    return (
        <DashboardLayout title="Driver Check-Ins">
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>Driver Check-Ins</Text>
                <Text size="sm" style={{ color: 'var(--c-text-secondary)' }}>3-hour interval status reports from drivers on active trips</Text>
            </Stack>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <StatCard icon="📍" label="Total"     value={stats.total}     accent={['#0E4FA0', '#3B82F6']} />
                <StatCard icon="📅" label="Today"     value={stats.today}     accent={['#5B21B6', '#A78BFA']} />
                <StatCard icon="⚠️" label="Issues"    value={stats.issues}    accent={['#78350F', '#F59E0B']} />
                <StatCard icon="🚨" label="Emergency" value={stats.emergency} accent={['#7F1D1D', '#EF4444']} />
            </SimpleGrid>

            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
                <Group gap="md" wrap="wrap">
                    <Select placeholder="All drivers" clearable value={filters.driver_id ?? null} onChange={v => apply('driver_id', v)}
                        data={drivers.map(d => ({ value: String(d.id), label: d.name }))}
                        styles={inputStyles} w={220} />
                    <Select placeholder="Any status" clearable value={filters.status ?? null} onChange={v => apply('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={inputStyles} w={160} />
                </Group>
            </Box>

            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ display: 'grid', gridTemplateColumns: '170px 1fr 120px 130px 140px 1fr', padding: '10px 16px', borderBottom: '1px solid var(--c-border-subtle)' }}>
                    {['Checked in', 'Driver / Trip', 'Status', 'Vehicle', 'Location', 'Notes'].map((h, i) => (
                        <Text key={i} size="10px" fw={700} style={{ color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {checkIns.data.length === 0 ? (
                    <Box style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>No check-ins yet</Text>
                    </Box>
                ) : (
                    checkIns.data.map(c => {
                        const s = statuses[c.status] ?? { label: c.status, color: '#94A3B8' };
                        return (
                            <Box key={c.id} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 120px 130px 140px 1fr', padding: '12px 16px', borderBottom: '1px solid var(--c-border-subtle)', alignItems: 'center' }}>
                                <Text size="xs" style={{ color: 'var(--c-text-secondary)' }}>{new Date(c.checked_in_at).toLocaleString()}</Text>
                                <Stack gap={2}>
                                    <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{c.driver?.name ?? '—'}</Text>
                                    <Text size="xs" style={{ color: 'var(--c-text-muted)' }}>{c.trip?.trip_number ?? '—'}</Text>
                                </Stack>
                                <Box style={{ display: 'inline-block', background: s.color + '22', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '2px 10px', maxWidth: 'fit-content' }}>
                                    <Text size="10px" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                </Box>
                                <Text size="xs" style={{ color: 'var(--c-text-secondary)' }}>{c.vehicle?.plate ?? '—'}</Text>
                                <Text size="xs" style={{ color: 'var(--c-text-secondary)' }}>
                                    {c.location || (c.lat && c.lng ? `${c.lat}, ${c.lng}` : '—')}
                                </Text>
                                <Text size="xs" style={{ color: 'var(--c-text-muted)', whiteSpace: 'pre-wrap' }}>{c.notes || '—'}</Text>
                            </Box>
                        );
                    })
                )}
            </Box>

            {checkIns.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={checkIns.current_page} total={checkIns.last_page} onChange={p => router.get('/system/check-ins', { ...filters, page: p })} size="sm" />
                </Group>
            )}
        </DashboardLayout>
    );
}

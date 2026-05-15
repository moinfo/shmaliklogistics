import { Box, Text, Group, Stack, Pagination } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import DriverLayout from '../../../layouts/DriverLayout';

const card = { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.15)', borderRadius: 14 };

export default function DriverInspectionsIndex({ inspections, statuses, types }) {
    return (
        <DriverLayout title="My Inspections">
            <Group justify="space-between" mb="lg">
                <Text fw={800} size="xl" c="white">🔧 My Inspections</Text>
                <Box component={Link} href="/driver/inspections/create"
                    style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: 'white', padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                    + Ukaguzi Mpya
                </Box>
            </Group>

            {inspections.data.length === 0 ? (
                <Box style={{ ...card, padding: '60px 20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2.4rem', marginBottom: 12 }}>🔧</Text>
                    <Text c="white" fw={600}>Hakuna ukaguzi bado</Text>
                </Box>
            ) : (
                <Stack gap="sm">
                    {inspections.data.map(i => {
                        const s = statuses[i.overall_status] ?? { label: i.overall_status, color: '#94A3B8' };
                        const t = types[i.inspection_type] ?? { label: i.inspection_type, color: '#94A3B8' };
                        return (
                            <Box key={i.id} style={{ ...card, padding: '14px 18px' }}>
                                <Group justify="space-between" wrap="wrap">
                                    <Box>
                                        <Group gap={8} mb={4}>
                                            <Box style={{ background: t.color + '22', border: `1px solid ${t.color}55`, borderRadius: 14, padding: '2px 10px' }}>
                                                <Text size="10px" fw={700} style={{ color: t.color }}>{t.label}</Text>
                                            </Box>
                                            <Box style={{ background: s.color + '22', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '2px 10px' }}>
                                                <Text size="10px" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                            </Box>
                                        </Group>
                                        <Text size="sm" fw={600} c="white">{i.vehicle?.plate || '—'}</Text>
                                        <Text size="xs" style={{ color: '#94A3B8' }}>{new Date(i.inspected_at).toLocaleString()}</Text>
                                    </Box>
                                    <Box ta="right">
                                        <Text size="xs" style={{ color: '#94A3B8' }}>Odometer</Text>
                                        <Text size="sm" fw={600} c="white">{i.odometer_km ? `${Number(i.odometer_km).toLocaleString()} km` : '—'}</Text>
                                    </Box>
                                </Group>
                            </Box>
                        );
                    })}
                </Stack>
            )}

            {inspections.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={inspections.current_page} total={inspections.last_page} onChange={p => router.get('/driver/inspections', { page: p })} size="sm" />
                </Group>
            )}
        </DriverLayout>
    );
}

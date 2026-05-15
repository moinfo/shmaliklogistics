import { Box, Text, Group, Stack, Pagination } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import DriverLayout from '../../../layouts/DriverLayout';

const card = { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.15)', borderRadius: 14 };

export default function DriverTripsIndex({ trips, tripStatuses }) {
    return (
        <DriverLayout title="My Trips">
            <Text fw={800} size="xl" c="white" mb="lg">My Trips</Text>

            {trips.data.length === 0 ? (
                <Box style={{ ...card, padding: '60px 20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2.4rem', marginBottom: 12 }}>🚛</Text>
                    <Text c="white" fw={600}>No trips yet</Text>
                    <Text size="sm" style={{ color: '#94A3B8' }}>Trips assigned to you will appear here</Text>
                </Box>
            ) : (
                <Stack gap="sm">
                    {trips.data.map(t => {
                        const meta = tripStatuses[t.status] ?? { label: t.status, color: '#94A3B8' };
                        return (
                            <Box
                                key={t.id}
                                component={Link}
                                href={`/driver/trips/${t.id}`}
                                style={{ ...card, padding: '16px 20px', display: 'block', textDecoration: 'none' }}
                            >
                                <Group justify="space-between" wrap="wrap" gap="md">
                                    <Box>
                                        <Group gap={10}>
                                            <Text fw={800} c="white">{t.trip_number}</Text>
                                            <Box style={{ background: meta.color + '22', border: `1px solid ${meta.color}55`, borderRadius: 16, padding: '2px 10px' }}>
                                                <Text size="10px" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                                            </Box>
                                        </Group>
                                        <Group gap={6} mt={6}>
                                            <Text size="sm" fw={600} c="white">{t.route_from}</Text>
                                            <Text style={{ color: '#94A3B8' }}>→</Text>
                                            <Text size="sm" fw={600} c="white">{t.route_to}</Text>
                                        </Group>
                                    </Box>
                                    <Stack gap={4} align="flex-end">
                                        <Text size="xs" style={{ color: '#94A3B8' }}>🚛 {t.vehicle?.plate || t.vehicle_plate || '—'}</Text>
                                        <Text size="xs" style={{ color: '#94A3B8' }}>{t.departure_date ? new Date(t.departure_date).toLocaleDateString() : '—'}</Text>
                                    </Stack>
                                </Group>
                            </Box>
                        );
                    })}
                </Stack>
            )}

            {trips.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={trips.current_page} total={trips.last_page} onChange={p => router.get('/driver/trips', { page: p })} size="sm" />
                </Group>
            )}
        </DriverLayout>
    );
}

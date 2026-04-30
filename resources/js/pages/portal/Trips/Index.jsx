import PortalLayout from '../../../layouts/PortalLayout';
import { Box, Text, Group, Stack, Select } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColor = {
    loading: '#F59E0B', in_transit: '#2196F3', at_border: '#A855F7',
    delivered: '#22C55E', completed: '#22C55E', cancelled: '#EF4444',
    planned: '#94A3B8',
};

export default function PortalTripsIndex({ client, trips, statuses, filters }) {
    const [status, setStatus] = useState(filters.status || '');

    const applyFilter = (val) => {
        setStatus(val);
        router.get('/portal/trips', val ? { status: val } : {}, { preserveState: true, replace: true });
    };

    return (
        <PortalLayout title="My Shipments">
            {/* Filter */}
            <Group mb="lg" gap="md">
                <Select
                    placeholder="All statuses"
                    value={status}
                    onChange={applyFilter}
                    data={[{ value: '', label: 'All Statuses' }, ...Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))]}
                    style={{ width: 180 }}
                    styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                />
                <Text size="sm" style={{ color: '#64748B' }}>{trips.total} trips total</Text>
            </Group>

            <Stack gap="sm">
                {trips.data.map(trip => (
                    <Box
                        key={trip.id}
                        component={Link}
                        href={`/portal/trips/${trip.id}`}
                        style={{
                            display: 'block', padding: '18px 20px', borderRadius: 12,
                            background: 'var(--c-card)', border: '1px solid var(--c-border-color)',
                            textDecoration: 'none', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(33,150,243,0.35)'; e.currentTarget.style.background = '#132436'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border-color)'; e.currentTarget.style.background = '#0F1E32'; }}
                    >
                        <Group justify="space-between" mb={8}>
                            <Group gap="sm">
                                <Text fw={800} size="sm" style={{ color: 'var(--c-text)' }}>{trip.trip_number}</Text>
                                <Box style={{ padding: '2px 10px', borderRadius: 12, background: `${statusColor[trip.status] || '#94A3B8'}22`, border: `1px solid ${statusColor[trip.status] || '#94A3B8'}55` }}>
                                    <Text size="xs" fw={700} style={{ color: statusColor[trip.status] || '#94A3B8', textTransform: 'capitalize' }}>{trip.status?.replace('_', ' ')}</Text>
                                </Box>
                            </Group>
                            <Text size="xs" style={{ color: '#475569' }}>{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString() : '—'}</Text>
                        </Group>
                        <Group gap="xl">
                            <Box>
                                <Text size="xs" style={{ color: '#475569', marginBottom: 2 }}>Route</Text>
                                <Text size="sm" fw={600} style={{ color: '#94A3B8' }}>{trip.origin} → {trip.destination}</Text>
                            </Box>
                            {trip.driver && (
                                <Box>
                                    <Text size="xs" style={{ color: '#475569', marginBottom: 2 }}>Driver</Text>
                                    <Text size="sm" style={{ color: '#94A3B8' }}>{trip.driver.name}</Text>
                                </Box>
                            )}
                            {trip.vehicle && (
                                <Box>
                                    <Text size="xs" style={{ color: '#475569', marginBottom: 2 }}>Vehicle</Text>
                                    <Text size="sm" style={{ color: '#94A3B8' }}>{trip.vehicle.registration_number}</Text>
                                </Box>
                            )}
                            {trip.cargo?.length > 0 && (
                                <Box>
                                    <Text size="xs" style={{ color: '#475569', marginBottom: 2 }}>Cargo</Text>
                                    <Text size="sm" style={{ color: '#94A3B8' }}>{trip.cargo.length} item(s)</Text>
                                </Box>
                            )}
                        </Group>
                    </Box>
                ))}

                {trips.data.length === 0 && (
                    <Box style={{ textAlign: 'center', padding: '64px 0', background: 'var(--c-card)', borderRadius: 12, border: '1px solid var(--c-border-subtle)' }}>
                        <Text style={{ fontSize: '3rem', marginBottom: 12 }}>🚛</Text>
                        <Text fw={600} style={{ color: 'var(--c-text)' }}>No shipments found</Text>
                        <Text size="sm" style={{ color: '#475569', marginTop: 6 }}>Your trips will appear here</Text>
                    </Box>
                )}
            </Stack>

            {/* Pagination */}
            {trips.last_page > 1 && (
                <Group justify="center" mt="xl" gap="xs">
                    {Array.from({ length: trips.last_page }, (_, i) => i + 1).map(page => (
                        <Box
                            key={page}
                            component={Link}
                            href={`/portal/trips?page=${page}${status ? `&status=${status}` : ''}`}
                            style={{
                                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 8, textDecoration: 'none',
                                background: page === trips.current_page ? '#1565C0' : '#0F1E32',
                                border: '1px solid var(--c-border-input)',
                                color: page === trips.current_page ? '#fff' : '#94A3B8',
                                fontWeight: page === trips.current_page ? 700 : 500, fontSize: 14,
                            }}
                        >
                            {page}
                        </Box>
                    ))}
                </Group>
            )}
        </PortalLayout>
    );
}

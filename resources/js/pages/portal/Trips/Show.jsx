import PortalLayout from '../../../layouts/PortalLayout';
import { Box, Text, Group, Grid, Stack } from '@mantine/core';
import { Link } from '@inertiajs/react';

const statusColor = {
    loading: '#F59E0B', in_transit: '#2196F3', at_border: '#A855F7',
    delivered: '#22C55E', completed: '#22C55E', cancelled: '#EF4444', planned: '#94A3B8',
};

const cargoStatusColor = {
    pending: '#94A3B8', loaded: '#F59E0B', in_transit: '#2196F3',
    delivered: '#22C55E', damaged: '#EF4444',
};

const Field = ({ label, value }) => (
    <Box>
        <Text size="xs" style={{ color: '#475569', marginBottom: 3 }}>{label}</Text>
        <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{value || '—'}</Text>
    </Box>
);

export default function PortalTripShow({ client, trip }) {
    const sc = statusColor[trip.status] || '#94A3B8';

    return (
        <PortalLayout title={`Trip ${trip.trip_number}`}>
            {/* Back */}
            <Box component={Link} href="/portal/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60A5FA', textDecoration: 'none', fontSize: 14, marginBottom: 20 }}>
                ← Back to shipments
            </Box>

            {/* Header card */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-strong)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
                <Group justify="space-between" mb="lg">
                    <Box>
                        <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>{trip.trip_number}</Text>
                        <Text size="sm" style={{ color: '#94A3B8', marginTop: 4 }}>{trip.origin} → {trip.destination}</Text>
                    </Box>
                    <Box style={{ padding: '6px 18px', borderRadius: 20, background: `${sc}22`, border: `1px solid ${sc}55` }}>
                        <Text fw={700} style={{ color: sc, textTransform: 'capitalize' }}>{trip.status?.replace('_', ' ')}</Text>
                    </Box>
                </Group>

                <Grid gutter="lg">
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Departure" value={trip.departure_date ? new Date(trip.departure_date).toLocaleDateString() : null} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Expected Arrival" value={trip.expected_arrival ? new Date(trip.expected_arrival).toLocaleDateString() : null} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Driver" value={trip.driver?.name} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Vehicle" value={trip.vehicle?.registration_number} /></Grid.Col>
                </Grid>

                {trip.notes && (
                    <Box style={{ marginTop: 16, padding: '12px 16px', background: 'var(--c-input)', borderRadius: 8, border: '1px solid var(--c-border-subtle)' }}>
                        <Text size="xs" style={{ color: '#475569', marginBottom: 4 }}>Notes</Text>
                        <Text size="sm" style={{ color: '#94A3B8' }}>{trip.notes}</Text>
                    </Box>
                )}
            </Box>

            {/* Cargo */}
            {trip.cargo?.length > 0 && (
                <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                    <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 16 }}>Cargo ({trip.cargo.length})</Text>
                    <Stack gap="sm">
                        {trip.cargo.map(item => {
                            const cc = cargoStatusColor[item.status] || '#94A3B8';
                            return (
                                <Box key={item.id} style={{ padding: '12px 16px', background: 'var(--c-input)', borderRadius: 10, border: '1px solid var(--c-thead)' }}>
                                    <Group justify="space-between">
                                        <Box>
                                            <Text fw={600} size="sm" style={{ color: 'var(--c-text)' }}>{item.description || item.cargo_number}</Text>
                                            {item.weight_kg && <Text size="xs" style={{ color: '#64748B' }}>{item.weight_kg} kg</Text>}
                                        </Box>
                                        <Box style={{ padding: '2px 10px', borderRadius: 10, background: `${cc}22`, border: `1px solid ${cc}55` }}>
                                            <Text size="xs" fw={700} style={{ color: cc, textTransform: 'capitalize' }}>{item.status}</Text>
                                        </Box>
                                    </Group>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            )}
        </PortalLayout>
    );
}

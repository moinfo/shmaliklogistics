import { Box, Text, Group, Stack, SimpleGrid, Grid } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import DriverLayout from '../../layouts/DriverLayout';

const card = { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.15)', borderRadius: 14 };

function StatCard({ icon, label, value, accent }) {
    return (
        <Box style={{ ...card, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />
            <Text style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</Text>
            <Text fw={900} size="xl" c="white">{value}</Text>
            <Text size="xs" style={{ color: '#94A3B8', marginTop: 2 }}>{label}</Text>
        </Box>
    );
}

function TripCard({ trip, statuses }) {
    const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
    return (
        <Box
            component={Link}
            href={`/driver/trips/${trip.id}`}
            style={{ ...card, padding: '14px 16px', display: 'block', textDecoration: 'none', transition: 'transform 0.12s, border-color 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(33,150,243,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(33,150,243,0.15)'; }}
        >
            <Group justify="space-between" mb={6}>
                <Text fw={800} size="sm" c="white">{trip.trip_number}</Text>
                <Box style={{ background: meta.color + '22', border: `1px solid ${meta.color}55`, borderRadius: 16, padding: '2px 10px' }}>
                    <Text size="10px" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                </Box>
            </Group>
            <Group gap={6} mb={4}>
                <Text size="sm" fw={600} c="white">{trip.route_from}</Text>
                <Text style={{ color: '#94A3B8' }}>→</Text>
                <Text size="sm" fw={600} c="white">{trip.route_to}</Text>
            </Group>
            <Group justify="space-between" mt={6}>
                <Text size="xs" style={{ color: '#94A3B8' }}>
                    🚛 {trip.vehicle?.plate || trip.vehicle_plate || '—'}
                </Text>
                <Text size="xs" style={{ color: '#94A3B8' }}>
                    {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString() : '—'}
                </Text>
            </Group>
        </Box>
    );
}

export default function DriverDashboard({ driver, active, upcoming, recent, todayInspection, stats, tripStatuses }) {
    const inspectionDone = !!todayInspection;
    const hasActive = active.length > 0;

    return (
        <DriverLayout title="My Dashboard">
            {/* Greeting */}
            <Stack gap={2} mb="lg">
                <Text fw={800} size="xl" c="white">Karibu, {driver.name.split(' ')[0]} 👋</Text>
                <Text size="sm" style={{ color: '#94A3B8' }}>
                    {driver.vehicle
                        ? <>Assigned vehicle: <Text component="span" fw={700} style={{ color: '#60A5FA' }}>{driver.vehicle.plate}</Text> — {driver.vehicle.make} {driver.vehicle.model_name}</>
                        : 'No vehicle assigned yet'}
                </Text>
            </Stack>

            {/* Today's inspection alert */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Box style={{
                    ...card,
                    padding: '16px 20px', marginBottom: 20,
                    background: inspectionDone ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                    borderColor: inspectionDone ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.4)',
                }}>
                    <Group justify="space-between" wrap="wrap" gap="md">
                        <Box style={{ flex: 1, minWidth: 240 }}>
                            <Text fw={700} size="sm" c="white">
                                {inspectionDone ? '✅ Ukaguzi wa asubuhi umefanyika' : '⚠️ Ukaguzi wa gari haujafanyika leo'}
                            </Text>
                            <Text size="xs" style={{ color: '#CBD5E1', marginTop: 4 }}>
                                {inspectionDone
                                    ? `Inspected at ${new Date(todayInspection.inspected_at).toLocaleTimeString()} — status: ${todayInspection.overall_status}`
                                    : 'Kabla ya kuanza safari, fanya ukaguzi wa gari (brakes, tires, lights…).'}
                            </Text>
                        </Box>
                        {!inspectionDone && (
                            <Box
                                component={Link}
                                href="/driver/inspections/create"
                                style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)', color: 'white', padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}
                            >
                                Anza Ukaguzi
                            </Box>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Stats */}
            <SimpleGrid cols={{ base: 3, sm: 3 }} spacing="sm" mb="xl">
                <StatCard icon="🚛" label="Active Trips"    value={stats.active_trips}    accent={['#0E4FA0', '#3B82F6']} />
                <StatCard icon="📅" label="Upcoming"        value={stats.upcoming_trips}  accent={['#5B21B6', '#A78BFA']} />
                <StatCard icon="✅" label="Done This Month" value={stats.completed_month} accent={['#065F46', '#22C55E']} />
            </SimpleGrid>

            <Grid gutter="md">
                {/* Active trips */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Box style={card}>
                        <Box style={{ padding: '14px 20px', borderBottom: '1px solid rgba(33,150,243,0.1)' }}>
                            <Text fw={700} c="white">🚦 Active Now ({active.length})</Text>
                        </Box>
                        <Stack gap="sm" p="md">
                            {active.length === 0 ? (
                                <Text size="sm" ta="center" py="lg" style={{ color: '#64748B' }}>No active trip</Text>
                            ) : (
                                active.map(t => <TripCard key={t.id} trip={t} statuses={tripStatuses} />)
                            )}
                        </Stack>
                    </Box>
                </Grid.Col>

                {/* Upcoming */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Box style={card}>
                        <Box style={{ padding: '14px 20px', borderBottom: '1px solid rgba(33,150,243,0.1)' }}>
                            <Text fw={700} c="white">📅 Coming Up</Text>
                        </Box>
                        <Stack gap="sm" p="md">
                            {upcoming.length === 0 ? (
                                <Text size="sm" ta="center" py="lg" style={{ color: '#64748B' }}>Nothing scheduled</Text>
                            ) : (
                                upcoming.map(t => <TripCard key={t.id} trip={t} statuses={tripStatuses} />)
                            )}
                        </Stack>
                    </Box>
                </Grid.Col>

                {/* Recent */}
                <Grid.Col span={12}>
                    <Box style={card}>
                        <Box style={{ padding: '14px 20px', borderBottom: '1px solid rgba(33,150,243,0.1)' }}>
                            <Text fw={700} c="white">Recent Trips</Text>
                        </Box>
                        <Stack gap="sm" p="md">
                            {recent.length === 0 ? (
                                <Text size="sm" ta="center" py="lg" style={{ color: '#64748B' }}>No completed trips yet</Text>
                            ) : (
                                recent.map(t => <TripCard key={t.id} trip={t} statuses={tripStatuses} />)
                            )}
                        </Stack>
                    </Box>
                </Grid.Col>
            </Grid>
        </DriverLayout>
    );
}

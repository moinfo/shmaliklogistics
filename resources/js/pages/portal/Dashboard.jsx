import PortalLayout from '../../layouts/PortalLayout';
import { Box, Grid, Text, Group, Stack, Badge } from '@mantine/core';
import { Link } from '@inertiajs/react';

const StatCard = ({ icon, label, value, color = '#2196F3' }) => (
    <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '20px 24px' }}>
        <Group gap="sm" mb={8}>
            <Text style={{ fontSize: '1.4rem' }}>{icon}</Text>
            <Text size="sm" style={{ color: '#64748B' }}>{label}</Text>
        </Group>
        <Text fw={800} size="xl" style={{ color, letterSpacing: -0.5 }}>{value}</Text>
    </Box>
);

const tripStatusColor = {
    loading: '#F59E0B', in_transit: '#2196F3', at_border: '#A855F7',
    delivered: '#22C55E', completed: '#22C55E', cancelled: '#EF4444',
};

export default function PortalDashboard({ client, company, activeTrips, recentInvoices, stats }) {
    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));

    return (
        <PortalLayout title={`Welcome, ${client.name}`}>
            {/* Stats */}
            <Grid mb="xl" gutter="md">
                <Grid.Col span={{ base: 6, sm: 3 }}>
                    <StatCard icon="🚛" label="Active Trips" value={stats.active_trips} color="#2196F3" />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }}>
                    <StatCard icon="📋" label="Total Trips" value={stats.total_trips} color="#94A3B8" />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }}>
                    <StatCard icon="💳" label="Paid Invoices" value={stats.paid_invoices} color="#22C55E" />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }}>
                    <StatCard icon="⚠️" label="Balance Due" value={`TZS ${fmt(stats.pending_amount)}`} color="#F59E0B" />
                </Grid.Col>
            </Grid>

            <Grid gutter="lg">
                {/* Active trips */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: 24 }}>
                        <Group justify="space-between" mb="md">
                            <Text fw={700} style={{ color: 'var(--c-text)' }}>Active Shipments</Text>
                            <Box component={Link} href="/portal/trips" style={{ fontSize: 13, color: '#60A5FA', textDecoration: 'none' }}>View all →</Box>
                        </Group>
                        {activeTrips.length === 0 ? (
                            <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Text style={{ fontSize: '2rem', marginBottom: 8 }}>🚛</Text>
                                <Text size="sm" style={{ color: '#475569' }}>No active shipments right now</Text>
                            </Box>
                        ) : (
                            <Stack gap="sm">
                                {activeTrips.map(trip => (
                                    <Box
                                        key={trip.id}
                                        component={Link}
                                        href={`/portal/trips/${trip.id}`}
                                        style={{
                                            display: 'block', padding: '14px 16px', borderRadius: 10,
                                            background: 'var(--c-input)', border: '1px solid var(--c-border-subtle)',
                                            textDecoration: 'none', transition: 'border-color 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(33,150,243,0.35)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--c-border-subtle)'}
                                    >
                                        <Group justify="space-between" mb={4}>
                                            <Text fw={700} size="sm" style={{ color: 'var(--c-text)' }}>{trip.trip_number}</Text>
                                            <Box style={{ padding: '2px 10px', borderRadius: 12, background: `${tripStatusColor[trip.status] || '#94A3B8'}22`, border: `1px solid ${tripStatusColor[trip.status] || '#94A3B8'}55` }}>
                                                <Text size="xs" fw={700} style={{ color: tripStatusColor[trip.status] || '#94A3B8', textTransform: 'capitalize' }}>{trip.status?.replace('_', ' ')}</Text>
                                            </Box>
                                        </Group>
                                        <Text size="xs" style={{ color: '#64748B' }}>{trip.origin} → {trip.destination}</Text>
                                        {trip.driver && <Text size="xs" style={{ color: '#475569', marginTop: 2 }}>Driver: {trip.driver.name}</Text>}
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Grid.Col>

                {/* Recent invoices */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: 24 }}>
                        <Group justify="space-between" mb="md">
                            <Text fw={700} style={{ color: 'var(--c-text)' }}>Recent Invoices</Text>
                            <Box component={Link} href="/portal/invoices" style={{ fontSize: 13, color: '#60A5FA', textDecoration: 'none' }}>View all →</Box>
                        </Group>
                        {recentInvoices.length === 0 ? (
                            <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Text style={{ fontSize: '2rem', marginBottom: 8 }}>📄</Text>
                                <Text size="sm" style={{ color: '#475569' }}>No invoices yet</Text>
                            </Box>
                        ) : (
                            <Stack gap="sm">
                                {recentInvoices.map(inv => {
                                    const statusColor = { paid: '#22C55E', sent: '#2196F3', overdue: '#EF4444', partial: '#F59E0B', draft: '#94A3B8' }[inv.status] || '#94A3B8';
                                    return (
                                        <Box key={inv.id} component={Link} href={`/portal/invoices/${inv.id}`} style={{ display: 'block', padding: '12px 14px', borderRadius: 10, background: 'var(--c-input)', border: '1px solid var(--c-border-subtle)', textDecoration: 'none', transition: 'border-color 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(33,150,243,0.35)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--c-border-subtle)'}
                                        >
                                            <Group justify="space-between">
                                                <Text fw={700} size="sm" style={{ color: 'var(--c-text)' }}>{inv.document_number}</Text>
                                                <Text size="xs" style={{ color: statusColor, fontWeight: 700, textTransform: 'capitalize' }}>{inv.status}</Text>
                                            </Group>
                                            <Group justify="space-between" mt={4}>
                                                <Text size="xs" style={{ color: '#64748B' }}>TZS {fmt(inv.total)}</Text>
                                                {inv.balance_due > 0 && (
                                                    <Text size="xs" style={{ color: '#F59E0B' }}>Due: {fmt(inv.balance_due)}</Text>
                                                )}
                                            </Group>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </Grid.Col>
            </Grid>
        </PortalLayout>
    );
}

import { Box, Text, Group, Stack, SimpleGrid, Grid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import DriverLayout from '../../layouts/DriverLayout';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function SectionCard({ title, icon, count, children, isDark, accent }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                    <Text size="sm" fw={700} style={{ color: textPri }}>{icon} {title}</Text>
                    {count !== undefined && count > 0 && (
                        <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 12, padding: '1px 8px' }}>
                            <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{count}</Text>
                        </Box>
                    )}
                </Group>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function TripCard({ trip, statuses, isDark }) {
    const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textMut = isDark ? '#475569' : '#98A2B3';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const rowHov  = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';
    return (
        <Box
            component={Link}
            href={`/driver/trips/${trip.id}`}
            style={{
                display: 'block', padding: '13px 0', borderBottom: `1px solid ${divider}`,
                borderLeft: '3px solid transparent', marginLeft: -20, paddingLeft: 20,
                textDecoration: 'none', transition: 'background 0.15s, border-left 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${meta.color}`; e.currentTarget.style.paddingLeft = '17px'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; e.currentTarget.style.paddingLeft = '20px'; }}
        >
            <Group justify="space-between" mb={4} wrap="nowrap">
                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '3px 8px' }}>
                    <Text size="10px" style={{ color: '#EA580C' }}>🚛</Text>
                    <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{trip.trip_number}</Text>
                </Box>
                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '3px 10px' }}>
                    <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                    <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                </Box>
            </Group>
            <Group gap={5} align="center" mb={2}>
                <Text size="sm" fw={700} style={{ color: textPri }}>{trip.route_from}</Text>
                <Text size="xs" style={{ color: '#EA580C', fontWeight: 900 }}>→</Text>
                <Text size="sm" fw={700} style={{ color: textPri }}>{trip.route_to}</Text>
            </Group>
            <Group justify="space-between">
                <Text size="xs" style={{ color: textMut }}>🚛 {trip.vehicle?.plate || trip.vehicle_plate || '—'}</Text>
                <Text size="xs" style={{ color: textMut }}>
                    {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                </Text>
            </Group>
        </Box>
    );
}

export default function DriverDashboard({ driver, active, upcoming, recent, todayInspection, stats, tripStatuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    const inspectionDone = !!todayInspection;

    const statCards = [
        {
            icon: '🚛', label: 'Active Trips', value: String(stats.active_trips),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '📅', label: 'Upcoming', value: String(stats.upcoming_trips),
            grad: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)',
            glow: '0 8px 28px rgba(139,92,246,0.4)',
        },
        {
            icon: '✅', label: 'Done This Month', value: String(stats.completed_month),
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
    ];

    return (
        <DriverLayout title="My Dashboard">
            {/* Page Header Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏠</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Karibu, {driver.name.split(' ')[0]}</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {driver.vehicle
                                        ? `Vehicle: ${driver.vehicle.plate} — ${driver.vehicle.make} ${driver.vehicle.model_name}`
                                        : 'No vehicle assigned yet'}
                                </Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            <Box component={Link} href="/driver/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                                🚛 My Trips
                            </Box>
                            <Box component={Link} href="/driver/check-ins/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                📍 Check-In
                            </Box>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Today's inspection alert */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? (inspectionDone ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)')
                        : (inspectionDone ? '#F0FDF4' : '#FFFBEB'),
                    border: `1px solid ${inspectionDone ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.4)'}`,
                    borderRadius: 14, padding: '16px 20px',
                    boxShadow: inspectionDone ? '0 4px 16px rgba(34,197,94,0.12)' : '0 4px 16px rgba(245,158,11,0.15)',
                }}>
                    <Group justify="space-between" wrap="wrap" gap="md">
                        <Group gap={12} style={{ flex: 1, minWidth: 240 }}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: inspectionDone ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                                {inspectionDone ? '✅' : '⚠️'}
                            </Box>
                            <Stack gap={2}>
                                <Text fw={700} size="sm" style={{ color: inspectionDone ? '#22C55E' : '#F59E0B' }}>
                                    {inspectionDone ? 'Ukaguzi wa asubuhi umefanyika' : 'Ukaguzi wa gari haujafanyika leo'}
                                </Text>
                                <Text size="xs" style={{ color: textSec }}>
                                    {inspectionDone
                                        ? `Inspected at ${new Date(todayInspection.inspected_at).toLocaleTimeString()} — status: ${todayInspection.overall_status}`
                                        : 'Kabla ya kuanza safari, fanya ukaguzi wa gari (brakes, tires, lights…).'}
                                </Text>
                            </Stack>
                        </Group>
                        {!inspectionDone && (
                            <Box component={Link} href="/driver/inspections/create"
                                style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)', color: 'white', padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(245,158,11,0.35)', whiteSpace: 'nowrap' }}>
                                Anza Ukaguzi
                            </Box>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Stats */}
            <SimpleGrid cols={{ base: 3, sm: 3 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            <Grid gutter="md">
                {/* Active trips */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <SectionCard title="Active Now" icon="🚦" count={active.length} isDark={isDark} accent={['#1D4ED8', '#3B82F6']}>
                            {active.length === 0 ? (
                                <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Box style={{ width: 56, height: 56, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.08)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 12px' }}>🚛</Box>
                                    <Text size="sm" style={{ color: textMut }}>No active trip</Text>
                                </Box>
                            ) : (
                                <Stack gap={0}>
                                    {active.map(t => <TripCard key={t.id} trip={t} statuses={tripStatuses} isDark={isDark} />)}
                                </Stack>
                            )}
                        </SectionCard>
                    </motion.div>
                </Grid.Col>

                {/* Upcoming */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <SectionCard title="Coming Up" icon="📅" count={upcoming.length} isDark={isDark} accent={['#5B21B6', '#8B5CF6']}>
                            {upcoming.length === 0 ? (
                                <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Box style={{ width: 56, height: 56, borderRadius: '50%', background: isDark ? 'rgba(139,92,246,0.08)' : '#F3F0FF', border: '2px dashed rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 12px' }}>📅</Box>
                                    <Text size="sm" style={{ color: textMut }}>Nothing scheduled</Text>
                                </Box>
                            ) : (
                                <Stack gap={0}>
                                    {upcoming.map(t => <TripCard key={t.id} trip={t} statuses={tripStatuses} isDark={isDark} />)}
                                </Stack>
                            )}
                        </SectionCard>
                    </motion.div>
                </Grid.Col>

                {/* Recent */}
                <Grid.Col span={12}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <SectionCard title="Recent Trips" icon="🕐" count={recent.length} isDark={isDark} accent={['#065F46', '#10B981']}>
                            {recent.length === 0 ? (
                                <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Box style={{ width: 56, height: 56, borderRadius: '50%', background: isDark ? 'rgba(16,185,129,0.08)' : '#F0FDF4', border: '2px dashed rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 12px' }}>✅</Box>
                                    <Text size="sm" style={{ color: textMut }}>No completed trips yet</Text>
                                </Box>
                            ) : (
                                <Grid gutter="md">
                                    {recent.map((t, i) => (
                                        <Grid.Col key={t.id} span={{ base: 12, sm: 6, md: 4 }}>
                                            <TripCard trip={t} statuses={tripStatuses} isDark={isDark} />
                                        </Grid.Col>
                                    ))}
                                </Grid>
                            )}
                        </SectionCard>
                    </motion.div>
                </Grid.Col>
            </Grid>
        </DriverLayout>
    );
}

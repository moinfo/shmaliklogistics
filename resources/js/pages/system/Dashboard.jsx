import { Head, usePage, Link } from '@inertiajs/react';
import { Box, Title, Text, SimpleGrid, Group, Stack, Badge, Progress } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';

const dk = {
    card: '#0F1E32', cardHov: '#132436', border: 'rgba(33,150,243,0.12)',
    divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569',
};

const STATUS_PROGRESS = { planned: 5, loading: 15, in_transit: 60, at_border: 80, delivered: 100, completed: 100, cancelled: 0 };
const STATUS_COLOR    = { planned: '#A78BFA', loading: '#A78BFA', in_transit: '#3B82F6', at_border: '#F59E0B', delivered: '#22C55E', completed: '#10B981', cancelled: '#EF4444' };
const STATUS_LABEL    = { planned: 'Planned', loading: 'Loading', in_transit: 'In Transit', at_border: 'At Border', delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled' };
const FLEET_COLORS    = { active: '#22C55E', on_road: '#3B82F6', at_border: '#F59E0B', loading: '#A78BFA', idle: '#475569', maintenance: '#EF4444', retired: '#334155' };

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(n ?? 0));

const quickActions = [
    { icon: '🚛', label: 'New Trip',    desc: 'Create a booking',   accent: '#1565C0', href: '/system/trips/create' },
    { icon: '🚗', label: 'Add Vehicle', desc: 'Register vehicle',   accent: '#0E4FA0', href: '/system/fleet/create' },
    { icon: '🛂', label: 'New Permit',  desc: 'Apply for permit',   accent: '#065F46', href: '/system/permits/create' },
    { icon: '👤', label: 'New Driver',  desc: 'Register driver',    accent: '#6D28D9', href: '/system/drivers/create' },
];

export default function Dashboard() {
    const { props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { stats = {}, recentTrips = [], fleetStatus = [] } = props;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const user = props.auth?.user;

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? `1px solid ${dk.border}` : '1px solid #E2E8F0';
    const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)';
    const divider    = isDark ? `1px solid ${dk.divider}` : '1px solid #F1F5F9';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const rowHovBg   = isDark ? dk.cardHov : '#F8FAFC';

    const revPct = stats.revenue_change_pct;
    const revBadge = revPct === null ? '—' : `${revPct >= 0 ? '+' : ''}${revPct}%`;
    const revColor = revPct === null ? 'gray' : revPct >= 0 ? 'green' : 'red';

    const statCards = [
        {
            icon: '🚛', label: 'Active Trips',
            value: String(stats.active_trips ?? 0),
            sub: 'loading, in transit, at border',
            badge: `${stats.active_trips ?? 0} active`, badgeColor: 'teal',
            accent: ['#1565C0', '#2196F3'],
        },
        {
            icon: '🚗', label: 'Fleet on Road',
            value: `${stats.fleet_on_road ?? 0} / ${stats.fleet_total ?? 0}`,
            sub: `${stats.fleet_idle ?? 0} vehicles idle`,
            badge: stats.fleet_total > 0 ? `${Math.round((stats.fleet_on_road ?? 0) / stats.fleet_total * 100)}%` : '0%',
            badgeColor: 'blue',
            accent: ['#0E4FA0', '#1565C0'],
        },
        {
            icon: '💰', label: "Month's Revenue",
            value: `TZS ${fmt(stats.month_revenue)}`,
            sub: stats.last_month_revenue > 0 ? `vs TZS ${fmt(stats.last_month_revenue)} last month` : 'No data last month',
            badge: revBadge, badgeColor: revColor,
            accent: ['#065F46', '#059669'],
        },
        {
            icon: '🛂', label: 'Permits Expiring',
            value: String(stats.pending_permits ?? 0),
            sub: `${stats.permits_expiring_7d ?? 0} expiring within 7 days`,
            badge: (stats.permits_expiring_7d ?? 0) > 0 ? 'Act now' : 'OK',
            badgeColor: (stats.permits_expiring_7d ?? 0) > 0 ? 'red' : 'green',
            accent: ['#7F1D1D', '#DC2626'],
        },
    ];

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Group justify="space-between" align="flex-end" mb={28} wrap="wrap" gap="md">
                    <Stack gap={3}>
                        <Text size="xs" fw={500} style={{ color: textMut, letterSpacing: 0.3 }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                        <Title order={2} style={{ color: textPri, fontWeight: 800, lineHeight: 1.2 }}>
                            {greeting},{' '}
                            <Text component="span" style={{ background: 'linear-gradient(135deg, #1565C0, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                {user?.name?.split(' ')[0] || 'Admin'}
                            </Text>
                        </Title>
                        <Text size="sm" style={{ color: textSec }}>Here's what's happening with your fleet today.</Text>
                    </Stack>
                    <Group gap="sm" wrap="wrap">
                        {[
                            ['#3B82F6', `${stats.fleet_on_road ?? 0} On Road`],
                            ['#F59E0B', `${stats.active_trips ?? 0} Active Trips`],
                            ['#475569', `${stats.fleet_idle ?? 0} Idle`],
                        ].map(([dot, label]) => (
                            <Group key={label} gap={7} style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff', border: isDark ? `1px solid ${dk.divider}` : '1px solid #E2E8F0', borderRadius: 20, padding: '6px 14px' }}>
                                <Box style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />
                                <Text size="xs" fw={500} style={{ color: textPri }}>{label}</Text>
                            </Group>
                        ))}
                    </Group>
                </Group>
            </motion.div>

            {/* Stats */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, position: 'relative' }}>
                            <Box style={{ height: 3, background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` }} />
                            {isDark && <Box style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${s.accent[1]}22 0%, transparent 70%)`, pointerEvents: 'none' }} />}
                            <Box style={{ padding: '20px 22px 22px' }}>
                                <Group justify="space-between" mb={14} align="flex-start">
                                    <Box style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? `${s.accent[0]}30` : `${s.accent[1]}18`, border: isDark ? `1px solid ${s.accent[1]}30` : `1px solid ${s.accent[1]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {s.icon}
                                    </Box>
                                    <Badge size="sm" variant="light" color={s.badgeColor} radius="xl" style={{ fontWeight: 700 }}>{s.badge}</Badge>
                                </Group>
                                <Text fw={900} style={{ fontSize: '1.75rem', lineHeight: 1, color: textPri, marginBottom: 4 }}>{s.value}</Text>
                                <Text fw={600} size="sm" style={{ color: isDark ? '#60A5FA' : s.accent[1], marginBottom: 4 }}>{s.label}</Text>
                                <Text size="xs" style={{ color: textMut }}>{s.sub}</Text>
                            </Box>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                    {quickActions.map((a) => (
                        <motion.div key={a.label} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <Box component={Link} href={a.href} style={{
                                display: 'block', textDecoration: 'none',
                                background: isDark ? `linear-gradient(135deg, ${a.accent}CC, ${a.accent}99)` : `linear-gradient(135deg, ${a.accent}, ${a.accent}DD)`,
                                borderRadius: 14, padding: '18px 20px', cursor: 'pointer',
                                border: isDark ? `1px solid ${a.accent}55` : 'none',
                                boxShadow: `0 4px 20px ${a.accent}33`, position: 'relative', overflow: 'hidden',
                            }}>
                                <Box style={{ position: 'absolute', bottom: -12, right: -12, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                                <Text style={{ fontSize: '1.7rem', marginBottom: 10 }}>{a.icon}</Text>
                                <Text fw={700} c="white" size="sm">{a.label}</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{a.desc}</Text>
                            </Box>
                        </motion.div>
                    ))}
                </SimpleGrid>
            </motion.div>

            {/* Recent Trips + Fleet Status */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">

                {/* Recent Trips */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>🚛</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Recent Trips</Text>
                            </Group>
                            <Box component={Link} href="/system/trips" style={{ textDecoration: 'none' }}>
                                <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                    style={isDark ? { background: 'rgba(33,150,243,0.2)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                                    View all →
                                </Badge>
                            </Box>
                        </Group>

                        {recentTrips.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>No trips yet. <Link href="/system/trips/create" style={{ color: '#3B82F6' }}>Create the first one →</Link></Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {recentTrips.map((trip, i) => {
                                    const sc = STATUS_COLOR[trip.status] || '#475569';
                                    const progress = STATUS_PROGRESS[trip.status] ?? 0;
                                    const progressColor = trip.status === 'delivered' || trip.status === 'completed' ? 'teal' : trip.status === 'at_border' ? 'yellow' : trip.status === 'loading' ? 'violet' : 'blue';
                                    return (
                                        <Box key={trip.trip_number} style={{ padding: '13px 22px', borderBottom: i < recentTrips.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <Group justify="space-between" mb={5} wrap="nowrap">
                                                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                                    <Text size="xs" fw={600} style={{ color: textMut, flexShrink: 0, fontFamily: 'monospace' }}>{trip.trip_number}</Text>
                                                    <Text size="sm" fw={600} style={{ color: textPri }} truncate>{trip.route_from} → {trip.route_to}</Text>
                                                </Group>
                                                <Box style={{ background: sc + '22', border: `1px solid ${sc}44`, borderRadius: 20, padding: '2px 10px', flexShrink: 0 }}>
                                                    <Text size="10px" fw={700} style={{ color: sc, letterSpacing: 0.5, textTransform: 'uppercase' }}>{STATUS_LABEL[trip.status] || trip.status}</Text>
                                                </Box>
                                            </Group>
                                            <Group justify="space-between" mb={7}>
                                                <Text size="xs" style={{ color: textSec }}>{trip.driver_name} · {trip.vehicle_plate}</Text>
                                                <Text size="xs" style={{ color: textMut }}>{trip.cargo_description}</Text>
                                            </Group>
                                            <Progress value={progress} size={3} radius="xl" color={progressColor} style={{ opacity: isDark ? 0.85 : 1 }} />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </motion.div>

                {/* Fleet Status */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>🚗</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Fleet Status</Text>
                            </Group>
                            <Box component={Link} href="/system/fleet" style={{ textDecoration: 'none' }}>
                                <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                    style={isDark ? { background: 'rgba(33,150,243,0.2)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                                    {stats.fleet_total ?? 0} vehicles →
                                </Badge>
                            </Box>
                        </Group>

                        {fleetStatus.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>No vehicles registered. <Link href="/system/fleet/create" style={{ color: '#3B82F6' }}>Add one →</Link></Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {fleetStatus.map((v, i) => {
                                    const sc = FLEET_COLORS[v.status] || '#475569';
                                    const statusLabel = v.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
                                    return (
                                        <Box key={v.id} style={{ padding: '12px 22px', borderBottom: i < fleetStatus.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <Group justify="space-between" mb={4} wrap="nowrap">
                                                <Group gap={8} wrap="nowrap">
                                                    <Text fw={700} size="sm" style={{ color: textPri, fontFamily: 'monospace' }}>{v.plate}</Text>
                                                    <Box style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 4, padding: '1px 7px' }}>
                                                        <Text size="10px" fw={600} style={{ color: textSec }}>{v.type}</Text>
                                                    </Box>
                                                </Group>
                                                <Box style={{ background: sc + '1A', border: `1px solid ${sc}44`, borderRadius: 20, padding: '2px 10px' }}>
                                                    <Text size="10px" fw={700} style={{ color: sc, letterSpacing: 0.5, textTransform: 'uppercase' }}>{statusLabel}</Text>
                                                </Box>
                                            </Group>
                                            <Text size="xs" style={{ color: textSec }}>{v.driver?.name || 'No driver assigned'}</Text>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </motion.div>
            </SimpleGrid>
        </DashboardLayout>
    );
}

import { Head, usePage } from '@inertiajs/react';
import { Box, Title, Text, SimpleGrid, Group, Stack, Badge, Progress, RingProgress } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';

// Dark layer palette (must match DashboardLayout)
const dk = {
    card:    '#0F1E32',
    cardHov: '#132436',
    border:  'rgba(33,150,243,0.12)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: '#94A3B8',
    textMut: '#475569',
};

const stats = [
    { icon: '🚛', label: 'Active Trips', value: '12', sub: '3 at border crossings', badge: '+2 today', badgeColor: 'teal', accent: ['#1565C0', '#2196F3'] },
    { icon: '🚗', label: 'Fleet on Road', value: '28 / 50', sub: '22 vehicles idle', badge: '56%', badgeColor: 'blue', accent: ['#0E4FA0', '#1565C0'] },
    { icon: '💰', label: "Month's Revenue", value: 'TZS 48.2M', sub: 'vs TZS 41.1M last month', badge: '+17%', badgeColor: 'green', accent: ['#065F46', '#059669'] },
    { icon: '🛂', label: 'Pending Permits', value: '3', sub: '1 expiring in 7 days', badge: 'Act now', badgeColor: 'red', accent: ['#7F1D1D', '#DC2626'] },
];

const recentTrips = [
    { id: 'TRP-0241', route: 'Dar → Lubumbashi', driver: 'Juma Mwangi', status: 'In Transit', statusColor: '#3B82F6', progress: 68, cargo: 'Industrial Equipment', vehicle: 'TZA-221-A' },
    { id: 'TRP-0240', route: 'Dar → Lusaka', driver: 'Peter Odhiambo', status: 'At Border', statusColor: '#F59E0B', progress: 52, cargo: 'General Goods', vehicle: 'TZA-185-B' },
    { id: 'TRP-0239', route: 'Dar → Lilongwe', driver: 'Hassan Ally', status: 'Delivered', statusColor: '#22C55E', progress: 100, cargo: 'FMCG', vehicle: 'TZA-309-C' },
    { id: 'TRP-0238', route: 'Dar → Maputo', driver: 'George Mwamba', status: 'Loading', statusColor: '#A78BFA', progress: 12, cargo: 'Construction Materials', vehicle: 'TZA-144-A' },
    { id: 'TRP-0237', route: 'Dar → Lubumbashi', driver: 'Ali Hassan', status: 'Delivered', statusColor: '#22C55E', progress: 100, cargo: 'Refrigerated Cargo', vehicle: 'TZA-267-D' },
];

const fleetStatus = [
    { vehicle: 'TZA-221-A', type: 'Flatbed', driver: 'Juma Mwangi', status: 'On Road', fuel: 72 },
    { vehicle: 'TZA-185-B', type: 'Container', driver: 'Peter Odhiambo', status: 'At Border', fuel: 48 },
    { vehicle: 'TZA-309-C', type: 'Flatbed', driver: 'Hassan Ally', status: 'Idle', fuel: 91 },
    { vehicle: 'TZA-144-A', type: 'Lowboy', driver: 'George Mwamba', status: 'Loading', fuel: 85 },
    { vehicle: 'TZA-267-D', type: 'Reefer', driver: 'Ali Hassan', status: 'Idle', fuel: 63 },
    { vehicle: 'TZA-088-B', type: 'Container', driver: 'David Kiprotich', status: 'Maintenance', fuel: 100 },
];

const quickActions = [
    { icon: '🚛', label: 'New Trip', desc: 'Create a booking', accent: '#1565C0' },
    { icon: '🚗', label: 'Add Vehicle', desc: 'Register vehicle', accent: '#0E4FA0' },
    { icon: '🛂', label: 'New Permit', desc: 'Apply for permit', accent: '#065F46' },
    { icon: '📦', label: 'Add Cargo', desc: 'Register manifest', accent: '#6D28D9' },
];

const statusColors = { 'On Road': '#3B82F6', 'At Border': '#F59E0B', 'Idle': '#475569', 'Loading': '#A78BFA', 'Maintenance': '#EF4444' };

export default function Dashboard() {
    const { props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const user = props.auth?.user;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Semantic tokens
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? `1px solid ${dk.border}` : '1px solid #E2E8F0';
    const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)';
    const divider    = isDark ? `1px solid ${dk.divider}` : '1px solid #F1F5F9';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const rowHovBg   = isDark ? dk.cardHov : '#F8FAFC';

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard — SH Malik Logistics" />

            {/* ── Greeting header ── */}
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

                    {/* Fleet legend */}
                    <Group gap="sm" wrap="wrap">
                        {[['#22C55E', '28 On Road'], ['#F59E0B', '2 At Border'], ['#475569', '20 Idle']].map(([dot, label]) => (
                            <Group key={label} gap={7} style={{
                                background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                                border: isDark ? `1px solid ${dk.divider}` : '1px solid #E2E8F0',
                                borderRadius: 20, padding: '6px 14px',
                            }}>
                                <Box style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />
                                <Text size="xs" fw={500} style={{ color: textPri }}>{label}</Text>
                            </Group>
                        ))}
                    </Group>
                </Group>
            </motion.div>

            {/* ── Stats ── */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb={24}>
                {stats.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, position: 'relative' }}>
                            {/* Gradient top stripe */}
                            <Box style={{ height: 3, background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` }} />
                            {/* Soft glow blob */}
                            {isDark && <Box style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${s.accent[1]}22 0%, transparent 70%)`, pointerEvents: 'none' }} />}
                            <Box style={{ padding: '20px 22px 22px' }}>
                                <Group justify="space-between" mb={14} align="flex-start">
                                    <Box style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? `${s.accent[0]}30` : `${s.accent[1]}18`, border: isDark ? `1px solid ${s.accent[1]}30` : `1px solid ${s.accent[1]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {s.icon}
                                    </Box>
                                    <Badge size="sm" variant="light" color={s.badgeColor} radius="xl" style={{ fontWeight: 700 }}>
                                        {s.badge}
                                    </Badge>
                                </Group>
                                <Text fw={900} style={{ fontSize: '1.75rem', lineHeight: 1, color: textPri, marginBottom: 4 }}>
                                    {s.value}
                                </Text>
                                <Text fw={600} size="sm" style={{ color: isDark ? '#60A5FA' : s.accent[1], marginBottom: 4 }}>{s.label}</Text>
                                <Text size="xs" style={{ color: textMut }}>{s.sub}</Text>
                            </Box>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── Quick Actions ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                    {quickActions.map((a) => (
                        <motion.div key={a.label} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <Box style={{
                                background: isDark
                                    ? `linear-gradient(135deg, ${a.accent}CC, ${a.accent}99)`
                                    : `linear-gradient(135deg, ${a.accent}, ${a.accent}DD)`,
                                borderRadius: 14, padding: '18px 20px', cursor: 'pointer',
                                border: isDark ? `1px solid ${a.accent}55` : 'none',
                                boxShadow: `0 4px 20px ${a.accent}33`,
                                position: 'relative', overflow: 'hidden',
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

            {/* ── Recent Trips + Fleet Status ── */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">

                {/* Recent Trips */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>🚛</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Recent Trips</Text>
                            </Group>
                            <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                style={isDark ? { background: 'rgba(33,150,243,0.2)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)' } : {}}>
                                {recentTrips.length} trips
                            </Badge>
                        </Group>

                        <Stack gap={0}>
                            {recentTrips.map((trip, i) => (
                                <Box key={trip.id} style={{
                                    padding: '13px 22px',
                                    borderBottom: i < recentTrips.length - 1 ? divider : 'none',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Group justify="space-between" mb={5} wrap="nowrap">
                                        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                            <Text size="xs" fw={600} style={{ color: textMut, flexShrink: 0, fontFamily: 'monospace' }}>{trip.id}</Text>
                                            <Text size="sm" fw={600} style={{ color: textPri }} truncate>{trip.route}</Text>
                                        </Group>
                                        <Box style={{ background: trip.statusColor + '22', border: `1px solid ${trip.statusColor}44`, borderRadius: 20, padding: '2px 10px', flexShrink: 0 }}>
                                            <Text size="10px" fw={700} style={{ color: trip.statusColor, letterSpacing: 0.5, textTransform: 'uppercase' }}>{trip.status}</Text>
                                        </Box>
                                    </Group>
                                    <Group justify="space-between" mb={7}>
                                        <Text size="xs" style={{ color: textSec }}>{trip.driver} · {trip.vehicle}</Text>
                                        <Text size="xs" style={{ color: textMut }}>{trip.cargo}</Text>
                                    </Group>
                                    <Progress
                                        value={trip.progress} size={3} radius="xl"
                                        color={trip.status === 'Delivered' ? 'teal' : trip.status === 'At Border' ? 'yellow' : trip.status === 'Loading' ? 'violet' : 'blue'}
                                        style={{ opacity: isDark ? 0.85 : 1 }}
                                    />
                                </Box>
                            ))}
                        </Stack>
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
                            <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                style={isDark ? { background: 'rgba(33,150,243,0.2)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)' } : {}}>
                                50 vehicles total
                            </Badge>
                        </Group>

                        <Stack gap={0}>
                            {fleetStatus.map((v, i) => {
                                const sc = statusColors[v.status] || '#475569';
                                const fuelColor = v.fuel < 30 ? '#EF4444' : v.fuel < 55 ? '#F59E0B' : '#22C55E';
                                return (
                                    <Box key={v.vehicle} style={{
                                        padding: '12px 22px',
                                        borderBottom: i < fleetStatus.length - 1 ? divider : 'none',
                                        transition: 'background 0.15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Group justify="space-between" mb={4} wrap="nowrap">
                                            <Group gap={8} wrap="nowrap">
                                                <Text fw={700} size="sm" style={{ color: textPri, fontFamily: 'monospace' }}>{v.vehicle}</Text>
                                                <Box style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 4, padding: '1px 7px' }}>
                                                    <Text size="10px" fw={600} style={{ color: textSec }}>{v.type}</Text>
                                                </Box>
                                            </Group>
                                            <Box style={{ background: sc + '1A', border: `1px solid ${sc}44`, borderRadius: 20, padding: '2px 10px' }}>
                                                <Text size="10px" fw={700} style={{ color: sc, letterSpacing: 0.5, textTransform: 'uppercase' }}>{v.status}</Text>
                                            </Box>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="xs" style={{ color: textSec }}>{v.driver}</Text>
                                            <Group gap={8} align="center">
                                                <Text size="xs" style={{ color: fuelColor, fontWeight: 600 }}>⛽ {v.fuel}%</Text>
                                                <Box style={{ width: 52, height: 4, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${v.fuel}%` }}
                                                        transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                                                        style={{ height: '100%', background: fuelColor, borderRadius: 4 }}
                                                    />
                                                </Box>
                                            </Group>
                                        </Group>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                </motion.div>
            </SimpleGrid>
        </DashboardLayout>
    );
}

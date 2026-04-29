import { Head, usePage } from '@inertiajs/react';
import { Box, Title, Text, SimpleGrid, Group, Stack, Badge, Progress } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';

const stats = [
    { icon: '🚛', label: 'Active Trips', value: '12', sub: '3 at border crossings', trend: '+2 today', trendUp: true, accent: '#1565C0' },
    { icon: '🚗', label: 'Fleet on Road', value: '28', sub: 'of 50 vehicles', trend: '22 idle', trendUp: null, accent: '#0E4FA0' },
    { icon: '💰', label: "Month's Revenue", value: 'TZS 48.2M', sub: 'vs TZS 41.1M last month', trend: '+17%', trendUp: true, accent: '#1565C0' },
    { icon: '🛂', label: 'Pending Permits', value: '3', sub: '1 expiring in 7 days', trend: 'Action needed', trendUp: false, accent: '#0E4FA0' },
];

const recentTrips = [
    { id: 'TRP-0241', route: 'Dar → Lubumbashi', driver: 'Juma Mwangi', status: 'In Transit', statusColor: '#2196F3', progress: 68, cargo: 'Industrial Equipment', vehicle: 'TZA-221-A' },
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
    { icon: '🚛', label: 'New Trip', desc: 'Create a trip booking' },
    { icon: '🚗', label: 'Add Vehicle', desc: 'Register a new vehicle' },
    { icon: '🛂', label: 'New Permit', desc: 'Apply for transit permit' },
    { icon: '📦', label: 'Add Cargo', desc: 'Register cargo manifest' },
];

function StatCard({ stat, isDark, delay }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
            <Box style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E8EDF2',
                borderRadius: 16,
                padding: '22px 24px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
            }}>
                <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${stat.accent}, #2196F3)` }} />
                <Group justify="space-between" mb={12}>
                    <Text style={{ fontSize: '1.8rem' }}>{stat.icon}</Text>
                    {stat.trendUp !== null && (
                        <Badge size="sm" variant="light" color={stat.trendUp ? 'green' : 'red'} radius="xl">
                            {stat.trend}
                        </Badge>
                    )}
                    {stat.trendUp === null && (
                        <Text size="xs" c="dimmed">{stat.trend}</Text>
                    )}
                </Group>
                <Text fw={900} style={{ fontSize: '2rem', lineHeight: 1, color: isDark ? 'white' : '#1a2a4a' }} mb={4}>
                    {stat.value}
                </Text>
                <Text fw={600} size="sm" c={isDark ? 'gray.4' : 'brand.7'} mb={4}>{stat.label}</Text>
                <Text size="xs" c="dimmed">{stat.sub}</Text>
            </Box>
        </motion.div>
    );
}

export default function Dashboard() {
    const { props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const user = props.auth?.user;

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E8EDF2';
    const cardShadow = isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)';
    const textPrimary = isDark ? 'white' : '#1a2a4a';
    const textMuted = isDark ? 'gray.5' : 'dimmed';

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard — SH Malik Logistics" />

            {/* ── Greeting ── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Group justify="space-between" align="flex-end" mb={32} wrap="wrap" gap="sm">
                    <Stack gap={4}>
                        <Text size="sm" c={textMuted}>{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                        <Title order={2} style={{ color: textPrimary, fontWeight: 800 }}>
                            {greeting},{' '}
                            <Text component="span" style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                {user?.name?.split(' ')[0] || 'Admin'}
                            </Text>
                        </Title>
                        <Text size="sm" c={textMuted}>Here's what's happening with your fleet today.</Text>
                    </Stack>
                    <Group gap="sm">
                        {[
                            { dot: '#22C55E', label: '28 On Road' },
                            { dot: '#F59E0B', label: '2 At Border' },
                            { dot: '#6B7280', label: '20 Idle' },
                        ].map(b => (
                            <Group key={b.label} gap={6} style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E8EDF2', borderRadius: 20, padding: '6px 14px' }}>
                                <Box style={{ width: 8, height: 8, borderRadius: '50%', background: b.dot }} />
                                <Text size="xs" fw={500} c={textPrimary}>{b.label}</Text>
                            </Group>
                        ))}
                    </Group>
                </Group>
            </motion.div>

            {/* ── Stats ── */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb={28}>
                {stats.map((s, i) => <StatCard key={s.label} stat={s} isDark={isDark} delay={i * 0.08} />)}
            </SimpleGrid>

            {/* ── Quick Actions ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={28}>
                    {quickActions.map((a, i) => (
                        <motion.div key={a.label} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <Box style={{ background: 'linear-gradient(135deg, #0E4FA0, #1565C0)', borderRadius: 14, padding: '16px 20px', cursor: 'pointer', border: '1px solid rgba(33,150,243,0.3)', boxShadow: '0 4px 20px rgba(21,101,192,0.25)' }}>
                                <Text style={{ fontSize: '1.6rem', marginBottom: 8 }}>{a.icon}</Text>
                                <Text fw={700} c="white" size="sm">{a.label}</Text>
                                <Text size="xs" c="brand.3">{a.desc}</Text>
                            </Box>
                        </motion.div>
                    ))}
                </SimpleGrid>
            </motion.div>

            {/* ── Recent Trips + Fleet ── */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">

                {/* Recent Trips */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ padding: '18px 24px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text fw={700} c={textPrimary} size="md">Recent Trips</Text>
                            <Badge color="brand" variant="light" size="sm">{recentTrips.length} trips</Badge>
                        </Box>
                        <Stack gap={0}>
                            {recentTrips.map((trip, i) => (
                                <Box key={trip.id} style={{
                                    padding: '14px 24px',
                                    borderBottom: i < recentTrips.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #F5F7FA') : 'none',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Group justify="space-between" mb={6} wrap="nowrap">
                                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                                            <Text size="xs" c="dimmed" fw={600} style={{ flexShrink: 0 }}>{trip.id}</Text>
                                            <Text size="sm" fw={600} c={textPrimary} truncate>{trip.route}</Text>
                                        </Group>
                                        <Badge size="xs" radius="xl" style={{ background: trip.statusColor + '22', color: trip.statusColor, border: `1px solid ${trip.statusColor}44`, flexShrink: 0 }}>
                                            {trip.status}
                                        </Badge>
                                    </Group>
                                    <Group justify="space-between" mb={6}>
                                        <Text size="xs" c="dimmed">{trip.driver} · {trip.vehicle}</Text>
                                        <Text size="xs" c="dimmed">{trip.cargo}</Text>
                                    </Group>
                                    <Progress value={trip.progress} size={3} radius="xl" color={trip.status === 'Delivered' ? 'green' : trip.status === 'At Border' ? 'yellow' : 'blue'} />
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </motion.div>

                {/* Fleet Status */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ padding: '18px 24px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text fw={700} c={textPrimary} size="md">Fleet Status</Text>
                            <Badge color="brand" variant="light" size="sm">50 vehicles total</Badge>
                        </Box>
                        <Stack gap={0}>
                            {fleetStatus.map((v, i) => {
                                const statusColor = { 'On Road': '#2196F3', 'At Border': '#F59E0B', 'Idle': '#6B7280', 'Loading': '#A78BFA', 'Maintenance': '#EF4444' }[v.status] || '#6B7280';
                                return (
                                    <Box key={v.vehicle} style={{
                                        padding: '12px 24px',
                                        borderBottom: i < fleetStatus.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #F5F7FA') : 'none',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Group justify="space-between" mb={4} wrap="nowrap">
                                            <Group gap="sm" wrap="nowrap">
                                                <Text fw={700} size="sm" c={textPrimary}>{v.vehicle}</Text>
                                                <Text size="xs" c="dimmed">{v.type}</Text>
                                            </Group>
                                            <Badge size="xs" radius="xl" style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44`, flexShrink: 0 }}>
                                                {v.status}
                                            </Badge>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="xs" c="dimmed">{v.driver}</Text>
                                            <Group gap={6}>
                                                <Text size="xs" c="dimmed">⛽ {v.fuel}%</Text>
                                                <Progress value={v.fuel} w={48} size={3} radius="xl" color={v.fuel < 30 ? 'red' : v.fuel < 60 ? 'yellow' : 'green'} />
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

import { Head, usePage, Link } from '@inertiajs/react';
import { Box, Title, Text, SimpleGrid, Group, Stack, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = {
    card: '#0F1E32', cardHov: '#132436', border: 'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)',
};

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(n ?? 0));

function CostChart({ data, isDark }) {
    const textMut = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const maxVal  = Math.max(...data.map(d => d.cost), 1);
    const H = 100, barW = 30, gap = 14;
    const totalW = data.length * (barW + gap);

    return (
        <Box style={{ overflowX: 'auto' }}>
            <svg width="100%" viewBox={`0 0 ${totalW} ${H + 28}`} preserveAspectRatio="none" style={{ minWidth: 320 }}>
                {data.map((d, i) => {
                    const x = i * (barW + gap);
                    const cH = Math.max((d.cost / maxVal) * H, 2);
                    return (
                        <g key={i}>
                            <rect x={x} y={H - cH} width={barW} height={cH} rx={3} fill="#F59E0B" opacity={0.85} />
                            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={9} fill={textMut}>{d.month}</text>
                        </g>
                    );
                })}
            </svg>
            <Group gap={16} mt={4}>
                <Group gap={5}><Box style={{ width: 10, height: 10, borderRadius: 2, background: '#F59E0B' }} /><Text size="xs" style={{ color: isDark ? dk.textSec : '#64748B' }}>Maintenance Cost</Text></Group>
            </Group>
        </Box>
    );
}

export default function MaintenanceDashboard() {
    const { props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const {
        stats = {}, monthlyTrend = [], byType = [],
        upcomingServices = [], recentServices = [], topVehicles = [],
    } = props;

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? `1px solid ${dk.border}` : '1px solid #E2E8F0';
    const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)';
    const divider    = isDark ? `1px solid ${dk.divider}` : '1px solid #F1F5F9';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const rowHovBg   = isDark ? dk.cardHov : '#F8FAFC';

    const statCards = [
        {
            icon: '🔧', label: 'Total Services',
            value: fmt(stats.total_services),
            sub: `TZS ${fmt(stats.ytd_cost)} year to date`,
            badge: `avg TZS ${fmt(stats.avg_cost)}`, badgeColor: 'gray',
            accent: ['#1565C0', '#2196F3'],
        },
        {
            icon: '💰', label: 'This Month Cost',
            value: `TZS ${fmt(stats.month_cost)}`,
            sub: 'spent this month',
            badge: `${new Date().toLocaleDateString('en-US', { month: 'short' })}`, badgeColor: 'blue',
            accent: ['#065F46', '#059669'],
        },
        {
            icon: '📅', label: 'Upcoming (≤30d)',
            value: fmt(stats.upcoming_count),
            sub: 'services due within 30 days',
            badge: (stats.upcoming_count ?? 0) > 0 ? 'Plan ahead' : 'Clear',
            badgeColor: (stats.upcoming_count ?? 0) > 0 ? 'yellow' : 'green',
            accent: ['#92400E', '#F59E0B'],
        },
        {
            icon: '⚠️', label: 'Overdue',
            value: fmt(stats.overdue_count),
            sub: 'past their next service date',
            badge: (stats.overdue_count ?? 0) > 0 ? 'Act now' : 'OK',
            badgeColor: (stats.overdue_count ?? 0) > 0 ? 'red' : 'green',
            accent: ['#7F1D1D', '#DC2626'],
        },
    ];

    const maxTypeCost = Math.max(...byType.map(t => t.cost), 1);
    const totalCost   = monthlyTrend.reduce((s, d) => s + d.cost, 0);

    return (
        <DashboardLayout title="Maintenance Dashboard">
            <Head title="Maintenance Dashboard" />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Group justify="space-between" align="flex-end" mb={28} wrap="wrap" gap="md">
                    <Stack gap={3}>
                        <Text size="xs" fw={500} style={{ color: textMut, letterSpacing: 0.3 }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                        <Title order={2} style={{ color: textPri, fontWeight: 800, lineHeight: 1.2 }}>
                            Maintenance{' '}
                            <Text component="span" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                Overview
                            </Text>
                        </Title>
                        <Text size="sm" style={{ color: textSec }}>Service costs, upcoming work and fleet maintenance health.</Text>
                    </Stack>
                    <Box component={Link} href="/system/maintenance" style={{ textDecoration: 'none' }}>
                        <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="lg" radius="xl"
                            style={isDark ? { background: 'var(--c-border-input)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                            View all records →
                        </Badge>
                    </Box>
                </Group>
            </motion.div>

            {/* KPI Cards */}
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

            {/* 12-month cost chart */}
            {monthlyTrend.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Box mb={24} style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>📊</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Maintenance Cost — Last 12 Months</Text>
                            </Group>
                            <Text size="xs" style={{ color: textMut }}>Total: <strong style={{ color: '#F59E0B' }}>TZS {fmt(totalCost)}</strong></Text>
                        </Group>
                        <Box style={{ padding: '16px 22px' }}>
                            <CostChart data={monthlyTrend} isDark={isDark} />
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Cost by Type + Upcoming Services */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">

                {/* Cost by Service Type */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>🧰</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Cost by Service Type</Text>
                            </Group>
                        </Group>
                        {byType.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>No service records yet.</Text>
                            </Box>
                        ) : (
                            <Box style={{ padding: '16px 22px' }}>
                                <Stack gap={10}>
                                    {byType.map((t) => {
                                        const pct = Math.round((t.cost / maxTypeCost) * 100);
                                        return (
                                            <Box key={t.type}>
                                                <Group justify="space-between" mb={3}>
                                                    <Text size="xs" style={{ color: textSec }}>{t.type}</Text>
                                                    <Group gap={8}>
                                                        <Text size="xs" style={{ color: textMut }}>{t.count}×</Text>
                                                        <Text size="xs" fw={700} style={{ color: textPri }}>TZS {fmt(t.cost)}</Text>
                                                    </Group>
                                                </Group>
                                                <Box style={{ height: 5, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }}>
                                                    <Box style={{ height: 5, borderRadius: 3, width: `${pct}%`, background: '#F59E0B', transition: 'width 0.6s ease' }} />
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </motion.div>

                {/* Upcoming Services */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>📅</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Upcoming Services</Text>
                            </Group>
                        </Group>
                        {upcomingServices.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>No upcoming services scheduled.</Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {upcomingServices.map((u, i) => {
                                    const overdue = u.days_left < 0;
                                    const soon    = u.days_left >= 0 && u.days_left <= 14;
                                    const dColor  = overdue ? '#EF4444' : soon ? '#F59E0B' : '#22C55E';
                                    const dLabel  = overdue ? `${Math.abs(u.days_left)}d overdue` : u.days_left === 0 ? 'Today' : `${u.days_left}d left`;
                                    return (
                                        <Box key={u.id} style={{ padding: '12px 22px', borderBottom: i < upcomingServices.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <Group justify="space-between" wrap="nowrap">
                                                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                                    <Text fw={700} size="sm" style={{ color: textPri, fontFamily: 'monospace', flexShrink: 0 }}>{u.vehicle_plate || '—'}</Text>
                                                    <Text size="sm" style={{ color: textSec }} truncate>{u.service_type}</Text>
                                                </Group>
                                                <Box style={{ background: dColor + '20', border: `1px solid ${dColor}40`, borderRadius: 20, padding: '2px 10px', flexShrink: 0 }}>
                                                    <Text size="xs" fw={700} style={{ color: dColor }}>{dLabel}</Text>
                                                </Box>
                                            </Group>
                                            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>Due {u.next_service_date}</Text>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </motion.div>
            </SimpleGrid>

            {/* Recent Services + Top Vehicles */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="xl">

                {/* Recent Services */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>🔧</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Recent Services</Text>
                            </Group>
                            <Box component={Link} href="/system/maintenance" style={{ textDecoration: 'none', color: '#60A5FA', fontSize: 13, fontWeight: 600 }}>View all →</Box>
                        </Group>
                        {recentServices.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>No service records yet.</Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {recentServices.map((r, i) => (
                                    <Box key={r.id} style={{ padding: '12px 22px', borderBottom: i < recentServices.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Group justify="space-between" wrap="nowrap" mb={3}>
                                            <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                                <Text fw={700} size="sm" style={{ color: textPri, fontFamily: 'monospace', flexShrink: 0 }}>{r.vehicle_plate || '—'}</Text>
                                                <Text size="sm" style={{ color: textSec }} truncate>{r.service_type}</Text>
                                            </Group>
                                            <Text size="sm" fw={700} style={{ color: textPri, flexShrink: 0 }}>{r.currency || 'TZS'} {fmt(r.cost)}</Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="xs" style={{ color: textMut }}>{r.workshop_name || 'No workshop'}</Text>
                                            <Text size="xs" style={{ color: textMut }}>{r.service_date}</Text>
                                        </Group>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </motion.div>

                {/* Top Vehicles by Cost */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>🚚</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Top Vehicles by Cost</Text>
                            </Group>
                        </Group>
                        {topVehicles.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>No service records yet.</Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {topVehicles.map((v, i) => (
                                    <Box key={i} style={{ padding: '12px 22px', borderBottom: i < topVehicles.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Group justify="space-between" wrap="nowrap">
                                            <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                                <Text fw={700} size="sm" style={{ color: textPri, fontFamily: 'monospace' }}>{v.vehicle_plate || '—'}</Text>
                                                <Box style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 4, padding: '1px 7px' }}>
                                                    <Text size="10px" fw={600} style={{ color: textSec }}>{v.services_count} service{v.services_count === 1 ? '' : 's'}</Text>
                                                </Box>
                                            </Group>
                                            <Text size="sm" fw={700} style={{ color: '#F59E0B', flexShrink: 0 }}>TZS {fmt(v.total_cost)}</Text>
                                        </Group>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </motion.div>
            </SimpleGrid>
        </DashboardLayout>
    );
}
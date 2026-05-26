import { Head, usePage, Link } from '@inertiajs/react';
import { Box, Title, Text, SimpleGrid, Group, Stack, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { formatDate } from '../../../lib/date';

const dk = {
    card: '#0F1E32', cardHov: '#132436', border: 'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)',
};

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(n ?? 0));

function RevenueChart({ data, isDark }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textMut = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const maxVal  = Math.max(...data.map(d => Math.max(d.revenue, d.costs)), 1);
    const H = 100, W = 560, barW = 26, gap = 10;
    const totalW = data.length * (barW * 2 + gap + 8);

    return (
        <Box style={{ overflowX: 'auto' }}>
            <svg width="100%" viewBox={`0 0 ${totalW} ${H + 28}`} preserveAspectRatio="none" style={{ minWidth: 320 }}>
                {data.map((d, i) => {
                    const x = i * (barW * 2 + gap + 8);
                    const rH = Math.max((d.revenue / maxVal) * H, 2);
                    const cH = Math.max((d.costs / maxVal) * H, 2);
                    return (
                        <g key={i}>
                            <rect x={x} y={H - rH} width={barW} height={rH} rx={3} fill="#3B82F6" opacity={0.85} />
                            <rect x={x + barW + 3} y={H - cH} width={barW} height={cH} rx={3} fill="#EF4444" opacity={0.75} />
                            <text x={x + barW} y={H + 14} textAnchor="middle" fontSize={9} fill={textMut}>{d.month}</text>
                        </g>
                    );
                })}
            </svg>
            <Group gap={16} mt={4}>
                <Group gap={5}><Box style={{ width: 10, height: 10, borderRadius: 2, background: '#3B82F6' }} /><Text size="xs" style={{ color: textSec }}>Revenue</Text></Group>
                <Group gap={5}><Box style={{ width: 10, height: 10, borderRadius: 2, background: '#EF4444' }} /><Text size="xs" style={{ color: textSec }}>Costs</Text></Group>
            </Group>
        </Box>
    );
}

export default function TripsDashboard() {
    const { props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const {
        stats = {}, statuses = {}, statusBreakdown = [],
        monthlyTrend = [], topRoutes = [], recentTrips = [],
    } = props;

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? `1px solid ${dk.border}` : '1px solid #E2E8F0';
    const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)';
    const divider    = isDark ? `1px solid ${dk.divider}` : '1px solid #F1F5F9';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const rowHovBg   = isDark ? dk.cardHov : '#F8FAFC';

    const revPct = stats.revenue_change_pct;
    const revBadge = revPct === null || revPct === undefined ? '—' : `${revPct >= 0 ? '+' : ''}${revPct}%`;
    const revColor = revPct === null || revPct === undefined ? 'gray' : revPct >= 0 ? 'green' : 'red';

    const statCards = [
        {
            icon: '🚛', label: 'Total Trips',
            value: String(stats.total ?? 0),
            sub: `avg freight TZS ${fmt(stats.avg_freight)}`,
            badge: `${stats.completed ?? 0} done`, badgeColor: 'teal',
            accent: ['#1565C0', '#2196F3'],
        },
        {
            icon: '🛣️', label: 'Active Trips',
            value: String(stats.active ?? 0),
            sub: 'loading, in transit, at border',
            badge: `${stats.cancelled ?? 0} cancelled`, badgeColor: 'red',
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
            icon: '📈', label: 'Total Profit (YTD)',
            value: `TZS ${fmt(stats.total_profit)}`,
            sub: 'completed & delivered this year',
            badge: (stats.total_profit ?? 0) >= 0 ? 'Profit' : 'Loss',
            badgeColor: (stats.total_profit ?? 0) >= 0 ? 'green' : 'red',
            accent: ['#6D28D9', '#8B5CF6'],
        },
    ];

    return (
        <DashboardLayout title="Trips Dashboard">
            <Head title="Trips Dashboard" />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Group justify="space-between" align="flex-end" mb={28} wrap="wrap" gap="md">
                    <Stack gap={3}>
                        <Text size="xs" fw={500} style={{ color: textMut, letterSpacing: 0.3 }}>ANALYTICS OVERVIEW</Text>
                        <Title order={2} style={{ color: textPri, fontWeight: 800, lineHeight: 1.2 }}>
                            Trips{' '}
                            <Text component="span" style={{ background: 'linear-gradient(135deg, #1565C0, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                Overview
                            </Text>
                        </Title>
                        <Text size="sm" style={{ color: textSec }}>Performance, revenue and route insights across all trips.</Text>
                    </Stack>
                    <Box component={Link} href="/system/trips" style={{ textDecoration: 'none' }}>
                        <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="lg" radius="xl"
                            style={isDark ? { background: 'var(--c-border-input)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                            View all trips →
                        </Badge>
                    </Box>
                </Group>
            </motion.div>

            {/* KPI Stats */}
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

            {/* Status breakdown */}
            {statusBreakdown.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Box mb={24} style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} gap="sm">
                            <Text style={{ fontSize: '1.1rem' }}>🚦</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Status Breakdown</Text>
                        </Group>
                        <Group gap={12} style={{ padding: '16px 22px' }} wrap="wrap">
                            {statusBreakdown.map((s) => (
                                <Box key={s.status} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: s.color + '1A', border: `1px solid ${s.color}40`, borderRadius: 20, padding: '6px 14px' }}>
                                    <Box style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                    <Text size="xs" fw={600} style={{ color: s.color }}>{s.label}</Text>
                                    <Text size="xs" fw={800} style={{ color: textPri }}>{s.count}</Text>
                                </Box>
                            ))}
                        </Group>
                    </Box>
                </motion.div>
            )}

            {/* Revenue vs Costs chart */}
            {monthlyTrend.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Box mb={24} style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>📊</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Revenue vs Costs — Last 12 Months</Text>
                            </Group>
                            {(() => {
                                const totalRev  = monthlyTrend.reduce((s, d) => s + d.revenue, 0);
                                const totalCost = monthlyTrend.reduce((s, d) => s + d.costs, 0);
                                const profit    = totalRev - totalCost;
                                return (
                                    <Group gap={12}>
                                        <Text size="xs" style={{ color: textMut }}>Rev: <strong style={{ color: '#3B82F6' }}>TZS {fmt(totalRev)}</strong></Text>
                                        <Text size="xs" style={{ color: textMut }}>Cost: <strong style={{ color: '#EF4444' }}>TZS {fmt(totalCost)}</strong></Text>
                                        <Text size="xs" style={{ color: textMut }}>Profit: <strong style={{ color: profit >= 0 ? '#22C55E' : '#EF4444' }}>TZS {fmt(profit)}</strong></Text>
                                    </Group>
                                );
                            })()}
                        </Group>
                        <Box style={{ padding: '16px 22px' }}>
                            <RevenueChart data={monthlyTrend} isDark={isDark} />
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Top Routes + Recent Trips */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">

                {/* Top Routes */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} gap="sm">
                            <Text style={{ fontSize: '1.1rem' }}>🗺️</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Top Routes</Text>
                        </Group>
                        {topRoutes.length === 0 ? (
                            <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
                                <Text size="sm" style={{ color: textMut }}>No route data yet.</Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {topRoutes.map((r, i) => (
                                    <Box key={r.route} style={{ padding: '13px 22px', borderBottom: i < topRoutes.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Group justify="space-between" wrap="nowrap">
                                            <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
                                                <Box style={{ width: 24, height: 24, borderRadius: 7, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Text size="11px" fw={800} style={{ color: textSec }}>{i + 1}</Text>
                                                </Box>
                                                <Text size="sm" fw={600} style={{ color: textPri }} truncate>{r.route}</Text>
                                            </Group>
                                            <Group gap={14} wrap="nowrap" style={{ flexShrink: 0 }}>
                                                <Text size="xs" style={{ color: textMut }}>{r.trips} trips</Text>
                                                <Text size="sm" fw={700} style={{ color: textPri }}>TZS {fmt(r.revenue)}</Text>
                                            </Group>
                                        </Group>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </motion.div>

                {/* Recent Trips */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                            <Group gap="sm">
                                <Text style={{ fontSize: '1.1rem' }}>🚛</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Recent Trips</Text>
                            </Group>
                            <Box component={Link} href="/system/trips" style={{ textDecoration: 'none' }}>
                                <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                    style={isDark ? { background: 'var(--c-border-input)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)', cursor: 'pointer' } : { cursor: 'pointer' }}>
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
                                    const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
                                    return (
                                        <Box key={trip.id} component={Link} href={`/system/trips/${trip.id}`}
                                            style={{ display: 'block', textDecoration: 'none', padding: '13px 22px', borderBottom: i < recentTrips.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <Group justify="space-between" mb={5} wrap="nowrap">
                                                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                                    <Text size="xs" fw={600} style={{ color: textMut, flexShrink: 0, fontFamily: 'monospace' }}>{trip.trip_number}</Text>
                                                    <Text size="sm" fw={600} style={{ color: textPri }} truncate>{trip.route_from} → {trip.route_to}</Text>
                                                </Group>
                                                <Box style={{ background: meta.color + '22', border: `1px solid ${meta.color}44`, borderRadius: 20, padding: '2px 10px', flexShrink: 0 }}>
                                                    <Text size="10px" fw={700} style={{ color: meta.color, letterSpacing: 0.5, textTransform: 'uppercase' }}>{meta.label}</Text>
                                                </Box>
                                            </Group>
                                            <Group justify="space-between" wrap="nowrap">
                                                <Text size="xs" style={{ color: textSec }} truncate>{trip.driver_name} · {trip.vehicle_plate}</Text>
                                                <Group gap={10} wrap="nowrap" style={{ flexShrink: 0 }}>
                                                    <Text size="xs" fw={700} style={{ color: textPri }}>TZS {fmt(trip.freight_amount)}</Text>
                                                    <Text size="xs" style={{ color: textMut }}>{formatDate(trip.departure_date)}</Text>
                                                </Group>
                                            </Group>
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
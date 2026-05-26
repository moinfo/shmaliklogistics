import { Head, Link, usePage } from '@inertiajs/react';
import { Box, Title, Text, SimpleGrid, Group, Stack, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { formatDate } from '../../../lib/date';

const dk = {
    card: '#0F1E32', cardHov: '#132436', border: 'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)',
};

const BRAND = 'linear-gradient(135deg,#1565C0,#2196F3)';

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n ?? 0)));

function TrendChart({ data, isDark }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textMut = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const maxVal = Math.max(...data.map(d => Math.max(Number(d.billed ?? 0), Number(d.collected ?? 0), Number(d.expenses ?? 0))), 1);
    const H = 110;
    const series = [
        { key: 'billed', color: '#3B82F6', opacity: 0.85, label: 'Billed' },
        { key: 'collected', color: '#22C55E', opacity: 0.85, label: 'Collected' },
        { key: 'expenses', color: '#EF4444', opacity: 0.75, label: 'Expenses' },
    ];
    const barW = 9, innerGap = 3, groupGap = 14;
    const groupW = series.length * barW + (series.length - 1) * innerGap;
    const totalW = data.length * (groupW + groupGap);

    return (
        <Box style={{ overflowX: 'auto' }}>
            <svg width="100%" viewBox={`0 0 ${totalW} ${H + 26}`} preserveAspectRatio="none" style={{ minWidth: 360 }}>
                {data.map((d, i) => {
                    const gx = i * (groupW + groupGap);
                    return (
                        <g key={i}>
                            {series.map((s, j) => {
                                const v = Number(d[s.key] ?? 0);
                                const bh = Math.max((v / maxVal) * H, 2);
                                const x = gx + j * (barW + innerGap);
                                return <rect key={s.key} x={x} y={H - bh} width={barW} height={bh} rx={2} fill={s.color} opacity={s.opacity} />;
                            })}
                            <text x={gx + groupW / 2} y={H + 14} textAnchor="middle" fontSize={9} fill={textMut}>{d.month}</text>
                        </g>
                    );
                })}
            </svg>
            <Group gap={16} mt={6}>
                {series.map(s => (
                    <Group key={s.key} gap={5}>
                        <Box style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                        <Text size="xs" style={{ color: textSec }}>{s.label}</Text>
                    </Group>
                ))}
            </Group>
        </Box>
    );
}

export default function RealEstateDashboard() {
    const { props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const {
        stats = {},
        monthlyTrend = [],
        occupancyByProperty = [],
        recentPayments = [],
        expiringLeases = [],
        topArrears = [],
    } = props;

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? `1px solid ${dk.border}` : '1px solid #E2E8F0';
    const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)';
    const divider    = isDark ? `1px solid ${dk.divider}` : '1px solid #F1F5F9';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const rowHovBg   = isDark ? dk.cardHov : '#F8FAFC';
    const trackBg    = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';

    const occPct = Number(stats.occupancy_pct ?? 0);

    const statCards = [
        {
            icon: '🏢', label: 'Properties',
            value: String(stats.properties_total ?? 0),
            sub: `${stats.units_total ?? 0} total units`,
            badge: `${stats.units_total ?? 0} units`, badgeColor: 'blue',
            accent: ['#1565C0', '#2196F3'],
        },
        {
            icon: '🚪', label: 'Units',
            value: String(stats.units_total ?? 0),
            sub: `${stats.units_occupied ?? 0} occupied · ${stats.units_vacant ?? 0} vacant`,
            badge: `${stats.units_vacant ?? 0} vacant`,
            badgeColor: (stats.units_vacant ?? 0) > 0 ? 'orange' : 'green',
            accent: ['#0E4FA0', '#3B82F6'],
        },
        {
            icon: '📊', label: 'Occupancy',
            value: `${occPct}%`,
            sub: `${stats.units_occupied ?? 0} of ${stats.units_total ?? 0} occupied`,
            badge: occPct >= 85 ? 'Healthy' : occPct >= 60 ? 'Fair' : 'Low',
            badgeColor: occPct >= 85 ? 'green' : occPct >= 60 ? 'yellow' : 'red',
            accent: ['#065F46', '#059669'],
        },
        {
            icon: '👥', label: 'Active Tenants',
            value: String(stats.tenants_active ?? 0),
            sub: 'currently leasing',
            badge: `${stats.tenants_active ?? 0}`, badgeColor: 'teal',
            accent: ['#4C1D95', '#7C3AED'],
        },
        {
            icon: '💰', label: 'Monthly Rent Roll',
            value: `TZS ${fmt(stats.monthly_rent_roll)}`,
            sub: 'expected gross / month',
            badge: 'Roll', badgeColor: 'blue',
            accent: ['#1565C0', '#2196F3'],
        },
        {
            icon: '✅', label: 'Collected This Month',
            value: `TZS ${fmt(stats.rent_collected_month)}`,
            sub: stats.monthly_rent_roll > 0
                ? `${Math.round((Number(stats.rent_collected_month ?? 0) / Number(stats.monthly_rent_roll)) * 100)}% of roll`
                : 'No roll this month',
            badge: 'Paid', badgeColor: 'green',
            accent: ['#065F46', '#059669'],
        },
        {
            icon: '⚠️', label: 'Outstanding',
            value: `TZS ${fmt(stats.outstanding)}`,
            sub: 'unpaid rent balance',
            badge: (stats.outstanding ?? 0) > 0 ? 'Owed' : 'Clear',
            badgeColor: (stats.outstanding ?? 0) > 0 ? 'red' : 'green',
            accent: ['#7F1D1D', '#DC2626'],
            valueColor: '#EF4444',
        },
        {
            icon: '📭', label: 'Overdue Invoices',
            value: String(stats.overdue_count ?? 0),
            sub: 'past due date',
            badge: (stats.overdue_count ?? 0) > 0 ? 'Act now' : 'OK',
            badgeColor: (stats.overdue_count ?? 0) > 0 ? 'red' : 'green',
            accent: ['#92400E', '#F59E0B'],
        },
        {
            icon: '🔧', label: 'Under Renovation',
            value: String(stats.under_renovation ?? 0),
            sub: 'units out of service',
            badge: `${stats.under_renovation ?? 0}`,
            badgeColor: (stats.under_renovation ?? 0) > 0 ? 'orange' : 'green',
            accent: ['#9A3412', '#F97316'],
        },
        {
            icon: '🧱', label: 'Renovation Spend YTD',
            value: `TZS ${fmt(stats.renovation_spend_ytd)}`,
            sub: 'year to date',
            badge: 'YTD', badgeColor: 'grape',
            accent: ['#4C1D95', '#7C3AED'],
        },
    ];

    const daysBadgeColor = (d) => (d <= 7 ? 'red' : d <= 30 ? 'yellow' : 'blue');

    const SectionCard = ({ icon, title, right, children, delay = 0, fromX = 0 }) => (
        <motion.div initial={{ opacity: 0, x: fromX, y: fromX === 0 ? 16 : 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay }}>
            <Box style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, height: '100%' }}>
                <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                    <Group gap="sm">
                        <Text style={{ fontSize: '1.1rem' }}>{icon}</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                    </Group>
                    {right}
                </Group>
                {children}
            </Box>
        </motion.div>
    );

    const EmptyState = ({ label = 'No data yet' }) => (
        <Box style={{ padding: '32px 22px', textAlign: 'center' }}>
            <Text size="sm" style={{ color: textMut }}>{label}</Text>
        </Box>
    );

    return (
        <DashboardLayout title="Real Estate Dashboard">
            <Head title="Real Estate" />

            {/* Header strip */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Group justify="space-between" align="flex-end" mb={28} wrap="wrap" gap="md">
                    <Stack gap={3}>
                        <Text size="xs" fw={500} style={{ color: textMut, letterSpacing: 0.3 }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                        <Title order={2} style={{ color: textPri, fontWeight: 800, lineHeight: 1.2 }}>
                            Real Estate{' '}
                            <Text component="span" style={{ background: 'linear-gradient(135deg, #1565C0, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                Overview
                            </Text>
                        </Title>
                        <Text size="sm" style={{ color: textSec }}>Properties, occupancy, rent collection and arrears at a glance.</Text>
                    </Stack>
                    <Group gap="sm" wrap="wrap">
                        {[
                            ['#3B82F6', `${stats.units_occupied ?? 0} Occupied`],
                            ['#F59E0B', `${stats.units_vacant ?? 0} Vacant`],
                            ['#EF4444', `${stats.overdue_count ?? 0} Overdue`],
                        ].map(([dot, label]) => (
                            <Group key={label} gap={7} style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff', border: isDark ? `1px solid ${dk.divider}` : '1px solid #E2E8F0', borderRadius: 20, padding: '6px 14px' }}>
                                <Box style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />
                                <Text size="xs" fw={500} style={{ color: textPri }}>{label}</Text>
                            </Group>
                        ))}
                    </Group>
                </Group>
            </motion.div>

            {/* KPI Stats */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4, xl: 5 }} spacing="lg" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
                                <Text fw={900} style={{ fontSize: '1.55rem', lineHeight: 1.1, color: s.valueColor || textPri, marginBottom: 4 }}>{s.value}</Text>
                                <Text fw={600} size="sm" style={{ color: isDark ? '#60A5FA' : s.accent[1], marginBottom: 4 }}>{s.label}</Text>
                                <Text size="xs" style={{ color: textMut }}>{s.sub}</Text>
                            </Box>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* 12-month trend */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Box mb={24} style={{ background: cardBg, border: cardBorder, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Group style={{ padding: '16px 22px', borderBottom: divider }} justify="space-between">
                        <Group gap="sm">
                            <Text style={{ fontSize: '1.1rem' }}>📈</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Billed vs Collected vs Expenses — Last 12 Months</Text>
                        </Group>
                        {monthlyTrend.length > 0 && (() => {
                            const tBilled = monthlyTrend.reduce((s, d) => s + Number(d.billed ?? 0), 0);
                            const tColl = monthlyTrend.reduce((s, d) => s + Number(d.collected ?? 0), 0);
                            const tExp = monthlyTrend.reduce((s, d) => s + Number(d.expenses ?? 0), 0);
                            return (
                                <Group gap={12}>
                                    <Text size="xs" style={{ color: textMut }}>Billed: <strong style={{ color: '#3B82F6' }}>TZS {fmt(tBilled)}</strong></Text>
                                    <Text size="xs" style={{ color: textMut }}>Collected: <strong style={{ color: '#22C55E' }}>TZS {fmt(tColl)}</strong></Text>
                                    <Text size="xs" style={{ color: textMut }}>Expenses: <strong style={{ color: '#EF4444' }}>TZS {fmt(tExp)}</strong></Text>
                                </Group>
                            );
                        })()}
                    </Group>
                    {monthlyTrend.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <Box style={{ padding: '16px 22px' }}>
                            <TrendChart data={monthlyTrend} isDark={isDark} />
                        </Box>
                    )}
                </Box>
            </motion.div>

            {/* Occupancy by Property + Lease Expiries */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb={24}>

                {/* Occupancy by Property */}
                <SectionCard
                    icon="🏘️"
                    title="Occupancy by Property"
                    delay={0.4}
                    fromX={-20}
                    right={
                        <Box component={Link} href="/system/real-estate/properties" style={{ textDecoration: 'none' }}>
                            <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                style={isDark ? { background: 'var(--c-border-input)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                                View all →
                            </Badge>
                        </Box>
                    }
                >
                    {occupancyByProperty.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <Stack gap={0}>
                            {occupancyByProperty.map((p, i) => {
                                const pct = Number(p.occupancy_pct ?? 0);
                                const barColor = pct >= 85 ? '#22C55E' : pct >= 60 ? '#F59E0B' : '#EF4444';
                                return (
                                    <Box key={p.id} style={{ padding: '13px 22px', borderBottom: i < occupancyByProperty.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Group justify="space-between" mb={5} wrap="nowrap">
                                            <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                                <Text size="sm" fw={600} style={{ color: textPri }} truncate>{p.name}</Text>
                                                <Box style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 4, padding: '1px 7px', flexShrink: 0 }}>
                                                    <Text size="10px" fw={600} style={{ color: textSec }}>{p.type}</Text>
                                                </Box>
                                            </Group>
                                            <Text size="xs" fw={600} style={{ color: textMut, flexShrink: 0 }}>{p.occupied_units}/{p.total_units}</Text>
                                        </Group>
                                        <Group justify="space-between" mb={6}>
                                            <Text size="xs" style={{ color: textSec }}>TZS {fmt(p.monthly_roll)} / month</Text>
                                            <Text size="xs" fw={700} style={{ color: barColor }}>{pct}%</Text>
                                        </Group>
                                        <Box style={{ height: 5, borderRadius: 3, background: trackBg }}>
                                            <Box style={{ height: 5, borderRadius: 3, width: `${Math.min(pct, 100)}%`, background: barColor, transition: 'width 0.6s ease' }} />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </SectionCard>

                {/* Lease Expiries */}
                <SectionCard
                    icon="📅"
                    title="Lease Expiries (next 60 days)"
                    delay={0.45}
                    fromX={20}
                    right={
                        <Box component={Link} href="/system/real-estate/leases" style={{ textDecoration: 'none' }}>
                            <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                style={isDark ? { background: 'var(--c-border-input)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                                {expiringLeases.length} expiring →
                            </Badge>
                        </Box>
                    }
                >
                    {expiringLeases.length === 0 ? (
                        <EmptyState label="No leases expiring soon" />
                    ) : (
                        <Stack gap={0}>
                            {expiringLeases.map((l, i) => (
                                <Box key={l.id} style={{ padding: '13px 22px', borderBottom: i < expiringLeases.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <Group justify="space-between" mb={4} wrap="nowrap">
                                        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                            <Box component={Link} href={`/system/real-estate/leases/${l.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                                                <Text size="xs" fw={700} style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{l.lease_number}</Text>
                                            </Box>
                                            <Text size="sm" fw={600} style={{ color: textPri }} truncate>{l.tenant_name}</Text>
                                        </Group>
                                        <Badge size="sm" variant="light" color={daysBadgeColor(Number(l.days_left ?? 0))} radius="xl" style={{ fontWeight: 700, flexShrink: 0 }}>
                                            {Number(l.days_left ?? 0)}d left
                                        </Badge>
                                    </Group>
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text size="xs" style={{ color: textSec }} truncate>{l.property_label}</Text>
                                        <Text size="xs" style={{ color: textMut, flexShrink: 0 }}>{formatDate(l.end_date)}</Text>
                                    </Group>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </SectionCard>
            </SimpleGrid>

            {/* Recent Payments + Top Arrears */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">

                {/* Recent Rent Payments */}
                <SectionCard
                    icon="🧾"
                    title="Recent Rent Payments"
                    delay={0.5}
                    fromX={-20}
                    right={
                        <Box component={Link} href="/system/real-estate/rent" style={{ textDecoration: 'none' }}>
                            <Badge color="blue" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                style={isDark ? { background: 'var(--c-border-input)', color: '#60A5FA', border: '1px solid rgba(33,150,243,0.3)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                                View all →
                            </Badge>
                        </Box>
                    }
                >
                    {recentPayments.length === 0 ? (
                        <EmptyState label="No payments recorded yet" />
                    ) : (
                        <Stack gap={0}>
                            {recentPayments.map((p, i) => (
                                <Box key={p.id} style={{ padding: '13px 22px', borderBottom: i < recentPayments.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <Group justify="space-between" mb={4} wrap="nowrap">
                                        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                            {p.invoice_number && (
                                                <Text size="xs" fw={600} style={{ color: textMut, fontFamily: 'monospace', flexShrink: 0 }}>{p.invoice_number}</Text>
                                            )}
                                            <Text size="sm" fw={600} style={{ color: textPri }} truncate>{p.tenant_name}</Text>
                                        </Group>
                                        <Text size="sm" fw={700} style={{ color: '#22C55E', flexShrink: 0 }}>{p.currency || 'TZS'} {fmt(p.amount)}</Text>
                                    </Group>
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text size="xs" style={{ color: textSec }} truncate>{p.property_label}</Text>
                                        <Group gap={8} style={{ flexShrink: 0 }}>
                                            {p.payment_method && (
                                                <Box style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 4, padding: '1px 7px' }}>
                                                    <Text size="10px" fw={600} style={{ color: textSec }}>{p.payment_method}</Text>
                                                </Box>
                                            )}
                                            <Text size="xs" style={{ color: textMut }}>{formatDate(p.payment_date)}</Text>
                                        </Group>
                                    </Group>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </SectionCard>

                {/* Top Arrears */}
                <SectionCard
                    icon="📉"
                    title="Top Arrears"
                    delay={0.55}
                    fromX={20}
                    right={
                        <Box component={Link} href="/system/real-estate/reports" style={{ textDecoration: 'none' }}>
                            <Badge color="red" variant={isDark ? 'filled' : 'light'} size="sm" radius="xl"
                                style={isDark ? { background: 'rgba(239,68,68,0.18)', color: '#F87171', border: '1px solid rgba(239,68,68,0.35)', cursor: 'pointer' } : { cursor: 'pointer' }}>
                                {topArrears.length} tenants →
                            </Badge>
                        </Box>
                    }
                >
                    {topArrears.length === 0 ? (
                        <EmptyState label="No arrears — all settled" />
                    ) : (
                        <Stack gap={0}>
                            {topArrears.map((a, i) => (
                                <Box key={`${a.tenant_name}-${i}`} style={{ padding: '13px 22px', borderBottom: i < topArrears.length - 1 ? divider : 'none', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <Group justify="space-between" mb={4} wrap="nowrap">
                                        <Text size="sm" fw={600} style={{ color: textPri }} truncate>{a.tenant_name}</Text>
                                        <Text size="sm" fw={700} style={{ color: '#EF4444', flexShrink: 0 }}>TZS {fmt(a.outstanding_tzs)}</Text>
                                    </Group>
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text size="xs" style={{ color: textSec }} truncate>{a.property_label}</Text>
                                        <Badge size="sm" variant="light" color={Number(a.days_overdue ?? 0) >= 60 ? 'red' : 'orange'} radius="xl" style={{ fontWeight: 700, flexShrink: 0 }}>
                                            {Number(a.days_overdue ?? 0)}d overdue
                                        </Badge>
                                    </Group>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </SectionCard>
            </SimpleGrid>
        </DashboardLayout>
    );
}
import { Head, usePage, Link } from '@inertiajs/react';
import { Box, Title, Text, SimpleGrid, Group, Stack, Progress } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';

const STATUS_PROGRESS = { planned: 5, loading: 15, in_transit: 60, at_border: 80, delivered: 100, completed: 100, cancelled: 0 };
const STATUS_COLOR    = { planned: '#A78BFA', loading: '#F59E0B', in_transit: '#3B82F6', at_border: '#F97316', delivered: '#22C55E', completed: '#10B981', cancelled: '#EF4444' };
const STATUS_LABEL    = { planned: 'Planned', loading: 'Loading', in_transit: 'In Transit', at_border: 'At Border', delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled' };
const FLEET_COLORS    = { active: '#22C55E', on_road: '#3B82F6', at_border: '#F59E0B', loading: '#A78BFA', idle: '#94A3B8', maintenance: '#EF4444', retired: '#475569' };

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(n ?? 0));

const quickActions = [
    { icon: '🚛', label: 'New Trip',    desc: 'Create a booking',  grad: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', glow: 'rgba(59,130,246,0.35)',  href: '/system/trips/create' },
    { icon: '🚗', label: 'Add Vehicle', desc: 'Register vehicle',  grad: 'linear-gradient(135deg,#0369A1,#06B6D4)', glow: 'rgba(6,182,212,0.35)',   href: '/system/fleet/create' },
    { icon: '🛂', label: 'New Permit',  desc: 'Apply for permit',  grad: 'linear-gradient(135deg,#065F46,#10B981)', glow: 'rgba(16,185,129,0.35)',  href: '/system/permits/create' },
    { icon: '👤', label: 'New Driver',  desc: 'Register driver',   grad: 'linear-gradient(135deg,#6D28D9,#A78BFA)', glow: 'rgba(167,139,250,0.35)', href: '/system/drivers/create' },
];

// Decorative wave SVG for stat cards
function CardWave({ color }) {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.15, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function RevenueChart({ data, isDark }) {
    const textMut = isDark ? 'rgba(255,255,255,0.35)' : '#94A3B8';
    const maxVal  = Math.max(...data.map(d => Math.max(d.revenue, d.expenses)), 1);
    const H = 120, barW = 22, gap = 6;
    const totalW = data.length * (barW * 2 + gap + 10);

    return (
        <Box style={{ overflowX: 'auto' }}>
            <svg width="100%" viewBox={`0 0 ${totalW} ${H + 30}`} preserveAspectRatio="none" style={{ minWidth: 320 }}>
                <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FCA5A5" />
                        <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                </defs>
                {data.map((d, i) => {
                    const x = i * (barW * 2 + gap + 10);
                    const rH = Math.max((d.revenue / maxVal) * H, 3);
                    const eH = Math.max((d.expenses / maxVal) * H, 3);
                    return (
                        <g key={i}>
                            <rect x={x} y={H - rH} width={barW} height={rH} rx={5} fill="url(#rev)" />
                            <rect x={x + barW + 4} y={H - eH} width={barW} height={eH} rx={5} fill="url(#exp)" />
                            <text x={x + barW} y={H + 18} textAnchor="middle" fontSize={8} fill={textMut}>{d.month}</text>
                        </g>
                    );
                })}
            </svg>
            <Group gap={20} mt={8}>
                <Group gap={6}><Box style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg,#60A5FA,#1D4ED8)' }} /><Text size="xs" c="dimmed">Revenue</Text></Group>
                <Group gap={6}><Box style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg,#FCA5A5,#DC2626)' }} /><Text size="xs" c="dimmed">Expenses</Text></Group>
            </Group>
        </Box>
    );
}

// Card section header component
function CardHeader({ icon, title, sub, linkHref, linkLabel, accentColor }) {
    return (
        <Group justify="space-between" align="center" style={{ padding: '18px 22px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Group gap={12}>
                <Box style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: accentColor + '15',
                    border: `1.5px solid ${accentColor}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                }}>
                    {icon}
                </Box>
                <Stack gap={1}>
                    <Text fw={700} size="sm">{title}</Text>
                    <Text size="xs" c="dimmed">{sub}</Text>
                </Stack>
            </Group>
            {linkHref && (
                <Box component={Link} href={linkHref} style={{
                    textDecoration: 'none',
                    background: accentColor + '12',
                    border: `1px solid ${accentColor}30`,
                    borderRadius: 20, padding: '5px 14px',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <Text size="xs" fw={700} style={{ color: accentColor }}>{linkLabel}</Text>
                </Box>
            )}
        </Group>
    );
}

export default function Dashboard() {
    const { props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { stats = {}, recentTrips = [], fleetStatus = [], alerts = [], monthlyTrend = [], expenseByCategory = [] } = props;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';
    const user = props.auth?.user;

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #EAECF0';
    const cardShadow = isDark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 1px 12px rgba(0,0,0,0.07)';
    const divider    = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F2F4F7';
    const textPri    = isDark ? '#F1F5F9' : '#101828';
    const textSec    = isDark ? '#94A3B8' : '#475467';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const rowHovBg   = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const revPct = stats.revenue_change_pct;
    const revBadge = revPct === null ? '—' : `${revPct >= 0 ? '+' : ''}${revPct}%`;

    const statCards = [
        {
            icon: '🚛',
            label: 'Active Trips',
            value: String(stats.active_trips ?? 0),
            sub: 'In transit, loading, at border',
            badge: `${stats.active_trips ?? 0} Active`,
            badgeBg: 'rgba(255,255,255,0.22)',
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
            glow: '0 12px 40px rgba(37,99,235,0.45)',
        },
        {
            icon: '🚗',
            label: 'Fleet on Road',
            value: `${stats.fleet_on_road ?? 0}`,
            valueSub: `/ ${stats.fleet_total ?? 0}`,
            sub: `${stats.fleet_idle ?? 0} vehicles idle`,
            badge: stats.fleet_total > 0 ? `${Math.round((stats.fleet_on_road ?? 0) / stats.fleet_total * 100)}% util.` : '0%',
            badgeBg: 'rgba(255,255,255,0.22)',
            grad: 'linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #0EA5E9 100%)',
            glow: '0 12px 40px rgba(14,165,233,0.45)',
        },
        {
            icon: '💰',
            label: "Month's Revenue",
            value: `TZS`,
            valueSub: ` ${fmt(stats.month_revenue)}`,
            sub: stats.last_month_revenue > 0 ? `vs ${fmt(stats.last_month_revenue)} last month` : 'No prior month data',
            badge: revBadge,
            badgeBg: revPct >= 0 ? 'rgba(255,255,255,0.22)' : 'rgba(239,68,68,0.3)',
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #10B981 100%)',
            glow: '0 12px 40px rgba(16,185,129,0.45)',
        },
        {
            icon: '🛂',
            label: 'Permits Expiring',
            value: String(stats.pending_permits ?? 0),
            sub: `${stats.permits_expiring_7d ?? 0} expiring within 7 days`,
            badge: (stats.permits_expiring_7d ?? 0) > 0 ? '⚠️ Act Now' : '✓ All Clear',
            badgeBg: (stats.permits_expiring_7d ?? 0) > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.22)',
            grad: (stats.permits_expiring_7d ?? 0) > 0
                ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 50%, #EF4444 100%)'
                : 'linear-gradient(135deg, #713F12 0%, #92400E 50%, #F59E0B 100%)',
            glow: (stats.permits_expiring_7d ?? 0) > 0 ? '0 12px 40px rgba(239,68,68,0.45)' : '0 12px 40px rgba(245,158,11,0.45)',
        },
    ];

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* ── Welcome Banner ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box mb={28} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 50%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 20, padding: '26px 32px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 8px 40px rgba(194,65,12,0.35)',
                }}>
                    <Box style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -30, right: 180, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', top: 10, left: '45%', width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                    <Group justify="space-between" wrap="wrap" gap="lg" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={5}>
                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: 0.4 }}>
                                {greetEmoji} {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Text>
                            <Title order={2} c="white" style={{ fontWeight: 900, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', lineHeight: 1.2 }}>
                                {greeting},{' '}
                                <Text component="span" style={{ borderBottom: '3px solid rgba(255,255,255,0.45)', paddingBottom: 1 }} inherit>
                                    {user?.name?.split(' ')[0] || 'Admin'}
                                </Text>
                                &nbsp;👋
                            </Title>
                            <Text size="sm" style={{ color: 'rgba(255,255,255,0.72)' }}>Here's what's happening with your fleet today.</Text>
                        </Stack>
                        <Group gap={10} wrap="wrap">
                            {[
                                { dot: '#93C5FD', label: `${stats.fleet_on_road ?? 0} On Road` },
                                { dot: '#FDE68A', label: `${stats.active_trips ?? 0} Active Trips` },
                                { dot: 'rgba(255,255,255,0.45)', label: `${stats.fleet_idle ?? 0} Idle` },
                            ].map(({ dot, label }) => (
                                <Group key={label} gap={8} style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 24, padding: '7px 16px', backdropFilter: 'blur(10px)' }}>
                                    <Box style={{ width: 7, height: 7, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}` }} />
                                    <Text size="xs" fw={600} c="white">{label}</Text>
                                </Group>
                            ))}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Stat Cards — full gradient ── */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb={28}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label}
                        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.09 }}
                        whileHover={{ y: -5 }} style={{ cursor: 'default' }}>
                        <Box style={{
                            background: s.grad, borderRadius: 20, padding: '22px 24px 20px',
                            boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 158,
                        }}>
                            {/* Wave decoration */}
                            <CardWave />
                            {/* Subtle circle glow */}
                            <Box style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

                            <Group justify="space-between" align="flex-start" mb={18}>
                                {/* Icon */}
                                <Box style={{
                                    width: 52, height: 52, borderRadius: 16,
                                    background: 'rgba(255,255,255,0.18)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.6rem',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                }}>
                                    {s.icon}
                                </Box>
                                {/* Badge */}
                                <Box style={{ background: s.badgeBg, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '4px 12px', backdropFilter: 'blur(6px)' }}>
                                    <Text size="11px" fw={700} c="white" style={{ letterSpacing: 0.3 }}>{s.badge}</Text>
                                </Box>
                            </Group>

                            {/* Value */}
                            <Text fw={900} c="white" style={{ fontSize: s.valueSub ? '1.8rem' : '2.6rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>
                                {s.value}
                                {s.valueSub && <Text component="span" fw={500} style={{ fontSize: '1.1rem', opacity: 0.75 }}>{s.valueSub}</Text>}
                            </Text>
                            <Text fw={700} c="white" size="sm" mt={4} style={{ opacity: 0.9, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.6, position: 'relative', zIndex: 1 }}>{s.sub}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── Quick Actions ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
                <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 12 }}>Quick Actions</Text>
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={28}>
                    {quickActions.map((a, i) => (
                        <motion.div key={a.label}
                            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.06 }}
                            whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component={Link} href={a.href} style={{
                                display: 'block', textDecoration: 'none',
                                background: a.grad, borderRadius: 18,
                                padding: '22px 22px 18px', cursor: 'pointer',
                                boxShadow: `0 8px 28px ${a.glow}`,
                                position: 'relative', overflow: 'hidden',
                            }}>
                                <Box style={{ position: 'absolute', bottom: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                <Box style={{ position: 'absolute', top: -6, right: 24, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                                <Box style={{
                                    width: 44, height: 44, borderRadius: 13,
                                    background: 'rgba(255,255,255,0.18)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', marginBottom: 14,
                                }}>
                                    {a.icon}
                                </Box>
                                <Text fw={800} c="white" size="sm" mb={3}>{a.label}</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.68)' }}>{a.desc}</Text>
                            </Box>
                        </motion.div>
                    ))}
                </SimpleGrid>
            </motion.div>

            {/* ── Recent Trips + Fleet Status ── */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">

                {/* Recent Trips */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.46 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden', boxShadow: cardShadow }}>
                        <CardHeader icon="🚛" title="Recent Trips" sub="Latest activity" linkHref="/system/trips" linkLabel="View All →" accentColor="#3B82F6" />
                        {recentTrips.length === 0 ? (
                            <Box style={{ padding: '48px 22px', textAlign: 'center' }}>
                                <Text size="2.5rem" mb={10}>🚛</Text>
                                <Text size="sm" style={{ color: textMut }}>No trips yet.{' '}<Link href="/system/trips/create" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 700 }}>Create the first one →</Link></Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {recentTrips.map((trip, i) => {
                                    const sc = STATUS_COLOR[trip.status] || '#94A3B8';
                                    const progress = STATUS_PROGRESS[trip.status] ?? 0;
                                    const progressColor = trip.status === 'delivered' || trip.status === 'completed' ? 'teal' : trip.status === 'at_border' ? 'orange' : trip.status === 'loading' ? 'yellow' : 'blue';
                                    return (
                                        <Box key={trip.trip_number}
                                            style={{ padding: '14px 22px', borderBottom: i < recentTrips.length - 1 ? divider : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <Group justify="space-between" mb={6} wrap="nowrap">
                                                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                                                    <Text size="10px" fw={700} style={{ color: '#3B82F6', flexShrink: 0, fontFamily: 'monospace', background: isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF', padding: '2px 7px', borderRadius: 5 }}>{trip.trip_number}</Text>
                                                    <Text size="sm" fw={700} style={{ color: textPri }} truncate>{trip.route_from} → {trip.route_to}</Text>
                                                </Group>
                                                <Box style={{ background: sc + '18', border: `1px solid ${sc}40`, borderRadius: 20, padding: '3px 10px', flexShrink: 0 }}>
                                                    <Text size="10px" fw={800} style={{ color: sc, letterSpacing: 0.4, textTransform: 'uppercase' }}>{STATUS_LABEL[trip.status] || trip.status}</Text>
                                                </Box>
                                            </Group>
                                            <Group justify="space-between" mb={8}>
                                                <Text size="xs" style={{ color: textSec }}>{trip.driver_name} · {trip.vehicle_plate}</Text>
                                                <Text size="xs" style={{ color: textMut }}>{trip.cargo_description}</Text>
                                            </Group>
                                            <Progress value={progress} size={5} radius="xl" color={progressColor} />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </motion.div>

                {/* Fleet Status */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <Box style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden', boxShadow: cardShadow }}>
                        <CardHeader icon="🚗" title="Fleet Status" sub={`${stats.fleet_total ?? 0} vehicles registered`} linkHref="/system/fleet" linkLabel="All Fleet →" accentColor="#EA580C" />
                        {fleetStatus.length === 0 ? (
                            <Box style={{ padding: '48px 22px', textAlign: 'center' }}>
                                <Text size="2.5rem" mb={10}>🚗</Text>
                                <Text size="sm" style={{ color: textMut }}>No vehicles registered.{' '}<Link href="/system/fleet/create" style={{ color: '#EA580C', textDecoration: 'none', fontWeight: 700 }}>Add one →</Link></Text>
                            </Box>
                        ) : (
                            <Stack gap={0}>
                                {fleetStatus.map((v, i) => {
                                    const sc = FLEET_COLORS[v.status] || '#94A3B8';
                                    const statusLabel = v.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
                                    return (
                                        <Box key={v.id}
                                            style={{ padding: '12px 22px', borderBottom: i < fleetStatus.length - 1 ? divider : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <Group justify="space-between" wrap="nowrap">
                                                <Group gap={12} wrap="nowrap">
                                                    <Box style={{ width: 36, height: 36, borderRadius: 10, background: sc + '15', border: `1.5px solid ${sc}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>
                                                        🚗
                                                    </Box>
                                                    <Stack gap={2}>
                                                        <Group gap={8} align="center">
                                                            <Text fw={800} size="sm" style={{ color: textPri, fontFamily: 'monospace', letterSpacing: 0.5 }}>{v.plate}</Text>
                                                            <Box style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#F2F4F7', borderRadius: 6, padding: '1px 8px' }}>
                                                                <Text size="10px" fw={600} style={{ color: textSec }}>{v.type}</Text>
                                                            </Box>
                                                        </Group>
                                                        <Text size="xs" style={{ color: textSec }}>{v.driver?.name || 'Unassigned'}</Text>
                                                    </Stack>
                                                </Group>
                                                <Box style={{ background: sc + '15', border: `1.5px solid ${sc}40`, borderRadius: 20, padding: '4px 12px', flexShrink: 0 }}>
                                                    <Text size="10px" fw={800} style={{ color: sc, letterSpacing: 0.5, textTransform: 'uppercase' }}>{statusLabel}</Text>
                                                </Box>
                                            </Group>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </motion.div>
            </SimpleGrid>

            {/* ── Alerts ── */}
            {alerts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}>
                    <Box mt={24} style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden', boxShadow: cardShadow }}>
                        <CardHeader icon="🔔" title="Active Alerts" sub={`${alerts.length} requiring attention`} linkHref="/system/notifications" linkLabel="View All →" accentColor="#EF4444" />
                        <Stack gap={0}>
                            {alerts.map((a, i) => {
                                const daysLabel = a.days < 0 ? `${Math.abs(a.days)}d overdue` : a.days === 0 ? 'Today' : `${a.days}d left`;
                                return (
                                    <Box key={i} component={Link} href={a.href}
                                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderBottom: i < alerts.length - 1 ? divider : 'none', textDecoration: 'none', transition: 'background 0.12s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHovBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Box style={{ width: 38, height: 38, borderRadius: 11, background: a.color + '15', border: `1.5px solid ${a.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>{a.icon}</Box>
                                        <Box style={{ flex: 1 }}>
                                            <Text size="sm" fw={700} style={{ color: textPri }}>{a.title}</Text>
                                            <Text size="xs" style={{ color: textSec }}>{a.subtitle}</Text>
                                        </Box>
                                        <Box style={{ background: a.color + '15', border: `1.5px solid ${a.color}35`, borderRadius: 20, padding: '4px 12px', flexShrink: 0 }}>
                                            <Text size="xs" fw={800} style={{ color: a.color }}>{daysLabel}</Text>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                </motion.div>
            )}

            {/* ── Revenue Chart ── */}
            {monthlyTrend.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Box mt={24} style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ padding: '18px 22px 14px', borderBottom: divider }}>
                            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                                <CardHeader icon="📊" title="Revenue vs Expenses" sub="Last 12 months" accentColor="#3B82F6" />
                                {(() => {
                                    const totalRev = monthlyTrend.reduce((s, d) => s + d.revenue, 0);
                                    const totalExp = monthlyTrend.reduce((s, d) => s + d.expenses, 0);
                                    const profit   = totalRev - totalExp;
                                    return (
                                        <Group gap={20} wrap="wrap" style={{ paddingRight: 22, paddingBottom: 4 }}>
                                            {[
                                                { label: 'Revenue', value: fmt(totalRev), color: '#3B82F6' },
                                                { label: 'Expenses', value: fmt(totalExp), color: '#EF4444' },
                                                { label: 'Profit', value: fmt(profit), color: profit >= 0 ? '#10B981' : '#EF4444' },
                                            ].map(s => (
                                                <Stack key={s.label} gap={1} align="flex-end">
                                                    <Text size="10px" style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
                                                    <Text size="sm" fw={800} style={{ color: s.color }}>TZS {s.value}</Text>
                                                </Stack>
                                            ))}
                                        </Group>
                                    );
                                })()}
                            </Group>
                        </Box>
                        <Box style={{ padding: '20px 22px' }}>
                            <RevenueChart data={monthlyTrend} isDark={isDark} />
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* ── Expense Breakdown ── */}
            {expenseByCategory.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.64 }}>
                    <Box mt={24} style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden', boxShadow: cardShadow }}>
                        <CardHeader icon="💸" title="Expenses by Category" sub="This month's breakdown" linkHref="/system/expenses" linkLabel="View All →" accentColor="#EA580C" />
                        <Box style={{ padding: '20px 22px' }}>
                            {(() => {
                                const total = expenseByCategory.reduce((s, e) => s + Number(e.total), 0);
                                const CATS = { fuel: ['⛽','#3B82F6'], tyre: ['🔄','#8B5CF6'], repair: ['🔧','#F59E0B'], driver_salary: ['👤','#10B981'], accommodation: ['🏨','#06B6D4'], toll: ['🛣️','#F97316'], port: ['🚢','#6366F1'], permit_fee: ['🛂','#84CC16'], communication: ['📱','#EC4899'], office: ['🏢','#64748B'], other: ['📦','#94A3B8'] };
                                return (
                                    <Stack gap={14}>
                                        {expenseByCategory.slice(0, 6).map(e => {
                                            const pct = total > 0 ? Math.round(Number(e.total) / total * 100) : 0;
                                            const [icon, color] = CATS[e.category] ?? ['📦', '#94A3B8'];
                                            return (
                                                <Box key={e.category}>
                                                    <Group justify="space-between" mb={7}>
                                                        <Group gap={8}>
                                                            <Text size="sm">{icon}</Text>
                                                            <Text size="sm" fw={600} style={{ color: textSec }}>{e.category?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
                                                        </Group>
                                                        <Group gap={10}>
                                                            <Text size="sm" fw={800} style={{ color: textPri }}>TZS {fmt(e.total)}</Text>
                                                            <Box style={{ background: color + '15', border: `1px solid ${color}30`, borderRadius: 12, padding: '1px 8px' }}>
                                                                <Text size="10px" fw={700} style={{ color }}>{pct}%</Text>
                                                            </Box>
                                                        </Group>
                                                    </Group>
                                                    <Box style={{ height: 7, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.06)' : '#F2F4F7', overflow: 'hidden' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                                                            style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${color}80, ${color})` }}
                                                        />
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                );
                            })()}
                        </Box>
                    </Box>
                </motion.div>
            )}
        </DashboardLayout>
    );
}

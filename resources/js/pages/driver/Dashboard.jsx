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

// Returns greeting + emoji for current local time
function getGreeting() {
    const h = new Date().getHours();
    if (h < 5)  return { en: 'Good night',     sw: 'Habari za usiku',    emoji: '🌙' };
    if (h < 12) return { en: 'Good morning',   sw: 'Habari za asubuhi',  emoji: '☀️' };
    if (h < 17) return { en: 'Good afternoon', sw: 'Habari za mchana',   emoji: '🌤️' };
    if (h < 21) return { en: 'Good evening',   sw: 'Habari za jioni',    emoji: '🌇' };
    return       { en: 'Good night',     sw: 'Habari za usiku',    emoji: '🌙' };
}

function DriverAvatar({ name, photoUrl, size = 56 }) {
    if (photoUrl) {
        return <Box component="img" src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '3px solid rgba(255,255,255,0.45)', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }} />;
    }
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', border: '3px solid rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
            <Text fw={900} style={{ color: 'white', fontSize: size * 0.36, letterSpacing: 0.5 }}>{initials}</Text>
        </Box>
    );
}

function QuickAction({ icon, label, sub, href, color, isDark }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textMut    = isDark ? '#475569' : '#94A3B8';
    return (
        <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
            <Box component={Link} href={href}
                style={{
                    display: 'block', background: cardBg, border: `1px solid ${cardBorder}`,
                    borderRadius: 14, padding: '14px 16px', textDecoration: 'none',
                    boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.05)',
                    borderLeft: `3px solid ${color}`,
                    transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 24px ${color}30`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.05)'}>
                <Group gap={12} align="center" wrap="nowrap">
                    <Box style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{icon}</Box>
                    <Stack gap={1} style={{ minWidth: 0 }}>
                        <Text fw={800} size="sm" style={{ color: textPri, lineHeight: 1.1 }}>{label}</Text>
                        <Text size="xs" style={{ color: textMut, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</Text>
                    </Stack>
                </Group>
            </Box>
        </motion.div>
    );
}

function SectionCard({ title, icon, count, children, isDark, accent }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    <Box style={{ width: 8, height: 8, borderRadius: '50%', background: `linear-gradient(135deg, ${accent?.[0] ?? '#EA580C'}, ${accent?.[1] ?? '#F97316'})`, boxShadow: `0 0 6px ${accent?.[1] ?? '#F97316'}` }} />
                    <Text size="sm" fw={800} style={{ color: textPri }}>{icon} {title}</Text>
                    {count !== undefined && count > 0 && (
                        <Box style={{ background: (accent?.[1] ?? '#EA580C') + '18', border: `1px solid ${(accent?.[1] ?? '#EA580C')}35`, borderRadius: 12, padding: '1px 8px' }}>
                            <Text size="xs" fw={700} style={{ color: accent?.[1] ?? '#EA580C' }}>{count}</Text>
                        </Box>
                    )}
                </Group>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function ActiveTripHero({ trip, statuses, isDark }) {
    const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
    const dep  = trip.departure_date ? new Date(trip.departure_date) : null;
    const arr  = trip.arrival_date ? new Date(trip.arrival_date) : null;
    const now  = new Date();

    // Trip progress estimation
    let progress = 0;
    let daysIn = 0;
    if (dep) {
        daysIn = Math.max(0, Math.floor((now - dep) / 86400000));
        if (arr) {
            const total = Math.max(1, Math.floor((arr - dep) / 86400000));
            progress = Math.min(100, Math.max(4, (daysIn / total) * 100));
        } else {
            progress = Math.min(100, daysIn * 12); // best-effort estimate w/o ETA
        }
    }

    return (
        <Box component={Link} href={`/driver/trips/${trip.id}`}
            style={{
                display: 'block', background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)',
                borderRadius: 18, padding: '24px 28px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(37,99,235,0.4)', textDecoration: 'none', color: 'white',
                marginBottom: 24,
            }}>
            <Box style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
            <Box style={{ position: 'absolute', bottom: -60, left: 120, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <CardWave />

            <Group justify="space-between" align="flex-start" mb={14} wrap="nowrap" style={{ position: 'relative', zIndex: 1 }}>
                <Group gap={10}>
                    <Box style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '5px 12px' }}>
                        <Group gap={5}>
                            <Text size="11px" c="white">🚛</Text>
                            <Text size="xs" fw={900} c="white" style={{ fontFamily: 'monospace', letterSpacing: 0.6 }}>{trip.trip_number}</Text>
                        </Group>
                    </Box>
                    <Box style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '4px 14px' }}>
                        <Group gap={6}>
                            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: 'white', boxShadow: '0 0 6px white' }} />
                            <Text size="xs" fw={800} c="white">{meta.label}</Text>
                        </Group>
                    </Box>
                </Group>
                <Text size="xs" c="white" style={{ opacity: 0.85, fontWeight: 700 }}>
                    Day {daysIn + 1} →
                </Text>
            </Group>

            <Group gap={10} mb={16} style={{ position: 'relative', zIndex: 1 }} wrap="wrap">
                <Text fw={900} c="white" style={{ fontSize: '1.4rem', lineHeight: 1.2, textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}>{trip.route_from}</Text>
                <Text style={{ fontSize: '1.4rem', color: '#FBBF24', fontWeight: 900 }}>→</Text>
                <Text fw={900} c="white" style={{ fontSize: '1.4rem', lineHeight: 1.2, textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}>{trip.route_to}</Text>
            </Group>

            {/* Progress bar */}
            <Box style={{ position: 'relative', zIndex: 1, marginBottom: 14 }}>
                <Group justify="space-between" mb={6}>
                    <Text size="10px" c="white" style={{ opacity: 0.7, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        {dep ? dep.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                    </Text>
                    <Text size="10px" c="white" style={{ opacity: 0.7, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        {arr ? arr.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'ETA pending'}
                    </Text>
                </Group>
                <Box style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #FBBF24, #F59E0B)', borderRadius: 4, boxShadow: '0 0 12px rgba(251,191,36,0.6)' }} />
                </Box>
            </Box>

            <Group justify="space-between" wrap="wrap" gap="xs" style={{ position: 'relative', zIndex: 1 }}>
                <Group gap={6}>
                    <Text size="xs" c="white" style={{ opacity: 0.85 }}>🚛 {trip.vehicle?.plate ?? '—'}</Text>
                    {trip.cargo_weight_tons && (
                        <>
                            <Text c="white" style={{ opacity: 0.45 }}>·</Text>
                            <Text size="xs" c="white" style={{ opacity: 0.85 }}>📦 {Number(trip.cargo_weight_tons).toFixed(1)}t</Text>
                        </>
                    )}
                </Group>
                <Text size="xs" c="white" style={{ opacity: 0.85, fontWeight: 700 }}>View details →</Text>
            </Group>
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
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';

    const greeting = getGreeting();
    const today    = new Date();
    const dateStr  = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const inspectionDone = !!todayInspection;
    const tonsMonth      = Number(stats.tons_month ?? 0);

    const statCards = [
        {
            icon: '🚛', label: 'Active Trips', value: String(stats.active_trips), sub: stats.active_trips > 0 ? 'Currently in transit' : 'None right now',
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '📅', label: 'Upcoming', value: String(stats.upcoming_trips), sub: stats.upcoming_trips > 0 ? 'Scheduled trips' : 'Nothing planned',
            grad: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)',
            glow: '0 8px 28px rgba(139,92,246,0.4)',
        },
        {
            icon: '✅', label: 'Done This Month', value: String(stats.completed_month), sub: `${stats.completed_week ?? 0} this week`,
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
        {
            icon: '📦', label: 'Cargo Carried', value: tonsMonth >= 1 ? `${tonsMonth.toFixed(1)}t` : '0t', sub: 'This month',
            grad: 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)',
            glow: '0 8px 28px rgba(245,158,11,0.4)',
        },
    ];

    const quickActions = [
        { icon: '🔧', label: 'Inspection',  sub: inspectionDone ? 'Done today ✓' : 'Pre-trip check', href: '/driver/inspections', color: inspectionDone ? '#22C55E' : '#F59E0B' },
        { icon: '📍', label: 'Check-In',    sub: 'Update location',  href: '/driver/check-ins/create',  color: '#0EA5E9' },
        { icon: '🚛', label: 'My Trips',    sub: `${stats.lifetime_trips ?? 0} total`, href: '/driver/trips', color: '#EA580C' },
        { icon: '👤', label: 'Profile',     sub: driver.phone ?? 'Account',  href: '/driver/dashboard', color: '#8B5CF6' },
    ];

    return (
        <DriverLayout title="My Dashboard">

            {/* ── Welcome Hero ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={20} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 8px 36px rgba(194,65,12,0.32)',
                }}>
                    {/* Decorative orbs */}
                    <Box style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -40, right: 180, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', top: 70, right: 80, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                    <CardWave />

                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={16} align="center">
                            <DriverAvatar name={driver.name} photoUrl={driver.photo_url} size={64} />
                            <Stack gap={4}>
                                <Group gap={6}>
                                    <Text style={{ fontSize: '1.05rem' }}>{greeting.emoji}</Text>
                                    <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 }}>
                                        {greeting.sw}
                                    </Text>
                                </Group>
                                <Text fw={900} style={{ color: 'white', fontSize: '1.55rem', lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
                                    {driver.name.split(' ')[0]} 👋
                                </Text>
                                <Group gap={8}>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.75)' }}>📅 {dateStr}</Text>
                                </Group>
                                {driver.vehicle && (
                                    <Box mt={6} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '4px 12px' }}>
                                        <Text size="11px" c="white">🚛</Text>
                                        <Text size="xs" fw={800} c="white" style={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>{driver.vehicle.plate}</Text>
                                        <Text c="white" style={{ opacity: 0.5 }}>·</Text>
                                        <Text size="xs" c="white" style={{ opacity: 0.85 }}>{driver.vehicle.make} {driver.vehicle.model_name}</Text>
                                    </Box>
                                )}
                            </Stack>
                        </Group>

                        <Group gap={10}>
                            <Box component={Link} href="/driver/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(4px)' }}>
                                🚛 My Trips
                            </Box>
                            <Box component={Link} href="/driver/check-ins/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
                                📍 Check-In
                            </Box>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={20}>
                    {quickActions.map((q, i) => (
                        <motion.div key={q.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}>
                            <QuickAction {...q} isDark={isDark} />
                        </motion.div>
                    ))}
                </SimpleGrid>
            </motion.div>

            {/* ── Active Trip Hero (only if there's an active trip) ── */}
            {active.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Group gap={8} mb={10}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 8px #3B82F6' }} />
                        <Text size="xs" fw={800} style={{ color: textSec, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                            Currently On The Road
                        </Text>
                    </Group>
                    {active.slice(0, 1).map(t => <ActiveTripHero key={t.id} trip={t} statuses={tripStatuses} isDark={isDark} />)}
                </motion.div>
            )}

            {/* ── Stats ── */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 124 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.9, fontWeight: 700, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                            <Text size="10px" c="white" mt={2} style={{ opacity: 0.65, position: 'relative', zIndex: 1 }}>{s.sub}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            <Grid gutter="md">
                {/* Active Now (table view if not shown as hero, or extra trips) */}
                {active.length > 1 && (
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <SectionCard title="Other Active Trips" icon="🚦" count={active.length - 1} isDark={isDark} accent={['#1D4ED8', '#3B82F6']}>
                                <Stack gap={0}>
                                    {active.slice(1).map(t => <TripCard key={t.id} trip={t} statuses={tripStatuses} isDark={isDark} />)}
                                </Stack>
                            </SectionCard>
                        </motion.div>
                    </Grid.Col>
                )}

                {active.length === 0 && (
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <SectionCard title="Active Now" icon="🚦" count={0} isDark={isDark} accent={['#1D4ED8', '#3B82F6']}>
                                <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Box style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF', border: '2px dashed rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 12px' }}>🚛</Box>
                                    <Text fw={800} size="sm" style={{ color: textPri, marginBottom: 4 }}>No active trip</Text>
                                    <Text size="xs" style={{ color: textMut }}>Your next assignment will appear here</Text>
                                </Box>
                            </SectionCard>
                        </motion.div>
                    </Grid.Col>
                )}

                {/* Upcoming */}
                <Grid.Col span={{ base: 12, md: active.length > 1 || active.length === 0 ? 6 : 12 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                        <SectionCard title="Coming Up" icon="📅" count={upcoming.length} isDark={isDark} accent={['#5B21B6', '#8B5CF6']}>
                            {upcoming.length === 0 ? (
                                <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Box style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? 'rgba(139,92,246,0.08)' : '#F3F0FF', border: '2px dashed rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 12px' }}>📅</Box>
                                    <Text fw={800} size="sm" style={{ color: textPri, marginBottom: 4 }}>Nothing scheduled</Text>
                                    <Text size="xs" style={{ color: textMut }}>Your upcoming assignments will appear here</Text>
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
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <SectionCard title="Recent Deliveries" icon="🕐" count={recent.length} isDark={isDark} accent={['#065F46', '#10B981']}>
                            {recent.length === 0 ? (
                                <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Box style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? 'rgba(16,185,129,0.08)' : '#F0FDF4', border: '2px dashed rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 12px' }}>✅</Box>
                                    <Text fw={800} size="sm" style={{ color: textPri, marginBottom: 4 }}>No completed trips yet</Text>
                                    <Text size="xs" style={{ color: textMut }}>Finished trips will be listed here</Text>
                                </Box>
                            ) : (
                                <Grid gutter="md">
                                    {recent.map((t) => (
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

import PortalLayout from '../../layouts/PortalLayout';
import { Box, Grid, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

const tripStatusColor = {
    loading: '#F59E0B', in_transit: '#2196F3', at_border: '#A855F7',
    delivered: '#22C55E', completed: '#22C55E', cancelled: '#EF4444',
    planned: '#94A3B8',
};

const invoiceStatusColor = {
    paid: '#22C55E', sent: '#2196F3', overdue: '#EF4444', partial: '#F59E0B', draft: '#94A3B8',
};

export default function PortalDashboard({ client, company, activeTrips, recentInvoices, stats }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));

    const statCards = [
        {
            icon: '🚛', label: 'Active Trips', value: String(stats.active_trips),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '📋', label: 'Total Trips', value: String(stats.total_trips),
            grad: 'linear-gradient(135deg, #0369A1 0%, #0284C7 60%, #0EA5E9 100%)',
            glow: '0 8px 28px rgba(14,165,233,0.4)',
        },
        {
            icon: '✅', label: 'Paid Invoices', value: String(stats.paid_invoices),
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
        {
            icon: '⚠️', label: 'Balance Due', value: `TZS`, valueSub: ` ${fmt(stats.pending_amount)}`,
            grad: 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)',
            glow: '0 8px 28px rgba(245,158,11,0.4)',
        },
    ];

    return (
        <PortalLayout title="">
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                📊
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Welcome back, {client.name}</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Your shipment overview</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            <Box component={Link} href="/portal/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                                🚛 My Trips
                            </Box>
                            <Box component={Link} href="/portal/invoices" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                📄 Invoices
                            </Box>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat Cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
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
                            <Text fw={900} c="white" style={{ fontSize: s.valueSub ? '1.4rem' : '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>
                                {s.value}
                                {s.valueSub && <Text component="span" fw={500} style={{ fontSize: '0.85rem', opacity: 0.75 }}>{s.valueSub}</Text>}
                            </Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            <Grid gutter="lg">
                {/* Active trips */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                            {/* 3px accent */}
                            <Box style={{ height: 3, background: 'linear-gradient(90deg, #1D4ED8, #3B82F6)' }} />
                            {/* Toolbar */}
                            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Group gap={8}>
                                    <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                                    <Text size="sm" fw={700} style={{ color: textPri }}>Active Shipments</Text>
                                    {activeTrips.length > 0 && (
                                        <Box style={{ background: isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 12, padding: '1px 8px' }}>
                                            <Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{activeTrips.length}</Text>
                                        </Box>
                                    )}
                                </Group>
                                <Box component={Link} href="/portal/trips" style={{ fontSize: 12, color: '#EA580C', textDecoration: 'none', fontWeight: 600 }}>View all →</Box>
                            </Box>

                            <Box style={{ padding: '4px 20px 16px' }}>
                                {activeTrips.length === 0 ? (
                                    <Box style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <Box style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.08)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 12px' }}>🚛</Box>
                                        <Text size="sm" style={{ color: textMut }}>No active shipments right now</Text>
                                    </Box>
                                ) : (
                                    <Stack gap={0}>
                                        {activeTrips.map((trip, i) => {
                                            const sc = tripStatusColor[trip.status] || '#94A3B8';
                                            return (
                                                <motion.div key={trip.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                                    <Box
                                                        component={Link}
                                                        href={`/portal/trips/${trip.id}`}
                                                        style={{
                                                            display: 'block', padding: '13px 0',
                                                            borderBottom: i < activeTrips.length - 1 ? `1px solid ${divider}` : 'none',
                                                            borderLeft: '3px solid transparent', paddingLeft: 12,
                                                            textDecoration: 'none', transition: 'background 0.15s, border-left 0.15s',
                                                            marginLeft: -20, paddingLeft: 20,
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${sc}`; e.currentTarget.style.paddingLeft = '17px'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; e.currentTarget.style.paddingLeft = '20px'; }}
                                                    >
                                                        <Group justify="space-between" mb={4} wrap="nowrap">
                                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '3px 8px' }}>
                                                                <Text size="10px" style={{ color: '#EA580C' }}>🚛</Text>
                                                                <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{trip.trip_number}</Text>
                                                            </Box>
                                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sc + '18', border: `1px solid ${sc}35`, borderRadius: 20, padding: '3px 10px' }}>
                                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                                                                <Text size="xs" fw={700} style={{ color: sc, textTransform: 'capitalize' }}>{trip.status?.replace('_', ' ')}</Text>
                                                            </Box>
                                                        </Group>
                                                        <Text size="sm" fw={600} style={{ color: textPri }}>{trip.origin} → {trip.destination}</Text>
                                                        {trip.driver && <Text size="xs" style={{ color: textMut, marginTop: 2 }}>Driver: {trip.driver.name}</Text>}
                                                    </Box>
                                                </motion.div>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </motion.div>
                </Grid.Col>

                {/* Recent invoices */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                            <Box style={{ height: 3, background: 'linear-gradient(90deg, #065F46, #10B981)' }} />
                            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Group gap={8}>
                                    <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                                    <Text size="sm" fw={700} style={{ color: textPri }}>Recent Invoices</Text>
                                </Group>
                                <Box component={Link} href="/portal/invoices" style={{ fontSize: 12, color: '#EA580C', textDecoration: 'none', fontWeight: 600 }}>View all →</Box>
                            </Box>

                            <Box style={{ padding: '4px 20px 16px' }}>
                                {recentInvoices.length === 0 ? (
                                    <Box style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <Box style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.08)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 12px' }}>📄</Box>
                                        <Text size="sm" style={{ color: textMut }}>No invoices yet</Text>
                                    </Box>
                                ) : (
                                    <Stack gap={0}>
                                        {recentInvoices.map((inv, i) => {
                                            const sc = invoiceStatusColor[inv.status] || '#94A3B8';
                                            return (
                                                <motion.div key={inv.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                                    <Box
                                                        component={Link}
                                                        href={`/portal/invoices/${inv.id}`}
                                                        style={{
                                                            display: 'block', padding: '13px 0',
                                                            borderBottom: i < recentInvoices.length - 1 ? `1px solid ${divider}` : 'none',
                                                            borderLeft: '3px solid transparent',
                                                            textDecoration: 'none', transition: 'background 0.15s, border-left 0.15s',
                                                            marginLeft: -20, paddingLeft: 20,
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${sc}`; e.currentTarget.style.paddingLeft = '17px'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; e.currentTarget.style.paddingLeft = '20px'; }}
                                                    >
                                                        <Group justify="space-between" mb={4}>
                                                            <Text size="sm" fw={800} style={{ color: textPri }}>{inv.document_number}</Text>
                                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sc + '18', border: `1px solid ${sc}35`, borderRadius: 20, padding: '3px 10px' }}>
                                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                                                                <Text size="xs" fw={700} style={{ color: sc, textTransform: 'capitalize' }}>{inv.status}</Text>
                                                            </Box>
                                                        </Group>
                                                        <Group justify="space-between">
                                                            <Text size="xs" fw={700} style={{ color: textSec }}>TZS {fmt(inv.total)}</Text>
                                                            {inv.balance_due > 0 && (
                                                                <Text size="xs" style={{ color: '#F59E0B', fontWeight: 600 }}>Due: {fmt(inv.balance_due)}</Text>
                                                            )}
                                                        </Group>
                                                    </Box>
                                                </motion.div>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </motion.div>
                </Grid.Col>
            </Grid>
        </PortalLayout>
    );
}

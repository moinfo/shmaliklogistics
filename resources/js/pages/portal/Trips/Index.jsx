import PortalLayout from '../../../layouts/PortalLayout';
import { Box, Text, Group, Stack, Select, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PortalTripsIndex({ client, trips, statuses, filters }) {
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

    const [status, setStatus] = useState(filters.status || '');

    const applyFilter = (val) => {
        setStatus(val ?? '');
        router.get('/portal/trips', (val && val !== '') ? { status: val } : {}, { preserveState: true, replace: true });
    };

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
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🚛</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">My Shipments</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Track all your cargo trips</Text>
                            </Stack>
                        </Group>
                        <Box style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '6px 16px' }}>
                            <Text size="sm" fw={700} c="white">{trips.total} trips</Text>
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <Select
                        placeholder="All statuses"
                        value={status || null}
                        onChange={applyFilter}
                        clearable
                        data={Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))}
                        w={180}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
                        }}
                    />
                    <Text size="sm" style={{ color: textSec }}>{trips.total} trips total</Text>
                </Group>
            </Box>

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Trips</Text>
                        {trips.data.length > 0 && (
                            <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 12, padding: '1px 8px' }}>
                                <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{trips.total}</Text>
                            </Box>
                        )}
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {trips.data.length > 0 ? `${trips.from ?? 1}–${trips.to ?? trips.data.length} of ${trips.total}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: '140px 1fr 150px 120px 110px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Trip #', 'Route', 'Driver / Vehicle', 'Departure', 'Status'].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {trips.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>🚛</Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No shipments found</Text>
                        <Text size="sm" style={{ color: textMut }}>Your trips will appear here</Text>
                    </Box>
                ) : (
                    trips.data.map((trip, i) => {
                        const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
                        return (
                            <motion.div key={trip.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: '140px 1fr 150px 120px 110px', gap: 0,
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`,
                                        cursor: 'pointer', alignItems: 'center',
                                        transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${meta.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/portal/trips/${trip.id}`)}
                                >
                                    {/* Trip # */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px', width: 'fit-content' }}>
                                        <Text size="10px" style={{ color: '#EA580C', opacity: 0.7 }}>🚛</Text>
                                        <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{trip.trip_number}</Text>
                                    </Box>

                                    {/* Route */}
                                    <Stack gap={3}>
                                        <Group gap={5} align="center">
                                            <Text size="sm" fw={700} style={{ color: textPri }}>{trip.origin}</Text>
                                            <Text size="xs" style={{ color: '#EA580C', fontWeight: 900 }}>→</Text>
                                            <Text size="sm" fw={700} style={{ color: textPri }}>{trip.destination}</Text>
                                        </Group>
                                        {trip.cargo?.length > 0 && (
                                            <Text size="xs" style={{ color: textSec }}>{trip.cargo.length} cargo item{trip.cargo.length !== 1 ? 's' : ''}</Text>
                                        )}
                                    </Stack>

                                    {/* Driver / Vehicle */}
                                    <Stack gap={2}>
                                        {trip.driver ? (
                                            <Text size="sm" fw={600} style={{ color: textPri }}>{trip.driver.name}</Text>
                                        ) : (
                                            <Text size="sm" style={{ color: textMut }}>—</Text>
                                        )}
                                        {trip.vehicle && (
                                            <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 5, padding: '2px 8px', width: 'fit-content' }}>
                                                <Text size="10px" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.8 }}>{trip.vehicle.registration_number}</Text>
                                            </Box>
                                        )}
                                    </Stack>

                                    {/* Departure */}
                                    <Text size="xs" fw={600} style={{ color: textPri }}>
                                        {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </Text>

                                    {/* Status */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                                        <Box style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}`, flexShrink: 0 }} />
                                        <Text size="xs" fw={700} style={{ color: meta.color, letterSpacing: 0.4 }}>{meta.label}</Text>
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {trips.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{trips.total} total trip{trips.total !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {trips.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={trips.current_page}
                        total={trips.last_page}
                        onChange={p => router.get('/portal/trips', { ...(status ? { status } : {}), page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </PortalLayout>
    );
}

import { Box, Text, Group, Stack, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import DriverLayout from '../../../layouts/DriverLayout';

export default function DriverCheckInsIndex({ checkIns, statuses }) {
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

    return (
        <DriverLayout title="My Check-Ins">
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📍</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">My Check-Ins</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Location &amp; status updates</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {checkIns.data.length > 0 && (
                                <Box style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '6px 16px' }}>
                                    <Text size="sm" fw={700} c="white">{checkIns.total} check-ins</Text>
                                </Box>
                            )}
                            <Box component={Link} href="/driver/check-ins/create"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                + Check-In Mpya
                            </Box>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Check-Ins</Text>
                        {checkIns.data.length > 0 && (
                            <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 12, padding: '1px 8px' }}>
                                <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{checkIns.total}</Text>
                            </Box>
                        )}
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {checkIns.data.length > 0 ? `${checkIns.from ?? 1}–${checkIns.to ?? checkIns.data.length} of ${checkIns.total}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 140px 110px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Trip', 'Location', 'Odometer', 'Time', 'Status'].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {checkIns.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>📍</Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>Hakuna check-ins bado</Text>
                        <Text size="sm" style={{ color: textMut }}>Your location check-ins will appear here</Text>
                    </Box>
                ) : (
                    checkIns.data.map((c, i) => {
                        const s = statuses[c.status] ?? { label: c.status, color: '#94A3B8' };
                        return (
                            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: '140px 1fr 120px 140px 110px', gap: 0,
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`,
                                        alignItems: 'start', transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${s.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                >
                                    {/* Trip */}
                                    {c.trip ? (
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px', width: 'fit-content' }}>
                                            <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{c.trip.trip_number}</Text>
                                        </Box>
                                    ) : (
                                        <Text size="xs" style={{ color: textMut }}>—</Text>
                                    )}

                                    {/* Location */}
                                    <Stack gap={2}>
                                        <Text size="sm" style={{ color: textPri }}>
                                            {c.location || (c.lat && c.lng ? `${c.lat}, ${c.lng}` : 'Hakuna mahali')}
                                        </Text>
                                        {c.notes && (
                                            <Text size="xs" style={{ color: textMut, fontStyle: 'italic' }}>↪ {c.notes}</Text>
                                        )}
                                    </Stack>

                                    {/* Odometer */}
                                    <Text size="sm" style={{ color: textSec }}>
                                        {c.odometer_km ? `${Number(c.odometer_km).toLocaleString()} km` : '—'}
                                    </Text>

                                    {/* Time */}
                                    <Text size="xs" style={{ color: textSec }}>
                                        {new Date(c.checked_in_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </Text>

                                    {/* Status */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.color + '18', border: `1px solid ${s.color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                                        <Box style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}`, flexShrink: 0 }} />
                                        <Text size="xs" fw={700} style={{ color: s.color, letterSpacing: 0.4 }}>{s.label}</Text>
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {checkIns.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{checkIns.total} total check-in{checkIns.total !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {checkIns.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={checkIns.current_page}
                        total={checkIns.last_page}
                        onChange={p => router.get('/driver/check-ins', { page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DriverLayout>
    );
}

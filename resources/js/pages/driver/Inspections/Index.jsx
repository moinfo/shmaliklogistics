import { Box, Text, Group, Stack, Pagination } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useMantineColorScheme } from '@mantine/core';
import DriverLayout from '../../../layouts/DriverLayout';

export default function DriverInspectionsIndex({ inspections, statuses, types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0600' : '#ffffff';
    const cardBorder = isDark ? 'rgba(234,88,12,0.15)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    return (
        <DriverLayout title="My Inspections">
            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={20} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 16, padding: '18px 24px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔧</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">My Inspections</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Vehicle inspection records</Text>
                            </Stack>
                        </Group>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box
                                component={Link}
                                href="/driver/inspections/create"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 13, padding: '9px 18px', borderRadius: 10, textDecoration: 'none' }}
                            >
                                + Ukaguzi Mpya
                            </Box>
                        </motion.div>
                    </Group>
                </Box>
            </motion.div>

            {inspections.data.length === 0 ? (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '60px 20px', textAlign: 'center', boxShadow: cardShadow }}>
                    <Text style={{ fontSize: '2.4rem', marginBottom: 12 }}>🔧</Text>
                    <Text fw={600} style={{ color: textPri }}>Hakuna ukaguzi bado</Text>
                    <Text size="sm" style={{ color: textSec, marginTop: 4 }}>Anza ukaguzi wa kwanza wa gari lako</Text>
                </Box>
            ) : (
                <Stack gap="sm">
                    {inspections.data.map((i, idx) => {
                        const s = statuses[i.overall_status] ?? { label: i.overall_status, color: '#94A3B8' };
                        const t = types[i.inspection_type] ?? { label: i.inspection_type, color: '#94A3B8' };
                        return (
                            <motion.div key={i.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                                <Box
                                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow, borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderLeftColor = '#EA580C'; e.currentTarget.style.background = rowHov; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.background = cardBg; }}
                                >
                                    <Group justify="space-between" wrap="wrap">
                                        <Box>
                                            <Group gap={8} mb={4}>
                                                <Box style={{ background: t.color + '22', border: `1px solid ${t.color}55`, borderRadius: 14, padding: '2px 10px' }}>
                                                    <Text size="10px" fw={700} style={{ color: t.color }}>{t.label}</Text>
                                                </Box>
                                                <Box style={{ background: s.color + '22', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '2px 10px' }}>
                                                    <Text size="10px" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                                </Box>
                                            </Group>
                                            <Text size="sm" fw={600} style={{ color: textPri }}>{i.vehicle?.plate || '—'}</Text>
                                            <Text size="xs" style={{ color: textSec }}>{new Date(i.inspected_at).toLocaleString()}</Text>
                                        </Box>
                                        <Box ta="right">
                                            <Text size="xs" style={{ color: textSec }}>Odometer</Text>
                                            <Text size="sm" fw={600} style={{ color: textPri }}>{i.odometer_km ? `${Number(i.odometer_km).toLocaleString()} km` : '—'}</Text>
                                        </Box>
                                    </Group>
                                </Box>
                            </motion.div>
                        );
                    })}
                </Stack>
            )}

            {inspections.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={inspections.current_page}
                        total={inspections.last_page}
                        onChange={p => router.get('/driver/inspections', { page: p })}
                        size="sm"
                        color="orange"
                    />
                </Group>
            )}
        </DriverLayout>
    );
}

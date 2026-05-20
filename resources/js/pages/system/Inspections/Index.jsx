import { Box, Text, Group, Stack, SimpleGrid, Select, Pagination } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

export default function AdminInspectionsIndex({ inspections, stats, vehicles, drivers, statuses, types, filters }) {
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

    const apply = (key, val) => {
        router.get('/system/inspections', { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
    };

    const statCards = [
        { icon: '📋', label: 'Total',        value: String(stats.total),
          grad: 'linear-gradient(135deg, #0E4FA0 0%, #1D4ED8 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '📅', label: 'Today',        value: String(stats.today),
          grad: 'linear-gradient(135deg, #5B21B6 0%, #6D28D9 60%, #A78BFA 100%)', glow: '0 8px 28px rgba(139,92,246,0.4)' },
        { icon: '⚠️', label: 'Minor Issues', value: String(stats.issues),
          grad: 'linear-gradient(135deg, #78350F 0%, #92400E 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
        { icon: '🚨', label: 'Critical',     value: String(stats.critical),
          grad: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 60%, #EF4444 100%)', glow: '0 8px 28px rgba(239,68,68,0.4)' },
    ];

    const cols = '140px 1fr 160px 130px 130px 80px';

    return (
        <DashboardLayout title="Vehicle Inspections">

            {/* Page header */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📋</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Vehicle Inspections</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Driver-submitted pre-trip & on-route inspection reports</Text>
                            </Stack>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md" wrap="wrap">
                    <Select placeholder="All vehicles" clearable value={filters.vehicle_id ?? null} onChange={v => apply('vehicle_id', v)}
                        data={vehicles.map(v => ({ value: String(v.id), label: v.plate }))}
                        styles={inputStyles} w={180} />
                    <Select placeholder="All drivers" clearable value={filters.driver_id ?? null} onChange={v => apply('driver_id', v)}
                        data={drivers.map(d => ({ value: String(d.id), label: d.name }))}
                        styles={inputStyles} w={200} />
                    <Select placeholder="Any status" clearable value={filters.status ?? null} onChange={v => apply('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={inputStyles} w={160} />
                    <Select placeholder="Any type" clearable value={filters.type ?? null} onChange={v => apply('type', v)}
                        data={Object.entries(types).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={inputStyles} w={160} />
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Inspections</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>{inspections.total ?? inspections.data.length} total</Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px', gap: 0 }}>
                    {['Inspected', 'Driver / Vehicle', 'Type', 'Status', 'Odometer', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {inspections.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                            📋
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No inspections match these filters</Text>
                        <Text size="sm" style={{ color: textMut }}>Try adjusting the filter selections above</Text>
                    </Box>
                ) : (
                    inspections.data.map((inspection, idx) => {
                        const s = statuses[inspection.overall_status] ?? { label: inspection.overall_status, color: '#94A3B8' };
                        const t = types[inspection.inspection_type]   ?? { label: inspection.inspection_type, color: '#94A3B8' };
                        return (
                            <motion.div key={inspection.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                                <Box
                                    component={Link}
                                    href={`/system/inspections/${inspection.id}`}
                                    style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 20px', borderBottom: `1px solid ${divider}`, textDecoration: 'none', alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${s.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>

                                    {/* Time */}
                                    <Text size="xs" fw={600} style={{ color: textSec }}>{new Date(inspection.inspected_at).toLocaleString()}</Text>

                                    {/* Driver / Vehicle */}
                                    <Stack gap={2}>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{inspection.driver?.name ?? '—'}</Text>
                                        {inspection.vehicle?.plate && (
                                            <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 6, padding: '2px 8px', width: 'fit-content' }}>
                                                <Text size="xs" fw={700} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{inspection.vehicle.plate}</Text>
                                            </Box>
                                        )}
                                    </Stack>

                                    {/* Type */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: t.color + '18', border: `1px solid ${t.color}35`, borderRadius: 20, padding: '4px 12px', width: 'fit-content' }}>
                                        <Box style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                                        <Text size="xs" fw={700} style={{ color: t.color }}>{t.label}</Text>
                                    </Box>

                                    {/* Status */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.color + '18', border: `1px solid ${s.color}35`, borderRadius: 20, padding: '4px 12px', width: 'fit-content' }}>
                                        <Box style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                        <Text size="xs" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                    </Box>

                                    {/* Odometer */}
                                    <Text size="xs" style={{ color: textSec }}>{inspection.odometer_km ? `${Number(inspection.odometer_km).toLocaleString()} km` : '—'}</Text>

                                    {/* Link */}
                                    <Text size="xs" style={{ color: '#EA580C', textAlign: 'right', fontWeight: 700 }}>View →</Text>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {inspections.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{inspections.total ?? inspections.data.length} total inspection{(inspections.total ?? inspections.data.length) !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {inspections.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={inspections.current_page}
                        total={inspections.last_page}
                        onChange={p => router.get('/system/inspections', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

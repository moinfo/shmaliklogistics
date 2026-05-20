import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

export default function FleetUtilization({ vehicleStats, monthly, totalTrips, totalRevenue, totalFleet, activeVehicles, year, availableYears }) {
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

    const [selYear, setSelYear] = useState(String(year));

    const utilizationPct = totalFleet > 0 ? ((activeVehicles / totalFleet) * 100).toFixed(1) : '0.0';
    const maxRevenue     = vehicleStats.length ? Math.max(...vehicleStats.map(v => Number(v.total_revenue)), 1) : 1;
    const maxMonthTrips  = monthly.length ? Math.max(...monthly.map(m => Number(m.trips)), 1) : 1;

    const statCards = [
        { icon: '🚛', label: 'Total Trips',       value: String(totalTrips), grad: 'linear-gradient(135deg,#1D4ED8 0%,#2563EB 60%,#3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '💰', label: 'Total Revenue',      value: `TZS ${fmt(totalRevenue)}`, grad: 'linear-gradient(135deg,#065F46 0%,#047857 60%,#10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { icon: '🔑', label: 'Active Vehicles',    value: `${activeVehicles} / ${totalFleet}`, grad: 'linear-gradient(135deg,#0369A1 0%,#0284C7 60%,#0EA5E9 100%)', glow: '0 8px 28px rgba(14,165,233,0.4)' },
        { icon: '📊', label: 'Fleet Utilization',  value: `${utilizationPct}%`, grad: Number(utilizationPct) >= 70 ? 'linear-gradient(135deg,#065F46,#10B981)' : 'linear-gradient(135deg,#B45309,#F59E0B)', glow: '0 8px 28px rgba(100,100,100,0.3)' },
    ];

    return (
        <DashboardLayout title="Fleet Utilization">
            <Head title="Fleet Utilization" />

            {/* Page Header Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)' : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🚛</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Fleet Utilization</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Performance and revenue per vehicle</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            <Select
                                value={selYear}
                                onChange={v => { setSelYear(v); router.get('/system/reports/fleet-utilization', { year: v }, { preserveState: true, replace: true }); }}
                                data={availableYears.length ? availableYears.map(y => ({ value: String(y), label: String(y) })) : [{ value: String(year), label: String(year) }]}
                                style={{ width: 110 }}
                                styles={{
                                    input: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 10, backdropFilter: 'blur(8px)' },
                                    dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12 },
                                }}
                            />
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
                            <Group justify="space-between" align="flex-start" mb={10}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '1.35rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Monthly trips sparkline */}
            {monthly.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Box mb={20} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Text size="md">📈</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Monthly Trips — {year}</Text>
                        </Box>
                        <Box style={{ padding: '20px 20px 16px' }}>
                            <Box style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
                                {monthly.map(m => {
                                    const h = (Number(m.trips) / maxMonthTrips) * 100;
                                    return (
                                        <Box key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <Box style={{ width: '100%', height: `${Math.max(h, 4)}%`, background: 'linear-gradient(180deg,#3B82F6,#1D4ED8)', borderRadius: '3px 3px 0 0', minHeight: 4 }} title={`${m.trips} trips`} />
                                            <Text size="xs" style={{ color: textMut }}>{MONTHS[m.month]}</Text>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Per-vehicle table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #0369A1, #0EA5E9)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text size="md">🚗</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Per Vehicle Performance</Text>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['Vehicle', 'Trips', 'Revenue (TZS)', 'Costs (TZS)', 'Profit (TZS)', 'Avg Rev/Trip', 'Cargo (t)', 'Share'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 16px', textAlign: i > 0 ? 'right' : 'left', fontSize: 10, fontWeight: 800, color: textMut, letterSpacing: 0.9, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {vehicleStats.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center' }}>
                                            <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚛</Text>
                                            <Text fw={600} size="sm" style={{ color: textSec }}>No trip data for the selected period.</Text>
                                        </td>
                                    </tr>
                                ) : vehicleStats.map((v, i) => {
                                    const share = totalRevenue > 0 ? ((v.total_revenue / totalRevenue) * 100).toFixed(1) : 0;
                                    const barW  = (v.total_revenue / maxRevenue) * 100;
                                    return (
                                        <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                            style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = '3px solid #EA580C'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                                    <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{v.vehicle_plate ?? '—'}</Text>
                                                </Box>
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: textPri }}>{v.trip_count}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(v.total_revenue)}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: '#F59E0B' }}>{fmt(v.total_costs)}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={700} style={{ color: v.total_profit >= 0 ? '#22C55E' : '#EF4444' }}>{fmt(v.total_profit)}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{fmt(v.avg_revenue_per_trip)}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{v.total_cargo_tons ? Number(v.total_cargo_tons).toFixed(1) : '—'}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                <Box style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                                                    <Box style={{ width: 50, height: 5, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 3 }}>
                                                        <Box style={{ height: '100%', width: `${barW}%`, background: 'linear-gradient(90deg,#3B82F6,#1D4ED8)', borderRadius: 3 }} />
                                                    </Box>
                                                    <Text size="xs" style={{ color: textSec, minWidth: 36, textAlign: 'right' }}>{share}%</Text>
                                                </Box>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </motion.div>
        </DashboardLayout>
    );
}

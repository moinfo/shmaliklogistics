import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ExportMenu from '../../../components/ExportMenu';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function profitColor(profit) {
    if (profit > 0) return '#22C55E';
    if (profit < 0) return '#EF4444';
    return '#94A3B8';
}

function marginBadgeColor(margin) {
    if (margin >= 30) return '#22C55E';
    if (margin >= 15) return '#F59E0B';
    return '#EF4444';
}

export default function RouteProfitability({ routes, summary, monthly, drivers, year, month, availableYears }) {
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

    const [selYear, setSelYear]   = useState(String(year));
    const [selMonth, setSelMonth] = useState(String(month ?? ''));

    const applyFilters = (y, m) => {
        router.get('/system/reports/route-profitability', { year: y, month: m }, { preserveState: true, replace: true });
    };

    const yearOptions  = availableYears.map(y => ({ value: String(y), label: String(y) }));
    const monthOptions = [{ value: '', label: 'Full Year' }, ...MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m }))];
    const maxBarRevenue = monthly.length ? Math.max(...monthly.map(m => Number(m.revenue ?? 0))) : 1;

    const inputStylesFrosted = {
        input: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 10, backdropFilter: 'blur(8px)' },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

    const statCards = [
        { icon: '🚛', label: 'Total Trips',   value: String(summary.total_trips),        grad: 'linear-gradient(135deg,#1D4ED8 0%,#2563EB 60%,#3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '💵', label: 'Total Revenue', value: `TZS ${fmt(summary.total_revenue)}`, grad: 'linear-gradient(135deg,#065F46 0%,#047857 60%,#10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { icon: '💸', label: 'Total Costs',   value: `TZS ${fmt(summary.total_costs)}`,   grad: 'linear-gradient(135deg,#B45309 0%,#D97706 60%,#F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
        { icon: summary.total_profit >= 0 ? '📈' : '📉', label: 'Net Profit', value: `TZS ${fmt(summary.total_profit)}`, grad: summary.total_profit >= 0 ? 'linear-gradient(135deg,#065F46,#10B981)' : 'linear-gradient(135deg,#7F1D1D,#EF4444)', glow: '0 8px 28px rgba(100,100,100,0.3)' },
        { icon: '📊', label: 'Margin',        value: `${summary.margin}%`,               grad: marginBadgeColor(summary.margin) === '#22C55E' ? 'linear-gradient(135deg,#065F46,#10B981)' : marginBadgeColor(summary.margin) === '#F59E0B' ? 'linear-gradient(135deg,#B45309,#F59E0B)' : 'linear-gradient(135deg,#7F1D1D,#EF4444)', glow: '0 8px 28px rgba(100,100,100,0.3)' },
    ];

    return (
        <DashboardLayout title="Route Profitability">
            <Head title="Route Profitability" />

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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📍</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Route Profitability</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Revenue, costs and margins by route</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            <Select value={selYear} onChange={v => { setSelYear(v); applyFilters(v, selMonth); }}
                                data={yearOptions.length ? yearOptions : [{ value: String(year), label: String(year) }]}
                                style={{ width: 100 }} styles={inputStylesFrosted} />
                            <Select value={selMonth} onChange={v => { const m = v ?? ''; setSelMonth(m); applyFilters(selYear, m); }}
                                data={monthOptions} style={{ width: 130 }} styles={inputStylesFrosted} clearable />
                            <ExportMenu baseUrl="/system/reports/route-profitability/export" params={{ year: selYear, month: selMonth }} />
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat Cards */}
            <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={10}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '1.2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Monthly trend bars */}
            {monthly.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Box mb={20} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Text size="md">📊</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Monthly Trend — {year}</Text>
                        </Box>
                        <Box style={{ padding: '20px 20px 16px' }}>
                            <Box style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
                                {monthly.map(m => {
                                    const revH  = maxBarRevenue > 0 ? (Number(m.revenue) / maxBarRevenue) * 100 : 0;
                                    const costH = maxBarRevenue > 0 ? (Number(m.costs) / maxBarRevenue) * 100 : 0;
                                    return (
                                        <Box key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <Box style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 90 }}>
                                                <Box style={{ flex: 1, height: `${revH}%`, background: 'linear-gradient(180deg,#3B82F6,#1D4ED8)', borderRadius: '3px 3px 0 0', minHeight: 2 }} title={`Rev: TZS ${fmt(m.revenue)}`} />
                                                <Box style={{ flex: 1, height: `${costH}%`, background: 'linear-gradient(180deg,#F59E0B,#B45309)', borderRadius: '3px 3px 0 0', minHeight: 2 }} title={`Cost: TZS ${fmt(m.costs)}`} />
                                            </Box>
                                            <Text size="xs" style={{ color: textMut }}>{MONTHS[m.month]}</Text>
                                        </Box>
                                    );
                                })}
                            </Box>
                            <Group gap="lg" mt="md">
                                <Group gap={6}><Box style={{ width: 12, height: 12, background: '#3B82F6', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Revenue</Text></Group>
                                <Group gap={6}><Box style={{ width: 12, height: 12, background: '#F59E0B', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Costs</Text></Group>
                            </Group>
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Routes table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Box mb={24} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #0369A1, #0EA5E9)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text size="md">🗺️</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Routes</Text>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['Route', 'Trips', 'Revenue (TZS)', 'Costs (TZS)', 'Profit (TZS)', 'Margin', 'Avg Rev', 'Cargo (t)'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 16px', textAlign: i > 1 ? 'right' : 'left', fontSize: 10, fontWeight: 800, color: textMut, letterSpacing: 0.9, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {routes.length === 0 ? (
                                    <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center' }}>
                                        <Text style={{ fontSize: '2rem', marginBottom: 10 }}>🗺️</Text>
                                        <Text fw={600} size="sm" style={{ color: textSec }}>No data for the selected period.</Text>
                                    </td></tr>
                                ) : routes.map((r, i) => {
                                    const margin = r.total_revenue > 0 ? ((r.total_profit / r.total_revenue) * 100).toFixed(1) : 0;
                                    const mc = marginBadgeColor(Number(margin));
                                    return (
                                        <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                            style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = '3px solid #EA580C'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <Text fw={700} size="sm" style={{ color: textPri }}>{r.route_from}</Text>
                                                <Group gap={4} mt={2}><Text size="xs" style={{ color: '#EA580C', fontWeight: 900 }}>→</Text><Text size="xs" style={{ color: textSec }}>{r.route_to}</Text></Group>
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: textPri }}>{r.trip_count}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(r.total_revenue)}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: '#F59E0B' }}>{fmt(r.total_costs)}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={700} style={{ color: profitColor(r.total_profit) }}>{fmt(r.total_profit)}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                <Box style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, background: mc + '18', border: `1px solid ${mc}44` }}>
                                                    <Text size="xs" fw={700} style={{ color: mc }}>{margin}%</Text>
                                                </Box>
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{fmt(r.avg_revenue)}</Text></td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{r.total_cargo_tons ? Number(r.total_cargo_tons).toFixed(1) : '—'}</Text></td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </motion.div>

            {/* Top drivers */}
            {drivers.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #5B21B6, #8B5CF6)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Text size="md">🏆</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Top 10 Drivers by Revenue</Text>
                        </Box>
                        <Box style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                        {['#', 'Driver', 'Trips', 'Revenue (TZS)', 'Profit (TZS)'].map((h, i) => (
                                            <th key={i} style={{ padding: '10px 16px', textAlign: i > 1 ? 'right' : 'left', fontSize: 10, fontWeight: 800, color: textMut, letterSpacing: 0.9, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.map((d, i) => {
                                        const medalColors = ['#F59E0B', '#94A3B8', '#CD7F32'];
                                        const rankColor = i < 3 ? medalColors[i] : textMut;
                                        return (
                                            <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                                style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = '3px solid #EA580C'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>
                                                <td style={{ padding: '14px 16px', width: 48 }}>
                                                    {i < 3 ? (
                                                        <Box style={{ width: 28, height: 28, borderRadius: '50%', background: rankColor + '20', border: `1px solid ${rankColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text size="xs" fw={900} style={{ color: rankColor }}>{i + 1}</Text>
                                                        </Box>
                                                    ) : (
                                                        <Text size="sm" fw={700} style={{ color: textMut }}>{i + 1}</Text>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}><Text size="sm" fw={600} style={{ color: textPri }}>{d.driver_name ?? '—'}</Text></td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{d.trips}</Text></td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(d.revenue)}</Text></td>
                                                <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={700} style={{ color: profitColor(d.profit) }}>{fmt(d.profit)}</Text></td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Box>
                    </Box>
                </motion.div>
            )}
        </DashboardLayout>
    );
}

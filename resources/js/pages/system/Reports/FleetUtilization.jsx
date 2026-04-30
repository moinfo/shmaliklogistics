import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function SummaryCard({ label, value, color, isDark }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '20px 24px' }}>
            <Text size="xs" fw={700} style={{ color: isDark ? dk.textSec : '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
            <Text size="xl" fw={800} mt={4} style={{ color: color ?? (isDark ? dk.textPri : '#1E293B') }}>{value}</Text>
        </Box>
    );
}

export default function FleetUtilization({ vehicleStats, monthly, totalTrips, totalRevenue, totalFleet, activeVehicles, year, availableYears }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [selYear, setSelYear] = useState(String(year));

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
    };

    const utilizationPct = totalFleet > 0 ? ((activeVehicles / totalFleet) * 100).toFixed(1) : '0.0';
    const maxRevenue = vehicleStats.length ? Math.max(...vehicleStats.map(v => Number(v.total_revenue)), 1) : 1;
    const maxMonthTrips = monthly.length ? Math.max(...monthly.map(m => Number(m.trips)), 1) : 1;

    return (
        <DashboardLayout title="Fleet Utilization">
            <Head title="Fleet Utilization" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Fleet Utilization</Text>
                    <Text size="sm" style={{ color: textSec }}>Performance and revenue per vehicle</Text>
                </Stack>
                <Select value={selYear} onChange={v => { setSelYear(v); router.get('/system/reports/fleet-utilization', { year: v }, { preserveState: true, replace: true }); }}
                    data={availableYears.length ? availableYears.map(y => ({ value: String(y), label: String(y) })) : [{ value: String(year), label: String(year) }]}
                    styles={inputStyles} style={{ width: 110 }} />
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <SummaryCard label="Total Trips" value={totalTrips} isDark={isDark} />
                <SummaryCard label="Total Revenue (TZS)" value={fmt(totalRevenue)} color="#3B82F6" isDark={isDark} />
                <SummaryCard label="Active Vehicles" value={`${activeVehicles} / ${totalFleet}`} color="#22C55E" isDark={isDark} />
                <SummaryCard label="Fleet Utilization" value={`${utilizationPct}%`} color={Number(utilizationPct) >= 70 ? '#22C55E' : '#F59E0B'} isDark={isDark} />
            </SimpleGrid>

            {/* Monthly trips sparkline */}
            {monthly.length > 0 && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px', marginBottom: 20 }}>
                    <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Monthly Trips — {year}</Text>
                    <Box style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
                        {monthly.map(m => {
                            const h = (Number(m.trips) / maxMonthTrips) * 100;
                            return (
                                <Box key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <Box style={{ width: '100%', height: `${Math.max(h, 4)}%`, background: '#3B82F6', borderRadius: '3px 3px 0 0', minHeight: 4 }} title={`${m.trips} trips`} />
                                    <Text size="xs" style={{ color: textSec }}>{MONTHS[m.month]}</Text>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* Per-vehicle table */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                    <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1 }}>Per Vehicle Performance</Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Vehicle', 'Trips', 'Revenue (TZS)', 'Costs (TZS)', 'Profit (TZS)', 'Avg Rev/Trip', 'Cargo (t)', 'Share'].map((h, i) => (
                                    <th key={i} style={{ padding: '10px 16px', textAlign: i > 0 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {vehicleStats.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No trip data for the selected period.</td></tr>
                            ) : vehicleStats.map((v, i) => {
                                const share = totalRevenue > 0 ? ((v.total_revenue / totalRevenue) * 100).toFixed(1) : 0;
                                const barW  = (v.total_revenue / maxRevenue) * 100;
                                return (
                                    <tr key={i} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text fw={700} size="sm" style={{ color: textPri, fontFamily: 'monospace' }}>{v.vehicle_plate ?? '—'}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{v.trip_count}</Text></td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(v.total_revenue)}</Text></td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: '#F59E0B' }}>{fmt(v.total_costs)}</Text></td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" fw={700} style={{ color: v.total_profit >= 0 ? '#22C55E' : '#EF4444' }}>{fmt(v.total_profit)}</Text></td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{fmt(v.avg_revenue_per_trip)}</Text></td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{v.total_cargo_tons ? Number(v.total_cargo_tons).toFixed(1) : '—'}</Text></td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Box style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                                                <Box style={{ width: 50, height: 5, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 3 }}>
                                                    <Box style={{ height: '100%', width: `${barW}%`, background: '#3B82F6', borderRadius: 3 }} />
                                                </Box>
                                                <Text size="xs" style={{ color: textSec, minWidth: 36, textAlign: 'right' }}>{share}%</Text>
                                            </Box>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
            </Box>
        </DashboardLayout>
    );
}

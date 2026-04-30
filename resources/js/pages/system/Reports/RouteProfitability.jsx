import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function SummaryCard({ label, value, sub, color, isDark }) {
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '20px 24px' }}>
            <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
            <Text size="xl" fw={800} mt={4} style={{ color: color ?? textPri }}>{value}</Text>
            {sub && <Text size="xs" mt={2} style={{ color: textSec }}>{sub}</Text>}
        </Box>
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
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [selYear, setSelYear]   = useState(String(year));
    const [selMonth, setSelMonth] = useState(String(month ?? ''));

    const applyFilters = (y, m) => {
        router.get('/system/reports/route-profitability', { year: y, month: m }, { preserveState: true, replace: true });
    };

    const yearOptions  = availableYears.map(y => ({ value: String(y), label: String(y) }));
    const monthOptions = [{ value: '', label: 'Full Year' }, ...MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m }))];

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
    };

    const maxBarRevenue = monthly.length ? Math.max(...monthly.map(m => Number(m.revenue ?? 0))) : 1;

    return (
        <DashboardLayout title="Route Profitability">
            <Head title="Route Profitability" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Route Profitability</Text>
                    <Text size="sm" style={{ color: textSec }}>Revenue, costs and margins by route</Text>
                </Stack>
                <Group gap="sm">
                    <Select value={selYear} onChange={v => { setSelYear(v); applyFilters(v, selMonth); }} data={yearOptions.length ? yearOptions : [{ value: String(year), label: String(year) }]} styles={inputStyles} style={{ width: 100 }} />
                    <Select value={selMonth} onChange={v => { const m = v ?? ''; setSelMonth(m); applyFilters(selYear, m); }} data={monthOptions} styles={inputStyles} style={{ width: 130 }} clearable />
                </Group>
            </Group>

            {/* Summary */}
            <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="md" mb="xl">
                <SummaryCard label="Total Trips" value={summary.total_trips} isDark={isDark} />
                <SummaryCard label="Total Revenue" value={`TZS ${fmt(summary.total_revenue)}`} color="#3B82F6" isDark={isDark} />
                <SummaryCard label="Total Costs" value={`TZS ${fmt(summary.total_costs)}`} color="#F59E0B" isDark={isDark} />
                <SummaryCard label="Net Profit" value={`TZS ${fmt(summary.total_profit)}`} color={profitColor(summary.total_profit)} isDark={isDark} />
                <SummaryCard label="Margin" value={`${summary.margin}%`} color={marginBadgeColor(summary.margin)} isDark={isDark} />
            </SimpleGrid>

            {/* Monthly trend bars */}
            {monthly.length > 0 && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
                    <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Monthly Trend — {year}</Text>
                    <Box style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
                        {monthly.map(m => {
                            const revH = maxBarRevenue > 0 ? (Number(m.revenue) / maxBarRevenue) * 100 : 0;
                            const costH = maxBarRevenue > 0 ? (Number(m.costs) / maxBarRevenue) * 100 : 0;
                            return (
                                <Box key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <Box style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 90 }}>
                                        <Box style={{ flex: 1, height: `${revH}%`, background: '#3B82F6', borderRadius: '3px 3px 0 0', minHeight: 2 }} title={`Rev: TZS ${fmt(m.revenue)}`} />
                                        <Box style={{ flex: 1, height: `${costH}%`, background: '#F59E0B', borderRadius: '3px 3px 0 0', minHeight: 2 }} title={`Cost: TZS ${fmt(m.costs)}`} />
                                    </Box>
                                    <Text size="xs" style={{ color: textSec }}>{MONTHS[m.month]}</Text>
                                </Box>
                            );
                        })}
                    </Box>
                    <Group gap="lg" mt="md">
                        <Group gap={6}><Box style={{ width: 12, height: 12, background: '#3B82F6', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Revenue</Text></Group>
                        <Group gap={6}><Box style={{ width: 12, height: 12, background: '#F59E0B', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Costs</Text></Group>
                    </Group>
                </Box>
            )}

            {/* Routes table */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
                <Box style={{ padding: '16px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                    <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1 }}>Routes</Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Route', 'Trips', 'Revenue (TZS)', 'Costs (TZS)', 'Profit (TZS)', 'Margin', 'Avg Rev', 'Cargo (t)'].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: i > 1 ? 'right' : 'left', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {routes.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No data for the selected period.</td></tr>
                            ) : routes.map((r, i) => {
                                const margin = r.total_revenue > 0 ? ((r.total_profit / r.total_revenue) * 100).toFixed(1) : 0;
                                return (
                                    <tr key={i} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text fw={700} size="sm" style={{ color: textPri }}>{r.route_from}</Text>
                                            <Text size="xs" style={{ color: textSec }}>→ {r.route_to}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" style={{ color: textSec }}>{r.trip_count}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(r.total_revenue)}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" style={{ color: '#F59E0B' }}>{fmt(r.total_costs)}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" fw={700} style={{ color: profitColor(r.total_profit) }}>{fmt(r.total_profit)}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Badge size="sm" style={{ background: marginBadgeColor(Number(margin)) + '22', color: marginBadgeColor(Number(margin)), border: `1px solid ${marginBadgeColor(Number(margin))}44` }}>
                                                {margin}%
                                            </Badge>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" style={{ color: textSec }}>{fmt(r.avg_revenue)}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" style={{ color: textSec }}>{r.total_cargo_tons ? Number(r.total_cargo_tons).toFixed(1) : '—'}</Text>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
            </Box>

            {/* Top drivers */}
            {drivers.length > 0 && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                    <Box style={{ padding: '16px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1 }}>Top 10 Drivers by Revenue</Text>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                    {['#', 'Driver', 'Trips', 'Revenue (TZS)', 'Profit (TZS)'].map((h, i) => (
                                        <th key={i} style={{ padding: '12px 16px', textAlign: i > 1 ? 'right' : 'left', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.map((d, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text size="sm" fw={700} style={{ color: i < 3 ? ['#F59E0B', '#94A3B8', '#CD7F32'][i] : textSec }}>{i + 1}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text size="sm" fw={600} style={{ color: textPri }}>{d.driver_name ?? '—'}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" style={{ color: textSec }}>{d.trips}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(d.revenue)}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <Text size="sm" fw={700} style={{ color: profitColor(d.profit) }}>{fmt(d.profit)}</Text>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            )}
        </DashboardLayout>
    );
}

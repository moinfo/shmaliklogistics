import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function pct(a, b) { return b > 0 ? ((a / b) * 100).toFixed(1) : '0.0'; }

function SummaryCard({ label, value, color, isDark, sub }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '20px 24px' }}>
            <Text size="xs" fw={700} style={{ color: isDark ? dk.textSec : '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
            <Text size="xl" fw={800} mt={4} style={{ color: color ?? (isDark ? dk.textPri : '#1E293B') }}>{value}</Text>
            {sub && <Text size="xs" mt={2} style={{ color: isDark ? dk.textSec : '#64748B' }}>{sub}</Text>}
        </Box>
    );
}

export default function FinancialSummary({ months, totalRevenue, totalExpenses, totalMaintenance, totalProfit, expenseByCategory, outstanding, year, availableYears }) {
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

    const totalCosts = totalExpenses + totalMaintenance;
    const margin = totalRevenue > 0 ? pct(totalProfit, totalRevenue) : '0.0';
    const profitColor = totalProfit >= 0 ? '#22C55E' : '#EF4444';

    const maxBar = Math.max(...months.map(m => Math.max(m.revenue, m.total_costs)), 1);

    return (
        <DashboardLayout title="Financial Summary">
            <Head title="Financial Summary" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Financial Summary</Text>
                    <Text size="sm" style={{ color: textSec }}>Revenue, expenses and net profit overview</Text>
                </Stack>
                <Select value={selYear} onChange={v => { setSelYear(v); router.get('/system/reports/financial-summary', { year: v }, { preserveState: true, replace: true }); }}
                    data={availableYears.length ? availableYears.map(y => ({ value: String(y), label: String(y) })) : [{ value: String(year), label: String(year) }]}
                    styles={inputStyles} style={{ width: 110 }} />
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="md" mb="xl">
                <SummaryCard label="Total Revenue" value={`TZS ${fmt(totalRevenue)}`} color="#3B82F6" isDark={isDark} />
                <SummaryCard label="Expenses" value={`TZS ${fmt(totalExpenses)}`} color="#F59E0B" isDark={isDark} />
                <SummaryCard label="Maintenance" value={`TZS ${fmt(totalMaintenance)}`} color="#8B5CF6" isDark={isDark} />
                <SummaryCard label="Net Profit" value={`TZS ${fmt(totalProfit)}`} color={profitColor} isDark={isDark} />
                <SummaryCard label="Margin" value={`${margin}%`} color={Number(margin) >= 20 ? '#22C55E' : Number(margin) >= 10 ? '#F59E0B' : '#EF4444'} isDark={isDark} />
            </SimpleGrid>

            {/* Outstanding */}
            {outstanding && (outstanding.billed > 0) && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                    <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Outstanding Invoices</Text>
                    <Group gap="xl">
                        <Box><Text size="xs" style={{ color: textSec }}>Billed</Text><Text fw={800} size="lg" style={{ color: '#3B82F6' }}>TZS {fmt(outstanding.billed)}</Text></Box>
                        <Box><Text size="xs" style={{ color: textSec }}>Received</Text><Text fw={800} size="lg" style={{ color: '#22C55E' }}>TZS {fmt(outstanding.received)}</Text></Box>
                        <Box><Text size="xs" style={{ color: textSec }}>Balance Due</Text><Text fw={800} size="lg" style={{ color: '#EF4444' }}>TZS {fmt(outstanding.billed - outstanding.received)}</Text></Box>
                    </Group>
                </Box>
            )}

            {/* Monthly bar chart */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px', marginBottom: 20 }}>
                <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Monthly P&amp;L — {year}</Text>
                <Box style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 130 }}>
                    {months.map(m => {
                        const revH  = (m.revenue / maxBar) * 100;
                        const costH = (m.total_costs / maxBar) * 100;
                        return (
                            <Box key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <Box style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 100 }}>
                                    <Box style={{ flex: 1, height: `${Math.max(revH, 1)}%`, background: '#3B82F6', borderRadius: '3px 3px 0 0' }} title={`Rev: TZS ${fmt(m.revenue)}`} />
                                    <Box style={{ flex: 1, height: `${Math.max(costH, 1)}%`, background: '#F59E0B', borderRadius: '3px 3px 0 0' }} title={`Cost: TZS ${fmt(m.total_costs)}`} />
                                </Box>
                                <Text size="xs" style={{ color: textSec }}>{MONTHS[m.month]}</Text>
                            </Box>
                        );
                    })}
                </Box>
                <Group gap="lg" mt="md">
                    <Group gap={6}><Box style={{ width: 12, height: 12, background: '#3B82F6', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Revenue</Text></Group>
                    <Group gap={6}><Box style={{ width: 12, height: 12, background: '#F59E0B', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Expenses + Maintenance</Text></Group>
                </Group>
            </Box>

            {/* Monthly table */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                    <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1 }}>Month-by-Month</Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Month', 'Revenue', 'Expenses', 'Maintenance', 'Total Costs', 'Profit', 'Margin'].map((h, i) => (
                                    <th key={i} style={{ padding: '10px 16px', textAlign: i > 0 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {months.map(m => {
                                const mg = pct(m.profit, m.revenue);
                                return (
                                    <tr key={m.month} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" fw={600} style={{ color: textPri }}>{MONTHS[m.month]}</Text></td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: '#3B82F6' }}>{fmt(m.revenue)}</Text></td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: '#F59E0B' }}>{fmt(m.expenses)}</Text></td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: '#8B5CF6' }}>{fmt(m.maintenance)}</Text></td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{fmt(m.total_costs)}</Text></td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" fw={700} style={{ color: m.profit >= 0 ? '#22C55E' : '#EF4444' }}>{fmt(m.profit)}</Text></td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="xs" style={{ color: Number(mg) >= 20 ? '#22C55E' : Number(mg) >= 10 ? '#F59E0B' : '#EF4444' }}>{mg}%</Text></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
            </Box>

            {/* Expenses by category */}
            {expenseByCategory.length > 0 && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Expenses by Category</Text>
                    <Stack gap={10}>
                        {expenseByCategory.map(cat => {
                            const barW = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                            return (
                                <Box key={cat.category}>
                                    <Group justify="space-between" mb={4}>
                                        <Text size="sm" style={{ color: textPri }}>{cat.category}</Text>
                                        <Text size="sm" fw={600} style={{ color: '#F59E0B' }}>TZS {fmt(cat.total)} ({pct(cat.total, totalExpenses)}%)</Text>
                                    </Group>
                                    <Box style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 3 }}>
                                        <Box style={{ height: '100%', width: `${barW}%`, background: '#F59E0B', borderRadius: 3, transition: 'width 0.4s ease' }} />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            )}
        </DashboardLayout>
    );
}

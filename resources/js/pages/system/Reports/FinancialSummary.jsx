import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function pct(a, b) { return b > 0 ? ((a / b) * 100).toFixed(1) : '0.0'; }

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

export default function FinancialSummary({ months, totalRevenue, totalExpenses, totalMaintenance, totalProfit, expenseByCategory, outstanding, year, availableYears }) {
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

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

    const totalCosts = totalExpenses + totalMaintenance;
    const margin = totalRevenue > 0 ? pct(totalProfit, totalRevenue) : '0.0';
    const profitColor = totalProfit >= 0 ? '#22C55E' : '#EF4444';
    const maxBar = Math.max(...months.map(m => Math.max(m.revenue, m.total_costs)), 1);

    const statCards = [
        { icon: '💵', label: 'Total Revenue',  value: `TZS ${fmt(totalRevenue)}`,  grad: 'linear-gradient(135deg,#1D4ED8 0%,#2563EB 60%,#3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '💸', label: 'Expenses',        value: `TZS ${fmt(totalExpenses)}`, grad: 'linear-gradient(135deg,#B45309 0%,#D97706 60%,#F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
        { icon: '🔧', label: 'Maintenance',     value: `TZS ${fmt(totalMaintenance)}`, grad: 'linear-gradient(135deg,#5B21B6 0%,#7C3AED 60%,#8B5CF6 100%)', glow: '0 8px 28px rgba(139,92,246,0.4)' },
        { icon: totalProfit >= 0 ? '📈' : '📉', label: 'Net Profit', value: `TZS ${fmt(totalProfit)}`, grad: totalProfit >= 0 ? 'linear-gradient(135deg,#065F46 0%,#047857 60%,#10B981 100%)' : 'linear-gradient(135deg,#7F1D1D 0%,#991B1B 60%,#EF4444 100%)', glow: totalProfit >= 0 ? '0 8px 28px rgba(16,185,129,0.4)' : '0 8px 28px rgba(239,68,68,0.4)' },
        { icon: '📊', label: 'Margin',          value: `${margin}%`, grad: Number(margin) >= 20 ? 'linear-gradient(135deg,#065F46,#10B981)' : Number(margin) >= 10 ? 'linear-gradient(135deg,#B45309,#F59E0B)' : 'linear-gradient(135deg,#7F1D1D,#EF4444)', glow: '0 8px 28px rgba(100,100,100,0.3)' },
    ];

    return (
        <DashboardLayout title="Financial Summary">
            <Head title="Financial Summary" />

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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📊</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Financial Summary</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Revenue, expenses and net profit overview</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            <Select
                                value={selYear}
                                onChange={v => { setSelYear(v); router.get('/system/reports/financial-summary', { year: v }, { preserveState: true, replace: true }); }}
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
            <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="md" mb={24}>
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

            {/* Outstanding Invoices */}
            {outstanding && outstanding.billed > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Box mb={20} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #3B82F6, #60A5FA)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Text size="md">💳</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Outstanding Invoices</Text>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            <Group gap="xl">
                                <Stack gap={2}>
                                    <Text size="xs" style={{ color: textMut }}>Billed</Text>
                                    <Text fw={800} size="lg" style={{ color: '#3B82F6' }}>TZS {fmt(outstanding.billed)}</Text>
                                </Stack>
                                <Stack gap={2}>
                                    <Text size="xs" style={{ color: textMut }}>Received</Text>
                                    <Text fw={800} size="lg" style={{ color: '#22C55E' }}>TZS {fmt(outstanding.received)}</Text>
                                </Stack>
                                <Stack gap={2}>
                                    <Text size="xs" style={{ color: textMut }}>Balance Due</Text>
                                    <Text fw={800} size="lg" style={{ color: '#EF4444' }}>TZS {fmt(outstanding.billed - outstanding.received)}</Text>
                                </Stack>
                            </Group>
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Monthly bar chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box mb={20} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text size="md">📊</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Monthly P&L — {year}</Text>
                    </Box>
                    <Box style={{ padding: '20px 20px 16px' }}>
                        <Box style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 130 }}>
                            {months.map(m => {
                                const revH  = (m.revenue / maxBar) * 100;
                                const costH = (m.total_costs / maxBar) * 100;
                                return (
                                    <Box key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                        <Box style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 100 }}>
                                            <Box style={{ flex: 1, height: `${Math.max(revH, 1)}%`, background: 'linear-gradient(180deg,#3B82F6,#1D4ED8)', borderRadius: '3px 3px 0 0' }} title={`Rev: TZS ${fmt(m.revenue)}`} />
                                            <Box style={{ flex: 1, height: `${Math.max(costH, 1)}%`, background: 'linear-gradient(180deg,#F59E0B,#B45309)', borderRadius: '3px 3px 0 0' }} title={`Cost: TZS ${fmt(m.total_costs)}`} />
                                        </Box>
                                        <Text size="xs" style={{ color: textMut }}>{MONTHS[m.month]}</Text>
                                    </Box>
                                );
                            })}
                        </Box>
                        <Group gap="lg" mt="md">
                            <Group gap={6}><Box style={{ width: 12, height: 12, background: '#3B82F6', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Revenue</Text></Group>
                            <Group gap={6}><Box style={{ width: 12, height: 12, background: '#F59E0B', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Expenses + Maintenance</Text></Group>
                        </Group>
                    </Box>
                </Box>
            </motion.div>

            {/* Monthly table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Box mb={20} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #0369A1, #0EA5E9)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text size="md">📅</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Month-by-Month</Text>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['Month', 'Revenue', 'Expenses', 'Maintenance', 'Total Costs', 'Profit', 'Margin'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 16px', textAlign: i > 0 ? 'right' : 'left', fontSize: 10, fontWeight: 800, color: textMut, letterSpacing: 0.9, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {months.map((m, idx) => {
                                    const mg = pct(m.profit, m.revenue);
                                    return (
                                        <motion.tr key={m.month} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                                            style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s', borderLeft: '3px solid transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = '3px solid #EA580C'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" fw={700} style={{ color: textPri }}>{MONTHS[m.month]}</Text></td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(m.revenue)}</Text></td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: '#F59E0B' }}>{fmt(m.expenses)}</Text></td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: '#8B5CF6' }}>{fmt(m.maintenance)}</Text></td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{fmt(m.total_costs)}</Text></td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}><Text size="sm" fw={700} style={{ color: m.profit >= 0 ? '#22C55E' : '#EF4444' }}>{fmt(m.profit)}</Text></td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <Box style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, background: (Number(mg) >= 20 ? 'rgba(34,197,94,0.12)' : Number(mg) >= 10 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)'), border: `1px solid ${Number(mg) >= 20 ? 'rgba(34,197,94,0.3)' : Number(mg) >= 10 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                                                    <Text size="xs" fw={700} style={{ color: Number(mg) >= 20 ? '#22C55E' : Number(mg) >= 10 ? '#F59E0B' : '#EF4444' }}>{mg}%</Text>
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

            {/* Expenses by category */}
            {expenseByCategory.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #B45309, #F59E0B)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Text size="md">🏷️</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Expenses by Category</Text>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            <Stack gap={12}>
                                {expenseByCategory.map((cat, i) => {
                                    const barW = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                                    return (
                                        <motion.div key={cat.category} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                                            <Group justify="space-between" mb={6}>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{cat.category}</Text>
                                                <Text size="sm" fw={700} style={{ color: '#F59E0B' }}>TZS {fmt(cat.total)} <Text span size="xs" style={{ color: textMut }}>({pct(cat.total, totalExpenses)}%)</Text></Text>
                                            </Group>
                                            <Box style={{ height: 7, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderRadius: 4 }}>
                                                <Box style={{ height: '100%', width: `${barW}%`, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                                            </Box>
                                        </motion.div>
                                    );
                                })}
                            </Stack>
                        </Box>
                    </Box>
                </motion.div>
            )}
        </DashboardLayout>
    );
}

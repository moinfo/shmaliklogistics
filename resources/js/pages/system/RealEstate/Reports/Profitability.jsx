import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { formatDate } from '../../../../lib/date';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)' };

function fmt(n) { return new Intl.NumberFormat('en-TZ').format(Number(n ?? 0)); }

const TYPE_LABELS = {
    house: 'House', apartment: 'Apartment', room_block: 'Room Block',
    commercial: 'Commercial', farm: 'Farm', land: 'Land',
};

function netColor(n) {
    return Number(n ?? 0) >= 0 ? '#22C55E' : '#EF4444';
}

function occColor(pct) {
    const p = Number(pct ?? 0);
    if (p >= 80) return '#22C55E';
    if (p >= 50) return '#F59E0B';
    return '#EF4444';
}

function SummaryCard({ icon, label, value, accent, isDark }) {
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textMut = isDark ? dk.textMut : '#94A3B8';
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />
            <Text style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</Text>
            <Text fw={800} size="lg" style={{ color: textPri }}>{value}</Text>
            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>{label}</Text>
        </Box>
    );
}

export default function Profitability({ rows = [], totals = {}, filters = {} }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider = isDark ? dk.divider : '#F1F5F9';
    const cardBg = isDark ? dk.card : '#fff';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const applyFilters = (f, t) => {
        router.get('/system/real-estate/reports/profitability', { from: f, to: t }, { preserveState: true, replace: true });
    };

    const inputStyle = {
        padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`,
        background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri,
        fontSize: 14, outline: 'none', colorScheme: isDark ? 'dark' : 'light',
    };

    const th = { padding: '12px 16px', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' };
    const td = { padding: '14px 16px' };

    return (
        <DashboardLayout title="Profitability Report">
            <Head title="Profitability — Real Estate" />

            <Group justify="space-between" mb="xl" align="flex-start" className="re-noprint">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Profitability by Property</Text>
                    <Text size="sm" style={{ color: textSec }}>Rent billed, collected and expenses per property</Text>
                </Stack>
                <Group gap="sm" align="flex-end">
                    <Box>
                        <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>From</Text>
                        <Box component="input" type="date" value={from} onChange={e => { setFrom(e.target.value); applyFilters(e.target.value, to); }} style={inputStyle} />
                    </Box>
                    <Box>
                        <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>To</Text>
                        <Box component="input" type="date" value={to} onChange={e => { setTo(e.target.value); applyFilters(from, e.target.value); }} style={inputStyle} />
                    </Box>
                    <Box component="button" type="button" onClick={() => window.print()}
                        style={{ padding: '9px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        🖨️ Print
                    </Box>
                </Group>
            </Group>

            {(filters.from || filters.to) && (
                <Text size="sm" mb="md" style={{ color: textSec }}>
                    Period: {filters.from ? formatDate(filters.from) : 'beginning'} — {filters.to ? formatDate(filters.to) : 'today'}
                </Text>
            )}

            {/* Summary cards */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <SummaryCard icon="💰" label="Rent Collected (TZS)" value={fmt(totals.rent_collected)} accent={['#0E4FA0', '#3B82F6']} isDark={isDark} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
                    <SummaryCard icon="🧾" label="Expenses (TZS)" value={fmt(totals.expense)} accent={['#92400E', '#F59E0B']} isDark={isDark} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    <SummaryCard icon="📈" label="Net (TZS)" value={fmt(totals.net)} accent={Number(totals.net ?? 0) >= 0 ? ['#065F46', '#059669'] : ['#7F1D1D', '#EF4444']} isDark={isDark} />
                </motion.div>
            </SimpleGrid>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${divider}` }}>
                                <th style={{ ...th, textAlign: 'left' }}>Property</th>
                                <th style={{ ...th, textAlign: 'left' }}>Type</th>
                                <th style={{ ...th, textAlign: 'right' }}>Rent Billed</th>
                                <th style={{ ...th, textAlign: 'right' }}>Rent Collected</th>
                                <th style={{ ...th, textAlign: 'right' }}>Expenses</th>
                                <th style={{ ...th, textAlign: 'right' }}>Net</th>
                                <th style={{ ...th, textAlign: 'right' }}>Occupancy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: textSec }}>No properties for the selected period.</td></tr>
                            ) : rows.map((r, i) => (
                                <tr key={r.id ?? i} style={{ borderBottom: `1px solid ${divider}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={td}><Text size="sm" fw={700} style={{ color: textPri }}>{r.name}</Text></td>
                                    <td style={td}><Text size="sm" style={{ color: textSec }}>{TYPE_LABELS[r.type] ?? r.type ?? '—'}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" style={{ color: textSec }}>{fmt(r.rent_billed_tzs)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(r.rent_collected_tzs)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" style={{ color: '#F59E0B' }}>{fmt(r.expense_tzs)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={700} style={{ color: netColor(r.net_tzs) }}>{fmt(r.net_tzs)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <Badge size="sm" style={{ background: occColor(r.occupancy_pct) + '22', color: occColor(r.occupancy_pct), border: `1px solid ${occColor(r.occupancy_pct)}44` }}>
                                            {Number(r.occupancy_pct ?? 0).toFixed(0)}%
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {rows.length > 0 && (
                            <tfoot>
                                <tr style={{ borderTop: `2px solid ${isDark ? dk.border : '#E2E8F0'}`, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                                    <td style={td}><Text size="sm" fw={800} style={{ color: textPri }}>Totals</Text></td>
                                    <td style={td} />
                                    <td style={{ ...td, textAlign: 'right' }} />
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={800} style={{ color: '#3B82F6' }}>{fmt(totals.rent_collected)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={800} style={{ color: '#F59E0B' }}>{fmt(totals.expense)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={800} style={{ color: netColor(totals.net) }}>{fmt(totals.net)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </Box>
            </Box>
        </DashboardLayout>
    );
}
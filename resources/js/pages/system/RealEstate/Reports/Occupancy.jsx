import { Head } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)' };

function fmt(n) { return new Intl.NumberFormat('en-TZ').format(Number(n ?? 0)); }

const TYPE_LABELS = {
    house: 'House', apartment: 'Apartment', room_block: 'Room Block',
    commercial: 'Commercial', farm: 'Farm', land: 'Land',
};

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

function OccupancyBar({ pct, isDark }) {
    const p = Math.max(0, Math.min(100, Number(pct ?? 0)));
    const color = occColor(p);
    const track = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
            <Box style={{ flex: 1, height: 8, borderRadius: 6, background: track, overflow: 'hidden' }}>
                <Box style={{ width: `${p}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.3s' }} />
            </Box>
            <Text size="xs" fw={700} style={{ color, minWidth: 38, textAlign: 'right' }}>{p.toFixed(0)}%</Text>
        </Box>
    );
}

export default function Occupancy({ properties = [], totals = {} }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider = isDark ? dk.divider : '#F1F5F9';
    const cardBg = isDark ? dk.card : '#fff';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const th = { padding: '12px 16px', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' };
    const td = { padding: '14px 16px' };

    return (
        <DashboardLayout title="Occupancy Report">
            <Head title="Occupancy — Real Estate" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Occupancy Report</Text>
                    <Text size="sm" style={{ color: textSec }}>Units occupied versus vacant across all properties</Text>
                </Stack>
            </Group>

            {/* Summary cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <SummaryCard icon="🏘️" label="Total Units" value={fmt(totals.units)} accent={['#1565C0', '#2196F3']} isDark={isDark} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
                    <SummaryCard icon="✅" label="Occupied" value={fmt(totals.occupied)} accent={['#065F46', '#059669']} isDark={isDark} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    <SummaryCard icon="🚪" label="Vacant" value={fmt(totals.vacant)} accent={['#92400E', '#F59E0B']} isDark={isDark} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
                    <SummaryCard icon="📊" label="Occupancy %" value={`${Number(totals.occupancy_pct ?? 0).toFixed(0)}%`} accent={['#4C1D95', '#7C3AED']} isDark={isDark} />
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
                                <th style={{ ...th, textAlign: 'right' }}>Total Units</th>
                                <th style={{ ...th, textAlign: 'right' }}>Occupied</th>
                                <th style={{ ...th, textAlign: 'right' }}>Vacant</th>
                                <th style={{ ...th, textAlign: 'left', minWidth: 180 }}>Occupancy</th>
                                <th style={{ ...th, textAlign: 'right' }}>Monthly Roll (TZS)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: textSec }}>No properties found.</td></tr>
                            ) : properties.map((p, i) => (
                                <tr key={p.id ?? i} style={{ borderBottom: `1px solid ${divider}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={td}><Text size="sm" fw={700} style={{ color: textPri }}>{p.name}</Text></td>
                                    <td style={td}><Text size="sm" style={{ color: textSec }}>{TYPE_LABELS[p.type] ?? p.type ?? '—'}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" style={{ color: textPri }}>{fmt(p.total_units)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: '#22C55E' }}>{fmt(p.occupied_units)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" style={{ color: '#F59E0B' }}>{fmt(p.vacant_units)}</Text></td>
                                    <td style={td}><OccupancyBar pct={p.occupancy_pct} isDark={isDark} /></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{fmt(p.monthly_roll)}</Text></td>
                                </tr>
                            ))}
                        </tbody>
                        {properties.length > 0 && (
                            <tfoot>
                                <tr style={{ borderTop: `2px solid ${isDark ? dk.border : '#E2E8F0'}`, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                                    <td style={td}><Text size="sm" fw={800} style={{ color: textPri }}>Totals</Text></td>
                                    <td style={td} />
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={800} style={{ color: textPri }}>{fmt(totals.units)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={800} style={{ color: '#22C55E' }}>{fmt(totals.occupied)}</Text></td>
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={800} style={{ color: '#F59E0B' }}>{fmt(totals.vacant)}</Text></td>
                                    <td style={td}><OccupancyBar pct={totals.occupancy_pct} isDark={isDark} /></td>
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
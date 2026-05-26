import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { formatDate } from '../../../../lib/date';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)' };

function fmt(n) { return new Intl.NumberFormat('en-TZ').format(Number(n ?? 0)); }

function overdueColor(days) {
    const d = Number(days ?? 0);
    if (d > 90) return '#EF4444';
    if (d > 60) return '#F97316';
    if (d > 30) return '#F59E0B';
    return '#94A3B8';
}

function AgingCard({ label, value, color, isDark }) {
    const textMut = isDark ? dk.textMut : '#94A3B8';
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
            <Text size="xs" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
            <Text fw={800} size="lg" mt={6} style={{ color }}>{fmt(value)}</Text>
            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>TZS</Text>
        </Box>
    );
}

export default function Arrears({ rows = [], total_outstanding = 0, aging = {} }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const textMut = isDark ? dk.textMut : '#94A3B8';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider = isDark ? dk.divider : '#F1F5F9';
    const cardBg = isDark ? dk.card : '#fff';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const sorted = [...rows].sort((a, b) => Number(b.days_overdue ?? 0) - Number(a.days_overdue ?? 0));

    const th = { padding: '12px 16px', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' };
    const td = { padding: '14px 16px' };

    return (
        <DashboardLayout title="Arrears Report">
            <Head title="Arrears — Real Estate" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Arrears Report</Text>
                    <Text size="sm" style={{ color: textSec }}>Outstanding rent by tenant, aged by days overdue</Text>
                </Stack>
            </Group>

            {/* Total outstanding */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '20px 24px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                <Box style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#EF4444' }} />
                <Text size="xs" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>Total Outstanding</Text>
                <Text fw={800} size="xl" mt={4} style={{ color: '#EF4444' }}>TZS {fmt(total_outstanding)}</Text>
            </Box>

            {/* Aging buckets */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <AgingCard label="0 – 30 days" value={aging.d0_30} color="#94A3B8" isDark={isDark} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
                    <AgingCard label="31 – 60 days" value={aging.d31_60} color="#F59E0B" isDark={isDark} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    <AgingCard label="61 – 90 days" value={aging.d61_90} color="#F97316" isDark={isDark} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
                    <AgingCard label="90+ days" value={aging.d90_plus} color="#EF4444" isDark={isDark} />
                </motion.div>
            </SimpleGrid>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${divider}` }}>
                                <th style={{ ...th, textAlign: 'left' }}>Tenant</th>
                                <th style={{ ...th, textAlign: 'left' }}>Property</th>
                                <th style={{ ...th, textAlign: 'left' }}>Lease</th>
                                <th style={{ ...th, textAlign: 'right' }}>Outstanding (TZS)</th>
                                <th style={{ ...th, textAlign: 'left' }}>Oldest Due</th>
                                <th style={{ ...th, textAlign: 'right' }}>Days Overdue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '50px', textAlign: 'center', color: textSec }}>🎉 No arrears — everyone is paid up.</td></tr>
                            ) : sorted.map((r, i) => {
                                const c = overdueColor(r.days_overdue);
                                return (
                                    <tr key={i} style={{ borderBottom: `1px solid ${divider}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={td}><Text size="sm" fw={700} style={{ color: textPri }}>{r.tenant_name ?? '—'}</Text></td>
                                        <td style={td}><Text size="sm" style={{ color: textSec }}>{r.property_label ?? '—'}</Text></td>
                                        <td style={td}>
                                            <Box component={Link} href="/system/real-estate/leases" style={{ textDecoration: 'none' }}>
                                                <Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{r.lease_number ?? '—'}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={700} style={{ color: '#EF4444' }}>{fmt(r.outstanding_tzs)}</Text></td>
                                        <td style={td}><Text size="sm" style={{ color: textSec }}>{formatDate(r.oldest_due_date)}</Text></td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: c + '1A', border: `1px solid ${c}40`, borderRadius: 20, padding: '3px 10px' }}>
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 }} />
                                                <Text size="xs" fw={700} style={{ color: c }}>{Number(r.days_overdue ?? 0)}d</Text>
                                            </Box>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {sorted.length > 0 && (
                            <tfoot>
                                <tr style={{ borderTop: `2px solid ${isDark ? dk.border : '#E2E8F0'}`, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                                    <td style={td}><Text size="sm" fw={800} style={{ color: textPri }}>Total</Text></td>
                                    <td style={td} />
                                    <td style={td} />
                                    <td style={{ ...td, textAlign: 'right' }}><Text size="sm" fw={800} style={{ color: '#EF4444' }}>{fmt(total_outstanding)}</Text></td>
                                    <td style={td} />
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
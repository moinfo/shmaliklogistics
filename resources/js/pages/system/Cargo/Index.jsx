import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

const fmt  = n => new Intl.NumberFormat('en-TZ').format(Math.round(n ?? 0));
const fmtW = kg => kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${Math.round(kg)} kg`;

export default function CargoIndex({ cargos, stats, statuses, types, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider    = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';

    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');

    const applyFilter = (newStatus) => {
        setStatus(newStatus);
        router.get('/system/cargo', { search, status: newStatus }, { preserveState: true, replace: true });
    };

    const applySearch = () => {
        router.get('/system/cargo', { search, status }, { preserveState: true, replace: true });
    };

    const statCards = [
        { icon: '📦', label: 'Total Cargo', value: stats.total, accent: ['#1565C0','#2196F3'] },
        { icon: '🚛', label: 'In Transit',  value: stats.in_transit, accent: ['#0E4FA0','#1565C0'] },
        { icon: '🛂', label: 'At Border',   value: stats.at_border,  accent: ['#92400E','#F59E0B'] },
        { icon: '✅', label: 'Delivered',   value: stats.delivered,  accent: ['#065F46','#059669'] },
    ];

    return (
        <DashboardLayout title="Cargo">
            <Head title="Cargo Tracking" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Cargo Tracking</Text>
                    <Text size="sm" style={{ color: textSec }}>
                        {fmt(stats.total_kg)} kg active cargo across all shipments
                    </Text>
                </Stack>
                <Box component={Link} href="/system/cargo/create"
                    style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                    + Register Cargo
                </Box>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ height: 3, background: `linear-gradient(90deg,${s.accent[0]},${s.accent[1]})`, position: 'absolute', top: 0, left: 0, right: 0 }} />
                            <Group gap="sm" mt={4}>
                                <Text style={{ fontSize: '1.4rem' }}>{s.icon}</Text>
                                <Box>
                                    <Text fw={800} size="xl" style={{ color: textPri, lineHeight: 1 }}>{s.value}</Text>
                                    <Text size="xs" style={{ color: textSec }}>{s.label}</Text>
                                </Box>
                            </Group>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="sm" wrap="wrap">
                    <Box component="input" value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applySearch()}
                        placeholder="Search cargo number, description, consignee..."
                        style={{ flex: 1, minWidth: 220, padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none' }} />
                    <Box component="select" value={status} onChange={e => applyFilter(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? '#0F1E32' : '#fff', color: textPri, fontSize: 13, outline: 'none' }}>
                        <option value="">All Statuses</option>
                        {Object.entries(statuses).map(([v, d]) => <option key={v} value={v}>{d.label}</option>)}
                    </Box>
                    <Box component="button" onClick={applySearch}
                        style={{ padding: '9px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Search
                    </Box>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                                {['CARGO NO.','TYPE','DESCRIPTION','WEIGHT','ORIGIN → DESTINATION','CONSIGNEE','TRIP','STATUS',''].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textMut, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {cargos.data.length === 0 ? (
                                <tr><td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: textMut }}>
                                    No cargo records yet. <Link href="/system/cargo/create" style={{ color: '#3B82F6' }}>Register the first one →</Link>
                                </td></tr>
                            ) : cargos.data.map((c) => {
                                const st  = statuses[c.status] ?? { label: c.status, color: '#64748B' };
                                const tp  = types[c.type]     ?? { label: c.type,   color: '#64748B' };
                                return (
                                    <tr key={c.id} style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s', cursor: 'pointer' }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? '#132436' : '#F8FAFC'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: textPri, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{c.cargo_number}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <Box style={{ background: tp.color + '22', border: `1px solid ${tp.color}44`, borderRadius: 20, padding: '2px 10px', display: 'inline-block' }}>
                                                <Text size="11px" fw={700} style={{ color: tp.color }}>{tp.label}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: 13, color: textPri, maxWidth: 200 }}>
                                            <Text truncate size="sm" style={{ color: textPri }}>{c.description}</Text>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: 13, color: textSec, whiteSpace: 'nowrap' }}>{fmtW(c.weight_kg)}</td>
                                        <td style={{ padding: '12px 14px', fontSize: 12, color: textSec, whiteSpace: 'nowrap' }}>
                                            {c.origin && c.destination ? `${c.origin} → ${c.destination}` : c.origin || c.destination || '—'}
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: 13, color: textSec }}>{c.consignee_name || '—'}</td>
                                        <td style={{ padding: '12px 14px', fontSize: 12, color: '#60A5FA', fontFamily: 'monospace' }}>{c.trip?.trip_number || '—'}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <Box style={{ background: st.color + '22', border: `1px solid ${st.color}44`, borderRadius: 20, padding: '2px 10px', display: 'inline-block' }}>
                                                <Text size="11px" fw={700} style={{ color: st.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{st.label}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <Group gap={6} wrap="nowrap">
                                                <Box component={Link} href={`/system/cargo/${c.id}`}
                                                    style={{ padding: '5px 12px', borderRadius: 6, background: isDark ? 'var(--c-border-strong)' : '#EFF6FF', color: '#3B82F6', textDecoration: 'none', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    View
                                                </Box>
                                                <Box component={Link} href={`/system/cargo/${c.id}/edit`}
                                                    style={{ padding: '5px 12px', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, textDecoration: 'none', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    Edit
                                                </Box>
                                            </Group>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>

                {/* Pagination */}
                {cargos.last_page > 1 && (
                    <Group justify="space-between" style={{ padding: '14px 20px', borderTop: `1px solid ${cardBorder}` }}>
                        <Text size="xs" style={{ color: textMut }}>Showing {cargos.from}–{cargos.to} of {cargos.total}</Text>
                        <Group gap={6}>
                            {cargos.links.filter(l => l.url).map((l, i) => (
                                <Box key={i} component={Link} href={l.url}
                                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: l.active ? 'linear-gradient(135deg,#1565C0,#2196F3)' : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'), color: l.active ? '#fff' : textSec }}>
                                    {l.label.replace('&laquo;', '←').replace('&raquo;', '→')}
                                </Box>
                            ))}
                        </Group>
                    </Group>
                )}
            </Box>
        </DashboardLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';

const fmt  = n => new Intl.NumberFormat('en-TZ').format(Math.round(n ?? 0));
const fmtW = kg => kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${Math.round(kg)} kg`;

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}`, flexShrink: 0 }} />
            <Text size="xs" fw={700} style={{ color: meta.color, letterSpacing: 0.4 }}>{meta.label}</Text>
        </Box>
    );
}

export default function CargoIndex({ cargos, stats, statuses, types, filters }) {
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

    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const can = useCan();

    const applyFilter = (newStatus) => {
        setStatus(newStatus);
        router.get('/system/cargo', { search, status: newStatus }, { preserveState: true, replace: true });
    };

    const applySearch = () => {
        router.get('/system/cargo', { search, status }, { preserveState: true, replace: true });
    };

    const statCards = [
        { icon: '📦', label: 'Total Cargo', value: String(stats.total),
          grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '🚛', label: 'In Transit',  value: String(stats.in_transit),
          grad: 'linear-gradient(135deg, #0369A1 0%, #0284C7 60%, #0EA5E9 100%)', glow: '0 8px 28px rgba(14,165,233,0.4)' },
        { icon: '🛂', label: 'At Border',   value: String(stats.at_border),
          grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
        { icon: '✅', label: 'Delivered',   value: String(stats.delivered),
          grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
    ];

    const cols = '140px 110px 1fr 90px 180px 130px 110px 110px 80px';

    return (
        <DashboardLayout title="Cargo">
            <Head title="Cargo Tracking" />

            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Cargo Tracking</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{fmt(stats.total_kg)} kg active cargo across all shipments</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('cargo.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/cargo/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ Register Cargo
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="sm" wrap="wrap">
                    <Box component="input" value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applySearch()}
                        placeholder="Search cargo number, description, consignee…"
                        style={{ flex: 1, minWidth: 220, padding: '9px 12px', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none' }} />
                    <Box component="select" value={status} onChange={e => applyFilter(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, background: isDark ? '#1A0900' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none' }}>
                        <option value="">All Statuses</option>
                        {Object.entries(statuses).map(([v, d]) => <option key={v} value={v}>{d.label}</option>)}
                    </Box>
                    <Tooltip label="Search">
                        <ActionIcon onClick={applySearch} size={38} radius={10}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Cargo</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {cargos.data.length > 0 ? `Showing ${cargos.from ?? 1}–${cargos.to ?? cargos.data.length} of ${cargos.total ?? cargos.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px', gap: 0 }}>
                    {['CARGO NO.', 'TYPE', 'DESCRIPTION', 'WEIGHT', 'ORIGIN → DEST', 'CONSIGNEE', 'TRIP', 'STATUS', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {cargos.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                            📦
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No cargo records yet</Text>
                        <Text size="sm" style={{ color: textMut }}>
                            <Box component={Link} href="/system/cargo/create" style={{ color: '#EA580C', textDecoration: 'none' }}>Register the first one →</Box>
                        </Text>
                    </Box>
                ) : (
                    cargos.data.map((c, i) => {
                        const st = statuses[c.status] ?? { label: c.status, color: '#64748B' };
                        const tp = types[c.type]     ?? { label: c.type,   color: '#64748B' };
                        return (
                            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${st.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/system/cargo/${c.id}`)}>

                                    {/* Cargo # */}
                                    <Box>
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                            <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{c.cargo_number}</Text>
                                        </Box>
                                    </Box>

                                    {/* Type */}
                                    <Box style={{ display: 'inline-flex', background: tp.color + '18', border: `1px solid ${tp.color}35`, borderRadius: 20, padding: '3px 10px' }}>
                                        <Text size="11px" fw={700} style={{ color: tp.color }}>{tp.label}</Text>
                                    </Box>

                                    {/* Description */}
                                    <Text size="sm" style={{ color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{c.description}</Text>

                                    {/* Weight */}
                                    <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{fmtW(c.weight_kg)}</Text>

                                    {/* Route */}
                                    <Text size="xs" style={{ color: textSec, whiteSpace: 'nowrap' }}>
                                        {c.origin && c.destination ? `${c.origin} → ${c.destination}` : c.origin || c.destination || '—'}
                                    </Text>

                                    {/* Consignee */}
                                    <Text size="sm" style={{ color: textSec, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.consignee_name || '—'}</Text>

                                    {/* Trip */}
                                    {c.trip
                                        ? <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(96,165,250,0.12)' : '#EFF6FF', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 8, padding: '3px 8px' }}>
                                            <Text size="xs" fw={700} style={{ color: '#60A5FA', fontFamily: 'monospace' }}>{c.trip.trip_number}</Text>
                                          </Box>
                                        : <Text size="xs" style={{ color: textMut }}>—</Text>}

                                    {/* Status */}
                                    <StatusPill status={c.status} statuses={statuses} />

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        {can('cargo.view') && (
                                            <Tooltip label="View" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/cargo/${c.id}`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                    <Text size="xs">👁</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {can('cargo.edit') && (
                                            <Tooltip label="Edit" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/cargo/${c.id}/edit`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, color: '#EA580C' }}>
                                                    <Text size="xs">✏️</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {cargos.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{cargos.total ?? cargos.data.length} total cargo record{(cargos.total ?? cargos.data.length) !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {cargos.last_page > 1 && (
                <Group justify="space-between" mt="lg">
                    <Text size="xs" style={{ color: textMut }}>Showing {cargos.from}–{cargos.to} of {cargos.total}</Text>
                    <Group gap={6}>
                        {cargos.links.filter(l => l.url).map((l, i) => (
                            <Box key={i} component={Link} href={l.url}
                                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: l.active ? 'linear-gradient(135deg, #C2410C, #EA580C)' : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'), color: l.active ? '#fff' : textSec }}>
                                {l.label.replace('&laquo;', '←').replace('&raquo;', '→')}
                            </Box>
                        ))}
                    </Group>
                </Group>
            )}
        </DashboardLayout>
    );
}

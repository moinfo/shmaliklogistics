import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';

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

export default function PermitsIndex({ permits, stats, statuses, filters }) {
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

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const can = useCan();

    const applyFilters = (overrides = {}) => {
        router.get('/system/permits', { search, status, ...overrides }, { preserveState: true, replace: true });
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const statCards = [
        { icon: '🛂', label: 'Total',           value: String(stats.total),
          grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '✅', label: 'Active',           value: String(stats.active),
          grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { icon: '❌', label: 'Expired',          value: String(stats.expired),
          grad: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 60%, #EF4444 100%)', glow: '0 8px 28px rgba(239,68,68,0.4)' },
        { icon: '⚠️', label: 'Expiring (14d)',   value: String(stats.expiring_soon),
          grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
    ];

    const cols = '180px 130px 120px 170px 120px 120px 80px';

    return (
        <DashboardLayout title="Permits">
            <Head title="Permits" />

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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🛂</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Border & Transit Permits</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Track all permits for your fleet</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('permits.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/permits/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ New Permit
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
                <Group gap="md">
                    <TextInput
                        placeholder="Search plate, permit #, country…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        leftSection={<Text size="sm">🔍</Text>}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }}
                        clearable
                        w={160}
                        data={[{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))]}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
                        }}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters({ search })} size={38} radius={10}
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
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Permits</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>{permits.total ?? permits.data.length} total</Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px', gap: 0 }}>
                    {['Permit', 'Vehicle', 'Trip', 'Validity', 'Cost', 'Status', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {permits.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                            🛂
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No permits found</Text>
                        <Text size="sm" style={{ color: textMut }}>Try adjusting your filters or create a new permit</Text>
                    </Box>
                ) : (
                    permits.data.map((p, i) => {
                        const statusInfo = statuses[p.status] ?? { label: p.status, color: '#94A3B8' };
                        return (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${statusInfo.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/system/permits/${p.id}`)}>

                                    {/* Permit */}
                                    <Stack gap={2}>
                                        <Text fw={700} size="sm" style={{ color: textPri }}>{p.permit_type}</Text>
                                        {p.permit_number && (
                                            <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 6, padding: '2px 8px', width: 'fit-content' }}>
                                                <Text size="10px" fw={700} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{p.permit_number}</Text>
                                            </Box>
                                        )}
                                        {p.issuing_country && <Text size="xs" style={{ color: textMut }}>{p.issuing_country}</Text>}
                                    </Stack>

                                    {/* Vehicle */}
                                    <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(96,165,250,0.12)' : '#EFF6FF', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                        <Text size="sm" fw={700} style={{ color: '#60A5FA', fontFamily: 'monospace' }}>{p.vehicle_plate}</Text>
                                    </Box>

                                    {/* Trip */}
                                    {p.trip ? (
                                        <Box component={Link} href={`/system/trips/${p.trip.id}`} onClick={e => e.stopPropagation()}
                                            style={{ display: 'inline-flex', background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 8px', textDecoration: 'none' }}>
                                            <Text size="xs" fw={700} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{p.trip.trip_number}</Text>
                                        </Box>
                                    ) : <Text size="xs" style={{ color: textMut }}>—</Text>}

                                    {/* Validity */}
                                    <Stack gap={1}>
                                        <Text size="xs" style={{ color: textSec }}>{formatDate(p.issue_date)} →</Text>
                                        <Text size="xs" fw={600} style={{ color: p.days_until_expiry !== null && p.days_until_expiry <= 14 ? '#F59E0B' : textPri }}>
                                            {formatDate(p.expiry_date)}
                                        </Text>
                                    </Stack>

                                    {/* Cost */}
                                    <Text size="sm" style={{ color: textSec }}>{p.currency} {new Intl.NumberFormat().format(p.cost)}</Text>

                                    {/* Status */}
                                    <StatusPill status={p.status} statuses={statuses} />

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        {can('permits.view') && (
                                            <Tooltip label="View" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/permits/${p.id}`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                    <Text size="xs">👁</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {can('permits.edit') && (
                                            <Tooltip label="Edit" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/permits/${p.id}/edit`} variant="subtle" size={30}
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

                {permits.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{permits.total ?? permits.data.length} total permit{(permits.total ?? permits.data.length) !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {permits.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        total={permits.last_page}
                        value={permits.current_page}
                        onChange={p => router.get('/system/permits', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

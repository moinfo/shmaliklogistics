import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import PortalLayout from '../../../layouts/PortalLayout';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function PortalCargoIndex({ cargos, statuses, filters }) {
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

    const applySearch = () => {
        router.get('/portal/cargo', search ? { search } : {}, { preserveState: true, replace: true });
    };

    return (
        <PortalLayout title="">
            <Head title="Cargo Tracking" />

            {/* Page Header Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Cargo Tracking</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Track the real-time status of your shipments</Text>
                            </Stack>
                        </Group>
                        <Box style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '6px 16px' }}>
                            <Text size="sm" fw={700} c="white">{cargos.total} items</Text>
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            {/* Search */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <input
                        type="text"
                        placeholder="Search by cargo number, description, origin or destination…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applySearch()}
                        style={{
                            flex: 1, padding: '8px 14px', borderRadius: 10,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                            background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                            color: textPri, fontSize: 14, outline: 'none',
                        }}
                    />
                    <Box
                        component="button"
                        onClick={applySearch}
                        style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}
                    >
                        Search
                    </Box>
                </Group>
            </Box>

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Cargo</Text>
                        {cargos.data.length > 0 && (
                            <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 12, padding: '1px 8px' }}>
                                <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{cargos.total}</Text>
                            </Box>
                        )}
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {cargos.data.length > 0 ? `${cargos.from ?? 1}–${cargos.to ?? cargos.data.length} of ${cargos.total}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: '150px 1fr 150px 100px 120px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Cargo #', 'Description / Route', 'Weight / Pieces', 'Trip', 'Status'].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {cargos.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>📦</Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No cargo found</Text>
                        <Text size="sm" style={{ color: textMut }}>
                            {search ? 'Try a different search term.' : 'No cargo registered for your account yet.'}
                        </Text>
                    </Box>
                ) : (
                    cargos.data.map((cargo, i) => {
                        const statusMeta = statuses[cargo.status] ?? { label: cargo.status, color: '#94A3B8' };
                        return (
                            <motion.div key={cargo.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: '150px 1fr 150px 100px 120px', gap: 0,
                                        padding: '13px 20px', borderBottom: i < cargos.data.length - 1 ? `1px solid ${divider}` : 'none',
                                        cursor: 'pointer', alignItems: 'center',
                                        transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${statusMeta.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/portal/cargo/${cargo.id}`)}
                                >
                                    {/* Cargo # */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px', width: 'fit-content' }}>
                                        <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{cargo.cargo_number}</Text>
                                    </Box>

                                    {/* Description / Route */}
                                    <Stack gap={3}>
                                        {cargo.description && (
                                            <Text size="sm" style={{ color: textPri, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cargo.description}</Text>
                                        )}
                                        {(cargo.origin || cargo.destination) && (
                                            <Group gap={4} align="center">
                                                {cargo.origin && <Text size="xs" style={{ color: textSec }}>{cargo.origin}</Text>}
                                                {cargo.origin && cargo.destination && <Text size="xs" style={{ color: '#EA580C', fontWeight: 900 }}>→</Text>}
                                                {cargo.destination && <Text size="xs" style={{ color: textSec }}>{cargo.destination}</Text>}
                                            </Group>
                                        )}
                                    </Stack>

                                    {/* Weight / Pieces */}
                                    <Stack gap={2}>
                                        {cargo.weight_kg && <Text size="xs" style={{ color: textPri, fontWeight: 600 }}>{cargo.weight_kg} kg</Text>}
                                        {cargo.pieces && <Text size="xs" style={{ color: textMut }}>{cargo.pieces} pcs</Text>}
                                    </Stack>

                                    {/* Trip */}
                                    {cargo.trip ? (
                                        <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 5, padding: '2px 8px', width: 'fit-content' }}>
                                            <Text size="10px" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{cargo.trip.trip_number}</Text>
                                        </Box>
                                    ) : (
                                        <Text size="xs" style={{ color: textMut }}>—</Text>
                                    )}

                                    {/* Status */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: statusMeta.color + '18', border: `1px solid ${statusMeta.color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                                        <Box style={{ width: 7, height: 7, borderRadius: '50%', background: statusMeta.color, boxShadow: `0 0 6px ${statusMeta.color}`, flexShrink: 0 }} />
                                        <Text size="xs" fw={700} style={{ color: statusMeta.color, letterSpacing: 0.4 }}>{statusMeta.label}</Text>
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {cargos.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{cargos.total} total cargo item{cargos.total !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {cargos.last_page > 1 && (
                <Group justify="center" mt="xl">
                    <Pagination
                        value={cargos.current_page}
                        total={cargos.last_page}
                        onChange={p => router.get('/portal/cargo', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </PortalLayout>
    );
}

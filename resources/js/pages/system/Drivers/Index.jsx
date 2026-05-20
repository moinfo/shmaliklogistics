import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';

function PersonAvatar({ name, photoUrl, size = 36 }) {
    if (photoUrl) {
        return (
            <Box component="img" src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0, border: '2px solid rgba(234,88,12,0.35)', boxShadow: '0 2px 8px rgba(234,88,12,0.2)' }} />
        );
    }
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text size="xs" fw={900} style={{ color, letterSpacing: 0.5 }}>{initials}</Text>
        </Box>
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

function LicenceBadge({ expiry, isDark, textMut }) {
    if (!expiry) return <Text size="xs" style={{ color: textMut }}>—</Text>;
    const days = Math.floor((new Date(expiry) - new Date()) / 86400000);
    const color = days < 0 ? '#EF4444' : days <= 30 ? '#F59E0B' : '#22C55E';
    const label = days < 0 ? 'EXPIRED' : days <= 30 ? `${days}d left` : new Date(expiry).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: '2-digit' });
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: `1px solid ${color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <Text size="xs" fw={700} style={{ color }}>{label}</Text>
        </Box>
    );
}

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

export default function DriversIndex({ drivers, stats, statuses, filters }) {
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

    const applyFilters = (s, st) => {
        router.get('/system/drivers', { search: s, status: st }, { preserveState: true, replace: true });
    };

    const statCards = [
        {
            icon: '👤', label: 'Total Drivers', value: String(stats.total),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '✅', label: 'Active / On Trip', value: String(stats.active),
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
        {
            icon: '🚛', label: 'Currently On Trip', value: String(stats.on_trip),
            grad: 'linear-gradient(135deg, #0369A1 0%, #0284C7 60%, #0EA5E9 100%)',
            glow: '0 8px 28px rgba(14,165,233,0.4)',
        },
        {
            icon: '⚠️', label: 'Licence Expiring', value: String(stats.license_expiring),
            grad: 'linear-gradient(135deg, #78350F 0%, #B45309 60%, #F59E0B 100%)',
            glow: '0 8px 28px rgba(245,158,11,0.4)',
        },
    ];

    const cols = '44px 1fr 150px 130px 140px 130px 80px';

    return (
        <DashboardLayout title="Drivers">
            <Head title="Drivers" />

            {/* ── Page header banner ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🚗</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Driver Management</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Register and manage your driver roster</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('drivers.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/drivers/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ Add Driver
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Stat cards ── */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── Filters ── */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search name, phone, licence…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(search, status)}
                        leftSection={<Text size="sm">🔍</Text>}
                        style={{ flex: 1 }}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                        }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters(search, v ?? ''); }}
                        clearable
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        w={180}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
                        }}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters(search, status)} size={38} radius={10}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* ── Table ── */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Drivers</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {drivers.data.length > 0 ? `Showing ${drivers.from ?? 1}–${drivers.to ?? drivers.data.length} of ${drivers.total ?? drivers.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['', 'Name', 'Phone', 'Licence #', 'Licence Exp.', 'Status', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {drivers.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0',
                            border: '2px dashed rgba(234,88,12,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.4rem', margin: '0 auto 20px',
                        }}>
                            👤
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No drivers registered</Text>
                        <Text size="sm" style={{ color: textMut }}>Add the first driver to get started</Text>
                    </Box>
                ) : (
                    drivers.data.map((d, i) => {
                        const meta = statuses[d.status] ?? { label: d.status, color: '#94A3B8' };
                        return (
                            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: cols, gap: 0,
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`,
                                        cursor: 'pointer', alignItems: 'center',
                                        transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = rowHov;
                                        e.currentTarget.style.borderLeft = `3px solid ${meta.color}`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderLeft = '3px solid transparent';
                                    }}
                                    onClick={() => router.visit(`/system/drivers/${d.id}`)}
                                >
                                    {/* Avatar */}
                                    <Box style={{ display: 'flex', alignItems: 'center' }}>
                                        <PersonAvatar name={d.name} photoUrl={d.photo_url} size={34} />
                                    </Box>

                                    {/* Name + licence classes */}
                                    <Stack gap={2}>
                                        <Text size="sm" fw={700} style={{ color: textPri }}>{d.name}</Text>
                                        {(d.license_classes ?? []).length > 0 ? (
                                            <Group gap={4} wrap="nowrap">
                                                {(d.license_classes ?? []).map(code => (
                                                    <Box key={code} style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.22)', borderRadius: 4, padding: '1px 6px', color: '#EA580C', fontWeight: 700, fontSize: 10 }}>
                                                        {code}
                                                    </Box>
                                                ))}
                                            </Group>
                                        ) : (
                                            <Text size="xs" style={{ color: textMut }}>{d.email || d.address || '—'}</Text>
                                        )}
                                    </Stack>

                                    {/* Phone */}
                                    <Text size="sm" style={{ color: textSec }}>{d.phone ?? '—'}</Text>

                                    {/* Licence # */}
                                    <Box>
                                        {d.license_number ? (
                                            <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 5, padding: '2px 8px' }}>
                                                <Text size="10px" fw={700} style={{ color: textMut, fontFamily: 'monospace', letterSpacing: 0.8 }}>{d.license_number}</Text>
                                            </Box>
                                        ) : (
                                            <Text size="xs" style={{ color: textMut }}>—</Text>
                                        )}
                                    </Box>

                                    {/* Licence expiry */}
                                    <LicenceBadge expiry={d.license_expiry} isDark={isDark} textMut={textMut} />

                                    {/* Status */}
                                    <StatusPill status={d.status} statuses={statuses} />

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        <Tooltip label="View" position="top" withArrow>
                                            <ActionIcon component={Link} href={`/system/drivers/${d.id}`} variant="subtle" size={30}
                                                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                <Text size="xs">👁</Text>
                                            </ActionIcon>
                                        </Tooltip>
                                        {can('drivers.edit') && (
                                            <Tooltip label="Edit" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/drivers/${d.id}/edit`} variant="subtle" size={30}
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

                {/* Footer */}
                {drivers.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>
                            {drivers.total ?? drivers.data.length} total driver{(drivers.total ?? drivers.data.length) !== 1 ? 's' : ''}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* ── Pagination ── */}
            {drivers.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={drivers.current_page}
                        total={drivers.last_page}
                        onChange={p => router.get('/system/drivers', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

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

            {/* ── Driver count strip ── */}
            {drivers.data.length > 0 && (
                <Group justify="space-between" mb={16} px={2}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Drivers</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {drivers.data.length > 0 ? `${drivers.from ?? 1}–${drivers.to ?? drivers.data.length} of ${drivers.total ?? drivers.data.length}` : '0 results'}
                    </Text>
                </Group>
            )}

            {/* ── Driver cards grid ── */}
            {drivers.data.length === 0 ? (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, boxShadow: cardShadow, textAlign: 'center', padding: '72px 0' }}>
                    <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                        👤
                    </Box>
                    <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No drivers registered</Text>
                    <Text size="sm" style={{ color: textMut }}>Add the first driver to get started</Text>
                </Box>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                    {drivers.data.map((d, i) => {
                        const meta = statuses[d.status] ?? { label: d.status, color: '#94A3B8' };
                        const days = d.license_expiry ? Math.floor((new Date(d.license_expiry) - new Date()) / 86400000) : null;
                        const expColor = days === null ? '#94A3B8' : days < 0 ? '#EF4444' : days <= 30 ? '#F59E0B' : '#22C55E';
                        const expLabel = days === null ? '—' : days < 0 ? 'EXPIRED' : days <= 30 ? `${days}d left` : new Date(d.license_expiry).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: '2-digit' });

                        return (
                            <motion.div key={d.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -6, transition: { duration: 0.18 } }}>
                                <Box style={{
                                    background: cardBg, border: `1px solid ${cardBorder}`,
                                    borderRadius: 18, overflow: 'hidden', boxShadow: cardShadow,
                                    cursor: 'pointer', transition: 'box-shadow 0.2s',
                                    display: 'flex', flexDirection: 'column',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${meta.color}30, 0 2px 8px rgba(0,0,0,0.1)`}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = cardShadow}
                                    onClick={() => router.visit(`/system/drivers/${d.id}`)}>

                                    {/* Status colour bar */}
                                    <Box style={{ height: 4, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)` }} />

                                    {/* Avatar + name section */}
                                    <Box style={{ padding: '24px 20px 16px', textAlign: 'center' }}>
                                        <Box style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
                                            <PersonAvatar name={d.name} photoUrl={d.photo_url} size={76} />
                                            {/* Status dot */}
                                            <Box style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: meta.color, border: `2px solid ${cardBg}`, boxShadow: `0 0 6px ${meta.color}` }} />
                                        </Box>

                                        <Text fw={800} size="md" style={{ color: textPri, lineHeight: 1.2, marginBottom: 6 }}>{d.name}</Text>

                                        {/* Status pill */}
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '3px 12px', marginBottom: 4 }}>
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, boxShadow: `0 0 5px ${meta.color}` }} />
                                            <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                                        </Box>

                                        {/* Licence class badges */}
                                        {(d.license_classes ?? []).length > 0 && (
                                            <Group gap={4} justify="center" mt={6}>
                                                {(d.license_classes ?? []).map(code => (
                                                    <Box key={code} style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 6, padding: '2px 8px', color: '#EA580C', fontWeight: 800, fontSize: 10, letterSpacing: 0.5 }}>
                                                        {code}
                                                    </Box>
                                                ))}
                                            </Group>
                                        )}
                                    </Box>

                                    {/* Info rows */}
                                    <Box style={{ borderTop: `1px solid ${divider}`, margin: '0 16px', paddingTop: 14, paddingBottom: 14 }}>
                                        {/* Phone */}
                                        <Group gap={8} mb={10} align="center">
                                            <Box style={{ width: 28, height: 28, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>📞</Box>
                                            <Text size="sm" style={{ color: d.phone ? textPri : textMut, fontWeight: d.phone ? 600 : 400 }}>{d.phone ?? 'No phone'}</Text>
                                        </Group>

                                        {/* Licence number */}
                                        <Group gap={8} mb={10} align="center">
                                            <Box style={{ width: 28, height: 28, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🪪</Box>
                                            {d.license_number ? (
                                                <Box style={{ background: isDark ? 'rgba(255,255,255,0.07)' : '#F1F5F9', borderRadius: 5, padding: '2px 8px' }}>
                                                    <Text size="xs" fw={700} style={{ color: textSec, fontFamily: 'monospace', letterSpacing: 0.8 }}>{d.license_number}</Text>
                                                </Box>
                                            ) : (
                                                <Text size="sm" style={{ color: textMut }}>No licence #</Text>
                                            )}
                                        </Group>

                                        {/* Licence expiry */}
                                        <Group gap={8} align="center">
                                            <Box style={{ width: 28, height: 28, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>📅</Box>
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: expColor + '15', border: `1px solid ${expColor}30`, borderRadius: 20, padding: '3px 10px' }}>
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: expColor, flexShrink: 0 }} />
                                                <Text size="xs" fw={700} style={{ color: expColor }}>{expLabel}</Text>
                                            </Box>
                                        </Group>
                                    </Box>

                                    {/* Action footer */}
                                    <Box style={{ borderTop: `1px solid ${divider}`, padding: '12px 16px', marginTop: 'auto' }}
                                        onClick={e => e.stopPropagation()}>
                                        <Group gap={8}>
                                            <Box component={Link} href={`/system/drivers/${d.id}`}
                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 12, fontWeight: 700, transition: 'background 0.12s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.09)' : '#F1F5F9'}
                                                onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}>
                                                👁 View
                                            </Box>
                                            {can('drivers.edit') && (
                                                <Box component={Link} href={`/system/drivers/${d.id}/edit`}
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', borderRadius: 10, background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', color: '#EA580C', textDecoration: 'none', fontSize: 12, fontWeight: 700, transition: 'background 0.12s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(234,88,12,0.18)' : '#FEE8D6'}
                                                    onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0'}>
                                                    ✏️ Edit
                                                </Box>
                                            )}
                                        </Group>
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })}
                </SimpleGrid>
            )}

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

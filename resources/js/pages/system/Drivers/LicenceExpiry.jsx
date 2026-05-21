import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

function PersonAvatar({ name, photoUrl, size = 36 }) {
    if (photoUrl) {
        return <Box component="img" src={`/storage/${photoUrl}`} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0, border: '2px solid rgba(234,88,12,0.4)' }} />;
    }
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text size="xs" fw={900} style={{ color }}>{initials}</Text>
        </Box>
    );
}

function ExpiryBar({ days }) {
    const isExpired = days < 0;
    const urgent    = !isExpired && days <= 14;
    const warning   = !isExpired && days <= 60;
    const color     = isExpired ? '#EF4444' : urgent ? '#F97316' : warning ? '#F59E0B' : '#22C55E';
    const pct       = isExpired ? 100 : Math.min(100, Math.max(4, ((90 - days) / 90) * 100));
    return (
        <Box style={{ width: '100%', height: 6, background: color + '20', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
            <Box style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
        </Box>
    );
}

function ExpiryBadge({ days, expiry }) {
    const isExpired = days < 0;
    const urgent    = !isExpired && days <= 14;
    const warning   = !isExpired && days <= 60;
    const color     = isExpired ? '#EF4444' : urgent ? '#F97316' : warning ? '#F59E0B' : '#22C55E';
    const label     = isExpired ? `Expired ${Math.abs(days)}d ago` : days === 0 ? 'Expires today!' : `${days} days left`;
    return (
        <Box>
            <Group gap={6} align="center">
                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: `1px solid ${color}35`, borderRadius: 20, padding: '4px 12px' }}>
                    <Box style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                    <Text size="xs" fw={800} style={{ color }}>{label}</Text>
                </Box>
                <Text size="xs" style={{ color: '#94A3B8' }}>{new Date(expiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </Group>
            <ExpiryBar days={days} />
        </Box>
    );
}

export default function LicenceExpiry({ drivers, statuses, expiring }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';

    const expired  = drivers.filter(d => Math.floor((new Date(d.license_expiry) - new Date()) / 86400000) < 0);
    const within14 = drivers.filter(d => { const n = Math.floor((new Date(d.license_expiry) - new Date()) / 86400000); return n >= 0 && n <= 14; });
    const within60 = drivers.filter(d => { const n = Math.floor((new Date(d.license_expiry) - new Date()) / 86400000); return n > 14 && n <= 60; });
    const beyond   = drivers.filter(d => Math.floor((new Date(d.license_expiry) - new Date()) / 86400000) > 60);

    const sections = [
        { label: 'Expired', emoji: '🔴', color: '#EF4444', items: expired },
        { label: 'Expires in 14 days', emoji: '🟠', color: '#F97316', items: within14 },
        { label: 'Expires in 15–60 days', emoji: '🟡', color: '#F59E0B', items: within60 },
        { label: 'Expires in 60+ days', emoji: '🟢', color: '#22C55E', items: beyond },
    ].filter(s => s.items.length > 0);

    return (
        <DashboardLayout title="Licence Expiry">
            <Head title="Driver Licence Expiry" />

            {/* ── Page banner ── */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🪪</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Licence Expiry Tracker</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {expiring} driver{expiring !== 1 ? 's' : ''} expiring within 60 days · {expired.length} already expired
                                </Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href="/system/drivers"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 700, fontSize: 13, padding: '9px 18px', borderRadius: 10, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>
                            ← All Drivers
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Summary strips ── */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {[
                    { label: 'Expired', value: expired.length, color: '#EF4444', icon: '🔴' },
                    { label: 'Within 14 days', value: within14.length, color: '#F97316', icon: '🟠' },
                    { label: 'Within 60 days', value: within60.length, color: '#F59E0B', icon: '🟡' },
                    { label: '60+ days', value: beyond.length, color: '#22C55E', icon: '🟢' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', boxShadow: cardShadow, borderLeft: `4px solid ${s.color}` }}>
                            <Group gap={10} align="center" mb={4}>
                                <Text style={{ fontSize: '1.1rem' }}>{s.icon}</Text>
                                <Text size="xs" style={{ color: textSec }}>{s.label}</Text>
                            </Group>
                            <Text fw={900} style={{ fontSize: '2rem', lineHeight: 1, color: s.color }}>{s.value}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── Sections ── */}
            {sections.map((section, si) => (
                <Box key={section.label} mb={28}>
                    <Group gap={8} mb={14}>
                        <Text style={{ fontSize: '1rem' }}>{section.emoji}</Text>
                        <Text fw={800} size="sm" style={{ color: section.color }}>{section.label}</Text>
                        <Box style={{ background: section.color + '20', border: `1px solid ${section.color}35`, borderRadius: 12, padding: '1px 10px' }}>
                            <Text size="xs" fw={700} style={{ color: section.color }}>{section.items.length}</Text>
                        </Box>
                    </Group>

                    {/* Table header */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 160px 180px 100px', gap: 0, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderBottom: `1px solid ${divider}`, padding: '10px 18px' }}>
                            {['#', 'Driver', 'Licence #', 'Expiry', 'Status', 'Action'].map(h => (
                                <Text key={h} size="xs" fw={700} style={{ color: textMut, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</Text>
                            ))}
                        </Box>
                        {section.items.map((d, i) => {
                            const days = Math.floor((new Date(d.license_expiry) - new Date()) / 86400000);
                            const meta = statuses[d.status] ?? { label: d.status, color: '#94A3B8' };
                            return (
                                <motion.div key={d.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: si * 0.05 + i * 0.04 }}>
                                    <Box style={{
                                        display: 'grid', gridTemplateColumns: '40px 1fr 140px 160px 180px 100px',
                                        gap: 0, padding: '13px 18px', borderBottom: i < section.items.length - 1 ? `1px solid ${divider}` : 'none',
                                        alignItems: 'center', cursor: 'pointer',
                                        borderLeft: `3px solid ${section.color}`,
                                        transition: 'background 0.12s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => window.location.href = `/system/drivers/${d.id}`}>

                                        <Text size="xs" style={{ color: textMut, fontWeight: 600 }}>{i + 1}</Text>

                                        <Group gap={10} align="center">
                                            <PersonAvatar name={d.name} photoUrl={d.photo_path} size={34} />
                                            <Stack gap={1}>
                                                <Text size="sm" fw={700} style={{ color: textPri }}>{d.name}</Text>
                                                {d.phone && <Text size="xs" style={{ color: textSec }}>{d.phone}</Text>}
                                            </Stack>
                                        </Group>

                                        <Box style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 6, padding: '3px 10px', display: 'inline-block' }}>
                                            <Text size="xs" fw={700} style={{ color: textSec, fontFamily: 'monospace', letterSpacing: 0.8 }}>{d.license_number ?? '—'}</Text>
                                        </Box>

                                        <ExpiryBadge days={days} expiry={d.license_expiry} />

                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '3px 12px' }}>
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
                                            <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                                        </Box>

                                        <Box component={Link} href={`/system/drivers/${d.id}`}
                                            onClick={e => e.stopPropagation()}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '6px 14px', color: textSec, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                                            👁 View
                                        </Box>
                                    </Box>
                                </motion.div>
                            );
                        })}
                    </Box>
                </Box>
            ))}

            {drivers.length === 0 && (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, boxShadow: cardShadow, textAlign: 'center', padding: '72px 0' }}>
                    <Text style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</Text>
                    <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>All licences up to date</Text>
                    <Text size="sm" style={{ color: textMut }}>No drivers have a recorded licence expiry date</Text>
                </Box>
            )}
        </DashboardLayout>
    );
}

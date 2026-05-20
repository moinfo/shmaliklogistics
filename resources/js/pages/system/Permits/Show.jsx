import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';

function InfoRow({ icon, label, value, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8} style={{ minWidth: 0 }}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            </Group>
            <Box style={{ textAlign: 'right' }}>{value ?? <Text size="sm" fw={600} style={{ color: textPri }}>—</Text>}</Box>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

export default function ShowPermit({ permit, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark      = colorScheme === 'dark';

    const cardBg      = isDark ? '#1A0900' : '#ffffff';
    const cardBorder  = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri     = isDark ? '#F1F5F9' : '#1E293B';
    const textSec     = isDark ? '#94A3B8' : '#64748B';
    const textMut     = isDark ? '#475569' : '#98A2B3';
    const divider     = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const statusInfo  = statuses[permit.status] ?? { label: permit.status, color: '#94A3B8' };
    const fmtDate     = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const daysLeft    = permit.days_until_expiry;
    const expiryColor = daysLeft === null ? textSec : daysLeft <= 0 ? '#EF4444' : daysLeft <= 14 ? '#F59E0B' : '#22C55E';

    const handleDelete = () => {
        if (confirm('Delete this permit?')) router.delete(`/system/permits/${permit.id}`);
    };
    const can = useCan();

    return (
        <DashboardLayout title={`Permit · ${permit.permit_type}`}>
            <Head title={`Permit · ${permit.vehicle_plate}`} />

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
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={6}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🛂</Box>
                                <Stack gap={2}>
                                    <Group gap={10} align="center">
                                        <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.5 }}>{permit.permit_type}</Text>
                                        <Box style={{ background: statusInfo.color + '30', border: `1px solid ${statusInfo.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                            <Group gap={5} align="center">
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
                                                <Text size="xs" fw={700} style={{ color: '#fff' }}>{statusInfo.label}</Text>
                                            </Group>
                                        </Box>
                                    </Group>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        Vehicle: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{permit.vehicle_plate}</span>
                                    </Text>
                                </Stack>
                            </Group>
                        </Stack>
                        <Group gap={8} wrap="wrap">
                            {can('permits.edit') && (
                                <Box component={Link} href={`/system/permits/${permit.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                            {can('permits.delete') && (
                                <Box component="button" onClick={handleDelete}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                    🗑️ Delete
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                {/* Permit Details */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Permit Details" icon="🛂" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow icon="🔖" label="Permit Number"    isDark={isDark} value={
                            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: 'monospace' }}>{permit.permit_number ?? '—'}</Text>
                        } />
                        <InfoRow icon="🌍" label="Issuing Country"  isDark={isDark} value={
                            <Text size="sm" fw={600} style={{ color: textPri }}>{permit.issuing_country ?? '—'}</Text>
                        } />
                        <InfoRow icon="🏛️" label="Issuing Authority" isDark={isDark} value={
                            <Text size="sm" fw={600} style={{ color: textPri }}>{permit.issuing_authority ?? '—'}</Text>
                        } />
                        <InfoRow icon="🚛" label="Linked Trip"       isDark={isDark} value={
                            permit.trip
                                ? <Box component={Link} href={`/system/trips/${permit.trip.id}`} style={{ color: '#EA580C', textDecoration: 'none', fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>{permit.trip.trip_number}</Box>
                                : <Text size="sm" fw={600} style={{ color: textPri }}>—</Text>
                        } />
                    </SectionCard>
                </motion.div>

                {/* Validity & Cost */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Validity & Cost" icon="📅" isDark={isDark} accent={['#065F46', '#059669']}>
                        <InfoRow icon="📅" label="Issue Date"  isDark={isDark} value={
                            <Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(permit.issue_date)}</Text>
                        } />
                        <InfoRow icon="⏰" label="Expiry Date" isDark={isDark} value={
                            <Text size="sm" fw={700} style={{ color: expiryColor }}>
                                {fmtDate(permit.expiry_date)}
                                {daysLeft !== null && (
                                    <Text component="span" size="xs" style={{ color: expiryColor, marginLeft: 6 }}>
                                        ({daysLeft >= 0 ? `${daysLeft}d left` : 'Expired'})
                                    </Text>
                                )}
                            </Text>
                        } />
                        <InfoRow icon="💰" label="Cost"        isDark={isDark} value={
                            <Text size="sm" fw={700} style={{ color: textPri }}>{permit.currency} {new Intl.NumberFormat().format(permit.cost)}</Text>
                        } />
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {permit.notes && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <SectionCard title="Notes" icon="📝" isDark={isDark} accent={['#0D9488', '#14B8A6']}>
                        <Box pt={8}>
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{permit.notes}</Text>
                        </Box>
                    </SectionCard>
                </motion.div>
            )}

            <Box mt="xl">
                <Box component={Link} href="/system/permits"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Permits
                </Box>
            </Box>
        </DashboardLayout>
    );
}

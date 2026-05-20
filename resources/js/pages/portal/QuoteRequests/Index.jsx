import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import PortalLayout from '../../../layouts/PortalLayout';
import { formatDate } from '../../../lib/date';

export default function PortalQuoteRequestsIndex({ quoteRequests, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0600' : '#ffffff';
    const cardBorder = isDark ? 'rgba(234,88,12,0.15)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    return (
        <PortalLayout title="">
            <Head title="My Quote Requests" />

            {/* Page header banner */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💬</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">My Quote Requests</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{quoteRequests.length} request{quoteRequests.length !== 1 ? 's' : ''} submitted</Text>
                            </Stack>
                        </Group>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box
                                component={Link}
                                href="/portal/quote-requests/create"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, textDecoration: 'none' }}
                            >
                                + New Request
                            </Box>
                        </motion.div>
                    </Group>
                </Box>
            </motion.div>

            {quoteRequests.length === 0 ? (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '56px 20px', textAlign: 'center', boxShadow: cardShadow }}>
                    <Text style={{ fontSize: '2.4rem', marginBottom: 12 }}>📋</Text>
                    <Text fw={700} size="lg" style={{ color: textPri }}>No requests yet</Text>
                    <Text size="sm" style={{ color: textSec, marginTop: 4 }}>Submit a quote request and our team will respond within 24 hours.</Text>
                    <Box
                        component={Link}
                        href="/portal/quote-requests/create"
                        style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(194,65,12,0.3)' }}
                    >
                        Request a Quote →
                    </Box>
                </Box>
            ) : (
                <Stack gap="md">
                    {quoteRequests.map((req, idx) => {
                        const st = statuses[req.status] ?? { label: req.status, color: '#94A3B8' };
                        return (
                            <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                                <Box
                                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', boxShadow: cardShadow, borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderLeftColor = '#EA580C'; e.currentTarget.style.background = rowHov; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.background = cardBg; }}
                                >
                                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                                    <Box style={{ padding: '16px 20px' }}>
                                        <Group justify="space-between" mb="sm" wrap="wrap" gap="sm">
                                            <Group gap="md">
                                                <Text fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 1 }}>
                                                    REQ-{String(req.id).padStart(4, '0')}
                                                </Text>
                                                <Box style={{ background: st.color + '20', border: `1px solid ${st.color}40`, borderRadius: 20, padding: '3px 12px' }}>
                                                    <Text size="xs" fw={700} style={{ color: st.color }}>{st.label}</Text>
                                                </Box>
                                            </Group>
                                            <Text size="xs" style={{ color: textMut }}>
                                                {new Date(req.created_at).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </Text>
                                        </Group>

                                        <Group gap="xl" wrap="wrap">
                                            <Stack gap={2}>
                                                <Text size="xs" style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>Route</Text>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{req.route_from} → {req.route_to}</Text>
                                            </Stack>
                                            <Stack gap={2}>
                                                <Text size="xs" style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>Cargo</Text>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{req.cargo_description}</Text>
                                            </Stack>
                                            {req.cargo_weight_kg && (
                                                <Stack gap={2}>
                                                    <Text size="xs" style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>Weight</Text>
                                                    <Text size="sm" fw={600} style={{ color: textPri }}>{req.cargo_weight_kg} kg</Text>
                                                </Stack>
                                            )}
                                            {req.preferred_date && (
                                                <Stack gap={2}>
                                                    <Text size="xs" style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>Preferred Date</Text>
                                                    <Text size="sm" fw={600} style={{ color: textPri }}>{formatDate(req.preferred_date)}</Text>
                                                </Stack>
                                            )}
                                        </Group>

                                        {req.staff_notes && (
                                            <Box style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(234,88,12,0.06)', borderRadius: 8, border: '1px solid rgba(234,88,12,0.15)' }}>
                                                <Text size="xs" fw={700} style={{ color: '#EA580C', marginBottom: 4 }}>Response from our team</Text>
                                                <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap' }}>{req.staff_notes}</Text>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })}
                </Stack>
            )}
        </PortalLayout>
    );
}

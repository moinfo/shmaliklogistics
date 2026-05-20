import PortalLayout from '../../../layouts/PortalLayout';
import { Box, Text, Group, Grid, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const cargoStatusColor = {
    pending: '#94A3B8', loaded: '#F59E0B', in_transit: '#2196F3',
    delivered: '#22C55E', damaged: '#EF4444',
};

function SectionCard({ title, icon, children, isDark, accent, toolbar }) {
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
                {toolbar}
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function InfoRow({ label, value, mono = false, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right' }}>
                {value ?? '—'}
            </Text>
        </Box>
    );
}

export default function PortalTripShow({ client, trip }) {
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

    const statusColorMap = {
        loading: '#F59E0B', in_transit: '#2196F3', at_border: '#A855F7',
        delivered: '#22C55E', completed: '#22C55E', cancelled: '#EF4444', planned: '#94A3B8',
    };
    const sc = statusColorMap[trip.status] || '#94A3B8';

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <PortalLayout title="">
            {/* Back */}
            <Box component={Link} href="/portal/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#EA580C', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 20, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg }}>
                ← Back to Shipments
            </Box>

            {/* Hero header banner */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🚛</Box>
                            <Stack gap={2}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.5 }}>{trip.trip_number}</Text>
                                    <Box style={{ background: sc + '30', border: `1px solid ${sc}60`, borderRadius: 20, padding: '3px 12px' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: sc, boxShadow: `0 0 6px ${sc}` }} />
                                            <Text size="xs" fw={700} c="white" style={{ textTransform: 'capitalize' }}>{trip.status?.replace('_', ' ')}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Group gap={6} align="center">
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{trip.origin}</Text>
                                    <Text size="xs" c="white" fw={900}>→</Text>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{trip.destination}</Text>
                                    {trip.departure_date && (
                                        <>
                                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)' }}>·</Text>
                                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.65)' }}>📅 {fmtDate(trip.departure_date)}</Text>
                                        </>
                                    )}
                                </Group>
                            </Stack>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Content */}
            <Grid gutter="md">
                {/* Trip Details */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <SectionCard title="Trip Details" icon="📋" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                            <InfoRow label="Trip Number" value={trip.trip_number} mono isDark={isDark} />
                            <InfoRow label="Origin" value={trip.origin} isDark={isDark} />
                            <InfoRow label="Destination" value={trip.destination} isDark={isDark} />
                            <InfoRow label="Departure Date" value={fmtDate(trip.departure_date)} isDark={isDark} />
                            <InfoRow label="Expected Arrival" value={fmtDate(trip.expected_arrival)} isDark={isDark} />
                        </SectionCard>
                    </motion.div>
                </Grid.Col>

                {/* Driver & Vehicle */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <SectionCard title="Driver & Vehicle" icon="🚛" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                            {trip.driver ? (
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${divider}` }}>
                                    <Box style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(234,88,12,0.15)', border: '2px solid rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Text size="sm" fw={900} style={{ color: '#EA580C' }}>{(trip.driver.name || '?')[0].toUpperCase()}</Text>
                                    </Box>
                                    <Stack gap={2}>
                                        <Text size="sm" fw={700} style={{ color: textPri }}>{trip.driver.name}</Text>
                                        <Text size="xs" style={{ color: textMut }}>Assigned Driver</Text>
                                    </Stack>
                                    {trip.vehicle && (
                                        <Box style={{ marginLeft: 'auto', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 12px' }}>
                                            <Text size="sm" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{trip.vehicle.registration_number}</Text>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box style={{ padding: '12px 0', borderBottom: `1px solid ${divider}` }}>
                                    <Text size="sm" style={{ color: textMut }}>No driver assigned</Text>
                                </Box>
                            )}
                            <InfoRow label="Vehicle" value={trip.vehicle?.registration_number} isDark={isDark} />
                        </SectionCard>
                    </motion.div>
                </Grid.Col>
            </Grid>

            {/* Notes */}
            {trip.notes && (
                <Box mt="md">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <SectionCard title="Notes" icon="📝" isDark={isDark}>
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{trip.notes}</Text>
                        </SectionCard>
                    </motion.div>
                </Box>
            )}

            {/* Cargo */}
            {trip.cargo?.length > 0 && (
                <Box mt="md">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                            <Box style={{ height: 3, background: 'linear-gradient(90deg, #D97706, #F59E0B)' }} />
                            {/* Toolbar */}
                            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Group gap={8}>
                                    <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                                    <Text size="sm" fw={700} style={{ color: textPri }}>📦 Cargo</Text>
                                    <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 12, padding: '1px 8px' }}>
                                        <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{trip.cargo.length}</Text>
                                    </Box>
                                </Group>
                            </Box>

                            {/* Head */}
                            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                                {['Description', 'Weight', 'Status'].map(h => (
                                    <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                                ))}
                            </Box>

                            {trip.cargo.map((item, i) => {
                                const cc = cargoStatusColor[item.status] || '#94A3B8';
                                return (
                                    <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                        <Box
                                            style={{
                                                display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 0,
                                                padding: '13px 20px', borderBottom: i < trip.cargo.length - 1 ? `1px solid ${divider}` : 'none',
                                                alignItems: 'center', transition: 'background 0.15s, border-left 0.15s',
                                                borderLeft: '3px solid transparent',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${cc}`; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                        >
                                            <Stack gap={2}>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{item.description || item.cargo_number}</Text>
                                                {item.cargo_number && item.description && (
                                                    <Text size="xs" style={{ color: textMut, fontFamily: 'monospace' }}>{item.cargo_number}</Text>
                                                )}
                                            </Stack>
                                            <Text size="sm" style={{ color: textSec }}>{item.weight_kg ? `${item.weight_kg} kg` : '—'}</Text>
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cc + '18', border: `1px solid ${cc}35`, borderRadius: 20, padding: '4px 10px', width: 'fit-content' }}>
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: cc, flexShrink: 0 }} />
                                                <Text size="xs" fw={700} style={{ color: cc, textTransform: 'capitalize' }}>{item.status}</Text>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                );
                            })}
                        </Box>
                    </motion.div>
                </Box>
            )}
        </PortalLayout>
    );
}

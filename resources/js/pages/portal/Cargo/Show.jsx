import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import PortalLayout from '../../../layouts/PortalLayout';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDT   = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_ORDER = ['pending', 'registered', 'loading', 'in_transit', 'at_border', 'customs', 'out_for_delivery', 'delivered', 'completed'];

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

export default function PortalCargoShow({ cargo, logs, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    const statusMeta  = statuses[cargo.status] ?? { label: cargo.status, color: '#94A3B8' };
    const sc = statusMeta.color;
    const currentIdx  = STATUS_ORDER.indexOf(cargo.status);

    return (
        <PortalLayout title="">
            <Head title={`Cargo ${cargo.cargo_number}`} />

            {/* Back */}
            <Box component={Link} href="/portal/cargo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#EA580C', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 20, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg }}>
                ← Back to Cargo List
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</Box>
                            <Stack gap={2}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.5, fontFamily: 'monospace' }}>{cargo.cargo_number}</Text>
                                    <Box style={{ background: sc + '30', border: `1px solid ${sc}60`, borderRadius: 20, padding: '3px 12px' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: sc, boxShadow: `0 0 6px ${sc}` }} />
                                            <Text size="xs" fw={700} c="white">{statusMeta.label}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                {cargo.description && (
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{cargo.description}</Text>
                                )}
                                {(cargo.origin || cargo.destination) && (
                                    <Group gap={6} align="center">
                                        {cargo.origin && <Text size="sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{cargo.origin}</Text>}
                                        {cargo.origin && cargo.destination && <Text size="xs" c="white" fw={900}>→</Text>}
                                        {cargo.destination && <Text size="sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{cargo.destination}</Text>}
                                    </Group>
                                )}
                            </Stack>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Details Grid */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                {/* Cargo Details */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Cargo Details" icon="📦" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow label="Cargo Number" value={cargo.cargo_number} mono isDark={isDark} />
                        <InfoRow label="Weight" value={cargo.weight_kg ? `${cargo.weight_kg} kg` : null} isDark={isDark} />
                        <InfoRow label="Pieces" value={cargo.pieces ? `${cargo.pieces} pcs` : null} isDark={isDark} />
                        <InfoRow label="Type" value={cargo.type} isDark={isDark} />
                        <InfoRow label="Packing" value={cargo.packing_type} isDark={isDark} />
                    </SectionCard>
                </motion.div>

                {/* Consignee */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Consignee" icon="👤" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                        <InfoRow label="Name" value={cargo.consignee_name} isDark={isDark} />
                        <InfoRow label="Contact" value={cargo.consignee_contact} isDark={isDark} />
                        <InfoRow label="Origin" value={cargo.origin} isDark={isDark} />
                        <InfoRow label="Destination" value={cargo.destination} isDark={isDark} />
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* Assigned Trip */}
            {cargo.trip && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Box mb="md">
                        <SectionCard title="Assigned Trip" icon="🚛" isDark={isDark} accent={['#065F46', '#10B981']}>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '6px 12px' }}>
                                    <Text size="sm" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{cargo.trip.trip_number}</Text>
                                </Box>
                                <Group gap={6} align="center">
                                    <Text size="sm" style={{ color: textSec }}>{cargo.trip.route_from}</Text>
                                    <Text size="xs" style={{ color: '#EA580C', fontWeight: 900 }}>→</Text>
                                    <Text size="sm" style={{ color: textSec }}>{cargo.trip.route_to}</Text>
                                </Group>
                                {cargo.trip.driver_name && (
                                    <Box style={{ marginLeft: 'auto' }}>
                                        <Text size="xs" style={{ color: textMut }}>Driver</Text>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{cargo.trip.driver_name}</Text>
                                    </Box>
                                )}
                                {cargo.trip.vehicle_plate && (
                                    <Box>
                                        <Text size="xs" style={{ color: textMut }}>Vehicle</Text>
                                        <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 5, padding: '2px 8px' }}>
                                            <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{cargo.trip.vehicle_plate}</Text>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </SectionCard>
                    </Box>
                </motion.div>
            )}

            {/* Tracking History */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Box mb="md">
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #6D28D9, #8B5CF6)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Group gap={8}>
                                <Text size="md">📍</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Tracking History</Text>
                                {logs.length > 0 && (
                                    <Box style={{ background: isDark ? 'rgba(109,40,217,0.15)' : '#F3F0FF', border: '1px solid rgba(109,40,217,0.25)', borderRadius: 12, padding: '1px 8px' }}>
                                        <Text size="xs" fw={700} style={{ color: '#8B5CF6' }}>{logs.length}</Text>
                                    </Box>
                                )}
                            </Group>
                        </Box>

                        <Box style={{ padding: '16px 20px' }}>
                            {logs.length === 0 ? (
                                <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Box style={{ width: 56, height: 56, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.08)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 12px' }}>📍</Box>
                                    <Text size="sm" style={{ color: textMut }}>No status updates recorded yet.</Text>
                                </Box>
                            ) : (
                                <Stack gap={0}>
                                    {logs.map((log, i) => {
                                        const meta = statuses[log.status] ?? { label: log.status, color: '#94A3B8' };
                                        const isLast = i === logs.length - 1;
                                        const isFirst = i === 0;
                                        return (
                                            <Box key={i} style={{ display: 'flex', gap: 14 }}>
                                                {/* Timeline line + dot */}
                                                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
                                                    <Box style={{
                                                        width: isFirst ? 14 : 12, height: isFirst ? 14 : 12,
                                                        borderRadius: '50%',
                                                        background: isFirst ? meta.color : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
                                                        border: `2px solid ${meta.color}`,
                                                        boxShadow: isFirst ? `0 0 8px ${meta.color}` : 'none',
                                                        flexShrink: 0,
                                                    }} />
                                                    {!isLast && <Box style={{ width: 2, flex: 1, minHeight: 24, background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', margin: '3px 0' }} />}
                                                </Box>
                                                {/* Content */}
                                                <Box style={{ paddingBottom: isLast ? 0 : 16, flex: 1 }}>
                                                    <Group justify="space-between" wrap="wrap" gap={4} mb={4}>
                                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '3px 10px' }}>
                                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                                                            <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                                                        </Box>
                                                        <Text size="xs" style={{ color: textMut }}>{fmtDT(log.created_at)}</Text>
                                                    </Group>
                                                    {log.location && <Text size="sm" style={{ color: textPri, marginTop: 2 }}>📍 {log.location}</Text>}
                                                    {log.notes && <Text size="sm" style={{ color: textSec, marginTop: 2 }}>{log.notes}</Text>}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Box>
                    </Box>
                </Box>
            </motion.div>

            {/* Special Instructions */}
            {cargo.special_instructions && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <SectionCard title="Special Instructions" icon="⚠️" isDark={isDark} accent={['#B45309', '#F59E0B']}>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{cargo.special_instructions}</Text>
                    </SectionCard>
                </motion.div>
            )}
        </PortalLayout>
    );
}

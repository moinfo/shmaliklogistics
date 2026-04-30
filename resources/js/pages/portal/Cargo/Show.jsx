import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import PortalLayout from '../../../layouts/PortalLayout';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDT   = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// Status order for progress bar
const STATUS_ORDER = ['pending', 'registered', 'loading', 'in_transit', 'at_border', 'customs', 'out_for_delivery', 'delivered', 'completed'];

export default function PortalCargoShow({ cargo, logs, statuses }) {
    const statusMeta  = statuses[cargo.status] ?? { label: cargo.status, color: '#94A3B8' };
    const currentIdx  = STATUS_ORDER.indexOf(cargo.status);

    return (
        <PortalLayout title={`Cargo ${cargo.cargo_number}`}>
            <Head title={`Cargo ${cargo.cargo_number}`} />

            {/* Header */}
            <Box mb="xl">
                <Group gap={10} mb={6}>
                    <Text fw={800} size="xl" style={{ color: 'var(--c-text)', fontFamily: 'monospace' }}>{cargo.cargo_number}</Text>
                    <Box style={{ background: statusMeta.color + '22', border: `1px solid ${statusMeta.color}44`, borderRadius: 20, padding: '4px 14px' }}>
                        <Text size="sm" fw={700} style={{ color: statusMeta.color }}>{statusMeta.label}</Text>
                    </Box>
                </Group>
                <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>{cargo.description}</Text>
            </Box>

            {/* Route */}
            {(cargo.origin || cargo.destination) && (
                <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
                    <Group gap={16} wrap="wrap">
                        <Box style={{ flex: 1 }}>
                            <Text size="xs" fw={700} style={{ color: 'var(--c-text-muted)', marginBottom: 4 }}>ORIGIN</Text>
                            <Text fw={700} style={{ color: 'var(--c-text)' }}>{cargo.origin ?? '—'}</Text>
                        </Box>
                        <Text style={{ fontSize: '1.4rem', color: 'var(--c-text-muted)' }}>→</Text>
                        <Box style={{ flex: 1 }}>
                            <Text size="xs" fw={700} style={{ color: 'var(--c-text-muted)', marginBottom: 4 }}>DESTINATION</Text>
                            <Text fw={700} style={{ color: 'var(--c-text)' }}>{cargo.destination ?? '—'}</Text>
                        </Box>
                    </Group>
                </Box>
            )}

            {/* Details grid */}
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                    ['Weight',     `${cargo.weight_kg} kg`],
                    ['Pieces',     `${cargo.pieces} pcs`],
                    ['Type',       cargo.type],
                    ['Packing',    cargo.packing_type ?? '—'],
                    ['Consignee',  cargo.consignee_name ?? '—'],
                    ['Contact',    cargo.consignee_contact ?? '—'],
                ].map(([label, value]) => (
                    <Box key={label} style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '12px 16px' }}>
                        <Text size="xs" style={{ color: 'var(--c-text-muted)', marginBottom: 2 }}>{label}</Text>
                        <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{value ?? '—'}</Text>
                    </Box>
                ))}
            </Box>

            {/* Trip info */}
            {cargo.trip && (
                <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                    <Text size="xs" fw={700} style={{ color: 'var(--c-text-muted)', marginBottom: 8 }}>ASSIGNED TRIP</Text>
                    <Group gap={12} wrap="wrap">
                        <Box>
                            <Text fw={700} style={{ color: 'var(--c-accent)' }}>{cargo.trip.trip_number}</Text>
                            <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>{cargo.trip.route_from} → {cargo.trip.route_to}</Text>
                        </Box>
                        {cargo.trip.driver_name && (
                            <Box>
                                <Text size="xs" style={{ color: 'var(--c-text-muted)' }}>Driver</Text>
                                <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{cargo.trip.driver_name}</Text>
                            </Box>
                        )}
                        {cargo.trip.vehicle_plate && (
                            <Box>
                                <Text size="xs" style={{ color: 'var(--c-text-muted)' }}>Vehicle</Text>
                                <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{cargo.trip.vehicle_plate}</Text>
                            </Box>
                        )}
                    </Group>
                </Box>
            )}

            {/* Status Timeline */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
                <Text fw={700} size="sm" style={{ color: 'var(--c-text)', marginBottom: 16 }}>📍 Tracking History</Text>

                {logs.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '24px 0' }}>
                        <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>No status updates recorded yet.</Text>
                    </Box>
                ) : (
                    <Stack gap={0}>
                        {logs.map((log, i) => {
                            const meta = statuses[log.status] ?? { label: log.status, color: '#94A3B8' };
                            const isLast = i === logs.length - 1;
                            return (
                                <Box key={i} style={{ display: 'flex', gap: 14 }}>
                                    {/* Timeline dot + line */}
                                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
                                        <Box style={{ width: 14, height: 14, borderRadius: '50%', background: i === 0 ? meta.color : 'var(--c-border)', border: `2px solid ${meta.color}`, flexShrink: 0 }} />
                                        {!isLast && <Box style={{ width: 2, flex: 1, minHeight: 24, background: 'var(--c-border)', margin: '2px 0' }} />}
                                    </Box>
                                    {/* Content */}
                                    <Box style={{ paddingBottom: isLast ? 0 : 16, flex: 1 }}>
                                        <Group justify="space-between" wrap="wrap" gap={4}>
                                            <Box style={{ background: meta.color + '22', border: `1px solid ${meta.color}44`, borderRadius: 12, padding: '2px 10px', display: 'inline-block' }}>
                                                <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                                            </Box>
                                            <Text size="xs" style={{ color: 'var(--c-text-muted)' }}>{fmtDT(log.created_at)}</Text>
                                        </Group>
                                        {log.location && <Text size="sm" style={{ color: 'var(--c-text)', marginTop: 4 }}>📍 {log.location}</Text>}
                                        {log.notes && <Text size="sm" style={{ color: 'var(--c-text-muted)', marginTop: 2 }}>{log.notes}</Text>}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>

            {cargo.special_instructions && (
                <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                    <Text fw={700} size="sm" style={{ color: 'var(--c-text)', marginBottom: 6 }}>⚠️ Special Instructions</Text>
                    <Text size="sm" style={{ color: 'var(--c-text-muted)', whiteSpace: 'pre-wrap' }}>{cargo.special_instructions}</Text>
                </Box>
            )}

            <Box component={Link} href="/portal/cargo" style={{ color: 'var(--c-accent)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back to Cargo List</Box>
        </PortalLayout>
    );
}

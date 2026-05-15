import { Box, Text, Group, Stack, Grid, SimpleGrid } from '@mantine/core';
import { Link } from '@inertiajs/react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const itemColors = { ok: '#22C55E', issue: '#EF4444', na: '#64748B' };
const itemLabels = { ok: 'OK', issue: 'ISSUE', na: 'N/A' };

function Row({ label, value, color = 'var(--c-text)' }) {
    return (
        <Group justify="space-between" py={8} style={{ borderBottom: '1px solid var(--c-border-subtle)' }}>
            <Text size="xs" style={{ color: 'var(--c-text-secondary)' }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color }}>{value ?? '—'}</Text>
        </Group>
    );
}

export default function AdminInspectionShow({ inspection, checklist, statuses, types }) {
    const s = statuses[inspection.overall_status] ?? { label: inspection.overall_status, color: '#94A3B8' };
    const t = types[inspection.inspection_type] ?? { label: inspection.inspection_type, color: '#94A3B8' };
    const items = inspection.items ?? {};

    return (
        <DashboardLayout title="Inspection Report">
            <Group justify="space-between" mb="lg">
                <Group gap="md">
                    <Box component={Link} href="/system/inspections" style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 14 }}>← Back</Box>
                    <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>Inspection Report</Text>
                </Group>
                <Group gap={6}>
                    <Box style={{ background: t.color + '22', border: `1px solid ${t.color}55`, borderRadius: 14, padding: '4px 12px' }}>
                        <Text size="xs" fw={700} style={{ color: t.color }}>{t.label}</Text>
                    </Box>
                    <Box style={{ background: s.color + '22', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '4px 12px' }}>
                        <Text size="xs" fw={700} style={{ color: s.color }}>{s.label}</Text>
                    </Box>
                </Group>
            </Group>

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, padding: '18px 22px' }}>
                        <Text fw={700} style={{ color: 'var(--c-text)' }} mb="sm">Summary</Text>
                        <Row label="Inspected at" value={new Date(inspection.inspected_at).toLocaleString()} />
                        <Row label="Driver"       value={inspection.driver?.name} />
                        <Row label="Vehicle"      value={inspection.vehicle ? `${inspection.vehicle.plate} — ${inspection.vehicle.make} ${inspection.vehicle.model_name}` : '—'} />
                        <Row label="Trip"         value={inspection.trip ? `${inspection.trip.trip_number} (${inspection.trip.route_from} → ${inspection.trip.route_to})` : '—'} />
                        <Row label="Odometer"     value={inspection.odometer_km ? `${Number(inspection.odometer_km).toLocaleString()} km` : '—'} />
                        <Row label="Location"     value={inspection.location} />
                        <Row label="GPS"          value={inspection.lat && inspection.lng ? `${inspection.lat}, ${inspection.lng}` : '—'} />
                    </Box>

                    {inspection.photo_path && (
                        <Box mt="md" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                            <Box component="img"
                                src={`/storage/${inspection.photo_path}`}
                                alt="Inspection photo"
                                style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 10 }} />
                        </Box>
                    )}
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, overflow: 'hidden' }}>
                        <Box style={{ padding: '14px 20px', borderBottom: '1px solid var(--c-border-subtle)' }}>
                            <Text fw={700} style={{ color: 'var(--c-text)' }}>Checklist</Text>
                        </Box>
                        {Object.entries(checklist).map(([key, label]) => {
                            const item = items[key] ?? { status: 'na', notes: '' };
                            const c = itemColors[item.status] ?? '#64748B';
                            return (
                                <Box key={key} style={{ padding: '12px 20px', borderBottom: '1px solid var(--c-border-subtle)' }}>
                                    <Group justify="space-between" align="flex-start">
                                        <Box style={{ flex: 1 }}>
                                            <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{label}</Text>
                                            {item.notes && <Text size="xs" mt={4} style={{ color: '#FCA5A5' }}>↪ {item.notes}</Text>}
                                        </Box>
                                        <Box style={{ background: c + '22', border: `1px solid ${c}55`, borderRadius: 8, padding: '3px 10px' }}>
                                            <Text size="10px" fw={700} style={{ color: c }}>{itemLabels[item.status] ?? item.status}</Text>
                                        </Box>
                                    </Group>
                                </Box>
                            );
                        })}
                    </Box>

                    {inspection.notes && (
                        <Box mt="md" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 14, padding: '18px 22px' }}>
                            <Text fw={700} mb={6} style={{ color: 'var(--c-text)' }}>Notes</Text>
                            <Text size="sm" style={{ color: 'var(--c-text-secondary)', whiteSpace: 'pre-wrap' }}>{inspection.notes}</Text>
                        </Box>
                    )}
                </Grid.Col>
            </Grid>
        </DashboardLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { formatDate } from '../../../../lib/date';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

export default function HandoverShow({ handover, inspectionItems, documentationItems, statusOptions }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const cardBg = isDark ? dk.card : '#fff';

    const field = (label, value) => (
        <Box>
            <Text size="xs" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri }}>{value || '—'}</Text>
        </Box>
    );

    const Checklist = ({ title, items, stored }) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${cardBorder}`, background: '#1E3A5F' }}>
                <Text fw={700} size="sm" style={{ color: '#fff' }}>{title}</Text>
            </Box>
            <Box style={{ padding: '8px 20px 16px' }}>
                {Object.entries(items).map(([key, label]) => {
                    const row = stored?.[key] ?? {};
                    const opt = statusOptions[row.status] ?? { label: '—', color: '#94A3B8' };
                    return (
                        <Box key={key} style={{ display: 'grid', gridTemplateColumns: '1.6fr auto 1fr', gap: 12, alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}` }}>
                            <Text size="sm" style={{ color: textPri }}>{label}</Text>
                            <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${opt.color}22`, border: `1px solid ${opt.color}55` }}>
                                <Text size="xs" fw={700} style={{ color: opt.color }}>{opt.label}</Text>
                            </Box>
                            <Text size="xs" style={{ color: textSec }}>{row.remarks || ''}</Text>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );

    const btn = (bg) => ({ padding: '8px 16px', borderRadius: 8, background: bg, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'inline-block' });

    return (
        <DashboardLayout title="Handover Report">
            <Head title={`Handover #${handover.id} — ${handover.vehicle.plate}`} />

            <Group justify="space-between" mb="lg" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Vehicle Handover Report</Text>
                    <Text size="sm" style={{ color: textSec }}>
                        {handover.vehicle.plate} · {formatDate(handover.created_at)} · by {handover.creator?.name || '—'}
                    </Text>
                </Stack>
                <Group gap="sm" className="no-print">
                    <Box component={Link} href={`/system/fleet/${handover.vehicle.id}`} style={{ ...btn('transparent'), color: textSec, border: `1px solid ${cardBorder}` }}>← Vehicle</Box>
                    <button onClick={() => window.print()} style={btn('linear-gradient(135deg,#475569,#64748B)')}>🖨 Print</button>
                    <a href={`/system/fleet/handovers/${handover.id}/export`} style={btn('linear-gradient(135deg,#A82828,#C73A3A)')}>PDF</a>
                    <a href={`/system/fleet/handovers/${handover.id}/export?format=excel`} style={btn('linear-gradient(135deg,#166534,#22C55E)')}>Excel</a>
                </Group>
            </Group>

            <Stack gap="lg">
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 24px' }}>
                    <Text fw={700} size="sm" style={{ color: textSec, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Trip & Driver Information</Text>
                    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="lg">
                        {field("Driver's Name", handover.driver_name)}
                        {field('License No.', handover.license_number)}
                        {field('License Class', handover.license_class)}
                        {field('License Expiry', handover.license_expiry ? formatDate(handover.license_expiry) : null)}
                        {field('Vehicle Reg.', handover.vehicle_registration)}
                        {field('Horse / Trailer', handover.horse_trailer)}
                        {field('Odometer (KM)', handover.odometer_km != null ? Number(handover.odometer_km).toLocaleString() : null)}
                        {field('Fuel Level', handover.fuel_level)}
                        {field('Route / Destination', handover.route_destination)}
                    </SimpleGrid>
                </Box>

                <Checklist title="Vehicle Inspection Checklist" items={inspectionItems} stored={handover.inspection} />
                <Checklist title="Documentation Checklist" items={documentationItems} stored={handover.documentation} />

                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 24px' }}>
                    <Text fw={700} size="sm" style={{ color: textSec, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Declaration & Signatures</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                        <Stack gap={4}>
                            <Text size="xs" fw={700} style={{ color: textSec }}>Handed Over By</Text>
                            <Text size="sm" fw={600} style={{ color: textPri }}>{handover.handed_over_by || '—'}</Text>
                            <Text size="xs" style={{ color: textSec }}>{handover.handed_over_date ? formatDate(handover.handed_over_date) : ''}</Text>
                        </Stack>
                        <Stack gap={4}>
                            <Text size="xs" fw={700} style={{ color: textSec }}>Received By (Driver)</Text>
                            <Text size="sm" fw={600} style={{ color: textPri }}>{handover.received_by || '—'}</Text>
                            <Text size="xs" style={{ color: textSec }}>{handover.received_date ? formatDate(handover.received_date) : ''}</Text>
                        </Stack>
                    </SimpleGrid>
                    {handover.notes && <Text size="sm" style={{ color: textSec, marginTop: 16, whiteSpace: 'pre-wrap' }}>{handover.notes}</Text>}
                </Box>
            </Stack>
        </DashboardLayout>
    );
}

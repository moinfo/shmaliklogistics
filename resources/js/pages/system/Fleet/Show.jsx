import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

function DataRow({ label, value, isDark }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const divider = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
            <Text size="sm" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri }}>{value ?? '—'}</Text>
        </Box>
    );
}

function DocRow({ label, date, isDark }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const divider = isDark ? dk.divider : '#E2E8F0';
    let display = '—'; let color = isDark ? dk.textPri : '#1E293B';
    if (date) {
        const days = Math.floor((new Date(date) - new Date()) / 86400000);
        display = new Date(date).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' });
        if (days < 0) { display += ' (EXPIRED)'; color = '#EF4444'; }
        else if (days <= 30) { display += ` (${days}d left)`; color = '#F59E0B'; }
        else color = '#22C55E';
    }
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
            <Text size="sm" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color }}>{display}</Text>
        </Box>
    );
}

function Card({ title, children, isDark, accent }) {
    const cardBg = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const divider = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

export default function ShowVehicle({ vehicle, trips, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const meta = statuses[vehicle.status] ?? { label: vehicle.status, color: '#94A3B8' };
    const flash = props.flash ?? {};

    const confirmDelete = () => {
        if (window.confirm(`Remove ${vehicle.plate} from fleet?`)) {
            router.delete(`/system/fleet/${vehicle.id}`);
        }
    };

    return (
        <DashboardLayout title={vehicle.plate}>
            <Head title={vehicle.plate} />

            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            <Group justify="space-between" mb="xl">
                <Stack gap={4}>
                    <Group gap="md">
                        <Text fw={800} size="xl" style={{ color: textPri }}>{vehicle.plate}</Text>
                        <Box style={{ background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '4px 12px' }}>
                            <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                        </Box>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{vehicle.make} {vehicle.model_name} · {vehicle.year} · {vehicle.type}</Text>
                </Stack>
                <Group gap="sm">
                    <Select
                        value={vehicle.status}
                        onChange={s => router.patch(`/system/fleet/${vehicle.id}/status`, { status: s })}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        size="sm"
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8, width: 150 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                    />
                    <Box component={Link} href={`/system/fleet/${vehicle.id}/edit`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                        ✏️ Edit
                    </Box>
                    <Tooltip label="Remove from fleet">
                        <ActionIcon onClick={confirmDelete} size={36} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444' }}>🗑️</ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <Card title="Vehicle Details" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                    <DataRow label="Plate"       value={vehicle.plate}         isDark={isDark} />
                    <DataRow label="Make"        value={vehicle.make}          isDark={isDark} />
                    <DataRow label="Model"       value={vehicle.model_name}    isDark={isDark} />
                    <DataRow label="Year"        value={vehicle.year}          isDark={isDark} />
                    <DataRow label="Type"        value={vehicle.type}          isDark={isDark} />
                    <DataRow label="Color"       value={vehicle.color}         isDark={isDark} />
                    <DataRow label="Payload"     value={vehicle.payload_tons ? `${vehicle.payload_tons} tons` : null} isDark={isDark} />
                    <DataRow label="Mileage"     value={vehicle.mileage_km ? `${Number(vehicle.mileage_km).toLocaleString()} km` : null} isDark={isDark} />
                    <DataRow label="Owner"       value={vehicle.owner_name}    isDark={isDark} />
                </Card>

                <Card title="Documents" isDark={isDark} accent={['#065F46', '#059669']}>
                    <DocRow label="Insurance"       date={vehicle.insurance_expiry}    isDark={isDark} />
                    <DocRow label="Road Licence"    date={vehicle.road_licence_expiry} isDark={isDark} />
                    <DocRow label="Fitness Cert."   date={vehicle.fitness_expiry}      isDark={isDark} />
                    <DocRow label="Next Service"    date={vehicle.next_service_date}   isDark={isDark} />
                </Card>
            </SimpleGrid>

            {/* Recent Trips */}
            <Card title={`Recent Trips using ${vehicle.plate}`} isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                {trips.length === 0 ? (
                    <Text size="sm" style={{ color: textMut, padding: '16px 0' }}>No trips recorded for this vehicle yet.</Text>
                ) : (
                    <Box>
                        <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px', borderBottom: `1px solid ${divider}`, padding: '8px 0' }}>
                            {['Trip #', 'Route', 'Date', 'Status'].map(h => (
                                <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                            ))}
                        </Box>
                        {trips.map(t => (
                            <Box key={t.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px', padding: '10px 0', borderBottom: `1px solid ${divider}`, cursor: 'pointer' }} onClick={() => router.visit(`/system/trips/${t.id}`)}>
                                <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{t.trip_number}</Text>
                                <Text size="sm" style={{ color: textPri }}>{t.route_from} → {t.route_to}</Text>
                                <Text size="sm" style={{ color: textSec }}>{t.departure_date}</Text>
                                <Text size="sm" style={{ color: textSec }}>{t.status}</Text>
                            </Box>
                        ))}
                    </Box>
                )}
            </Card>

            {vehicle.notes && (
                <Box mt="md">
                    <Card title="Notes" isDark={isDark}>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{vehicle.notes}</Text>
                    </Card>
                </Box>
            )}

            <Box mt="xl">
                <Box component={Link} href="/system/fleet" style={{ color: textMut, textDecoration: 'none', fontSize: 13 }}>← Back to Fleet</Box>
            </Box>
        </DashboardLayout>
    );
}

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = {
    card:    '#0F1E32',
    border:  'rgba(33,150,243,0.12)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: '#94A3B8',
    textMut: '#475569',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
}

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

function Card({ title, children, isDark, accent }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
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

export default function ShowTrip({ trip, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';

    const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };

    const totalCosts = Number(trip.fuel_cost) + Number(trip.driver_allowance) + Number(trip.border_costs) + Number(trip.other_costs);
    const profit = Number(trip.freight_amount) - totalCosts;

    const confirmDelete = () => {
        if (window.confirm(`Delete ${trip.trip_number}? This cannot be undone.`)) {
            router.delete(`/system/trips/${trip.id}`);
        }
    };

    const handleStatusChange = (status) => {
        router.patch(`/system/trips/${trip.id}/status`, { status });
    };

    // Flash message
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title={trip.trip_number}>
            <Head title={trip.trip_number} />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Stack gap={4}>
                    <Group gap="md">
                        <Text fw={800} size="xl" style={{ color: textPri }}>{trip.trip_number}</Text>
                        <Box style={{ background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '4px 12px' }}>
                            <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                        </Box>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{trip.route_from} → {trip.route_to}</Text>
                </Stack>
                <Group gap="sm">
                    {/* Quick status update */}
                    <Select
                        value={trip.status}
                        onChange={handleStatusChange}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        size="sm"
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8, width: 150 },
                            dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
                        }}
                    />
                    <Box
                        component={Link}
                        href={`/system/trips/${trip.id}/edit`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                    >
                        ✏️ Edit
                    </Box>
                    <Tooltip label="Delete trip">
                        <ActionIcon onClick={confirmDelete} size={36} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444' }}>🗑️</ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <Card title="Trip Details" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                    <DataRow label="Trip #"      value={trip.trip_number}   isDark={isDark} />
                    <DataRow label="Status"      value={meta.label}          isDark={isDark} />
                    <DataRow label="From"        value={trip.route_from}     isDark={isDark} />
                    <DataRow label="To"          value={trip.route_to}       isDark={isDark} />
                    <DataRow label="Departure"   value={trip.departure_date} isDark={isDark} />
                    <DataRow label="Arrival"     value={trip.arrival_date}   isDark={isDark} />
                </Card>

                <Card title="Driver & Vehicle" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                    <DataRow label="Driver"          value={trip.driver_name}       isDark={isDark} />
                    <DataRow label="Vehicle"         value={trip.vehicle_plate}     isDark={isDark} />
                    <DataRow label="Cargo"           value={trip.cargo_description} isDark={isDark} />
                    <DataRow label="Weight (tons)"   value={trip.cargo_weight_tons} isDark={isDark} />
                </Card>
            </SimpleGrid>

            {/* Financials */}
            <Card title="Financial Summary" isDark={isDark} accent={['#065F46', '#059669']}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="md">
                    {[
                        { label: 'Freight (Income)', value: trip.freight_amount, color: '#22C55E' },
                        { label: 'Fuel Cost',         value: trip.fuel_cost,         color: '#EF4444' },
                        { label: 'Driver Allowance',  value: trip.driver_allowance,  color: '#EF4444' },
                        { label: 'Border Costs',      value: trip.border_costs,      color: '#EF4444' },
                        { label: 'Other Costs',       value: trip.other_costs,       color: '#EF4444' },
                        { label: 'Total Costs',       value: totalCosts,             color: '#F59E0B', bold: true },
                    ].map(f => (
                        <Box key={f.label} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 10, padding: '14px 16px', border: `1px solid ${cardBorder}` }}>
                            <Text size="xs" style={{ color: textMut, marginBottom: 4 }}>{f.label}</Text>
                            <Text fw={f.bold ? 800 : 700} size="md" style={{ color: f.color }}>TZS {fmt(f.value)}</Text>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Net profit banner */}
                <Box mt="md" style={{ background: profit >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${profit >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 12, padding: '16px 20px' }}>
                    <Group justify="space-between">
                        <Text fw={700} size="md" style={{ color: textPri }}>Net Profit</Text>
                        <Text fw={900} size="xl" style={{ color: profit >= 0 ? '#22C55E' : '#EF4444' }}>
                            {profit < 0 ? '- ' : ''}TZS {fmt(Math.abs(profit))}
                        </Text>
                    </Group>
                </Box>
            </Card>

            {/* Notes */}
            {trip.notes && (
                <Box mt="md">
                    <Card title="Notes" isDark={isDark}>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{trip.notes}</Text>
                    </Card>
                </Box>
            )}

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/trips" style={{ color: textMut, textDecoration: 'none', fontSize: 13 }}>← Back to Trips</Box>
            </Box>
        </DashboardLayout>
    );
}

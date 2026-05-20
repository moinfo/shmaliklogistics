import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import TripForm from './TripForm';

export default function CreateTrip({ statuses, nextNumber, drivers = [], vehicles = [] }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data, setData, post, processing, errors } = useForm({
        status:            'planned',
        route_from:        '',
        route_to:          '',
        departure_date:    new Date().toISOString().slice(0, 10),
        arrival_date:      '',
        driver_name:       '',
        vehicle_plate:     '',
        cargo_description:  '',
        container_number:   '',
        cargo_weight_tons:  '',
        freight_amount:    '',
        invoice_usd:       '',
        exchange_rate:     '',
        invoice_tzs:       '',
        fuel_cost:         '',
        driver_allowance:  '',
        border_costs:      '',
        road_fines:        0,
        guard_fees:        0,
        other_costs:       '',
        notes:             '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/system/trips');
    };

    return (
        <DashboardLayout title="New Trip">
            <Head title="New Trip" />

            {/* Page Header Banner */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                🚛
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">New Trip</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Auto-number: <span style={{ color: '#FDE68A', fontWeight: 700 }}>{nextNumber}</span>
                                </Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href="/system/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            ← Back to Trips
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <TripForm
                data={data}
                setData={setData}
                errors={errors}
                statuses={statuses}
                drivers={drivers}
                vehicles={vehicles}
                processing={processing}
                onSubmit={submit}
                backHref="/system/trips"
                submitLabel="Create Trip"
            />
        </DashboardLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import TripForm from './TripForm';

export default function EditTrip({ trip, statuses, drivers = [], vehicles = [] }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data, setData, put, processing, errors } = useForm({
        status:            trip.status,
        route_from:        trip.route_from,
        route_to:          trip.route_to,
        departure_date:    trip.departure_date,
        arrival_date:      trip.arrival_date ?? '',
        driver_name:       trip.driver_name,
        vehicle_plate:     trip.vehicle_plate,
        cargo_description: trip.cargo_description ?? '',
        container_number:  trip.container_number  ?? '',
        cargo_weight_tons: trip.cargo_weight_tons ?? '',
        freight_amount:    trip.freight_amount,
        invoice_usd:       trip.invoice_usd       ?? '',
        exchange_rate:     trip.exchange_rate      ?? '',
        invoice_tzs:       trip.invoice_tzs        ?? '',
        fuel_cost:         trip.fuel_cost,
        driver_allowance:  trip.driver_allowance,
        border_costs:      trip.border_costs,
        road_fines:        trip.road_fines ?? 0,
        guard_fees:        trip.guard_fees ?? 0,
        other_costs:       trip.other_costs,
        notes:             trip.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/system/trips/${trip.id}`);
    };

    return (
        <DashboardLayout title="Edit Trip">
            <Head title={`Edit ${trip.trip_number}`} />

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
                                ✏️
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Edit Trip</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {trip.trip_number} — {trip.route_from} → {trip.route_to}
                                </Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href={`/system/trips/${trip.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            ← Back to Trip
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
                backHref={`/system/trips/${trip.id}`}
                submitLabel="Update Trip"
            />
        </DashboardLayout>
    );
}

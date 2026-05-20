import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import VehicleForm from './VehicleForm';

function fmt(d) { return d ? String(d).slice(0, 10) : ''; }

export default function EditVehicle({ vehicle, statuses, types, fuelTypes, typeIcons, drivers, customDocumentTypes = [] }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data, setData, put, processing, errors } = useForm({
        plate:          vehicle.plate,
        chassis_number: vehicle.chassis_number ?? '',
        engine_number:  vehicle.engine_number ?? '',
        status:         vehicle.status,
        driver_id:      vehicle.driver_id ?? null,
        make:           vehicle.make,
        model_name:     vehicle.model_name,
        year:           vehicle.year,
        type:           vehicle.type,
        color:          vehicle.color ?? '',
        payload_tons:   vehicle.payload_tons ?? '',
        mileage_km:     vehicle.mileage_km,
        fuel_type:      vehicle.fuel_type ?? 'diesel',
        fuel_tank_capacity_l: vehicle.fuel_tank_capacity_l ?? '',
        insurance_expiry:             fmt(vehicle.insurance_expiry),
        road_licence_expiry:          fmt(vehicle.road_licence_expiry),
        fitness_expiry:               fmt(vehicle.fitness_expiry),
        tra_sticker_expiry:           fmt(vehicle.tra_sticker_expiry),
        goods_vehicle_licence_expiry: fmt(vehicle.goods_vehicle_licence_expiry),
        next_service_date:            fmt(vehicle.next_service_date),
        owner_name:      vehicle.owner_name ?? '',
        notes:           vehicle.notes ?? '',
        extra_documents: vehicle.extra_documents ?? {},
    });

    const submit = (e) => { e.preventDefault(); put(`/system/fleet/${vehicle.id}`); };

    return (
        <DashboardLayout title="Edit Vehicle">
            <Head title={`Edit ${vehicle.plate}`} />

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
                                <Text fw={900} size="lg" c="white">Edit Vehicle</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{vehicle.plate} — {vehicle.make} {vehicle.model_name}</Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href={`/system/fleet/${vehicle.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            ← Back to Vehicle
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <VehicleForm
                data={data} setData={setData} errors={errors}
                statuses={statuses} types={types} fuelTypes={fuelTypes}
                typeIcons={typeIcons} drivers={drivers}
                customDocumentTypes={customDocumentTypes}
                processing={processing} onSubmit={submit}
                backHref={`/system/fleet/${vehicle.id}`} submitLabel="Update Vehicle"
            />
        </DashboardLayout>
    );
}

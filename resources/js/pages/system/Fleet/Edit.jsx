import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import VehicleForm from './VehicleForm';

function fmt(d) { return d ? String(d).slice(0, 10) : ''; }

export default function EditVehicle({ vehicle, statuses, types, fuelTypes, typeIcons, drivers }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

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
        owner_name: vehicle.owner_name ?? '',
        notes:      vehicle.notes ?? '',
    });

    const submit = (e) => { e.preventDefault(); put(`/system/fleet/${vehicle.id}`); };

    return (
        <DashboardLayout title="Edit Vehicle">
            <Head title={`Edit ${vehicle.plate}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Vehicle</Text>
                <Text size="sm" style={{ color: textSec }}>{vehicle.plate} — {vehicle.make} {vehicle.model_name}</Text>
            </Stack>
            <VehicleForm
                data={data} setData={setData} errors={errors}
                statuses={statuses} types={types} fuelTypes={fuelTypes}
                typeIcons={typeIcons} drivers={drivers}
                processing={processing} onSubmit={submit}
                backHref={`/system/fleet/${vehicle.id}`} submitLabel="Update Vehicle"
            />
        </DashboardLayout>
    );
}

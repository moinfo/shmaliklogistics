import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import VehicleForm from './VehicleForm';

export default function CreateVehicle({ statuses, types, fuelTypes, typeIcons, drivers }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        plate: '', chassis_number: '', engine_number: '',
        status: 'active', driver_id: null,
        make: '', model_name: '', year: new Date().getFullYear(),
        type: '', color: '',
        payload_tons: '', mileage_km: 0,
        fuel_type: 'diesel', fuel_tank_capacity_l: '',
        insurance_expiry: '', road_licence_expiry: '', fitness_expiry: '',
        tra_sticker_expiry: '', goods_vehicle_licence_expiry: '', next_service_date: '',
        owner_name: '', notes: '',
    });

    const submit = (e) => { e.preventDefault(); post('/system/fleet'); };

    return (
        <DashboardLayout title="Add Vehicle">
            <Head title="Register Vehicle" />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Register Vehicle</Text>
                <Text size="sm" style={{ color: textSec }}>Add a new vehicle to the fleet registry</Text>
            </Stack>
            <VehicleForm
                data={data} setData={setData} errors={errors}
                statuses={statuses} types={types} fuelTypes={fuelTypes}
                typeIcons={typeIcons} drivers={drivers}
                processing={processing} onSubmit={submit}
                backHref="/system/fleet" submitLabel="Register Vehicle"
            />
        </DashboardLayout>
    );
}

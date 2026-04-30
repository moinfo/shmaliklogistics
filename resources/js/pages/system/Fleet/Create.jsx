import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import VehicleForm from './VehicleForm';

export default function CreateVehicle({ statuses, types, drivers }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        plate: '', status: 'active', driver_id: null, make: '', model_name: '', year: new Date().getFullYear(),
        type: '', color: '', payload_tons: '', mileage_km: 0,
        insurance_expiry: '', road_licence_expiry: '', fitness_expiry: '', next_service_date: '',
        owner_name: '', notes: '',
    });

    const submit = (e) => { e.preventDefault(); post('/system/fleet'); };

    return (
        <DashboardLayout title="Add Vehicle">
            <Head title="Add Vehicle" />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Add Vehicle</Text>
                <Text size="sm" style={{ color: textSec }}>Register a new vehicle in the fleet</Text>
            </Stack>
            <VehicleForm data={data} setData={setData} errors={errors} statuses={statuses} types={types} drivers={drivers} processing={processing} onSubmit={submit} backHref="/system/fleet" submitLabel="Register Vehicle" />
        </DashboardLayout>
    );
}

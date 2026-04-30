import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import TripForm from './TripForm';

const dk = { textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function CreateTrip({ statuses, nextNumber }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        status:            'planned',
        route_from:        '',
        route_to:          '',
        departure_date:    new Date().toISOString().slice(0, 10),
        arrival_date:      '',
        driver_name:       '',
        vehicle_plate:     '',
        cargo_description: '',
        cargo_weight_tons: '',
        freight_amount:    '',
        fuel_cost:         '',
        driver_allowance:  '',
        border_costs:      '',
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

            <Group mb="xl" gap="sm" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>New Trip</Text>
                    <Text size="sm" style={{ color: textSec }}>Auto-number: <b style={{ color: '#3B82F6' }}>{nextNumber}</b></Text>
                </Stack>
            </Group>

            <TripForm
                data={data}
                setData={setData}
                errors={errors}
                statuses={statuses}
                processing={processing}
                onSubmit={submit}
                backHref="/system/trips"
                submitLabel="Create Trip"
            />
        </DashboardLayout>
    );
}

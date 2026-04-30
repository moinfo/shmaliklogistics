import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PermitForm from './PermitForm';

export default function CreatePermit({ statuses, types, currencies, trips, vehicles, prefillTripId }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark  = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const prefillTrip = trips.find(t => String(t.id) === String(prefillTripId));

    const { data, setData, post, processing, errors } = useForm({
        trip_id:           prefillTripId ? Number(prefillTripId) : null,
        vehicle_plate:     prefillTrip?.vehicle_plate ?? '',
        permit_type:       '',
        permit_number:     '',
        issuing_country:   '',
        issuing_authority: '',
        issue_date:        '',
        expiry_date:       '',
        cost:              0,
        currency:          'USD',
        status:            'pending',
        notes:             '',
    });

    const submit = (e) => { e.preventDefault(); post('/system/permits'); };

    return (
        <DashboardLayout title="New Permit">
            <Head title="New Permit" />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>New Permit</Text>
                <Text size="sm" style={{ color: textSec }}>Register a border or transit permit</Text>
            </Stack>
            <PermitForm data={data} setData={setData} errors={errors} statuses={statuses} types={types} currencies={currencies} trips={trips} vehicles={vehicles} processing={processing} onSubmit={submit} backHref="/system/permits" submitLabel="Create Permit" />
        </DashboardLayout>
    );
}

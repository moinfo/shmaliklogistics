import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PermitForm from './PermitForm';

export default function EditPermit({ permit, statuses, types, currencies, trips, vehicles }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark  = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        trip_id:           permit.trip_id ?? null,
        vehicle_plate:     permit.vehicle_plate,
        permit_type:       permit.permit_type,
        permit_number:     permit.permit_number ?? '',
        issuing_country:   permit.issuing_country ?? '',
        issuing_authority: permit.issuing_authority ?? '',
        issue_date:        permit.issue_date ?? '',
        expiry_date:       permit.expiry_date ?? '',
        cost:              Number(permit.cost) || 0,
        currency:          permit.currency ?? 'USD',
        status:            permit.status,
        notes:             permit.notes ?? '',
    });

    const submit = (e) => { e.preventDefault(); put(`/system/permits/${permit.id}`); };

    return (
        <DashboardLayout title="Edit Permit">
            <Head title={`Edit Permit · ${permit.permit_number ?? permit.permit_type}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Permit</Text>
                <Text size="sm" style={{ color: textSec }}>{permit.permit_type} — {permit.vehicle_plate}</Text>
            </Stack>
            <PermitForm data={data} setData={setData} errors={errors} statuses={statuses} types={types} currencies={currencies} trips={trips} vehicles={vehicles} processing={processing} onSubmit={submit} backHref={`/system/permits/${permit.id}`} submitLabel="Save Changes" />
        </DashboardLayout>
    );
}

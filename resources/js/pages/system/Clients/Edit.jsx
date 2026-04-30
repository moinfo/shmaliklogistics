import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ClientForm from './ClientForm';

export default function EditClient({ client, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark  = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        name:         client.name,
        company_name: client.company_name ?? '',
        email:        client.email ?? '',
        phone:        client.phone ?? '',
        phone_alt:    client.phone_alt ?? '',
        address:      client.address ?? '',
        tin_number:   client.tin_number ?? '',
        vrn_number:   client.vrn_number ?? '',
        status:       client.status,
        notes:        client.notes ?? '',
    });

    const submit = (e) => { e.preventDefault(); put(`/system/clients/${client.id}`); };

    return (
        <DashboardLayout title="Edit Client">
            <Head title={`Edit ${client.name}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Client</Text>
                <Text size="sm" style={{ color: textSec }}>{client.name}{client.company_name ? ` — ${client.company_name}` : ''}</Text>
            </Stack>
            <ClientForm data={data} setData={setData} errors={errors} statuses={statuses} processing={processing} onSubmit={submit} backHref={`/system/clients/${client.id}`} submitLabel="Save Changes" />
        </DashboardLayout>
    );
}

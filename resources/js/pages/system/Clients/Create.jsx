import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ClientForm from './ClientForm';

export default function CreateClient({ statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark  = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        name: '', company_name: '', email: '', phone: '', phone_alt: '',
        address: '', tin_number: '', vrn_number: '', status: 'active', notes: '',
    });

    const submit = (e) => { e.preventDefault(); post('/system/clients'); };

    return (
        <DashboardLayout title="New Client">
            <Head title="New Client" />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>New Client</Text>
                <Text size="sm" style={{ color: textSec }}>Add a new customer to your system</Text>
            </Stack>
            <ClientForm data={data} setData={setData} errors={errors} statuses={statuses} processing={processing} onSubmit={submit} backHref="/system/clients" submitLabel="Create Client" />
        </DashboardLayout>
    );
}

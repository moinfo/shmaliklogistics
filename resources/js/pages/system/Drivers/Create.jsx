import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import DriverForm from './DriverForm';

export default function CreateDriver({ statuses, licenseClasses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        name: '', status: 'active',
        phone: '', phone_alt: '', email: '', national_id: '', address: '',
        license_number: '', license_class: '', license_expiry: '',
        emergency_contact_name: '', emergency_contact_phone: '',
        notes: '',
    });

    const submit = (e) => { e.preventDefault(); post('/system/drivers'); };

    return (
        <DashboardLayout title="Add Driver">
            <Head title="Add Driver" />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Add Driver</Text>
                <Text size="sm" style={{ color: textSec }}>Register a new driver in the system</Text>
            </Stack>
            <DriverForm data={data} setData={setData} errors={errors} statuses={statuses} licenseClasses={licenseClasses} processing={processing} onSubmit={submit} backHref="/system/drivers" submitLabel="Register Driver" />
        </DashboardLayout>
    );
}

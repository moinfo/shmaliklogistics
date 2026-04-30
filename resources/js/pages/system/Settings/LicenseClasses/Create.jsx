import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import LicenseClassForm from './LicenseClassForm';

export default function CreateLicenseClass() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        code: '', name: '', description: '', sort_order: '', is_active: true,
    });

    const submit = (e) => { e.preventDefault(); post('/system/settings/license-classes'); };

    return (
        <DashboardLayout title="Settings · Add Licence Class">
            <Head title="Add Licence Class" />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Add Licence Class</Text>
                <Text size="sm" style={{ color: textSec }}>Define a new driving licence class code</Text>
            </Stack>
            <LicenseClassForm
                data={data} setData={setData} errors={errors}
                processing={processing} onSubmit={submit}
                backHref="/system/settings/license-classes"
                submitLabel="Add Class"
            />
        </DashboardLayout>
    );
}

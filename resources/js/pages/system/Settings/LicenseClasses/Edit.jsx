import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import LicenseClassForm from './LicenseClassForm';

export default function EditLicenseClass({ licenseClass }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        code:        licenseClass.code,
        name:        licenseClass.name,
        description: licenseClass.description ?? '',
        sort_order:  licenseClass.sort_order,
        is_active:   licenseClass.is_active,
    });

    const submit = (e) => { e.preventDefault(); put(`/system/settings/license-classes/${licenseClass.id}`); };

    return (
        <DashboardLayout title="Settings · Edit Licence Class">
            <Head title={`Edit ${licenseClass.code}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Licence Class</Text>
                <Text size="sm" style={{ color: textSec }}>{licenseClass.code} — {licenseClass.name}</Text>
            </Stack>
            <LicenseClassForm
                data={data} setData={setData} errors={errors}
                processing={processing} onSubmit={submit}
                backHref="/system/settings/license-classes"
                submitLabel="Save Changes"
            />
        </DashboardLayout>
    );
}

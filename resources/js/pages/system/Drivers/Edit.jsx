import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import DriverForm from './DriverForm';

function fmt(d) { return d ? d.slice(0, 10) : ''; }

export default function EditDriver({ driver, statuses, licenseClasses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        name: driver.name, status: driver.status,
        phone: driver.phone, phone_alt: driver.phone_alt ?? '', email: driver.email ?? '',
        national_id: driver.national_id ?? '', address: driver.address ?? '',
        license_number: driver.license_number ?? '', license_classes: driver.license_classes ?? [],
        license_expiry: fmt(driver.license_expiry),
        emergency_contact_name: driver.emergency_contact_name ?? '',
        emergency_contact_phone: driver.emergency_contact_phone ?? '',
        notes: driver.notes ?? '',
    });

    const submit = (e) => { e.preventDefault(); put(`/system/drivers/${driver.id}`); };

    return (
        <DashboardLayout title="Edit Driver">
            <Head title={`Edit ${driver.name}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Driver</Text>
                <Text size="sm" style={{ color: textSec }}>{driver.name}</Text>
            </Stack>
            <DriverForm data={data} setData={setData} errors={errors} statuses={statuses} licenseClasses={licenseClasses} processing={processing} onSubmit={submit} backHref={`/system/drivers/${driver.id}`} submitLabel="Update Driver" />
        </DashboardLayout>
    );
}

import { useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Text, Stack, Box, Group, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import DriverForm from './DriverForm';
import DriverDocumentsCard from './DriverDocumentsCard';

function fmt(d) { return d ? d.slice(0, 10) : ''; }

export default function EditDriver({ driver, statuses, licenseClasses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? 'var(--c-text-secondary)' : '#64748B';
    const cardBg = isDark ? '#0F1E32' : '#ffffff';
    const cardBorder = isDark ? 'var(--c-border-color)' : '#E2E8F0';

    const photoRef = useRef(null);
    const handlePhotoPick = (file) => {
        if (!file) return;
        router.post(`/system/drivers/${driver.id}/photo`, { photo: file }, { forceFormData: true, preserveScroll: true });
    };

    const { data, setData, put, processing, errors } = useForm({
        name: driver.name, status: driver.status,
        phone: driver.phone, phone_alt: driver.phone_alt ?? '', email: driver.email ?? '',
        national_id: driver.national_id ?? '', address: driver.address ?? '',
        birth_region: driver.birth_region ?? '', birth_district: driver.birth_district ?? '',
        license_number: driver.license_number ?? '', license_classes: driver.license_classes ?? [],
        license_expiry: fmt(driver.license_expiry),
        visa_expiry: fmt(driver.visa_expiry),
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

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 22px', marginBottom: 16 }}>
                <Text fw={700} size="sm" style={{ color: textPri }} mb={4}>Profile Picture</Text>
                <Text size="xs" style={{ color: textSec }} mb="md">JPG, PNG or WEBP. Max 4 MB.</Text>
                <Group gap="lg" align="center">
                    {driver.photo_url ? (
                        <Box component="img" src={driver.photo_url} alt={driver.name}
                            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: `2px solid ${cardBorder}` }} />
                    ) : (
                        <Box style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text c="white" fw={900} size="28px">{driver.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</Text>
                        </Box>
                    )}
                    <Stack gap={6}>
                        <input
                            ref={photoRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={e => { handlePhotoPick(e.target.files?.[0]); e.target.value = ''; }}
                        />
                        <Button onClick={() => photoRef.current?.click()} radius="xl"
                            style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', boxShadow: '0 4px 16px rgba(33,150,243,0.3)' }}>
                            {driver.photo_url ? 'Change photo' : 'Upload photo'}
                        </Button>
                        <Text size="xs" c="dimmed">A square image works best.</Text>
                    </Stack>
                </Group>
            </Box>

            <DriverForm data={data} setData={setData} errors={errors} statuses={statuses} licenseClasses={licenseClasses} processing={processing} onSubmit={submit} backHref={`/system/drivers/${driver.id}`} submitLabel="Update Driver" />
            <DriverDocumentsCard driver={driver} />
        </DashboardLayout>
    );
}

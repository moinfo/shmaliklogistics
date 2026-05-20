import { useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Text, Stack, Box, Group, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import DriverForm from './DriverForm';
import DriverDocumentsCard from './DriverDocumentsCard';

function fmt(d) { return d ? d.slice(0, 10) : ''; }

export default function EditDriver({ driver, statuses, licenseClasses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

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

            {/* Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>✏️</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Edit Driver</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{driver.name}</Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href={`/system/drivers/${driver.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back</Box>
                    </Group>
                </Box>
            </motion.div>

            {/* Profile Picture Card */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}>
                        <Text size="md">🖼️</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Profile Picture</Text>
                    </Group>
                </Box>
                <Box style={{ padding: '20px 24px' }}>
                    <Text size="xs" style={{ color: textSec, marginBottom: 16 }}>JPG, PNG or WEBP. Max 4 MB.</Text>
                    <Group gap="lg" align="center">
                        {driver.photo_url ? (
                            <Box component="img" src={driver.photo_url} alt={driver.name}
                                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: `2px solid ${cardBorder}` }} />
                        ) : (
                            <Box style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #C2410C, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', boxShadow: '0 4px 16px rgba(234,88,12,0.3)' }}>
                                {driver.photo_url ? 'Change photo' : 'Upload photo'}
                            </Button>
                            <Text size="xs" c="dimmed">A square image works best.</Text>
                        </Stack>
                    </Group>
                </Box>
            </Box>

            <DriverForm
                data={data} setData={setData} errors={errors}
                statuses={statuses} licenseClasses={licenseClasses}
                processing={processing} onSubmit={submit}
                backHref={`/system/drivers/${driver.id}`} submitLabel="Update Driver"
            />
            <DriverDocumentsCard driver={driver} />
        </DashboardLayout>
    );
}

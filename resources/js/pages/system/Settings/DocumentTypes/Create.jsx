import { Head, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DocumentTypeForm from './DocumentTypeForm';

export default function CreateDocumentType() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data, setData, post, processing, errors } = useForm({
        name: '', description: '', sort_order: '', is_active: true,
    });

    const submit = (e) => { e.preventDefault(); post('/system/settings/document-types'); };

    return (
        <DashboardLayout title="Settings · Add Document Type">
            <Head title="Add Document Type" />

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group gap={10} style={{ position: 'relative', zIndex: 1 }}>
                        <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📄</Box>
                        <Stack gap={1}>
                            <Text fw={900} size="lg" c="white">Add Document Type</Text>
                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Define a new document field for vehicles</Text>
                        </Stack>
                    </Group>
                </Box>
            </motion.div>

            <DocumentTypeForm
                data={data} setData={setData} errors={errors}
                processing={processing} onSubmit={submit}
                backHref="/system/settings/document-types"
                submitLabel="Add Document Type"
            />
        </DashboardLayout>
    );
}

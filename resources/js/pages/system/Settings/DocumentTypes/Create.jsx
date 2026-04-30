import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DocumentTypeForm from './DocumentTypeForm';

export default function CreateDocumentType() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        name: '', description: '', sort_order: '', is_active: true,
    });

    const submit = (e) => { e.preventDefault(); post('/system/settings/document-types'); };

    return (
        <DashboardLayout title="Settings · Add Document Type">
            <Head title="Add Document Type" />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Add Document Type</Text>
                <Text size="sm" style={{ color: textSec }}>Define a new document field for vehicles</Text>
            </Stack>
            <DocumentTypeForm
                data={data} setData={setData} errors={errors}
                processing={processing} onSubmit={submit}
                backHref="/system/settings/document-types"
                submitLabel="Add Document Type"
            />
        </DashboardLayout>
    );
}

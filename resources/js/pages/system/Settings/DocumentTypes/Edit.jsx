import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DocumentTypeForm from './DocumentTypeForm';

export default function EditDocumentType({ documentType }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        name:        documentType.name,
        description: documentType.description ?? '',
        sort_order:  documentType.sort_order,
        is_active:   documentType.is_active,
    });

    const submit = (e) => { e.preventDefault(); put(`/system/settings/document-types/${documentType.id}`); };

    return (
        <DashboardLayout title="Settings · Edit Document Type">
            <Head title={`Edit ${documentType.name}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Document Type</Text>
                <Text size="sm" style={{ color: textSec }}>{documentType.name}</Text>
            </Stack>
            <DocumentTypeForm
                data={data} setData={setData} errors={errors}
                processing={processing} onSubmit={submit}
                backHref="/system/settings/document-types"
                submitLabel="Save Changes"
                isBuiltin={documentType.is_builtin}
            />
        </DashboardLayout>
    );
}

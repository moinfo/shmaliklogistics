import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import BillingForm from '../BillingForm';

export default function EditProforma({ proforma, statuses, clients, trips }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark  = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        client_id: proforma.client_id, trip_id: proforma.trip_id ?? null,
        status: proforma.status, issue_date: proforma.issue_date ?? '',
        due_date: proforma.due_date ?? '', valid_until: proforma.valid_until ?? '',
        currency: proforma.currency ?? 'TZS',
        discount_amount: Number(proforma.discount_amount) || 0,
        tax_rate: Number(proforma.tax_rate) || 18,
        notes: proforma.notes ?? '', terms_conditions: proforma.terms_conditions ?? '',
        items: (proforma.items ?? []).map(it => ({
            description: it.description, quantity: Number(it.quantity),
            unit: it.unit ?? '', unit_price: Number(it.unit_price),
        })),
    });

    const submit = (e) => { e.preventDefault(); put(`/system/billing/proformas/${proforma.id}`); };

    return (
        <DashboardLayout title="Edit Proforma Invoice">
            <Head title={`Edit ${proforma.document_number}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Proforma Invoice</Text>
                <Text size="sm" style={{ color: textSec }}>{proforma.document_number}</Text>
            </Stack>
            <BillingForm data={data} setData={setData} errors={errors} statuses={statuses} clients={clients} trips={trips} processing={processing} onSubmit={submit} backHref={`/system/billing/proformas/${proforma.id}`} submitLabel="Save Changes" documentType="proforma" />
        </DashboardLayout>
    );
}

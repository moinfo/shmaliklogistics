import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import BillingForm from '../BillingForm';

export default function EditInvoice({ invoice, statuses, clients, trips }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark  = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        client_id: invoice.client_id, trip_id: invoice.trip_id ?? null,
        status: invoice.status, issue_date: invoice.issue_date ?? '',
        due_date: invoice.due_date ?? '',
        currency: invoice.currency ?? 'TZS',
        discount_amount: Number(invoice.discount_amount) || 0,
        tax_rate: Number(invoice.tax_rate) || 18,
        notes: invoice.notes ?? '', terms_conditions: invoice.terms_conditions ?? '',
        items: (invoice.items ?? []).map(it => ({
            description: it.description, quantity: Number(it.quantity),
            unit: it.unit ?? '', unit_price: Number(it.unit_price),
        })),
    });

    const submit = (e) => { e.preventDefault(); put(`/system/billing/invoices/${invoice.id}`); };

    return (
        <DashboardLayout title="Edit Invoice">
            <Head title={`Edit ${invoice.document_number}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Invoice</Text>
                <Text size="sm" style={{ color: textSec }}>{invoice.document_number}</Text>
            </Stack>
            <BillingForm data={data} setData={setData} errors={errors} statuses={statuses} clients={clients} trips={trips} processing={processing} onSubmit={submit} backHref={`/system/billing/invoices/${invoice.id}`} submitLabel="Save Changes" documentType="invoice" />
        </DashboardLayout>
    );
}

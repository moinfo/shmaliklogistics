import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import BillingForm from '../BillingForm';

export default function EditQuote({ quote, statuses, clients, trips }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark  = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        client_id:        quote.client_id,
        trip_id:          quote.trip_id ?? null,
        status:           quote.status,
        issue_date:       quote.issue_date ?? '',
        due_date:         quote.due_date ?? '',
        valid_until:      quote.valid_until ?? '',
        currency:         quote.currency ?? 'TZS',
        discount_amount:  Number(quote.discount_amount) || 0,
        tax_rate:         Number(quote.tax_rate) || 18,
        notes:            quote.notes ?? '',
        terms_conditions: quote.terms_conditions ?? '',
        items: (quote.items ?? []).map(it => ({
            description: it.description,
            quantity:    Number(it.quantity),
            unit:        it.unit ?? '',
            unit_price:  Number(it.unit_price),
        })),
    });

    const submit = (e) => { e.preventDefault(); put(`/system/billing/quotes/${quote.id}`); };

    return (
        <DashboardLayout title="Edit Quote">
            <Head title={`Edit ${quote.document_number}`} />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Quote</Text>
                <Text size="sm" style={{ color: textSec }}>{quote.document_number}</Text>
            </Stack>
            <BillingForm data={data} setData={setData} errors={errors} statuses={statuses} clients={clients} trips={trips} processing={processing} onSubmit={submit} backHref={`/system/billing/quotes/${quote.id}`} submitLabel="Save Changes" documentType="quote" />
        </DashboardLayout>
    );
}

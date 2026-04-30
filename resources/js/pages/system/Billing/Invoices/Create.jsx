import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import BillingForm from '../BillingForm';

export default function CreateInvoice({ statuses, nextNumber, clients, trips }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark  = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        client_id: null, trip_id: null, status: 'draft',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        currency: 'TZS', discount_amount: 0, tax_rate: 18,
        notes: '', terms_conditions: 'Payment due within 30 days of invoice date.',
        items: [{ description: '', quantity: 1, unit: 'trip', unit_price: 0 }],
    });

    const submit = (e) => { e.preventDefault(); post('/system/billing/invoices'); };

    return (
        <DashboardLayout title="New Invoice">
            <Head title="New Invoice" />
            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>New Invoice</Text>
                <Text size="sm" style={{ color: textSec }}>Auto-number: <b style={{ color: '#22C55E' }}>{nextNumber}</b></Text>
            </Stack>
            <BillingForm data={data} setData={setData} errors={errors} statuses={statuses} clients={clients} trips={trips} processing={processing} onSubmit={submit} backHref="/system/billing/invoices" submitLabel="Create Invoice" documentType="invoice" />
        </DashboardLayout>
    );
}

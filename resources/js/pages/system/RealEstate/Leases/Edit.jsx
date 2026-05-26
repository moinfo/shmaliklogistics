import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import LeaseForm from './LeaseForm';

const dk = { textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

export default function EditLease({ lease, units = [], tenants = [], billingCycles = {}, currencies = [], statuses = {} }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        property_unit_id: lease.property_unit_id ? String(lease.property_unit_id) : '',
        tenant_id:        lease.tenant_id ? String(lease.tenant_id) : '',
        start_date:       lease.start_date ?? '',
        end_date:         lease.end_date ?? '',
        billing_cycle:    lease.billing_cycle ?? 'monthly',
        rent_amount:      lease.rent_amount ?? '',
        rent_currency:    lease.rent_currency ?? 'TZS',
        deposit_amount:   lease.deposit_amount ?? 0,
        payment_day:      lease.payment_day ?? '',
        status:           lease.status ?? 'active',
        terms:            lease.terms ?? '',
        notes:            lease.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/system/real-estate/leases/${lease.id}`);
    };

    return (
        <DashboardLayout title="Edit Lease">
            <Head title={`Edit ${lease.lease_number}`} />

            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Lease</Text>
                <Text size="sm" style={{ color: textSec }}>{lease.lease_number}</Text>
            </Stack>

            <LeaseForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                backHref={`/system/real-estate/leases/${lease.id}`}
                submitLabel="Update Lease"
                units={units}
                tenants={tenants}
                billingCycles={billingCycles}
                currencies={currencies}
                statuses={statuses}
            />
        </DashboardLayout>
    );
}
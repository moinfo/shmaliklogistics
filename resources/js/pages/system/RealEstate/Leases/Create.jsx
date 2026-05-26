import { Head, useForm } from '@inertiajs/react';
import { Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import LeaseForm from './LeaseForm';

const dk = { textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

export default function CreateLease({ units = [], tenants = [], billingCycles = {}, currencies = [], statuses = {}, unit_id = null }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const preselected = unit_id ? units.find(u => String(u.value) === String(unit_id)) : null;

    const { data, setData, post, processing, errors } = useForm({
        property_unit_id: unit_id ? String(unit_id) : '',
        tenant_id:        '',
        start_date:       new Date().toISOString().slice(0, 10),
        end_date:         '',
        billing_cycle:    preselected?.default_billing_cycle ?? preselected?.billing_cycle ?? 'monthly',
        rent_amount:      preselected?.rent_amount ?? '',
        rent_currency:    preselected?.rent_currency ?? 'TZS',
        deposit_amount:   0,
        payment_day:      '',
        status:           'active',
        terms:            '',
        notes:            '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/system/real-estate/leases');
    };

    return (
        <DashboardLayout title="New Lease">
            <Head title="New Lease" />

            <Group mb="xl" gap="sm" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>New Lease</Text>
                    <Text size="sm" style={{ color: textSec }}>Create a tenancy agreement (mkataba)</Text>
                </Stack>
            </Group>

            <LeaseForm
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                backHref="/system/real-estate/leases"
                submitLabel="Create Lease"
                units={units}
                tenants={tenants}
                billingCycles={billingCycles}
                currencies={currencies}
                statuses={statuses}
            />
        </DashboardLayout>
    );
}
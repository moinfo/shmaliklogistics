import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import TenantForm from './TenantForm';

const dk = { textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

export default function CreateTenant({ types, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        name:                    '',
        type:                    'individual',
        phone:                   '',
        phone_alt:               '',
        email:                   '',
        national_id:             '',
        company_name:            '',
        tin:                     '',
        address:                 '',
        emergency_contact_name:  '',
        emergency_contact_phone: '',
        status:                  'active',
        notes:                   '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/system/real-estate/tenants');
    };

    return (
        <DashboardLayout title="New Tenant">
            <Head title="New Tenant" />

            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>New Tenant</Text>
                <Text size="sm" style={{ color: textSec }}>Register an individual or company tenant</Text>
            </Stack>

            <TenantForm
                data={data}
                setData={setData}
                errors={errors}
                types={types}
                statuses={statuses}
                processing={processing}
                onSubmit={submit}
                backHref="/system/real-estate/tenants"
                submitLabel="Create Tenant"
            />
        </DashboardLayout>
    );
}
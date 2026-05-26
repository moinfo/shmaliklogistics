import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import TenantForm from './TenantForm';

const dk = { textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

export default function EditTenant({ tenant, types, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        name:                    tenant.name,
        type:                    tenant.type,
        phone:                   tenant.phone,
        phone_alt:               tenant.phone_alt               ?? '',
        email:                   tenant.email                   ?? '',
        national_id:             tenant.national_id             ?? '',
        company_name:            tenant.company_name            ?? '',
        tin:                     tenant.tin                     ?? '',
        address:                 tenant.address                 ?? '',
        emergency_contact_name:  tenant.emergency_contact_name  ?? '',
        emergency_contact_phone: tenant.emergency_contact_phone ?? '',
        status:                  tenant.status,
        notes:                   tenant.notes                   ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/system/real-estate/tenants/${tenant.id}`);
    };

    return (
        <DashboardLayout title="Edit Tenant">
            <Head title={`Edit ${tenant.name}`} />

            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Tenant</Text>
                <Text size="sm" style={{ color: textSec }}>{tenant.code} — {tenant.name}</Text>
            </Stack>

            <TenantForm
                data={data}
                setData={setData}
                errors={errors}
                types={types}
                statuses={statuses}
                processing={processing}
                onSubmit={submit}
                backHref={`/system/real-estate/tenants/${tenant.id}`}
                submitLabel="Update Tenant"
            />
        </DashboardLayout>
    );
}
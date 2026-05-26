import { Head, useForm } from '@inertiajs/react';
import { Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import PropertyForm from './PropertyForm';

const dk = { textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

export default function EditProperty({ property, types, statuses, ownerships, currencies = [] }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const { data, setData, put, processing, errors } = useForm({
        name:               property.name,
        type:               property.type,
        status:             property.status,
        ownership:          property.ownership,
        address:            property.address ?? '',
        region:             property.region ?? '',
        district:           property.district ?? '',
        acquisition_date:   property.acquisition_date ?? '',
        purchase_price:     property.purchase_price ?? '',
        purchase_currency:  property.purchase_currency ?? 'TZS',
        market_value:       property.market_value ?? '',
        title_deed_number:  property.title_deed_number ?? '',
        description:        property.description ?? '',
        notes:              property.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/system/real-estate/properties/${property.id}`);
    };

    return (
        <DashboardLayout title="Edit Property">
            <Head title={`Edit ${property.code}`} />

            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: textPri }}>Edit Property</Text>
                <Text size="sm" style={{ color: textSec }}>{property.code} — {property.name}</Text>
            </Stack>

            <PropertyForm
                data={data}
                setData={setData}
                errors={errors}
                types={types}
                statuses={statuses}
                ownerships={ownerships}
                currencies={currencies}
                processing={processing}
                onSubmit={submit}
                backHref={`/system/real-estate/properties/${property.id}`}
                submitLabel="Update Property"
            />
        </DashboardLayout>
    );
}
import { Head, useForm } from '@inertiajs/react';
import { Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import PropertyForm from './PropertyForm';

const dk = { textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

export default function CreateProperty({ types, statuses, ownerships, currencies = [] }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        name:               '',
        type:               Object.keys(types)[0] ?? 'house',
        status:             'available',
        ownership:          Object.keys(ownerships)[0] ?? 'owned',
        address:            '',
        region:             '',
        district:           '',
        acquisition_date:   '',
        purchase_price:     '',
        purchase_currency:  currencies[0] ?? 'TZS',
        market_value:       '',
        title_deed_number:  '',
        description:        '',
        notes:              '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/system/real-estate/properties');
    };

    return (
        <DashboardLayout title="New Property">
            <Head title="New Property" />

            <Group mb="xl" gap="sm" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>New Property</Text>
                    <Text size="sm" style={{ color: textSec }}>Register a new property in the portfolio</Text>
                </Stack>
            </Group>

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
                backHref="/system/real-estate/properties"
                submitLabel="Create Property"
            />
        </DashboardLayout>
    );
}
import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import CargoForm from './CargoForm';

export default function CreateCargo({ trips, clients, statuses, types, nextNumber }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, post, processing, errors } = useForm({
        cargo_number:         nextNumber,
        trip_id:              '',
        client_id:            '',
        description:          '',
        type:                 'general',
        weight_kg:            '',
        volume_m3:            '',
        pieces:               '1',
        packing_type:         '',
        origin:               '',
        destination:          '',
        consignee_name:       '',
        consignee_contact:    '',
        status:               'registered',
        declared_value:       '',
        currency:             'USD',
        special_instructions: '',
        notes:                '',
    });

    const submit = e => { e.preventDefault(); post('/system/cargo'); };

    return (
        <DashboardLayout title="Register Cargo">
            <Head title="Register Cargo" />
            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>Register Cargo</Text>
                        <Text size="sm" style={{ color: textSec }}>Add a new cargo shipment to tracking</Text>
                    </Stack>
                    <Group gap="sm">
                        <Box component={Link} href="/system/cargo"
                            style={{ padding: '10px 20px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                            Cancel
                        </Box>
                        <Box component="button" type="submit" disabled={processing}
                            style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            {processing ? 'Saving…' : '📦 Register Cargo'}
                        </Box>
                    </Group>
                </Group>
                <CargoForm data={data} setData={setData} errors={errors} trips={trips} clients={clients} statuses={statuses} types={types} isDark={isDark} />
            </Box>
        </DashboardLayout>
    );
}

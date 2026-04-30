import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import CargoForm from './CargoForm';

export default function EditCargo({ cargo, trips, clients, statuses, types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';

    const { data, setData, patch, processing, errors } = useForm({
        cargo_number:         cargo.cargo_number,
        trip_id:              cargo.trip_id ? String(cargo.trip_id) : '',
        client_id:            cargo.client_id ? String(cargo.client_id) : '',
        description:          cargo.description,
        type:                 cargo.type,
        weight_kg:            cargo.weight_kg,
        volume_m3:            cargo.volume_m3 ?? '',
        pieces:               cargo.pieces,
        packing_type:         cargo.packing_type ?? '',
        origin:               cargo.origin ?? '',
        destination:          cargo.destination ?? '',
        consignee_name:       cargo.consignee_name ?? '',
        consignee_contact:    cargo.consignee_contact ?? '',
        status:               cargo.status,
        declared_value:       cargo.declared_value ?? '',
        currency:             cargo.currency,
        special_instructions: cargo.special_instructions ?? '',
        notes:                cargo.notes ?? '',
    });

    const submit = e => { e.preventDefault(); patch(`/system/cargo/${cargo.id}`); };

    return (
        <DashboardLayout title="Edit Cargo">
            <Head title={`Edit ${cargo.cargo_number}`} />
            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>Edit Cargo</Text>
                        <Text size="sm" style={{ color: textSec }}>{cargo.cargo_number}</Text>
                    </Stack>
                    <Group gap="sm">
                        <Box component={Link} href={`/system/cargo/${cargo.id}`}
                            style={{ padding: '10px 20px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                            Cancel
                        </Box>
                        <Box component="button" type="submit" disabled={processing}
                            style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            {processing ? 'Saving…' : '💾 Save Changes'}
                        </Box>
                    </Group>
                </Group>
                <CargoForm data={data} setData={setData} errors={errors} trips={trips} clients={clients} statuses={statuses} types={types} isDark={isDark} />
            </Box>
        </DashboardLayout>
    );
}

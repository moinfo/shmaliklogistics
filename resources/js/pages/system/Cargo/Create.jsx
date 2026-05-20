import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import CargoForm from './CargoForm';

export default function CreateCargo({ trips, clients, statuses, types, nextNumber }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textSec    = isDark ? '#94A3B8' : '#64748B';

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

            {/* Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Register Cargo</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Add a new cargo shipment to tracking</Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href="/system/cargo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back</Box>
                    </Group>
                </Box>
            </motion.div>

            <Box component="form" onSubmit={submit}>
                <CargoForm
                    data={data} setData={setData} errors={errors}
                    trips={trips} clients={clients} statuses={statuses} types={types}
                    isDark={isDark}
                />
                <Group justify="flex-end" gap="md" mt={4}>
                    <Box
                        component={Link} href="/system/cargo"
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textSec, padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                    >
                        Cancel
                    </Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box
                            component="button" type="submit" disabled={processing}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, fontWeight: 700, boxShadow: '0 4px 16px rgba(234,88,12,0.4)', color: '#fff', cursor: processing ? 'not-allowed' : 'pointer', padding: '0 28px', fontSize: 14, opacity: processing ? 0.7 : 1 }}
                        >
                            {processing ? 'Saving…' : 'Register Cargo'}
                        </Box>
                    </motion.div>
                </Group>
            </Box>
        </DashboardLayout>
    );
}

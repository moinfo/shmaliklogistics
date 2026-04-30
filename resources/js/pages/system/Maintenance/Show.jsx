import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { motion } from 'framer-motion';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function Field({ label, value, isDark }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    return (
        <Box>
            <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{label}</Text>
            <Text size="sm" style={{ color: textPri }}>{value ?? '—'}</Text>
        </Box>
    );
}

function fmt(n) { return Number(n ?? 0).toLocaleString(); }

export default function ShowMaintenance({ record }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const handleDelete = () => {
        if (!confirm('Delete this service record?')) return;
        router.delete(`/system/maintenance/${record.id}`);
    };

    return (
        <DashboardLayout title="Service Record">
            <Head title="Service Record" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Service Record</Text>
                    <Text size="sm" style={{ color: textSec }}>
                        {record.vehicle?.plate} — {record.service_type} on {record.service_date}
                    </Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/maintenance" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                        ← Back
                    </Box>
                    <Box component={Link} href={`/system/maintenance/${record.id}/edit`} style={{ padding: '9px 18px', borderRadius: 9, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textPri, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                        ✏️ Edit
                    </Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" onClick={handleDelete} style={{ padding: '9px 18px', borderRadius: 9, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                            🗑️ Delete
                        </Box>
                    </motion.div>
                </Group>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px' }}>
                <Text fw={700} size="sm" style={{ color: textSec, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Service Details</Text>

                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
                    <Field label="Vehicle" value={`${record.vehicle?.plate} — ${record.vehicle?.make} ${record.vehicle?.model_name}`} isDark={isDark} />
                    <Field label="Service Type" value={record.service_type} isDark={isDark} />
                    <Field label="Service Date" value={record.service_date} isDark={isDark} />
                    <Field label="Mileage" value={record.mileage_km ? `${fmt(record.mileage_km)} km` : null} isDark={isDark} />
                    <Field label="Workshop" value={record.workshop_name} isDark={isDark} />
                    <Field label="Cost" value={record.cost ? `${record.currency} ${fmt(record.cost)}` : null} isDark={isDark} />
                </Box>

                {record.description && (
                    <Box mb="xl">
                        <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Work Description</Text>
                        <Text size="sm" style={{ color: textPri, whiteSpace: 'pre-wrap' }}>{record.description}</Text>
                    </Box>
                )}

                {(record.next_service_date || record.next_service_mileage) && (
                    <>
                        <Box style={{ height: 1, background: isDark ? dk.divider : '#E2E8F0', margin: '20px 0' }} />
                        <Text fw={700} size="sm" style={{ color: textSec, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Next Service</Text>
                        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                            <Field label="Next Service Date" value={record.next_service_date} isDark={isDark} />
                            <Field label="Next Service Mileage" value={record.next_service_mileage ? `${fmt(record.next_service_mileage)} km` : null} isDark={isDark} />
                        </Box>
                    </>
                )}

                {record.notes && (
                    <Box mt="xl">
                        <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Notes</Text>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap' }}>{record.notes}</Text>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

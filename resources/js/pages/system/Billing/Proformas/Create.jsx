import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import BillingForm from '../BillingForm';

export default function CreateProforma({ statuses, nextNumber, clients, trips }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data, setData, post, processing, errors } = useForm({
        client_id: null, trip_id: null, status: 'draft',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        valid_until: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        currency: 'TZS', discount_amount: 0, tax_rate: 18,
        notes: '', terms_conditions: 'Payment due within 30 days of invoice date.',
        items: [{ description: '', quantity: 1, unit: 'trip', unit_price: 0 }],
    });

    const submit = (e) => { e.preventDefault(); post('/system/billing/proformas'); };

    return (
        <DashboardLayout title="New Proforma Invoice">
            <Head title="New Proforma Invoice" />

            {/* ── Hero banner ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18,
                    padding: '20px 28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 260, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                📄
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">New Proforma Invoice</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Auto-number: <span style={{ fontWeight: 700, color: '#FCD34D' }}>{nextNumber}</span>
                                </Text>
                            </Stack>
                        </Group>
                        <Box
                            component={Link}
                            href="/system/billing/proformas"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ← Back to Proformas
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <BillingForm
                data={data} setData={setData} errors={errors}
                statuses={statuses} clients={clients} trips={trips}
                processing={processing} onSubmit={submit}
                backHref="/system/billing/proformas"
                submitLabel="Create Proforma"
                documentType="proforma"
            />
        </DashboardLayout>
    );
}

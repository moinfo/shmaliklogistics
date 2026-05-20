import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import BillingForm from '../BillingForm';

export default function EditQuote({ quote, statuses, clients, trips }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data, setData, put, processing, errors } = useForm({
        client_id:        quote.client_id,
        trip_id:          quote.trip_id ?? null,
        status:           quote.status,
        issue_date:       quote.issue_date ?? '',
        due_date:         quote.due_date ?? '',
        valid_until:      quote.valid_until ?? '',
        currency:         quote.currency ?? 'TZS',
        discount_amount:  Number(quote.discount_amount) || 0,
        tax_rate:         Number(quote.tax_rate) || 18,
        notes:            quote.notes ?? '',
        terms_conditions: quote.terms_conditions ?? '',
        items: (quote.items ?? []).map(it => ({
            description: it.description,
            quantity:    Number(it.quantity),
            unit:        it.unit ?? '',
            unit_price:  Number(it.unit_price),
        })),
    });

    const submit = (e) => { e.preventDefault(); put(`/system/billing/quotes/${quote.id}`); };

    return (
        <DashboardLayout title="Edit Quote">
            <Head title={`Edit ${quote.document_number}`} />

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
                                💬
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Edit Quote</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {quote.document_number}
                                </Text>
                            </Stack>
                        </Group>
                        <Box
                            component={Link}
                            href={`/system/billing/quotes/${quote.id}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ← Back to Quote
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <BillingForm
                data={data} setData={setData} errors={errors}
                statuses={statuses} clients={clients} trips={trips}
                processing={processing} onSubmit={submit}
                backHref={`/system/billing/quotes/${quote.id}`}
                submitLabel="Save Changes"
                documentType="quote"
            />
        </DashboardLayout>
    );
}

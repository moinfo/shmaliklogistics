import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ShowQuote({ quote, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const statusInfo = statuses[quote.status] ?? {};
    const cur        = quote.currency ?? 'TZS';

    const handleDelete = () => {
        if (confirm(`Delete quote ${quote.document_number}?`)) router.delete(`/system/billing/quotes/${quote.id}`);
    };

    const convertToProforma = () => {
        router.post(`/system/billing/quotes/${quote.id}/convert-to-proforma`);
    };

    return (
        <DashboardLayout title={`Quote · ${quote.document_number}`}>
            <Head title={quote.document_number} />

            {/* Header */}
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap={8}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>{quote.document_number}</Text>
                        <Badge size="sm" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>{statusInfo.label}</Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{quote.client?.name}{quote.client?.company_name ? ` — ${quote.client.company_name}` : ''}</Text>
                </Stack>
                <Group gap="sm" wrap="wrap">
                    {['draft', 'sent', 'accepted'].includes(quote.status) && (
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" onClick={convertToProforma} style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#059669,#10B981)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                → Convert to Proforma
                            </Box>
                        </motion.div>
                    )}
                    <Box component={Link} href={`/system/billing/quotes/${quote.id}/edit`} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>Edit</Box>
                    <Box component="button" onClick={handleDelete} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #EF444444', color: '#EF4444', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Delete</Box>
                </Group>
            </Group>

            {/* Converted from */}
            {quote.converted_from && (
                <Box style={{ background: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF', border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#3B82F6' }}>Converted from <Box component={Link} href={`/system/billing/quotes/${quote.converted_from.id}`} style={{ color: '#3B82F6', fontWeight: 700 }}>{quote.converted_from.document_number}</Box></Text>
                </Box>
            )}

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                {/* Meta */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 20 }}>
                    <Stack gap={8}>
                        <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Issue Date</Text><Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(quote.issue_date)}</Text></Group>
                        <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Valid Until</Text><Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(quote.valid_until)}</Text></Group>
                        <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Due Date</Text><Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(quote.due_date)}</Text></Group>
                        {quote.trip && <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Trip</Text><Box component={Link} href={`/system/trips/${quote.trip.id}`} style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600 }}>{quote.trip.trip_number}</Box></Group>}
                    </Stack>
                </Box>
                {/* Client */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 20 }}>
                    <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 8 }}>Bill To</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{quote.client?.name}</Text>
                    {quote.client?.company_name && <Text size="sm" style={{ color: textSec }}>{quote.client.company_name}</Text>}
                    {quote.client?.address && <Text size="sm" style={{ color: textSec }}>{quote.client.address}</Text>}
                    {quote.client?.tin_number && <Text size="xs" style={{ color: textSec }}>TIN: {quote.client.tin_number}</Text>}
                </Box>
            </SimpleGrid>

            {/* Line items */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Text fw={700} size="sm" style={{ color: textPri }}>📦 Line Items</Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                                {['Description', 'Qty', 'Unit', 'Unit Price', 'Total'].map((h, i) => (
                                    <th key={i} style={{ padding: '10px 16px', textAlign: i >= 3 ? 'right' : 'left', fontSize: 12, fontWeight: 700, color: textSec }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(quote.items ?? []).map((item, i) => (
                                <tr key={i} style={{ borderTop: `1px solid ${divider}` }}>
                                    <td style={{ padding: '12px 16px', fontSize: 14, color: textPri }}>{item.description}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 14, color: textSec }}>{item.quantity}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 14, color: textSec }}>{item.unit ?? '—'}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 14, color: textSec, textAlign: 'right' }}>{cur} {fmt(item.unit_price)}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: textPri, textAlign: 'right' }}>{cur} {fmt(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {/* Totals */}
                <Box style={{ padding: '16px 20px', borderTop: `1px solid ${divider}`, maxWidth: 340, marginLeft: 'auto' }}>
                    <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>Subtotal</Text><Text size="sm" style={{ color: textPri }}>{cur} {fmt(quote.subtotal)}</Text></Group>
                    {Number(quote.discount_amount) > 0 && <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>Discount</Text><Text size="sm" style={{ color: '#EF4444' }}>− {cur} {fmt(quote.discount_amount)}</Text></Group>}
                    {Number(quote.tax_rate) > 0 && <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>VAT ({quote.tax_rate}%)</Text><Text size="sm" style={{ color: textPri }}>{cur} {fmt(quote.tax_amount)}</Text></Group>}
                    <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 8, marginTop: 4 }}>
                        <Group justify="space-between"><Text fw={800} size="sm" style={{ color: textPri }}>Total</Text><Text fw={800} size="lg" style={{ color: '#22C55E' }}>{cur} {fmt(quote.total)}</Text></Group>
                    </Box>
                </Box>
            </Box>

            {(quote.notes || quote.terms_conditions) && (
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    {quote.notes && <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 20 }}><Text fw={700} size="sm" style={{ color: textPri, marginBottom: 8 }}>📝 Notes</Text><Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap' }}>{quote.notes}</Text></Box>}
                    {quote.terms_conditions && <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 20 }}><Text fw={700} size="sm" style={{ color: textPri, marginBottom: 8 }}>📋 Terms & Conditions</Text><Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap' }}>{quote.terms_conditions}</Text></Box>}
                </SimpleGrid>
            )}

            <Group mt="md">
                <Box component={Link} href="/system/billing/quotes" style={{ color: textSec, textDecoration: 'none', fontSize: 13 }}>← Back to Quotes</Box>
            </Group>
        </DashboardLayout>
    );
}

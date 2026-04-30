import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ShowProforma({ proforma, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const statusInfo = statuses[proforma.status] ?? {};
    const cur        = proforma.currency ?? 'TZS';

    const handleDelete = () => {
        if (confirm(`Delete proforma ${proforma.document_number}?`)) router.delete(`/system/billing/proformas/${proforma.id}`);
    };

    const convertToInvoice = () => {
        router.post(`/system/billing/proformas/${proforma.id}/convert-to-invoice`);
    };

    return (
        <DashboardLayout title={`Proforma · ${proforma.document_number}`}>
            <Head title={proforma.document_number} />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap={8}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>{proforma.document_number}</Text>
                        <Badge size="sm" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>{statusInfo.label}</Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{proforma.client?.name}{proforma.client?.company_name ? ` — ${proforma.client.company_name}` : ''}</Text>
                </Stack>
                <Group gap="sm" wrap="wrap">
                    {['draft', 'sent', 'accepted'].includes(proforma.status) && (
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" onClick={convertToInvoice} style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                → Convert to Invoice
                            </Box>
                        </motion.div>
                    )}
                    <Box component={Link} href={`/system/billing/proformas/${proforma.id}/edit`} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>Edit</Box>
                    <Box component="button" onClick={handleDelete} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #EF444444', color: '#EF4444', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Delete</Box>
                </Group>
            </Group>

            {proforma.converted_from && (
                <Box style={{ background: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF', border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#3B82F6' }}>Converted from quote <Box component={Link} href={`/system/billing/quotes/${proforma.converted_from.id}`} style={{ color: '#3B82F6', fontWeight: 700 }}>{proforma.converted_from.document_number}</Box></Text>
                </Box>
            )}

            {/* Converted to invoice link */}
            {(proforma.conversions ?? []).length > 0 && (
                <Box style={{ background: isDark ? 'rgba(139,92,246,0.08)' : '#F5F3FF', border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : '#DDD6FE'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#7C3AED' }}>Converted to invoice: <Box component={Link} href={`/system/billing/invoices/${proforma.conversions[0].id}`} style={{ color: '#7C3AED', fontWeight: 700 }}>{proforma.conversions[0].document_number}</Box></Text>
                </Box>
            )}

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 20 }}>
                    <Stack gap={8}>
                        <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Issue Date</Text><Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(proforma.issue_date)}</Text></Group>
                        <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Due Date</Text><Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(proforma.due_date)}</Text></Group>
                        <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Valid Until</Text><Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(proforma.valid_until)}</Text></Group>
                        {proforma.trip && <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Trip</Text><Box component={Link} href={`/system/trips/${proforma.trip.id}`} style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600 }}>{proforma.trip.trip_number}</Box></Group>}
                    </Stack>
                </Box>
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 20 }}>
                    <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 8 }}>Bill To</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{proforma.client?.name}</Text>
                    {proforma.client?.company_name && <Text size="sm" style={{ color: textSec }}>{proforma.client.company_name}</Text>}
                    {proforma.client?.address && <Text size="sm" style={{ color: textSec }}>{proforma.client.address}</Text>}
                    {proforma.client?.tin_number && <Text size="xs" style={{ color: textSec }}>TIN: {proforma.client.tin_number}</Text>}
                </Box>
            </SimpleGrid>

            {/* Line items */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}><Text fw={700} size="sm" style={{ color: textPri }}>📦 Line Items</Text></Box>
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
                            {(proforma.items ?? []).map((item, i) => (
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
                <Box style={{ padding: '16px 20px', borderTop: `1px solid ${divider}`, maxWidth: 340, marginLeft: 'auto' }}>
                    <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>Subtotal</Text><Text size="sm" style={{ color: textPri }}>{cur} {fmt(proforma.subtotal)}</Text></Group>
                    {Number(proforma.discount_amount) > 0 && <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>Discount</Text><Text size="sm" style={{ color: '#EF4444' }}>− {cur} {fmt(proforma.discount_amount)}</Text></Group>}
                    {Number(proforma.tax_rate) > 0 && <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>VAT ({proforma.tax_rate}%)</Text><Text size="sm" style={{ color: textPri }}>{cur} {fmt(proforma.tax_amount)}</Text></Group>}
                    <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 8, marginTop: 4 }}>
                        <Group justify="space-between"><Text fw={800} size="sm" style={{ color: textPri }}>Total</Text><Text fw={800} size="lg" style={{ color: '#22C55E' }}>{cur} {fmt(proforma.total)}</Text></Group>
                    </Box>
                </Box>
            </Box>

            <Group mt="md">
                <Box component={Link} href="/system/billing/proformas" style={{ color: textSec, textDecoration: 'none', fontSize: 13 }}>← Back to Proformas</Box>
            </Group>
        </DashboardLayout>
    );
}

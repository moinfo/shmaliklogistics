import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, SimpleGrid, Select, NumberInput, TextInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ShowInvoice({ invoice, statuses, methods }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const statusInfo = statuses[invoice.status] ?? {};
    const cur        = invoice.currency ?? 'TZS';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    const [showPayForm, setShowPayForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        amount:           invoice.balance_due ?? '',
        payment_date:     new Date().toISOString().slice(0, 10),
        payment_method:   'bank_transfer',
        reference_number: '',
        notes:            '',
    });

    const submitPayment = (e) => {
        e.preventDefault();
        post(`/system/billing/invoices/${invoice.id}/payments`, {
            onSuccess: () => { setShowPayForm(false); reset(); },
        });
    };

    const handleDelete = () => {
        if (confirm(`Delete invoice ${invoice.document_number}?`)) router.delete(`/system/billing/invoices/${invoice.id}`);
    };

    const isPaid = invoice.status === 'paid';

    return (
        <DashboardLayout title={`Invoice · ${invoice.document_number}`}>
            <Head title={invoice.document_number} />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap={8}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>{invoice.document_number}</Text>
                        <Badge size="sm" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>{statusInfo.label}</Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{invoice.client?.name}{invoice.client?.company_name ? ` — ${invoice.client.company_name}` : ''}</Text>
                </Stack>
                <Group gap="sm" wrap="wrap">
                    {!isPaid && (
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" onClick={() => setShowPayForm(v => !v)} style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#059669,#10B981)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                💳 Record Payment
                            </Box>
                        </motion.div>
                    )}
                    <Box component={Link} href={`/system/billing/invoices/${invoice.id}/edit`} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>Edit</Box>
                    <Box component="button" onClick={handleDelete} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #EF444444', color: '#EF4444', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Delete</Box>
                </Group>
            </Group>

            {/* Converted from */}
            {invoice.converted_from && (
                <Box style={{ background: isDark ? 'rgba(139,92,246,0.08)' : '#F5F3FF', border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : '#DDD6FE'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#7C3AED' }}>Converted from proforma <Box component={Link} href={`/system/billing/proformas/${invoice.converted_from.id}`} style={{ color: '#7C3AED', fontWeight: 700 }}>{invoice.converted_from.document_number}</Box></Text>
                </Box>
            )}

            {/* Payment form */}
            {showPayForm && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid #22C55E55`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
                    <Text fw={700} size="sm" style={{ color: '#22C55E', marginBottom: 14 }}>💳 Record Payment</Text>
                    <form onSubmit={submitPayment}>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                            <NumberInput label="Amount" required min={0.01} thousandSeparator="," value={data.amount} onChange={v => setData('amount', v)} error={errors.amount} styles={{ ...inputStyles, section: { color: textSec } }} />
                            <DatePicker label="Payment Date" required value={data.payment_date} onChange={v => setData('payment_date', v)} error={errors.payment_date} styles={inputStyles} />
                            <Select label="Payment Method" required value={data.payment_method} onChange={v => setData('payment_method', v)}
                                data={Object.entries(methods).map(([k, v]) => ({ value: k, label: v }))}
                                error={errors.payment_method} styles={{ ...inputStyles, dropdown: dropdownStyle }} />
                            <TextInput label="Reference #" placeholder="TXN-12345" value={data.reference_number} onChange={e => setData('reference_number', e.target.value)} styles={inputStyles} />
                            <TextInput label="Notes" placeholder="Optional notes" value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyles} />
                        </SimpleGrid>
                        <Group mt="md" gap="sm">
                            <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#059669,#10B981)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: processing ? 0.7 : 1 }}>
                                {processing ? 'Saving…' : 'Save Payment'}
                            </Box>
                            <Box component="button" type="button" onClick={() => setShowPayForm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, color: textSec, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                        </Group>
                    </form>
                </Box>
            )}

            {/* Balance summary */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
                {[
                    { label: 'Invoice Total', value: `${cur} ${fmt(invoice.total)}`, color: textPri },
                    { label: 'Amount Paid', value: `${cur} ${fmt(invoice.amount_paid)}`, color: '#22C55E' },
                    { label: 'Balance Due', value: `${cur} ${fmt(invoice.balance_due)}`, color: invoice.balance_due > 0 ? '#F59E0B' : '#22C55E' },
                ].map(s => (
                    <Box key={s.label} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px' }}>
                        <Text size="xs" style={{ color: textSec }}>{s.label}</Text>
                        <Text fw={800} size="xl" style={{ color: s.color }}>{s.value}</Text>
                    </Box>
                ))}
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 20 }}>
                    <Stack gap={8}>
                        <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Issue Date</Text><Text size="sm" fw={600} style={{ color: textPri }}>{fmtDate(invoice.issue_date)}</Text></Group>
                        <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Due Date</Text><Text size="sm" fw={600} style={{ color: invoice.status === 'overdue' ? '#EF4444' : textPri }}>{fmtDate(invoice.due_date)}</Text></Group>
                        {invoice.trip && <Group justify="space-between"><Text size="sm" style={{ color: textSec }}>Trip</Text><Box component={Link} href={`/system/trips/${invoice.trip.id}`} style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600 }}>{invoice.trip.trip_number}</Box></Group>}
                    </Stack>
                </Box>
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 20 }}>
                    <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 8 }}>Bill To</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{invoice.client?.name}</Text>
                    {invoice.client?.company_name && <Text size="sm" style={{ color: textSec }}>{invoice.client.company_name}</Text>}
                    {invoice.client?.address && <Text size="sm" style={{ color: textSec }}>{invoice.client.address}</Text>}
                    {invoice.client?.tin_number && <Text size="xs" style={{ color: textSec }}>TIN: {invoice.client.tin_number}</Text>}
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
                            {(invoice.items ?? []).map((item, i) => (
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
                    <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>Subtotal</Text><Text size="sm" style={{ color: textPri }}>{cur} {fmt(invoice.subtotal)}</Text></Group>
                    {Number(invoice.discount_amount) > 0 && <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>Discount</Text><Text size="sm" style={{ color: '#EF4444' }}>− {cur} {fmt(invoice.discount_amount)}</Text></Group>}
                    {Number(invoice.tax_rate) > 0 && <Group justify="space-between" mb={4}><Text size="sm" style={{ color: textSec }}>VAT ({invoice.tax_rate}%)</Text><Text size="sm" style={{ color: textPri }}>{cur} {fmt(invoice.tax_amount)}</Text></Group>}
                    <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 8, marginTop: 4 }}>
                        <Group justify="space-between"><Text fw={800} size="sm" style={{ color: textPri }}>Total</Text><Text fw={800} size="lg" style={{ color: '#22C55E' }}>{cur} {fmt(invoice.total)}</Text></Group>
                    </Box>
                </Box>
            </Box>

            {/* Payments history */}
            {(invoice.payments ?? []).length > 0 && (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}><Text fw={700} size="sm" style={{ color: textPri }}>💳 Payment History</Text></Box>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                                {['Date', 'Amount', 'Method', 'Reference', 'Notes'].map((h, i) => (
                                    <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.payments.map((pay, i) => (
                                <tr key={i} style={{ borderTop: `1px solid ${divider}` }}>
                                    <td style={{ padding: '10px 16px', fontSize: 14, color: textSec }}>{fmtDate(pay.payment_date)}</td>
                                    <td style={{ padding: '10px 16px', fontSize: 14, fontWeight: 700, color: '#22C55E' }}>{cur} {fmt(pay.amount)}</td>
                                    <td style={{ padding: '10px 16px', fontSize: 14, color: textSec }}>{methods[pay.payment_method] ?? pay.payment_method}</td>
                                    <td style={{ padding: '10px 16px', fontSize: 13, color: textSec, fontFamily: 'monospace' }}>{pay.reference_number ?? '—'}</td>
                                    <td style={{ padding: '10px 16px', fontSize: 13, color: textSec }}>{pay.notes ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            )}

            <Group mt="md">
                <Box component={Link} href="/system/billing/invoices" style={{ color: textSec, textDecoration: 'none', fontSize: 13 }}>← Back to Invoices</Box>
            </Group>
        </DashboardLayout>
    );
}

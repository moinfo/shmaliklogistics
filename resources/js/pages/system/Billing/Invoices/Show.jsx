import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, NumberInput, TextInput, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';
import { printBillingDoc } from '../../../../utils/billingPrint';
import SendDocModal from '../../../../components/SendDocModal';
import { useCan } from '../../../../lib/can';

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function InfoRow({ icon, label, value, mono = false, isDark, accent }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8} style={{ minWidth: 0 }}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: accent ?? textPri, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right', wordBreak: 'break-all' }}>
                {value ?? '—'}
            </Text>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent, toolbar }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

export default function ShowInvoice({ invoice, statuses, methods, stages, company }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const statusInfo = statuses[invoice.status] ?? {};
    const cur        = invoice.currency ?? 'TZS';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` };

    const [showPayForm, setShowPayForm] = useState(false);
    const [sendOpen, setSendOpen]       = useState(false);
    const can = useCan();
    const { data, setData, post, processing, errors, reset } = useForm({
        amount:           invoice.balance_due ?? '',
        usd_amount:       '',
        exchange_rate:    '',
        payment_date:     new Date().toISOString().slice(0, 10),
        payment_method:   'bank_transfer',
        payment_stage:    'final',
        reference_number: '',
        cheque_number:    '',
        cheque_date:      '',
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

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={6}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                    📄
                                </Box>
                                <Stack gap={2}>
                                    <Group gap={10} align="center">
                                        <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.5 }}>{invoice.document_number}</Text>
                                        {statusInfo.color && (
                                            <Box style={{ background: statusInfo.color + '30', border: `1px solid ${statusInfo.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                                <Group gap={5} align="center">
                                                    <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
                                                    <Text size="xs" fw={700} style={{ color: '#fff' }}>{statusInfo.label}</Text>
                                                </Group>
                                            </Box>
                                        )}
                                    </Group>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        {invoice.client?.name}{invoice.client?.company_name ? ` — ${invoice.client.company_name}` : ''}
                                    </Text>
                                </Stack>
                            </Group>
                        </Stack>

                        <Group gap={8} wrap="wrap">
                            {can('billing_payments.create') && !isPaid && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component="button" onClick={() => setShowPayForm(v => !v)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        💳 Record Payment
                                    </Box>
                                </motion.div>
                            )}
                            {can('billing_invoices.edit') && (
                                <Box component="button" onClick={() => setSendOpen(true)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                    ✉ Send
                                </Box>
                            )}
                            <Box component="button" onClick={() => printBillingDoc(invoice, company, 'invoice')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                🖨 Print
                            </Box>
                            {can('billing_invoices.view') && (
                                <Box component="a" href={`/system/billing/invoices/${invoice.id}/pdf`} target="_blank"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                    ⬇ PDF
                                </Box>
                            )}
                            {can('billing_invoices.edit') && (
                                <Box component={Link} href={`/system/billing/invoices/${invoice.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                            {can('billing_invoices.delete') && (
                                <Tooltip label="Delete invoice">
                                    <ActionIcon onClick={handleDelete} size={38}
                                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, color: '#FCA5A5' }}>
                                        🗑️
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Converted from banner */}
            {invoice.converted_from && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                    <Box style={{ background: isDark ? 'rgba(139,92,246,0.08)' : '#F5F3FF', border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : '#DDD6FE'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                        <Text size="sm" style={{ color: '#7C3AED' }}>
                            Converted from proforma{' '}
                            <Box component={Link} href={`/system/billing/proformas/${invoice.converted_from.id}`} style={{ color: '#7C3AED', fontWeight: 700 }}>
                                {invoice.converted_from.document_number}
                            </Box>
                        </Text>
                    </Box>
                </motion.div>
            )}

            {/* Payment form */}
            {showPayForm && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <Box mb={16} style={{ background: cardBg, border: '1px solid rgba(34,197,94,0.35)', borderRadius: 16, padding: 20, boxShadow: cardShadow }}>
                        <Group gap={8} mb={16}>
                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                            <Text fw={700} size="sm" style={{ color: '#22C55E' }}>Record Payment</Text>
                        </Group>
                        <form onSubmit={submitPayment}>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                                <NumberInput label="Amount (TZS)" required min={0.01} thousandSeparator="," value={data.amount} onChange={v => setData('amount', v)} error={errors.amount} styles={{ ...inputStyles, section: { color: textSec } }} />
                                <DatePicker label="Payment Date" required value={data.payment_date} onChange={v => setData('payment_date', v)} error={errors.payment_date} styles={inputStyles} />
                                <Select
                                    label="Payment Stage" required value={data.payment_stage}
                                    onChange={v => setData('payment_stage', v ?? 'final')}
                                    data={Object.entries(stages ?? {}).map(([k, s]) => ({ value: k, label: s.label }))}
                                    error={errors.payment_stage}
                                    styles={{ ...inputStyles, dropdown: dropdownStyle }}
                                />
                                <Select label="Payment Method" required value={data.payment_method}
                                    onChange={v => setData('payment_method', v ?? 'bank_transfer')}
                                    data={Object.entries(methods).map(([k, v]) => ({ value: k, label: v }))}
                                    error={errors.payment_method} styles={{ ...inputStyles, dropdown: dropdownStyle }} />
                                <TextInput label="Reference #" placeholder="TXN-12345" value={data.reference_number} onChange={e => setData('reference_number', e.target.value)} styles={inputStyles} />
                                <TextInput label="Notes" placeholder="Optional notes" value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyles} />
                            </SimpleGrid>

                            {data.payment_method === 'cheque' && (
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
                                    <TextInput label="Cheque Number" placeholder="001234" required value={data.cheque_number} onChange={e => setData('cheque_number', e.target.value)} error={errors.cheque_number} styles={inputStyles} />
                                    <DatePicker label="Cheque Date" value={data.cheque_date} onChange={v => setData('cheque_date', v)} error={errors.cheque_date} styles={inputStyles} />
                                </SimpleGrid>
                            )}

                            <Box mt="md" style={{ background: isDark ? 'rgba(59,130,246,0.06)' : '#EFF6FF', borderRadius: 12, padding: '14px 16px', border: `1px solid ${isDark ? 'rgba(59,130,246,0.18)' : '#BFDBFE'}` }}>
                                <Text size="xs" fw={700} style={{ color: '#3B82F6', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.7 }}>💵 USD Payment (optional)</Text>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                    <NumberInput label="USD Amount" placeholder="5,000" min={0} thousandSeparator="," prefix="$ " value={data.usd_amount} onChange={v => setData('usd_amount', v)} error={errors.usd_amount} styles={{ ...inputStyles, section: { color: textSec } }} />
                                    <NumberInput label="Exchange Rate" placeholder="2,550" min={0} thousandSeparator="," value={data.exchange_rate} onChange={v => setData('exchange_rate', v)} error={errors.exchange_rate} styles={{ ...inputStyles, section: { color: textSec } }} />
                                </SimpleGrid>
                            </Box>

                            <Group mt="md" gap="sm">
                                <Box component="button" type="submit" disabled={processing}
                                    style={{ padding: '9px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #065F46, #059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: processing ? 0.7 : 1 }}>
                                    {processing ? 'Saving…' : 'Save Payment'}
                                </Box>
                                <Box component="button" type="button" onClick={() => setShowPayForm(false)}
                                    style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>
                                    Cancel
                                </Box>
                            </Group>
                        </form>
                    </Box>
                </motion.div>
            )}

            {/* Balance summary stat cards */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
                {[
                    { label: 'Invoice Total', value: `${cur} ${fmt(invoice.total)}`, grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.35)', icon: '💵' },
                    { label: 'Amount Paid',   value: `${cur} ${fmt(invoice.amount_paid)}`, grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.35)', icon: '✅' },
                    { label: 'Balance Due',   value: `${cur} ${fmt(invoice.balance_due)}`, grad: invoice.balance_due > 0 ? 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)' : 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: invoice.balance_due > 0 ? '0 8px 28px rgba(245,158,11,0.35)' : '0 8px 28px rgba(16,185,129,0.35)', icon: invoice.balance_due > 0 ? '⏳' : '✅' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 90 }}>
                            <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group gap={10} align="flex-start" mb={8}>
                                <Box style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" size="lg" style={{ lineHeight: 1.2, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={3} style={{ opacity: 0.7 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Invoice info */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Invoice Details" icon="📋" isDark={isDark} accent={['#1D4ED8', '#3B82F6']}>
                        <InfoRow icon="🗓" label="Issue Date" value={fmtDate(invoice.issue_date)} isDark={isDark} />
                        <InfoRow icon="⏰" label="Due Date"   value={fmtDate(invoice.due_date)}   isDark={isDark} accent={invoice.status === 'overdue' ? '#EF4444' : undefined} />
                        {invoice.trip && (
                            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
                                <Group gap={8}><Text size="sm">🚛</Text><Text size="sm" style={{ color: textSec }}>Trip</Text></Group>
                                <Box component={Link} href={`/system/trips/${invoice.trip.id}`} style={{ color: '#3B82F6', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                                    {invoice.trip.trip_number}
                                </Box>
                            </Box>
                        )}
                    </SectionCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Bill To" icon="🏢" isDark={isDark} accent={['#065F46', '#059669']}>
                        <Box style={{ paddingTop: 8 }}>
                            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 4 }}>{invoice.client?.name}</Text>
                            {invoice.client?.company_name && <Text size="sm" style={{ color: textSec, marginBottom: 2 }}>{invoice.client.company_name}</Text>}
                            {invoice.client?.address    && <Text size="sm" style={{ color: textSec, marginBottom: 2 }}>{invoice.client.address}</Text>}
                            {invoice.client?.tin_number && <Text size="xs" style={{ color: textMut }}>TIN: {invoice.client.tin_number}</Text>}
                        </Box>
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* Line items */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box mb="md" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #6D28D9, #8B5CF6)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Text size="md">📦</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Line Items</Text>
                        </Group>
                    </Box>

                    {/* Line items head */}
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 140px 140px', background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                        {['Description', 'Qty', 'Unit', 'Unit Price', 'Total'].map((h, i) => (
                            <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</Text>
                        ))}
                    </Box>

                    {(invoice.items ?? []).map((item, i) => (
                        <Box key={i} style={{
                            display: 'grid', gridTemplateColumns: '1fr 80px 80px 140px 140px',
                            padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center',
                            transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Text size="sm" style={{ color: textPri }}>{item.description}</Text>
                            <Text size="sm" style={{ color: textSec }}>{item.quantity}</Text>
                            <Text size="sm" style={{ color: textSec }}>{item.unit ?? '—'}</Text>
                            <Text size="sm" style={{ color: textSec, textAlign: 'right' }}>{cur} {fmt(item.unit_price)}</Text>
                            <Text size="sm" fw={700} style={{ color: textPri, textAlign: 'right' }}>{cur} {fmt(item.total)}</Text>
                        </Box>
                    ))}

                    {/* Totals */}
                    <Box style={{ padding: '14px 20px', borderTop: `1px solid ${divider}`, maxWidth: 360, marginLeft: 'auto' }}>
                        <Group justify="space-between" mb={6}>
                            <Text size="sm" style={{ color: textSec }}>Subtotal</Text>
                            <Text size="sm" style={{ color: textPri }}>{cur} {fmt(invoice.subtotal)}</Text>
                        </Group>
                        {Number(invoice.discount_amount) > 0 && (
                            <Group justify="space-between" mb={6}>
                                <Text size="sm" style={{ color: textSec }}>Discount</Text>
                                <Text size="sm" style={{ color: '#EF4444' }}>− {cur} {fmt(invoice.discount_amount)}</Text>
                            </Group>
                        )}
                        {Number(invoice.tax_rate) > 0 && (
                            <Group justify="space-between" mb={6}>
                                <Text size="sm" style={{ color: textSec }}>VAT ({invoice.tax_rate}%)</Text>
                                <Text size="sm" style={{ color: textPri }}>{cur} {fmt(invoice.tax_amount)}</Text>
                            </Group>
                        )}
                        <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 10, marginTop: 4 }}>
                            <Group justify="space-between">
                                <Text fw={800} size="sm" style={{ color: textPri }}>Total</Text>
                                <Text fw={900} size="lg" style={{ color: '#22C55E' }}>{cur} {fmt(invoice.total)}</Text>
                            </Group>
                        </Box>
                    </Box>
                </Box>
            </motion.div>

            {/* Payment history */}
            {(invoice.payments ?? []).length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Box mb="md" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #065F46, #059669)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}>
                                <Text size="md">💳</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Payment History</Text>
                            </Group>
                        </Box>

                        {/* Head */}
                        <Box style={{ display: 'grid', gridTemplateColumns: '110px 130px 160px 140px 150px 1fr', background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                            {['Date', 'Stage', 'Amount', 'Method', 'Cheque / Ref', 'Notes'].map(h => (
                                <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                            ))}
                        </Box>

                        {invoice.payments.map((pay, i) => {
                            const stageMeta = (stages ?? {})[pay.payment_stage];
                            return (
                                <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                    <Box style={{
                                        display: 'grid', gridTemplateColumns: '110px 130px 160px 140px 150px 1fr',
                                        padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center',
                                        transition: 'background 0.15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <Text size="sm" fw={600} style={{ color: textSec }}>{fmtDate(pay.payment_date)}</Text>
                                        <Box>
                                            {stageMeta ? (
                                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: stageMeta.color + '1A', border: `1px solid ${stageMeta.color}44`, borderRadius: 20, padding: '3px 10px' }}>
                                                    <Box style={{ width: 6, height: 6, borderRadius: '50%', background: stageMeta.color, boxShadow: `0 0 5px ${stageMeta.color}` }} />
                                                    <Text size="xs" fw={700} style={{ color: stageMeta.color }}>{stageMeta.label}</Text>
                                                </Box>
                                            ) : <Text size="xs" style={{ color: textMut }}>—</Text>}
                                        </Box>
                                        <Stack gap={0}>
                                            <Text size="sm" fw={800} style={{ color: '#22C55E' }}>{cur} {fmt(pay.amount)}</Text>
                                            {pay.usd_amount && <Text size="xs" style={{ color: '#3B82F6' }}>$ {fmt(pay.usd_amount)}</Text>}
                                        </Stack>
                                        <Text size="sm" style={{ color: textSec }}>{methods[pay.payment_method] ?? pay.payment_method}</Text>
                                        <Box>
                                            {pay.cheque_number ? (
                                                <Stack gap={0}>
                                                    <Text size="xs" fw={700} style={{ color: textSec, fontFamily: 'monospace' }}>{pay.cheque_number}</Text>
                                                    {pay.cheque_date && <Text size="xs" style={{ color: textMut }}>{fmtDate(pay.cheque_date)}</Text>}
                                                </Stack>
                                            ) : (
                                                <Text size="xs" style={{ color: textSec, fontFamily: 'monospace' }}>{pay.reference_number ?? '—'}</Text>
                                            )}
                                        </Box>
                                        <Text size="xs" style={{ color: textMut }}>{pay.notes ?? '—'}</Text>
                                    </Box>
                                </motion.div>
                            );
                        })}
                    </Box>
                </motion.div>
            )}

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/billing/invoices"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Invoices
                </Box>
            </Box>

            <SendDocModal
                doc={invoice} docType="invoice" company={company}
                opened={sendOpen} onClose={() => setSendOpen(false)}
            />
        </DashboardLayout>
    );
}

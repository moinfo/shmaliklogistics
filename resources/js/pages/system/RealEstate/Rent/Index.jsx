import { Head, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

const dk = {
    card:    '#0F1E32',
    cardHov: '#132436',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n || 0));
}

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
            <Text size="xs" fw={600} style={{ color: meta.color }}>{meta.label}</Text>
        </Box>
    );
}

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

function isOverdue(inv) {
    if (inv.status === 'overdue') return true;
    if (inv.status === 'paid' || inv.status === 'cancelled') return false;
    if (Number(inv.balance_due) <= 0) return false;
    if (!inv.due_date) return false;
    const due = new Date(inv.due_date);
    if (isNaN(due.getTime())) return false;
    return due < new Date(todayStr());
}

function PaymentForm({ invoice, paymentMethods, isDark, cardBorder, textPri, textSec, onClose }) {
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const [data, setData] = useState({
        amount: invoice.balance_due ?? '',
        payment_date: todayStr(),
        payment_method: Object.keys(paymentMethods)[0] ?? 'cash',
        reference_number: '',
    });
    const [receipt, setReceipt] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textPri, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

    const submit = (e) => {
        e.preventDefault();
        const payload = { ...data };
        if (receipt) payload.receipt = receipt;
        setProcessing(true);
        router.post(`/system/real-estate/rent/invoices/${invoice.id}/payments`, payload, {
            preserveScroll: true,
            forceFormData: !!receipt,
            onSuccess: () => { setProcessing(false); onClose(); },
            onError: (errs) => { setProcessing(false); setErrors(errs); },
        });
    };

    return (
        <Box component="form" onSubmit={submit} style={{ background: isDark ? '#07111F' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 10, padding: 16, marginTop: 8 }}>
            <Text fw={700} size="xs" style={{ color: textPri, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Record Payment — {invoice.invoice_number}</Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm" mb="sm">
                <Box>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Amount ({invoice.currency || 'TZS'}) *</Text>
                    <Box component="input" type="number" step="0.01" min="0" value={data.amount}
                        onChange={e => setData(p => ({ ...p, amount: e.target.value }))}
                        style={{ ...inputStyle, borderColor: errors.amount ? '#EF4444' : cardBorder }} />
                    {errors.amount && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors.amount}</Text>}
                </Box>
                <Box>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Payment Date *</Text>
                    <Box component="input" type="date" value={data.payment_date}
                        onChange={e => setData(p => ({ ...p, payment_date: e.target.value }))}
                        style={{ ...inputStyle, borderColor: errors.payment_date ? '#EF4444' : cardBorder }} />
                    {errors.payment_date && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors.payment_date}</Text>}
                </Box>
                <Box>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Method *</Text>
                    <Box component="select" value={data.payment_method}
                        onChange={e => setData(p => ({ ...p, payment_method: e.target.value }))}
                        style={inputStyle}>
                        {Object.entries(paymentMethods).map(([k, v]) => (
                            <option key={k} value={k}>{v.label ?? v}</option>
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Reference #</Text>
                    <Box component="input" type="text" value={data.reference_number}
                        onChange={e => setData(p => ({ ...p, reference_number: e.target.value }))}
                        placeholder="e.g. TXN12345"
                        style={inputStyle} />
                </Box>
            </SimpleGrid>
            <Box mb="sm">
                <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Receipt (optional)</Text>
                <Box component="input" type="file" accept="image/*,application/pdf"
                    onChange={e => setReceipt(e.target.files?.[0] ?? null)}
                    style={{ ...inputStyle, padding: '6px 10px' }} />
            </Box>
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose}
                    style={{ padding: '7px 16px', borderRadius: 8, background: 'none', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                    Cancel
                </Box>
                <Box component="button" type="submit" disabled={processing}
                    style={{ padding: '7px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : 'Save Payment'}
                </Box>
            </Group>
        </Box>
    );
}

export default function RentIndex({ invoices, stats, statuses, paymentMethods, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const rowHov     = isDark ? dk.cardHov : '#F8FAFC';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [showGenerate, setShowGenerate] = useState(false);
    const [genMonth, setGenMonth] = useState(currentMonth());
    const [generating, setGenerating] = useState(false);
    const [payFor, setPayFor] = useState(null);
    const can = useCan();

    const applyFilters = (s, st) => {
        router.get('/system/real-estate/rent', { search: s, status: st }, { preserveState: true, replace: true });
    };

    const generate = (e) => {
        e.preventDefault();
        setGenerating(true);
        router.post('/system/real-estate/rent/generate', { month: genMonth }, {
            preserveScroll: true,
            onFinish: () => { setGenerating(false); setShowGenerate(false); },
        });
    };

    const statCards = [
        { icon: '🧾', label: 'Total Billed',  value: `TZS ${fmt(stats?.total_billed)}`,    accent: ['#1565C0', '#2196F3'], color: textPri },
        { icon: '💰', label: 'Collected',     value: `TZS ${fmt(stats?.total_collected)}`, accent: ['#065F46', '#059669'], color: textPri },
        { icon: '⚠️', label: 'Outstanding',   value: `TZS ${fmt(stats?.outstanding)}`,     accent: ['#7F1D1D', '#EF4444'], color: '#EF4444' },
        { icon: '⏰', label: 'Overdue',       value: stats?.overdue_count ?? 0,            accent: ['#92400E', '#F59E0B'], color: textPri },
    ];

    const cols = '120px 1fr 1fr 150px 110px 130px 120px 120px 120px 130px';
    const headers = ['Invoice #', 'Tenant', 'Property', 'Period', 'Due', 'Amount', 'Status', 'Paid', 'Balance', ''];
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    return (
        <DashboardLayout title="Rent">
            <Head title="Rent — Invoices & Collection" />

            {/* Header */}
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Rent Invoices & Collection</Text>
                    <Text size="sm" style={{ color: textSec }}>Generate monthly rent invoices and record tenant payments</Text>
                </Stack>
                {can('realestate_rent.create') && (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" onClick={() => setShowGenerate(v => !v)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            🧾 Generate Rent Invoices
                        </Box>
                    </motion.div>
                )}
            </Group>

            {/* Generate form */}
            {showGenerate && can('realestate_rent.create') && (
                <Box component="form" onSubmit={generate} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
                    <Group justify="space-between" align="flex-end" gap="md" wrap="wrap">
                        <Box style={{ flex: 1, minWidth: 220 }}>
                            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Billing month</Text>
                            <Box component="input" type="month" value={genMonth}
                                onChange={e => setGenMonth(e.target.value)}
                                style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                            <Text size="xs" style={{ color: textMut, marginTop: 6 }}>
                                Generates the next due invoice for each active lease whose period falls on or before this month. Already-invoiced periods are skipped.
                            </Text>
                        </Box>
                        <Group gap="sm">
                            <Box component="button" type="button" onClick={() => setShowGenerate(false)}
                                style={{ padding: '8px 16px', borderRadius: 8, background: 'none', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                                Cancel
                            </Box>
                            <Box component="button" type="submit" disabled={generating}
                                style={{ padding: '8px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
                                {generating ? 'Generating…' : 'Generate'}
                            </Box>
                        </Group>
                    </Group>
                </Box>
            )}

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` }} />
                            <Text style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</Text>
                            <Text fw={800} size="lg" style={{ color: s.color }}>{s.value}</Text>
                            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search invoice, tenant, property…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(search, status)}
                        style={{ flex: 1 }}
                        styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters(search, v ?? ''); }}
                        clearable
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        w={180}
                    />
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, borderBottom: `1px solid ${divider}`, padding: '10px 20px', overflowX: 'auto' }}>
                    {headers.map((h, i) => (
                        <Text key={i} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {invoices.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>🧾</Text>
                        <Text fw={600} style={{ color: textPri }}>No rent invoices</Text>
                        <Text size="sm" style={{ color: textMut }}>Generate invoices to begin collection</Text>
                    </Box>
                ) : (
                    invoices.data.map((inv, i) => {
                        const overdue = isOverdue(inv);
                        const balance = Number(inv.balance_due);
                        const canPay = balance > 0 && inv.status !== 'cancelled' && can('realestate_rent.create');
                        const isPaying = payFor === inv.id;
                        return (
                            <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                <Box style={{ borderBottom: `1px solid ${divider}`, background: overdue ? (isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)') : 'transparent' }}>
                                    <Box
                                        style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, padding: '14px 20px', transition: 'background 0.15s', alignItems: 'center' }}
                                        onMouseEnter={e => { if (!overdue) e.currentTarget.style.background = rowHov; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{inv.invoice_number}</Text>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{inv.tenant_name || '—'}</Text>
                                        <Text size="sm" style={{ color: textSec }}>{inv.property_label || '—'}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{formatDate(inv.period_start)} – {formatDate(inv.period_end)}</Text>
                                        <Stack gap={1}>
                                            <Text size="sm" style={{ color: textSec }}>{formatDate(inv.due_date)}</Text>
                                            {overdue && <Text size="10px" fw={700} style={{ color: '#EF4444' }}>OVERDUE</Text>}
                                        </Stack>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{inv.currency || 'TZS'} {fmt(inv.amount)}</Text>
                                        <StatusPill status={inv.status} statuses={statuses} />
                                        <Text size="sm" style={{ color: textSec }}>{fmt(inv.amount_paid)}</Text>
                                        <Text size="sm" fw={700} style={{ color: balance > 0 ? '#EF4444' : textSec }}>{fmt(balance)}</Text>
                                        <Box>
                                            {canPay && (
                                                <Box component="button" onClick={() => setPayFor(isPaying ? null : inv.id)}
                                                    style={{ padding: '5px 12px', borderRadius: 6, background: isPaying ? (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9') : 'rgba(34,197,94,0.12)', color: isPaying ? textSec : '#22C55E', border: `1px solid ${isPaying ? cardBorder : 'rgba(34,197,94,0.3)'}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    {isPaying ? 'Close' : '＋ Payment'}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    {isPaying && canPay && (
                                        <Box style={{ padding: '0 20px 16px' }}>
                                            <PaymentForm
                                                invoice={inv}
                                                paymentMethods={paymentMethods}
                                                isDark={isDark}
                                                cardBorder={cardBorder}
                                                textPri={textPri}
                                                textSec={textSec}
                                                onClose={() => setPayFor(null)}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </motion.div>
                        );
                    })
                )}
            </Box>

            {/* Pagination */}
            {invoices.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={invoices.current_page}
                        total={invoices.last_page}
                        onChange={p => router.get('/system/real-estate/rent', { ...filters, page: p })}
                        size="sm"
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}
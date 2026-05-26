import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
}

function DataRow({ label, value, isDark, mono = false }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const divider = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
            <Text size="sm" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right' }}>{value ?? '—'}</Text>
        </Box>
    );
}

function Card({ title, children, isDark, accent }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
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

function PaymentForm({ invoice, paymentMethods, isDark, cardBorder, textPri, textSec, textMut, inputBg, onDone }) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState({
        amount: invoice.balance_due ?? '',
        payment_date: todayStr,
        payment_method: 'cash',
        reference_number: '',
    });
    const [receipt, setReceipt] = useState(null);
    const [busy, setBusy] = useState(false);
    const fileRef = useRef();

    const inputStyle = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textPri, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };

    const submit = (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('amount', form.amount);
        fd.append('payment_date', form.payment_date);
        fd.append('payment_method', form.payment_method);
        if (form.reference_number) fd.append('reference_number', form.reference_number);
        if (receipt) fd.append('receipt', receipt);
        setBusy(true);
        router.post(`/system/real-estate/rent/invoices/${invoice.id}/payments`, fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => { setBusy(false); },
            onSuccess: () => { if (onDone) onDone(); if (fileRef.current) fileRef.current.value = ''; },
        });
    };

    return (
        <Box style={{ padding: '14px 16px', background: isDark ? 'rgba(59,130,246,0.04)' : '#F8FBFF', borderRadius: 10, border: `1px solid ${cardBorder}`, marginTop: 10 }}>
            <form onSubmit={submit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 10 }}>
                    <div>
                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Amount *</Text>
                        <input type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={inputStyle} required />
                    </div>
                    <div>
                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Payment Date *</Text>
                        <input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} style={inputStyle} required />
                    </div>
                    <div>
                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Method *</Text>
                        <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} style={inputStyle} required>
                            {Object.entries(paymentMethods).map(([k, v]) => <option key={k} value={k}>{v.label ?? v}</option>)}
                        </select>
                    </div>
                    <div>
                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Reference #</Text>
                        <input type="text" placeholder="Optional" value={form.reference_number} onChange={e => setForm(p => ({ ...p, reference_number: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Receipt</Text>
                        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setReceipt(e.target.files[0] || null)} style={{ ...inputStyle, padding: '6px 10px' }} />
                    </div>
                </div>
                <button type="submit" disabled={busy} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#065F46,#059669)', color: '#fff', border: 'none', cursor: busy ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, opacity: busy ? 0.7 : 1 }}>
                    {busy ? 'Saving…' : 'Save Payment'}
                </button>
            </form>
        </Box>
    );
}

export default function ShowLease({ lease, invoices = [], statuses = {}, billingCycles = {}, paymentMethods = {} }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const can = useCan();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const meta = statuses[lease.status] ?? { label: lease.status, color: '#94A3B8' };
    const cycleLabel = billingCycles?.[lease.billing_cycle]?.label ?? lease.billing_cycle;

    const unit = lease.unit ?? null;
    const property = unit?.property ?? null;
    const tenant = lease.tenant ?? null;

    const flash = props.flash ?? {};

    // Contract upload
    const contractRef = useRef();
    const [contractFile, setContractFile] = useState(null);
    const [contractBusy, setContractBusy] = useState(false);

    const uploadContract = (e) => {
        e.preventDefault();
        if (!contractFile) return;
        const fd = new FormData();
        fd.append('file', contractFile);
        setContractBusy(true);
        router.post(`/system/real-estate/leases/${lease.id}/contract`, fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => { setContractBusy(false); setContractFile(null); if (contractRef.current) contractRef.current.value = ''; },
        });
    };

    const handleStatusChange = (status) => {
        router.patch(`/system/real-estate/leases/${lease.id}/status`, { status }, { preserveScroll: true });
    };

    const confirmDelete = () => {
        if (window.confirm(`Delete ${lease.lease_number}? This cannot be undone.`)) {
            router.delete(`/system/real-estate/leases/${lease.id}`);
        }
    };

    const [openPayment, setOpenPayment] = useState(null);

    const invoiceCols = '140px 1fr 110px 120px 110px 110px 110px 130px';

    return (
        <DashboardLayout title={lease.lease_number}>
            <Head title={lease.lease_number} />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Stack gap={4}>
                    <Group gap="md">
                        <Text fw={800} size="xl" style={{ color: textPri }}>{lease.lease_number}</Text>
                        <StatusPill status={lease.status} statuses={statuses} />
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>
                        {tenant?.name ?? '—'}{property ? ` · ${property.name}` : ''}{unit ? ` — ${unit.unit_number}` : ''}
                    </Text>
                </Stack>
                <Group gap="sm">
                    {can('realestate_leases.edit') && (
                        <Select
                            value={lease.status}
                            onChange={handleStatusChange}
                            data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                            size="sm"
                            styles={{
                                input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8, width: 150 },
                                dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
                            }}
                        />
                    )}
                    {can('realestate_leases.edit') && (
                        <Box
                            component={Link}
                            href={`/system/real-estate/leases/${lease.id}/edit`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ✏️ Edit
                        </Box>
                    )}
                    {can('realestate_leases.delete') && (
                        <Tooltip label="Delete lease">
                            <ActionIcon onClick={confirmDelete} size={36} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444' }}>🗑️</ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            </Group>

            {/* Info cards */}
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
                <Card title="Lease Terms" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                    <DataRow label="Rent"          value={`${lease.rent_currency} ${fmt(lease.rent_amount)}`} isDark={isDark} />
                    <DataRow label="Billing Cycle" value={cycleLabel} isDark={isDark} />
                    <DataRow label="Deposit"       value={`${lease.rent_currency} ${fmt(lease.deposit_amount)}`} isDark={isDark} />
                    <DataRow label="Payment Day"   value={lease.payment_day ? `Day ${lease.payment_day}` : '—'} isDark={isDark} />
                    <DataRow label="Start"         value={formatDate(lease.start_date)} isDark={isDark} />
                    <DataRow label="End"           value={lease.end_date ? formatDate(lease.end_date) : '—'} isDark={isDark} />
                </Card>

                <Card title="Tenant" isDark={isDark} accent={['#065F46', '#059669']}>
                    <DataRow label="Name"  value={tenant?.name} isDark={isDark} />
                    <DataRow label="Phone" value={tenant?.phone} isDark={isDark} />
                    {tenant && (
                        <Box mt="sm">
                            <Box component={Link} href={`/system/real-estate/tenants/${tenant.id}`} style={{ color: '#60A5FA', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                                View tenant ↗
                            </Box>
                        </Box>
                    )}
                </Card>

                <Card title="Property / Unit" isDark={isDark} accent={['#4C1D95', '#7C3AED']}>
                    <DataRow label="Property" value={property?.name} isDark={isDark} />
                    <DataRow label="Unit"     value={unit?.unit_number} isDark={isDark} />
                    {property && (
                        <Box mt="sm">
                            <Box component={Link} href={`/system/real-estate/properties/${property.id}`} style={{ color: '#60A5FA', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                                View property ↗
                            </Box>
                        </Box>
                    )}
                </Card>
            </SimpleGrid>

            {/* CONTRACT (mkataba) — prominent */}
            <Box mb="md" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #92400E, #F59E0B)' }} />
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Text fw={700} size="sm" style={{ color: textPri }}>📜 Lease Contract (Mkataba)</Text>
                </Box>
                <Box style={{ padding: '18px 20px' }}>
                    {lease.contract_url ? (
                        <Group justify="space-between" align="center" wrap="wrap" mb="md">
                            <Group gap="sm">
                                <Text style={{ fontSize: 24 }}>📄</Text>
                                <Stack gap={2}>
                                    <Box component="a" href={lease.contract_url} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                                        View contract ↗
                                    </Box>
                                    {lease.contract_uploaded_at && (
                                        <Text size="xs" style={{ color: textMut }}>Uploaded {formatDate(lease.contract_uploaded_at)}</Text>
                                    )}
                                </Stack>
                            </Group>
                            <Box style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '3px 12px' }}>
                                <Text size="xs" fw={700} style={{ color: '#22C55E' }}>✓ On file</Text>
                            </Box>
                        </Group>
                    ) : (
                        <Box mb="md" style={{ background: isDark ? 'rgba(245,158,11,0.06)' : '#FFFBEB', border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : '#FDE68A'}`, borderRadius: 10, padding: '12px 16px' }}>
                            <Text size="sm" style={{ color: '#F59E0B' }}>No contract uploaded yet. Upload the signed mkataba below.</Text>
                        </Box>
                    )}

                    {can('realestate_leases.edit') && (
                        <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 14 }}>
                            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 8 }}>
                                {lease.contract_url ? 'Replace contract document' : 'Upload contract document'}
                            </Text>
                            <form onSubmit={uploadContract}>
                                <Stack gap="sm">
                                    <Box style={{ display: 'flex', alignItems: 'center', gap: 10, background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px' }}>
                                        <input ref={contractRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            style={{ flex: 1, fontSize: 12, color: textSec, background: 'none', border: 'none', outline: 'none' }}
                                            onChange={e => setContractFile(e.target.files[0] || null)} />
                                    </Box>
                                    {contractFile && (
                                        <Text size="xs" style={{ color: '#60A5FA' }}>
                                            Selected: {contractFile.name} ({(contractFile.size / 1024).toFixed(0)} KB)
                                        </Text>
                                    )}
                                    <motion.div whileTap={{ scale: 0.98 }}>
                                        <Box component="button" type="submit" disabled={!contractFile || contractBusy}
                                            style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: contractFile && !contractBusy ? 'pointer' : 'not-allowed', border: 'none', background: contractFile && !contractBusy ? 'linear-gradient(135deg, #92400E, #F59E0B)' : (isDark ? 'rgba(255,255,255,0.07)' : '#E2E8F0'), color: contractFile && !contractBusy ? '#fff' : textMut, opacity: contractBusy ? 0.6 : 1 }}>
                                            {contractBusy ? 'Uploading…' : (lease.contract_url ? '↑ Replace Contract' : '↑ Upload Contract')}
                                        </Box>
                                    </motion.div>
                                </Stack>
                            </form>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Terms / Notes */}
            {(lease.terms || lease.notes) && (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                    {lease.terms && (
                        <Card title="Terms" isDark={isDark}>
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{lease.terms}</Text>
                        </Card>
                    )}
                    {lease.notes && (
                        <Card title="Notes" isDark={isDark}>
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{lease.notes}</Text>
                        </Card>
                    )}
                </SimpleGrid>
            )}

            {/* Rent invoices */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <Group justify="space-between" style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Text fw={700} size="sm" style={{ color: textPri }}>🧾 Rent Invoices</Text>
                </Group>

                {invoices.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '28px 0' }}>
                        <Text size="sm" style={{ color: textMut }}>No rent invoices for this lease yet.</Text>
                    </Box>
                ) : (
                    <Box style={{ overflowX: 'auto' }}>
                        <Box style={{ display: 'grid', gridTemplateColumns: invoiceCols, padding: '8px 20px', borderBottom: `1px solid ${divider}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                            {['Invoice #', 'Period', 'Due', 'Amount', 'Status', 'Paid', 'Balance', ''].map(h => (
                                <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                            ))}
                        </Box>
                        {invoices.map((inv, i) => {
                            const canPay = (inv.status === 'unpaid' || inv.status === 'partial' || inv.status === 'overdue') && Number(inv.balance_due) > 0;
                            const isOpen = openPayment === inv.id;
                            return (
                                <Box key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? `1px solid ${divider}` : 'none' }}>
                                    <Box style={{ display: 'grid', gridTemplateColumns: invoiceCols, padding: '12px 20px', alignItems: 'center' }}>
                                        <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{inv.invoice_number}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{formatDate(inv.period_start)} – {formatDate(inv.period_end)}</Text>
                                        <Text size="sm" style={{ color: textSec }}>{formatDate(inv.due_date)}</Text>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{inv.currency} {fmt(inv.amount)}</Text>
                                        <StatusPill status={inv.status} statuses={statuses} />
                                        <Text size="sm" style={{ color: '#22C55E' }}>{fmt(inv.amount_paid)}</Text>
                                        <Text size="sm" fw={600} style={{ color: Number(inv.balance_due) > 0 ? '#EF4444' : textMut }}>{fmt(inv.balance_due)}</Text>
                                        <Box>
                                            {canPay && can('realestate_rent.create') && (
                                                <Box component="button" type="button" onClick={() => setOpenPayment(isOpen ? null : inv.id)}
                                                    style={{ padding: '5px 12px', borderRadius: 8, background: isOpen ? 'transparent' : 'linear-gradient(135deg,#065F46,#059669)', color: isOpen ? textMut : '#fff', border: isOpen ? `1px solid ${cardBorder}` : 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                    {isOpen ? 'Cancel' : 'Record Payment'}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    {isOpen && canPay && can('realestate_rent.create') && (
                                        <Box style={{ padding: '0 20px 16px' }}>
                                            <PaymentForm
                                                invoice={inv}
                                                paymentMethods={paymentMethods}
                                                isDark={isDark}
                                                cardBorder={cardBorder}
                                                textPri={textPri}
                                                textSec={textSec}
                                                textMut={textMut}
                                                inputBg={inputBg}
                                                onDone={() => setOpenPayment(null)}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/real-estate/leases" style={{ color: textMut, textDecoration: 'none', fontSize: 13 }}>← Back to Leases</Box>
            </Box>
        </DashboardLayout>
    );
}
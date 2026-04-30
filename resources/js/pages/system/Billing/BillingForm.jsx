import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput, ActionIcon, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

const dk = {
    card: '#0F1E32', border: 'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8',
};

function Section({ title, icon, children, isDark }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px' }}>{children}</Box>
        </Box>
    );
}

const CURRENCIES = ['TZS', 'USD', 'EUR', 'GBP', 'ZMW', 'KES', 'ZAR'];

export default function BillingForm({
    data, setData, errors,
    statuses, clients = [], trips = [],
    processing, onSubmit, backHref,
    submitLabel = 'Save',
    documentType = 'quote',
}) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const rowBg      = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const numStyles      = { ...inputStyles, section: { color: textSec } };
    const dropdownStyle  = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    const clientData = clients.map(c => ({
        value: String(c.id),
        label: c.company_name ? `${c.name} — ${c.company_name}` : c.name,
    }));

    const tripData = [
        { value: '', label: 'None (standalone document)' },
        ...trips.map(t => ({ value: String(t.id), label: `${t.trip_number} · ${t.route_from} → ${t.route_to}` })),
    ];

    // ── Line items ──────────────────────────────────────────────────────────
    const items    = data.items ?? [{ description: '', quantity: 1, unit: '', unit_price: 0 }];
    const setItems = (newItems) => setData({ ...data, items: newItems });

    const addItem = () => setItems([...items, { description: '', quantity: 1, unit: '', unit_price: 0 }]);

    const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

    const updateItem = (i, field, val) => {
        const updated = items.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
        setItems(updated);
    };

    // ── Live totals ─────────────────────────────────────────────────────────
    const subtotal  = items.reduce((sum, it) => sum + ((Number(it.quantity) || 0) * (Number(it.unit_price) || 0)), 0);
    const discount  = Number(data.discount_amount) || 0;
    const taxRate   = Number(data.tax_rate) || 0;
    const taxable   = subtotal - discount;
    const taxAmount = taxable * taxRate / 100;
    const total     = taxable + taxAmount;

    const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(n));

    const typeLabel = { quote: 'Quote', proforma: 'Proforma Invoice', invoice: 'Invoice' }[documentType] ?? 'Document';

    return (
        <form onSubmit={onSubmit}>
            {/* Header */}
            <Section title={`${typeLabel} Details`} icon="📋" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Client" required searchable clearable
                        placeholder="Select client…"
                        value={data.client_id ? String(data.client_id) : null}
                        onChange={v => setData({ ...data, client_id: v ? Number(v) : null })}
                        data={clientData}
                        error={errors.client_id}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        nothingFoundMessage="No clients found"
                    />
                    <Select
                        label="Status" required
                        value={data.status}
                        onChange={v => setData('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <DatePicker label="Issue Date" required value={data.issue_date ?? ''} onChange={v => setData('issue_date', v)} error={errors.issue_date} styles={inputStyles} />
                    <DatePicker label="Due Date" value={data.due_date ?? ''} onChange={v => setData('due_date', v)} error={errors.due_date} styles={inputStyles} />
                    {documentType !== 'invoice' && (
                        <DatePicker label="Valid Until" value={data.valid_until ?? ''} onChange={v => setData('valid_until', v)} error={errors.valid_until} styles={inputStyles} />
                    )}
                    <Select
                        label="Currency"
                        value={data.currency ?? 'TZS'}
                        onChange={v => setData('currency', v)}
                        data={CURRENCIES.map(c => ({ value: c, label: c }))}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Linked Trip (optional)"
                        value={data.trip_id ? String(data.trip_id) : ''}
                        onChange={v => setData({ ...data, trip_id: v ? Number(v) : null })}
                        data={tripData}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        searchable
                    />
                </SimpleGrid>
            </Section>

            {/* Line items */}
            <Section title="Line Items" icon="📦" isDark={isDark}>
                <Box style={{ overflowX: 'auto' }}>
                    {/* Header row */}
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 110px 90px 36px', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        {['Description', 'Qty', 'Unit', 'Unit Price', 'Total', ''].map((h, i) => (
                            <Text key={i} size="xs" fw={700} style={{ color: textSec }}>{h}</Text>
                        ))}
                    </Box>

                    {/* Item rows */}
                    <Stack gap={6}>
                        {items.map((item, i) => {
                            const rowTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                            return (
                                <Box key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 110px 90px 36px', gap: 8, alignItems: 'center', background: rowBg, borderRadius: 8, padding: '8px 10px' }}>
                                    <TextInput
                                        placeholder="Freight service, fuel levy…"
                                        value={item.description}
                                        onChange={e => updateItem(i, 'description', e.target.value)}
                                        error={errors[`items.${i}.description`]}
                                        styles={{ input: { background: 'transparent', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 13 } }}
                                    />
                                    <NumberInput
                                        placeholder="1"
                                        min={0.01} step={0.5}
                                        value={item.quantity}
                                        onChange={v => updateItem(i, 'quantity', v)}
                                        styles={{ input: { background: 'transparent', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 13 } }}
                                    />
                                    <TextInput
                                        placeholder="trip"
                                        value={item.unit ?? ''}
                                        onChange={e => updateItem(i, 'unit', e.target.value)}
                                        styles={{ input: { background: 'transparent', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 13 } }}
                                    />
                                    <NumberInput
                                        placeholder="0"
                                        min={0} thousandSeparator=","
                                        value={item.unit_price}
                                        onChange={v => updateItem(i, 'unit_price', v)}
                                        styles={{ input: { background: 'transparent', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 13 } }}
                                    />
                                    <Text size="sm" fw={600} style={{ color: textPri, textAlign: 'right' }}>
                                        {fmt(rowTotal)}
                                    </Text>
                                    <ActionIcon
                                        variant="subtle" color="red" size="sm"
                                        onClick={() => removeItem(i)}
                                        disabled={items.length === 1}
                                        style={{ opacity: items.length === 1 ? 0.3 : 1 }}
                                    >
                                        ✕
                                    </ActionIcon>
                                </Box>
                            );
                        })}
                    </Stack>

                    <Button
                        variant="subtle" size="xs" mt="sm"
                        onClick={addItem}
                        style={{ color: '#3B82F6' }}
                    >
                        + Add Line Item
                    </Button>
                </Box>

                {errors.items && <Text size="xs" c="red" mt={4}>{errors.items}</Text>}

                {/* Totals */}
                <Box style={{ marginTop: 20, maxWidth: 360, marginLeft: 'auto' }}>
                    <SimpleGrid cols={2} spacing={4}>
                        <NumberInput
                            label="Discount"
                            min={0} thousandSeparator=","
                            value={data.discount_amount ?? 0}
                            onChange={v => setData('discount_amount', v)}
                            styles={numStyles}
                        />
                        <NumberInput
                            label="Tax Rate (%)"
                            min={0} max={100} step={1}
                            value={data.tax_rate ?? 18}
                            onChange={v => setData('tax_rate', v)}
                            styles={numStyles}
                        />
                    </SimpleGrid>

                    <Box style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F0F4F9', borderRadius: 10, padding: '14px 18px', border: `1px solid ${cardBorder}`, marginTop: 12 }}>
                        <Group justify="space-between" mb={4}>
                            <Text size="sm" style={{ color: textSec }}>Subtotal</Text>
                            <Text size="sm" style={{ color: textPri }}>{data.currency} {fmt(subtotal)}</Text>
                        </Group>
                        {discount > 0 && (
                            <Group justify="space-between" mb={4}>
                                <Text size="sm" style={{ color: textSec }}>Discount</Text>
                                <Text size="sm" style={{ color: '#EF4444' }}>− {data.currency} {fmt(discount)}</Text>
                            </Group>
                        )}
                        {taxRate > 0 && (
                            <Group justify="space-between" mb={4}>
                                <Text size="sm" style={{ color: textSec }}>VAT ({taxRate}%)</Text>
                                <Text size="sm" style={{ color: textPri }}>{data.currency} {fmt(taxAmount)}</Text>
                            </Group>
                        )}
                        <Box style={{ borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}`, marginTop: 8, paddingTop: 8 }}>
                            <Group justify="space-between">
                                <Text fw={800} size="sm" style={{ color: textPri }}>Total</Text>
                                <Text fw={800} size="lg" style={{ color: '#22C55E' }}>{data.currency} {fmt(total)}</Text>
                            </Group>
                        </Box>
                    </Box>
                </Box>
            </Section>

            {/* Notes & Terms */}
            <Section title="Notes & Terms" icon="📝" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Textarea
                        label="Notes"
                        placeholder="Additional notes for the client…"
                        minRows={3}
                        value={data.notes ?? ''}
                        onChange={e => setData('notes', e.target.value)}
                        styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                    />
                    <Textarea
                        label="Terms & Conditions"
                        placeholder="Payment terms, late fees…"
                        minRows={3}
                        value={data.terms_conditions ?? ''}
                        onChange={e => setData('terms_conditions', e.target.value)}
                        styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                    />
                </SimpleGrid>
            </Section>

            <Group justify="flex-end" gap="md">
                <Box component={Link} href={backHref} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

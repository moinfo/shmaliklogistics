import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput, ActionIcon, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

const CURRENCIES = ['TZS', 'USD', 'EUR', 'GBP', 'ZMW', 'KES', 'ZAR'];

function SectionCard({ title, icon, children, isDark, accentColor }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    return (
        <Box mb={16} style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: cardShadow,
        }}>
            <Box style={{ height: 3, background: accentColor ?? 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px 24px' }}>{children}</Box>
        </Box>
    );
}

export default function BillingForm({
    data, setData, errors,
    statuses, clients = [], trips = [],
    processing, onSubmit, backHref,
    submitLabel = 'Save',
    documentType = 'quote',
}) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowBg      = isDark ? 'rgba(255,255,255,0.025)' : '#FAFBFC';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const numStyles     = { ...inputStyles, section: { color: textSec } };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

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

    const addItem    = () => setItems([...items, { description: '', quantity: 1, unit: '', unit_price: 0 }]);
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

    // Inline input style for line item cells (transparent bg on top of rowBg)
    const cellInput = {
        input: {
            background: 'transparent',
            border: `1px solid ${cardBorder}`,
            color: textPri,
            borderRadius: 6,
            fontSize: 13,
            height: 34,
        },
    };

    return (
        <form onSubmit={onSubmit}>
            {/* ── Document Details ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
                <SectionCard title={`${typeLabel} Details`} icon="📋" isDark={isDark}>
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
                        <DatePicker
                            label="Issue Date" required
                            value={data.issue_date ?? ''}
                            onChange={v => setData('issue_date', v)}
                            error={errors.issue_date}
                            styles={inputStyles}
                        />
                        <DatePicker
                            label="Due Date"
                            value={data.due_date ?? ''}
                            onChange={v => setData('due_date', v)}
                            error={errors.due_date}
                            styles={inputStyles}
                        />
                        {documentType !== 'invoice' && (
                            <DatePicker
                                label="Valid Until"
                                value={data.valid_until ?? ''}
                                onChange={v => setData('valid_until', v)}
                                error={errors.valid_until}
                                styles={inputStyles}
                            />
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
                </SectionCard>
            </motion.div>

            {/* ── Line Items ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
                <SectionCard title="Line Items" icon="📦" isDark={isDark}>
                    <Box style={{ overflowX: 'auto' }}>
                        {/* Header row */}
                        <Box style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 80px 80px 120px 100px 36px',
                            gap: 8,
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: headBg,
                            border: `1px solid ${cardBorder}`,
                            marginBottom: 8,
                        }}>
                            {['Description', 'Qty', 'Unit', 'Unit Price', 'Total', ''].map((h, i) => (
                                <Text key={i} size="10px" fw={800} style={{
                                    color: textMut,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.8,
                                }}>{h}</Text>
                            ))}
                        </Box>

                        {/* Item rows */}
                        <Stack gap={6}>
                            {items.map((item, i) => {
                                const rowTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                                return (
                                    <Box key={i} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 80px 80px 120px 100px 36px',
                                        gap: 8,
                                        alignItems: 'center',
                                        background: rowBg,
                                        border: `1px solid ${cardBorder}`,
                                        borderRadius: 10,
                                        padding: '8px 12px',
                                    }}>
                                        <TextInput
                                            placeholder="Freight service, fuel levy…"
                                            value={item.description}
                                            onChange={e => updateItem(i, 'description', e.target.value)}
                                            error={errors[`items.${i}.description`]}
                                            styles={cellInput}
                                        />
                                        <NumberInput
                                            placeholder="1"
                                            min={0.01} step={0.5}
                                            value={item.quantity}
                                            onChange={v => updateItem(i, 'quantity', v)}
                                            styles={cellInput}
                                        />
                                        <TextInput
                                            placeholder="trip"
                                            value={item.unit ?? ''}
                                            onChange={e => updateItem(i, 'unit', e.target.value)}
                                            styles={cellInput}
                                        />
                                        <NumberInput
                                            placeholder="0"
                                            min={0} thousandSeparator=","
                                            value={item.unit_price}
                                            onChange={v => updateItem(i, 'unit_price', v)}
                                            styles={cellInput}
                                        />
                                        <Text size="sm" fw={700} style={{ color: textPri, textAlign: 'right', paddingRight: 4 }}>
                                            {fmt(rowTotal)}
                                        </Text>
                                        <ActionIcon
                                            variant="subtle" size="sm"
                                            onClick={() => removeItem(i)}
                                            disabled={items.length === 1}
                                            style={{
                                                color: '#EF4444',
                                                background: items.length === 1 ? 'transparent' : 'rgba(239,68,68,0.08)',
                                                border: items.length === 1 ? 'none' : '1px solid rgba(239,68,68,0.2)',
                                                borderRadius: 6,
                                                opacity: items.length === 1 ? 0.3 : 1,
                                            }}
                                        >
                                            ✕
                                        </ActionIcon>
                                    </Box>
                                );
                            })}
                        </Stack>

                        {/* Add line button */}
                        <Box mt={10}>
                            <Box
                                component="button"
                                type="button"
                                onClick={addItem}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '7px 16px',
                                    borderRadius: 8,
                                    background: 'rgba(194,65,12,0.1)',
                                    border: '1px solid rgba(194,65,12,0.3)',
                                    color: '#EA580C',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 700,
                                }}
                            >
                                + Add Line Item
                            </Box>
                        </Box>
                    </Box>

                    {errors.items && <Text size="xs" c="red" mt={6}>{errors.items}</Text>}

                    {/* ── Totals ── */}
                    <Box style={{ marginTop: 24, maxWidth: 380, marginLeft: 'auto' }}>
                        <SimpleGrid cols={2} spacing={8} mb={12}>
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

                        <Box style={{
                            background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                            borderRadius: 12,
                            padding: '16px 20px',
                            border: `1px solid ${cardBorder}`,
                        }}>
                            <Group justify="space-between" mb={6}>
                                <Text size="sm" style={{ color: textSec }}>Subtotal</Text>
                                <Text size="sm" fw={600} style={{ color: textPri }}>{data.currency} {fmt(subtotal)}</Text>
                            </Group>
                            {discount > 0 && (
                                <Group justify="space-between" mb={6}>
                                    <Text size="sm" style={{ color: textSec }}>Discount</Text>
                                    <Text size="sm" fw={600} style={{ color: '#EF4444' }}>− {data.currency} {fmt(discount)}</Text>
                                </Group>
                            )}
                            {taxRate > 0 && (
                                <Group justify="space-between" mb={6}>
                                    <Text size="sm" style={{ color: textSec }}>VAT ({taxRate}%)</Text>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{data.currency} {fmt(taxAmount)}</Text>
                                </Group>
                            )}
                            <Box style={{
                                borderTop: `1px solid ${divider}`,
                                marginTop: 8,
                                paddingTop: 12,
                            }}>
                                <Group justify="space-between" align="center">
                                    <Text fw={800} size="sm" style={{ color: textPri }}>Total</Text>
                                    <Text fw={900} size="lg" style={{
                                        background: 'linear-gradient(135deg, #C2410C, #EA580C)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>
                                        {data.currency} {fmt(total)}
                                    </Text>
                                </Group>
                            </Box>
                        </Box>
                    </Box>
                </SectionCard>
            </motion.div>

            {/* ── Notes & Terms ── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
                <SectionCard title="Notes & Terms" icon="📝" isDark={isDark}>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Textarea
                            label="Notes"
                            placeholder="Additional notes for the client…"
                            minRows={3}
                            value={data.notes ?? ''}
                            onChange={e => setData('notes', e.target.value)}
                            styles={{
                                label: inputStyles.label,
                                input: { ...inputStyles.input, resize: 'vertical' },
                            }}
                        />
                        <Textarea
                            label="Terms & Conditions"
                            placeholder="Payment terms, late fees…"
                            minRows={3}
                            value={data.terms_conditions ?? ''}
                            onChange={e => setData('terms_conditions', e.target.value)}
                            styles={{
                                label: inputStyles.label,
                                input: { ...inputStyles.input, resize: 'vertical' },
                            }}
                        />
                    </SimpleGrid>
                </SectionCard>
            </motion.div>

            {/* ── Actions ── */}
            <Group justify="flex-end" gap="md" mt={8}>
                <Box
                    component={Link}
                    href={backHref}
                    style={{
                        padding: '10px 18px',
                        borderRadius: 10,
                        border: `1px solid ${cardBorder}`,
                        background: cardBg,
                        color: textSec,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component="button"
                        type="submit"
                        disabled={processing}
                        style={{
                            padding: '10px 28px',
                            height: 42,
                            borderRadius: 10,
                            border: 'none',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            background: 'linear-gradient(135deg, #C2410C, #EA580C)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 14,
                            boxShadow: '0 4px 16px rgba(234,88,12,0.4)',
                            opacity: processing ? 0.7 : 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, NumberInput, Textarea, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { router, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const emptyRow = () => ({ inventory_item_id: '', description: '', quantity: 1, unit: 'pcs', unit_price: 0, total: 0 });

export default function CreatePurchaseOrder({ suppliers, inventoryItems }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const inputStyle = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        dropdown: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

    const { data, setData, errors } = useForm({
        supplier_id: '',
        order_date: new Date().toISOString().slice(0, 10),
        expected_date: '',
        notes: '',
    });
    const [rows, setRows] = useState([emptyRow()]);
    const [submitting, setSubmitting] = useState(false);

    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));

    const subtotal = rows.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const updateRow = (idx, key, val) => {
        setRows(prev => {
            const next = prev.map((r, i) => i === idx ? { ...r, [key]: val } : r);
            if (key === 'quantity' || key === 'unit_price') {
                const r = next[idx];
                next[idx] = { ...r, total: (parseFloat(r.quantity) || 0) * (parseFloat(r.unit_price) || 0) };
            }
            return next;
        });
    };

    const pickItem = (idx, itemId) => {
        const item = inventoryItems.find(i => String(i.id) === itemId);
        setRows(prev => prev.map((r, i) => {
            if (i !== idx) return r;
            const qty = parseFloat(r.quantity) || 1;
            const price = item ? parseFloat(item.unit_cost) || 0 : 0;
            return {
                ...r,
                inventory_item_id: itemId || '',
                description: item ? item.name : r.description,
                unit: item ? (item.unit || 'pcs') : r.unit,
                unit_price: price,
                total: qty * price,
            };
        }));
    };

    const addRow = () => setRows(prev => [...prev, emptyRow()]);
    const removeRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx));

    const submit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post('/system/procurement/orders', { ...data, items: rows }, {
            onError: () => setSubmitting(false),
        });
    };

    const FormCard = ({ icon, title, children, toolbar }) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    <Text size="md">{icon}</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '20px 24px' }}>{children}</Box>
        </Box>
    );

    return (
        <DashboardLayout title="New Purchase Order">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🛒</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">New Purchase Order</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Create a procurement request</Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href="/system/procurement/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            ← Back
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <form onSubmit={submit}>
                <Grid gutter="lg" mb="lg">
                    {/* Order Details */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <FormCard icon="📋" title="Order Details">
                            <Stack gap="md">
                                <Select
                                    label="Supplier *"
                                    placeholder="Select supplier"
                                    value={data.supplier_id}
                                    onChange={v => setData('supplier_id', v || '')}
                                    data={suppliers.map(s => ({ value: String(s.id), label: s.name }))}
                                    styles={inputStyle}
                                    required
                                />
                                <Grid gutter="md">
                                    <Grid.Col span={6}>
                                        <TextInput label="Order Date" type="date" value={data.order_date} onChange={e => setData('order_date', e.target.value)} styles={inputStyle} required />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <TextInput label="Expected Delivery" type="date" value={data.expected_date} onChange={e => setData('expected_date', e.target.value)} styles={inputStyle} />
                                    </Grid.Col>
                                </Grid>
                                <Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} />
                            </Stack>
                        </FormCard>
                    </Grid.Col>

                    {/* Summary */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                            <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                                <Group gap={8}>
                                    <Text size="md">💰</Text>
                                    <Text fw={700} size="sm" style={{ color: textPri }}>Order Summary</Text>
                                </Group>
                            </Box>
                            <Box style={{ padding: '20px 24px' }}>
                                <Stack gap={8}>
                                    {[['Subtotal', subtotal], ['VAT (18%)', tax]].map(([l, v]) => (
                                        <Group key={l} justify="space-between">
                                            <Text size="sm" style={{ color: textSec }}>{l}</Text>
                                            <Text size="sm" style={{ color: textSec }}>TZS {fmt(v)}</Text>
                                        </Group>
                                    ))}
                                    <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 10, marginTop: 4 }}>
                                        <Group justify="space-between">
                                            <Text fw={700} style={{ color: textPri }}>Total</Text>
                                            <Text fw={800} size="lg" style={{ color: '#EA580C' }}>TZS {fmt(total)}</Text>
                                        </Group>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Grid.Col>
                </Grid>

                {/* Line Items */}
                <Box mb="lg">
                    <FormCard
                        icon="📦"
                        title="Line Items"
                        toolbar={
                            <Box
                                component="button"
                                type="button"
                                onClick={addRow}
                                style={{ padding: '5px 14px', borderRadius: 8, background: 'rgba(194,65,12,0.1)', border: '1px solid rgba(194,65,12,0.25)', color: isDark ? '#FDBA74' : '#C2410C', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                            >
                                + Add Row
                            </Box>
                        }
                    >
                        <Box style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                        {['Inventory Item', 'Description', 'Qty', 'Unit', 'Unit Price (TZS)', 'Total (TZS)', ''].map(h => (
                                            <th key={h} style={{ padding: '10px 10px', textAlign: 'left', color: textMut, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: 0.5 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, idx) => (
                                        <tr key={idx} style={{ borderBottom: `1px solid ${divider}` }}>
                                            <td style={{ padding: '8px 6px', minWidth: 160 }}>
                                                <Select
                                                    placeholder="Optional"
                                                    value={row.inventory_item_id}
                                                    onChange={v => pickItem(idx, v || '')}
                                                    data={[{ value: '', label: '—' }, ...inventoryItems.map(i => ({ value: String(i.id), label: i.name }))]}
                                                    size="xs"
                                                    styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 12 }, dropdown: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10 } }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 6px', minWidth: 180 }}>
                                                <TextInput
                                                    value={row.description}
                                                    onChange={e => updateRow(idx, 'description', e.target.value)}
                                                    placeholder="Description"
                                                    size="xs"
                                                    required
                                                    styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 12 } }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 6px', minWidth: 80 }}>
                                                <NumberInput
                                                    value={row.quantity}
                                                    onChange={v => updateRow(idx, 'quantity', v ?? 1)}
                                                    min={0.01}
                                                    step={1}
                                                    size="xs"
                                                    styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 12 } }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 6px', minWidth: 80 }}>
                                                <TextInput
                                                    value={row.unit}
                                                    onChange={e => updateRow(idx, 'unit', e.target.value)}
                                                    placeholder="pcs"
                                                    size="xs"
                                                    styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 12 } }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 6px', minWidth: 130 }}>
                                                <NumberInput
                                                    value={row.unit_price}
                                                    onChange={v => updateRow(idx, 'unit_price', v ?? 0)}
                                                    min={0}
                                                    step={100}
                                                    size="xs"
                                                    thousandSeparator=","
                                                    styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 6, fontSize: 12 } }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <Text size="xs" fw={700} style={{ color: textPri }}>{fmt(row.total)}</Text>
                                            </td>
                                            <td style={{ padding: '8px 6px' }}>
                                                {rows.length > 1 && (
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={() => removeRow(idx)}
                                                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 14, padding: '2px 6px', opacity: 0.7 }}
                                                    >
                                                        ✕
                                                    </Box>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    </FormCard>
                </Box>

                <Group justify="flex-end" gap="sm">
                    <Box
                        component={Link}
                        href="/system/procurement/orders"
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textSec, padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                    >
                        Cancel
                    </Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box
                            component="button"
                            type="submit"
                            disabled={submitting}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, fontWeight: 700, color: '#fff', padding: '0 28px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontSize: 14 }}
                        >
                            {submitting ? 'Creating…' : 'Create Purchase Order'}
                        </Box>
                    </motion.div>
                </Group>
            </form>
        </DashboardLayout>
    );
}

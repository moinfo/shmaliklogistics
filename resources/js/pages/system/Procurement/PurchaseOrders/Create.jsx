import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, Button, TextInput, NumberInput, Textarea, Stack } from '@mantine/core';
import { router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const inp = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 4 } };

const emptyRow = () => ({ inventory_item_id: '', description: '', quantity: 1, unit: 'pcs', unit_price: 0, total: 0 });

export default function CreatePurchaseOrder({ suppliers, inventoryItems }) {
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
            // recalculate total for changed row
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

    return (
        <DashboardLayout title="New Purchase Order">
            <form onSubmit={submit}>
                <Grid gutter="lg">
                    {/* Header fields */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                            <Text fw={700} size="sm" style={{ color: '#60A5FA', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Order Details</Text>
                            <Grid gutter="sm">
                                <Grid.Col span={12}>
                                    <Select label="Supplier *" placeholder="Select supplier" value={data.supplier_id}
                                        onChange={v => setData('supplier_id', v || '')}
                                        data={suppliers.map(s => ({ value: String(s.id), label: s.name }))}
                                        styles={inp} required />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput label="Order Date" type="date" value={data.order_date}
                                        onChange={e => setData('order_date', e.target.value)} styles={inp} required />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput label="Expected Delivery" type="date" value={data.expected_date}
                                        onChange={e => setData('expected_date', e.target.value)} styles={inp} />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea label="Notes" rows={2} value={data.notes}
                                        onChange={e => setData('notes', e.target.value)} styles={inp} />
                                </Grid.Col>
                            </Grid>
                        </Box>
                    </Grid.Col>

                    {/* Totals summary */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                            <Text fw={700} size="sm" style={{ color: '#60A5FA', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Summary</Text>
                            <Stack gap={8}>
                                {[['Subtotal', subtotal], ['VAT (18%)', tax]].map(([l, v]) => (
                                    <Group key={l} justify="space-between">
                                        <Text size="sm" style={{ color: '#64748B' }}>{l}</Text>
                                        <Text size="sm" style={{ color: '#94A3B8' }}>TZS {fmt(v)}</Text>
                                    </Group>
                                ))}
                                <Box style={{ borderTop: '1px solid var(--c-border-strong)', paddingTop: 8, marginTop: 4 }}>
                                    <Group justify="space-between">
                                        <Text fw={700} style={{ color: 'var(--c-text)' }}>Total</Text>
                                        <Text fw={800} size="lg" style={{ color: '#2196F3' }}>TZS {fmt(total)}</Text>
                                    </Group>
                                </Box>
                            </Stack>
                        </Box>
                    </Grid.Col>
                </Grid>

                {/* Line items */}
                <Box mt="lg" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                    <Group justify="space-between" mb="md">
                        <Text fw={700} size="sm" style={{ color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.8 }}>Line Items</Text>
                        <Button onClick={addRow} size="xs" variant="outline" style={{ borderColor: 'rgba(33,150,243,0.3)', color: '#60A5FA' }}>+ Add Row</Button>
                    </Group>

                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--c-border-strong)' }}>
                                    {['Inventory Item', 'Description', 'Qty', 'Unit', 'Unit Price (TZS)', 'Total (TZS)', ''].map(h => (
                                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#64748B', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--c-border-row)' }}>
                                        <td style={{ padding: '8px 6px', minWidth: 160 }}>
                                            <Select placeholder="Optional" value={row.inventory_item_id}
                                                onChange={v => pickItem(idx, v || '')}
                                                data={[{ value: '', label: '—' }, ...inventoryItems.map(i => ({ value: String(i.id), label: i.name }))]}
                                                size="xs" styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)', fontSize: 12 } }} />
                                        </td>
                                        <td style={{ padding: '8px 6px', minWidth: 180 }}>
                                            <TextInput value={row.description} onChange={e => updateRow(idx, 'description', e.target.value)}
                                                placeholder="Description" size="xs" required
                                                styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)', fontSize: 12 } }} />
                                        </td>
                                        <td style={{ padding: '8px 6px', minWidth: 80 }}>
                                            <NumberInput value={row.quantity} onChange={v => updateRow(idx, 'quantity', v ?? 1)} min={0.01} step={1}
                                                size="xs" styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)', fontSize: 12 } }} />
                                        </td>
                                        <td style={{ padding: '8px 6px', minWidth: 80 }}>
                                            <TextInput value={row.unit} onChange={e => updateRow(idx, 'unit', e.target.value)} placeholder="pcs"
                                                size="xs" styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)', fontSize: 12 } }} />
                                        </td>
                                        <td style={{ padding: '8px 6px', minWidth: 120 }}>
                                            <NumberInput value={row.unit_price} onChange={v => updateRow(idx, 'unit_price', v ?? 0)} min={0} step={100}
                                                size="xs" styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)', fontSize: 12 } }} />
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            <Text size="xs" fw={700} style={{ color: 'var(--c-text)' }}>{fmt(row.total)}</Text>
                                        </td>
                                        <td style={{ padding: '8px 6px' }}>
                                            {rows.length > 1 && (
                                                <Box component="button" type="button" onClick={() => removeRow(idx)}
                                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 14, padding: '2px 6px' }}>✕</Box>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Box>

                <Group justify="flex-end" mt="lg" gap="sm">
                    <Button variant="subtle" component="a" href="/system/procurement/orders" style={{ color: '#64748B' }}>Cancel</Button>
                    <Button type="submit" loading={submitting} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}>
                        Create Purchase Order
                    </Button>
                </Group>
            </form>
        </DashboardLayout>
    );
}

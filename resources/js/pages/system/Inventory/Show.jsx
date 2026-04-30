import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, NumberInput, Textarea, Button, Stack, Switch, Modal } from '@mantine/core';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const inputStyle = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 6 } };

function StockModal({ opened, onClose, item, type, vehicles }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        quantity: '', unit_cost: '', reference: '', vehicle_id: '', notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/system/inventory/${item.id}/stock-${type}`, {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    const typeLabel = type === 'in' ? 'Stock In' : 'Stock Out';
    const typeColor = type === 'in' ? '#22C55E' : '#EF4444';

    return (
        <Modal opened={opened} onClose={onClose} title={<Text fw={700} style={{ color: 'var(--c-text)' }}>{typeLabel} — {item.name}</Text>} styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
            <form onSubmit={submit}>
                <Stack gap="md">
                    {errors.quantity && <Text size="sm" style={{ color: '#EF4444' }}>{errors.quantity}</Text>}
                    <NumberInput label={`Quantity (${item.unit})`} value={data.quantity} onChange={v => setData('quantity', v)} min={0.001} decimalScale={3} required styles={inputStyle} />
                    {type === 'in' && (
                        <NumberInput label="Unit Cost (TZS)" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} placeholder={`Current: ${item.unit_cost || '—'}`} />
                    )}
                    <TextInput label="Reference" placeholder="PO number, job ID..." value={data.reference} onChange={e => setData('reference', e.target.value)} styles={inputStyle} />
                    <Select label="Vehicle (optional)" placeholder="Link to vehicle..." value={data.vehicle_id} onChange={v => setData('vehicle_id', v || '')} data={[{ value: '', label: 'None' }, ...vehicles.map(v => ({ value: String(v.id), label: `${v.registration_number} — ${v.make} ${v.model}` }))]} clearable styles={inputStyle} />
                    <Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} />
                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" onClick={onClose} style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>Cancel</Button>
                        <Button type="submit" loading={processing} style={{ background: `linear-gradient(135deg, ${type === 'in' ? '#166534,#22C55E' : '#7F1D1D,#EF4444'})`, border: 'none', borderRadius: 8, fontWeight: 700 }}>
                            {typeLabel}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

export default function InventoryShow({ item, movements, vehicles, movTypes }) {
    const [editing, setEditing] = useState(false);
    const [stockModal, setStockModal] = useState(null);

    const { data, setData, put, processing } = useForm({
        name: item.name, category_id: item.category_id ? String(item.category_id) : '',
        part_number: item.part_number || '', unit: item.unit,
        reorder_level: item.reorder_level, unit_cost: item.unit_cost,
        location: item.location || '', notes: item.notes || '', is_active: item.is_active,
    });

    const save = (e) => { e.preventDefault(); put(`/system/inventory/${item.id}`, { onSuccess: () => setEditing(false) }); };
    const del = () => { if (confirm('Delete this item?')) router.delete(`/system/inventory/${item.id}`); };

    const isLow = item.reorder_level > 0 && Number(item.current_stock) <= Number(item.reorder_level);
    const fmt = (n, d = 0) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

    return (
        <DashboardLayout title={item.name}>
            <Group justify="space-between" mb="lg">
                <Box component={Link} href="/system/inventory" style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 14 }}>← Inventory</Box>
                <Group gap="sm">
                    <Button onClick={() => setStockModal('in')} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', borderRadius: 8 }}>+ Stock In</Button>
                    <Button onClick={() => setStockModal('out')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: 8 }}>− Stock Out</Button>
                    <Button variant="default" onClick={() => setEditing(!editing)} style={{ borderColor: 'rgba(33,150,243,0.3)', color: '#94A3B8', background: 'transparent' }}>
                        {editing ? 'Cancel' : '✏️ Edit'}
                    </Button>
                    <Button onClick={del} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>Delete</Button>
                </Group>
            </Group>

            {/* Header card */}
            <Box style={{ background: 'var(--c-card)', border: `1px solid ${isLow ? 'rgba(239,68,68,0.4)' : 'var(--c-border-strong)'}`, borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
                <Group justify="space-between" mb="md">
                    <Box>
                        <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>{item.name}</Text>
                        {item.part_number && <Text size="sm" style={{ color: '#64748B' }}>Part # {item.part_number}</Text>}
                        {item.category && (
                            <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${item.category.color}22`, border: `1px solid ${item.category.color}44`, marginTop: 6 }}>
                                <Text size="xs" fw={600} style={{ color: item.category.color }}>{item.category.name}</Text>
                            </Box>
                        )}
                    </Box>
                    <Box style={{ textAlign: 'center' }}>
                        <Text fw={900} size="2.5rem" style={{ color: isLow ? '#EF4444' : '#22C55E', lineHeight: 1 }}>{fmt(item.current_stock, 1)}</Text>
                        <Text size="sm" style={{ color: '#64748B' }}>{item.unit} in stock</Text>
                        {isLow && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>⚠️ Below reorder level</Text>}
                    </Box>
                </Group>
                <Grid gutter="md">
                    <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: '#475569', marginBottom: 3 }}>Reorder Level</Text><Text fw={600} style={{ color: '#F59E0B' }}>{fmt(item.reorder_level, 1)} {item.unit}</Text></Box></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: '#475569', marginBottom: 3 }}>Unit Cost</Text><Text fw={600} style={{ color: 'var(--c-text)' }}>{item.unit_cost ? `TZS ${fmt(item.unit_cost)}` : '—'}</Text></Box></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: '#475569', marginBottom: 3 }}>Location</Text><Text fw={600} style={{ color: 'var(--c-text)' }}>{item.location || '—'}</Text></Box></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: '#475569', marginBottom: 3 }}>Stock Value</Text><Text fw={600} style={{ color: '#22C55E' }}>{item.unit_cost ? `TZS ${fmt(Number(item.current_stock) * Number(item.unit_cost))}` : '—'}</Text></Box></Grid.Col>
                </Grid>
            </Box>

            {/* Edit form */}
            {editing && (
                <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px', marginBottom: 20 }}>
                    <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 20 }}>Edit Item</Text>
                    <form onSubmit={save}>
                        <Grid gutter="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Name" value={data.name} onChange={e => setData('name', e.target.value)} styles={inputStyle} required /></Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Part Number" value={data.part_number} onChange={e => setData('part_number', e.target.value)} styles={inputStyle} /></Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}><NumberInput label="Reorder Level" value={data.reorder_level} onChange={v => setData('reorder_level', v)} min={0} decimalScale={3} styles={inputStyle} /></Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}><NumberInput label="Unit Cost" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} /></Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}><TextInput label="Location" value={data.location} onChange={e => setData('location', e.target.value)} styles={inputStyle} /></Grid.Col>
                            <Grid.Col span={12}><Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} /></Grid.Col>
                            <Grid.Col span={12}>
                                <Group gap="sm">
                                    <Button type="submit" loading={processing} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 8 }}>Save Changes</Button>
                                    <Button type="button" variant="default" onClick={() => setEditing(false)} style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>Cancel</Button>
                                </Group>
                            </Grid.Col>
                        </Grid>
                    </form>
                </Box>
            )}

            {/* Movement history */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-border-subtle)' }}>
                    <Text fw={700} style={{ color: 'var(--c-text)' }}>Stock Movement History</Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-border-row)', borderBottom: '1px solid var(--c-border-color)' }}>
                                {['Date', 'Type', 'Qty', 'Balance After', 'Reference', 'Vehicle', 'By', 'Notes'].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {movements.data.map(m => {
                                const mt = movTypes[m.type] || { label: m.type, color: '#94A3B8' };
                                const qtyColor = m.type === 'in' ? '#22C55E' : m.type === 'out' ? '#EF4444' : '#F59E0B';
                                const qtySign = m.type === 'in' ? '+' : m.type === 'out' ? '−' : '±';
                                return (
                                    <tr key={m.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}>
                                        <td style={{ padding: '12px 16px' }}><Text size="xs" style={{ color: '#64748B' }}>{new Date(m.created_at).toLocaleDateString()}</Text></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${mt.color}22`, border: `1px solid ${mt.color}44` }}>
                                                <Text size="xs" fw={700} style={{ color: mt.color }}>{mt.label}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}><Text fw={700} size="sm" style={{ color: qtyColor }}>{qtySign}{fmt(m.quantity, 2)} {item.unit}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: 'var(--c-text)' }}>{fmt(m.balance_after, 2)}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{m.reference || '—'}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{m.vehicle?.registration_number || '—'}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{m.creator?.name || '—'}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#475569' }}>{m.notes || '—'}</Text></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {movements.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Text size="sm" style={{ color: '#475569' }}>No movements recorded yet</Text>
                        </Box>
                    )}
                </Box>
            </Box>

            {stockModal && <StockModal opened={!!stockModal} onClose={() => setStockModal(null)} item={item} type={stockModal} vehicles={vehicles} />}
        </DashboardLayout>
    );
}

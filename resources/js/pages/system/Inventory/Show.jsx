import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, NumberInput, Textarea, Button, Stack, Switch, Modal, MultiSelect } from '@mantine/core';
import { Link, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { useCan } from '../../../lib/can';

const inputStyle = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: 'var(--c-text-secondary)', marginBottom: 6 } };

function StockModal({ opened, onClose, item, type, vehicles, inStockSerials }) {
    const tracks = !!item.tracks_serials;
    const tracksBatch = !!item.tracks_batch;

    const { data, setData, post, processing, reset, errors } = useForm(
        tracks
            ? { serials_text: '', serials: [], unit_cost: '', reference: '', vehicle_id: '', notes: '' }
            : { quantity: '', unit_cost: '', reference: '', batch_number: '', vehicle_id: '', notes: '' }
    );

    const parsedSerials = useMemo(() => {
        if (!tracks || type !== 'in') return [];
        return (data.serials_text || '')
            .split(/[\n,]+/)
            .map(s => s.trim())
            .filter(Boolean);
    }, [data.serials_text, tracks, type]);

    const duplicates = useMemo(() => {
        if (!tracks || type !== 'in') return [];
        const seen = new Set();
        const dupes = new Set();
        parsedSerials.forEach(s => { if (seen.has(s)) dupes.add(s); else seen.add(s); });
        return [...dupes];
    }, [parsedSerials, tracks, type]);

    const submit = (e) => {
        e.preventDefault();
        if (tracks && type === 'in') {
            setData('serials', parsedSerials);
        }
        post(`/system/inventory/${item.id}/stock-${type}`, {
            onSuccess: () => { reset(); onClose(); },
            preserveScroll: true,
        });
    };

    const typeLabel = type === 'in' ? 'Stock In' : 'Stock Out';

    return (
        <Modal opened={opened} onClose={onClose} size={tracks ? 'lg' : 'md'} title={<Text fw={700} style={{ color: 'var(--c-text)' }}>{typeLabel} — {item.name}</Text>} styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
            <form onSubmit={submit}>
                <Stack gap="md">
                    {errors.quantity && <Text size="sm" style={{ color: '#EF4444' }}>{errors.quantity}</Text>}
                    {errors.serials && <Text size="sm" style={{ color: '#EF4444' }}>{errors.serials}</Text>}
                    {errors.batch_number && <Text size="sm" style={{ color: '#EF4444' }}>{errors.batch_number}</Text>}

                    {tracks && type === 'in' && (
                        <>
                            <Textarea
                                label="Serial Numbers"
                                description="One per line (or comma-separated). Each must be unique for this item."
                                placeholder={'SN-001\nSN-002\nSN-003'}
                                rows={6}
                                value={data.serials_text}
                                onChange={e => setData('serials_text', e.target.value)}
                                styles={inputStyle}
                                required
                            />
                            <Group justify="space-between">
                                <Text size="xs" style={{ color: '#64748B' }}>
                                    {parsedSerials.length} serial{parsedSerials.length === 1 ? '' : 's'} • will receive {parsedSerials.length} {item.unit}
                                </Text>
                                {duplicates.length > 0 && (
                                    <Text size="xs" style={{ color: '#EF4444' }}>Duplicates in list: {duplicates.join(', ')}</Text>
                                )}
                            </Group>
                            <NumberInput label="Unit Cost (TZS)" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} placeholder={`Current: ${item.unit_cost || '—'}`} />
                        </>
                    )}

                    {tracks && type === 'out' && (
                        <>
                            <MultiSelect
                                label="Serials to Issue"
                                description="Pick the unit(s) leaving stock. Quantity is the number of serials selected."
                                placeholder={inStockSerials.length ? 'Select serial numbers…' : 'No serials currently in stock'}
                                data={inStockSerials.map(s => ({ value: s, label: s }))}
                                value={data.serials}
                                onChange={v => setData('serials', v)}
                                searchable
                                clearable
                                disabled={!inStockSerials.length}
                                styles={{ ...inputStyle, dropdown: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' } }}
                            />
                            <Text size="xs" style={{ color: '#64748B' }}>
                                {data.serials.length} selected • {inStockSerials.length} in stock
                            </Text>
                        </>
                    )}

                    {!tracks && (
                        <>
                            <NumberInput label={`Quantity (${item.unit})`} value={data.quantity} onChange={v => setData('quantity', v)} min={0.001} decimalScale={3} required styles={inputStyle} />
                            {type === 'in' && (
                                <NumberInput label="Unit Cost (TZS)" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} placeholder={`Current: ${item.unit_cost || '—'}`} />
                            )}
                            {tracksBatch && (
                                <TextInput
                                    label={`Lot / Batch No.${type === 'in' ? ' *' : ''}`}
                                    description="Group identifier (e.g. dye-lot / shade). Not unique — many units share it."
                                    placeholder="e.g. SHADE-2024-A"
                                    value={data.batch_number}
                                    onChange={e => setData('batch_number', e.target.value)}
                                    styles={inputStyle}
                                    required={type === 'in'}
                                />
                            )}
                        </>
                    )}

                    <TextInput label="Reference" placeholder="PO number, job ID..." value={data.reference} onChange={e => setData('reference', e.target.value)} styles={inputStyle} />
                    <Select label="Vehicle (optional)" placeholder="Link to vehicle..." value={data.vehicle_id} onChange={v => setData('vehicle_id', v || '')} data={[{ value: '', label: 'None' }, ...vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }))]} clearable styles={inputStyle} />
                    <Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} />
                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" onClick={onClose} style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>Cancel</Button>
                        <Button
                            type="submit"
                            loading={processing}
                            disabled={(tracks && type === 'in' && (parsedSerials.length === 0 || duplicates.length > 0)) || (!tracks && tracksBatch && type === 'in' && !data.batch_number.trim())}
                            style={{ background: `linear-gradient(135deg, ${type === 'in' ? '#166534,#22C55E' : '#7F1D1D,#EF4444'})`, border: 'none', borderRadius: 8, fontWeight: 700 }}>
                            {typeLabel}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

export default function InventoryShow({ item, movements, serials = [], inStockCount, vehicles, movTypes }) {
    const [editing, setEditing] = useState(false);
    const [stockModal, setStockModal] = useState(null);
    const [serialFilter, setSerialFilter] = useState('all'); // all | in_stock | issued
    const can = useCan();

    const { data, setData, put, processing, errors } = useForm({
        name: item.name, category_id: item.category_id ? String(item.category_id) : '',
        part_number: item.part_number || '', unit: item.unit,
        tracks_serials: !!item.tracks_serials,
        tracks_batch: !!item.tracks_batch,
        reorder_level: item.reorder_level, unit_cost: item.unit_cost,
        location: item.location || '', notes: item.notes || '', is_active: item.is_active,
    });

    const save = (e) => { e.preventDefault(); put(`/system/inventory/${item.id}`, { onSuccess: () => setEditing(false) }); };
    const del = () => { if (confirm('Delete this item?')) router.delete(`/system/inventory/${item.id}`); };

    // Stock tracking mode (edit) — serial and batch are mutually exclusive.
    const editMode = data.tracks_serials ? 'serial' : data.tracks_batch ? 'batch' : 'none';
    const setEditMode = (m) => { setData('tracks_serials', m === 'serial'); setData('tracks_batch', m === 'batch'); };
    const trackingModes = [
        { key: 'none',   label: 'Quantity only',           desc: 'Plain count' },
        { key: 'serial', label: 'Serial — unique per unit', desc: '1 number = 1 unit. Cannot be turned off once serials exist.' },
        { key: 'batch',  label: 'Batch / Lot number',      desc: 'Quantity + a lot number recorded on each movement' },
    ];

    const isLow = item.reorder_level > 0 && Number(item.current_stock) <= Number(item.reorder_level);
    const fmt = (n, d = 0) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

    const inStockSerials = useMemo(
        () => (serials || []).filter(s => s.status === 'in_stock').map(s => s.serial),
        [serials]
    );

    const filteredSerials = useMemo(() => {
        if (serialFilter === 'all') return serials;
        return serials.filter(s => s.status === serialFilter);
    }, [serials, serialFilter]);

    return (
        <DashboardLayout title={item.name}>
            <Group justify="space-between" mb="lg">
                <Box component={Link} href="/system/inventory" style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 14 }}>← Inventory</Box>
                <Group gap="sm">
                    {can('inventory.edit') && (
                        <Button onClick={() => setStockModal('in')} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', borderRadius: 8 }}>+ Stock In</Button>
                    )}
                    {can('inventory.edit') && (
                        <Button onClick={() => setStockModal('out')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: 8 }}>− Stock Out</Button>
                    )}
                    {can('inventory.edit') && (
                        <Button variant="default" onClick={() => setEditing(!editing)} style={{ borderColor: 'rgba(33,150,243,0.3)', color: 'var(--c-text-secondary)', background: 'transparent' }}>
                            {editing ? 'Cancel' : '✏️ Edit'}
                        </Button>
                    )}
                    {can('inventory.delete') && (
                        <Button onClick={del} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>Delete</Button>
                    )}
                </Group>
            </Group>

            {/* Header card */}
            <Box style={{ background: 'var(--c-card)', border: `1px solid ${isLow ? 'rgba(239,68,68,0.4)' : 'var(--c-border-strong)'}`, borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
                <Group justify="space-between" mb="md">
                    <Box>
                        <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>{item.name}</Text>
                        {item.part_number && <Text size="sm" style={{ color: '#64748B' }}>Part # {item.part_number}</Text>}
                        <Group gap={8} mt={6}>
                            {item.category && (
                                <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${item.category.color}22`, border: `1px solid ${item.category.color}44` }}>
                                    <Text size="xs" fw={600} style={{ color: item.category.color }}>{item.category.name}</Text>
                                </Box>
                            )}
                            {item.tracks_serials && (
                                <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: 'rgba(33,150,243,0.18)', border: '1px solid rgba(33,150,243,0.4)' }}>
                                    <Text size="xs" fw={700} style={{ color: '#60A5FA' }}>🔖 Serial tracked</Text>
                                </Box>
                            )}
                            {item.tracks_batch && (
                                <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.4)' }}>
                                    <Text size="xs" fw={700} style={{ color: '#F59E0B' }}>🏷 Batch / lot</Text>
                                </Box>
                            )}
                        </Group>
                    </Box>
                    <Box style={{ textAlign: 'center' }}>
                        <Text fw={900} size="2.5rem" style={{ color: isLow ? '#EF4444' : '#22C55E', lineHeight: 1 }}>{fmt(item.current_stock, 1)}</Text>
                        <Text size="sm" style={{ color: '#64748B' }}>{item.unit} in stock</Text>
                        {isLow && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>⚠️ Below reorder level</Text>}
                    </Box>
                </Group>
                <Grid gutter="md">
                    <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: 'var(--c-text-muted)', marginBottom: 3 }}>Reorder Level</Text><Text fw={600} style={{ color: '#F59E0B' }}>{fmt(item.reorder_level, 1)} {item.unit}</Text></Box></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: 'var(--c-text-muted)', marginBottom: 3 }}>Unit Cost</Text><Text fw={600} style={{ color: 'var(--c-text)' }}>{item.unit_cost ? `TZS ${fmt(item.unit_cost)}` : '—'}</Text></Box></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: 'var(--c-text-muted)', marginBottom: 3 }}>Location</Text><Text fw={600} style={{ color: 'var(--c-text)' }}>{item.location || '—'}</Text></Box></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: 'var(--c-text-muted)', marginBottom: 3 }}>Stock Value</Text><Text fw={600} style={{ color: '#22C55E' }}>{item.unit_cost ? `TZS ${fmt(Number(item.current_stock) * Number(item.unit_cost))}` : '—'}</Text></Box></Grid.Col>
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
                                <Box style={{ padding: '14px 16px', background: 'var(--c-input)', borderRadius: 10, border: '1px solid var(--c-border-input)' }}>
                                    <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>Stock tracking</Text>
                                    <Text size="xs" style={{ color: 'var(--c-text-muted)', marginBottom: 10 }}>How this item's stock is counted</Text>
                                    <Stack gap={6}>
                                        {trackingModes.map(opt => {
                                            const active = editMode === opt.key;
                                            return (
                                                <Box key={opt.key} component="button" type="button" onClick={() => setEditMode(opt.key)}
                                                    style={{ textAlign: 'left', width: '100%', cursor: 'pointer', padding: '10px 12px', borderRadius: 8,
                                                        background: active ? 'rgba(33,150,243,0.12)' : 'transparent',
                                                        border: `1px solid ${active ? 'rgba(33,150,243,0.5)' : 'var(--c-border-input)'}` }}>
                                                    <Text size="sm" fw={600} style={{ color: active ? '#60A5FA' : 'var(--c-text)' }}>{opt.label}</Text>
                                                    <Text size="xs" style={{ color: 'var(--c-text-muted)' }}>{opt.desc}</Text>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                                {errors?.tracks_serials && <Text size="xs" style={{ color: '#EF4444', marginTop: 6 }}>{errors.tracks_serials}</Text>}
                            </Grid.Col>
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

            {/* Serial list (only when tracked) */}
            {item.tracks_serials && (
                <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                    <Box style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <Box>
                            <Text fw={700} style={{ color: 'var(--c-text)' }}>Serial Numbers</Text>
                            <Text size="xs" style={{ color: 'var(--c-text-muted)', marginTop: 2 }}>
                                {inStockCount ?? inStockSerials.length} in stock · {serials.length} total
                            </Text>
                        </Box>
                        <Group gap={6}>
                            {['all', 'in_stock', 'issued'].map(k => {
                                const labels = { all: 'All', in_stock: 'In Stock', issued: 'Issued' };
                                const active = serialFilter === k;
                                return (
                                    <Box
                                        key={k}
                                        component="button"
                                        type="button"
                                        onClick={() => setSerialFilter(k)}
                                        style={{ background: active ? 'rgba(33,150,243,0.15)' : 'transparent', border: `1px solid ${active ? 'rgba(33,150,243,0.4)' : 'var(--c-border-input)'}`, color: active ? '#60A5FA' : 'var(--c-text-secondary)', borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                    >
                                        {labels[k]}
                                    </Box>
                                );
                            })}
                        </Group>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--c-border-row)', borderBottom: '1px solid var(--c-border-color)' }}>
                                    {['Serial', 'Status', 'Received', 'Issued', 'Vehicle'].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSerials.map(s => {
                                    const isIn = s.status === 'in_stock';
                                    const color = isIn ? '#22C55E' : '#94A3B8';
                                    return (
                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}>
                                            <td style={{ padding: '10px 16px' }}><Text fw={700} size="sm" style={{ color: 'var(--c-text)', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>{s.serial}</Text></td>
                                            <td style={{ padding: '10px 16px' }}>
                                                <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${color}22`, border: `1px solid ${color}44` }}>
                                                    <Text size="xs" fw={700} style={{ color }}>{isIn ? 'In Stock' : 'Issued'}</Text>
                                                </Box>
                                            </td>
                                            <td style={{ padding: '10px 16px' }}><Text size="xs" style={{ color: '#64748B' }}>{s.received_at ? new Date(s.received_at).toLocaleDateString() : '—'}</Text></td>
                                            <td style={{ padding: '10px 16px' }}><Text size="xs" style={{ color: '#64748B' }}>{s.issued_at ? new Date(s.issued_at).toLocaleDateString() : '—'}</Text></td>
                                            <td style={{ padding: '10px 16px' }}><Text size="xs" style={{ color: '#64748B' }}>{s.vehicle?.plate || '—'}</Text></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredSerials.length === 0 && (
                            <Box style={{ textAlign: 'center', padding: '24px 0' }}>
                                <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>No serials match this filter</Text>
                            </Box>
                        )}
                    </Box>
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
                                const serialList = Array.isArray(m.serials) ? m.serials : null;
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
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{m.vehicle?.plate || '—'}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{m.creator?.name || '—'}</Text></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>{m.notes || '—'}</Text>
                                            {serialList && serialList.length > 0 && (
                                                <Text size="10px" style={{ color: '#60A5FA', marginTop: 4, fontFamily: 'ui-monospace, monospace' }}>
                                                    🔖 {serialList.join(', ')}
                                                </Text>
                                            )}
                                            {m.batch_number && (
                                                <Text size="10px" style={{ color: '#F59E0B', marginTop: 4 }}>🏷 Lot: {m.batch_number}</Text>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {movements.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>No movements recorded yet</Text>
                        </Box>
                    )}
                </Box>
            </Box>

            {stockModal && <StockModal opened={!!stockModal} onClose={() => setStockModal(null)} item={item} type={stockModal} vehicles={vehicles} inStockSerials={inStockSerials} />}
        </DashboardLayout>
    );
}

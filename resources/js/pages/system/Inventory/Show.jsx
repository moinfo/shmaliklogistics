import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, NumberInput, Textarea, Stack, Switch, Modal, MultiSelect } from '@mantine/core';
import { Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useCan } from '../../../lib/can';
import { useMantineColorScheme } from '@mantine/core';

function StockModal({ opened, onClose, item, type, vehicles, inStockSerials, isDark, cardBorder, textPri, textSec }) {
    const tracks    = !!item.tracks_serials;
    const inputStyle = {
        input:  { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label:  { color: textSec, marginBottom: 6 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
    };

    const { data, setData, post, processing, reset, errors } = useForm(
        tracks
            ? { serials_text: '', serials: [], unit_cost: '', reference: '', vehicle_id: '', notes: '' }
            : { quantity: '', unit_cost: '', reference: '', vehicle_id: '', notes: '' }
    );

    const parsedSerials = useMemo(() => {
        if (!tracks || type !== 'in') return [];
        return (data.serials_text || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }, [data.serials_text, tracks, type]);

    const duplicates = useMemo(() => {
        if (!tracks || type !== 'in') return [];
        const seen = new Set(); const dupes = new Set();
        parsedSerials.forEach(s => { if (seen.has(s)) dupes.add(s); else seen.add(s); });
        return [...dupes];
    }, [parsedSerials, tracks, type]);

    const submit = (e) => {
        e.preventDefault();
        if (tracks && type === 'in') setData('serials', parsedSerials);
        post(`/system/inventory/${item.id}/stock-${type}`, { onSuccess: () => { reset(); onClose(); }, preserveScroll: true });
    };

    const typeLabel = type === 'in' ? 'Stock In' : 'Stock Out';
    const typeGrad  = type === 'in' ? 'linear-gradient(135deg,#166534,#22C55E)' : 'linear-gradient(135deg,#7F1D1D,#EF4444)';

    return (
        <Modal opened={opened} onClose={onClose} size={tracks ? 'lg' : 'md'}
            title={<Text fw={700} style={{ color: textPri }}>{typeLabel} — {item.name}</Text>}
            styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` }, header: { background: isDark ? '#1A0900' : '#fff', borderBottom: `1px solid ${cardBorder}` } }}>
            <form onSubmit={submit}>
                <Stack gap="md">
                    {errors.quantity && <Text size="sm" style={{ color: '#EF4444' }}>{errors.quantity}</Text>}
                    {errors.serials  && <Text size="sm" style={{ color: '#EF4444' }}>{errors.serials}</Text>}

                    {tracks && type === 'in' && (
                        <>
                            <Textarea label="Serial Numbers" description="One per line (or comma-separated). Each must be unique for this item."
                                placeholder={'SN-001\nSN-002\nSN-003'} rows={6}
                                value={data.serials_text} onChange={e => setData('serials_text', e.target.value)} styles={inputStyle} required />
                            <Group justify="space-between">
                                <Text size="xs" style={{ color: textSec }}>{parsedSerials.length} serial{parsedSerials.length === 1 ? '' : 's'} • will receive {parsedSerials.length} {item.unit}</Text>
                                {duplicates.length > 0 && <Text size="xs" style={{ color: '#EF4444' }}>Duplicates in list: {duplicates.join(', ')}</Text>}
                            </Group>
                            <NumberInput label="Unit Cost (TZS)" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} placeholder={`Current: ${item.unit_cost || '—'}`} />
                        </>
                    )}

                    {tracks && type === 'out' && (
                        <>
                            <MultiSelect label="Serials to Issue" description="Pick the unit(s) leaving stock."
                                placeholder={inStockSerials.length ? 'Select serial numbers…' : 'No serials currently in stock'}
                                data={inStockSerials.map(s => ({ value: s, label: s }))}
                                value={data.serials} onChange={v => setData('serials', v)}
                                searchable clearable disabled={!inStockSerials.length}
                                styles={{ ...inputStyle, dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }} />
                            <Text size="xs" style={{ color: textSec }}>{data.serials.length} selected • {inStockSerials.length} in stock</Text>
                        </>
                    )}

                    {!tracks && (
                        <>
                            <NumberInput label={`Quantity (${item.unit})`} value={data.quantity} onChange={v => setData('quantity', v)} min={0.001} decimalScale={3} required styles={inputStyle} />
                            {type === 'in' && (
                                <NumberInput label="Unit Cost (TZS)" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} placeholder={`Current: ${item.unit_cost || '—'}`} />
                            )}
                        </>
                    )}

                    <TextInput label="Reference" placeholder="PO number, job ID..." value={data.reference} onChange={e => setData('reference', e.target.value)} styles={inputStyle} />
                    <Select label="Vehicle (optional)" placeholder="Link to vehicle..." value={data.vehicle_id} onChange={v => setData('vehicle_id', v || '')}
                        data={[{ value: '', label: 'None' }, ...vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }))]}
                        clearable styles={inputStyle} />
                    <Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} />
                    <Group justify="flex-end" gap="sm">
                        <Box component="button" type="button" onClick={onClose}
                            style={{ padding: '8px 18px', borderRadius: 8, background: 'transparent', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                            Cancel
                        </Box>
                        <Box component="button" type="submit" disabled={processing || (tracks && type === 'in' && (parsedSerials.length === 0 || duplicates.length > 0))}
                            style={{ padding: '8px 20px', borderRadius: 8, background: typeGrad, border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: (processing || (tracks && type === 'in' && (parsedSerials.length === 0 || duplicates.length > 0))) ? 0.6 : 1 }}>
                            {processing ? 'Saving…' : typeLabel}
                        </Box>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}

export default function InventoryShow({ item, movements, serials = [], inStockCount, vehicles, movTypes }) {
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
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const inputStyle = {
        input:  { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label:  { color: textSec, marginBottom: 6 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
    };

    const [editing,      setEditing]     = useState(false);
    const [stockModal,   setStockModal]  = useState(null);
    const [serialFilter, setSerialFilter] = useState('all');
    const can = useCan();

    const { data, setData, put, processing } = useForm({
        name:           item.name,
        category_id:    item.category_id ? String(item.category_id) : '',
        part_number:    item.part_number || '',
        unit:           item.unit,
        tracks_serials: !!item.tracks_serials,
        reorder_level:  item.reorder_level,
        unit_cost:      item.unit_cost,
        location:       item.location || '',
        notes:          item.notes || '',
        is_active:      item.is_active,
    });

    const save = (e) => { e.preventDefault(); put(`/system/inventory/${item.id}`, { onSuccess: () => setEditing(false) }); };
    const del  = () => { if (confirm('Delete this item?')) router.delete(`/system/inventory/${item.id}`); };

    const isLow = item.reorder_level > 0 && Number(item.current_stock) <= Number(item.reorder_level);
    const fmt   = (n, d = 0) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

    const inStockSerials  = useMemo(() => (serials || []).filter(s => s.status === 'in_stock').map(s => s.serial), [serials]);
    const filteredSerials = useMemo(() => serialFilter === 'all' ? serials : serials.filter(s => s.status === serialFilter), [serials, serialFilter]);

    return (
        <DashboardLayout title={item.name}>

            {/* Page Header Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)' : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box component={Link} href="/system/inventory"
                                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
                                ←
                            </Box>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">{item.name}</Text>
                                {item.part_number && <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Part # {item.part_number}</Text>}
                            </Stack>
                        </Group>
                        <Group gap={8} wrap="wrap">
                            {can('inventory.edit') && (
                                <Box component="button" onClick={() => setStockModal('in')}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ADE80', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                    + Stock In
                                </Box>
                            )}
                            {can('inventory.edit') && (
                                <Box component="button" onClick={() => setStockModal('out')}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                    − Stock Out
                                </Box>
                            )}
                            {can('inventory.edit') && (
                                <Box component="button" onClick={() => setEditing(!editing)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                    {editing ? 'Cancel' : '✏️ Edit'}
                                </Box>
                            )}
                            {can('inventory.delete') && (
                                <Box component="button" onClick={del}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                    🗑️
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Summary header card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Box mb={20} style={{ background: cardBg, border: `1px solid ${isLow ? 'rgba(239,68,68,0.4)' : cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: isLow ? 'linear-gradient(90deg,#7F1D1D,#EF4444)' : 'linear-gradient(90deg,#065F46,#22C55E)' }} />
                    <Box style={{ padding: '20px 24px' }}>
                        <Group justify="space-between" mb="md" wrap="wrap" gap="md">
                            <Box>
                                <Group gap={8} mt={6}>
                                    {item.category && (
                                        <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${item.category.color}22`, border: `1px solid ${item.category.color}44` }}>
                                            <Text size="xs" fw={600} style={{ color: item.category.color }}>{item.category.name}</Text>
                                        </Box>
                                    )}
                                    {item.tracks_serials && (
                                        <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.3)' }}>
                                            <Text size="xs" fw={700} style={{ color: '#EA580C' }}>🔖 Serial tracked</Text>
                                        </Box>
                                    )}
                                </Group>
                            </Box>
                            <Box style={{ textAlign: 'center' }}>
                                <Text fw={900} style={{ fontSize: '2.5rem', color: isLow ? '#EF4444' : '#22C55E', lineHeight: 1 }}>{fmt(item.current_stock, 1)}</Text>
                                <Text size="sm" style={{ color: textSec }}>{item.unit} in stock</Text>
                                {isLow && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>⚠️ Below reorder level</Text>}
                            </Box>
                        </Group>
                        <Grid gutter="md">
                            <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: textMut, marginBottom: 3 }}>Reorder Level</Text><Text fw={600} style={{ color: '#F59E0B' }}>{fmt(item.reorder_level, 1)} {item.unit}</Text></Box></Grid.Col>
                            <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: textMut, marginBottom: 3 }}>Unit Cost</Text><Text fw={600} style={{ color: textPri }}>{item.unit_cost ? `TZS ${fmt(item.unit_cost)}` : '—'}</Text></Box></Grid.Col>
                            <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: textMut, marginBottom: 3 }}>Location</Text><Text fw={600} style={{ color: textPri }}>{item.location || '—'}</Text></Box></Grid.Col>
                            <Grid.Col span={{ base: 6, sm: 3 }}><Box><Text size="xs" style={{ color: textMut, marginBottom: 3 }}>Stock Value</Text><Text fw={600} style={{ color: '#22C55E' }}>{item.unit_cost ? `TZS ${fmt(Number(item.current_stock) * Number(item.unit_cost))}` : '—'}</Text></Box></Grid.Col>
                        </Grid>
                    </Box>
                </Box>
            </motion.div>

            {/* Edit form */}
            {editing && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <Box mb={20} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '20px 24px' }}>
                            <Text fw={700} style={{ color: textPri, marginBottom: 20 }}>Edit Item</Text>
                            <form onSubmit={save}>
                                <Grid gutter="md">
                                    <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Name" value={data.name} onChange={e => setData('name', e.target.value)} styles={inputStyle} required /></Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Part Number" value={data.part_number} onChange={e => setData('part_number', e.target.value)} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 4 }}><NumberInput label="Reorder Level" value={data.reorder_level} onChange={v => setData('reorder_level', v)} min={0} decimalScale={3} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 4 }}><NumberInput label="Unit Cost" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 4 }}><TextInput label="Location" value={data.location} onChange={e => setData('location', e.target.value)} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={12}><Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={12}>
                                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 10, border: `1px solid ${cardBorder}` }}>
                                            <Box style={{ flex: 1, paddingRight: 12 }}>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>Track by serial number</Text>
                                                <Text size="xs" style={{ color: textMut }}>Receive & issue must capture unique serials. Cannot be turned off once serials are recorded.</Text>
                                            </Box>
                                            <Switch checked={data.tracks_serials} onChange={e => setData('tracks_serials', e.currentTarget.checked)} />
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <Group gap="sm">
                                            <Box component="button" type="submit" disabled={processing}
                                                style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#C2410C,#EA580C)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                                                {processing ? 'Saving…' : 'Save Changes'}
                                            </Box>
                                            <Box component="button" type="button" onClick={() => setEditing(false)}
                                                style={{ padding: '9px 18px', borderRadius: 8, background: 'transparent', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                                                Cancel
                                            </Box>
                                        </Group>
                                    </Grid.Col>
                                </Grid>
                            </form>
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Serial list */}
            {item.tracks_serials && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Box mb={20} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #0369A1, #0EA5E9)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <Box>
                                <Text fw={700} style={{ color: textPri }}>Serial Numbers</Text>
                                <Text size="xs" style={{ color: textMut, marginTop: 2 }}>{inStockCount ?? inStockSerials.length} in stock · {serials.length} total</Text>
                            </Box>
                            <Group gap={6}>
                                {['all', 'in_stock', 'issued'].map(k => {
                                    const labels = { all: 'All', in_stock: 'In Stock', issued: 'Issued' };
                                    const active = serialFilter === k;
                                    return (
                                        <Box key={k} component="button" type="button" onClick={() => setSerialFilter(k)}
                                            style={{ background: active ? 'rgba(234,88,12,0.15)' : 'transparent', border: `1px solid ${active ? 'rgba(234,88,12,0.4)' : cardBorder}`, color: active ? '#EA580C' : textSec, borderRadius: 8, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                            {labels[k]}
                                        </Box>
                                    );
                                })}
                            </Group>
                        </Box>
                        <Box style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                        {['Serial', 'Status', 'Received', 'Issued', 'Vehicle'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: textMut, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.9 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSerials.map(s => {
                                        const isIn  = s.status === 'in_stock';
                                        const color = isIn ? '#22C55E' : '#94A3B8';
                                        return (
                                            <tr key={s.id} style={{ borderBottom: `1px solid ${divider}` }}
                                                onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '10px 16px' }}><Text fw={700} size="sm" style={{ color: textPri, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>{s.serial}</Text></td>
                                                <td style={{ padding: '10px 16px' }}>
                                                    <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${color}22`, border: `1px solid ${color}44` }}>
                                                        <Text size="xs" fw={700} style={{ color }}>{isIn ? 'In Stock' : 'Issued'}</Text>
                                                    </Box>
                                                </td>
                                                <td style={{ padding: '10px 16px' }}><Text size="xs" style={{ color: textSec }}>{s.received_at ? new Date(s.received_at).toLocaleDateString() : '—'}</Text></td>
                                                <td style={{ padding: '10px 16px' }}><Text size="xs" style={{ color: textSec }}>{s.issued_at ? new Date(s.issued_at).toLocaleDateString() : '—'}</Text></td>
                                                <td style={{ padding: '10px 16px' }}><Text size="xs" style={{ color: textSec }}>{s.vehicle?.plate || '—'}</Text></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredSerials.length === 0 && (
                                <Box style={{ textAlign: 'center', padding: '24px 0' }}>
                                    <Text size="sm" style={{ color: textMut }}>No serials match this filter</Text>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Movement history */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #5B21B6, #8B5CF6)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text size="md">📋</Text>
                        <Text fw={700} style={{ color: textPri }}>Stock Movement History</Text>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['Date', 'Type', 'Qty', 'Balance After', 'Reference', 'Vehicle', 'By', 'Notes'].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: textMut, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.9 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {movements.data.map((m, i) => {
                                    const mt = movTypes[m.type] || { label: m.type, color: '#94A3B8' };
                                    const qtyColor = m.type === 'in' ? '#22C55E' : m.type === 'out' ? '#EF4444' : '#F59E0B';
                                    const qtySign  = m.type === 'in' ? '+' : m.type === 'out' ? '−' : '±';
                                    const serialList = Array.isArray(m.serials) ? m.serials : null;
                                    return (
                                        <motion.tr key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                                            style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 16px' }}><Text size="xs" style={{ color: textSec }}>{new Date(m.created_at).toLocaleDateString()}</Text></td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${mt.color}22`, border: `1px solid ${mt.color}44` }}>
                                                    <Text size="xs" fw={700} style={{ color: mt.color }}>{mt.label}</Text>
                                                </Box>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}><Text fw={700} size="sm" style={{ color: qtyColor }}>{qtySign}{fmt(m.quantity, 2)} {item.unit}</Text></td>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textPri }}>{fmt(m.balance_after, 2)}</Text></td>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textSec }}>{m.reference || '—'}</Text></td>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textSec }}>{m.vehicle?.plate || '—'}</Text></td>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textSec }}>{m.creator?.name || '—'}</Text></td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Text size="sm" style={{ color: textMut }}>{m.notes || '—'}</Text>
                                                {serialList && serialList.length > 0 && (
                                                    <Text size="10px" style={{ color: '#EA580C', marginTop: 4, fontFamily: 'ui-monospace, monospace' }}>
                                                        🔖 {serialList.join(', ')}
                                                    </Text>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {movements.data.length === 0 && (
                            <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Text size="sm" style={{ color: textMut }}>No movements recorded yet</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </motion.div>

            {stockModal && (
                <StockModal opened={!!stockModal} onClose={() => setStockModal(null)} item={item} type={stockModal}
                    vehicles={vehicles} inStockSerials={inStockSerials}
                    isDark={isDark} cardBorder={cardBorder} textPri={textPri} textSec={textSec} />
            )}
        </DashboardLayout>
    );
}

import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, NumberInput, Textarea, Button, Stack, Switch, Modal, ColorInput, ColorSwatch, ActionIcon, Divider, useMantineColorScheme } from '@mantine/core';
import { useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function InventoryCreate({ categories }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#0F1E32' : '#FFFFFF';
    const cardBorder = isDark ? 'rgba(33,150,243,0.12)' : '#E2E8F0';
    const inputBg    = isDark ? '#07111F' : '#F8FAFC';
    const inputBorder= isDark ? 'rgba(33,150,243,0.2)' : '#E2E8F0';
    const textPri    = isDark ? '#E2E8F0' : '#1E293B';
    const textSec    = isDark ? 'var(--c-text-secondary)' : '#64748B';
    const textMut    = isDark ? 'var(--c-text-muted)' : 'var(--c-text-secondary)';
    const tipBg      = isDark ? 'rgba(33,150,243,0.08)' : '#EFF6FF';
    const tipBorder  = isDark ? 'rgba(33,150,243,0.2)' : '#BFDBFE';

    const inputStyle = {
        input: { background: inputBg, border: `1px solid ${inputBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, marginBottom: 6, fontSize: 13, fontWeight: 600 },
        dropdown: { background: cardBg, border: `1px solid ${cardBorder}` },
    };

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category_id: '',
        part_number: '',
        unit: 'pcs',
        tracks_serials: false,
        tracks_batch: false,
        reorder_level: '',
        unit_cost: '',
        location: '',
        notes: '',
        is_active: true,
    });

    const submit = (e) => { e.preventDefault(); post('/system/inventory'); };
    const err = (f) => errors[f] && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{errors[f]}</Text>;

    // ── Category management (add / edit / delete) ──
    // preserveState keeps the half-filled item form intact while categories mutate.
    const [mgrOpen, setMgrOpen] = useState(false);
    const [newCat, setNewCat] = useState({ name: '', color: '#2196F3' });
    const [editing, setEditing] = useState(null); // { id, name, color }
    const [catErr, setCatErr] = useState('');
    const catOpts = { preserveState: true, preserveScroll: true, errorBag: 'category', onError: (e) => setCatErr(e.name || 'Something went wrong.') };

    const addCategory = () => {
        if (!newCat.name.trim()) return;
        setCatErr('');
        router.post('/system/inventory/categories', newCat, { ...catOpts, onSuccess: () => setNewCat({ name: '', color: '#2196F3' }) });
    };
    const saveCategory = () => {
        if (!editing?.name.trim()) return;
        setCatErr('');
        router.put(`/system/inventory/categories/${editing.id}`, { name: editing.name, color: editing.color }, { ...catOpts, onSuccess: () => setEditing(null) });
    };
    const deleteCategory = (c) => {
        const msg = c.items_count > 0
            ? `Delete "${c.name}"? ${c.items_count} item(s) using it will become uncategorized.`
            : `Delete category "${c.name}"?`;
        if (!window.confirm(msg)) return;
        setCatErr('');
        router.delete(`/system/inventory/categories/${c.id}`, catOpts);
    };

    const units = ['pcs', 'litres', 'kg', 'metres', 'sets', 'pairs', 'boxes', 'drums', 'rolls'];

    // Stock tracking mode — serial and batch are mutually exclusive.
    const mode = data.tracks_serials ? 'serial' : data.tracks_batch ? 'batch' : 'none';
    const setMode = (m) => { setData('tracks_serials', m === 'serial'); setData('tracks_batch', m === 'batch'); };
    const trackingModes = [
        { key: 'none',   label: 'Quantity only',          desc: 'Plain count — oil, bolts, cement' },
        { key: 'serial', label: 'Serial — unique per unit', desc: '1 number = 1 unit, must be unique' },
        { key: 'batch',  label: 'Batch / Lot number',     desc: 'Quantity + a lot number you record — tiles, paint' },
    ];

    return (
        <DashboardLayout title="Add Inventory Item">
            <Box component={Link} href="/system/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2196F3', textDecoration: 'none', fontSize: 14, marginBottom: 20, fontWeight: 600 }}>
                ← Back to Inventory
            </Box>

            <form onSubmit={submit}>
                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                            <Text fw={700} size="md" style={{ color: textPri, marginBottom: 20 }}>Item Details</Text>
                            <Grid gutter="md">
                                <Grid.Col span={12}>
                                    <TextInput label="Item Name *" placeholder="e.g. Engine Oil Filter" value={data.name} onChange={e => setData('name', e.target.value)} styles={inputStyle} required />
                                    {err('name')}
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <Group justify="space-between" mb={6}>
                                        <Text style={{ color: textSec, fontSize: 13, fontWeight: 600 }}>Category</Text>
                                        <Box component="button" type="button" onClick={() => { setCatErr(''); setMgrOpen(true); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#2196F3', fontSize: 12, fontWeight: 600 }}>
                                            Manage
                                        </Box>
                                    </Group>
                                    <Select placeholder="Select category" value={data.category_id} onChange={v => setData('category_id', v || '')} data={[{ value: '', label: 'None' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]} clearable styles={inputStyle} comboboxProps={{ zIndex: 1100 }} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput label="Part Number" placeholder="e.g. OPT-D1234" value={data.part_number} onChange={e => setData('part_number', e.target.value)} styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Select label="Unit *" data={units.map(u => ({ value: u, label: u }))} value={data.unit} onChange={v => setData('unit', v)} styles={inputStyle} comboboxProps={{ zIndex: 1100 }} required />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <NumberInput label="Reorder Level" placeholder="Min before alert" value={data.reorder_level} onChange={v => setData('reorder_level', v)} min={0} decimalScale={3} styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <NumberInput label="Unit Cost (TZS)" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <TextInput label="Storage Location" placeholder="e.g. Shelf A-3, Bin 7" value={data.location} onChange={e => setData('location', e.target.value)} styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Textarea label="Notes" rows={3} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} />
                                </Grid.Col>
                            </Grid>
                        </Box>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px', position: 'sticky', top: 90 }}>
                            <Text fw={700} size="md" style={{ color: textPri, marginBottom: 20 }}>Settings</Text>
                            <Stack gap="lg">
                                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: inputBg, borderRadius: 10, border: `1px solid ${inputBorder}` }}>
                                    <Box>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>Active</Text>
                                        <Text size="xs" style={{ color: textMut }}>Show in stock management</Text>
                                    </Box>
                                    <Switch checked={data.is_active} onChange={e => setData('is_active', e.currentTarget.checked)} />
                                </Box>
                                <Box style={{ padding: '14px 16px', background: inputBg, borderRadius: 10, border: `1px solid ${inputBorder}` }}>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>Stock tracking</Text>
                                    <Text size="xs" style={{ color: textMut, marginBottom: 10 }}>How this item's stock is counted</Text>
                                    <Stack gap={6}>
                                        {trackingModes.map(opt => {
                                            const active = mode === opt.key;
                                            return (
                                                <Box key={opt.key} component="button" type="button" onClick={() => setMode(opt.key)}
                                                    style={{ textAlign: 'left', width: '100%', cursor: 'pointer', padding: '10px 12px', borderRadius: 8,
                                                        background: active ? 'rgba(33,150,243,0.12)' : 'transparent',
                                                        border: `1px solid ${active ? 'rgba(33,150,243,0.5)' : inputBorder}` }}>
                                                    <Text size="sm" fw={600} style={{ color: active ? '#60A5FA' : textPri }}>{opt.label}</Text>
                                                    <Text size="xs" style={{ color: textMut }}>{opt.desc}</Text>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                                {errors.tracks_serials && <Text size="xs" style={{ color: '#EF4444', marginTop: -8 }}>{errors.tracks_serials}</Text>}
                                <Box style={{ padding: '12px 16px', background: tipBg, borderRadius: 10, border: `1px solid ${tipBorder}` }}>
                                    <Text size="xs" style={{ color: isDark ? '#60A5FA' : '#1565C0', lineHeight: 1.5 }}>💡 Initial stock is 0. Use “Stock In” on the item page to add opening stock.</Text>
                                </Box>
                                <Button type="submit" loading={processing} fullWidth style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700, height: 42 }}>
                                    Create Item
                                </Button>
                            </Stack>
                        </Box>
                    </Grid.Col>
                </Grid>
            </form>

            <Modal
                opened={mgrOpen}
                onClose={() => { setMgrOpen(false); setEditing(null); setCatErr(''); }}
                title="Manage Categories"
                centered
                styles={{ content: { background: cardBg }, header: { background: cardBg }, title: { color: textPri, fontWeight: 700 } }}
            >
                <Stack gap="sm">
                    {/* Add new */}
                    <Group align="flex-end" gap="xs" wrap="nowrap">
                        <TextInput label="New category" placeholder="e.g. Filters" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} styles={inputStyle} style={{ flex: 1 }} />
                        <ColorInput label="Color" value={newCat.color} onChange={v => setNewCat({ ...newCat, color: v })} format="hex" styles={inputStyle} w={130} comboboxProps={{ zIndex: 1300 }} />
                        <Button onClick={addCategory} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none' }}>Add</Button>
                    </Group>

                    {catErr && <Text size="xs" style={{ color: '#EF4444' }}>{catErr}</Text>}
                    <Divider my={2} />

                    {/* Existing categories */}
                    {categories.length === 0 && <Text size="sm" style={{ color: textMut }}>No categories yet — add one above.</Text>}
                    <Stack gap={8}>
                        {categories.map(c => editing?.id === c.id ? (
                            <Group key={c.id} gap="xs" wrap="nowrap" align="center">
                                <TextInput value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} styles={inputStyle} style={{ flex: 1 }} />
                                <ColorInput value={editing.color || '#2196F3'} onChange={v => setEditing({ ...editing, color: v })} format="hex" styles={inputStyle} w={130} comboboxProps={{ zIndex: 1300 }} />
                                <Button size="xs" variant="light" color="green" onClick={saveCategory}>Save</Button>
                                <Button size="xs" variant="subtle" color="gray" onClick={() => { setEditing(null); setCatErr(''); }}>Cancel</Button>
                            </Group>
                        ) : (
                            <Group key={c.id} justify="space-between" wrap="nowrap" style={{ padding: '8px 12px', background: inputBg, borderRadius: 8, border: `1px solid ${inputBorder}` }}>
                                <Group gap="sm" wrap="nowrap">
                                    <ColorSwatch color={c.color || '#94A3B8'} size={16} />
                                    <Text size="sm" style={{ color: textPri }}>{c.name}</Text>
                                    {c.items_count > 0 && <Text size="xs" style={{ color: textMut }}>· {c.items_count} item{c.items_count !== 1 ? 's' : ''}</Text>}
                                </Group>
                                <Group gap={4} wrap="nowrap">
                                    <ActionIcon variant="subtle" color="blue" onClick={() => { setCatErr(''); setEditing({ id: c.id, name: c.name, color: c.color || '#2196F3' }); }} aria-label="Edit">✎</ActionIcon>
                                    <ActionIcon variant="subtle" color="red" onClick={() => deleteCategory(c)} aria-label="Delete">🗑</ActionIcon>
                                </Group>
                            </Group>
                        ))}
                    </Stack>
                </Stack>
            </Modal>
        </DashboardLayout>
    );
}

import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, NumberInput, Textarea, Button, Stack, Switch } from '@mantine/core';
import { useForm, Link } from '@inertiajs/react';

const inputStyle = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 6 } };

export default function InventoryCreate({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category_id: '',
        part_number: '',
        unit: 'pcs',
        reorder_level: '',
        unit_cost: '',
        location: '',
        notes: '',
        is_active: true,
    });

    const submit = (e) => { e.preventDefault(); post('/system/inventory'); };
    const err = (f) => errors[f] && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{errors[f]}</Text>;

    const units = ['pcs', 'litres', 'kg', 'metres', 'sets', 'pairs', 'boxes', 'drums', 'rolls'];

    return (
        <DashboardLayout title="Add Inventory Item">
            <Box component={Link} href="/system/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60A5FA', textDecoration: 'none', fontSize: 14, marginBottom: 20 }}>
                ← Back to Inventory
            </Box>

            <form onSubmit={submit}>
                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 20 }}>Item Details</Text>
                            <Grid gutter="md">
                                <Grid.Col span={12}>
                                    <TextInput label="Item Name *" placeholder="e.g. Engine Oil Filter" value={data.name} onChange={e => setData('name', e.target.value)} styles={inputStyle} required />
                                    {err('name')}
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <Select label="Category" placeholder="Select category" value={data.category_id} onChange={v => setData('category_id', v || '')} data={[{ value: '', label: 'None' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]} clearable styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput label="Part Number" placeholder="e.g. OPT-D1234" value={data.part_number} onChange={e => setData('part_number', e.target.value)} styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Select label="Unit *" data={units.map(u => ({ value: u, label: u }))} value={data.unit} onChange={v => setData('unit', v)} styles={inputStyle} required />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <NumberInput label="Reorder Level" placeholder="Minimum stock before alert" value={data.reorder_level} onChange={v => setData('reorder_level', v)} min={0} decimalScale={3} styles={inputStyle} />
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
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px', position: 'sticky', top: 90 }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 20 }}>Settings</Text>
                            <Stack gap="lg">
                                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--c-input)', borderRadius: 10, border: '1px solid var(--c-border-subtle)' }}>
                                    <Box>
                                        <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>Active</Text>
                                        <Text size="xs" style={{ color: '#475569' }}>Show this item in stock management</Text>
                                    </Box>
                                    <Switch checked={data.is_active} onChange={e => setData('is_active', e.currentTarget.checked)} />
                                </Box>
                                <Box style={{ padding: '12px 16px', background: 'var(--c-border-row)', borderRadius: 10, border: '1px solid var(--c-border-subtle)' }}>
                                    <Text size="xs" style={{ color: '#60A5FA' }}>💡 Initial stock is 0. Use "Stock In" on the item page to add opening stock.</Text>
                                </Box>
                                <Button type="submit" loading={processing} fullWidth style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}>
                                    Create Item
                                </Button>
                            </Stack>
                        </Box>
                    </Grid.Col>
                </Grid>
            </form>
        </DashboardLayout>
    );
}

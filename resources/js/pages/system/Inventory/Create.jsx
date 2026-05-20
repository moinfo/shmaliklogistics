import DashboardLayout from '../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, TextInput, NumberInput, Textarea, Stack, Switch } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function InventoryCreate({ categories }) {
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

    const inputStyle = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        dropdown: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category_id: '',
        part_number: '',
        unit: 'pcs',
        tracks_serials: false,
        reorder_level: '',
        unit_cost: '',
        location: '',
        notes: '',
        is_active: true,
    });

    const submit = (e) => { e.preventDefault(); post('/system/inventory'); };
    const err = (f) => errors[f] && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{errors[f]}</Text>;

    const units = ['pcs', 'litres', 'kg', 'metres', 'sets', 'pairs', 'boxes', 'drums', 'rolls'];

    const FormCard = ({ icon, title, children, noPad }) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    <Text size="md">{icon}</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: noPad ? 0 : '20px 24px' }}>{children}</Box>
        </Box>
    );

    return (
        <DashboardLayout title="Add Inventory Item">
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Add Inventory Item</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Register a new part or supply</Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href="/system/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            ← Back
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <form onSubmit={submit}>
                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <FormCard icon="📋" title="Item Details">
                            <Stack gap="md">
                                <Box>
                                    <TextInput label="Item Name *" placeholder="e.g. Engine Oil Filter" value={data.name} onChange={e => setData('name', e.target.value)} styles={inputStyle} required />
                                    {err('name')}
                                </Box>
                                <Grid gutter="md">
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <Select
                                            label="Category"
                                            placeholder="Select category"
                                            value={data.category_id}
                                            onChange={v => setData('category_id', v || '')}
                                            data={[{ value: '', label: 'None' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))]}
                                            clearable
                                            styles={inputStyle}
                                            comboboxProps={{ zIndex: 1100 }}
                                        />
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
                                        <NumberInput label="Unit Cost (TZS)" value={data.unit_cost} onChange={v => setData('unit_cost', v)} min={0} decimalScale={2} styles={inputStyle} thousandSeparator="," />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <TextInput label="Storage Location" placeholder="e.g. Shelf A-3, Bin 7" value={data.location} onChange={e => setData('location', e.target.value)} styles={inputStyle} />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <Textarea label="Notes" rows={3} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} />
                                    </Grid.Col>
                                </Grid>
                            </Stack>
                        </FormCard>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Box style={{ position: 'sticky', top: 90 }}>
                            <FormCard icon="⚙️" title="Settings">
                                <Stack gap="md">
                                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: inputBg, borderRadius: 10, border: `1px solid ${cardBorder}` }}>
                                        <Box>
                                            <Text size="sm" fw={600} style={{ color: textPri }}>Active</Text>
                                            <Text size="xs" style={{ color: textMut }}>Show in stock management</Text>
                                        </Box>
                                        <Switch checked={data.is_active} onChange={e => setData('is_active', e.currentTarget.checked)} />
                                    </Box>
                                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: inputBg, borderRadius: 10, border: `1px solid ${cardBorder}` }}>
                                        <Box style={{ flex: 1, paddingRight: 12 }}>
                                            <Text size="sm" fw={600} style={{ color: textPri }}>Track by serial number</Text>
                                            <Text size="xs" style={{ color: textMut }}>Receive & issue must capture unique serials</Text>
                                        </Box>
                                        <Switch checked={data.tracks_serials} onChange={e => setData('tracks_serials', e.currentTarget.checked)} />
                                    </Box>
                                    {errors.tracks_serials && <Text size="xs" style={{ color: '#EF4444', marginTop: -8 }}>{errors.tracks_serials}</Text>}

                                    <Box style={{ padding: '12px 16px', background: isDark ? 'rgba(234,88,12,0.08)' : '#FFF7F0', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(234,88,12,0.2)' : 'rgba(234,88,12,0.2)'}` }}>
                                        <Text size="xs" style={{ color: isDark ? '#FDBA74' : '#C2410C', lineHeight: 1.5 }}>Initial stock is 0. Use "Stock In" on the item page to add opening stock.</Text>
                                    </Box>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Box
                                            component="button"
                                            type="submit"
                                            disabled={processing}
                                            style={{ width: '100%', background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, fontWeight: 700, color: '#fff', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1, fontSize: 14 }}
                                        >
                                            {processing ? 'Creating…' : 'Create Item'}
                                        </Box>
                                    </motion.div>
                                </Stack>
                            </FormCard>
                        </Box>
                    </Grid.Col>
                </Grid>
            </form>
        </DashboardLayout>
    );
}

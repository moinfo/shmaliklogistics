import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, TextInput, Select, Button, Modal, Stack, Textarea, Switch } from '@mantine/core';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const inp = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 6 } };

function SupplierForm({ categories, initial = {}, onSubmit, processing }) {
    const { data, setData, errors } = useForm({
        name: initial.name || '', contact_name: initial.contact_name || '',
        phone: initial.phone || '', email: initial.email || '',
        address: initial.address || '', tin_number: initial.tin_number || '',
        category: initial.category || '', notes: initial.notes || '',
        is_active: initial.is_active !== undefined ? initial.is_active : true,
    });

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(data); }}>
            <Stack gap="sm">
                <TextInput label="Supplier Name *" value={data.name} onChange={e => setData('name', e.target.value)} styles={inp} required />
                <Grid gutter="sm">
                    <Grid.Col span={6}><TextInput label="Contact Person" value={data.contact_name} onChange={e => setData('contact_name', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={6}><Select label="Category" value={data.category} onChange={v => setData('category', v || '')} data={[{ value: '', label: 'None' }, ...Object.entries(categories).map(([v, c]) => ({ value: v, label: c.label }))]} clearable styles={inp} /></Grid.Col>
                    <Grid.Col span={6}><TextInput label="Phone" value={data.phone} onChange={e => setData('phone', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={6}><TextInput label="Email" value={data.email} onChange={e => setData('email', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={12}><TextInput label="TIN Number" value={data.tin_number} onChange={e => setData('tin_number', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={12}><Textarea label="Address" rows={2} value={data.address} onChange={e => setData('address', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={12}><Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inp} /></Grid.Col>
                </Grid>
                <Group justify="flex-end">
                    <Button type="submit" loading={processing} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 8 }}>Save</Button>
                </Group>
            </Stack>
        </form>
    );
}

export default function SuppliersIndex({ suppliers, categories, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const createForm = useForm({ name: '', contact_name: '', phone: '', email: '', address: '', tin_number: '', category: '', notes: '' });
    const editForm = useForm({});

    const applyFilters = (overrides = {}) => {
        const p = {};
        const s = overrides.search !== undefined ? overrides.search : search;
        const c = overrides.category !== undefined ? overrides.category : category;
        if (s) p.search = s;
        if (c) p.category = c;
        router.get('/system/procurement/suppliers', p, { preserveState: true, replace: true });
    };

    const handleCreate = (data) => {
        createForm.setData(data);
        router.post('/system/procurement/suppliers', data, {
            onSuccess: () => setCreateOpen(false),
            preserveScroll: true,
        });
    };

    const handleEdit = (data) => {
        router.put(`/system/procurement/suppliers/${editTarget.id}`, data, {
            onSuccess: () => setEditTarget(null),
            preserveScroll: true,
        });
    };

    const del = (s) => {
        if (confirm(`Delete supplier "${s.name}"?`)) {
            router.delete(`/system/procurement/suppliers/${s.id}`, { preserveScroll: true });
        }
    };

    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));

    return (
        <DashboardLayout title="Suppliers">
            <Grid mb="xl" gutter="md">
                {[
                    { icon: '🏭', label: 'Total Suppliers', value: stats.total, color: '#94A3B8' },
                    { icon: '✅', label: 'Active', value: stats.active, color: '#22C55E' },
                ].map(s => (
                    <Grid.Col key={s.label} span={{ base: 6, sm: 3 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '18px 22px' }}>
                            <Group gap="sm" mb={4}><Text style={{ fontSize: '1.2rem' }}>{s.icon}</Text><Text size="sm" style={{ color: '#64748B' }}>{s.label}</Text></Group>
                            <Text fw={800} size="xl" style={{ color: s.color }}>{s.value}</Text>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>

            <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
                <Group gap="sm">
                    <TextInput placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()} style={{ width: 220 }} styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }} />
                    <Select placeholder="All categories" value={category} onChange={v => { setCategory(v || ''); applyFilters({ category: v || '' }); }}
                        data={[{ value: '', label: 'All' }, ...Object.entries(categories).map(([v, c]) => ({ value: v, label: c.label }))]}
                        style={{ width: 160 }} styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }} />
                </Group>
                <Button onClick={() => setCreateOpen(true)} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}>
                    + Add Supplier
                </Button>
            </Group>

            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '1px solid var(--c-border-strong)' }}>
                                {['Supplier', 'Category', 'Contact', 'Phone / Email', 'Orders', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.data.map(s => {
                                const cat = categories[s.category];
                                return (
                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--c-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text fw={700} size="sm" style={{ color: 'var(--c-text)' }}>{s.name}</Text>
                                            {!s.is_active && <Text size="xs" style={{ color: '#475569' }}>Inactive</Text>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {cat ? <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}><Text size="xs" fw={700} style={{ color: cat.color }}>{cat.label}</Text></Box> : <Text size="sm" style={{ color: '#475569' }}>—</Text>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#94A3B8' }}>{s.contact_name || '—'}</Text></td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text size="sm" style={{ color: '#94A3B8' }}>{s.phone || '—'}</Text>
                                            <Text size="xs" style={{ color: '#475569' }}>{s.email || ''}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{s.purchase_orders_count}</Text></td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Group gap="sm">
                                                <Box component="button" onClick={() => setEditTarget(s)} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Edit</Box>
                                                <Box component="button" onClick={() => del(s)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13 }}>Del</Box>
                                            </Group>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {suppliers.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>🏭</Text>
                            <Text fw={600} style={{ color: 'var(--c-text)' }}>No suppliers yet</Text>
                        </Box>
                    )}
                </Box>
            </Box>

            <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title={<Text fw={700} style={{ color: 'var(--c-text)' }}>New Supplier</Text>} styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
                <SupplierForm categories={categories} onSubmit={handleCreate} processing={false} />
            </Modal>

            {editTarget && (
                <Modal opened={!!editTarget} onClose={() => setEditTarget(null)} title={<Text fw={700} style={{ color: 'var(--c-text)' }}>Edit — {editTarget.name}</Text>} styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
                    <SupplierForm categories={categories} initial={editTarget} onSubmit={handleEdit} processing={false} />
                </Modal>
            )}
        </DashboardLayout>
    );
}

import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, TextInput, Select, Modal, Stack, Textarea, Switch } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCan } from '../../../../lib/can';

function SupplierForm({ categories, initial = {}, onSubmit, processing, cardBg, cardBorder, textPri, textSec, inputBg, divider }) {
    const inputStyle = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        dropdown: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

    const { data, setData, errors } = useForm({
        name:         initial.name         || '',
        contact_name: initial.contact_name || '',
        phone:        initial.phone        || '',
        email:        initial.email        || '',
        address:      initial.address      || '',
        tin_number:   initial.tin_number   || '',
        category:     initial.category     || '',
        notes:        initial.notes        || '',
        is_active:    initial.is_active !== undefined ? initial.is_active : true,
    });

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(data); }}>
            <Stack gap="sm">
                <TextInput label="Supplier Name *" value={data.name} onChange={e => setData('name', e.target.value)} styles={inputStyle} required />
                <Grid gutter="sm">
                    <Grid.Col span={6}>
                        <TextInput label="Contact Person" value={data.contact_name} onChange={e => setData('contact_name', e.target.value)} styles={inputStyle} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Select
                            label="Category"
                            value={data.category}
                            onChange={v => setData('category', v || '')}
                            data={[{ value: '', label: 'None' }, ...Object.entries(categories).map(([v, c]) => ({ value: v, label: c.label }))]}
                            clearable
                            styles={inputStyle}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Phone" value={data.phone} onChange={e => setData('phone', e.target.value)} styles={inputStyle} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Email" value={data.email} onChange={e => setData('email', e.target.value)} styles={inputStyle} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput label="TIN Number" value={data.tin_number} onChange={e => setData('tin_number', e.target.value)} styles={inputStyle} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Textarea label="Address" rows={2} value={data.address} onChange={e => setData('address', e.target.value)} styles={inputStyle} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyle} />
                    </Grid.Col>
                </Grid>
                <Group justify="flex-end">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box
                            component="button"
                            type="submit"
                            disabled={processing}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 38, borderRadius: 9, fontWeight: 700, color: '#fff', padding: '0 22px', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1, fontSize: 13 }}
                        >
                            {processing ? 'Saving…' : 'Save'}
                        </Box>
                    </motion.div>
                </Group>
            </Stack>
        </form>
    );
}

export default function SuppliersIndex({ suppliers, categories, stats, filters }) {
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

    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const can = useCan();

    const applyFilters = (overrides = {}) => {
        const p = {};
        const s = overrides.search !== undefined ? overrides.search : search;
        const c = overrides.category !== undefined ? overrides.category : category;
        if (s) p.search = s;
        if (c) p.category = c;
        router.get('/system/procurement/suppliers', p, { preserveState: true, replace: true });
    };

    const handleCreate = (data) => {
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

    const modalStyles = {
        content: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16 },
        header: { background: cardBg, borderBottom: `1px solid ${divider}` },
        title: { color: textPri, fontWeight: 700 },
    };

    return (
        <DashboardLayout title="Suppliers">
            {/* Header banner */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏭</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Suppliers</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Manage procurement suppliers</Text>
                            </Stack>
                        </Group>
                        {can('procurement_suppliers.create') && (
                            <Box
                                component="button"
                                type="button"
                                onClick={() => setCreateOpen(true)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                            >
                                + Add Supplier
                            </Box>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Stat cards */}
            <Grid mb="lg" gutter="md">
                {[
                    { icon: '🏭', label: 'Total Suppliers', value: stats.total, color: textPri },
                    { icon: '✅', label: 'Active', value: stats.active, color: '#22C55E' },
                ].map((s, i) => (
                    <Grid.Col key={s.label} span={{ base: 6, sm: 3 }}>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 22px', boxShadow: cardShadow }}>
                                <Group gap="sm" mb={4}>
                                    <Text style={{ fontSize: '1.2rem' }}>{s.icon}</Text>
                                    <Text size="sm" style={{ color: textSec }}>{s.label}</Text>
                                </Group>
                                <Text fw={800} size="xl" style={{ color: s.color }}>{s.value}</Text>
                            </Box>
                        </motion.div>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Filters */}
            <Box mb="lg" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', boxShadow: cardShadow }}>
                <Group gap="sm" wrap="wrap">
                    <TextInput
                        placeholder="Search suppliers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        style={{ width: 240 }}
                        styles={inputStyle}
                    />
                    <Select
                        placeholder="All categories"
                        value={category}
                        onChange={v => { setCategory(v || ''); applyFilters({ category: v || '' }); }}
                        data={[{ value: '', label: 'All' }, ...Object.entries(categories).map(([v, c]) => ({ value: v, label: c.label }))]}
                        style={{ width: 180 }}
                        styles={inputStyle}
                    />
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                {['Supplier', 'Category', 'Contact', 'Phone / Email', 'Orders', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: textMut, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.data.map(s => {
                                const cat = categories[s.category];
                                return (
                                    <tr key={s.id} style={{ borderBottom: `1px solid ${divider}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text fw={700} size="sm" style={{ color: textPri }}>{s.name}</Text>
                                            {!s.is_active && <Text size="xs" style={{ color: textMut }}>Inactive</Text>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {cat
                                                ? <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}>
                                                    <Text size="xs" fw={700} style={{ color: cat.color }}>{cat.label}</Text>
                                                  </Box>
                                                : <Text size="sm" style={{ color: textMut }}>—</Text>
                                            }
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text size="sm" style={{ color: textSec }}>{s.contact_name || '—'}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text size="sm" style={{ color: textSec }}>{s.phone || '—'}</Text>
                                            <Text size="xs" style={{ color: textMut }}>{s.email || ''}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Text size="sm" style={{ color: textSec }}>{s.purchase_orders_count}</Text>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Group gap="sm">
                                                {can('procurement_suppliers.edit') && (
                                                    <Box
                                                        component="button"
                                                        onClick={() => setEditTarget(s)}
                                                        style={{ background: 'none', border: 'none', color: '#EA580C', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                                                    >
                                                        Edit
                                                    </Box>
                                                )}
                                                {can('procurement_suppliers.delete') && (
                                                    <Box
                                                        component="button"
                                                        onClick={() => del(s)}
                                                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13 }}
                                                    >
                                                        Del
                                                    </Box>
                                                )}
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
                            <Text fw={600} style={{ color: textPri }}>No suppliers yet</Text>
                            <Text size="sm" style={{ color: textMut, marginTop: 4 }}>Add your first supplier to get started</Text>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Create modal */}
            <Modal
                opened={createOpen}
                onClose={() => setCreateOpen(false)}
                title="New Supplier"
                styles={modalStyles}
            >
                <SupplierForm
                    categories={categories}
                    onSubmit={handleCreate}
                    processing={false}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    textPri={textPri}
                    textSec={textSec}
                    inputBg={inputBg}
                    divider={divider}
                />
            </Modal>

            {/* Edit modal */}
            {editTarget && (
                <Modal
                    opened={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    title={`Edit — ${editTarget.name}`}
                    styles={modalStyles}
                >
                    <SupplierForm
                        categories={categories}
                        initial={editTarget}
                        onSubmit={handleEdit}
                        processing={false}
                        cardBg={cardBg}
                        cardBorder={cardBorder}
                        textPri={textPri}
                        textSec={textSec}
                        inputBg={inputBg}
                        divider={divider}
                    />
                </Modal>
            )}
        </DashboardLayout>
    );
}

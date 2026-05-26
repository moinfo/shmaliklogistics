import { Head, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

const dk = {
    card:    '#0F1E32',
    cardHov: '#132436',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

const blankForm = {
    property_id: '',
    property_unit_id: '',
    category: 'renovation',
    description: '',
    amount: '',
    currency: 'TZS',
    exchange_rate: '',
    expense_date: today(),
    phase: '',
    vendor: '',
    receipt_number: '',
    receipt: null,
};

// Build a payload, using FormData only when a file is attached so Inertia can stream it.
function buildPayload(form) {
    const hasFile = form.receipt instanceof File;
    if (!hasFile) {
        const { receipt, ...rest } = form;
        return { data: rest, forceFormData: false };
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
        if (k === 'receipt') {
            if (v instanceof File) fd.append('receipt', v);
        } else if (v !== null && v !== undefined) {
            fd.append(k, v);
        }
    });
    return { data: fd, forceFormData: true };
}

function ExpenseForm({ initial, categories, phases, properties, currencies, onSubmit, onCancel, isDark, cardBorder, submitLabel }) {
    const [form, setForm] = useState(initial);
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textMut = isDark ? dk.textMut : '#64748B';
    const inputStyle = {
        padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`,
        background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri,
        fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
    };

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const submit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <Box component="form" onSubmit={submit} style={{ padding: '16px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}`, background: isDark ? 'rgba(59,130,246,0.04)' : '#F8FBFF' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 12 }}>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Property *</Text>
                    <select value={form.property_id} onChange={e => set('property_id', e.target.value)} style={inputStyle} required>
                        <option value="">Select property…</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Unit (optional)</Text>
                    <input type="number" min="0" placeholder="Unit ID" value={form.property_unit_id ?? ''} onChange={e => set('property_unit_id', e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Category *</Text>
                    <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle} required>
                        {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                    </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Description *</Text>
                    <input type="text" placeholder="e.g. Roof repair — main house" value={form.description} onChange={e => set('description', e.target.value)} style={inputStyle} required />
                </div>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Amount *</Text>
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} style={inputStyle} required />
                </div>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Currency</Text>
                    <select value={form.currency} onChange={e => set('currency', e.target.value)} style={inputStyle}>
                        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                {form.currency !== 'TZS' && (
                    <div>
                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Exchange Rate (TZS/1)</Text>
                        <input type="number" step="0.01" min="0" placeholder="0.00" value={form.exchange_rate ?? ''} onChange={e => set('exchange_rate', e.target.value)} style={inputStyle} />
                    </div>
                )}
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Date *</Text>
                    <input type="date" value={form.expense_date} onChange={e => set('expense_date', e.target.value)} style={inputStyle} required />
                </div>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Phase</Text>
                    <select value={form.phase ?? ''} onChange={e => set('phase', e.target.value)} style={inputStyle}>
                        <option value="">—</option>
                        {phases.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                </div>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Vendor</Text>
                    <input type="text" placeholder="Optional" value={form.vendor ?? ''} onChange={e => set('vendor', e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Receipt #</Text>
                    <input type="text" placeholder="Optional" value={form.receipt_number ?? ''} onChange={e => set('receipt_number', e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Receipt File</Text>
                    <input type="file" accept="image/*,application/pdf" onChange={e => set('receipt', e.target.files?.[0] ?? null)} style={{ ...inputStyle, padding: '6px 8px' }} />
                </div>
            </div>
            <Group gap="sm">
                <Box component="button" type="submit" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#065F46,#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {submitLabel}
                </Box>
                <Box component="button" type="button" onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, background: 'none', border: `1px solid ${cardBorder}`, color: textMut, cursor: 'pointer', fontSize: 13 }}>
                    Cancel
                </Box>
            </Group>
        </Box>
    );
}

export default function ExpensesIndex({ expenses, stats, categories, phases = [], properties = [], currencies = ['TZS'], filters = {} }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const rowHov     = isDark ? dk.cardHov : '#F8FAFC';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const [search, setSearch]     = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [property, setProperty] = useState(filters.property_id ? String(filters.property_id) : '');
    const [phase, setPhase]       = useState(filters.phase ?? '');

    const [showAdd, setShowAdd]   = useState(false);
    const [editing, setEditing]   = useState(null);
    const can = useCan();

    const flash = props.flash ?? {};

    const applyFilters = (next = {}) => {
        const q = {
            search: next.search ?? search,
            category: next.category ?? category,
            property_id: next.property_id ?? property,
            phase: next.phase ?? phase,
        };
        router.get('/system/real-estate/expenses', q, { preserveState: true, replace: true });
    };

    const createExpense = (form) => {
        const { data, forceFormData } = buildPayload(form);
        router.post('/system/real-estate/expenses', data, {
            forceFormData,
            preserveScroll: true,
            onSuccess: () => setShowAdd(false),
        });
    };

    const updateExpense = (id, form) => {
        const { data, forceFormData } = buildPayload(form);
        if (forceFormData) {
            // Inertia needs a spoofed method for multipart PUT requests.
            data.append('_method', 'put');
            router.post(`/system/real-estate/expenses/${id}`, data, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        } else {
            router.put(`/system/real-estate/expenses/${id}`, data, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        }
    };

    const deleteExpense = (id) => {
        if (window.confirm('Delete this expense? This cannot be undone.')) {
            router.delete(`/system/real-estate/expenses/${id}`, { preserveScroll: true });
        }
    };

    const statCards = [
        { icon: '💰', label: 'Total (TZS)',       value: `TZS ${fmt(stats?.total_tzs)}`,      accent: ['#1565C0', '#2196F3'] },
        { icon: '📅', label: 'This Month (TZS)',  value: `TZS ${fmt(stats?.this_month_tzs)}`, accent: ['#065F46', '#059669'] },
        { icon: '🔨', label: 'Renovation (TZS)',  value: `TZS ${fmt(stats?.renovation_tzs)}`, accent: ['#7C2D12', '#EA580C'] },
    ];

    const cols = '110px 1fr 90px 150px 1fr 130px 110px 120px 80px';
    const headers = ['Date', 'Property', 'Unit', 'Category', 'Description', 'Vendor', 'Amount', 'TZS', ''];

    const selectStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri },
        dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
    };

    return (
        <DashboardLayout title="Property Expenses">
            <Head title="Property Expenses" />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* Header */}
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Property Expenses</Text>
                    <Text size="sm" style={{ color: textSec }}>Matumizi na ukarabati — track renovation, repairs and operating costs</Text>
                </Stack>
                {can('realestate_expenses.create') && (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" type="button" onClick={() => { setShowAdd(v => !v); setEditing(null); }}
                            style={{ padding: '10px 22px', borderRadius: 10, background: showAdd ? 'transparent' : 'linear-gradient(135deg,#1565C0,#2196F3)', color: showAdd ? textSec : '#fff', border: showAdd ? `1px solid ${cardBorder}` : 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: showAdd ? 'none' : '0 4px 16px rgba(33,150,243,0.35)' }}>
                            {showAdd ? 'Cancel' : '＋ Add Expense'}
                        </Box>
                    </motion.div>
                )}
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` }} />
                            <Text style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</Text>
                            <Text fw={800} size="lg" style={{ color: textPri }}>{s.value}</Text>
                            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Add form */}
            {showAdd && can('realestate_expenses.create') && (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                    <Box style={{ padding: '12px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Text fw={700} size="sm" style={{ color: textPri }}>New Expense</Text>
                    </Box>
                    <ExpenseForm
                        initial={blankForm}
                        categories={categories}
                        phases={phases}
                        properties={properties}
                        currencies={currencies}
                        onSubmit={createExpense}
                        onCancel={() => setShowAdd(false)}
                        isDark={isDark}
                        cardBorder={cardBorder}
                        submitLabel="Save Expense"
                    />
                </Box>
            )}

            {/* Filters */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search description, vendor…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        style={{ flex: 1, minWidth: 200 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri } }}
                    />
                    <Select
                        placeholder="All categories"
                        value={category || null}
                        onChange={v => { setCategory(v ?? ''); applyFilters({ category: v ?? '' }); }}
                        clearable
                        data={Object.entries(categories).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))}
                        styles={selectStyles}
                        w={190}
                    />
                    <Select
                        placeholder="All properties"
                        value={property || null}
                        onChange={v => { setProperty(v ?? ''); applyFilters({ property_id: v ?? '' }); }}
                        clearable
                        data={properties.map(p => ({ value: String(p.id), label: p.name }))}
                        styles={selectStyles}
                        w={190}
                    />
                    <Select
                        placeholder="All phases"
                        value={phase || null}
                        onChange={v => { setPhase(v ?? ''); applyFilters({ phase: v ?? '' }); }}
                        clearable
                        data={phases.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                        styles={selectStyles}
                        w={160}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters()} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', borderRadius: 8 }} size={36}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <Box style={{ minWidth: 1000 }}>
                        {/* Head */}
                        <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                            {headers.map((h, idx) => (
                                <Text key={`${h}-${idx}`} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                            ))}
                        </Box>

                        {expenses.data.length === 0 ? (
                            <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>🧾</Text>
                                <Text fw={600} style={{ color: textPri }}>No expenses yet</Text>
                                <Text size="sm" style={{ color: textMut }}>Add the first property expense to get started</Text>
                            </Box>
                        ) : (
                            expenses.data.map((exp, i) => {
                                const cat = categories[exp.category] ?? { icon: '📦', label: exp.category };
                                const isEditing = editing === exp.id;
                                return (
                                    <Box key={exp.id}>
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                            <Box
                                                style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, padding: '14px 20px', borderBottom: `1px solid ${divider}`, transition: 'background 0.15s', alignItems: 'center' }}
                                                onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Text size="sm" style={{ color: textSec }}>{formatDate(exp.expense_date)}</Text>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{exp.property_label ?? '—'}</Text>
                                                <Text size="sm" style={{ color: textMut }}>{exp.unit_label ?? '—'}</Text>
                                                <Group gap={5}>
                                                    <Text size="sm">{cat.icon}</Text>
                                                    <Text size="xs" fw={600} style={{ color: textSec }}>{cat.label}</Text>
                                                </Group>
                                                <Stack gap={1}>
                                                    <Text size="sm" style={{ color: textPri }}>{exp.description}</Text>
                                                    {exp.phase && <Text size="xs" style={{ color: textMut }}>{exp.phase}</Text>}
                                                </Stack>
                                                <Text size="sm" style={{ color: textSec }}>{exp.vendor ?? '—'}</Text>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{exp.currency} {fmt(exp.amount)}</Text>
                                                <Text size="sm" fw={700} style={{ color: '#EF4444' }}>TZS {fmt(exp.amount_tzs)}</Text>
                                                <Group gap={4} justify="flex-end">
                                                    {exp.receipt_url && (
                                                        <Tooltip label="Receipt">
                                                            <ActionIcon component="a" href={exp.receipt_url} target="_blank" rel="noopener noreferrer" variant="subtle" size="sm" style={{ color: textMut }}>📎</ActionIcon>
                                                        </Tooltip>
                                                    )}
                                                    {can('realestate_expenses.edit') && (
                                                        <Tooltip label="Edit">
                                                            <ActionIcon variant="subtle" size="sm" style={{ color: textMut }} onClick={() => { setEditing(isEditing ? null : exp.id); setShowAdd(false); }}>✏️</ActionIcon>
                                                        </Tooltip>
                                                    )}
                                                    {can('realestate_expenses.delete') && (
                                                        <Tooltip label="Delete">
                                                            <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => deleteExpense(exp.id)}>🗑</ActionIcon>
                                                        </Tooltip>
                                                    )}
                                                </Group>
                                            </Box>
                                        </motion.div>
                                        {isEditing && can('realestate_expenses.edit') && (
                                            <ExpenseForm
                                                initial={{
                                                    property_id: exp.property_id ? String(exp.property_id) : '',
                                                    property_unit_id: exp.property_unit_id ?? '',
                                                    category: exp.category ?? 'renovation',
                                                    description: exp.description ?? '',
                                                    amount: exp.amount ?? '',
                                                    currency: exp.currency ?? 'TZS',
                                                    exchange_rate: exp.exchange_rate ?? '',
                                                    expense_date: exp.expense_date ? String(exp.expense_date).slice(0, 10) : today(),
                                                    phase: exp.phase ?? '',
                                                    vendor: exp.vendor ?? '',
                                                    receipt_number: exp.receipt_number ?? '',
                                                    receipt: null,
                                                }}
                                                categories={categories}
                                                phases={phases}
                                                properties={properties}
                                                currencies={currencies}
                                                onSubmit={(form) => updateExpense(exp.id, form)}
                                                onCancel={() => setEditing(null)}
                                                isDark={isDark}
                                                cardBorder={cardBorder}
                                                submitLabel="Update Expense"
                                            />
                                        )}
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Pagination */}
            {expenses.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={expenses.current_page}
                        total={expenses.last_page}
                        onChange={p => router.get('/system/real-estate/expenses', { ...filters, page: p }, { preserveState: true })}
                        size="sm"
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}
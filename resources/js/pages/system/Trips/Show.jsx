import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: '#94A3B8',
    textMut: '#475569',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
}

function DataRow({ label, value, isDark }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const divider = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
            <Text size="sm" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri }}>{value ?? '—'}</Text>
        </Box>
    );
}

function Card({ title, children, isDark, accent }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

export default function ShowTrip({ trip, statuses, expenses = [], expenseCategories = {} }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';

    const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };

    const totalCosts = Number(trip.fuel_cost) + Number(trip.driver_allowance) + Number(trip.border_costs) + Number(trip.other_costs);
    const profit = Number(trip.freight_amount) - totalCosts;

    const [expForm, setExpForm] = useState({ category: 'fuel', description: '', amount: '', currency: 'TZS', expense_date: new Date().toISOString().slice(0, 10), receipt_number: '', notes: '' });
    const [showExpForm, setShowExpForm] = useState(false);

    const addExpense = (e) => {
        e.preventDefault();
        router.post('/system/expenses', { ...expForm, trip_id: trip.id }, {
            onSuccess: () => { setShowExpForm(false); setExpForm(p => ({ ...p, description: '', amount: '', receipt_number: '', notes: '' })); }
        });
    };

    const expenseTotal  = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const inputStyle    = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };

    const confirmDelete = () => {
        if (window.confirm(`Delete ${trip.trip_number}? This cannot be undone.`)) {
            router.delete(`/system/trips/${trip.id}`);
        }
    };

    const handleStatusChange = (status) => {
        router.patch(`/system/trips/${trip.id}/status`, { status });
    };

    // Flash message
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title={trip.trip_number}>
            <Head title={trip.trip_number} />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Stack gap={4}>
                    <Group gap="md">
                        <Text fw={800} size="xl" style={{ color: textPri }}>{trip.trip_number}</Text>
                        <Box style={{ background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '4px 12px' }}>
                            <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                        </Box>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{trip.route_from} → {trip.route_to}</Text>
                </Stack>
                <Group gap="sm">
                    {/* Quick status update */}
                    <Select
                        value={trip.status}
                        onChange={handleStatusChange}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        size="sm"
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8, width: 150 },
                            dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
                        }}
                    />
                    <Box
                        component={Link}
                        href={`/system/trips/${trip.id}/edit`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                    >
                        ✏️ Edit
                    </Box>
                    <Tooltip label="Delete trip">
                        <ActionIcon onClick={confirmDelete} size={36} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444' }}>🗑️</ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <Card title="Trip Details" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                    <DataRow label="Trip #"      value={trip.trip_number}   isDark={isDark} />
                    <DataRow label="Status"      value={meta.label}          isDark={isDark} />
                    <DataRow label="From"        value={trip.route_from}     isDark={isDark} />
                    <DataRow label="To"          value={trip.route_to}       isDark={isDark} />
                    <DataRow label="Departure"   value={trip.departure_date} isDark={isDark} />
                    <DataRow label="Arrival"     value={trip.arrival_date}   isDark={isDark} />
                </Card>

                <Card title="Driver & Vehicle" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                    <DataRow label="Driver"          value={trip.driver_name}       isDark={isDark} />
                    <DataRow label="Vehicle"         value={trip.vehicle_plate}     isDark={isDark} />
                    <DataRow label="Cargo"           value={trip.cargo_description} isDark={isDark} />
                    <DataRow label="Weight (tons)"   value={trip.cargo_weight_tons} isDark={isDark} />
                </Card>
            </SimpleGrid>

            {/* Financials */}
            <Card title="Financial Summary" isDark={isDark} accent={['#065F46', '#059669']}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="md">
                    {[
                        { label: 'Freight (Income)', value: trip.freight_amount, color: '#22C55E' },
                        { label: 'Fuel Cost',         value: trip.fuel_cost,         color: '#EF4444' },
                        { label: 'Driver Allowance',  value: trip.driver_allowance,  color: '#EF4444' },
                        { label: 'Border Costs',      value: trip.border_costs,      color: '#EF4444' },
                        { label: 'Other Costs',       value: trip.other_costs,       color: '#EF4444' },
                        { label: 'Total Costs',       value: totalCosts,             color: '#F59E0B', bold: true },
                    ].map(f => (
                        <Box key={f.label} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 10, padding: '14px 16px', border: `1px solid ${cardBorder}` }}>
                            <Text size="xs" style={{ color: textMut, marginBottom: 4 }}>{f.label}</Text>
                            <Text fw={f.bold ? 800 : 700} size="md" style={{ color: f.color }}>TZS {fmt(f.value)}</Text>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Net profit banner */}
                <Box mt="md" style={{ background: profit >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${profit >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 12, padding: '16px 20px' }}>
                    <Group justify="space-between">
                        <Text fw={700} size="md" style={{ color: textPri }}>Net Profit</Text>
                        <Text fw={900} size="xl" style={{ color: profit >= 0 ? '#22C55E' : '#EF4444' }}>
                            {profit < 0 ? '- ' : ''}TZS {fmt(Math.abs(profit))}
                        </Text>
                    </Group>
                </Box>
            </Card>

            {/* Notes */}
            {trip.notes && (
                <Box mt="md">
                    <Card title="Notes" isDark={isDark}>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{trip.notes}</Text>
                    </Card>
                </Box>
            )}

            {/* Linked Expenses */}
            <Box mt="md">
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                    <Group justify="space-between" style={{ padding: '14px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Group gap={8}>
                            <Text fw={700} size="sm" style={{ color: textPri }}>💸 Trip Expenses</Text>
                            {expenses.length > 0 && (
                                <Box style={{ background: '#EF444420', border: '1px solid #EF444440', borderRadius: 12, padding: '1px 8px' }}>
                                    <Text size="xs" fw={700} style={{ color: '#EF4444' }}>{fmt(expenseTotal)} TZS total</Text>
                                </Box>
                            )}
                        </Group>
                        <Box component="button" type="button" onClick={() => setShowExpForm(v => !v)}
                            style={{ padding: '5px 14px', borderRadius: 8, background: showExpForm ? 'transparent' : 'linear-gradient(135deg,#1565C0,#2196F3)', color: showExpForm ? textMut : '#fff', border: showExpForm ? `1px solid ${cardBorder}` : 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                            {showExpForm ? 'Cancel' : '＋ Add Expense'}
                        </Box>
                    </Group>

                    {showExpForm && (
                        <Box style={{ padding: '16px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}`, background: isDark ? 'rgba(59,130,246,0.04)' : '#F8FBFF' }}>
                            <form onSubmit={addExpense}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 10 }}>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Category *</Text>
                                        <select value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))} style={inputStyle} required>
                                            {Object.entries(expenseCategories).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Description *</Text>
                                        <input type="text" placeholder="e.g. Fuel at Total Morogoro" value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Amount *</Text>
                                        <input type="number" step="0.01" min="0" placeholder="0.00" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Currency</Text>
                                        <select value={expForm.currency} onChange={e => setExpForm(p => ({ ...p, currency: e.target.value }))} style={inputStyle}>
                                            {['TZS','USD','ZMW','KES','CDF'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Date *</Text>
                                        <input type="date" value={expForm.expense_date} onChange={e => setExpForm(p => ({ ...p, expense_date: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Receipt #</Text>
                                        <input type="text" placeholder="Optional" value={expForm.receipt_number} onChange={e => setExpForm(p => ({ ...p, receipt_number: e.target.value }))} style={inputStyle} />
                                    </div>
                                </div>
                                <button type="submit" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#065F46,#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    Save Expense
                                </button>
                            </form>
                        </Box>
                    )}

                    {expenses.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '28px 0' }}>
                            <Text size="sm" style={{ color: textMut }}>No expenses recorded for this trip yet.</Text>
                        </Box>
                    ) : (
                        <Box>
                            {expenses.map((exp, i) => {
                                const cat = expenseCategories[exp.category] ?? { icon: '📦', label: exp.category };
                                return (
                                    <Group key={exp.id} justify="space-between" style={{ padding: '12px 20px', borderBottom: i < expenses.length - 1 ? `1px solid ${isDark ? dk.divider : '#E2E8F0'}` : 'none' }}>
                                        <Group gap={10}>
                                            <Text size="md">{cat.icon}</Text>
                                            <Box>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{exp.description}</Text>
                                                <Text size="xs" style={{ color: textMut }}>{cat.label} · {new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Text>
                                            </Box>
                                        </Group>
                                        <Text fw={700} size="sm" style={{ color: '#EF4444' }}>{exp.currency} {fmt(exp.amount)}</Text>
                                    </Group>
                                );
                            })}
                            <Group justify="flex-end" style={{ padding: '12px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                <Text size="sm" fw={800} style={{ color: textPri }}>Total: <span style={{ color: '#EF4444' }}>TZS {fmt(expenseTotal)}</span></Text>
                            </Group>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/trips" style={{ color: textMut, textDecoration: 'none', fontSize: 13 }}>← Back to Trips</Box>
            </Box>
        </DashboardLayout>
    );
}

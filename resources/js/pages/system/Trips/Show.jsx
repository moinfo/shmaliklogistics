import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon, NumberInput, TextInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';
import { formatDate } from '../../../lib/date';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
}

function DataRow({ label, value, isDark, mono = false }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const divider = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
            <Text size="sm" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined }}>{value ?? '—'}</Text>
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

const defaultLine = { category: 'fuel', description: '', quantity: 1, unit_price: '', currency: 'TZS', exchange_rate: '' };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function buildPnLHtml({ trip, expenseLines, expenseLineCategories, company }) {
    const income = Number(trip.invoice_tzs || trip.freight_amount) || 0;

    // Group expense lines by category
    const lineGroups = {};
    expenseLines.forEach(l => {
        const cat = (expenseLineCategories[l.category] ?? { label: l.category, icon: '📋' });
        const key = cat.label;
        lineGroups[key] = (lineGroups[key] || 0) + Number(l.amount_tzs);
    });

    // Fall back to bulk fields when no lines exist
    const hasBulk = expenseLines.length === 0;
    const bulkRows = hasBulk ? [
        { label: 'Fuel Cost',        value: Number(trip.fuel_cost) },
        { label: 'Driver Allowance', value: Number(trip.driver_allowance) },
        { label: 'Border Costs',     value: Number(trip.border_costs) },
        { label: 'Road Fines',       value: Number(trip.road_fines) },
        { label: 'Guard Fees',       value: Number(trip.guard_fees) },
        { label: 'Other Costs',      value: Number(trip.other_costs) },
    ].filter(r => r.value > 0) : [];

    const totalExpenses = hasBulk
        ? bulkRows.reduce((s, r) => s + r.value, 0)
        : expenseLines.reduce((s, l) => s + Number(l.amount_tzs), 0);

    const profit = income - totalExpenses;
    const N = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(n || 0));

    const expenseRowsHtml = hasBulk
        ? bulkRows.map(r => `<tr><td>${r.label}</td><td style="text-align:right;color:#dc2626">TZS ${N(r.value)}</td></tr>`).join('')
        : Object.entries(lineGroups).map(([label, val]) =>
            `<tr><td>${label}</td><td style="text-align:right;color:#dc2626">TZS ${N(val)}</td></tr>`
          ).join('');

    const co = company ?? {};
    const generated = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return `<!doctype html><html><head><title>P&L — ${trip.trip_number}</title>
    <style>
        *{box-sizing:border-box}
        body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;padding:24px;max-width:700px;margin:auto}
        .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1e40af;padding-bottom:12px;margin-bottom:16px}
        .co-name{font-size:16px;font-weight:700;color:#1e40af}
        .co-sub{font-size:11px;color:#64748b;margin-top:2px}
        .title{font-size:18px;font-weight:700;margin:0 0 12px;color:#1e293b}
        .meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;background:#f8fafc;border-radius:6px;padding:12px;margin-bottom:16px;font-size:12px}
        .meta-label{color:#64748b}
        .meta-value{font-weight:600;color:#1e293b}
        .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#64748b;margin:12px 0 4px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
        table{width:100%;border-collapse:collapse}
        td{padding:6px 8px;border-bottom:1px solid #f1f5f9}
        .total-row td{font-weight:700;border-top:2px solid #e2e8f0;border-bottom:none;padding-top:8px}
        .profit{font-size:15px;font-weight:700;padding:12px;border-radius:6px;margin-top:16px;display:flex;justify-content:space-between}
        .profit.pos{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
        .profit.neg{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}
        .footer{margin-top:24px;font-size:10px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:8px}
        @media print{@page{margin:14mm}}
    </style></head><body>
    <div class="header">
        <div>
            <div class="co-name">${co.company_name ?? 'COMPANY'}</div>
            <div class="co-sub">${[co.company_address, co.company_city, co.company_country].filter(Boolean).join(' · ')}</div>
            ${co.company_tin ? `<div class="co-sub">TIN: ${co.company_tin}</div>` : ''}
        </div>
        <div style="text-align:right;color:#64748b;font-size:11px">
            <div><strong>P&amp;L Statement</strong></div>
            <div>${generated}</div>
        </div>
    </div>

    <div class="title">Trip P&L — ${trip.trip_number}</div>

    <div class="meta">
        <span class="meta-label">Route</span><span class="meta-value">${trip.route_from} → ${trip.route_to}</span>
        <span class="meta-label">Driver</span><span class="meta-value">${trip.driver_name ?? '—'}</span>
        <span class="meta-label">Vehicle</span><span class="meta-value">${trip.vehicle_plate ?? '—'}</span>
        <span class="meta-label">Departure</span><span class="meta-value">${fmtDate(trip.departure_date)}</span>
        ${trip.container_number ? `<span class="meta-label">Container</span><span class="meta-value" style="font-family:monospace">${trip.container_number}</span>` : ''}
        ${trip.cargo_description ? `<span class="meta-label">Cargo</span><span class="meta-value">${trip.cargo_description}</span>` : ''}
    </div>

    <div class="section-title">Income</div>
    <table>
        ${trip.invoice_usd ? `<tr><td>Invoice (USD)</td><td style="text-align:right">$ ${N(trip.invoice_usd)}</td></tr>
        <tr><td>Exchange Rate</td><td style="text-align:right">TZS ${N(trip.exchange_rate)} / USD</td></tr>` : ''}
        <tr><td>${trip.invoice_tzs ? 'Invoice (TZS)' : 'Freight Amount'}</td><td style="text-align:right;font-weight:700;color:#16a34a">TZS ${N(income)}</td></tr>
    </table>

    <div class="section-title">Expenses</div>
    <table>
        ${expenseRowsHtml}
        <tr class="total-row"><td>Total Expenses</td><td style="text-align:right;color:#dc2626">TZS ${N(totalExpenses)}</td></tr>
    </table>

    <div class="profit ${profit >= 0 ? 'pos' : 'neg'}">
        <span>Net ${profit >= 0 ? 'Profit' : 'Loss'}</span>
        <span>TZS ${N(Math.abs(profit))}${profit < 0 ? ' (Loss)' : ''}</span>
    </div>

    <div class="footer">Generated by ${co.company_name ?? 'Logistics System'} · ${generated}</div>
    </body></html>`;
}

function printPnL(args) {
    const html = buildPnLHtml(args);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) {
        win.addEventListener('load', () => { win.print(); URL.revokeObjectURL(url); });
    }
}

export default function ShowTrip({ trip, statuses, expenses = [], expenseCategories = {}, expenseLines = [], expenseLineCategories = {}, expenseLineCurrencies = [], company = null }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';

    const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };

    const totalCosts = Number(trip.fuel_cost) + Number(trip.driver_allowance) + Number(trip.border_costs) + Number(trip.other_costs);
    const profit = Number(trip.freight_amount) - totalCosts;

    const [expForm, setExpForm] = useState({ category: 'fuel', description: '', amount: '', currency: 'TZS', expense_date: new Date().toISOString().slice(0, 10), receipt_number: '', notes: '' });
    const [showExpForm, setShowExpForm] = useState(false);
    const can = useCan();

    const addExpense = (e) => {
        e.preventDefault();
        router.post('/system/expenses', { ...expForm, trip_id: trip.id }, {
            onSuccess: () => { setShowExpForm(false); setExpForm(p => ({ ...p, description: '', amount: '', receipt_number: '', notes: '' })); }
        });
    };

    const expenseTotal  = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const inputStyle    = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };

    // Expense lines
    const [showLineForm, setShowLineForm] = useState(false);
    const [lineForm, setLineForm]         = useState(defaultLine);
    const lineTotal = expenseLines.reduce((s, l) => s + Number(l.amount_tzs), 0);

    const addLine = (e) => {
        e.preventDefault();
        router.post(`/system/trips/${trip.id}/expense-lines`, lineForm, {
            onSuccess: () => { setShowLineForm(false); setLineForm(defaultLine); },
            preserveScroll: true,
        });
    };

    const deleteLine = (lineId) => {
        if (confirm('Remove this expense line?')) {
            router.delete(`/system/trips/${trip.id}/expense-lines/${lineId}`, { preserveScroll: true });
        }
    };

    const lineInputStyles = {
        label: { color: textSec, fontSize: 12, marginBottom: 3 },
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    // Live preview of TZS amount in the add-line form
    const previewTzs = (() => {
        const qty  = Number(lineForm.quantity) || 0;
        const up   = Number(lineForm.unit_price) || 0;
        const rate = Number(lineForm.exchange_rate) || 1;
        const amt  = qty * up;
        return lineForm.currency === 'TZS' ? amt : amt * rate;
    })();

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
                    {can('trips.edit') && (
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
                    )}
                    {can('trips.edit') && (
                        <Box
                            component={Link}
                            href={`/system/trips/${trip.id}/edit`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ✏️ Edit
                        </Box>
                    )}
                    <Tooltip label="Print P&L">
                        <ActionIcon
                            onClick={() => printPnL({ trip, expenseLines, expenseLineCategories, company })}
                            size={36}
                            style={{ background: 'rgba(33,150,243,0.08)', border: '1px solid rgba(33,150,243,0.25)', borderRadius: 8, color: '#2196F3' }}
                        >🖨️</ActionIcon>
                    </Tooltip>
                    {can('trips.delete') && (
                        <Tooltip label="Delete trip">
                            <ActionIcon onClick={confirmDelete} size={36} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444' }}>🗑️</ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <Card title="Trip Details" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                    <DataRow label="Trip #"      value={trip.trip_number}   isDark={isDark} />
                    <DataRow label="Status"      value={meta.label}          isDark={isDark} />
                    <DataRow label="From"        value={trip.route_from}     isDark={isDark} />
                    <DataRow label="To"          value={trip.route_to}       isDark={isDark} />
                    <DataRow label="Departure"   value={formatDate(trip.departure_date)} isDark={isDark} />
                    <DataRow label="Arrival"     value={formatDate(trip.arrival_date)}   isDark={isDark} />
                </Card>

                <Card title="Driver & Vehicle" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                    <DataRow label="Driver"          value={trip.driver_name}       isDark={isDark} />
                    <DataRow label="Vehicle"         value={trip.vehicle_plate}     isDark={isDark} />
                    <DataRow label="Cargo"           value={trip.cargo_description} isDark={isDark} />
                    {trip.container_number && (
                        <DataRow label="Container No"    value={trip.container_number}  isDark={isDark} mono />
                    )}
                    <DataRow label="Weight (tons)"   value={trip.cargo_weight_tons} isDark={isDark} />
                </Card>
            </SimpleGrid>

            {/* Financials */}
            <Card title="Financial Summary" isDark={isDark} accent={['#065F46', '#059669']}>
                {/* USD Invoice strip — only shown when invoice_usd is set */}
                {trip.invoice_usd && (
                    <Box mt="md" style={{ background: isDark ? 'rgba(59,130,246,0.06)' : '#EFF6FF', border: `1px solid ${isDark ? 'rgba(59,130,246,0.25)' : '#BFDBFE'}`, borderRadius: 12, padding: '14px 20px' }}>
                        <Text size="xs" fw={700} style={{ color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>💵 USD Invoice</Text>
                        <Group gap="xl" wrap="wrap">
                            <Stack gap={2}>
                                <Text size="xs" style={{ color: textMut }}>Invoice (USD)</Text>
                                <Text fw={800} size="lg" style={{ color: '#3B82F6' }}>$ {fmt(trip.invoice_usd)}</Text>
                            </Stack>
                            {trip.exchange_rate && (
                                <Stack gap={2}>
                                    <Text size="xs" style={{ color: textMut }}>Exchange Rate</Text>
                                    <Text fw={700} size="md" style={{ color: textSec }}>TZS {fmt(trip.exchange_rate)} / USD</Text>
                                </Stack>
                            )}
                            {trip.invoice_tzs && (
                                <Stack gap={2}>
                                    <Text size="xs" style={{ color: textMut }}>Invoice (TZS)</Text>
                                    <Text fw={800} size="lg" style={{ color: '#22C55E' }}>TZS {fmt(trip.invoice_tzs)}</Text>
                                </Stack>
                            )}
                        </Group>
                    </Box>
                )}

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

            {/* P&L Summary — consolidates income vs all expense lines */}
            {expenseLines.length > 0 && (() => {
                const income = Number(trip.invoice_tzs || trip.freight_amount) || 0;
                const lineTotalTzs = expenseLines.reduce((s, l) => s + Number(l.amount_tzs), 0);
                const pnlProfit = income - lineTotalTzs;

                // Group lines by category for display
                const grouped = {};
                expenseLines.forEach(l => {
                    const cat = expenseLineCategories[l.category] ?? { label: l.category, icon: '📋' };
                    const key = l.category;
                    grouped[key] = grouped[key] ?? { icon: cat.icon, label: cat.label, total: 0 };
                    grouped[key].total += Number(l.amount_tzs);
                });

                return (
                    <Box mt="md" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                            <Text fw={700} size="sm" style={{ color: textPri }}>📈 P&L Summary</Text>
                            <Box
                                component="button"
                                onClick={() => printPnL({ trip, expenseLines, expenseLineCategories, company })}
                                style={{ padding: '5px 14px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                            >
                                🖨 Print P&L
                            </Box>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            {/* Income */}
                            <Text size="xs" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Income</Text>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}`, marginBottom: 12 }}>
                                <Text size="sm" style={{ color: textSec }}>{trip.invoice_tzs ? 'Invoice (TZS)' : 'Freight Amount'}</Text>
                                <Text size="sm" fw={700} style={{ color: '#22C55E' }}>TZS {fmt(income)}</Text>
                            </Box>

                            {/* Expenses by category */}
                            <Text size="xs" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Expenses</Text>
                            {Object.values(grouped).map(g => (
                                <Box key={g.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}>
                                    <Group gap={6}>
                                        <Text size="xs">{g.icon}</Text>
                                        <Text size="sm" style={{ color: textSec }}>{g.label}</Text>
                                    </Group>
                                    <Text size="sm" style={{ color: '#EF4444' }}>TZS {fmt(g.total)}</Text>
                                </Box>
                            ))}
                            <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4, borderBottom: `2px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                <Text size="sm" fw={700} style={{ color: textPri }}>Total Expenses</Text>
                                <Text size="sm" fw={700} style={{ color: '#EF4444' }}>TZS {fmt(lineTotalTzs)}</Text>
                            </Box>

                            {/* Net profit/loss banner */}
                            <Box mt="md" style={{ background: pnlProfit >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${pnlProfit >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Net {pnlProfit >= 0 ? 'Profit' : 'Loss'}</Text>
                                <Text fw={900} size="xl" style={{ color: pnlProfit >= 0 ? '#22C55E' : '#EF4444' }}>
                                    TZS {fmt(Math.abs(pnlProfit))}{pnlProfit < 0 ? ' (Loss)' : ''}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                );
            })()}

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

            {/* Detailed Expense Lines (P&L worksheet) */}
            <Box mt="md">
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                    <Group justify="space-between" style={{ padding: '14px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Group gap={8}>
                            <Text fw={700} size="sm" style={{ color: textPri }}>📊 P&L Expense Lines</Text>
                            {lineTotal > 0 && (
                                <Text size="xs" fw={700} style={{ color: '#EF4444' }}>TZS {fmt(lineTotal)} total</Text>
                            )}
                        </Group>
                        {can('trips.edit') && (
                            <Box component="button" type="button" onClick={() => setShowLineForm(v => !v)}
                                style={{ padding: '5px 14px', borderRadius: 8, background: showLineForm ? 'transparent' : 'linear-gradient(135deg,#1565C0,#2196F3)', border: showLineForm ? `1px solid ${cardBorder}` : 'none', color: showLineForm ? textSec : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                                {showLineForm ? 'Cancel' : '＋ Add Line'}
                            </Box>
                        )}
                    </Group>

                    {/* Add line form */}
                    {showLineForm && (
                        <Box style={{ padding: '16px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                            <form onSubmit={addLine}>
                                <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm" mb="sm">
                                    <Select
                                        label="Category"
                                        required
                                        value={lineForm.category}
                                        onChange={v => setLineForm(p => ({ ...p, category: v ?? 'other' }))}
                                        data={Object.entries(expenseLineCategories).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))}
                                        styles={{ ...lineInputStyles, dropdown: dropdownStyle }}
                                    />
                                    <TextInput
                                        label="Description"
                                        placeholder="e.g. Fuel Dar–Lusaka"
                                        value={lineForm.description}
                                        onChange={e => setLineForm(p => ({ ...p, description: e.target.value }))}
                                        styles={lineInputStyles}
                                    />
                                    <NumberInput
                                        label="Quantity"
                                        required min={0.001} step={0.5}
                                        value={lineForm.quantity}
                                        onChange={v => setLineForm(p => ({ ...p, quantity: v }))}
                                        styles={lineInputStyles}
                                        thousandSeparator=","
                                    />
                                    <NumberInput
                                        label="Unit Price"
                                        required min={0}
                                        value={lineForm.unit_price}
                                        onChange={v => setLineForm(p => ({ ...p, unit_price: v }))}
                                        styles={lineInputStyles}
                                        thousandSeparator=","
                                    />
                                    <Select
                                        label="Currency"
                                        required
                                        value={lineForm.currency}
                                        onChange={v => setLineForm(p => ({ ...p, currency: v ?? 'TZS' }))}
                                        data={expenseLineCurrencies.map(c => ({ value: c, label: c }))}
                                        styles={{ ...lineInputStyles, dropdown: dropdownStyle }}
                                    />
                                    {lineForm.currency !== 'TZS' && (
                                        <NumberInput
                                            label="Rate (TZS/1)"
                                            min={0}
                                            value={lineForm.exchange_rate}
                                            onChange={v => setLineForm(p => ({ ...p, exchange_rate: v }))}
                                            styles={lineInputStyles}
                                            thousandSeparator=","
                                        />
                                    )}
                                </SimpleGrid>
                                {previewTzs > 0 && (
                                    <Text size="xs" style={{ color: '#3B82F6', marginBottom: 8 }}>
                                        Preview: TZS {new Intl.NumberFormat('en-TZ').format(Math.round(previewTzs))}
                                    </Text>
                                )}
                                <Group gap="sm">
                                    <Box component="button" type="submit" style={{ padding: '7px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Save Line</Box>
                                </Group>
                            </form>
                        </Box>
                    )}

                    {/* Lines table */}
                    {expenseLines.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '28px 0' }}>
                            <Text size="sm" style={{ color: textMut }}>No expense lines yet. Add lines to build the P&L.</Text>
                        </Box>
                    ) : (
                        <Box style={{ overflowX: 'auto' }}>
                            <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 110px 70px 90px 120px 36px', padding: '8px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                                {['Category', 'Description', 'Qty', 'Unit Price', 'Curr', 'Rate', 'TZS Amt', ''].map(h => (
                                    <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                                ))}
                            </Box>
                            {expenseLines.map((line, i) => {
                                const cat = expenseLineCategories[line.category] ?? { icon: '📋', label: line.category };
                                return (
                                    <Box key={line.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 110px 70px 90px 120px 36px', padding: '10px 20px', borderBottom: i < expenseLines.length - 1 ? `1px solid ${isDark ? dk.divider : '#F1F5F9'}` : 'none', alignItems: 'center' }}>
                                        <Group gap={5}>
                                            <Text size="xs">{cat.icon}</Text>
                                            <Text size="xs" fw={600} style={{ color: textSec }}>{cat.label}</Text>
                                        </Group>
                                        <Text size="sm" style={{ color: textPri }}>{line.description || '—'}</Text>
                                        <Text size="sm" style={{ color: textSec }}>{Number(line.quantity).toLocaleString()}</Text>
                                        <Text size="sm" style={{ color: textSec }}>{fmt(line.unit_price)}</Text>
                                        <Text size="xs" fw={600} style={{ color: line.currency !== 'TZS' ? '#3B82F6' : textMut }}>{line.currency}</Text>
                                        <Text size="xs" style={{ color: textMut }}>{line.exchange_rate ? fmt(line.exchange_rate) : '—'}</Text>
                                        <Text size="sm" fw={700} style={{ color: '#EF4444' }}>TZS {fmt(line.amount_tzs)}</Text>
                                        {can('trips.edit') && (
                                            <Tooltip label="Remove">
                                                <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => deleteLine(line.id)}>🗑</ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Box>
                                );
                            })}
                            <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 110px 70px 90px 120px 36px', padding: '12px 20px', borderTop: `2px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                <Text size="xs" fw={700} style={{ color: textMut, textTransform: 'uppercase', gridColumn: '1 / 7' }}>Total</Text>
                                <Text size="sm" fw={800} style={{ color: '#EF4444' }}>TZS {fmt(lineTotal)}</Text>
                                <Box />
                            </Box>
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

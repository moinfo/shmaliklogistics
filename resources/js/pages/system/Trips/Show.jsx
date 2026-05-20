import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon, NumberInput, TextInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';
import { formatDate } from '../../../lib/date';

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function DriverAvatar({ name }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: 44, height: 44, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text size="sm" fw={900} style={{ color, letterSpacing: 0.5 }}>{initials}</Text>
        </Box>
    );
}

function InfoRow({ icon, label, value, mono = false, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8} style={{ minWidth: 0 }}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right', wordBreak: 'break-all' }}>
                {value ?? '—'}
            </Text>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent, toolbar }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function FinStatCard({ label, value, sub, color, grad, icon, isDark }) {
    return (
        <Box style={{ background: grad ?? (isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC'), border: grad ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0'}`, borderRadius: 14, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            {grad && (
                <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
            )}
            <Group justify="space-between" align="flex-start" mb={10}>
                <Text size="xs" fw={600} style={{ color: grad ? 'rgba(255,255,255,0.75)' : (isDark ? '#94A3B8' : '#64748B') }}>{label}</Text>
                {icon && <Text size="md">{icon}</Text>}
            </Group>
            <Text fw={900} size="lg" style={{ color: grad ? '#fff' : color, lineHeight: 1.2 }}>{value}</Text>
            {sub && <Text size="10px" style={{ color: grad ? 'rgba(255,255,255,0.55)' : (isDark ? '#475569' : '#98A2B3'), marginTop: 3 }}>{sub}</Text>}
        </Box>
    );
}

const defaultLine = { category: 'fuel', description: '', quantity: 1, unit_price: '', currency: 'TZS', exchange_rate: '' };

function buildPnLHtml({ trip, expenseLines, expenseLineCategories, company }) {
    const income = Number(trip.invoice_tzs || trip.freight_amount) || 0;
    const lineGroups = {};
    expenseLines.forEach(l => {
        const cat = (expenseLineCategories[l.category] ?? { label: l.category, icon: '📋' });
        const key = cat.label;
        lineGroups[key] = (lineGroups[key] || 0) + Number(l.amount_tzs);
    });
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

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const inputStyle = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };
    const lineInputStyles = {
        label: { color: textSec, fontSize: 12, marginBottom: 3 },
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` };

    const meta = statuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
    const totalCosts = Number(trip.fuel_cost) + Number(trip.driver_allowance) + Number(trip.border_costs) + Number(trip.other_costs);
    const profit = Number(trip.freight_amount) - totalCosts;
    const income = Number(trip.invoice_tzs || trip.freight_amount) || 0;

    const [expForm, setExpForm] = useState({ category: 'fuel', description: '', amount: '', currency: 'TZS', expense_date: new Date().toISOString().slice(0, 10), receipt_number: '', notes: '' });
    const [showExpForm, setShowExpForm] = useState(false);
    const [showLineForm, setShowLineForm] = useState(false);
    const [lineForm, setLineForm] = useState(defaultLine);
    const can = useCan();
    const flash = props.flash ?? {};

    const expenseTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const lineTotal    = expenseLines.reduce((s, l) => s + Number(l.amount_tzs), 0);

    const previewTzs = (() => {
        const qty  = Number(lineForm.quantity) || 0;
        const up   = Number(lineForm.unit_price) || 0;
        const rate = Number(lineForm.exchange_rate) || 1;
        const amt  = qty * up;
        return lineForm.currency === 'TZS' ? amt : amt * rate;
    })();

    const addExpense = (e) => {
        e.preventDefault();
        router.post('/system/expenses', { ...expForm, trip_id: trip.id }, {
            onSuccess: () => { setShowExpForm(false); setExpForm(p => ({ ...p, description: '', amount: '', receipt_number: '', notes: '' })); }
        });
    };

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

    const confirmDelete = () => {
        if (window.confirm(`Delete ${trip.trip_number}? This cannot be undone.`)) {
            router.delete(`/system/trips/${trip.id}`);
        }
    };

    const handleStatusChange = (status) => {
        router.patch(`/system/trips/${trip.id}/status`, { status });
    };

    return (
        <DashboardLayout title={trip.trip_number}>
            <Head title={trip.trip_number} />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* ── Hero header banner ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={6}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                    🚛
                                </Box>
                                <Stack gap={2}>
                                    <Group gap={10} align="center">
                                        <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.5 }}>{trip.trip_number}</Text>
                                        <Box style={{ background: meta.color + '30', border: `1px solid ${meta.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                            <Group gap={5} align="center">
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                                                <Text size="xs" fw={700} style={{ color: '#fff' }}>{meta.label}</Text>
                                            </Group>
                                        </Box>
                                    </Group>
                                    <Group gap={6} align="center">
                                        <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{trip.route_from}</Text>
                                        <Text size="xs" c="white" fw={900}>→</Text>
                                        <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{trip.route_to}</Text>
                                        {trip.departure_date && (
                                            <>
                                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)' }}>·</Text>
                                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.65)' }}>📅 {fmtDate(trip.departure_date)}</Text>
                                            </>
                                        )}
                                    </Group>
                                </Stack>
                            </Group>
                        </Stack>

                        <Group gap={8} wrap="wrap">
                            {can('trips.edit') && (
                                <Select
                                    value={trip.status}
                                    onChange={handleStatusChange}
                                    data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                                    size="sm"
                                    styles={{
                                        input: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 10, width: 150, backdropFilter: 'blur(8px)' },
                                        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
                                    }}
                                />
                            )}
                            {can('trips.edit') && (
                                <Box component={Link} href={`/system/trips/${trip.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                            <Tooltip label="Print P&L">
                                <ActionIcon onClick={() => printPnL({ trip, expenseLines, expenseLineCategories, company })} size={38}
                                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, color: 'white', fontSize: '1rem' }}>
                                    🖨️
                                </ActionIcon>
                            </Tooltip>
                            {can('trips.delete') && (
                                <Tooltip label="Delete trip">
                                    <ActionIcon onClick={confirmDelete} size={38}
                                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, color: '#FCA5A5' }}>
                                        🗑️
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Trip info cards ── */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                {/* Trip Details */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Trip Details" icon="📋" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow icon="🆔" label="Trip #"    value={trip.trip_number}            isDark={isDark} />
                        <InfoRow icon="📍" label="From"      value={trip.route_from}              isDark={isDark} />
                        <InfoRow icon="🏁" label="To"        value={trip.route_to}                isDark={isDark} />
                        <InfoRow icon="📅" label="Departure" value={formatDate(trip.departure_date)} isDark={isDark} />
                        <InfoRow icon="🏠" label="Arrival"   value={formatDate(trip.arrival_date)}  isDark={isDark} />
                    </SectionCard>
                </motion.div>

                {/* Driver & Vehicle */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Driver & Vehicle" icon="🚛" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                        {/* Driver avatar strip */}
                        {trip.driver_name && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${divider}` }}>
                                <DriverAvatar name={trip.driver_name} />
                                <Stack gap={2}>
                                    <Text size="sm" fw={700} style={{ color: textPri }}>{trip.driver_name}</Text>
                                    <Text size="xs" style={{ color: textMut }}>Assigned Driver</Text>
                                </Stack>
                                {trip.vehicle_plate && (
                                    <Box style={{ marginLeft: 'auto', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 12px' }}>
                                        <Text size="sm" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{trip.vehicle_plate}</Text>
                                    </Box>
                                )}
                            </Box>
                        )}
                        <InfoRow icon="📦" label="Cargo"         value={trip.cargo_description}  isDark={isDark} />
                        {trip.container_number && (
                            <InfoRow icon="🔖" label="Container No" value={trip.container_number}   isDark={isDark} mono />
                        )}
                        <InfoRow icon="⚖️" label="Weight (tons)" value={trip.cargo_weight_tons}  isDark={isDark} />
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* ── Financial Summary ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <SectionCard title="Financial Summary" icon="💰" isDark={isDark} accent={['#065F46', '#059669']}>

                    {/* USD invoice strip */}
                    {trip.invoice_usd && (
                        <Box mt="md" style={{ background: isDark ? 'rgba(59,130,246,0.07)' : '#EFF6FF', border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE'}`, borderRadius: 12, padding: '14px 20px' }}>
                            <Text size="xs" fw={700} style={{ color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>💵 USD Invoice</Text>
                            <Group gap="xl" wrap="wrap">
                                <Stack gap={2}>
                                    <Text size="xs" style={{ color: textMut }}>Invoice (USD)</Text>
                                    <Text fw={800} size="lg" style={{ color: '#3B82F6' }}>$ {fmt(trip.invoice_usd)}</Text>
                                </Stack>
                                {trip.exchange_rate && (
                                    <Stack gap={2}>
                                        <Text size="xs" style={{ color: textMut }}>Exchange Rate</Text>
                                        <Text fw={700} size="sm" style={{ color: textSec }}>TZS {fmt(trip.exchange_rate)} / USD</Text>
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

                    {/* Stat mini-cards */}
                    <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm" mt="md">
                        <FinStatCard
                            label="Freight Income" icon="📈"
                            value={`TZS ${fmt(trip.freight_amount)}`}
                            grad="linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)"
                            isDark={isDark}
                        />
                        <FinStatCard
                            label="Fuel Cost" icon="⛽"
                            value={`TZS ${fmt(trip.fuel_cost)}`}
                            color="#EF4444" isDark={isDark}
                        />
                        <FinStatCard
                            label="Driver Allowance" icon="👤"
                            value={`TZS ${fmt(trip.driver_allowance)}`}
                            color="#EF4444" isDark={isDark}
                        />
                        <FinStatCard
                            label="Border Costs" icon="🛃"
                            value={`TZS ${fmt(trip.border_costs)}`}
                            color="#EF4444" isDark={isDark}
                        />
                        <FinStatCard
                            label="Other Costs" icon="📎"
                            value={`TZS ${fmt(trip.other_costs)}`}
                            color="#EF4444" isDark={isDark}
                        />
                        <FinStatCard
                            label="Total Costs" icon="🧾"
                            value={`TZS ${fmt(totalCosts)}`}
                            grad="linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)"
                            isDark={isDark}
                        />
                    </SimpleGrid>

                    {/* Net profit banner */}
                    <Box mt="md" style={{
                        background: profit >= 0 ? (isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4') : (isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2'),
                        border: `1px solid ${profit >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        borderRadius: 14, padding: '16px 20px',
                    }}>
                        <Group justify="space-between" align="center">
                            <Group gap={8}>
                                <Text size="xl">{profit >= 0 ? '📈' : '📉'}</Text>
                                <Stack gap={1}>
                                    <Text fw={700} size="sm" style={{ color: textPri }}>Net {profit >= 0 ? 'Profit' : 'Loss'}</Text>
                                    <Text size="xs" style={{ color: textMut }}>After all deductions</Text>
                                </Stack>
                            </Group>
                            <Text fw={900} size="xl" style={{ color: profit >= 0 ? '#22C55E' : '#EF4444' }}>
                                {profit < 0 ? '- ' : ''}TZS {fmt(Math.abs(profit))}
                            </Text>
                        </Group>
                    </Box>
                </SectionCard>
            </motion.div>

            {/* Notes */}
            {trip.notes && (
                <Box mt="md">
                    <SectionCard title="Notes" icon="📝" isDark={isDark}>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{trip.notes}</Text>
                    </SectionCard>
                </Box>
            )}

            {/* ── P&L Summary (expense lines) ── */}
            {expenseLines.length > 0 && (() => {
                const lineTotalTzs = expenseLines.reduce((s, l) => s + Number(l.amount_tzs), 0);
                const pnlProfit = income - lineTotalTzs;
                const grouped = {};
                expenseLines.forEach(l => {
                    const cat = expenseLineCategories[l.category] ?? { label: l.category, icon: '📋' };
                    grouped[l.category] = grouped[l.category] ?? { icon: cat.icon, label: cat.label, total: 0 };
                    grouped[l.category].total += Number(l.amount_tzs);
                });
                return (
                    <Box mt="md">
                        <SectionCard
                            title="P&L Summary" icon="📈" isDark={isDark}
                            toolbar={
                                <Box component="button" onClick={() => printPnL({ trip, expenseLines, expenseLineCategories, company })}
                                    style={{ padding: '5px 14px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                                    🖨 Print P&L
                                </Box>
                            }
                        >
                            <Box style={{ padding: '4px 0 8px' }}>
                                <Text size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6, marginTop: 8 }}>Income</Text>
                                <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${divider}`, marginBottom: 12 }}>
                                    <Text size="sm" style={{ color: textSec }}>{trip.invoice_tzs ? 'Invoice (TZS)' : 'Freight Amount'}</Text>
                                    <Text size="sm" fw={700} style={{ color: '#22C55E' }}>TZS {fmt(income)}</Text>
                                </Box>
                                <Text size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6 }}>Expenses</Text>
                                {Object.values(grouped).map(g => (
                                    <Box key={g.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${divider}` }}>
                                        <Group gap={7}><Text size="xs">{g.icon}</Text><Text size="sm" style={{ color: textSec }}>{g.label}</Text></Group>
                                        <Text size="sm" style={{ color: '#EF4444' }}>TZS {fmt(g.total)}</Text>
                                    </Box>
                                ))}
                                <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 2, borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}` }}>
                                    <Text size="sm" fw={700} style={{ color: textPri }}>Total Expenses</Text>
                                    <Text size="sm" fw={700} style={{ color: '#EF4444' }}>TZS {fmt(lineTotalTzs)}</Text>
                                </Box>
                                <Box mt="md" style={{
                                    background: pnlProfit >= 0 ? (isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4') : (isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2'),
                                    border: `1px solid ${pnlProfit >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                                    borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <Text fw={700} size="sm" style={{ color: textPri }}>Net {pnlProfit >= 0 ? 'Profit' : 'Loss'}</Text>
                                    <Text fw={900} size="xl" style={{ color: pnlProfit >= 0 ? '#22C55E' : '#EF4444' }}>
                                        TZS {fmt(Math.abs(pnlProfit))}{pnlProfit < 0 ? ' (Loss)' : ''}
                                    </Text>
                                </Box>
                            </Box>
                        </SectionCard>
                    </Box>
                );
            })()}

            {/* ── Trip Expenses ── */}
            <Box mt="md">
                <SectionCard
                    title="Trip Expenses" icon="💸" isDark={isDark}
                    toolbar={
                        <Group gap={8}>
                            {expenses.length > 0 && (
                                <Box style={{ background: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '2px 10px' }}>
                                    <Text size="xs" fw={700} style={{ color: '#EF4444' }}>{fmt(expenseTotal)} TZS</Text>
                                </Box>
                            )}
                            <Box component="button" type="button" onClick={() => setShowExpForm(v => !v)}
                                style={{ padding: '5px 14px', borderRadius: 8, background: showExpForm ? 'transparent' : 'linear-gradient(135deg,#1565C0,#2196F3)', color: showExpForm ? textMut : '#fff', border: showExpForm ? `1px solid ${cardBorder}` : 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                                {showExpForm ? 'Cancel' : '＋ Add'}
                            </Box>
                        </Group>
                    }
                >
                    {showExpForm && (
                        <Box style={{ padding: '12px 0 16px', borderBottom: `1px solid ${divider}`, marginBottom: 4 }}>
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
                        <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Text size="2rem" style={{ marginBottom: 8 }}>💸</Text>
                            <Text size="sm" style={{ color: textMut }}>No expenses recorded for this trip yet.</Text>
                        </Box>
                    ) : (
                        <Box>
                            {expenses.map((exp, i) => {
                                const cat = expenseCategories[exp.category] ?? { icon: '📦', label: exp.category };
                                return (
                                    <Group key={exp.id} justify="space-between" style={{ padding: '12px 0', borderBottom: i < expenses.length - 1 ? `1px solid ${divider}` : 'none' }}>
                                        <Group gap={10}>
                                            <Box style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                                {cat.icon}
                                            </Box>
                                            <Stack gap={2}>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{exp.description}</Text>
                                                <Text size="xs" style={{ color: textMut }}>{cat.label} · {new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Text>
                                            </Stack>
                                        </Group>
                                        <Text fw={700} size="sm" style={{ color: '#EF4444' }}>{exp.currency} {fmt(exp.amount)}</Text>
                                    </Group>
                                );
                            })}
                            <Group justify="flex-end" style={{ paddingTop: 12, borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}` }}>
                                <Text size="sm" fw={800} style={{ color: textPri }}>Total: <span style={{ color: '#EF4444' }}>TZS {fmt(expenseTotal)}</span></Text>
                            </Group>
                        </Box>
                    )}
                </SectionCard>
            </Box>

            {/* ── P&L Expense Lines worksheet ── */}
            <Box mt="md">
                <SectionCard
                    title="P&L Expense Lines" icon="📊" isDark={isDark}
                    toolbar={
                        <Group gap={8}>
                            {lineTotal > 0 && (
                                <Text size="xs" fw={700} style={{ color: '#EF4444' }}>TZS {fmt(lineTotal)}</Text>
                            )}
                            {can('trips.edit') && (
                                <Box component="button" type="button" onClick={() => setShowLineForm(v => !v)}
                                    style={{ padding: '5px 14px', borderRadius: 8, background: showLineForm ? 'transparent' : 'linear-gradient(135deg,#1565C0,#2196F3)', border: showLineForm ? `1px solid ${cardBorder}` : 'none', color: showLineForm ? textSec : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                                    {showLineForm ? 'Cancel' : '＋ Add Line'}
                                </Box>
                            )}
                        </Group>
                    }
                >
                    {showLineForm && (
                        <Box style={{ padding: '12px 0 16px', borderBottom: `1px solid ${divider}` }}>
                            <form onSubmit={addLine}>
                                <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm" mb="sm">
                                    <Select label="Category" required value={lineForm.category}
                                        onChange={v => setLineForm(p => ({ ...p, category: v ?? 'other' }))}
                                        data={Object.entries(expenseLineCategories).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))}
                                        styles={{ ...lineInputStyles, dropdown: dropdownStyle }} />
                                    <TextInput label="Description" placeholder="e.g. Fuel Dar–Lusaka"
                                        value={lineForm.description} onChange={e => setLineForm(p => ({ ...p, description: e.target.value }))}
                                        styles={lineInputStyles} />
                                    <NumberInput label="Quantity" required min={0.001} step={0.5}
                                        value={lineForm.quantity} onChange={v => setLineForm(p => ({ ...p, quantity: v }))}
                                        styles={lineInputStyles} thousandSeparator="," />
                                    <NumberInput label="Unit Price" required min={0}
                                        value={lineForm.unit_price} onChange={v => setLineForm(p => ({ ...p, unit_price: v }))}
                                        styles={lineInputStyles} thousandSeparator="," />
                                    <Select label="Currency" required value={lineForm.currency}
                                        onChange={v => setLineForm(p => ({ ...p, currency: v ?? 'TZS' }))}
                                        data={expenseLineCurrencies.map(c => ({ value: c, label: c }))}
                                        styles={{ ...lineInputStyles, dropdown: dropdownStyle }} />
                                    {lineForm.currency !== 'TZS' && (
                                        <NumberInput label="Rate (TZS/1)" min={0}
                                            value={lineForm.exchange_rate} onChange={v => setLineForm(p => ({ ...p, exchange_rate: v }))}
                                            styles={lineInputStyles} thousandSeparator="," />
                                    )}
                                </SimpleGrid>
                                {previewTzs > 0 && (
                                    <Text size="xs" style={{ color: '#3B82F6', marginBottom: 8 }}>
                                        Preview: TZS {new Intl.NumberFormat('en-TZ').format(Math.round(previewTzs))}
                                    </Text>
                                )}
                                <Box component="button" type="submit" style={{ padding: '7px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                                    Save Line
                                </Box>
                            </form>
                        </Box>
                    )}

                    {expenseLines.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Text size="sm" style={{ color: textMut }}>No expense lines yet. Add lines to build the P&L.</Text>
                        </Box>
                    ) : (
                        <Box style={{ overflowX: 'auto' }}>
                            <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 110px 70px 90px 130px 36px', padding: '8px 0', borderBottom: `1px solid ${divider}`, background: headBg, margin: '0 -20px', padding: '8px 20px' }}>
                                {['Category', 'Description', 'Qty', 'Unit Price', 'Curr', 'Rate', 'TZS Amt', ''].map(h => (
                                    <Text key={h} size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</Text>
                                ))}
                            </Box>
                            {expenseLines.map((line, i) => {
                                const cat = expenseLineCategories[line.category] ?? { icon: '📋', label: line.category };
                                return (
                                    <Box key={line.id}
                                        style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 110px 70px 90px 130px 36px', padding: '10px 0', borderBottom: i < expenseLines.length - 1 ? `1px solid ${divider}` : 'none', alignItems: 'center' }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
                                                <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444', opacity: 0.7 }} onClick={() => deleteLine(line.id)}>🗑</ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Box>
                                );
                            })}
                            <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 110px 70px 90px 130px 36px', padding: '12px 0', borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}` }}>
                                <Text size="xs" fw={800} style={{ color: textMut, textTransform: 'uppercase', gridColumn: '1 / 7' }}>Total</Text>
                                <Text size="sm" fw={800} style={{ color: '#EF4444' }}>TZS {fmt(lineTotal)}</Text>
                                <Box />
                            </Box>
                        </Box>
                    )}
                </SectionCard>
            </Box>

            <Box mt="xl">
                <Box component={Link} href="/system/trips"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Trips
                </Box>
            </Box>
        </DashboardLayout>
    );
}

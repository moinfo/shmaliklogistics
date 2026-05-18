import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

const fmt  = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function ageBandColor(days) {
    if (days <= 0)  return '#22C55E';
    if (days <= 30) return '#F59E0B';
    if (days <= 60) return '#F97316';
    if (days <= 90) return '#EF4444';
    return '#B91C1C';
}

function AgeBadge({ days }) {
    const color = ageBandColor(days);
    const label = days <= 0 ? 'Current' : `${days}d`;
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '1A', border: `1px solid ${color}44`, borderRadius: 20, padding: '2px 8px' }}>
            <Text size="xs" fw={700} style={{ color }}>{label}</Text>
        </Box>
    );
}

function buildPrintHtml(debtors, totals) {
    const rows = debtors.flatMap(d =>
        d.invoices.map(inv => {
            const ageLabel = inv.days_overdue > 0 ? `${inv.days_overdue}d` : 'Current';
            return `<tr>
                <td>${d.client_name}${d.client_company ? `<br><small>${d.client_company}</small>` : ''}</td>
                <td>${inv.document_number}</td>
                <td>${fmtD(inv.issue_date)}</td>
                <td>${fmtD(inv.due_date)}</td>
                <td style="text-align:right">${inv.currency} ${fmt(inv.total)}</td>
                <td style="text-align:right">${fmt(inv.amount_paid)}</td>
                <td style="text-align:right;font-weight:700;color:#dc2626">${fmt(inv.balance_due)}</td>
                <td style="text-align:center">${ageLabel}</td>
            </tr>`;
        })
    ).join('');

    const generated = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `<!doctype html><html><head><title>Debtors Report</title>
    <style>
        body{font-family:sans-serif;font-size:12px;padding:24px;color:#1e293b}
        h2{margin:0 0 4px}p{margin:0 0 16px;color:#64748b}
        table{width:100%;border-collapse:collapse}
        th{background:#f1f5f9;padding:8px 10px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
        td{padding:8px 10px;border-bottom:1px solid #f1f5f9}
        tfoot td{font-weight:700;background:#f8fafc;border-top:2px solid #e2e8f0}
        @media print{@page{margin:16mm}}
    </style></head><body>
    <h2>Debtors Report — Outstanding AR</h2>
    <p>Generated ${generated}</p>
    <table>
        <thead><tr>
            <th>Client</th><th>Invoice #</th><th>Issue Date</th><th>Due Date</th>
            <th style="text-align:right">Invoice Amt</th>
            <th style="text-align:right">Paid</th>
            <th style="text-align:right">Balance</th>
            <th style="text-align:center">Age</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr>
            <td colspan="6" style="text-align:right">Total Outstanding AR</td>
            <td style="text-align:right;color:#dc2626">TZS ${fmt(totals.total_ar)}</td>
            <td></td>
        </tr></tfoot>
    </table>
    </body></html>`;
}

function printDebtors(debtors, totals) {
    const html = buildPrintHtml(debtors, totals);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) {
        win.addEventListener('load', () => {
            win.print();
            URL.revokeObjectURL(url);
        });
    }
}

export default function DebtorsIndex({ debtors, totals, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const cardBg     = isDark ? dk.card    : '#ffffff';
    const cardBorder = isDark ? dk.border  : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const rowHov     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [search, setSearch]     = useState(filters.search ?? '');
    const [age, setAge]           = useState(filters.age ?? '');
    const [expanded, setExpanded] = useState({});

    const applyFilters = (s, a) =>
        router.get('/system/billing/debtors', { search: s, age: a }, { preserveState: true, replace: true });

    const toggleRow = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const ageBands = [
        { value: '',       label: 'All ages' },
        { value: 'future', label: 'Current (not yet due)' },
        { value: '30',     label: '1–30 days overdue' },
        { value: '60',     label: '31–60 days overdue' },
        { value: '90',     label: '61–90 days overdue' },
        { value: '90+',    label: '90+ days overdue' },
    ];

    const agingBars = [
        { label: '1–30d',  value: totals.overdue_30,  color: '#F59E0B' },
        { label: '31–60d', value: totals.overdue_60,  color: '#F97316' },
        { label: '61–90d', value: totals.overdue_90,  color: '#EF4444' },
        { label: '90d+',   value: totals.overdue_90p, color: '#B91C1C' },
    ];
    const maxBand = Math.max(...agingBars.map(b => b.value), 1);

    return (
        <DashboardLayout title="Debtors">
            <Head title="Debtors" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Debtors / Outstanding AR</Text>
                    <Text size="sm" style={{ color: textSec }}>{totals.debtor_count} client{totals.debtor_count !== 1 ? 's' : ''} with outstanding balances</Text>
                </Stack>
                <Group gap="sm">
                    <Box
                        component="button"
                        onClick={() => printDebtors(debtors, totals)}
                        style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                        🖨 Print Report
                    </Box>
                    <Box
                        component={Link}
                        href="/system/billing/invoices"
                        style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}
                    >
                        Invoices →
                    </Box>
                </Group>
            </Group>

            {/* Summary stat cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {[
                    { label: 'Total AR',      value: `TZS ${fmt(totals.total_ar)}`,    icon: '💰', color: '#EF4444' },
                    { label: 'Debtors',       value: totals.debtor_count,               icon: '🏢', color: textPri },
                    { label: '1–30d Overdue', value: `TZS ${fmt(totals.overdue_30)}`,  icon: '⚠️', color: '#F59E0B' },
                    { label: '90d+ Overdue',  value: `TZS ${fmt(totals.overdue_90p)}`, icon: '🔴', color: '#B91C1C' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                            <Text style={{ fontSize: '1.3rem', marginBottom: 4 }}>{s.icon}</Text>
                            <Text fw={800} size="md" style={{ color: s.color }}>{s.value}</Text>
                            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Aging analysis bars */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
                <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 14 }}>Aging Analysis</Text>
                <Stack gap={10}>
                    {agingBars.map(b => (
                        <Box key={b.label}>
                            <Group justify="space-between" mb={4}>
                                <Text size="xs" style={{ color: textSec }}>{b.label}</Text>
                                <Text size="xs" fw={700} style={{ color: b.color }}>TZS {fmt(b.value)}</Text>
                            </Group>
                            <Box style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                                <Box style={{ height: '100%', width: `${(b.value / maxBand) * 100}%`, background: b.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* Filters */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search client name…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(search, age)}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri } }}
                    />
                    <Select
                        placeholder="All ages"
                        value={age}
                        onChange={v => { setAge(v ?? ''); applyFilters(search, v ?? ''); }}
                        clearable
                        data={ageBands}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        w={220}
                    />
                    <Box
                        component="button"
                        onClick={() => applyFilters(search, age)}
                        style={{ padding: '8px 18px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                    >
                        Search
                    </Box>
                </Group>
            </Box>

            {/* Debtor rows */}
            {debtors.length === 0 ? (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '60px 0', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</Text>
                    <Text fw={700} style={{ color: textPri }}>No outstanding balances</Text>
                    <Text size="sm" style={{ color: textMut }}>All invoices are settled</Text>
                </Box>
            ) : (
                <Stack gap="sm">
                    {debtors.map((d, di) => (
                        <motion.div key={d.client_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.04 }}>
                            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>

                                {/* Client summary row — click to expand */}
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px 140px 90px', gap: 0, padding: '14px 20px', cursor: 'pointer', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    onClick={() => toggleRow(d.client_id)}
                                >
                                    <Stack gap={1}>
                                        <Text fw={700} size="sm" style={{ color: textPri }}>{d.client_name}</Text>
                                        {d.client_company && <Text size="xs" style={{ color: textMut }}>{d.client_company}</Text>}
                                        <Text size="xs" style={{ color: textSec }}>{d.invoices.length} invoice{d.invoices.length !== 1 ? 's' : ''}</Text>
                                    </Stack>
                                    <Stack gap={1}>
                                        <Text size="xs" style={{ color: textMut }}>Invoiced</Text>
                                        <Text size="sm" fw={600} style={{ color: textSec }}>TZS {fmt(d.total_invoiced)}</Text>
                                    </Stack>
                                    <Stack gap={1}>
                                        <Text size="xs" style={{ color: textMut }}>Paid</Text>
                                        <Text size="sm" fw={600} style={{ color: '#22C55E' }}>TZS {fmt(d.total_paid)}</Text>
                                    </Stack>
                                    <Stack gap={1}>
                                        <Text size="xs" style={{ color: textMut }}>Balance Due</Text>
                                        <Text size="sm" fw={800} style={{ color: '#EF4444' }}>TZS {fmt(d.balance_due)}</Text>
                                    </Stack>
                                    <Group gap={8} align="center">
                                        <AgeBadge days={d.max_days} />
                                        <Text size="sm" style={{ color: textMut }}>{expanded[d.client_id] ? '▲' : '▼'}</Text>
                                    </Group>
                                </Box>

                                {/* Expandable invoice breakdown */}
                                <AnimatePresence>
                                    {expanded[d.client_id] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <Box style={{ borderTop: `1px solid ${divider}`, background: isDark ? 'rgba(255,255,255,0.015)' : '#F8FAFC' }}>
                                                <Box style={{ display: 'grid', gridTemplateColumns: '130px 100px 100px 1fr 120px 120px 130px 90px', padding: '8px 20px 8px 36px', borderBottom: `1px solid ${divider}` }}>
                                                    {['Invoice #', 'Issued', 'Due', 'Trip', 'Invoice Amt', 'Paid', 'Balance', 'Age'].map(h => (
                                                        <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</Text>
                                                    ))}
                                                </Box>
                                                {d.invoices.map((inv, ii) => (
                                                    <Box
                                                        key={inv.id}
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '130px 100px 100px 1fr 120px 120px 130px 90px',
                                                            padding: '10px 20px 10px 36px',
                                                            borderBottom: ii < d.invoices.length - 1 ? `1px solid ${divider}` : 'none',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.12s',
                                                        }}
                                                        onClick={() => router.visit(`/system/billing/invoices/${inv.id}`)}
                                                        onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Text size="sm" fw={700} style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{inv.document_number}</Text>
                                                        <Text size="sm" style={{ color: textSec }}>{fmtD(inv.issue_date)}</Text>
                                                        <Text size="sm" style={{ color: inv.days_overdue > 0 ? '#EF4444' : textSec }}>{fmtD(inv.due_date)}</Text>
                                                        <Text size="sm" style={{ color: textMut }}>{inv.trip_number ?? '—'}</Text>
                                                        <Text size="sm" style={{ color: textSec }}>{inv.currency} {fmt(inv.total)}</Text>
                                                        <Text size="sm" style={{ color: '#22C55E' }}>{fmt(inv.amount_paid)}</Text>
                                                        <Text size="sm" fw={700} style={{ color: '#EF4444' }}>{fmt(inv.balance_due)}</Text>
                                                        <AgeBadge days={inv.days_overdue} />
                                                    </Box>
                                                ))}
                                            </Box>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Box>
                        </motion.div>
                    ))}
                </Stack>
            )}

            {/* Footer total row */}
            {debtors.length > 0 && (
                <Box mt="md" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px' }}>
                    <Group justify="flex-end" gap="xl">
                        <Text fw={700} size="sm" style={{ color: textSec }}>Total Outstanding AR</Text>
                        <Text fw={900} size="xl" style={{ color: '#EF4444' }}>TZS {fmt(totals.total_ar)}</Text>
                    </Group>
                </Box>
            )}
        </DashboardLayout>
    );
}

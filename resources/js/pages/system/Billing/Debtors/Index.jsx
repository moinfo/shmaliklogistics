import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

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
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: `1px solid ${color}35`, borderRadius: 20, padding: '3px 10px' }}>
            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
            <Text size="xs" fw={700} style={{ color }}>{label}</Text>
        </Box>
    );
}

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
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
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

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

    const statCards = [
        {
            icon: '💰', label: 'Total AR', value: 'TZS', valueSub: ` ${fmt(totals.total_ar)}`,
            grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)',
            glow: '0 8px 28px rgba(239,68,68,0.4)',
        },
        {
            icon: '🏢', label: 'Debtors', value: String(totals.debtor_count),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '⚠️', label: '1–30d Overdue', value: 'TZS', valueSub: ` ${fmt(totals.overdue_30)}`,
            grad: 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)',
            glow: '0 8px 28px rgba(245,158,11,0.4)',
        },
        {
            icon: '🔴', label: '90d+ Overdue', value: 'TZS', valueSub: ` ${fmt(totals.overdue_90p)}`,
            grad: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 60%, #B91C1C 100%)',
            glow: '0 8px 28px rgba(185,28,28,0.4)',
        },
    ];

    return (
        <DashboardLayout title="Debtors">
            <Head title="Debtors" />

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={4}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏦</Box>
                                <Stack gap={1}>
                                    <Text fw={900} size="lg" c="white">Debtors / Outstanding AR</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                        {totals.debtor_count} client{totals.debtor_count !== 1 ? 's' : ''} with outstanding balances
                                    </Text>
                                </Stack>
                            </Group>
                        </Stack>
                        <Group gap={10}>
                            <Box component={Link} href="/system/billing/invoices"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                Invoices →
                            </Box>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Box component="button" onClick={() => printDebtors(debtors, totals)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    🖨 Print Report
                                </Box>
                            </motion.div>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: s.valueSub ? '1.4rem' : '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>
                                {s.value}
                                {s.valueSub && <Text component="span" fw={500} style={{ fontSize: '0.85rem', opacity: 0.75 }}>{s.valueSub}</Text>}
                            </Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Aging analysis */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '18px 20px', boxShadow: cardShadow }}>
                <Group gap={8} mb={16}>
                    <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                    <Text fw={700} size="sm" style={{ color: textPri }}>Aging Analysis</Text>
                </Group>
                <Stack gap={12}>
                    {agingBars.map((b, i) => (
                        <motion.div key={b.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                            <Group justify="space-between" mb={5}>
                                <Group gap={8}>
                                    <Box style={{ width: 10, height: 10, borderRadius: '50%', background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
                                    <Text size="xs" fw={600} style={{ color: textSec }}>{b.label}</Text>
                                </Group>
                                <Text size="xs" fw={700} style={{ color: b.color }}>TZS {fmt(b.value)}</Text>
                            </Group>
                            <Box style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(b.value / maxBand) * 100}%` }}
                                    transition={{ duration: 0.7, delay: i * 0.08 }}
                                    style={{ height: '100%', background: b.color, borderRadius: 4 }}
                                />
                            </Box>
                        </motion.div>
                    ))}
                </Stack>
            </Box>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search client name…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(search, age)}
                        leftSection={<Text size="sm">🔍</Text>}
                        style={{ flex: 1 }}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                        }}
                    />
                    <Select
                        placeholder="All ages"
                        value={age}
                        onChange={v => { setAge(v ?? ''); applyFilters(search, v ?? ''); }}
                        clearable
                        data={ageBands}
                        w={220}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
                        }}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters(search, age)} size={38} radius={10}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Debtor rows */}
            {debtors.length === 0 ? (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '72px 0', textAlign: 'center', boxShadow: cardShadow }}>
                    <Box style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: isDark ? 'rgba(34,197,94,0.1)' : '#F0FDF4',
                        border: '2px dashed rgba(34,197,94,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.4rem', margin: '0 auto 20px',
                    }}>
                        ✅
                    </Box>
                    <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No outstanding balances</Text>
                    <Text size="sm" style={{ color: textMut }}>All invoices are settled</Text>
                </Box>
            ) : (
                <Stack gap="sm">
                    {debtors.map((d, di) => (
                        <motion.div key={d.client_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.04 }}>
                            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                                {/* Client summary row */}
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: '1fr 145px 145px 160px 110px',
                                        gap: 0, padding: '16px 20px', cursor: 'pointer',
                                        transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                        alignItems: 'center',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = rowHov;
                                        e.currentTarget.style.borderLeft = `3px solid ${ageBandColor(d.max_days)}`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderLeft = '3px solid transparent';
                                    }}
                                    onClick={() => toggleRow(d.client_id)}>

                                    <Stack gap={2}>
                                        <Text fw={700} size="sm" style={{ color: textPri }}>{d.client_name}</Text>
                                        {d.client_company && <Text size="xs" style={{ color: textSec }}>{d.client_company}</Text>}
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderRadius: 5, padding: '2px 8px', width: 'fit-content' }}>
                                            <Text size="10px" fw={600} style={{ color: textMut }}>{d.invoices.length} invoice{d.invoices.length !== 1 ? 's' : ''}</Text>
                                        </Box>
                                    </Stack>

                                    <Stack gap={2}>
                                        <Text size="10px" fw={600} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.6 }}>Invoiced</Text>
                                        <Text size="sm" fw={600} style={{ color: textSec, fontVariantNumeric: 'tabular-nums' }}>TZS {fmt(d.total_invoiced)}</Text>
                                    </Stack>

                                    <Stack gap={2}>
                                        <Text size="10px" fw={600} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.6 }}>Paid</Text>
                                        <Text size="sm" fw={700} style={{ color: '#22C55E', fontVariantNumeric: 'tabular-nums' }}>TZS {fmt(d.total_paid)}</Text>
                                    </Stack>

                                    <Stack gap={2}>
                                        <Text size="10px" fw={600} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.6 }}>Balance Due</Text>
                                        <Text size="sm" fw={800} style={{ color: '#EF4444', fontVariantNumeric: 'tabular-nums' }}>TZS {fmt(d.balance_due)}</Text>
                                    </Stack>

                                    <Group gap={8} align="center">
                                        <AgeBadge days={d.max_days} />
                                        <Text size="sm" style={{ color: textMut, transition: 'transform 0.2s', display: 'block', transform: expanded[d.client_id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</Text>
                                    </Group>
                                </Box>

                                {/* Expandable invoice breakdown */}
                                <AnimatePresence>
                                    {expanded[d.client_id] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.22 }}
                                            style={{ overflow: 'hidden' }}>
                                            <Box style={{ borderTop: `1px solid ${divider}`, background: isDark ? 'rgba(255,255,255,0.015)' : '#F8FAFC' }}>

                                                {/* Sub-head */}
                                                <Box style={{ display: 'grid', gridTemplateColumns: '140px 100px 100px 1fr 130px 120px 140px 100px', padding: '9px 20px 9px 36px', borderBottom: `1px solid ${divider}`, background: headBg }}>
                                                    {['Invoice #', 'Issued', 'Due', 'Trip', 'Invoice Amt', 'Paid', 'Balance', 'Age'].map(h => (
                                                        <Text key={h} size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</Text>
                                                    ))}
                                                </Box>

                                                {d.invoices.map((inv, ii) => (
                                                    <motion.div key={inv.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ii * 0.04 }}>
                                                        <Box
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: '140px 100px 100px 1fr 130px 120px 140px 100px',
                                                                padding: '11px 20px 11px 36px',
                                                                borderBottom: ii < d.invoices.length - 1 ? `1px solid ${divider}` : 'none',
                                                                cursor: 'pointer', alignItems: 'center',
                                                                transition: 'background 0.12s',
                                                            }}
                                                            onClick={() => router.visit(`/system/billing/invoices/${inv.id}`)}
                                                            onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                                            {/* Invoice # */}
                                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '3px 9px', width: 'fit-content' }}>
                                                                <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{inv.document_number}</Text>
                                                            </Box>

                                                            <Text size="sm" style={{ color: textSec }}>{fmtD(inv.issue_date)}</Text>
                                                            <Text size="sm" style={{ color: inv.days_overdue > 0 ? '#EF4444' : textSec }}>{fmtD(inv.due_date)}</Text>
                                                            <Text size="sm" style={{ color: textMut }}>{inv.trip_number ?? '—'}</Text>
                                                            <Text size="sm" style={{ color: textSec, fontVariantNumeric: 'tabular-nums' }}>{inv.currency} {fmt(inv.total)}</Text>
                                                            <Text size="sm" fw={600} style={{ color: '#22C55E', fontVariantNumeric: 'tabular-nums' }}>{fmt(inv.amount_paid)}</Text>
                                                            <Text size="sm" fw={700} style={{ color: '#EF4444', fontVariantNumeric: 'tabular-nums' }}>{fmt(inv.balance_due)}</Text>
                                                            <AgeBadge days={inv.days_overdue} />
                                                        </Box>
                                                    </motion.div>
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

            {/* Footer total */}
            {debtors.length > 0 && (
                <Box mt="md" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '16px 24px', boxShadow: cardShadow }}>
                    <Group justify="space-between" align="center">
                        <Group gap={8}>
                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
                            <Text fw={700} size="sm" style={{ color: textSec }}>Total Outstanding AR</Text>
                        </Group>
                        <Text fw={900} size="xl" style={{ color: '#EF4444' }}>TZS {fmt(totals.total_ar)}</Text>
                    </Group>
                </Box>
            )}
        </DashboardLayout>
    );
}

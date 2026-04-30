import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, Badge, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const fmt = (n, cur = 'TZS') => `${cur} ${new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0))}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ProformasIndex({ proformas, stats, statuses, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover   = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters = (overrides = {}) =>
        router.get('/system/billing/proformas', { search, status, ...overrides }, { preserveState: true, replace: true });

    return (
        <DashboardLayout title="Proforma Invoices">
            <Head title="Proforma Invoices" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Proforma Invoices</Text>
                    <Text size="sm" style={{ color: textSec }}>Pre-invoices issued before service</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/billing/proformas/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        + New Proforma
                    </Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {[
                    { label: 'Total', value: stats.total, icon: '📋', color: textPri },
                    { label: 'Draft', value: stats.draft, icon: '📝', color: '#94A3B8' },
                    { label: 'Sent', value: stats.sent, icon: '📤', color: '#60A5FA' },
                    { label: 'Accepted', value: stats.accepted, icon: '✅', color: '#22C55E' },
                ].map(s => (
                    <Box key={s.label} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px' }}>
                        <Group gap={10}><Text style={{ fontSize: 22 }}>{s.icon}</Text><div><Text size="xl" fw={800} style={{ color: s.color, lineHeight: 1 }}>{s.value}</Text><Text size="xs" style={{ color: textSec }}>{s.label}</Text></div></Group>
                    </Box>
                ))}
            </SimpleGrid>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput placeholder="Search number, client…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters({ search })} style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 } }} />
                    <Select placeholder="All statuses" value={status} onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }} clearable style={{ width: 160 }}
                        data={[{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))]}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} />
                    <Box component="button" onClick={() => applyFilters({ search })} style={{ padding: '8px 18px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Search</Box>
                </Group>
            </Box>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['Proforma #', 'Client', 'Issue Date', 'Due Date', 'Total', 'Status', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {proformas.data.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: textSec }}>No proforma invoices found.</td></tr>
                            ) : proformas.data.map(p => (
                                <tr key={p.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 16px' }}><Text fw={700} size="sm" style={{ color: '#A78BFA', fontFamily: 'monospace' }}>{p.document_number}</Text></td>
                                    <td style={{ padding: '14px 16px' }}><Text size="sm" fw={600} style={{ color: textPri }}>{p.client?.name}</Text>{p.client?.company_name && <Text size="xs" style={{ color: textSec }}>{p.client.company_name}</Text>}</td>
                                    <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: textSec }}>{fmtDate(p.issue_date)}</Text></td>
                                    <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: textSec }}>{fmtDate(p.due_date)}</Text></td>
                                    <td style={{ padding: '14px 16px' }}><Text size="sm" fw={700} style={{ color: textPri }}>{fmt(p.total, p.currency)}</Text></td>
                                    <td style={{ padding: '14px 16px' }}><Badge size="sm" style={{ background: statuses[p.status]?.color + '22', color: statuses[p.status]?.color, border: `1px solid ${statuses[p.status]?.color}44` }}>{statuses[p.status]?.label}</Badge></td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon component={Link} href={`/system/billing/proformas/${p.id}`} variant="subtle" size="sm" style={{ color: '#3B82F6' }}>👁</ActionIcon>
                                            <ActionIcon component={Link} href={`/system/billing/proformas/${p.id}/edit`} variant="subtle" size="sm" style={{ color: textSec }}>✏️</ActionIcon>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {proformas.last_page > 1 && (
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={proformas.last_page} value={proformas.current_page} onChange={p => router.get('/system/billing/proformas', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

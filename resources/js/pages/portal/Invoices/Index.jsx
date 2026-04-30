import PortalLayout from '../../../layouts/PortalLayout';
import { Box, Text, Group, Stack, Grid, Select } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColor = {
    draft: '#94A3B8', sent: '#2196F3', paid: '#22C55E',
    overdue: '#EF4444', partial: '#F59E0B', cancelled: '#475569',
};

export default function PortalInvoicesIndex({ client, invoices, summary, filters }) {
    const [status, setStatus] = useState(filters.status || '');
    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));

    const applyFilter = (val) => {
        setStatus(val);
        router.get('/portal/invoices', val ? { status: val } : {}, { preserveState: true, replace: true });
    };

    const statuses = [
        { value: '', label: 'All' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'partial', label: 'Partial' },
    ];

    return (
        <PortalLayout title="Invoices">
            {/* Summary cards */}
            <Grid mb="xl" gutter="md">
                {[
                    { label: 'Total Billed', value: `TZS ${fmt(summary.total_billed)}`, color: '#94A3B8', icon: '📊' },
                    { label: 'Total Paid', value: `TZS ${fmt(summary.total_paid)}`, color: '#22C55E', icon: '✅' },
                    { label: 'Balance Due', value: `TZS ${fmt(summary.balance_due)}`, color: '#F59E0B', icon: '⚠️' },
                ].map(s => (
                    <Grid.Col key={s.label} span={{ base: 12, sm: 4 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '18px 22px' }}>
                            <Group gap="sm" mb={6}>
                                <Text style={{ fontSize: '1.2rem' }}>{s.icon}</Text>
                                <Text size="sm" style={{ color: '#64748B' }}>{s.label}</Text>
                            </Group>
                            <Text fw={800} size="lg" style={{ color: s.color }}>{s.value}</Text>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Filter */}
            <Group mb="lg">
                <Select
                    placeholder="All statuses"
                    value={status}
                    onChange={applyFilter}
                    data={statuses}
                    style={{ width: 160 }}
                    styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                />
                <Text size="sm" style={{ color: '#64748B' }}>{invoices.total} invoices</Text>
            </Group>

            {/* Invoice list */}
            <Stack gap="sm">
                {invoices.data.map(inv => {
                    const sc = statusColor[inv.status] || '#94A3B8';
                    return (
                        <Box
                            key={inv.id}
                            component={Link}
                            href={`/portal/invoices/${inv.id}`}
                            style={{
                                display: 'block', padding: '18px 22px', borderRadius: 12,
                                background: 'var(--c-card)', border: '1px solid var(--c-border-color)',
                                textDecoration: 'none', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(33,150,243,0.35)'; e.currentTarget.style.background = '#132436'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border-color)'; e.currentTarget.style.background = '#0F1E32'; }}
                        >
                            <Group justify="space-between" mb={8}>
                                <Text fw={800} style={{ color: 'var(--c-text)' }}>{inv.document_number}</Text>
                                <Box style={{ padding: '3px 12px', borderRadius: 12, background: `${sc}22`, border: `1px solid ${sc}55` }}>
                                    <Text size="xs" fw={700} style={{ color: sc, textTransform: 'capitalize' }}>{inv.status}</Text>
                                </Box>
                            </Group>
                            <Group justify="space-between">
                                <Box>
                                    <Text size="xs" style={{ color: '#475569' }}>Total</Text>
                                    <Text fw={700} style={{ color: 'var(--c-text)' }}>TZS {fmt(inv.total)}</Text>
                                </Box>
                                {inv.balance_due > 0 && (
                                    <Box style={{ textAlign: 'right' }}>
                                        <Text size="xs" style={{ color: '#475569' }}>Balance Due</Text>
                                        <Text fw={700} style={{ color: '#F59E0B' }}>TZS {fmt(inv.balance_due)}</Text>
                                    </Box>
                                )}
                                <Box style={{ textAlign: 'right' }}>
                                    <Text size="xs" style={{ color: '#475569' }}>Date</Text>
                                    <Text size="sm" style={{ color: '#94A3B8' }}>{inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : '—'}</Text>
                                </Box>
                            </Group>
                        </Box>
                    );
                })}

                {invoices.data.length === 0 && (
                    <Box style={{ textAlign: 'center', padding: '64px 0', background: 'var(--c-card)', borderRadius: 12, border: '1px solid var(--c-border-subtle)' }}>
                        <Text style={{ fontSize: '3rem', marginBottom: 12 }}>📄</Text>
                        <Text fw={600} style={{ color: 'var(--c-text)' }}>No invoices yet</Text>
                    </Box>
                )}
            </Stack>
        </PortalLayout>
    );
}

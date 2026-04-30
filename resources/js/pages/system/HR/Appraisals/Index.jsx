import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, Stack, Button } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const StatusBadge = ({ status, statuses }) => {
    const s = statuses[status];
    if (!s) return null;
    return (
        <Box style={{ padding: '2px 10px', borderRadius: 10, background: s.color + '22', border: `1px solid ${s.color}55`, display: 'inline-block' }}>
            <Text size="xs" fw={700} style={{ color: s.color }}>{s.label}</Text>
        </Box>
    );
};

const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Text key={i} style={{ fontSize: 12, color: i < n ? '#F59E0B' : '#1E3A5F' }}>★</Text>
));

export default function AppraisalsIndex({ appraisals, employees, statuses, stats, filters }) {
    const [empId, setEmpId] = useState(filters.employee_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const apply = (key, val) => {
        const updated = { employee_id: empId, status };
        updated[key] = val;
        if (key === 'employee_id') setEmpId(val);
        if (key === 'status') setStatus(val);
        const params = {};
        if (updated.employee_id) params.employee_id = updated.employee_id;
        if (updated.status) params.status = updated.status;
        router.get('/system/hr/appraisals', params, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="Appraisals">
            {/* Stats */}
            <Grid mb="xl" gutter="md">
                {[
                    { label: 'Total', value: stats.total, icon: '📋', color: '#94A3B8' },
                    { label: 'Published', value: stats.published, icon: '✅', color: '#22C55E' },
                    { label: 'Drafts', value: stats.drafts, icon: '📝', color: '#F59E0B' },
                    { label: 'Avg Score', value: `${stats.avg_score}/5`, icon: '⭐', color: '#F59E0B' },
                ].map(s => (
                    <Grid.Col key={s.label} span={{ base: 6, sm: 3 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '18px 22px' }}>
                            <Group gap="sm" mb={4}><Text style={{ fontSize: '1.2rem' }}>{s.icon}</Text><Text size="sm" style={{ color: '#64748B' }}>{s.label}</Text></Group>
                            <Text fw={800} size="xl" style={{ color: s.color }}>{s.value}</Text>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Toolbar */}
            <Group justify="space-between" mb="lg">
                <Group gap="sm">
                    <Select
                        placeholder="All employees"
                        value={empId}
                        onChange={v => apply('employee_id', v || '')}
                        data={[{ value: '', label: 'All Employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))]}
                        style={{ width: 220 }}
                        styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => apply('status', v || '')}
                        data={[{ value: '', label: 'All' }, ...Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))]}
                        style={{ width: 160 }}
                        styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }}
                    />
                </Group>
                <Button
                    component={Link}
                    href="/system/hr/appraisals/create"
                    style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}
                >
                    + New Appraisal
                </Button>
            </Group>

            {/* Table */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '1px solid var(--c-border-strong)' }}>
                                {['Employee', 'Period', 'Trips', 'On-Time', 'Fuel eff.', 'Score', 'Status', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {appraisals.data.map(a => (
                                <tr key={a.id} style={{ borderBottom: '1px solid var(--c-border-row)', transition: 'background 0.12s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--c-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text fw={700} size="sm" style={{ color: 'var(--c-text)' }}>{a.employee?.name}</Text>
                                        <Text size="xs" style={{ color: '#475569' }}>{a.employee?.department}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: '#94A3B8' }}>{a.period_from ? new Date(a.period_from).toLocaleDateString('en-GB', { month:'short', year:'numeric' }) : '—'}</Text>
                                        <Text size="xs" style={{ color: '#475569' }}>to {a.period_to ? new Date(a.period_to).toLocaleDateString('en-GB', { month:'short', year:'numeric' }) : '—'}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#94A3B8' }}>{a.trips_count}</Text></td>
                                    <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#94A3B8' }}>{a.on_time_pct != null ? `${a.on_time_pct}%` : '—'}</Text></td>
                                    <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#94A3B8' }}>{a.fuel_eff_kml != null ? `${a.fuel_eff_kml} km/L` : '—'}</Text></td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {a.overall_score ? (
                                            <Group gap={2}>{stars(Math.round(a.overall_score))}<Text size="xs" style={{ color: '#F59E0B', marginLeft: 4 }}>{a.overall_score}</Text></Group>
                                        ) : <Text size="sm" style={{ color: '#475569' }}>—</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}><StatusBadge status={a.status} statuses={statuses} /></td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Box component={Link} href={`/system/hr/appraisals/${a.id}`} style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View →</Box>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>

                {appraisals.data.length === 0 && (
                    <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>⭐</Text>
                        <Text fw={600} style={{ color: 'var(--c-text)' }}>No appraisals yet</Text>
                        <Text size="sm" style={{ color: '#475569', marginTop: 6 }}>Create the first performance review</Text>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

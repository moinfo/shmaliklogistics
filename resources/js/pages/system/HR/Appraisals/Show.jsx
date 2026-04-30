import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Stack, Textarea, NumberInput, Select, Button, SegmentedControl } from '@mantine/core';
import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const StarDisplay = ({ value, max = 5 }) => (
    <Group gap={2}>
        {Array.from({ length: max }, (_, i) => (
            <Text key={i} style={{ fontSize: 16, color: i < (value || 0) ? '#F59E0B' : '#1E3A5F' }}>★</Text>
        ))}
        <Text size="sm" style={{ color: '#F59E0B', marginLeft: 6, fontWeight: 700 }}>{value || '—'}</Text>
    </Group>
);

const MetricCard = ({ label, value, unit = '', icon }) => (
    <Box style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-subtle)', borderRadius: 10, padding: '16px 20px' }}>
        <Group gap="sm" mb={4}><Text style={{ fontSize: '1.1rem' }}>{icon}</Text><Text size="xs" style={{ color: '#64748B' }}>{label}</Text></Group>
        <Text fw={800} size="lg" style={{ color: 'var(--c-text)' }}>{value != null ? `${value}${unit}` : '—'}</Text>
    </Box>
);

const Field = ({ label, value }) => (
    <Box>
        <Text size="xs" style={{ color: '#475569', marginBottom: 3 }}>{label}</Text>
        <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{value || '—'}</Text>
    </Box>
);

export default function AppraisalShow({ appraisal, statuses }) {
    const [editing, setEditing] = useState(false);
    const inputStyle = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 6 } };

    const { data, setData, put, processing } = useForm({
        period_from: appraisal.period_from,
        period_to: appraisal.period_to,
        trips_count: appraisal.trips_count,
        on_time_pct: appraisal.on_time_pct,
        fuel_eff_kml: appraisal.fuel_eff_kml,
        incidents: appraisal.incidents,
        rating_punctuality: appraisal.rating_punctuality,
        rating_conduct: appraisal.rating_conduct,
        rating_cargo_care: appraisal.rating_cargo_care,
        rating_compliance: appraisal.rating_compliance,
        manager_rating: appraisal.manager_rating,
        manager_notes: appraisal.manager_notes || '',
        status: appraisal.status,
    });

    const save = (e) => { e.preventDefault(); put(`/system/hr/appraisals/${appraisal.id}`, { onSuccess: () => setEditing(false) }); };
    const del = () => { if (confirm('Delete this appraisal?')) router.delete(`/system/hr/appraisals/${appraisal.id}`); };

    const sc = statuses[appraisal.status];

    return (
        <DashboardLayout title={`Appraisal — ${appraisal.employee?.name}`}>
            <Group justify="space-between" mb="lg">
                <Box component={Link} href="/system/hr/appraisals" style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 14 }}>← Back</Box>
                <Group gap="sm">
                    <Button variant="default" onClick={() => setEditing(!editing)} style={{ borderColor: 'rgba(33,150,243,0.3)', color: '#94A3B8', background: 'transparent' }}>
                        {editing ? 'Cancel' : '✏️ Edit'}
                    </Button>
                    <Button onClick={del} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>Delete</Button>
                </Group>
            </Group>

            {/* Header */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-strong)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
                <Group justify="space-between" mb="lg">
                    <Box>
                        <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>{appraisal.employee?.name}</Text>
                        <Text size="sm" style={{ color: '#94A3B8' }}>{appraisal.employee?.department} · {appraisal.employee?.employee_number}</Text>
                    </Box>
                    <Group gap="md">
                        {sc && <Box style={{ padding: '6px 18px', borderRadius: 20, background: `${sc.color}22`, border: `1px solid ${sc.color}55` }}><Text fw={700} style={{ color: sc.color }}>{sc.label}</Text></Box>}
                        {appraisal.overall_score != null && (
                            <Box style={{ textAlign: 'center' }}>
                                <Text fw={900} size="2rem" style={{ color: '#F59E0B', lineHeight: 1 }}>{appraisal.overall_score}</Text>
                                <Text size="xs" style={{ color: '#64748B' }}>/ 5.00</Text>
                            </Box>
                        )}
                    </Group>
                </Group>
                <Grid gutter="md">
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Period From" value={appraisal.period_from ? new Date(appraisal.period_from).toLocaleDateString() : null} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Period To" value={appraisal.period_to ? new Date(appraisal.period_to).toLocaleDateString() : null} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Created By" value={appraisal.creator?.name} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Created" value={appraisal.created_at ? new Date(appraisal.created_at).toLocaleDateString() : null} /></Grid.Col>
                </Grid>
            </Box>

            {editing ? (
                <form onSubmit={save}>
                    <Grid gutter="lg">
                        <Grid.Col span={{ base: 12, md: 8 }}>
                            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                                <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 20 }}>Metrics</Text>
                                <Grid gutter="md">
                                    <Grid.Col span={{ base: 6, sm: 3 }}><NumberInput label="Trips" value={data.trips_count} onChange={v => setData('trips_count', v)} min={0} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 6, sm: 3 }}><NumberInput label="On-Time %" value={data.on_time_pct} onChange={v => setData('on_time_pct', v)} min={0} max={100} decimalScale={1} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 6, sm: 3 }}><NumberInput label="Fuel km/L" value={data.fuel_eff_kml} onChange={v => setData('fuel_eff_kml', v)} min={0} decimalScale={2} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 6, sm: 3 }}><NumberInput label="Incidents" value={data.incidents} onChange={v => setData('incidents', v)} min={0} styles={inputStyle} /></Grid.Col>
                                    {['rating_punctuality','rating_conduct','rating_cargo_care','rating_compliance','manager_rating'].map(f => (
                                        <Grid.Col key={f} span={{ base: 6, sm: 4 }}>
                                            <Select label={f.replace('rating_', '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} value={data[f] ? String(data[f]) : null} onChange={v => setData(f, v ? Number(v) : null)} data={['1','2','3','4','5'].map(n => ({ value: n, label: `★ ${n}` }))} clearable styles={inputStyle} />
                                        </Grid.Col>
                                    ))}
                                    <Grid.Col span={12}>
                                        <Textarea label="Manager Notes" value={data.manager_notes} onChange={e => setData('manager_notes', e.target.value)} rows={4} styles={inputStyle} />
                                    </Grid.Col>
                                </Grid>
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                                <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 16 }}>Status</Text>
                                <SegmentedControl value={data.status} onChange={v => setData('status', v)} data={Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))} fullWidth styles={{ root: { background: 'var(--c-input)' }, label: { color: '#94A3B8' } }} />
                                <Button type="submit" fullWidth loading={processing} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700, marginTop: 16 }}>Save Changes</Button>
                            </Box>
                        </Grid.Col>
                    </Grid>
                </form>
            ) : (
                <Grid gutter="lg">
                    {/* Metrics */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px', marginBottom: 16 }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 16 }}>KPI Metrics</Text>
                            <Grid gutter="md">
                                <Grid.Col span={{ base: 6, sm: 3 }}><MetricCard icon="🚛" label="Trips" value={appraisal.trips_count} /></Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}><MetricCard icon="⏰" label="On-Time" value={appraisal.on_time_pct} unit="%" /></Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}><MetricCard icon="⛽" label="Fuel Eff." value={appraisal.fuel_eff_kml} unit=" km/L" /></Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}><MetricCard icon="⚠️" label="Incidents" value={appraisal.incidents} /></Grid.Col>
                            </Grid>
                        </Box>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 16 }}>Ratings</Text>
                            <Grid gutter="md">
                                {[
                                    { label: 'Punctuality', key: 'rating_punctuality' },
                                    { label: 'Conduct', key: 'rating_conduct' },
                                    { label: 'Cargo Care', key: 'rating_cargo_care' },
                                    { label: 'Compliance', key: 'rating_compliance' },
                                    { label: 'Manager Rating', key: 'manager_rating' },
                                ].map(r => (
                                    <Grid.Col key={r.key} span={{ base: 12, sm: 6 }}>
                                        <Box>
                                            <Text size="xs" style={{ color: '#64748B', marginBottom: 6 }}>{r.label}</Text>
                                            <StarDisplay value={appraisal[r.key]} />
                                        </Box>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </Box>
                    </Grid.Col>
                    {/* Notes */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 16 }}>Manager Notes</Text>
                            <Text size="sm" style={{ color: '#94A3B8', lineHeight: 1.7 }}>{appraisal.manager_notes || 'No notes added.'}</Text>
                        </Box>
                    </Grid.Col>
                </Grid>
            )}
        </DashboardLayout>
    );
}

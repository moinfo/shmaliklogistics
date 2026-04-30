import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, NumberInput, Textarea, Button, Stack, SegmentedControl } from '@mantine/core';
import { useForm, Link } from '@inertiajs/react';

const inputStyle = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 6 } };

const StarRating = ({ label, value, onChange }) => (
    <Box>
        <Text size="sm" style={{ color: '#94A3B8', marginBottom: 8 }}>{label}</Text>
        <Group gap="xs">
            {[1, 2, 3, 4, 5].map(n => (
                <Box
                    key={n}
                    component="button"
                    type="button"
                    onClick={() => onChange(n === value ? null : n)}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                        fontSize: '1.4rem', color: n <= (value || 0) ? '#F59E0B' : '#1E3A5F',
                        transition: 'color 0.12s',
                    }}
                >
                    ★
                </Box>
            ))}
            {value && <Text size="xs" style={{ color: '#F59E0B', marginLeft: 4 }}>{value}/5</Text>}
        </Group>
    </Box>
);

export default function AppraisalCreate({ employees, statuses }) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        period_from: '',
        period_to: '',
        trips_count: '',
        on_time_pct: '',
        fuel_eff_kml: '',
        incidents: 0,
        rating_punctuality: null,
        rating_conduct: null,
        rating_cargo_care: null,
        rating_compliance: null,
        manager_rating: null,
        manager_notes: '',
        status: 'draft',
    });

    const submit = (e) => { e.preventDefault(); post('/system/hr/appraisals'); };
    const err = (f) => errors[f] && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{errors[f]}</Text>;

    return (
        <DashboardLayout title="New Appraisal">
            <Box component={Link} href="/system/hr/appraisals" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60A5FA', textDecoration: 'none', fontSize: 14, marginBottom: 20 }}>
                ← Back to Appraisals
            </Box>

            <form onSubmit={submit}>
                <Grid gutter="lg">
                    {/* Left column */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 20 }}>Employee & Period</Text>
                            <Grid gutter="md">
                                <Grid.Col span={12}>
                                    <Select
                                        label="Employee"
                                        placeholder="Select employee"
                                        data={employees.map(e => ({ value: String(e.id), label: `${e.name} — ${e.position || e.department}` }))}
                                        value={data.employee_id}
                                        onChange={v => setData('employee_id', v)}
                                        styles={inputStyle}
                                        required
                                    />
                                    {err('employee_id')}
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <Box>
                                        <Text size="sm" style={{ color: '#94A3B8', marginBottom: 6 }}>Period From</Text>
                                        <input type="date" value={data.period_from} onChange={e => setData('period_from', e.target.value)}
                                            style={{ width: '100%', background: 'var(--c-input)', border: '1px solid var(--c-border-input)', borderRadius: 8, padding: '10px 14px', color: 'var(--c-text)', fontSize: 14 }} required />
                                        {err('period_from')}
                                    </Box>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <Box>
                                        <Text size="sm" style={{ color: '#94A3B8', marginBottom: 6 }}>Period To</Text>
                                        <input type="date" value={data.period_to} onChange={e => setData('period_to', e.target.value)}
                                            style={{ width: '100%', background: 'var(--c-input)', border: '1px solid var(--c-border-input)', borderRadius: 8, padding: '10px 14px', color: 'var(--c-text)', fontSize: 14 }} required />
                                        {err('period_to')}
                                    </Box>
                                </Grid.Col>
                            </Grid>
                        </Box>

                        {/* KPI metrics */}
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px', marginTop: 16 }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 20 }}>Performance Metrics</Text>
                            <Grid gutter="md">
                                <Grid.Col span={{ base: 6, sm: 3 }}>
                                    <NumberInput label="Trips Completed" value={data.trips_count} onChange={v => setData('trips_count', v)} min={0} styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}>
                                    <NumberInput label="On-Time %" value={data.on_time_pct} onChange={v => setData('on_time_pct', v)} min={0} max={100} decimalScale={1} styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}>
                                    <NumberInput label="Fuel Eff. (km/L)" value={data.fuel_eff_kml} onChange={v => setData('fuel_eff_kml', v)} min={0} decimalScale={2} styles={inputStyle} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, sm: 3 }}>
                                    <NumberInput label="Incidents" value={data.incidents} onChange={v => setData('incidents', v)} min={0} styles={inputStyle} />
                                </Grid.Col>
                            </Grid>
                        </Box>

                        {/* Ratings */}
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px', marginTop: 16 }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 20 }}>Ratings (1–5 stars)</Text>
                            <Grid gutter="lg">
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <StarRating label="Punctuality" value={data.rating_punctuality} onChange={v => setData('rating_punctuality', v)} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <StarRating label="Professional Conduct" value={data.rating_conduct} onChange={v => setData('rating_conduct', v)} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <StarRating label="Cargo Care" value={data.rating_cargo_care} onChange={v => setData('rating_cargo_care', v)} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <StarRating label="Compliance" value={data.rating_compliance} onChange={v => setData('rating_compliance', v)} />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <StarRating label="Manager Overall Rating" value={data.manager_rating} onChange={v => setData('manager_rating', v)} />
                                </Grid.Col>
                            </Grid>
                        </Box>
                    </Grid.Col>

                    {/* Right column */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px', position: 'sticky', top: 90 }}>
                            <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 20 }}>Status & Notes</Text>
                            <Stack gap="md">
                                <Box>
                                    <Text size="sm" style={{ color: '#94A3B8', marginBottom: 8 }}>Status</Text>
                                    <SegmentedControl
                                        value={data.status}
                                        onChange={v => setData('status', v)}
                                        data={Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))}
                                        fullWidth
                                        styles={{ root: { background: 'var(--c-input)' }, label: { color: '#94A3B8' } }}
                                    />
                                </Box>
                                <Textarea
                                    label="Manager Notes"
                                    placeholder="Add any comments..."
                                    value={data.manager_notes}
                                    onChange={e => setData('manager_notes', e.target.value)}
                                    rows={6}
                                    styles={inputStyle}
                                />
                                <Button type="submit" loading={processing} fullWidth style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}>
                                    Save Appraisal
                                </Button>
                            </Stack>
                        </Box>
                    </Grid.Col>
                </Grid>
            </form>
        </DashboardLayout>
    );
}

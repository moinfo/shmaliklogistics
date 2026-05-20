import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Stack, Select, NumberInput, Textarea, SimpleGrid, SegmentedControl } from '@mantine/core';
import { useForm, Link } from '@inertiajs/react';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

function StarRating({ label, value, onChange, textSec }) {
    return (
        <Box>
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 8 }}>{label}</Text>
            <Group gap="xs">
                {[1, 2, 3, 4, 5].map(n => (
                    <Box
                        key={n}
                        component="button"
                        type="button"
                        onClick={() => onChange(n === value ? null : n)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '1.4rem',
                            color: n <= (value || 0) ? '#F59E0B' : 'rgba(148,163,184,0.35)',
                            transition: 'color 0.12s',
                        }}
                    >
                        ★
                    </Box>
                ))}
                {value && <Text size="xs" fw={700} style={{ color: '#F59E0B', marginLeft: 4 }}>{value}/5</Text>}
            </Group>
        </Box>
    );
}

export default function AppraisalCreate({ employees, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const { data, setData, post, processing, errors } = useForm({
        employee_id:        '',
        period_from:        '',
        period_to:          '',
        trips_count:        '',
        on_time_pct:        '',
        fuel_eff_kml:       '',
        incidents:          0,
        rating_punctuality: null,
        rating_conduct:     null,
        rating_cargo_care:  null,
        rating_compliance:  null,
        manager_rating:     null,
        manager_notes:      '',
        status:             'draft',
    });

    const submit = (e) => { e.preventDefault(); post('/system/hr/appraisals'); };
    const err = (f) => errors[f] && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{errors[f]}</Text>;

    const SectionCard = ({ icon, title, children, delay = 0 }) => (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}>
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}>
                        <Text size="md">{icon}</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                    </Group>
                </Box>
                <Box style={{ padding: '20px 24px' }}>{children}</Box>
            </Box>
        </motion.div>
    );

    return (
        <DashboardLayout title="New Appraisal">
            {/* Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18,
                    padding: '20px 28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                ⭐
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">New Appraisal</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Employee performance evaluation</Text>
                            </Stack>
                        </Group>
                        <Box
                            component={Link}
                            href="/system/hr/appraisals"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ← Back to Appraisals
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <form onSubmit={submit}>
                <Grid gutter="lg">
                    {/* Left column */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        {/* Employee & Period */}
                        <SectionCard icon="👤" title="Employee & Period" delay={0.05}>
                            <Select
                                label="Employee *"
                                placeholder="Select employee"
                                data={employees.map(e => ({ value: String(e.id), label: `${e.name} — ${e.position || e.department}` }))}
                                value={data.employee_id}
                                onChange={v => setData('employee_id', v)}
                                styles={{ ...inputStyles, dropdown: dropdownStyle }}
                                required
                                mb="md"
                            />
                            {err('employee_id')}
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                <Box>
                                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Period From *</Text>
                                    <input
                                        type="date"
                                        value={data.period_from}
                                        onChange={e => setData('period_from', e.target.value)}
                                        style={{ width: '100%', background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '10px 14px', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                        required
                                    />
                                    {err('period_from')}
                                </Box>
                                <Box>
                                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Period To *</Text>
                                    <input
                                        type="date"
                                        value={data.period_to}
                                        onChange={e => setData('period_to', e.target.value)}
                                        style={{ width: '100%', background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '10px 14px', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                        required
                                    />
                                    {err('period_to')}
                                </Box>
                            </SimpleGrid>
                        </SectionCard>

                        {/* Performance Metrics */}
                        <SectionCard icon="📊" title="Performance Metrics" delay={0.1}>
                            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                                <NumberInput
                                    label="Trips Completed"
                                    value={data.trips_count}
                                    onChange={v => setData('trips_count', v)}
                                    min={0}
                                    styles={inputStyles}
                                />
                                <NumberInput
                                    label="On-Time %"
                                    value={data.on_time_pct}
                                    onChange={v => setData('on_time_pct', v)}
                                    min={0}
                                    max={100}
                                    decimalScale={1}
                                    styles={inputStyles}
                                />
                                <NumberInput
                                    label="Fuel Eff. (km/L)"
                                    value={data.fuel_eff_kml}
                                    onChange={v => setData('fuel_eff_kml', v)}
                                    min={0}
                                    decimalScale={2}
                                    styles={inputStyles}
                                />
                                <NumberInput
                                    label="Incidents"
                                    value={data.incidents}
                                    onChange={v => setData('incidents', v)}
                                    min={0}
                                    styles={inputStyles}
                                />
                            </SimpleGrid>
                        </SectionCard>

                        {/* Ratings */}
                        <SectionCard icon="⭐" title="Ratings (1–5 stars)" delay={0.15}>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                                <StarRating label="Punctuality" value={data.rating_punctuality} onChange={v => setData('rating_punctuality', v)} textSec={textSec} />
                                <StarRating label="Professional Conduct" value={data.rating_conduct} onChange={v => setData('rating_conduct', v)} textSec={textSec} />
                                <StarRating label="Cargo Care" value={data.rating_cargo_care} onChange={v => setData('rating_cargo_care', v)} textSec={textSec} />
                                <StarRating label="Compliance" value={data.rating_compliance} onChange={v => setData('rating_compliance', v)} textSec={textSec} />
                            </SimpleGrid>
                            <Box mt="lg" style={{ paddingTop: 16, borderTop: `1px solid ${divider}` }}>
                                <StarRating label="Manager Overall Rating" value={data.manager_rating} onChange={v => setData('manager_rating', v)} textSec={textSec} />
                            </Box>
                        </SectionCard>
                    </Grid.Col>

                    {/* Right column */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
                            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, position: 'sticky', top: 90 }}>
                                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                                    <Group gap={8}>
                                        <Text size="md">📌</Text>
                                        <Text fw={700} size="sm" style={{ color: textPri }}>Status & Notes</Text>
                                    </Group>
                                </Box>
                                <Box style={{ padding: '20px 24px' }}>
                                    <Stack gap="md">
                                        <Box>
                                            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 8 }}>Status</Text>
                                            <SegmentedControl
                                                value={data.status}
                                                onChange={v => setData('status', v)}
                                                data={Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))}
                                                fullWidth
                                                styles={{
                                                    root: { background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8 },
                                                    label: { color: textSec },
                                                }}
                                            />
                                        </Box>
                                        <Textarea
                                            label="Manager Notes"
                                            placeholder="Add any comments..."
                                            value={data.manager_notes}
                                            onChange={e => setData('manager_notes', e.target.value)}
                                            rows={6}
                                            styles={inputStyles}
                                        />
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Box
                                                component="button"
                                                type="submit"
                                                disabled={processing}
                                                style={{ width: '100%', background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(234,88,12,0.4)', opacity: processing ? 0.7 : 1 }}
                                            >
                                                {processing ? 'Saving…' : 'Save Appraisal'}
                                            </Box>
                                        </motion.div>
                                    </Stack>
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid.Col>
                </Grid>
            </form>
        </DashboardLayout>
    );
}

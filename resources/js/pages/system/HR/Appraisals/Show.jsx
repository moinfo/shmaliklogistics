import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Grid, Textarea, NumberInput, Select, SegmentedControl } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function PersonAvatar({ name, size = 48 }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text fw={900} style={{ color, fontSize: size > 40 ? '1rem' : '0.75rem' }}>{initials}</Text>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <Text size="md">{icon}</Text>}
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '16px 20px' }}>{children}</Box>
        </Box>
    );
}

function StarDisplay({ value, max = 5 }) {
    return (
        <Group gap={3} wrap="nowrap">
            {Array.from({ length: max }, (_, i) => (
                <Text key={i} style={{ fontSize: 18, color: i < (value || 0) ? '#F59E0B' : 'rgba(245,158,11,0.2)' }}>★</Text>
            ))}
            <Text size="sm" fw={700} style={{ color: '#F59E0B', marginLeft: 6 }}>{value || '—'}</Text>
        </Group>
    );
}

function MetricCard({ label, value, unit = '', icon, isDark }) {
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    return (
        <Box style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '14px 16px' }}>
            <Group gap={6} mb={6}>
                <Text style={{ fontSize: '1.1rem' }}>{icon}</Text>
                <Text size="xs" style={{ color: textSec }}>{label}</Text>
            </Group>
            <Text fw={800} size="lg" style={{ color: textPri }}>{value != null ? `${value}${unit}` : '—'}</Text>
        </Box>
    );
}

function RatingRow({ label, value, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
            <Text size="sm" style={{ color: textSec }}>{label}</Text>
            <StarDisplay value={value} />
        </Box>
    );
}

export default function AppraisalShow({ appraisal, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';

    const [editing, setEditing] = useState(false);
    const can = useCan();

    const inputStyle = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, marginBottom: 6 },
    };

    const { data, setData, put, processing } = useForm({
        period_from:         appraisal.period_from,
        period_to:           appraisal.period_to,
        trips_count:         appraisal.trips_count,
        on_time_pct:         appraisal.on_time_pct,
        fuel_eff_kml:        appraisal.fuel_eff_kml,
        incidents:           appraisal.incidents,
        rating_punctuality:  appraisal.rating_punctuality,
        rating_conduct:      appraisal.rating_conduct,
        rating_cargo_care:   appraisal.rating_cargo_care,
        rating_compliance:   appraisal.rating_compliance,
        manager_rating:      appraisal.manager_rating,
        manager_notes:       appraisal.manager_notes || '',
        status:              appraisal.status,
    });

    const save = (e) => { e.preventDefault(); put(`/system/hr/appraisals/${appraisal.id}`, { onSuccess: () => setEditing(false) }); };
    const del = () => { if (confirm('Delete this appraisal?')) router.delete(`/system/hr/appraisals/${appraisal.id}`); };

    const sc = statuses[appraisal.status];

    return (
        <DashboardLayout title={`Appraisal — ${appraisal.employee?.name}`}>
            <Head title={`Appraisal — ${appraisal.employee?.name}`} />

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
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={12}>
                            <PersonAvatar name={appraisal.employee?.name} size={48} />
                            <Stack gap={2}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white">{appraisal.employee?.name}</Text>
                                    {sc && (
                                        <Box style={{ background: sc.color + '30', border: `1px solid ${sc.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                            <Group gap={5} align="center">
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
                                                <Text size="xs" fw={700} style={{ color: '#fff' }}>{sc.label}</Text>
                                            </Group>
                                        </Box>
                                    )}
                                    {appraisal.overall_score != null && (
                                        <Box style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 20, padding: '3px 12px' }}>
                                            <Text size="xs" fw={800} style={{ color: '#FDE68A' }}>⭐ {appraisal.overall_score} / 5</Text>
                                        </Box>
                                    )}
                                </Group>
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                    {appraisal.employee?.department} · {appraisal.employee?.employee_number}
                                </Text>
                            </Stack>
                        </Group>
                        <Group gap={8} wrap="wrap">
                            <Box component={Link} href="/system/hr/appraisals"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                ← Back
                            </Box>
                            {can('hr_appraisals.edit') && (
                                <Box component="button" type="button" onClick={() => setEditing(!editing)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: editing ? 'rgba(255,255,255,0.15)' : 'white', border: editing ? '1px solid rgba(255,255,255,0.25)' : 'none', color: editing ? 'white' : '#C2410C', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: editing ? 'none' : '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    {editing ? 'Cancel' : '✏️ Edit'}
                                </Box>
                            )}
                            {can('hr_appraisals.delete') && (
                                <Box component="button" type="button" onClick={del}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                    🗑️ Delete
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Period strip */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <Box mb={20} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 20px', boxShadow: cardShadow }}>
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                        {[
                            { label: 'Period From',  value: appraisal.period_from ? new Date(appraisal.period_from).toLocaleDateString() : '—' },
                            { label: 'Period To',    value: appraisal.period_to   ? new Date(appraisal.period_to).toLocaleDateString()   : '—' },
                            { label: 'Created By',   value: appraisal.creator?.name ?? '—' },
                            { label: 'Created',      value: appraisal.created_at  ? new Date(appraisal.created_at).toLocaleDateString()  : '—' },
                        ].map(f => (
                            <Box key={f.label}>
                                <Text size="xs" style={{ color: textMut, marginBottom: 3 }}>{f.label}</Text>
                                <Text size="sm" fw={600} style={{ color: textPri }}>{f.value}</Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
            </motion.div>

            {editing ? (
                <form onSubmit={save}>
                    <Grid gutter="lg">
                        <Grid.Col span={{ base: 12, md: 8 }}>
                            <SectionCard title="Metrics" icon="📊" isDark={isDark} accent={['#C2410C', '#F97316']}>
                                <Grid gutter="md">
                                    <Grid.Col span={{ base: 6, sm: 3 }}><NumberInput label="Trips" value={data.trips_count} onChange={v => setData('trips_count', v)} min={0} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 6, sm: 3 }}><NumberInput label="On-Time %" value={data.on_time_pct} onChange={v => setData('on_time_pct', v)} min={0} max={100} decimalScale={1} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 6, sm: 3 }}><NumberInput label="Fuel km/L" value={data.fuel_eff_kml} onChange={v => setData('fuel_eff_kml', v)} min={0} decimalScale={2} styles={inputStyle} /></Grid.Col>
                                    <Grid.Col span={{ base: 6, sm: 3 }}><NumberInput label="Incidents" value={data.incidents} onChange={v => setData('incidents', v)} min={0} styles={inputStyle} /></Grid.Col>
                                    {['rating_punctuality', 'rating_conduct', 'rating_cargo_care', 'rating_compliance', 'manager_rating'].map(f => (
                                        <Grid.Col key={f} span={{ base: 6, sm: 4 }}>
                                            <Select
                                                label={f.replace('rating_', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                value={data[f] ? String(data[f]) : null}
                                                onChange={v => setData(f, v ? Number(v) : null)}
                                                data={['1', '2', '3', '4', '5'].map(n => ({ value: n, label: `★ ${n}` }))}
                                                clearable
                                                styles={{ ...inputStyle, dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}
                                            />
                                        </Grid.Col>
                                    ))}
                                    <Grid.Col span={12}>
                                        <Textarea label="Manager Notes" value={data.manager_notes} onChange={e => setData('manager_notes', e.target.value)} rows={4} styles={inputStyle} />
                                    </Grid.Col>
                                </Grid>
                            </SectionCard>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <SectionCard title="Status" icon="🔖" isDark={isDark} accent={['#7C3AED', '#A855F7']}>
                                <SegmentedControl
                                    value={data.status}
                                    onChange={v => setData('status', v)}
                                    data={Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))}
                                    fullWidth
                                    styles={{ root: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9' }, label: { color: textSec } }}
                                />
                                <Box mt={16}>
                                    <Box component="button" type="submit" disabled={processing}
                                        style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13 }}>
                                        {processing ? 'Saving…' : 'Save Changes'}
                                    </Box>
                                </Box>
                            </SectionCard>
                        </Grid.Col>
                    </Grid>
                </form>
            ) : (
                <Grid gutter="lg">
                    {/* KPI Metrics */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                            <SectionCard title="KPI Metrics" icon="📈" isDark={isDark} accent={['#C2410C', '#F97316']}>
                                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
                                    <MetricCard icon="🚛" label="Trips"     value={appraisal.trips_count}  isDark={isDark} />
                                    <MetricCard icon="⏰" label="On-Time"   value={appraisal.on_time_pct}  unit="%" isDark={isDark} />
                                    <MetricCard icon="⛽" label="Fuel Eff." value={appraisal.fuel_eff_kml} unit=" km/L" isDark={isDark} />
                                    <MetricCard icon="⚠️" label="Incidents" value={appraisal.incidents}    isDark={isDark} />
                                </SimpleGrid>
                            </SectionCard>
                        </motion.div>

                        {/* Ratings */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                            <Box mt={16}>
                                <SectionCard title="Performance Ratings" icon="⭐" isDark={isDark} accent={['#92400E', '#F59E0B']}>
                                    <RatingRow label="Punctuality"   value={appraisal.rating_punctuality} isDark={isDark} />
                                    <RatingRow label="Conduct"       value={appraisal.rating_conduct}     isDark={isDark} />
                                    <RatingRow label="Cargo Care"    value={appraisal.rating_cargo_care}  isDark={isDark} />
                                    <RatingRow label="Compliance"    value={appraisal.rating_compliance}  isDark={isDark} />
                                    <RatingRow label="Manager Rating" value={appraisal.manager_rating}   isDark={isDark} />
                                </SectionCard>
                            </Box>
                        </motion.div>
                    </Grid.Col>

                    {/* Notes + Overall */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            {/* Overall score card */}
                            {appraisal.overall_score != null && (
                                <Box mb={16} style={{ background: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', borderRadius: 16, padding: '20px', boxShadow: '0 8px 28px rgba(245,158,11,0.35)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
                                    <CardWave />
                                    <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                                    <Text fw={900} c="white" style={{ fontSize: '3rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{appraisal.overall_score}</Text>
                                    <Text size="sm" c="white" style={{ opacity: 0.8, position: 'relative', zIndex: 1 }}>Overall Score / 5.00</Text>
                                    <Group justify="center" mt={8} style={{ position: 'relative', zIndex: 1 }}>
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Text key={i} style={{ fontSize: 20, color: i < Math.round(appraisal.overall_score) ? '#FFFBEB' : 'rgba(255,255,255,0.3)' }}>★</Text>
                                        ))}
                                    </Group>
                                </Box>
                            )}

                            {/* Manager Notes */}
                            <SectionCard title="Manager Notes" icon="📝" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                                <Text size="sm" style={{ color: textSec, lineHeight: 1.7 }}>
                                    {appraisal.manager_notes || 'No notes added.'}
                                </Text>
                            </SectionCard>
                        </motion.div>
                    </Grid.Col>
                </Grid>
            )}

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/hr/appraisals"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Appraisals
                </Box>
            </Box>
        </DashboardLayout>
    );
}

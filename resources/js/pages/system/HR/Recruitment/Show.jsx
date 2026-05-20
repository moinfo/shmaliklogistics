import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Stack, Button, Modal, SimpleGrid, TextInput, Textarea, Select, NumberInput, FileInput } from '@mantine/core';
import { router, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useCan } from '../../../../lib/can';

function ApplicationForm({ onSubmit, processing, inputStyles, dropdownStyle }) {
    const { data, setData } = useForm({ full_name: '', phone: '', email: '', notes: '', cv: null });
    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(data); }}>
            <Stack gap="sm">
                <TextInput label="Full Name *" value={data.full_name} onChange={e => setData('full_name', e.target.value)} styles={inputStyles} required />
                <Grid gutter="sm">
                    <Grid.Col span={6}><TextInput label="Phone" value={data.phone} onChange={e => setData('phone', e.target.value)} styles={inputStyles} /></Grid.Col>
                    <Grid.Col span={6}><TextInput label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} styles={inputStyles} /></Grid.Col>
                </Grid>
                <FileInput label="CV (PDF/Word)" accept=".pdf,.doc,.docx" onChange={f => setData('cv', f)} styles={inputStyles} placeholder="Choose file…" />
                <Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyles} />
                <Group justify="flex-end">
                    <Button type="submit" loading={processing} style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', borderRadius: 10, fontWeight: 700, boxShadow: '0 4px 16px rgba(234,88,12,0.4)' }}>
                        Add Application
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

function StageModal({ application, stages, onClose, inputStyles, dropdownStyle }) {
    const { data, setData, processing } = useForm({
        stage:           application.stage,
        interview_date:  application.interview_date || '',
        interview_notes: application.interview_notes || '',
        offer_amount:    application.offer_amount || '',
    });

    const submit = (e) => {
        e.preventDefault();
        router.patch(`/system/hr/recruitment/applications/${application.id}/stage`, data, {
            onSuccess: onClose,
            preserveScroll: true,
        });
    };

    const showInterview = ['interview'].includes(data.stage);
    const showOffer     = ['offer', 'hired'].includes(data.stage);

    return (
        <form onSubmit={submit}>
            <Stack gap="sm">
                <Select
                    label="Stage"
                    value={data.stage}
                    onChange={v => setData('stage', v || application.stage)}
                    data={Object.entries(stages).map(([v, s]) => ({ value: v, label: s.label }))}
                    styles={{ ...inputStyles, dropdown: dropdownStyle }}
                />
                {showInterview && (
                    <>
                        <TextInput label="Interview Date" type="datetime-local" value={data.interview_date} onChange={e => setData('interview_date', e.target.value)} styles={inputStyles} />
                        <Textarea label="Interview Notes" rows={3} value={data.interview_notes} onChange={e => setData('interview_notes', e.target.value)} styles={inputStyles} />
                    </>
                )}
                {showOffer && (
                    <NumberInput
                        label="Offer Amount (TZS)"
                        value={data.offer_amount ? parseFloat(data.offer_amount) : ''}
                        onChange={v => setData('offer_amount', v ?? '')}
                        min={0}
                        step={50000}
                        styles={inputStyles}
                    />
                )}
                <Group justify="flex-end" mt="xs">
                    <Button variant="subtle" onClick={onClose} style={{ color: '#64748B' }}>Cancel</Button>
                    <Button type="submit" loading={processing} style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', borderRadius: 10, fontWeight: 700, boxShadow: '0 4px 16px rgba(234,88,12,0.4)' }}>
                        Update Stage
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

export default function RecruitmentShow({ vacancy, applications, pipeline, stages, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const rowHover   = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const [applyOpen, setApplyOpen] = useState(false);
    const [stageTarget, setStageTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const can = useCan();

    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));
    const st = statuses[vacancy.status] || { label: vacancy.status, color: '#94A3B8' };

    const handleAddApplication = (data) => {
        setSubmitting(true);
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v !== null && v !== '') formData.append(k, v); });
        router.post(`/system/hr/recruitment/vacancies/${vacancy.id}/applications`, formData, {
            forceFormData: true,
            onSuccess: () => { setApplyOpen(false); setSubmitting(false); },
            onError:   () => setSubmitting(false),
            preserveScroll: true,
        });
    };

    const delApp = (app) => {
        if (confirm(`Remove application from ${app.full_name}?`)) {
            router.delete(`/system/hr/recruitment/applications/${app.id}`, { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout title={vacancy.title}>
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
                                🎯
                            </Box>
                            <Stack gap={1}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="lg" c="white">{vacancy.title}</Text>
                                    <Box style={{ background: `${st.color}30`, border: `1px solid ${st.color}60`, borderRadius: 20, padding: '2px 10px' }}>
                                        <Text size="xs" fw={700} style={{ color: '#fff' }}>{st.label}</Text>
                                    </Box>
                                </Group>
                                {vacancy.department && <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{vacancy.department}</Text>}
                            </Stack>
                        </Group>
                        <Group gap={8}>
                            {can('hr_recruitment.create') && (
                                <Box
                                    component="button"
                                    onClick={() => setApplyOpen(true)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    + Add Application
                                </Box>
                            )}
                            <Box
                                component={Link}
                                href="/system/hr/recruitment"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                            >
                                ← Back
                            </Box>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Pipeline summary */}
            <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="sm" mb="lg">
                {pipeline.map((p, i) => (
                    <motion.div key={p.stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${p.color}33`, borderRadius: 12, padding: '12px 16px', textAlign: 'center', boxShadow: cardShadow }}>
                            <Text fw={900} size="xl" style={{ color: p.color }}>{p.count}</Text>
                            <Text size="xs" style={{ color: textSec, marginTop: 2 }}>{p.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Vacancy detail cards */}
            {(vacancy.description || vacancy.requirements) && (
                <Grid gutter="lg" mb="lg">
                    {vacancy.description && (
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                                        <Group gap={8}><Text size="md">📄</Text><Text fw={700} size="sm" style={{ color: textPri }}>Description</Text></Group>
                                    </Box>
                                    <Box style={{ padding: '20px 24px' }}>
                                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-line' }}>{vacancy.description}</Text>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid.Col>
                    )}
                    {vacancy.requirements && (
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                                        <Group gap={8}><Text size="md">✅</Text><Text fw={700} size="sm" style={{ color: textPri }}>Requirements</Text></Group>
                                    </Box>
                                    <Box style={{ padding: '20px 24px' }}>
                                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-line' }}>{vacancy.requirements}</Text>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid.Col>
                    )}
                </Grid>
            )}

            {/* Applications table */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text size="md">👥</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Applications ({applications.total})</Text>
                        </Group>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderBottom: `1px solid ${divider}` }}>
                                    {['Name', 'Contact', 'Stage', 'Interview', 'Offer', 'CV', ''].map(h => (
                                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: textMut, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {applications.data.map(app => {
                                    const sg = stages[app.stage] || { label: app.stage, color: '#94A3B8' };
                                    return (
                                        <tr key={app.id} style={{ borderBottom: `1px solid ${divider}` }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Text fw={700} size="sm" style={{ color: textPri }}>{app.full_name}</Text>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Text size="sm" style={{ color: textSec }}>{app.phone || '—'}</Text>
                                                <Text size="xs" style={{ color: textMut }}>{app.email || ''}</Text>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${sg.color}22`, border: `1px solid ${sg.color}44` }}>
                                                    <Text size="xs" fw={700} style={{ color: sg.color }}>{sg.label}</Text>
                                                </Box>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Text size="xs" style={{ color: textSec }}>
                                                    {app.interview_date ? new Date(app.interview_date).toLocaleDateString() : '—'}
                                                </Text>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Text size="sm" style={{ color: app.offer_amount ? '#22C55E' : textMut }}>
                                                    {app.offer_amount ? `TZS ${fmt(app.offer_amount)}` : '—'}
                                                </Text>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {app.cv_path
                                                    ? <Box component="a" href={`/storage/${app.cv_path}`} target="_blank" rel="noreferrer"
                                                        style={{ color: '#EA580C', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>↓ CV</Box>
                                                    : <Text size="xs" style={{ color: textMut }}>—</Text>}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Group gap="sm">
                                                    {can('hr_recruitment.edit') && (
                                                        <Box component="button" onClick={() => setStageTarget(app)}
                                                            style={{ background: 'none', border: 'none', color: '#EA580C', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Move</Box>
                                                    )}
                                                    {can('hr_recruitment.delete') && (
                                                        <Box component="button" onClick={() => delApp(app)}
                                                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>Del</Box>
                                                    )}
                                                </Group>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {applications.data.length === 0 && (
                            <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>👥</Text>
                                <Text fw={600} style={{ color: textPri }}>No applications yet</Text>
                                <Text size="sm" style={{ color: textSec, marginTop: 4 }}>Add the first application for this vacancy</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </motion.div>

            {/* Add Application Modal */}
            <Modal
                opened={applyOpen}
                onClose={() => setApplyOpen(false)}
                size="md"
                title={<Text fw={700} style={{ color: textPri }}>Add Application</Text>}
                styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}` }, header: { background: cardBg, borderBottom: `1px solid ${divider}` } }}
            >
                <ApplicationForm onSubmit={handleAddApplication} processing={submitting} inputStyles={inputStyles} dropdownStyle={dropdownStyle} />
            </Modal>

            {/* Stage Update Modal */}
            {stageTarget && (
                <Modal
                    opened={!!stageTarget}
                    onClose={() => setStageTarget(null)}
                    title={<Text fw={700} style={{ color: textPri }}>Update Stage — {stageTarget.full_name}</Text>}
                    styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}` }, header: { background: cardBg, borderBottom: `1px solid ${divider}` } }}
                >
                    <StageModal application={stageTarget} stages={stages} onClose={() => setStageTarget(null)} inputStyles={inputStyles} dropdownStyle={dropdownStyle} />
                </Modal>
            )}
        </DashboardLayout>
    );
}

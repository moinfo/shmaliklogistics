import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Button, Modal, Stack, TextInput, Textarea, Select, NumberInput, FileInput } from '@mantine/core';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const inp = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 4 } };

function ApplicationForm({ onSubmit, processing }) {
    const { data, setData } = useForm({ full_name: '', phone: '', email: '', notes: '', cv: null });
    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(data); }}>
            <Stack gap="sm">
                <TextInput label="Full Name *" value={data.full_name} onChange={e => setData('full_name', e.target.value)} styles={inp} required />
                <Grid gutter="sm">
                    <Grid.Col span={6}><TextInput label="Phone" value={data.phone} onChange={e => setData('phone', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={6}><TextInput label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} styles={inp} /></Grid.Col>
                </Grid>
                <FileInput label="CV (PDF/Word)" accept=".pdf,.doc,.docx" onChange={f => setData('cv', f)}
                    styles={inp} placeholder="Choose file…" />
                <Textarea label="Notes" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inp} />
                <Group justify="flex-end">
                    <Button type="submit" loading={processing} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 8 }}>Add Application</Button>
                </Group>
            </Stack>
        </form>
    );
}

function StageModal({ application, stages, onClose }) {
    const { data, setData, processing } = useForm({
        stage: application.stage,
        interview_date: application.interview_date || '',
        interview_notes: application.interview_notes || '',
        offer_amount: application.offer_amount || '',
    });

    const submit = (e) => {
        e.preventDefault();
        router.patch(`/system/hr/recruitment/applications/${application.id}/stage`, data, {
            onSuccess: onClose,
            preserveScroll: true,
        });
    };

    const showInterview = ['interview'].includes(data.stage);
    const showOffer = ['offer', 'hired'].includes(data.stage);

    return (
        <form onSubmit={submit}>
            <Stack gap="sm">
                <Select label="Stage" value={data.stage} onChange={v => setData('stage', v || application.stage)}
                    data={Object.entries(stages).map(([v, s]) => ({ value: v, label: s.label }))}
                    styles={inp} />
                {showInterview && (
                    <>
                        <TextInput label="Interview Date" type="datetime-local" value={data.interview_date}
                            onChange={e => setData('interview_date', e.target.value)} styles={inp} />
                        <Textarea label="Interview Notes" rows={3} value={data.interview_notes}
                            onChange={e => setData('interview_notes', e.target.value)} styles={inp} />
                    </>
                )}
                {showOffer && (
                    <NumberInput label="Offer Amount (TZS)" value={data.offer_amount ? parseFloat(data.offer_amount) : ''}
                        onChange={v => setData('offer_amount', v ?? '')} min={0} step={50000}
                        styles={inp} />
                )}
                <Group justify="flex-end" mt="xs">
                    <Button variant="subtle" onClick={onClose} style={{ color: '#64748B' }}>Cancel</Button>
                    <Button type="submit" loading={processing} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 8 }}>Update Stage</Button>
                </Group>
            </Stack>
        </form>
    );
}

export default function RecruitmentShow({ vacancy, applications, pipeline, stages, statuses }) {
    const [applyOpen, setApplyOpen] = useState(false);
    const [stageTarget, setStageTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));
    const st = statuses[vacancy.status] || { label: vacancy.status, color: '#94A3B8' };

    const handleAddApplication = (data) => {
        setSubmitting(true);
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v !== null && v !== '') formData.append(k, v); });
        router.post(`/system/hr/recruitment/vacancies/${vacancy.id}/applications`, formData, {
            forceFormData: true,
            onSuccess: () => { setApplyOpen(false); setSubmitting(false); },
            onError: () => setSubmitting(false),
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
            {/* Header */}
            <Group justify="space-between" mb="xl" wrap="wrap" gap="sm">
                <Group gap="md">
                    <Box>
                        <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>{vacancy.title}</Text>
                        {vacancy.department && <Text size="sm" style={{ color: '#64748B' }}>{vacancy.department}</Text>}
                    </Box>
                    <Box style={{ padding: '3px 12px', borderRadius: 8, background: `${st.color}22`, border: `1px solid ${st.color}44` }}>
                        <Text size="sm" fw={700} style={{ color: st.color }}>{st.label}</Text>
                    </Box>
                </Group>
                <Button onClick={() => setApplyOpen(true)} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}>
                    + Add Application
                </Button>
            </Group>

            {/* Pipeline summary */}
            <Grid mb="xl" gutter="sm">
                {pipeline.map(p => (
                    <Grid.Col key={p.stage} span={{ base: 6, sm: 4, lg: 2 }}>
                        <Box style={{ background: 'var(--c-card)', border: `1px solid ${p.color}33`, borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                            <Text fw={800} size="xl" style={{ color: p.color }}>{p.count}</Text>
                            <Text size="xs" style={{ color: '#64748B', marginTop: 2 }}>{p.label}</Text>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Vacancy detail */}
            {(vacancy.description || vacancy.requirements) && (
                <Grid gutter="lg" mb="lg">
                    {vacancy.description && (
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '20px 24px' }}>
                                <Text fw={700} size="sm" style={{ color: '#60A5FA', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Description</Text>
                                <Text size="sm" style={{ color: '#94A3B8', whiteSpace: 'pre-line' }}>{vacancy.description}</Text>
                            </Box>
                        </Grid.Col>
                    )}
                    {vacancy.requirements && (
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '20px 24px' }}>
                                <Text fw={700} size="sm" style={{ color: '#60A5FA', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Requirements</Text>
                                <Text size="sm" style={{ color: '#94A3B8', whiteSpace: 'pre-line' }}>{vacancy.requirements}</Text>
                            </Box>
                        </Grid.Col>
                    )}
                </Grid>
            )}

            {/* Applications table */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border-subtle)' }}>
                    <Text fw={700} size="sm" style={{ color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        Applications ({applications.total})
                    </Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '1px solid var(--c-border-subtle)' }}>
                                {['Name', 'Contact', 'Stage', 'Interview', 'Offer', 'CV', ''].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748B', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {applications.data.map(app => {
                                const sg = stages[app.stage] || { label: app.stage, color: '#94A3B8' };
                                return (
                                    <tr key={app.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--c-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text fw={700} size="sm" style={{ color: 'var(--c-text)' }}>{app.full_name}</Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="sm" style={{ color: '#94A3B8' }}>{app.phone || '—'}</Text>
                                            <Text size="xs" style={{ color: '#475569' }}>{app.email || ''}</Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${sg.color}22`, border: `1px solid ${sg.color}44` }}>
                                                <Text size="xs" fw={700} style={{ color: sg.color }}>{sg.label}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="xs" style={{ color: '#64748B' }}>
                                                {app.interview_date ? new Date(app.interview_date).toLocaleDateString() : '—'}
                                            </Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="sm" style={{ color: app.offer_amount ? '#22C55E' : '#475569' }}>
                                                {app.offer_amount ? `TZS ${fmt(app.offer_amount)}` : '—'}
                                            </Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {app.cv_path
                                                ? <Box component="a" href={`/storage/${app.cv_path}`} target="_blank" rel="noreferrer"
                                                    style={{ color: '#60A5FA', fontSize: 12, textDecoration: 'none' }}>↓ CV</Box>
                                                : <Text size="xs" style={{ color: '#475569' }}>—</Text>}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Group gap="sm">
                                                <Box component="button" onClick={() => setStageTarget(app)}
                                                    style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Move</Box>
                                                <Box component="button" onClick={() => delApp(app)}
                                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>Del</Box>
                                            </Group>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {applications.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>👥</Text>
                            <Text fw={600} style={{ color: 'var(--c-text)' }}>No applications yet</Text>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Add Application Modal */}
            <Modal opened={applyOpen} onClose={() => setApplyOpen(false)} size="md"
                title={<Text fw={700} style={{ color: 'var(--c-text)' }}>Add Application</Text>}
                styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
                <ApplicationForm onSubmit={handleAddApplication} processing={submitting} />
            </Modal>

            {/* Stage Update Modal */}
            {stageTarget && (
                <Modal opened={!!stageTarget} onClose={() => setStageTarget(null)}
                    title={<Text fw={700} style={{ color: 'var(--c-text)' }}>Update Stage — {stageTarget.full_name}</Text>}
                    styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
                    <StageModal application={stageTarget} stages={stages} onClose={() => setStageTarget(null)} />
                </Modal>
            )}
        </DashboardLayout>
    );
}

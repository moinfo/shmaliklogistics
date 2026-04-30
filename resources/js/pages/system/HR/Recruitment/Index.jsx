import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Select, Button, Modal, Stack, TextInput, Textarea, NumberInput } from '@mantine/core';
import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const inp = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 4 } };

function VacancyForm({ initial = {}, onSubmit, processing }) {
    const { data, setData } = useForm({
        title: initial.title || '',
        department: initial.department || '',
        description: initial.description || '',
        requirements: initial.requirements || '',
        openings: initial.openings || 1,
        closing_date: initial.closing_date || '',
        status: initial.status || 'open',
    });

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(data); }}>
            <Stack gap="sm">
                <TextInput label="Job Title *" value={data.title} onChange={e => setData('title', e.target.value)} styles={inp} required />
                <Grid gutter="sm">
                    <Grid.Col span={6}><TextInput label="Department" value={data.department} onChange={e => setData('department', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={6}><NumberInput label="Openings" value={data.openings} onChange={v => setData('openings', v ?? 1)} min={1} max={99} styles={inp} /></Grid.Col>
                    <Grid.Col span={6}>
                        <Select label="Status" value={data.status} onChange={v => setData('status', v || 'open')}
                            data={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: 'filled', label: 'Filled' }]}
                            styles={inp} />
                    </Grid.Col>
                    <Grid.Col span={6}><TextInput label="Closing Date" type="date" value={data.closing_date} onChange={e => setData('closing_date', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={12}><Textarea label="Description" rows={3} value={data.description} onChange={e => setData('description', e.target.value)} styles={inp} /></Grid.Col>
                    <Grid.Col span={12}><Textarea label="Requirements" rows={3} value={data.requirements} onChange={e => setData('requirements', e.target.value)} styles={inp} /></Grid.Col>
                </Grid>
                <Group justify="flex-end" mt="xs">
                    <Button type="submit" loading={processing} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 8 }}>Save</Button>
                </Group>
            </Stack>
        </form>
    );
}

export default function RecruitmentIndex({ vacancies, statuses, stats, filters }) {
    const [status, setStatus] = useState(filters.status || '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    const applyFilter = (v) => {
        setStatus(v || '');
        const p = {};
        if (v) p.status = v;
        router.get('/system/hr/recruitment', p, { preserveState: true, replace: true });
    };

    const handleCreate = (data) => {
        router.post('/system/hr/recruitment/vacancies', data, {
            onSuccess: () => setCreateOpen(false),
            preserveScroll: true,
        });
    };

    const handleEdit = (data) => {
        router.put(`/system/hr/recruitment/vacancies/${editTarget.id}`, data, {
            onSuccess: () => setEditTarget(null),
            preserveScroll: true,
        });
    };

    const del = (v) => {
        if (confirm(`Delete vacancy "${v.title}"?`)) {
            router.delete(`/system/hr/recruitment/vacancies/${v.id}`, { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout title="Recruitment">
            {/* Stats */}
            <Grid mb="xl" gutter="md">
                {[
                    { icon: '📋', label: 'Open Vacancies', value: stats.open, color: '#22C55E' },
                    { icon: '👥', label: 'Total Applications', value: stats.total_apps, color: '#2196F3' },
                    { icon: '🗓️', label: 'In Interview', value: stats.interviews, color: '#F59E0B' },
                    { icon: '🏆', label: 'Hired', value: stats.hired, color: '#A855F7' },
                ].map(s => (
                    <Grid.Col key={s.label} span={{ base: 6, sm: 3 }}>
                        <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '16px 20px' }}>
                            <Group gap="sm" mb={4}><Text style={{ fontSize: '1.1rem' }}>{s.icon}</Text><Text size="xs" style={{ color: '#64748B' }}>{s.label}</Text></Group>
                            <Text fw={800} size="lg" style={{ color: s.color }}>{s.value}</Text>
                        </Box>
                    </Grid.Col>
                ))}
            </Grid>

            <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
                <Select placeholder="All statuses" value={status} onChange={applyFilter}
                    data={[{ value: '', label: 'All' }, ...Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))]}
                    style={{ width: 160 }} styles={{ input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' } }} />
                <Button onClick={() => setCreateOpen(true)} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 10, fontWeight: 700 }}>
                    + New Vacancy
                </Button>
            </Group>

            {/* Vacancies table */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '1px solid var(--c-border-strong)' }}>
                                {['Title', 'Department', 'Openings', 'Applications', 'Closing', 'Status', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {vacancies.data.map(v => {
                                const st = statuses[v.status] || { label: v.status, color: '#94A3B8' };
                                return (
                                    <tr key={v.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--c-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Box component={Link} href={`/system/hr/recruitment/vacancies/${v.id}`}
                                                style={{ color: '#60A5FA', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>{v.title}</Box>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#94A3B8' }}>{v.department || '—'}</Text></td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: 'var(--c-text)' }}>{v.openings ?? 1}</Text></td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" fw={700} style={{ color: '#2196F3' }}>{v.applications_count}</Text></td>
                                        <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{v.closing_date ? new Date(v.closing_date).toLocaleDateString() : '—'}</Text></td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${st.color}22`, border: `1px solid ${st.color}44` }}>
                                                <Text size="xs" fw={700} style={{ color: st.color }}>{st.label}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Group gap="sm">
                                                <Box component={Link} href={`/system/hr/recruitment/vacancies/${v.id}`}
                                                    style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View →</Box>
                                                <Box component="button" onClick={() => setEditTarget(v)}
                                                    style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: 13 }}>Edit</Box>
                                                <Box component="button" onClick={() => del(v)}
                                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13 }}>Del</Box>
                                            </Group>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {vacancies.data.length === 0 && (
                        <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎯</Text>
                            <Text fw={600} style={{ color: 'var(--c-text)' }}>No vacancies yet</Text>
                        </Box>
                    )}
                </Box>
            </Box>

            <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title={<Text fw={700} style={{ color: 'var(--c-text)' }}>New Vacancy</Text>}
                styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
                <VacancyForm onSubmit={handleCreate} />
            </Modal>

            {editTarget && (
                <Modal opened={!!editTarget} onClose={() => setEditTarget(null)} title={<Text fw={700} style={{ color: 'var(--c-text)' }}>Edit — {editTarget.title}</Text>}
                    styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
                    <VacancyForm initial={editTarget} onSubmit={handleEdit} />
                </Modal>
            )}
        </DashboardLayout>
    );
}

import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Stack, Select, Button, Modal, SimpleGrid, TextInput, Textarea, NumberInput } from '@mantine/core';
import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useCan } from '../../../../lib/can';

function VacancyForm({ initial = {}, onSubmit, processing, inputStyles, dropdownStyle }) {
    const { data, setData } = useForm({
        title:        initial.title || '',
        department:   initial.department || '',
        description:  initial.description || '',
        requirements: initial.requirements || '',
        openings:     initial.openings || 1,
        closing_date: initial.closing_date || '',
        status:       initial.status || 'open',
    });

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(data); }}>
            <Stack gap="sm">
                <TextInput label="Job Title *" value={data.title} onChange={e => setData('title', e.target.value)} styles={inputStyles} required />
                <Grid gutter="sm">
                    <Grid.Col span={6}><TextInput label="Department" value={data.department} onChange={e => setData('department', e.target.value)} styles={inputStyles} /></Grid.Col>
                    <Grid.Col span={6}><NumberInput label="Openings" value={data.openings} onChange={v => setData('openings', v ?? 1)} min={1} max={99} styles={inputStyles} /></Grid.Col>
                    <Grid.Col span={6}>
                        <Select
                            label="Status"
                            value={data.status}
                            onChange={v => setData('status', v || 'open')}
                            data={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: 'filled', label: 'Filled' }]}
                            styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}><TextInput label="Closing Date" type="date" value={data.closing_date} onChange={e => setData('closing_date', e.target.value)} styles={inputStyles} /></Grid.Col>
                    <Grid.Col span={12}><Textarea label="Description" rows={3} value={data.description} onChange={e => setData('description', e.target.value)} styles={inputStyles} /></Grid.Col>
                    <Grid.Col span={12}><Textarea label="Requirements" rows={3} value={data.requirements} onChange={e => setData('requirements', e.target.value)} styles={inputStyles} /></Grid.Col>
                </Grid>
                <Group justify="flex-end" mt="xs">
                    <Button type="submit" loading={processing} style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', borderRadius: 10, fontWeight: 700, boxShadow: '0 4px 16px rgba(234,88,12,0.4)' }}>Save</Button>
                </Group>
            </Stack>
        </form>
    );
}

export default function RecruitmentIndex({ vacancies, statuses, stats, filters }) {
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

    const [status, setStatus] = useState(filters.status || '');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const can = useCan();

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

    const statCards = [
        { icon: '📋', label: 'Open Vacancies',      value: stats.open,       color: '#22C55E' },
        { icon: '👥', label: 'Total Applications',   value: stats.total_apps, color: '#3B82F6' },
        { icon: '🗓️', label: 'In Interview',          value: stats.interviews, color: '#F59E0B' },
        { icon: '🏆', label: 'Hired',                value: stats.hired,      color: '#A855F7' },
    ];

    return (
        <DashboardLayout title="Recruitment">
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
                                <Text fw={900} size="lg" c="white">Recruitment</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Manage vacancies and applications</Text>
                            </Stack>
                        </Group>
                        {can('hr_recruitment.create') && (
                            <Box
                                component="button"
                                onClick={() => setCreateOpen(true)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                            >
                                + New Vacancy
                            </Box>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="lg">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', boxShadow: cardShadow }}>
                            <Group gap="sm" mb={6}>
                                <Box style={{ width: 34, height: 34, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: '1.1rem' }}>{s.icon}</Text>
                                </Box>
                                <Text size="xs" fw={600} style={{ color: textSec }}>{s.label}</Text>
                            </Group>
                            <Text fw={900} size="xl" style={{ color: s.color }}>{s.value}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filter */}
            <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
                <Select
                    placeholder="All statuses"
                    value={status}
                    onChange={applyFilter}
                    data={[{ value: '', label: 'All' }, ...Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))]}
                    style={{ width: 180 }}
                    styles={{ ...inputStyles, dropdown: dropdownStyle }}
                />
            </Group>

            {/* Vacancies Table */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text size="md">📋</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Vacancies</Text>
                        </Group>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderBottom: `1px solid ${divider}` }}>
                                    {['Title', 'Department', 'Openings', 'Applications', 'Closing', 'Status', ''].map(h => (
                                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: textMut, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {vacancies.data.map(v => {
                                    const st = statuses[v.status] || { label: v.status, color: '#94A3B8' };
                                    return (
                                        <tr key={v.id} style={{ borderBottom: `1px solid ${divider}` }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '14px 16px' }}>
                                                {can('hr_recruitment.view') ? (
                                                    <Box component={Link} href={`/system/hr/recruitment/vacancies/${v.id}`}
                                                        style={{ color: '#EA580C', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>{v.title}</Box>
                                                ) : (
                                                    <Text fw={700} size="sm" style={{ color: textPri }}>{v.title}</Text>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: textSec }}>{v.department || '—'}</Text></td>
                                            <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: textPri }}>{v.openings ?? 1}</Text></td>
                                            <td style={{ padding: '14px 16px' }}><Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{v.applications_count}</Text></td>
                                            <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: textSec }}>{v.closing_date ? new Date(v.closing_date).toLocaleDateString() : '—'}</Text></td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <Box style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${st.color}22`, border: `1px solid ${st.color}44` }}>
                                                    <Text size="xs" fw={700} style={{ color: st.color }}>{st.label}</Text>
                                                </Box>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <Group gap="sm">
                                                    {can('hr_recruitment.view') && (
                                                        <Box component={Link} href={`/system/hr/recruitment/vacancies/${v.id}`}
                                                            style={{ color: '#EA580C', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View →</Box>
                                                    )}
                                                    {can('hr_recruitment.edit') && (
                                                        <Box component="button" onClick={() => setEditTarget(v)}
                                                            style={{ background: 'none', border: 'none', color: textSec, cursor: 'pointer', fontSize: 13 }}>Edit</Box>
                                                    )}
                                                    {can('hr_recruitment.delete') && (
                                                        <Box component="button" onClick={() => del(v)}
                                                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13 }}>Del</Box>
                                                    )}
                                                </Group>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {vacancies.data.length === 0 && (
                            <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎯</Text>
                                <Text fw={600} style={{ color: textPri }}>No vacancies yet</Text>
                                <Text size="sm" style={{ color: textSec, marginTop: 4 }}>Create your first vacancy to get started</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </motion.div>

            {/* Create Modal */}
            <Modal
                opened={createOpen}
                onClose={() => setCreateOpen(false)}
                title={<Text fw={700} style={{ color: textPri }}>New Vacancy</Text>}
                styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}` }, header: { background: cardBg, borderBottom: `1px solid ${divider}` } }}
            >
                <VacancyForm onSubmit={handleCreate} inputStyles={inputStyles} dropdownStyle={dropdownStyle} />
            </Modal>

            {/* Edit Modal */}
            {editTarget && (
                <Modal
                    opened={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    title={<Text fw={700} style={{ color: textPri }}>Edit — {editTarget.title}</Text>}
                    styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}` }, header: { background: cardBg, borderBottom: `1px solid ${divider}` } }}
                >
                    <VacancyForm initial={editTarget} onSubmit={handleEdit} inputStyles={inputStyles} dropdownStyle={dropdownStyle} />
                </Modal>
            )}
        </DashboardLayout>
    );
}

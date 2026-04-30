import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function DeptForm({ dept, onClose, isDark, cardBorder }) {
    const isEdit = !!dept;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:        dept?.name        ?? '',
        code:        dept?.code        ?? '',
        description: dept?.description ?? '',
        is_active:   dept?.is_active   ?? true,
    });

    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inp = (label, key, placeholder = '') => (
        <Box mb="sm">
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box component="input" value={data[key]} onChange={e => setData(key, e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    const submit = e => {
        e.preventDefault();
        if (isEdit) {
            put(`/system/settings/departments/${dept.id}`, { onSuccess: onClose });
        } else {
            post('/system/settings/departments', { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <Box component="form" onSubmit={submit} style={{ background: isDark ? '#07111F' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 10, padding: 20, marginBottom: 12 }}>
            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 14 }}>{isEdit ? 'Edit Department' : 'New Department'}</Text>
            <Group grow mb="sm" align="flex-start">
                <Box style={{ flex: 2 }}>{inp('Department Name *', 'name', 'e.g. Operations')}</Box>
                <Box style={{ flex: 1 }}>{inp('Code', 'code', 'e.g. OPS')}</Box>
            </Group>
            {inp('Description', 'description', 'Brief description of this department')}
            <Group justify="space-between" align="center" mt="sm">
                <Group gap="sm" align="center">
                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id={`active-${dept?.id ?? 'new'}`} />
                    <Text size="sm" style={{ color: textSec }} component="label" htmlFor={`active-${dept?.id ?? 'new'}`}>Active</Text>
                </Group>
                <Group gap="sm">
                    <Box component="button" type="button" onClick={onClose}
                        style={{ padding: '7px 16px', borderRadius: 8, background: 'none', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                        Cancel
                    </Box>
                    <Box component="button" type="submit" disabled={processing}
                        style={{ padding: '7px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        {processing ? 'Saving…' : isEdit ? 'Update' : 'Add Department'}
                    </Box>
                </Group>
            </Group>
        </Box>
    );
}

export default function DepartmentsIndex({ departments }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider    = isDark ? dk.divider : '#F1F5F9';

    const [showNew, setShowNew]   = useState(false);
    const [editing, setEditing]   = useState(null);
    const [confirmDel, setConfirmDel] = useState(null);

    const deleteDept = (id) => {
        router.delete(`/system/settings/departments/${id}`, { onSuccess: () => setConfirmDel(null) });
    };

    return (
        <DashboardLayout title="Departments">
            <Head title="Departments" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Departments</Text>
                    <Text size="sm" style={{ color: textSec }}>Manage company departments for employee grouping</Text>
                </Stack>
                <Box component="button" onClick={() => { setShowNew(true); setEditing(null); }}
                    style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                    + Add Department
                </Box>
            </Group>

            {showNew && !editing && (
                <DeptForm onClose={() => setShowNew(false)} isDark={isDark} cardBorder={cardBorder} />
            )}

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                {departments.length === 0 ? (
                    <Box style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Text size="sm" style={{ color: textSec }}>No departments yet. Click "Add Department" to get started.</Text>
                    </Box>
                ) : departments.map((d, i) => (
                    <Box key={d.id}>
                        {editing === d.id ? (
                            <Box style={{ padding: '16px 20px', borderBottom: i < departments.length - 1 ? `1px solid ${divider}` : 'none' }}>
                                <DeptForm dept={d} onClose={() => setEditing(null)} isDark={isDark} cardBorder={cardBorder} />
                            </Box>
                        ) : (
                            <Box style={{ padding: '14px 20px', borderBottom: i < departments.length - 1 ? `1px solid ${divider}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <Group gap="md" align="center" style={{ flex: 1 }}>
                                    <Box style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? 'var(--c-border-strong)' : '#EFF6FF', border: `1px solid rgba(33,150,243,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text size="xs" fw={800} style={{ color: '#3B82F6' }}>{d.code || d.name.slice(0, 3).toUpperCase()}</Text>
                                    </Box>
                                    <Box>
                                        <Group gap="sm" align="center">
                                            <Text fw={700} size="sm" style={{ color: textPri }}>{d.name}</Text>
                                            {!d.is_active && <Badge size="xs" color="gray" variant="light">Inactive</Badge>}
                                        </Group>
                                        {d.description && <Text size="xs" style={{ color: textSec }}>{d.description}</Text>}
                                    </Box>
                                </Group>
                                <Group gap="sm">
                                    {confirmDel === d.id ? (
                                        <>
                                            <Text size="xs" style={{ color: textSec }}>Delete?</Text>
                                            <Box component="button" onClick={() => deleteDept(d.id)}
                                                style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Yes</Box>
                                            <Box component="button" onClick={() => setConfirmDel(null)}
                                                style={{ padding: '5px 12px', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontSize: 12 }}>No</Box>
                                        </>
                                    ) : (
                                        <>
                                            <Box component="button" onClick={() => { setEditing(d.id); setShowNew(false); }}
                                                style={{ padding: '5px 14px', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</Box>
                                            <Box component="button" onClick={() => setConfirmDel(d.id)}
                                                style={{ padding: '5px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</Box>
                                        </>
                                    )}
                                </Group>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </DashboardLayout>
    );
}

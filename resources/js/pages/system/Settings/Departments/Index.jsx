import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

function DeptForm({ dept, onClose, isDark, cardBg, cardBorder, divider }) {
    const isEdit = !!dept;
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:        dept?.name        ?? '',
        code:        dept?.code        ?? '',
        description: dept?.description ?? '',
        is_active:   dept?.is_active   ?? true,
    });

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
        <Box component="form" onSubmit={submit} style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
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
                        style={{ padding: '7px 18px', borderRadius: 8, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: processing ? 0.7 : 1 }}>
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

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const [showNew, setShowNew]       = useState(false);
    const [editing, setEditing]       = useState(null);
    const [confirmDel, setConfirmDel] = useState(null);
    const can = useCan();
    const canManage = can('settings.edit');

    const deleteDept = (id) => {
        router.delete(`/system/settings/departments/${id}`, { onSuccess: () => setConfirmDel(null) });
    };

    return (
        <DashboardLayout title="Departments">
            <Head title="Departments" />

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
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏗️</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Departments</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Manage company departments for employee grouping</Text>
                            </Stack>
                        </Group>
                        {canManage && (
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Box
                                    component="button"
                                    onClick={() => { setShowNew(true); setEditing(null); }}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}
                                >
                                    + Add Department
                                </Box>
                            </motion.div>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Inline new-department form */}
            {showNew && !editing && (
                <Box mb={16}>
                    <DeptForm onClose={() => setShowNew(false)} isDark={isDark} cardBg={cardBg} cardBorder={cardBorder} divider={divider} />
                </Box>
            )}

            {/* List card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />

                {departments.length === 0 ? (
                    <Box style={{ padding: '48px 20px', textAlign: 'center' }}>
                        <Text style={{ fontSize: '2rem', marginBottom: 10 }}>🏗️</Text>
                        <Text size="sm" fw={600} style={{ color: textPri }}>No departments yet</Text>
                        <Text size="xs" style={{ color: textMut, marginTop: 4 }}>Click "Add Department" to get started.</Text>
                    </Box>
                ) : departments.map((d, i) => (
                    <Box key={d.id}>
                        {editing === d.id ? (
                            <Box style={{ padding: '16px 20px', borderBottom: i < departments.length - 1 ? `1px solid ${divider}` : 'none' }}>
                                <DeptForm dept={d} onClose={() => setEditing(null)} isDark={isDark} cardBg={cardBg} cardBorder={cardBorder} divider={divider} />
                            </Box>
                        ) : (
                            <Box
                                style={{ padding: '14px 20px', borderBottom: i < departments.length - 1 ? `1px solid ${divider}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeftColor = '#EA580C'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
                            >
                                <Group gap="md" align="center" style={{ flex: 1 }}>
                                    <Box style={{ width: 42, height: 42, borderRadius: 10, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7ED', border: '1px solid rgba(234,88,12,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Text size="xs" fw={800} style={{ color: '#EA580C' }}>{d.code || d.name.slice(0, 3).toUpperCase()}</Text>
                                    </Box>
                                    <Box>
                                        <Group gap="sm" align="center">
                                            <Text fw={700} size="sm" style={{ color: textPri }}>{d.name}</Text>
                                            {!d.is_active && (
                                                <Box style={{ display: 'inline-flex', padding: '1px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                    <Text size="10px" fw={700} style={{ color: '#EF4444' }}>Inactive</Text>
                                                </Box>
                                            )}
                                        </Group>
                                        {d.description && <Text size="xs" style={{ color: textSec }}>{d.description}</Text>}
                                    </Box>
                                </Group>
                                <Group gap="sm">
                                    {canManage && confirmDel === d.id ? (
                                        <>
                                            <Text size="xs" style={{ color: textSec }}>Delete?</Text>
                                            <Box component="button" onClick={() => deleteDept(d.id)}
                                                style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                                Yes
                                            </Box>
                                            <Box component="button" onClick={() => setConfirmDel(null)}
                                                style={{ padding: '5px 12px', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontSize: 12 }}>
                                                No
                                            </Box>
                                        </>
                                    ) : canManage ? (
                                        <>
                                            <Box component="button" onClick={() => { setEditing(d.id); setShowNew(false); }}
                                                style={{ padding: '5px 14px', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                                Edit
                                            </Box>
                                            <Box component="button" onClick={() => setConfirmDel(d.id)}
                                                style={{ padding: '5px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                                Delete
                                            </Box>
                                        </>
                                    ) : null}
                                </Group>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </DashboardLayout>
    );
}

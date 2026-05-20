import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal, Badge, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function AllowanceForm({ allowance, employees, types, onClose, isDark, cardBg, cardBorder, textPri, textSec, divider, inputBg }) {
    const isEdit = !!allowance;
    const { data, setData, post, put, processing, errors } = useForm({
        employee_id:  allowance?.employee_id ? String(allowance.employee_id) : '',
        name:         allowance?.name ?? '',
        type:         allowance?.type ?? 'FIXED',
        amount:       allowance?.amount ?? '',
        description:  allowance?.description ?? '',
        is_taxable:   allowance?.is_taxable ?? false,
        is_active:    allowance?.is_active ?? true,
    });

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/system/hr/allowances/${allowance.id}`, { onSuccess: onClose });
        } else {
            post('/system/hr/allowances', { onSuccess: onClose });
        }
    };

    const inp = (label, key, placeholder = '', type = 'text') => (
        <Box mb="sm">
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box
                component="input"
                type={type}
                value={data[key]}
                onChange={e => setData(key, e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 16 }}>{isEdit ? 'Edit' : 'Add'} Allowance</Text>
            {!isEdit && (
                <Select
                    label="Employee *"
                    data={employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))}
                    value={data.employee_id}
                    onChange={v => setData('employee_id', v ?? '')}
                    searchable
                    styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    mb="sm"
                    error={errors.employee_id}
                />
            )}
            {inp('Name *', 'name', 'e.g. Housing Allowance')}
            <Group grow gap="md" mb="sm">
                <Select
                    label="Type *"
                    data={types.map(t => ({ value: t, label: t }))}
                    value={data.type}
                    onChange={v => setData('type', v ?? 'FIXED')}
                    styles={{ ...inputStyles, dropdown: dropdownStyle }}
                />
                {inp('Amount *', 'amount', data.type === 'FIXED' ? 'TZS amount' : 'Percentage %', 'number')}
            </Group>
            {inp('Description', 'description', 'Optional description')}
            <Group gap="md" mb="md">
                <Group gap={8}>
                    <Box component="input" type="checkbox" checked={data.is_taxable} onChange={e => setData('is_taxable', e.target.checked)} id="is_taxable" />
                    <Text component="label" htmlFor="is_taxable" size="sm" style={{ color: textSec, cursor: 'pointer' }}>Taxable</Text>
                </Group>
                {isEdit && (
                    <Group gap={8}>
                        <Box component="input" type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id="is_active" />
                        <Text component="label" htmlFor="is_active" size="sm" style={{ color: textSec, cursor: 'pointer' }}>Active</Text>
                    </Group>
                )}
            </Group>
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#C2410C,#EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(234,88,12,0.4)', opacity: processing ? 0.7 : 1 }}>
                    {processing ? 'Saving…' : isEdit ? 'Update' : 'Add'}
                </Box>
            </Group>
        </Box>
    );
}

export default function AllowancesIndex({ allowances, employees, types }) {
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

    const [modal, setModal] = useState(null);
    const can = useCan();

    const formProps = { isDark, cardBg, cardBorder, textPri, textSec, divider, inputBg };

    return (
        <DashboardLayout title="Employee Allowances">
            <Head title="Employee Allowances" />

            <Modal
                opened={!!modal}
                onClose={() => setModal(null)}
                withCloseButton={false}
                styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}` }, header: { background: cardBg } }}
            >
                {modal !== null && (
                    <AllowanceForm
                        allowance={modal === 'new' ? null : modal}
                        employees={employees}
                        types={types}
                        onClose={() => setModal(null)}
                        {...formProps}
                    />
                )}
            </Modal>

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
                                🎁
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Employee Allowances</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Per-employee allowances auto-included in payroll</Text>
                            </Stack>
                        </Group>
                        {can('hr_allowances.create') && (
                            <Box
                                component="button"
                                onClick={() => setModal('new')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                            >
                                + New Allowance
                            </Box>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text size="md">📋</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Allowances List</Text>
                        </Group>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC', borderBottom: `1px solid ${divider}` }}>
                                    {['#', 'Employee', 'Allowance Name', 'Type', 'Amount', 'Description', 'Actions'].map((h, i) => (
                                        <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textMut, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allowances.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                                            <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎁</Text>
                                            <Text fw={600} style={{ color: textPri }}>No allowances found</Text>
                                            <Text size="sm" style={{ color: textSec, marginTop: 4 }}>Add allowances to include them in payroll</Text>
                                        </td>
                                    </tr>
                                ) : allowances.map((a, idx) => (
                                    <tr key={a.id} style={{ borderBottom: `1px solid ${divider}`, opacity: a.is_active ? 1 : 0.5 }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{idx + 1}</Text>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Text fw={600} size="sm" style={{ color: textPri }}>{a.employee?.name}</Text>
                                            <Text size="xs" style={{ color: textSec }}>{a.employee?.employee_number}</Text>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Text fw={600} size="sm" style={{ color: textPri }}>{a.name}</Text>
                                            {a.is_taxable && (
                                                <Badge size="xs" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>Taxable</Badge>
                                            )}
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Badge size="sm" style={{ background: a.type === 'FIXED' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: a.type === 'FIXED' ? '#3B82F6' : '#F59E0B', border: `1px solid ${a.type === 'FIXED' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                                                {a.type}
                                            </Badge>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Text fw={700} size="sm" style={{ color: '#22C55E' }}>
                                                {a.type === 'FIXED' ? `TZS ${fmt(a.amount)}` : `${a.amount}%`}
                                            </Text>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Text size="sm" style={{ color: textSec }}>{a.description ?? '—'}</Text>
                                        </td>
                                        <td style={{ padding: '13px 14px' }}>
                                            <Group gap={6}>
                                                {can('hr_allowances.edit') && (
                                                    <Box component="button" onClick={() => setModal(a)} style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(234,88,12,0.15)', border: '1px solid rgba(234,88,12,0.3)', color: '#EA580C', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✏️</Box>
                                                )}
                                                {can('hr_allowances.delete') && (
                                                    <Box component="button" onClick={() => { if (confirm('Delete this allowance?')) router.delete(`/system/hr/allowances/${a.id}`, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>×</Box>
                                                )}
                                            </Group>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </motion.div>
        </DashboardLayout>
    );
}

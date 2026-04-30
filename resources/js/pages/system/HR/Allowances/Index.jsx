import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function AllowanceForm({ allowance, employees, types, onClose, isDark, cardBorder }) {
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
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const iS = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };

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
            <Box component="input" type={type} value={data[key]} onChange={e => setData(key, e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Add'} Allowance</Text>
            {!isEdit && <Select label="Employee *" data={employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))} value={data.employee_id} onChange={v => setData('employee_id', v ?? '')} searchable styles={iS} mb="sm" error={errors.employee_id} />}
            {inp('Name *', 'name', 'e.g. Housing Allowance')}
            <Group grow gap="md" mb="sm">
                <Select label="Type *" data={types.map(t => ({ value: t, label: t }))} value={data.type} onChange={v => setData('type', v ?? 'FIXED')} styles={iS} />
                {inp('Amount *', 'amount', data.type === 'FIXED' ? 'TZS amount' : 'Percentage %', 'number')}
            </Group>
            {inp('Description', 'description', 'Optional description')}
            <Group gap="md" mb="md">
                <Group gap={8}>
                    <Box component="input" type="checkbox" checked={data.is_taxable} onChange={e => setData('is_taxable', e.target.checked)} id="is_taxable" />
                    <Text component="label" htmlFor="is_taxable" size="sm" style={{ color: textSec, cursor: 'pointer' }}>Taxable</Text>
                </Group>
                {isEdit && <Group gap={8}>
                    <Box component="input" type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id="is_active" />
                    <Text component="label" htmlFor="is_active" size="sm" style={{ color: textSec, cursor: 'pointer' }}>Active</Text>
                </Group>}
            </Group>
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Box>
            </Group>
        </Box>
    );
}

export default function AllowancesIndex({ allowances, employees, types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [modal, setModal] = useState(null);

    return (
        <DashboardLayout title="Employee Allowances">
            <Head title="Employee Allowances" />
            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false} styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal !== null && <AllowanceForm allowance={modal === 'new' ? null : modal} employees={employees} types={types} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Employee Allowances</Text>
                    <Text size="sm" style={{ color: textSec }}>Per-employee allowances auto-included in payroll</Text>
                </Stack>
                <Box component="button" onClick={() => setModal('new')} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ New Allowance</Box>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['#', 'EMPLOYEE', 'ALLOWANCE NAME', 'TYPE', 'AMOUNT', 'DESCRIPTION', 'ACTIONS'].map((h, i) => (
                                    <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allowances.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No allowances found.</td></tr>
                            ) : allowances.map((a, idx) => (
                                <tr key={a.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}`, opacity: a.is_active ? 1 : 0.5 }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 14px' }}><Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{idx + 1}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{a.employee?.name}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{a.employee?.employee_number}</Text>
                                    </td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{a.name}</Text>
                                        {a.is_taxable && <Badge size="xs" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>Taxable</Badge>}
                                    </td>
                                    <td style={{ padding: '13px 14px' }}><Badge size="sm" style={{ background: a.type === 'FIXED' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: a.type === 'FIXED' ? '#3B82F6' : '#F59E0B', border: `1px solid ${a.type === 'FIXED' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'}` }}>{a.type}</Badge></td>
                                    <td style={{ padding: '13px 14px' }}><Text fw={700} size="sm" style={{ color: '#22C55E' }}>{a.type === 'FIXED' ? `TZS ${fmt(a.amount)}` : `${a.amount}%`}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec }}>{a.description ?? '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Group gap={6}>
                                            <Box component="button" onClick={() => setModal(a)} style={{ padding: '5px 12px', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</Box>
                                            <Box component="button" onClick={() => { if (confirm('Delete this allowance?')) router.delete(`/system/hr/allowances/${a.id}`, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</Box>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Box>
        </DashboardLayout>
    );
}

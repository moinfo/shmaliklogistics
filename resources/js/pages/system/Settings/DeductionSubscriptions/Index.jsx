import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function SubscriptionForm({ sub, employees, deductionTypes, onClose, isDark, cardBorder }) {
    const isEdit = !!sub;
    const { data, setData, post, put, processing, errors } = useForm({
        employee_id:       sub?.employee_id ? String(sub.employee_id) : '',
        deduction_type_id: sub?.deduction_type_id ? String(sub.deduction_type_id) : '',
        membership_number: sub?.membership_number ?? '',
        fixed_amount:      sub?.fixed_amount ?? '',
    });
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const iS = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/system/settings/deduction-subscriptions/${sub.id}`, { onSuccess: onClose });
        } else {
            post('/system/settings/deduction-subscriptions', { onSuccess: onClose });
        }
    };

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Add'} Deduction Subscription</Text>
            {!isEdit && <Select label="Employee *" data={employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))} value={data.employee_id} onChange={v => setData('employee_id', v ?? '')} searchable styles={iS} mb="sm" error={errors.employee_id} />}
            {!isEdit && <Select label="Deduction Type *" data={deductionTypes.map(d => ({ value: String(d.id), label: d.name }))} value={data.deduction_type_id} onChange={v => setData('deduction_type_id', v ?? '')} styles={iS} mb="sm" error={errors.deduction_type_id} />}
            <Box mb="sm">
                <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Membership Number</Text>
                <Box component="input" value={data.membership_number} onChange={e => setData('membership_number', e.target.value)} placeholder="e.g. 481-823-16"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </Box>
            <Box mb="md">
                <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Fixed Monthly Amount (TZS) — for HESLB</Text>
                <Box component="input" type="number" value={data.fixed_amount} onChange={e => setData('fixed_amount', e.target.value)} placeholder="0 (leave blank if not applicable)"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </Box>
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Box>
            </Group>
        </Box>
    );
}

export default function DeductionSubscriptionsIndex({ subscriptions, employees, deductionTypes }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [modal, setModal] = useState(null);

    return (
        <DashboardLayout title="Deduction Subscriptions">
            <Head title="Deduction Subscriptions" />
            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false} styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal !== null && <SubscriptionForm sub={modal === 'new' ? null : modal} employees={employees} deductionTypes={deductionTypes} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Deduction Subscriptions</Text>
                    <Text size="sm" style={{ color: textSec }}>Employee registration numbers for each deduction type</Text>
                </Stack>
                <Box component="button" onClick={() => setModal('new')} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Add Subscription</Box>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['#', 'NAME', 'DEDUCTION', 'MEMBERSHIP NUMBER', 'FIXED AMOUNT', 'ACTIONS'].map((h, i) => (
                                    <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No subscriptions found. Add employee deduction registrations above.</td></tr>
                            ) : subscriptions.map((s, idx) => (
                                <tr key={s.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 14px' }}><Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{idx + 1}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{s.employee?.name}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{s.employee?.employee_number}</Text>
                                    </td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{s.deduction_type?.abbreviation}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textPri, fontFamily: 'monospace' }}>{s.membership_number ?? '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: s.fixed_amount ? '#F59E0B' : textSec }}>{s.fixed_amount ? `TZS ${Number(s.fixed_amount).toLocaleString()}` : '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Group gap={6}>
                                            <Box component="button" onClick={() => setModal(s)} style={{ padding: '5px 12px', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</Box>
                                            <Box component="button" onClick={() => { if (confirm('Remove this subscription?')) router.delete(`/system/settings/deduction-subscriptions/${s.id}`, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</Box>
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

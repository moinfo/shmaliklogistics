import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

const COMMON_BANKS = ['CRDB BANK', 'NMB BANK', 'NBC', 'STANBIC BANK', 'STANDARD CHARTERED', 'EQUITY BANK', 'AZANIA BANK', 'DTB', 'BOA BANK', 'NCBA', 'Other'];

function BankForm({ detail, employees, onClose, isDark, cardBorder }) {
    const isEdit = !!detail;
    const { data, setData, post, put, processing, errors } = useForm({
        employee_id:    detail?.employee_id ? String(detail.employee_id) : '',
        bank_name:      detail?.bank_name ?? '',
        account_number: detail?.account_number ?? '',
        branch:         detail?.branch ?? '',
        account_name:   detail?.account_name ?? '',
        is_primary:     detail?.is_primary ?? true,
    });
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const iS = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/system/settings/bank-details/${detail.id}`, { onSuccess: onClose });
        } else {
            post('/system/settings/bank-details', { onSuccess: onClose });
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
            <Text fw={700} style={{ color: textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Add'} Bank Detail</Text>
            {!isEdit && <Select label="Employee *" data={employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))} value={data.employee_id} onChange={v => setData('employee_id', v ?? '')} searchable styles={iS} mb="sm" error={errors.employee_id} />}
            <Select label="Bank Name *" data={COMMON_BANKS} value={data.bank_name} onChange={v => setData('bank_name', v ?? '')} searchable creatable styles={iS} mb="sm" error={errors.bank_name} />
            {inp('Account Number *', 'account_number', '0152398039400')}
            {inp('Branch', 'branch', 'e.g. MLIMANI CITY')}
            {inp('Account Name', 'account_name', 'Name on account (if different)')}
            <Group justify="flex-end" gap="sm" mt="md">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Box>
            </Group>
        </Box>
    );
}

export default function BankDetailsIndex({ bankDetails, employees }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [modal, setModal] = useState(null);

    return (
        <DashboardLayout title="Staff Bank Details">
            <Head title="Staff Bank Details" />
            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false} styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal !== null && <BankForm detail={modal === 'new' ? null : modal} employees={employees} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Staff Bank Details</Text>
                    <Text size="sm" style={{ color: textSec }}>Employee bank accounts for salary disbursement</Text>
                </Stack>
                <Box component="button" onClick={() => setModal('new')} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Add Bank Detail</Box>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['#', 'STAFF', 'BANK', 'ACCOUNT NUMBER', 'BRANCH', 'ACTIONS'].map((h, i) => (
                                    <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bankDetails.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No bank details found.</td></tr>
                            ) : bankDetails.map((b, idx) => (
                                <tr key={b.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 14px' }}><Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{idx + 1}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{b.employee?.name}</Text>
                                        {b.is_primary && <Badge size="xs" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>Primary</Badge>}
                                    </td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" fw={600} style={{ color: textPri }}>{b.bank_name}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec, fontFamily: 'monospace' }}>{b.account_number}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec }}>{b.branch ?? '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Group gap={6}>
                                            <Box component="button" onClick={() => setModal(b)} style={{ padding: '5px 12px', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</Box>
                                            <Box component="button" onClick={() => { if (confirm('Delete this bank detail?')) router.delete(`/system/settings/bank-details/${b.id}`, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</Box>
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

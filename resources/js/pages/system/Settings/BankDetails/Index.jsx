import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

const COMMON_BANKS = ['CRDB BANK', 'NMB BANK', 'NBC', 'STANBIC BANK', 'STANDARD CHARTERED', 'EQUITY BANK', 'AZANIA BANK', 'DTB', 'BOA BANK', 'NCBA', 'Other'];

function BankForm({ detail, employees, onClose, isDark, cardBg, cardBorder, divider }) {
    const isEdit = !!detail;
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const { data, setData, post, put, processing, errors } = useForm({
        employee_id:    detail?.employee_id ? String(detail.employee_id) : '',
        bank_name:      detail?.bank_name ?? '',
        account_number: detail?.account_number ?? '',
        branch:         detail?.branch ?? '',
        account_name:   detail?.account_name ?? '',
        is_primary:     detail?.is_primary ?? true,
    });

    const iS = {
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        dropdown: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

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
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Add'} Bank Detail</Text>
            {!isEdit && (
                <Select
                    label="Employee *"
                    data={employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))}
                    value={data.employee_id}
                    onChange={v => setData('employee_id', v ?? '')}
                    searchable
                    styles={iS}
                    mb="sm"
                    error={errors.employee_id}
                />
            )}
            <Select
                label="Bank Name *"
                data={COMMON_BANKS}
                value={data.bank_name}
                onChange={v => setData('bank_name', v ?? '')}
                searchable
                creatable
                styles={iS}
                mb="sm"
                error={errors.bank_name}
            />
            {inp('Account Number *', 'account_number', '0152398039400')}
            {inp('Branch', 'branch', 'e.g. MLIMANI CITY')}
            {inp('Account Name', 'account_name', 'Name on account (if different)')}
            <Group justify="flex-end" gap="sm" mt="md">
                <Box component="button" type="button" onClick={onClose}
                    style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>
                    Cancel
                </Box>
                <Box component="button" type="submit" disabled={processing}
                    style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: processing ? 0.7 : 1 }}>
                    {processing ? 'Saving…' : isEdit ? 'Update' : 'Add'}
                </Box>
            </Group>
        </Box>
    );
}

export default function BankDetailsIndex({ bankDetails, employees }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const [modal, setModal] = useState(null);
    const can = useCan();
    const canManage = can('settings.edit');

    return (
        <DashboardLayout title="Staff Bank Details">
            <Head title="Staff Bank Details" />

            <Modal
                opened={!!modal}
                onClose={() => setModal(null)}
                withCloseButton={false}
                styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16 } }}
            >
                {modal !== null && (
                    <BankForm
                        detail={modal === 'new' ? null : modal}
                        employees={employees}
                        onClose={() => setModal(null)}
                        isDark={isDark}
                        cardBg={cardBg}
                        cardBorder={cardBorder}
                        divider={divider}
                    />
                )}
            </Modal>

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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏦</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Staff Bank Details</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Employee bank accounts for salary disbursement</Text>
                            </Stack>
                        </Group>
                        {canManage && (
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Box
                                    component="button"
                                    onClick={() => setModal('new')}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}
                                >
                                    + Add Bank Detail
                                </Box>
                            </motion.div>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                {['#', 'STAFF', 'BANK', 'ACCOUNT NUMBER', 'BRANCH', 'ACTIONS'].map((h, i) => (
                                    <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: textMut, whiteSpace: 'nowrap', letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bankDetails.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                                        <Text style={{ fontSize: '2rem', marginBottom: 10 }}>🏦</Text>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>No bank details found</Text>
                                        <Text size="xs" style={{ color: textMut, marginTop: 4 }}>Add employee bank accounts to enable salary disbursement</Text>
                                    </td>
                                </tr>
                            ) : bankDetails.map((b, idx) => (
                                <tr
                                    key={b.id}
                                    style={{ borderBottom: `1px solid ${divider}`, borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeftColor = '#EA580C'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
                                >
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{idx + 1}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{b.employee?.name}</Text>
                                        {b.is_primary && (
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '1px 8px', marginTop: 2 }}>
                                                <Text size="10px" fw={700} style={{ color: '#22C55E' }}>Primary</Text>
                                            </Box>
                                        )}
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{b.bank_name}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text size="sm" style={{ color: textSec, fontFamily: 'monospace' }}>{b.account_number}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text size="sm" style={{ color: textSec }}>{b.branch ?? '—'}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Group gap={6}>
                                            {canManage && (
                                                <Box component="button" onClick={() => setModal(b)}
                                                    style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.3)', color: '#EA580C', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                                    ✏️ Edit
                                                </Box>
                                            )}
                                            {canManage && (
                                                <Box component="button" onClick={() => { if (confirm('Delete this bank detail?')) router.delete(`/system/settings/bank-details/${b.id}`, { preserveScroll: true }); }}
                                                    style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                                    🗑️
                                                </Box>
                                            )}
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

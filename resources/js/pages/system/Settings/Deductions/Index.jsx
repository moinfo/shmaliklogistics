import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, Modal, Select, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function DeductionForm({ deduction, natures, onClose, isDark, cardBorder }) {
    const isEdit = !!deduction;
    const { data, setData, post, put, processing, errors } = useForm({
        name:                deduction?.name ?? '',
        nature:              deduction?.nature ?? 'GROSS',
        abbreviation:        deduction?.abbreviation ?? '',
        description:         deduction?.description ?? '',
        registration_number: deduction?.registration_number ?? '',
        is_statutory:        deduction?.is_statutory ?? true,
        is_active:           deduction?.is_active ?? true,
    });
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const iS = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/system/settings/deductions/${deduction.id}`, { onSuccess: onClose });
        } else {
            post('/system/settings/deductions', { onSuccess: onClose });
        }
    };

    const field = (label, key, placeholder = '') => (
        <Box mb="sm">
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box component="input" value={data[key]} onChange={e => setData(key, e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Add'} Deduction Type</Text>
            <Group grow gap="md" mb={0}>{field('Name *', 'name', 'e.g. PAYE')}{field('Abbreviation *', 'abbreviation', 'e.g. PAYE')}</Group>
            <Box mb="sm">
                <Select label="Nature *" data={natures} value={data.nature} onChange={v => setData('nature', v ?? 'GROSS')} styles={iS} />
            </Box>
            {field('Description', 'description', 'Optional description')}
            {field('Registration Number', 'registration_number', 'e.g. TRA-12345')}
            <Group justify="flex-end" gap="sm" mt="md">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Box>
            </Group>
        </Box>
    );
}

export default function DeductionsIndex({ deductions, natures }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [modal, setModal] = useState(null);

    const natureColors = { TAXABLE: '#F59E0B', GROSS: '#3B82F6', NET: '#22C55E' };

    return (
        <DashboardLayout title="Deduction Types">
            <Head title="Deduction Types" />
            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false} styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal !== null && <DeductionForm deduction={modal === 'new' ? null : modal} natures={natures.map(n => ({ value: n, label: n }))} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Deduction Types</Text>
                    <Text size="sm" style={{ color: textSec }}>Statutory and custom payroll deduction definitions</Text>
                </Stack>
                <Box component="button" onClick={() => setModal('new')} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Add Deduction</Box>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['#', 'NAME', 'NATURE', 'ABBREVIATION', 'DESCRIPTION', 'REGISTRATION NUMBER', 'ACTIONS'].map((h, i) => (
                                    <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {deductions.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No deduction types found.</td></tr>
                            ) : deductions.map((d, idx) => (
                                <tr key={d.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 14px' }}><Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{idx + 1}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text fw={600} size="sm" style={{ color: textPri }}>{d.name}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Badge size="sm" style={{ background: (natureColors[d.nature] ?? '#94A3B8') + '22', color: natureColors[d.nature] ?? '#94A3B8', border: `1px solid ${(natureColors[d.nature] ?? '#94A3B8')}44` }}>{d.nature}</Badge>
                                    </td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{d.abbreviation}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec }}>{d.description ?? '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec, fontFamily: 'monospace' }}>{d.registration_number ?? '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Group gap={6}>
                                            <Box component="button" onClick={() => setModal(d)} style={{ padding: '5px 12px', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</Box>
                                            <Box component="button" onClick={() => { if (confirm('Delete this deduction type?')) router.delete(`/system/settings/deductions/${d.id}`, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</Box>
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

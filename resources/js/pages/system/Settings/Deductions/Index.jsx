import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

const natureColors = { TAXABLE: '#F59E0B', GROSS: '#EA580C', NET: '#22C55E' };

function DeductionForm({ deduction, natures, onClose, isDark, cardBg, cardBorder }) {
    const isEdit = !!deduction;
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const { data, setData, post, put, processing, errors } = useForm({
        name:                deduction?.name ?? '',
        nature:              deduction?.nature ?? 'GROSS',
        abbreviation:        deduction?.abbreviation ?? '',
        description:         deduction?.description ?? '',
        registration_number: deduction?.registration_number ?? '',
        is_statutory:        deduction?.is_statutory ?? true,
        is_active:           deduction?.is_active ?? true,
    });

    const iS = {
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        dropdown: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

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
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Add'} Deduction Type</Text>
            <Group grow gap="md" mb={0}>
                {field('Name *', 'name', 'e.g. PAYE')}
                {field('Abbreviation *', 'abbreviation', 'e.g. PAYE')}
            </Group>
            <Box mb="sm">
                <Select label="Nature *" data={natures} value={data.nature} onChange={v => setData('nature', v ?? 'GROSS')} styles={iS} />
            </Box>
            {field('Description', 'description', 'Optional description')}
            {field('Registration Number', 'registration_number', 'e.g. TRA-12345')}
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

export default function DeductionsIndex({ deductions, natures }) {
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
        <DashboardLayout title="Deduction Types">
            <Head title="Deduction Types" />

            <Modal
                opened={!!modal}
                onClose={() => setModal(null)}
                withCloseButton={false}
                styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16 } }}
            >
                {modal !== null && (
                    <DeductionForm
                        deduction={modal === 'new' ? null : modal}
                        natures={natures.map(n => ({ value: n, label: n }))}
                        onClose={() => setModal(null)}
                        isDark={isDark}
                        cardBg={cardBg}
                        cardBorder={cardBorder}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💸</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Deduction Types</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Statutory and custom payroll deduction definitions</Text>
                            </Stack>
                        </Group>
                        {canManage && (
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Box
                                    component="button"
                                    onClick={() => setModal('new')}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}
                                >
                                    + Add Deduction
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
                                {['#', 'NAME', 'NATURE', 'ABBREVIATION', 'DESCRIPTION', 'REGISTRATION NUMBER', 'ACTIONS'].map((h, i) => (
                                    <th key={i} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: textMut, whiteSpace: 'nowrap', letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {deductions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                                        <Text style={{ fontSize: '2rem', marginBottom: 10 }}>💸</Text>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>No deduction types found</Text>
                                    </td>
                                </tr>
                            ) : deductions.map((d, idx) => (
                                <tr
                                    key={d.id}
                                    style={{ borderBottom: `1px solid ${divider}`, borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeftColor = '#EA580C'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
                                >
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{idx + 1}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{d.name}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: (natureColors[d.nature] ?? '#64748B') + '18', border: `1px solid ${(natureColors[d.nature] ?? '#64748B')}35`, borderRadius: 20, padding: '3px 10px' }}>
                                            <Text size="xs" fw={700} style={{ color: natureColors[d.nature] ?? '#64748B' }}>{d.nature}</Text>
                                        </Box>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text size="sm" fw={700} style={{ color: '#EA580C' }}>{d.abbreviation}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text size="sm" style={{ color: textSec }}>{d.description ?? '—'}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Text size="sm" style={{ color: textSec, fontFamily: 'monospace' }}>{d.registration_number ?? '—'}</Text>
                                    </td>
                                    <td style={{ padding: '13px 20px' }}>
                                        <Group gap={6}>
                                            {canManage && (
                                                <Box component="button" onClick={() => setModal(d)}
                                                    style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.3)', color: '#EA580C', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                                    ✏️ Edit
                                                </Box>
                                            )}
                                            {canManage && (
                                                <Box component="button" onClick={() => { if (confirm('Delete this deduction type?')) router.delete(`/system/settings/deductions/${d.id}`, { preserveScroll: true }); }}
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

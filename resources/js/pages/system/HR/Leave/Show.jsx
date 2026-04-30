import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, Textarea, Modal } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function ApproveRejectForm({ leaveId, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '' });
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const isApprove = action === 'approve';

    const submit = (e) => {
        e.preventDefault();
        post(`/system/hr/leave/${leaveId}/${action}`, { onSuccess: onClose });
    };

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} size="md" style={{ color: textPri, marginBottom: 12 }}>{isApprove ? '✅ Approve Leave' : '❌ Reject Leave'}</Text>
            <Textarea label="Notes" placeholder="Optional message to the employee…" value={data.approval_notes} onChange={e => setData('approval_notes', e.target.value)} rows={3}
                styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri }, label: { color: textSec, fontSize: 13, fontWeight: 600 } }} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: isApprove ? '#22C55E' : '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : isApprove ? 'Approve' : 'Reject'}
                </Box>
            </Group>
        </Box>
    );
}

export default function ShowLeave({ leave, types, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const [modal, setModal] = useState(null);

    const handleDelete = () => {
        if (!confirm('Delete this leave request?')) return;
        router.delete(`/system/hr/leave/${leave.id}`);
    };

    const isPending = leave.status === 'pending';
    const typeInfo   = types[leave.type]   ?? { label: leave.type, color: '#94A3B8' };
    const statusInfo = statuses[leave.status] ?? { label: leave.status, color: '#94A3B8' };

    return (
        <DashboardLayout title="Leave Request">
            <Head title="Leave Request" />

            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false}
                styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApproveRejectForm leaveId={leave.id} action={modal} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap="sm">
                        <Text fw={800} size="xl" style={{ color: textPri }}>Leave Request</Text>
                        <Badge size="md" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>{statusInfo.label}</Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{leave.employee?.name} · {typeInfo.label}</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/leave" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back</Box>
                    {isPending && (
                        <>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Box component="button" onClick={() => setModal('approve')} style={{ padding: '9px 18px', borderRadius: 9, background: '#22C55E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✅ Approve</Box>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Box component="button" onClick={() => setModal('reject')} style={{ padding: '9px 18px', borderRadius: 9, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>❌ Reject</Box>
                            </motion.div>
                        </>
                    )}
                    <Box component="button" onClick={handleDelete} style={{ padding: '9px 16px', borderRadius: 9, background: 'transparent', border: `1px solid ${cardBorder}`, color: '#EF4444', cursor: 'pointer', fontSize: 13 }}>🗑️</Box>
                </Group>
            </Group>

            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    <Text fw={700} size="xs" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Request Details</Text>
                    <Stack gap={14}>
                        {[
                            ['Employee', leave.employee?.name],
                            ['Employee No.', leave.employee?.employee_number],
                            ['Leave Type', typeInfo.label],
                            ['Start Date', leave.start_date],
                            ['End Date', leave.end_date],
                            ['Duration', `${leave.days} day(s)`],
                        ].map(([label, value]) => (
                            <Group key={label} justify="space-between">
                                <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text>
                                <Text size="sm" fw={500} style={{ color: textPri }}>{value ?? '—'}</Text>
                            </Group>
                        ))}
                    </Stack>
                    {leave.reason && (
                        <>
                            <Box style={{ height: 1, background: isDark ? dk.divider : '#E2E8F0', margin: '16px 0' }} />
                            <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Reason</Text>
                            <Text size="sm" style={{ color: textPri, whiteSpace: 'pre-wrap' }}>{leave.reason}</Text>
                        </>
                    )}
                </Box>

                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    <Text fw={700} size="xs" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Approval</Text>
                    <Stack gap={14}>
                        {[
                            ['Status', <Badge key="s" size="sm" style={{ background: statusInfo.color + '22', color: statusInfo.color }}>{statusInfo.label}</Badge>],
                            ['Approved / Rejected By', leave.approver?.name ?? '—'],
                        ].map(([label, value]) => (
                            <Group key={label} justify="space-between">
                                <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text>
                                <span style={{ fontSize: 13 }}>{value}</span>
                            </Group>
                        ))}
                    </Stack>
                    {leave.approval_notes && (
                        <>
                            <Box style={{ height: 1, background: isDark ? dk.divider : '#E2E8F0', margin: '16px 0' }} />
                            <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Approval Notes</Text>
                            <Text size="sm" style={{ color: textPri, whiteSpace: 'pre-wrap' }}>{leave.approval_notes}</Text>
                        </>
                    )}
                </Box>
            </Box>
        </DashboardLayout>
    );
}

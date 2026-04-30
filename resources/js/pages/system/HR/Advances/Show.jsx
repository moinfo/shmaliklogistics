import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function ApproveForm({ advanceId, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '', deduction_month: '' });
    const textPri = isDark ? dk.textPri : '#1E293B'; const textSec = isDark ? dk.textSec : '#64748B';
    const inputStyles = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 } };
    const submit = (e) => { e.preventDefault(); post(`/system/hr/advances/${advanceId}/approve`, { onSuccess: onClose }); };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 12 }}>✅ Approve Advance</Text>
            <DatePicker label="Deduct in payroll month" value={data.deduction_month} onChange={v => setData('deduction_month', v)} styles={inputStyles} mb="md" />
            <Textarea label="Notes" value={data.approval_notes} onChange={e => setData('approval_notes', e.target.value)} rows={2} styles={inputStyles} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: '#22C55E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : 'Approve'}</Box>
            </Group>
        </Box>
    );
}

export default function ShowAdvance({ advance, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const [modal, setModal] = useState(false);
    const statusInfo = statuses[advance.status] ?? { label: advance.status, color: '#94A3B8' };
    const isPending = advance.status === 'pending';

    const handleReject = () => {
        if (!confirm('Reject this advance request?')) return;
        router.post(`/system/hr/advances/${advance.id}/reject`);
    };

    return (
        <DashboardLayout title="Advance Request">
            <Head title="Advance Request" />
            <Modal opened={modal} onClose={() => setModal(false)} withCloseButton={false} styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                <ApproveForm advanceId={advance.id} onClose={() => setModal(false)} isDark={isDark} cardBorder={cardBorder} />
            </Modal>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap="sm">
                        <Text fw={800} size="xl" style={{ color: textPri }}>Salary Advance</Text>
                        <Badge size="md" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>{statusInfo.label}</Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{advance.employee?.name} · TZS {fmt(advance.amount)}</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/advances" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back</Box>
                    {isPending && <>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" onClick={() => setModal(true)} style={{ padding: '9px 18px', borderRadius: 9, background: '#22C55E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✅ Approve</Box>
                        </motion.div>
                        <Box component="button" onClick={handleReject} style={{ padding: '9px 18px', borderRadius: 9, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>❌ Reject</Box>
                    </>}
                </Group>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px', maxWidth: 600 }}>
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {[
                        ['Employee', advance.employee?.name],
                        ['Employee No.', advance.employee?.employee_number],
                        ['Amount', `TZS ${fmt(advance.amount)}`],
                        ['Requested Date', advance.requested_date],
                        ['Deduct Month', advance.deduction_month ? advance.deduction_month.slice(0, 7) : '—'],
                        ['Approved By', advance.approver?.name ?? '—'],
                    ].map(([label, value]) => (
                        <Box key={label}>
                            <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{label}</Text>
                            <Text size="sm" style={{ color: textPri }}>{value ?? '—'}</Text>
                        </Box>
                    ))}
                </Box>
                {advance.purpose && <Box mt="xl"><Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Purpose</Text><Text size="sm" style={{ color: textPri }}>{advance.purpose}</Text></Box>}
                {advance.approval_notes && <Box mt="lg"><Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Approval Notes</Text><Text size="sm" style={{ color: textPri }}>{advance.approval_notes}</Text></Box>}
                {advance.payroll_slip && (
                    <Box mt="lg" style={{ padding: '12px 16px', background: isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
                        <Text size="sm" style={{ color: '#22C55E' }}>✅ Deducted in payroll run: {advance.payroll_slip?.run?.year ? `${advance.payroll_slip.run.year}` : 'processed'}</Text>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

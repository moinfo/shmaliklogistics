import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function ApprovalModal({ loanId, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '' });
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const isApprove = action === 'approve';
    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };
    const submit = (e) => { e.preventDefault(); post(`/system/hr/loans/${loanId}/${action}`, { onSuccess: onClose }); };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 12 }}>{isApprove ? '✅ Approve Loan' : '❌ Reject Loan'}</Text>
            <Textarea label="Notes" value={data.approval_notes} onChange={e => setData('approval_notes', e.target.value)} rows={2} styles={inputStyles} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: isApprove ? '#22C55E' : '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : isApprove ? 'Approve & Activate' : 'Reject'}
                </Box>
            </Group>
        </Box>
    );
}

export default function ShowLoan({ loan, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const [modal, setModal] = useState(null);
    const statusInfo = statuses[loan.status] ?? { label: loan.status, color: '#94A3B8' };
    const isPending = loan.status === 'pending';

    const pct = loan.total_months > 0 ? Math.round((loan.months_paid / loan.total_months) * 100) : 0;
    const balanceColor = Number(loan.balance_remaining) <= 0 ? '#22C55E' : '#EF4444';

    return (
        <DashboardLayout title="Loan Detail">
            <Head title="Loan Detail" />
            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false}
                styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApprovalModal loanId={loan.id} action={modal} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap="sm">
                        <Text fw={800} size="xl" style={{ color: textPri }}>Employee Loan</Text>
                        <Badge size="md" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>{statusInfo.label}</Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{loan.loan_number} · {loan.employee?.name} · TZS {fmt(loan.principal)}</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/loans" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back</Box>
                    {isPending && <>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" onClick={() => setModal('approve')} style={{ padding: '9px 18px', borderRadius: 9, background: '#22C55E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✅ Approve</Box>
                        </motion.div>
                        <Box component="button" onClick={() => setModal('reject')} style={{ padding: '9px 18px', borderRadius: 9, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>❌ Reject</Box>
                    </>}
                </Group>
            </Group>

            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 860, marginBottom: 20 }}>
                {/* Loan details card */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Loan Details</Text>
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                            ['Loan Number',    loan.loan_number],
                            ['Employee',       loan.employee?.name],
                            ['Employee No.',   loan.employee?.employee_number],
                            ['Principal',      `TZS ${fmt(loan.principal)}`],
                            ['Monthly Installment', `TZS ${fmt(loan.monthly_installment)}/mo`],
                            ['Total Months',   `${loan.total_months} months`],
                            ['Start Date',     loan.start_date],
                            ['Expected End',   loan.expected_end_date ?? '—'],
                            ['Approved By',    loan.approver?.name ?? '—'],
                            ['Approval Notes', loan.approval_notes ?? '—'],
                        ].map(([label, value]) => (
                            <Box key={label}>
                                <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{label}</Text>
                                <Text size="sm" style={{ color: textPri }}>{value ?? '—'}</Text>
                            </Box>
                        ))}
                    </Box>
                    {loan.purpose && (
                        <Box mt="lg">
                            <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Purpose</Text>
                            <Text size="sm" style={{ color: textPri }}>{loan.purpose}</Text>
                        </Box>
                    )}
                </Box>

                {/* Repayment progress card */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Repayment Progress</Text>

                    {/* Big balance remaining */}
                    <Box mb="xl">
                        <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Balance Remaining</Text>
                        <Text size="xl" fw={800} style={{ color: balanceColor }}>TZS {fmt(loan.balance_remaining)}</Text>
                    </Box>

                    {/* Progress bar */}
                    <Box mb="lg">
                        <Group justify="space-between" mb={6}>
                            <Text size="xs" style={{ color: textSec }}>{loan.months_paid} of {loan.total_months} months paid</Text>
                            <Text size="xs" fw={700} style={{ color: pct >= 100 ? '#22C55E' : '#3B82F6' }}>{pct}%</Text>
                        </Group>
                        <Box style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                            <Box style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#22C55E' : 'linear-gradient(90deg,#1565C0,#2196F3)', borderRadius: 4, transition: 'width 0.4s' }} />
                        </Box>
                    </Box>

                    {/* Summary grid */}
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                            ['Principal',       `TZS ${fmt(loan.principal)}`,          '#3B82F6'],
                            ['Total Paid',      `TZS ${fmt(loan.months_paid * loan.monthly_installment)}`, '#22C55E'],
                            ['Months Paid',     `${loan.months_paid}`,                 textPri],
                            ['Months Left',     `${Math.max(0, loan.total_months - loan.months_paid)}`, textPri],
                        ].map(([label, value, color]) => (
                            <Box key={label} style={{ padding: '10px 14px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 8, border: `1px solid ${cardBorder}` }}>
                                <Text size="xs" style={{ color: textSec, marginBottom: 2 }}>{label}</Text>
                                <Text size="sm" fw={700} style={{ color }}>{value}</Text>
                            </Box>
                        ))}
                    </Box>

                    {loan.status === 'settled' && (
                        <Box mt="lg" style={{ padding: '12px 16px', background: isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
                            <Text size="sm" style={{ color: '#22C55E' }}>✅ Loan fully settled</Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </DashboardLayout>
    );
}

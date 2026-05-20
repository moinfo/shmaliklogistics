import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function PersonAvatar({ name, size = 44 }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text size="sm" fw={900} style={{ color }}>{initials}</Text>
        </Box>
    );
}

function InfoRow({ icon, label, value, isDark, highlight }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8} style={{ minWidth: 0 }}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: highlight ?? textPri, textAlign: 'right', wordBreak: 'break-all' }}>
                {value ?? '—'}
            </Text>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent, toolbar }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function ApprovalModal({ loanId, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '' });
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
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
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: isApprove ? 'linear-gradient(135deg, #065F46, #059669)' : 'linear-gradient(135deg, #991B1B, #EF4444)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : isApprove ? 'Approve & Activate' : 'Reject'}
                </Box>
            </Group>
        </Box>
    );
}

export default function ShowLoan({ loan, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';

    const [modal, setModal] = useState(null);
    const statusInfo = statuses[loan.status] ?? { label: loan.status, color: '#94A3B8' };
    const isPending = loan.status === 'pending';

    const pct = loan.total_months > 0 ? Math.round((loan.months_paid / loan.total_months) * 100) : 0;
    const balanceColor = Number(loan.balance_remaining) <= 0 ? '#22C55E' : '#EF4444';

    return (
        <DashboardLayout title="Loan Detail">
            <Head title="Loan Detail" />

            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false}
                styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApprovalModal loanId={loan.id} action={modal} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
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
                            <PersonAvatar name={loan.employee?.name} size={44} />
                            <Stack gap={2}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white">Employee Loan</Text>
                                    <Box style={{ background: statusInfo.color + '30', border: `1px solid ${statusInfo.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{statusInfo.label}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Group gap={6}>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>{loan.loan_number}</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>·</Text>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{loan.employee?.name}</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.5)' }}>·</Text>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>TZS {fmt(loan.principal)}</Text>
                                </Group>
                            </Stack>
                        </Group>
                        <Group gap={8} wrap="wrap">
                            <Box component={Link} href="/system/hr/loans"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                ← Back
                            </Box>
                            {isPending && (
                                <>
                                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                        <Box component="button" onClick={() => setModal('approve')}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#059669', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                            ✅ Approve
                                        </Box>
                                    </motion.div>
                                    <Box component="button" onClick={() => setModal('reject')}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                        ❌ Reject
                                    </Box>
                                </>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Balance + Progress highlight */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb={20}>
                    {/* Balance */}
                    <Box style={{ background: Number(loan.balance_remaining) <= 0 ? 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)' : 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)', borderRadius: 16, padding: '18px 20px', boxShadow: Number(loan.balance_remaining) <= 0 ? '0 8px 28px rgba(16,185,129,0.4)' : '0 8px 28px rgba(239,68,68,0.4)', position: 'relative', overflow: 'hidden', minHeight: 100 }}>
                        <CardWave />
                        <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                        <Text size="xs" c="white" style={{ opacity: 0.75, marginBottom: 6 }}>Balance Remaining</Text>
                        <Text fw={900} c="white" style={{ fontSize: '1.4rem', lineHeight: 1 }}>TZS {fmt(loan.balance_remaining)}</Text>
                    </Box>

                    {/* Principal */}
                    <Box style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', borderRadius: 16, padding: '18px 20px', boxShadow: '0 8px 28px rgba(37,99,235,0.4)', position: 'relative', overflow: 'hidden', minHeight: 100 }}>
                        <CardWave />
                        <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                        <Text size="xs" c="white" style={{ opacity: 0.75, marginBottom: 6 }}>Principal Amount</Text>
                        <Text fw={900} c="white" style={{ fontSize: '1.4rem', lineHeight: 1 }}>TZS {fmt(loan.principal)}</Text>
                    </Box>

                    {/* Progress */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '18px 20px', boxShadow: cardShadow }}>
                        <Text size="xs" style={{ color: textMut, marginBottom: 8 }}>Repayment Progress</Text>
                        <Group justify="space-between" mb={8}>
                            <Text size="sm" fw={700} style={{ color: textPri }}>{loan.months_paid} of {loan.total_months} months</Text>
                            <Text size="sm" fw={800} style={{ color: pct >= 100 ? '#22C55E' : '#EA580C' }}>{pct}%</Text>
                        </Group>
                        <Box style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                            <Box style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#22C55E' : 'linear-gradient(90deg, #C2410C, #F97316)', borderRadius: 4, transition: 'width 0.4s' }} />
                        </Box>
                    </Box>
                </SimpleGrid>
            </motion.div>

            {/* Details + Repayment grid */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                    <SectionCard title="Loan Details" icon="🏦" isDark={isDark} accent={['#C2410C', '#F97316']}>
                        <InfoRow icon="🔖" label="Loan Number"          value={loan.loan_number}                isDark={isDark} />
                        <InfoRow icon="👤" label="Employee"             value={loan.employee?.name}             isDark={isDark} />
                        <InfoRow icon="🆔" label="Employee No."         value={loan.employee?.employee_number}  isDark={isDark} />
                        <InfoRow icon="💰" label="Principal"            value={`TZS ${fmt(loan.principal)}`}    isDark={isDark} highlight="#3B82F6" />
                        <InfoRow icon="📅" label="Monthly Installment"  value={`TZS ${fmt(loan.monthly_installment)}/mo`} isDark={isDark} />
                        <InfoRow icon="🗓️" label="Total Months"         value={`${loan.total_months} months`}   isDark={isDark} />
                        <InfoRow icon="📆" label="Start Date"           value={loan.start_date}                 isDark={isDark} />
                        <InfoRow icon="🏁" label="Expected End"         value={loan.expected_end_date ?? '—'}   isDark={isDark} />
                        <InfoRow icon="✅" label="Approved By"          value={loan.approver?.name ?? '—'}      isDark={isDark} />
                        {loan.purpose && <InfoRow icon="📝" label="Purpose" value={loan.purpose} isDark={isDark} />}
                        {loan.approval_notes && <InfoRow icon="💬" label="Approval Notes" value={loan.approval_notes} isDark={isDark} />}
                    </SectionCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                    <SectionCard title="Repayment Summary" icon="📊" isDark={isDark} accent={['#1D4ED8', '#3B82F6']}>
                        <SimpleGrid cols={2} spacing="sm" mt="sm">
                            {[
                                { label: 'Principal',   value: `TZS ${fmt(loan.principal)}`,                                     color: '#3B82F6' },
                                { label: 'Total Paid',  value: `TZS ${fmt(loan.months_paid * loan.monthly_installment)}`,          color: '#22C55E' },
                                { label: 'Months Paid', value: String(loan.months_paid),                                           color: textPri },
                                { label: 'Months Left', value: String(Math.max(0, loan.total_months - loan.months_paid)),           color: textPri },
                            ].map(({ label, value, color }) => (
                                <Box key={label} style={{ padding: '12px 14px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 10, border: `1px solid ${cardBorder}` }}>
                                    <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
                                    <Text size="sm" fw={700} style={{ color }}>{value}</Text>
                                </Box>
                            ))}
                        </SimpleGrid>

                        {loan.status === 'settled' && (
                            <Box mt="md" style={{ padding: '14px 18px', background: isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4', borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
                                <Group gap={10}>
                                    <Text size="xl">✅</Text>
                                    <Stack gap={1}>
                                        <Text fw={700} size="sm" style={{ color: '#22C55E' }}>Loan Fully Settled</Text>
                                        <Text size="xs" style={{ color: isDark ? '#4ADE80' : '#15803D' }}>All installments have been paid</Text>
                                    </Stack>
                                </Group>
                            </Box>
                        )}
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/hr/loans"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Loans
                </Box>
            </Box>
        </DashboardLayout>
    );
}

import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Modal, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

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

function SectionCard({ title, icon, children, isDark, accent }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <Text size="md">{icon}</Text>}
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function ApproveForm({ advanceId, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '', deduction_month: '' });
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };
    const submit = (e) => { e.preventDefault(); post(`/system/hr/advances/${advanceId}/approve`, { onSuccess: onClose }); };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 12 }}>✅ Approve Advance</Text>
            <DatePicker label="Deduct in payroll month" value={data.deduction_month} onChange={v => setData('deduction_month', v)} styles={inputStyles} mb="md" />
            <Textarea label="Notes" value={data.approval_notes} onChange={e => setData('approval_notes', e.target.value)} rows={2} styles={inputStyles} mb="md" />
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #065F46, #059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {processing ? 'Saving…' : 'Approve'}
                </Box>
            </Group>
        </Box>
    );
}

export default function ShowAdvance({ advance, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';

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

            <Modal opened={modal} onClose={() => setModal(false)} withCloseButton={false}
                styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}>
                <ApproveForm advanceId={advance.id} onClose={() => setModal(false)} isDark={isDark} cardBorder={cardBorder} />
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
                            <PersonAvatar name={advance.employee?.name} size={44} />
                            <Stack gap={2}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white">Salary Advance</Text>
                                    <Box style={{ background: statusInfo.color + '30', border: `1px solid ${statusInfo.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{statusInfo.label}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {advance.employee?.name} · TZS {fmt(advance.amount)}
                                </Text>
                            </Stack>
                        </Group>
                        <Group gap={8} wrap="wrap">
                            <Box component={Link} href="/system/hr/advances"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                ← Back
                            </Box>
                            {isPending && (
                                <>
                                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                        <Box component="button" onClick={() => setModal(true)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#059669', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                            ✅ Approve
                                        </Box>
                                    </motion.div>
                                    <Box component="button" onClick={handleReject}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                        ❌ Reject
                                    </Box>
                                </>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Amount highlight card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb={20}>
                    <Box style={{ background: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', borderRadius: 16, padding: '18px 20px', boxShadow: '0 8px 28px rgba(16,185,129,0.4)', position: 'relative', overflow: 'hidden', minHeight: 100 }}>
                        <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                        <Text size="xs" c="white" style={{ opacity: 0.75, marginBottom: 6 }}>Advance Amount</Text>
                        <Text fw={900} c="white" style={{ fontSize: '1.5rem', lineHeight: 1 }}>TZS {fmt(advance.amount)}</Text>
                    </Box>
                    <Box style={{ background: isDark ? cardBg : '#ffffff', border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '18px 20px', boxShadow: cardShadow }}>
                        <Text size="xs" style={{ color: textMut, marginBottom: 6 }}>Requested Date</Text>
                        <Text fw={700} size="lg" style={{ color: textPri }}>{advance.requested_date ?? '—'}</Text>
                    </Box>
                    <Box style={{ background: isDark ? cardBg : '#ffffff', border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '18px 20px', boxShadow: cardShadow }}>
                        <Text size="xs" style={{ color: textMut, marginBottom: 6 }}>Deduct Month</Text>
                        <Text fw={700} size="lg" style={{ color: textPri }}>{advance.deduction_month ? advance.deduction_month.slice(0, 7) : '—'}</Text>
                    </Box>
                </SimpleGrid>
            </motion.div>

            {/* Details section */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <SectionCard title="Advance Details" icon="📋" isDark={isDark} accent={['#C2410C', '#F97316']}>
                    <InfoRow icon="👤" label="Employee"      value={advance.employee?.name}           isDark={isDark} />
                    <InfoRow icon="🆔" label="Employee No."  value={advance.employee?.employee_number} isDark={isDark} />
                    <InfoRow icon="💵" label="Amount"        value={`TZS ${fmt(advance.amount)}`}     isDark={isDark} highlight="#22C55E" />
                    <InfoRow icon="📅" label="Requested Date" value={advance.requested_date}           isDark={isDark} />
                    <InfoRow icon="🗓️" label="Deduct Month"  value={advance.deduction_month ? advance.deduction_month.slice(0, 7) : '—'} isDark={isDark} />
                    <InfoRow icon="✅" label="Approved By"   value={advance.approver?.name ?? '—'}    isDark={isDark} />
                    {advance.purpose && <InfoRow icon="📝" label="Purpose" value={advance.purpose} isDark={isDark} />}
                    {advance.approval_notes && <InfoRow icon="💬" label="Approval Notes" value={advance.approval_notes} isDark={isDark} />}
                </SectionCard>
            </motion.div>

            {/* Deducted confirmation */}
            {advance.payroll_slip && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                    <Box mt={16} style={{ background: isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 14, padding: '16px 20px' }}>
                        <Group gap={10}>
                            <Text size="xl">✅</Text>
                            <Stack gap={1}>
                                <Text fw={700} size="sm" style={{ color: '#22C55E' }}>Advance Deducted</Text>
                                <Text size="xs" style={{ color: isDark ? '#4ADE80' : '#15803D' }}>
                                    Deducted in payroll run: {advance.payroll_slip?.run?.year ? String(advance.payroll_slip.run.year) : 'processed'}
                                </Text>
                            </Stack>
                        </Group>
                    </Box>
                </motion.div>
            )}

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/hr/advances"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Advances
                </Box>
            </Box>
        </DashboardLayout>
    );
}

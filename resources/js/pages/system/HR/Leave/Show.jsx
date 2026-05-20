import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Textarea, Modal, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

function InfoRow({ icon, label, value, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: textPri, textAlign: 'right' }}>{value ?? '—'}</Text>
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

function StatusPill({ color, label }) {
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: `1px solid ${color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
            <Text size="xs" fw={700} style={{ color, letterSpacing: 0.4 }}>{label}</Text>
        </Box>
    );
}

function PersonAvatar({ name, size = 48 }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text fw={900} style={{ color, fontSize: size * 0.32 }}>{initials}</Text>
        </Box>
    );
}

function ApproveRejectForm({ leaveId, action, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing } = useForm({ approval_notes: '' });
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
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

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    const [modal, setModal] = useState(null);
    const can = useCan();

    const handleDelete = () => {
        if (!confirm('Delete this leave request?')) return;
        router.delete(`/system/hr/leave/${leave.id}`);
    };

    const isPending  = leave.status === 'pending';
    const typeInfo   = types[leave.type]      ?? { label: leave.type,   color: '#94A3B8' };
    const statusInfo = statuses[leave.status] ?? { label: leave.status, color: '#94A3B8' };

    return (
        <DashboardLayout title="Leave Request">
            <Head title="Leave Request" />

            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false}
                styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal && <ApproveRejectForm leaveId={leave.id} action={modal} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            {/* ── Page header banner ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={14} align="center">
                            <PersonAvatar name={leave.employee?.name ?? '?'} size={48} />
                            <Stack gap={4}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white">Leave Request</Text>
                                    <Box style={{ background: statusInfo.color + '30', border: `1px solid ${statusInfo.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{statusInfo.label}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Group gap={8} align="center">
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{leave.employee?.name}</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)' }}>·</Text>
                                    <Box style={{ display: 'inline-flex', background: typeInfo.color + '30', border: `1px solid ${typeInfo.color}50`, borderRadius: 12, padding: '2px 10px' }}>
                                        <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.9)' }}>{typeInfo.label}</Text>
                                    </Box>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.6)' }}>· {leave.days} day(s)</Text>
                                </Group>
                            </Stack>
                        </Group>

                        <Group gap={8} wrap="wrap">
                            <Box component={Link} href="/system/hr/leave"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                ← Back
                            </Box>
                            {can('hr_leave.approve') && isPending && (
                                <>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Box component="button" onClick={() => setModal('approve')}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.25)', border: '1px solid rgba(34,197,94,0.45)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                            ✅ Approve
                                        </Box>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Box component="button" onClick={() => setModal('reject')}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.45)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                            ❌ Reject
                                        </Box>
                                    </motion.div>
                                </>
                            )}
                            {can('hr_leave.delete') && (
                                <Box component="button" onClick={handleDelete}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                    🗑️
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Detail cards ── */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {/* Request Details */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Request Details" icon="📋" isDark={isDark} accent={['#C2410C', '#EA580C']}>
                        <InfoRow icon="👤" label="Employee"     value={leave.employee?.name}            isDark={isDark} />
                        <InfoRow icon="🆔" label="Employee No." value={leave.employee?.employee_number} isDark={isDark} />
                        <InfoRow icon="🏷️" label="Leave Type"   value={typeInfo.label}                  isDark={isDark} />
                        <InfoRow icon="📅" label="Start Date"   value={leave.start_date}                isDark={isDark} />
                        <InfoRow icon="📅" label="End Date"     value={leave.end_date}                  isDark={isDark} />
                        <InfoRow icon="⏱️" label="Duration"     value={`${leave.days} day(s)`}          isDark={isDark} />

                        {leave.reason && (
                            <>
                                <Box style={{ height: 1, background: divider, margin: '8px 0 12px' }} />
                                <Stack gap={6}>
                                    <Text size="xs" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9 }}>Reason</Text>
                                    <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{leave.reason}</Text>
                                </Stack>
                            </>
                        )}
                    </SectionCard>
                </motion.div>

                {/* Approval */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Approval" icon="✅" isDark={isDark} accent={['#065F46', '#059669']}>
                        {/* Status banner */}
                        <Box mt="md" mb="md" style={{
                            background: statusInfo.color + (isDark ? '15' : '10'),
                            border: `1px solid ${statusInfo.color}35`,
                            borderRadius: 12, padding: '14px 18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <Stack gap={2}>
                                <Text size="xs" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>Current Status</Text>
                                <StatusPill color={statusInfo.color} label={statusInfo.label} />
                            </Stack>
                            {leave.approver?.name && (
                                <Stack gap={2} align="flex-end">
                                    <Text size="xs" style={{ color: textMut }}>Reviewed by</Text>
                                    <Text size="sm" fw={700} style={{ color: textPri }}>{leave.approver.name}</Text>
                                </Stack>
                            )}
                        </Box>

                        <InfoRow icon="👤" label="Approved / Rejected By" value={leave.approver?.name ?? '—'} isDark={isDark} />

                        {leave.approval_notes && (
                            <>
                                <Box style={{ height: 1, background: divider, margin: '8px 0 12px' }} />
                                <Stack gap={6}>
                                    <Text size="xs" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9 }}>Approval Notes</Text>
                                    <Box style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`, borderRadius: 10, padding: '12px 14px' }}>
                                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{leave.approval_notes}</Text>
                                    </Box>
                                </Stack>
                            </>
                        )}

                        {isPending && can('hr_leave.approve') && (
                            <Box mt="md" style={{ background: isDark ? 'rgba(245,158,11,0.08)' : '#FFFBEB', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '14px 16px' }}>
                                <Group gap={8} mb={12}>
                                    <Text size="sm">⏳</Text>
                                    <Text size="sm" fw={700} style={{ color: '#F59E0B' }}>Awaiting approval</Text>
                                </Group>
                                <Group gap={8}>
                                    <Box component="button" onClick={() => setModal('approve')}
                                        style={{ flex: 1, padding: '8px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        ✅ Approve
                                    </Box>
                                    <Box component="button" onClick={() => setModal('reject')}
                                        style={{ flex: 1, padding: '8px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        ❌ Reject
                                    </Box>
                                </Group>
                            </Box>
                        )}
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            <Box mt="xl">
                <Box component={Link} href="/system/hr/leave"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Leave
                </Box>
            </Box>
        </DashboardLayout>
    );
}

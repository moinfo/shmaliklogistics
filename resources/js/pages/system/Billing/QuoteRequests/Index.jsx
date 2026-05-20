import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function ReviewModal({ req, statuses, onClose, isDark }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const inputStyles = {
        label: { color: textSec, fontSize: 13, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    const [status, setStatus]   = useState(req.status);
    const [notes, setNotes]     = useState(req.staff_notes ?? '');
    const [processing, setProc] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setProc(true);
        router.patch(`/system/billing/quote-requests/${req.id}`, { status, staff_notes: notes }, {
            onSuccess: () => { setProc(false); onClose(); },
            onFinish:  () => setProc(false),
        });
    };

    return (
        <Box style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, width: '100%', maxWidth: 540, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', overflow: 'hidden' }}>

                {/* Modal header bar */}
                <Box style={{ height: 4, background: 'linear-gradient(90deg, #EA580C, #F97316)' }} />
                <Box style={{ padding: '20px 24px 0' }}>
                    <Group justify="space-between" mb="lg">
                        <Group gap={10}>
                            <Box style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(234,88,12,0.15)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                📋
                            </Box>
                            <Text fw={800} size="lg" style={{ color: textPri }}>Review Request</Text>
                        </Group>
                        <Box component="button" onClick={onClose} style={{ background: 'none', border: `1px solid ${cardBorder}`, borderRadius: 8, color: textSec, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '4px 10px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</Box>
                    </Group>

                    {/* Request details summary */}
                    <Box style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                        <Stack gap={0}>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${divider}` }}>
                                <Text size="xs" style={{ color: textSec }}>Client</Text>
                                <Text size="sm" fw={600} style={{ color: textPri }}>{req.client?.name}</Text>
                            </Box>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${divider}` }}>
                                <Text size="xs" style={{ color: textSec }}>Route</Text>
                                <Text size="sm" fw={600} style={{ color: textPri }}>{req.route_from} → {req.route_to}</Text>
                            </Box>
                            <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: req.cargo_weight_kg || req.preferred_date || req.notes ? `1px solid ${divider}` : 'none' }}>
                                <Text size="xs" style={{ color: textSec }}>Cargo</Text>
                                <Text size="sm" fw={600} style={{ color: textPri }}>{req.cargo_description}</Text>
                            </Box>
                            {req.cargo_weight_kg && (
                                <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: req.preferred_date || req.notes ? `1px solid ${divider}` : 'none' }}>
                                    <Text size="xs" style={{ color: textSec }}>Weight</Text>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{req.cargo_weight_kg} kg</Text>
                                </Box>
                            )}
                            {req.preferred_date && (
                                <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: req.notes ? `1px solid ${divider}` : 'none' }}>
                                    <Text size="xs" style={{ color: textSec }}>Preferred Date</Text>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{formatDate(req.preferred_date)}</Text>
                                </Box>
                            )}
                            {req.notes && (
                                <Box style={{ paddingTop: 10 }}>
                                    <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Client Notes</Text>
                                    <Text size="sm" style={{ color: textPri, whiteSpace: 'pre-wrap' }}>{req.notes}</Text>
                                </Box>
                            )}
                        </Stack>
                    </Box>

                    <form onSubmit={submit}>
                        <Stack gap="md" style={{ paddingBottom: 4 }}>
                            <Select
                                label="Status"
                                value={status}
                                onChange={v => setStatus(v)}
                                data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                                styles={{ ...inputStyles, dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12 } }}
                            />
                            <Textarea
                                label="Internal Notes"
                                placeholder="Notes for the team or to attach to a quote…"
                                minRows={3}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                            />
                        </Stack>

                        <Box style={{ padding: '20px 0 24px' }}>
                            <Group justify="space-between">
                                <Box component={Link} href="/system/billing/quotes/create"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                                    → Convert to Quote
                                </Box>
                                <Group gap="sm">
                                    <Box component="button" type="button" onClick={onClose}
                                        style={{ padding: '9px 20px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'none', color: textSec, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                                        Cancel
                                    </Box>
                                    <Box component="button" type="submit" disabled={processing}
                                        style={{ padding: '9px 22px', borderRadius: 8, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', fontWeight: 700, fontSize: 14, opacity: processing ? 0.7 : 1, boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                                        {processing ? 'Saving…' : 'Save'}
                                    </Box>
                                </Group>
                            </Group>
                        </Box>
                    </form>
                </Box>
            </motion.div>
        </Box>
    );
}

export default function QuoteRequestsIndex({ requests, statuses, filters, pending }) {
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

    const [reviewing, setReviewing] = useState(null);
    const can = useCan();

    const applyFilter = (status) => {
        router.get('/system/billing/quote-requests', { status: status || undefined }, { preserveState: true });
    };

    const data = requests.data ?? [];

    const cols = '180px 1fr 160px 120px 110px';

    return (
        <DashboardLayout title="Quote Requests">
            <Head title="Quote Requests" />

            <AnimatePresence>
                {reviewing && <ReviewModal req={reviewing} statuses={statuses} onClose={() => setReviewing(null)} isDark={isDark} />}
            </AnimatePresence>

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
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={4}>
                            <Group gap={10}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📥</Box>
                                <Stack gap={1}>
                                    <Group gap={8} align="center">
                                        <Text fw={900} size="lg" c="white">Quote Requests</Text>
                                        {pending > 0 && (
                                            <Box style={{ background: 'rgba(245,158,11,0.25)', border: '1px solid rgba(245,158,11,0.45)', borderRadius: 20, padding: '2px 10px', backdropFilter: 'blur(4px)' }}>
                                                <Text size="xs" fw={700} style={{ color: '#FCD34D' }}>{pending} pending</Text>
                                            </Box>
                                        )}
                                    </Group>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Incoming requests from the customer portal</Text>
                                </Stack>
                            </Group>
                        </Stack>
                        <Group gap={10}>
                            <Select
                                placeholder="All statuses"
                                value={filters.status ?? null}
                                onChange={applyFilter}
                                clearable
                                data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                                styles={{
                                    input: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 10, width: 170, backdropFilter: 'blur(8px)' },
                                    dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12 },
                                }}
                            />
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Pending stat card (shown when there are pending requests) */}
            {pending > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Box mb={20} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, maxWidth: 520 }}>
                        <Box style={{ background: 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)', borderRadius: 16, padding: '18px 20px', boxShadow: '0 8px 28px rgba(217,119,6,0.4)', position: 'relative', overflow: 'hidden', minHeight: 100 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Box style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: 8 }}>⏳</Box>
                            <Text fw={900} c="white" style={{ fontSize: '1.8rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{pending}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>Pending Review</Text>
                        </Box>
                        <Box style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', borderRadius: 16, padding: '18px 20px', boxShadow: '0 8px 28px rgba(37,99,235,0.4)', position: 'relative', overflow: 'hidden', minHeight: 100 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Box style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: 8 }}>📥</Box>
                            <Text fw={900} c="white" style={{ fontSize: '1.8rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{data.length}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>Total Requests</Text>
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Quote Requests</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>{data.length} request{data.length !== 1 ? 's' : ''}</Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Client', 'Route & Cargo', 'Submitted', 'Status', 'Actions'].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0',
                            border: '2px dashed rgba(234,88,12,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.4rem', margin: '0 auto 20px',
                        }}>
                            📥
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No quote requests found</Text>
                        <Text size="sm" style={{ color: textMut }}>Requests from the customer portal will appear here</Text>
                    </Box>
                ) : (
                    data.map((req, i) => {
                        const st = statuses[req.status] ?? { label: req.status, color: '#94A3B8' };
                        return (
                            <motion.div key={req.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: cols,
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`,
                                        alignItems: 'center', transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = rowHov;
                                        e.currentTarget.style.borderLeft = `3px solid ${st.color}`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderLeft = '3px solid transparent';
                                    }}>

                                    {/* Client */}
                                    <Stack gap={2}>
                                        <Text size="sm" fw={700} style={{ color: textPri }}>{req.client?.name}</Text>
                                        {req.client?.phone && <Text size="xs" style={{ color: textSec }}>{req.client.phone}</Text>}
                                    </Stack>

                                    {/* Route & Cargo */}
                                    <Stack gap={2}>
                                        <Group gap={5} align="center">
                                            <Text size="sm" fw={600} style={{ color: textPri }}>{req.route_from}</Text>
                                            <Text size="xs" style={{ color: '#EA580C', fontWeight: 900 }}>→</Text>
                                            <Text size="sm" fw={600} style={{ color: textPri }}>{req.route_to}</Text>
                                        </Group>
                                        <Text size="xs" style={{ color: textSec, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {req.cargo_description}{req.cargo_weight_kg ? ` · ${req.cargo_weight_kg} kg` : ''}
                                        </Text>
                                    </Stack>

                                    {/* Submitted */}
                                    <Text size="xs" fw={600} style={{ color: textSec }}>
                                        {new Date(req.created_at).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </Text>

                                    {/* Status pill */}
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: st.color + '18', border: `1px solid ${st.color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                                        <Box style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, boxShadow: `0 0 5px ${st.color}`, flexShrink: 0 }} />
                                        <Text size="xs" fw={700} style={{ color: st.color, letterSpacing: 0.4 }}>{st.label}</Text>
                                    </Box>

                                    {/* Actions */}
                                    <Box>
                                        {can('billing_quote_requests.edit') ? (
                                            <Box component="button" type="button" onClick={() => setReviewing(req)}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', color: '#EA580C', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                                                ✏️ Review
                                            </Box>
                                        ) : can('billing_quote_requests.view') ? (
                                            <Box component="button" type="button" onClick={() => setReviewing(req)}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textSec, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                                👁 View
                                            </Box>
                                        ) : (
                                            <Text size="xs" style={{ color: textMut }}>—</Text>
                                        )}
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {/* Footer */}
                {data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>
                            {data.length} total request{data.length !== 1 ? 's' : ''}
                        </Text>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

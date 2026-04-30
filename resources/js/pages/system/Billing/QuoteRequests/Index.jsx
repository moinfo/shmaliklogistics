import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

function ReviewModal({ req, statuses, onClose, isDark }) {
    const cardBg     = isDark ? '#07111F' : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const inputStyles = {
        label: { color: textSec, fontSize: 13, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    const [status, setStatus]     = useState(req.status);
    const [notes, setNotes]       = useState(req.staff_notes ?? '');
    const [processing, setProc]   = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setProc(true);
        router.patch(`/system/billing/quote-requests/${req.id}`, { status, staff_notes: notes }, {
            onSuccess: () => { setProc(false); onClose(); },
            onFinish:  () => setProc(false),
        });
    };

    return (
        <Box style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <Group justify="space-between" mb="lg">
                    <Text fw={800} size="lg" style={{ color: textPri }}>Review Request</Text>
                    <Box component="button" onClick={onClose} style={{ background: 'none', border: 'none', color: textSec, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</Box>
                </Group>

                {/* Request details */}
                <Box style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                    <Stack gap={8}>
                        <Group justify="space-between">
                            <Text size="xs" style={{ color: textSec }}>Client</Text>
                            <Text size="sm" fw={600} style={{ color: textPri }}>{req.client?.name}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="xs" style={{ color: textSec }}>Route</Text>
                            <Text size="sm" fw={600} style={{ color: textPri }}>{req.route_from} → {req.route_to}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="xs" style={{ color: textSec }}>Cargo</Text>
                            <Text size="sm" fw={600} style={{ color: textPri }}>{req.cargo_description}</Text>
                        </Group>
                        {req.cargo_weight_kg && (
                            <Group justify="space-between">
                                <Text size="xs" style={{ color: textSec }}>Weight</Text>
                                <Text size="sm" fw={600} style={{ color: textPri }}>{req.cargo_weight_kg} kg</Text>
                            </Group>
                        )}
                        {req.preferred_date && (
                            <Group justify="space-between">
                                <Text size="xs" style={{ color: textSec }}>Preferred Date</Text>
                                <Text size="sm" fw={600} style={{ color: textPri }}>{req.preferred_date}</Text>
                            </Group>
                        )}
                        {req.notes && (
                            <Box>
                                <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Client Notes</Text>
                                <Text size="sm" style={{ color: textPri, whiteSpace: 'pre-wrap' }}>{req.notes}</Text>
                            </Box>
                        )}
                    </Stack>
                </Box>

                <form onSubmit={submit}>
                    <Stack gap="md">
                        <Select label="Status" value={status} onChange={v => setStatus(v)}
                            data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                            styles={{ ...inputStyles, dropdown: { background: isDark ? '#07111F' : '#fff', border: `1px solid ${cardBorder}` } }}
                        />
                        <Textarea label="Internal Notes" placeholder="Notes for the team or to attach to a quote…" minRows={3}
                            value={notes} onChange={e => setNotes(e.target.value)}
                            styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                        />
                    </Stack>
                    <Group justify="space-between" mt="xl">
                        <Box component={Link} href={`/system/billing/quotes/create`}
                            style={{ padding: '9px 18px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                            → Convert to Quote
                        </Box>
                        <Group gap="sm">
                            <Box component="button" type="button" onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'none', color: textSec, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Cancel</Box>
                            <Box component="button" type="submit" disabled={processing}
                                style={{ padding: '9px 22px', borderRadius: 8, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, opacity: processing ? 0.7 : 1 }}>
                                {processing ? 'Saving…' : 'Save'}
                            </Box>
                        </Group>
                    </Group>
                </form>
            </motion.div>
        </Box>
    );
}

export default function QuoteRequestsIndex({ requests, statuses, filters, pending }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const theadBg    = isDark ? 'rgba(33,150,243,0.06)' : '#F8FAFC';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const [reviewing, setReviewing] = useState(null);

    const applyFilter = (status) => {
        router.get('/system/billing/quote-requests', { status: status || undefined }, { preserveState: true });
    };

    const data = requests.data ?? [];

    return (
        <DashboardLayout title="Quote Requests">
            <Head title="Quote Requests" />

            <AnimatePresence>
                {reviewing && <ReviewModal req={reviewing} statuses={statuses} onClose={() => setReviewing(null)} isDark={isDark} />}
            </AnimatePresence>

            <Group justify="space-between" mb="xl" wrap="wrap" gap="md">
                <Stack gap={4}>
                    <Group gap="md">
                        <Text fw={800} size="xl" style={{ color: textPri }}>Quote Requests</Text>
                        {pending > 0 && (
                            <Box style={{ background: '#F59E0B20', border: '1px solid #F59E0B40', borderRadius: 20, padding: '3px 10px' }}>
                                <Text size="xs" fw={700} style={{ color: '#F59E0B' }}>{pending} pending</Text>
                            </Box>
                        )}
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>Incoming quote requests from the customer portal</Text>
                </Stack>

                <Select
                    placeholder="All statuses"
                    value={filters.status ?? null}
                    onChange={applyFilter}
                    clearable
                    data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                    styles={{
                        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8, width: 170 },
                        dropdown: { background: isDark ? '#07111F' : '#fff', border: `1px solid ${cardBorder}` },
                    }}
                />
            </Group>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ display: 'grid', gridTemplateColumns: '180px 1fr 160px 110px 120px', background: theadBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Client', 'Route & Cargo', 'Submitted', 'Status', 'Actions'].map(h => (
                        <Text key={h} size="xs" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</Text>
                    ))}
                </Box>

                {data.length === 0 ? (
                    <Text size="sm" style={{ color: textMut, padding: '32px 20px', textAlign: 'center' }}>No quote requests found.</Text>
                ) : (
                    data.map(req => {
                        const st = statuses[req.status] ?? { label: req.status, color: '#94A3B8' };
                        return (
                            <Box key={req.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 160px 110px 120px', padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center' }}>
                                <Stack gap={2}>
                                    <Text size="sm" fw={700} style={{ color: textPri }}>{req.client?.name}</Text>
                                    <Text size="xs" style={{ color: textSec }}>{req.client?.phone}</Text>
                                </Stack>
                                <Stack gap={2}>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{req.route_from} → {req.route_to}</Text>
                                    <Text size="xs" style={{ color: textSec }}>{req.cargo_description}{req.cargo_weight_kg ? ` · ${req.cargo_weight_kg} kg` : ''}</Text>
                                </Stack>
                                <Text size="sm" style={{ color: textSec }}>
                                    {new Date(req.created_at).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Text>
                                <Box style={{ background: st.color + '1A', border: `1px solid ${st.color}40`, borderRadius: 20, padding: '4px 12px', display: 'inline-flex' }}>
                                    <Text size="xs" fw={700} style={{ color: st.color }}>{st.label}</Text>
                                </Box>
                                <Box component="button" type="button" onClick={() => setReviewing(req)}
                                    style={{ background: 'none', border: `1px solid ${cardBorder}`, borderRadius: 7, padding: '5px 14px', cursor: 'pointer', color: textSec, fontSize: 12, fontWeight: 600 }}>
                                    Review
                                </Box>
                            </Box>
                        );
                    })
                )}
            </Box>
        </DashboardLayout>
    );
}

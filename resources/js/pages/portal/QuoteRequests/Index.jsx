import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import PortalLayout from '../../../layouts/PortalLayout';

export default function PortalQuoteRequestsIndex({ quoteRequests, statuses }) {
    return (
        <PortalLayout title="My Quote Requests">
            <Head title="My Quote Requests" />

            <Group justify="space-between" mb="xl" align="flex-start" wrap="wrap" gap="md">
                <Stack gap={4}>
                    <Text fw={800} size="xl" style={{ color: '#E2E8F0' }}>My Quote Requests</Text>
                    <Text size="sm" style={{ color: '#94A3B8' }}>{quoteRequests.length} request{quoteRequests.length !== 1 ? 's' : ''} submitted</Text>
                </Stack>
                <Box component={Link} href="/portal/quote-requests/create"
                    style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                    + New Request
                </Box>
            </Group>

            {quoteRequests.length === 0 ? (
                <Box style={{ background: '#0F1E32', border: '1px solid rgba(33,150,243,0.12)', borderRadius: 14, padding: '48px 20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2rem', marginBottom: 12 }}>📋</Text>
                    <Text fw={700} size="lg" style={{ color: '#E2E8F0' }}>No requests yet</Text>
                    <Text size="sm" style={{ color: '#94A3B8', marginTop: 4 }}>Submit a quote request and our team will respond within 24 hours.</Text>
                    <Box component={Link} href="/portal/quote-requests/create"
                        style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', borderRadius: 10, background: 'rgba(33,150,243,0.15)', border: '1px solid rgba(33,150,243,0.3)', color: '#60A5FA', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                        Request a Quote →
                    </Box>
                </Box>
            ) : (
                <Stack gap="md">
                    {quoteRequests.map(req => {
                        const st = statuses[req.status] ?? { label: req.status, color: '#94A3B8' };
                        return (
                            <Box key={req.id} style={{ background: '#0F1E32', border: '1px solid rgba(33,150,243,0.12)', borderRadius: 12, padding: '18px 20px' }}>
                                <Group justify="space-between" mb="sm" wrap="wrap" gap="sm">
                                    <Group gap="md">
                                        <Text fw={800} style={{ color: '#E2E8F0', fontFamily: 'monospace', letterSpacing: 1 }}>REQ-{String(req.id).padStart(4, '0')}</Text>
                                        <Box style={{ background: st.color + '20', border: `1px solid ${st.color}40`, borderRadius: 20, padding: '3px 12px' }}>
                                            <Text size="xs" fw={700} style={{ color: st.color }}>{st.label}</Text>
                                        </Box>
                                    </Group>
                                    <Text size="xs" style={{ color: '#475569' }}>
                                        {new Date(req.created_at).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </Text>
                                </Group>

                                <Group gap="xl" wrap="wrap">
                                    <Stack gap={2}>
                                        <Text size="xs" style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8 }}>Route</Text>
                                        <Text size="sm" fw={600} style={{ color: '#CBD5E1' }}>{req.route_from} → {req.route_to}</Text>
                                    </Stack>
                                    <Stack gap={2}>
                                        <Text size="xs" style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8 }}>Cargo</Text>
                                        <Text size="sm" fw={600} style={{ color: '#CBD5E1' }}>{req.cargo_description}</Text>
                                    </Stack>
                                    {req.cargo_weight_kg && (
                                        <Stack gap={2}>
                                            <Text size="xs" style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8 }}>Weight</Text>
                                            <Text size="sm" fw={600} style={{ color: '#CBD5E1' }}>{req.cargo_weight_kg} kg</Text>
                                        </Stack>
                                    )}
                                    {req.preferred_date && (
                                        <Stack gap={2}>
                                            <Text size="xs" style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: 0.8 }}>Preferred Date</Text>
                                            <Text size="sm" fw={600} style={{ color: '#CBD5E1' }}>{req.preferred_date}</Text>
                                        </Stack>
                                    )}
                                </Group>

                                {req.staff_notes && (
                                    <Box style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(33,150,243,0.06)', borderRadius: 8, border: '1px solid rgba(33,150,243,0.15)' }}>
                                        <Text size="xs" fw={700} style={{ color: '#60A5FA', marginBottom: 4 }}>Response from our team</Text>
                                        <Text size="sm" style={{ color: '#94A3B8', whiteSpace: 'pre-wrap' }}>{req.staff_notes}</Text>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </PortalLayout>
    );
}

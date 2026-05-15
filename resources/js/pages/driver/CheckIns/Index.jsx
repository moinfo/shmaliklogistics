import { Box, Text, Group, Stack, Pagination } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import DriverLayout from '../../../layouts/DriverLayout';

const card = { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.15)', borderRadius: 14 };

export default function DriverCheckInsIndex({ checkIns, statuses }) {
    return (
        <DriverLayout title="My Check-Ins">
            <Group justify="space-between" mb="lg">
                <Text fw={800} size="xl" c="white">📍 My Check-Ins</Text>
                <Box component={Link} href="/driver/check-ins/create"
                    style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: 'white', padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                    + Check-In Mpya
                </Box>
            </Group>

            {checkIns.data.length === 0 ? (
                <Box style={{ ...card, padding: '60px 20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2.4rem', marginBottom: 12 }}>📍</Text>
                    <Text c="white" fw={600}>Hakuna check-ins bado</Text>
                </Box>
            ) : (
                <Stack gap="sm">
                    {checkIns.data.map(c => {
                        const s = statuses[c.status] ?? { label: c.status, color: '#94A3B8' };
                        return (
                            <Box key={c.id} style={{ ...card, padding: '14px 18px' }}>
                                <Group justify="space-between" wrap="wrap">
                                    <Box>
                                        <Group gap={8}>
                                            <Text fw={700} c="white" size="sm">{c.trip?.trip_number || '—'}</Text>
                                            <Box style={{ background: s.color + '22', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '2px 10px' }}>
                                                <Text size="10px" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                            </Box>
                                        </Group>
                                        <Text size="xs" style={{ color: '#94A3B8', marginTop: 4 }}>
                                            {c.location || (c.lat && c.lng ? `${c.lat}, ${c.lng}` : 'Hakuna mahali')}
                                        </Text>
                                    </Box>
                                    <Box ta="right">
                                        <Text size="xs" style={{ color: '#94A3B8' }}>{new Date(c.checked_in_at).toLocaleString()}</Text>
                                        {c.odometer_km && <Text size="xs" style={{ color: '#94A3B8' }}>{Number(c.odometer_km).toLocaleString()} km</Text>}
                                    </Box>
                                </Group>
                                {c.notes && (
                                    <Text size="xs" mt={6} style={{ color: '#CBD5E1', whiteSpace: 'pre-wrap' }}>↪ {c.notes}</Text>
                                )}
                            </Box>
                        );
                    })}
                </Stack>
            )}

            {checkIns.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={checkIns.current_page} total={checkIns.last_page} onChange={p => router.get('/driver/check-ins', { page: p })} size="sm" />
                </Group>
            )}
        </DriverLayout>
    );
}

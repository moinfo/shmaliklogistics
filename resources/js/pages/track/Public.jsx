import { Head } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import TrackMap from '../../components/TrackMap';
import { placeLines } from '../../lib/place';

const STATES = {
    moving:  { label: 'On the move', color: '#22C55E' },
    idle:    { label: 'Stopped (engine on)', color: '#F59E0B' },
    parked:  { label: 'Parked', color: '#64748B' },
    offline: { label: 'Signal lost', color: '#EF4444' },
};

function timeAgo(iso) {
    if (!iso) return 'unknown';
    const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
}

export default function PublicTrack({ token, company, initial }) {
    const [data, setData] = useState(initial);
    const [gone, setGone] = useState(false);
    const [, tick] = useState(0);

    useEffect(() => {
        const poll = setInterval(async () => {
            try {
                const res = await fetch(`/track/${token}/position`, { headers: { Accept: 'application/json' } });
                if (res.status === 404) return setGone(true);
                if (res.ok) setData(await res.json());
            } catch { /* keep showing the last known position */ }
        }, 6000);
        const clock = setInterval(() => tick(n => n + 1), 30000);   // keep "x min ago" fresh
        return () => { clearInterval(poll); clearInterval(clock); };
    }, [token]);

    const pos = data.position;
    const state = pos ? STATES[pos.state] : null;

    return (
        <Box style={{ minHeight: '100vh', background: '#F1F5F9', padding: '16px 16px 40px' }}>
            <Head title={`Tracking ${data.plate}`}>
                <meta name="robots" content="noindex,nofollow" />
            </Head>

            <Box style={{ maxWidth: 900, margin: '0 auto' }}>
                <Group gap="sm" mb="md">
                    <img src="/logo-icon.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    <Text fw={800} size="lg" style={{ color: '#0F172A' }}>{company}</Text>
                </Group>

                {gone ? (
                    <Box style={{ background: '#fff', borderRadius: 14, padding: '48px 24px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                        <Text style={{ fontSize: '2.2rem' }}>🔒</Text>
                        <Text fw={700} size="lg" style={{ color: '#0F172A' }}>This tracking link is no longer active</Text>
                        <Text size="sm" style={{ color: '#64748B' }}>It has expired or was withdrawn. Please contact {company} for a new link.</Text>
                    </Box>
                ) : (
                    <>
                        <Box style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #E2E8F0', marginBottom: 14 }}>
                            <Group justify="space-between" align="flex-start">
                                <Stack gap={2}>
                                    <Text size="xs" fw={700} style={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 }}>Vehicle</Text>
                                    <Text fw={800} size="xl" style={{ color: '#0F172A' }}>{data.plate}</Text>
                                    {data.trip && <Text size="sm" style={{ color: '#475569' }}>{data.trip.from} → {data.trip.to}{data.trip.number ? ` · ${data.trip.number}` : ''}</Text>}
                                    {data.label && <Text size="xs" style={{ color: '#94A3B8' }}>Shared with {data.label}</Text>}
                                </Stack>
                                {state && (
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: state.color + '1A', border: `1px solid ${state.color}55`, borderRadius: 20, padding: '6px 14px' }}>
                                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: state.color }} />
                                        <Text size="sm" fw={700} style={{ color: state.color }}>{state.label}</Text>
                                    </Box>
                                )}
                            </Group>
                            {pos && (
                                <Stack gap={2} mt="sm">
                                    {placeLines(pos).road && <Text size="sm" fw={700} style={{ color: '#0F172A' }}>🛣 {placeLines(pos).road}</Text>}
                                    {placeLines(pos).area && <Text size="sm" style={{ color: '#334155' }}>📍 {placeLines(pos).area}</Text>}
                                    <Text size="xs" style={{ color: '#64748B' }}>Last update {timeAgo(pos.last_seen)} · refreshes automatically</Text>
                                </Stack>
                            )}
                        </Box>

                        {pos ? (
                            <Box style={{ background: '#fff', borderRadius: 14, padding: 8, border: '1px solid #E2E8F0' }}>
                                <TrackMap
                                    height={560}
                                    markers={[{ lat: pos.lat, lng: pos.lng, ts: pos.last_seen ? new Date(pos.last_seen).getTime() : null, color: state?.color, label: `<b>${data.plate}</b><br/>${state?.label ?? ''}` }]}
                                    path={data.trail}
                                    fitKey={data.plate}
                                    follow
                                />
                            </Box>
                        ) : (
                            <Box style={{ background: '#fff', borderRadius: 14, padding: '48px 24px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                                <Text fw={600} style={{ color: '#0F172A' }}>No position reported yet</Text>
                                <Text size="sm" style={{ color: '#64748B' }}>The vehicle's tracker has not sent a location. Please check back shortly.</Text>
                            </Box>
                        )}

                        <Text size="xs" mt="md" style={{ textAlign: 'center', color: '#94A3B8' }}>
                            Link valid until {new Date(data.expires_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </>
                )}
            </Box>
        </Box>
    );
}

import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useEffect, useState, useCallback } from 'react';
import TrackMap from './TrackMap';
import ShareTracking from './ShareTracking';
import { useCan } from '../lib/can';
import { placeLines } from '../lib/place';

const STATES = {
    moving:  { label: 'Moving',  color: '#22C55E' },
    idle:    { label: 'Idle',    color: '#F59E0B' },
    parked:  { label: 'Parked',  color: '#64748B' },
    offline: { label: 'Offline', color: '#EF4444' },
};

const MAX_WINDOW_MS = 7 * 86400000 - 60000;

function timeAgo(iso) {
    if (!iso) return 'never';
    const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
}

/**
 * Live position + route of one vehicle. Used on the vehicle page (last 24 h) and the trip page (trip dates).
 * Renders nothing for users without fleet_tracking.view.
 * `from` / `to` are Date objects; `to` omitted = still live (refreshes every 20 s).
 */
export default function VehicleTrackingPanel({ vehicleId, from = null, to = null, title = 'Live tracking', tripId = null }) {
    const can = useCan();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg = isDark ? '#0F1E32' : '#ffffff';
    const cardBorder = isDark ? 'var(--c-border-color)' : '#E2E8F0';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? 'var(--c-text-secondary)' : '#64748B';
    const textMut = isDark ? 'var(--c-text-muted)' : 'var(--c-text-secondary)';

    const [current, setCurrent] = useState(undefined);   // undefined = loading, null = no data
    const [trail, setTrail] = useState(null);
    const allowed = can('fleet_tracking.view');
    const live = !to || to.getTime() > Date.now();

    const opts = { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin' };

    const loadCurrent = useCallback(async () => {
        try {
            const cur = await fetch(`/system/fleet/${vehicleId}/current`, opts).then(r => r.ok ? r.json() : null);
            setCurrent(cur ?? null);
        } catch { setCurrent(c => c ?? null); }
    }, [vehicleId]);   // eslint-disable-line react-hooks/exhaustive-deps

    const loadTrail = useCallback(async () => {
        try {
            const now = Date.now();
            let f = from ? from.getTime() : now - 86400000;
            const t = to ? Math.min(to.getTime(), now) : now;
            f = Math.max(f, t - MAX_WINDOW_MS);
            const q = new URLSearchParams({ from: new Date(f).toISOString(), to: new Date(t).toISOString() });
            setTrail(await fetch(`/system/fleet/${vehicleId}/trail/data?${q}`, opts).then(r => r.ok ? r.json() : null));
        } catch { /* keep the route we already have */ }
    }, [vehicleId, from?.getTime?.(), to?.getTime?.()]);   // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!allowed) return;
        loadCurrent();
        loadTrail();
        if (!live) return;
        // Position often (the map glides between samples); the longer route line only occasionally.
        const fast = setInterval(loadCurrent, 4000);
        const slow = setInterval(loadTrail, 20000);
        return () => { clearInterval(fast); clearInterval(slow); };
    }, [allowed, loadCurrent, loadTrail, live]);

    if (!allowed) return null;

    const st = current ? STATES[current.state] : null;
    const path = (trail?.points ?? []).map(p => [p[0], p[1]]);
    const s = trail?.summary;

    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #1565C0, #22C55E)' }} />
            <Group justify="space-between" style={{ padding: '14px 20px' }} wrap="wrap">
                <Group gap="sm">
                    <Text fw={700} size="sm" style={{ color: textPri }}>📡 {title}</Text>
                    {st && (
                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: st.color + '1A', border: `1px solid ${st.color}55`, borderRadius: 20, padding: '2px 10px' }}>
                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
                            <Text size="xs" fw={700} style={{ color: st.color }}>{st.label}</Text>
                        </Box>
                    )}
                </Group>
                <Group gap="xs">
                    <Button component={Link} href={`/system/fleet/${vehicleId}/trail`} size="compact-xs" variant="light">▶ Replay route</Button>
                    {can('fleet_tracking.edit') && <ShareTracking vehicleId={vehicleId} tripId={tripId} buttonLabel="Share" />}
                </Group>
            </Group>

            <Box style={{ padding: '0 20px 18px' }}>
                {current === undefined ? (
                    <Text size="sm" style={{ color: textMut, padding: '24px 0' }}>Loading position…</Text>
                ) : !current ? (
                    <Box style={{ padding: '24px 0', textAlign: 'center' }}>
                        <Text fw={600} size="sm" style={{ color: textPri }}>No tracker position yet</Text>
                        <Text size="xs" style={{ color: textMut }}>Link a tracker under Settings → GPS Devices.</Text>
                    </Box>
                ) : (
                    <Stack gap="sm">
                        <Box>
                            {placeLines(current).road && <Text size="sm" fw={700} style={{ color: textPri }}>🛣 {placeLines(current).road}</Text>}
                            {placeLines(current).area && <Text size="sm" style={{ color: textSec }}>📍 {placeLines(current).area}</Text>}
                            <Text size="xs" style={{ color: textSec, fontFamily: 'monospace' }}>{current.lat.toFixed(6)}, {current.lng.toFixed(6)}</Text>
                            <Text size="xs" style={{ color: textMut }}>
                                Updated {timeAgo(current.last_seen)}{current.speed != null && current.state === 'moving' ? ` · ${Math.round(current.speed)} km/h` : ''}{current.live_device ? '' : ' · manual position'}
                            </Text>
                        </Box>
                        <TrackMap
                            height={380}
                            markers={[{ lat: current.lat, lng: current.lng, ts: current.last_seen ? new Date(current.last_seen).getTime() : null, color: st?.color, label: `<b>${current.plate}</b><br/>${st?.label ?? ''}` }]}
                            path={path}
                            fitKey={`${vehicleId}-${path.length > 0}`}
                            follow={live}
                        />
                        {s && s.records > 0 && (
                            <Group gap="xl">
                                <Box><Text size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase' }}>Distance</Text><Text fw={700} size="sm" style={{ color: textPri }}>{s.distance_km} km</Text></Box>
                                <Box><Text size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase' }}>Max speed</Text><Text fw={700} size="sm" style={{ color: textPri }}>{s.max_speed} km/h</Text></Box>
                                <Box><Text size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase' }}>Stops</Text><Text fw={700} size="sm" style={{ color: textPri }}>{s.stops}</Text></Box>
                                <Text size="xs" style={{ color: textMut, alignSelf: 'flex-end' }}>{to ? 'For the trip period' : 'Last 24 hours'}</Text>
                            </Group>
                        )}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}

import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, Button, SimpleGrid, Slider, SegmentedControl, Switch, TextInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { addBaseLayers } from '../../../lib/mapTiles';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)' };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmtTime = (ts) => new Date(ts * 1000).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtHM = (mins) => `${Math.floor(mins / 60)}h ${pad(mins % 60)}m`;

function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }

export default function Trail({ vehicle, maxDays = 7, speedLimit = 80 }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const textMut = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const divider = isDark ? dk.divider : '#E2E8F0';

    const [from, setFrom] = useState(toLocalInput(startOfToday()));
    const [to, setTo] = useState(toLocalInput(new Date()));
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cursor, setCursor] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [rate, setRate] = useState('4');
    const [follow, setFollow] = useState(true);

    const mapEl = useRef(null), mapRef = useRef(null), leafletRef = useRef(null);
    const layerRef = useRef(null), carRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);

    // Map
    useEffect(() => {
        let cancelled = false;
        import('leaflet').then(({ default: L }) => {
            import('leaflet/dist/leaflet.css');
            if (cancelled || !mapEl.current || mapRef.current) return;
            const map = L.map(mapEl.current).setView([-6.369, 34.889], 5);
            addBaseLayers(L, map);
            layerRef.current = L.layerGroup().addTo(map);
            leafletRef.current = L; mapRef.current = map; setMapReady(true);
        });
        return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, []);

    const load = useCallback(async (f = from, t = to) => {
        setLoading(true); setError(''); setPlaying(false);
        try {
            const q = new URLSearchParams({ from: new Date(f).toISOString(), to: new Date(t).toISOString() });
            const res = await fetch(`/system/fleet/${vehicle.id}/trail/data?${q}`, { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin' });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message ?? body.errors?.from?.[0] ?? 'Could not load the route');
            setData(body); setCursor(0);
        } catch (e) { setError(e.message); setData(null); }
        setLoading(false);
    }, [from, to, vehicle.id]);

    useEffect(() => { load(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    // Draw the route when data arrives.
    useEffect(() => {
        const L = leafletRef.current, map = mapRef.current, layer = layerRef.current;
        if (!mapReady || !L || !map) return;
        layer.clearLayers(); carRef.current = null;
        if (!data || data.points.length === 0) return;

        const P = data.points;
        const colorFor = (s) => s > speedLimit ? '#EF4444' : s < 3 ? '#94A3B8' : '#3B82F6';
        for (let i = 1; i < P.length; i++) {
            L.polyline([[P[i - 1][0], P[i - 1][1]], [P[i][0], P[i][1]]], { color: colorFor(P[i][3]), weight: 5, opacity: 0.9 }).addTo(layer);
        }

        const dot = (emoji, bg) => L.divIcon({ html: `<div style="width:26px;height:26px;border-radius:50%;background:${bg};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:12px">${emoji}</div>`, className: '', iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14] });
        L.marker([P[0][0], P[0][1]], { icon: dot('🟢', '#22C55E') }).bindPopup(`Start · ${fmtTime(P[0][2])}`).addTo(layer);
        const last = P[P.length - 1];
        L.marker([last[0], last[1]], { icon: dot('🏁', '#0F172A') }).bindPopup(`End · ${fmtTime(last[2])}`).addTo(layer);

        data.stops.forEach(s => L.marker([s.lat, s.lng], { icon: dot('🅿️', '#F59E0B') })
            .bindPopup(`<b>Stopped ${fmtHM(s.minutes)}</b><br/>${fmtTime(s.from)} → ${fmtTime(s.to)}`).addTo(layer));
        data.events.forEach(e => L.marker([e.lat, e.lng], { icon: dot(e.icon, e.severity === 'info' ? '#3B82F6' : '#EF4444') })
            .bindPopup(`<b>${esc(e.label)}</b><br/>${esc(e.message)}<br/>${fmtTime(e.at)}`).addTo(layer));

        carRef.current = L.marker([P[0][0], P[0][1]], { icon: dot('🚛', '#1565C0'), zIndexOffset: 1000 }).addTo(map);
        // Re-measure the container first (the layout settles after first paint), then zoom to the route.
        const fit = () => { map.invalidateSize(); map.fitBounds(P.map(p => [p[0], p[1]]), { padding: [40, 40] }); };
        fit();
        const refit = setTimeout(fit, 300);
        return () => { clearTimeout(refit); if (carRef.current) { carRef.current.remove(); carRef.current = null; } };
    }, [data, mapReady, speedLimit]);

    // Move the truck marker with the slider.
    useEffect(() => {
        if (!data || !carRef.current) return;
        // The cursor is fractional while playing: place the truck between the two surrounding points so it glides.
        const last = data.points.length - 1;
        const c = Math.min(cursor, last);
        const i = Math.floor(c), a = data.points[i], b = data.points[Math.min(i + 1, last)], t = c - i;
        const lat = a[0] + (b[0] - a[0]) * t, lng = a[1] + (b[1] - a[1]) * t;
        carRef.current.setLatLng([lat, lng]);
        if (follow && playing && mapRef.current) mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: false });
    }, [cursor, data, follow, playing]);

    // Playback timer.
    useEffect(() => {
        if (!playing || !data) return;
        const id = setInterval(() => {
            setCursor(c => {
                const next = c + Number(rate) * 0.25;     // 4× as many, 4× smaller steps = same speed, smoother
                if (next >= data.points.length - 1) { setPlaying(false); return data.points.length - 1; }
                return next;
            });
        }, 25);
        return () => clearInterval(id);
    }, [playing, rate, data]);

    const quick = (kind) => {
        const now = new Date();
        let f, t = now;
        if (kind === 'today') f = startOfToday();
        if (kind === 'yesterday') { f = startOfToday(); f.setDate(f.getDate() - 1); t = startOfToday(); }
        if (kind === '24h') f = new Date(now.getTime() - 86400000);
        if (kind === '7d') f = new Date(now.getTime() - (maxDays * 86400000 - 60000));
        setFrom(toLocalInput(f)); setTo(toLocalInput(t));
        load(toLocalInput(f), toLocalInput(t));
    };

    const pt = data?.points[Math.min(Math.floor(cursor), (data?.points.length ?? 1) - 1)];
    const s = data?.summary;
    const stat = (label, value) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '10px 14px' }}>
            <Text size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
            <Text fw={800} size="lg" style={{ color: textPri }}>{value}</Text>
        </Box>
    );

    return (
        <DashboardLayout title={`Replay · ${vehicle.plate}`}>
            <Head title={`Trip replay — ${vehicle.plate}`} />

            <Group justify="space-between" mb="md" align="flex-end">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Trip replay · {vehicle.plate}</Text>
                    <Text size="sm" style={{ color: textSec }}>Route, stops and alerts for a chosen period (up to {maxDays} days)</Text>
                </Stack>
                <Group gap="xs">
                    <Button component={Link} href={`/system/fleet/${vehicle.id}`} variant="default" size="xs">Vehicle</Button>
                    <Button component={Link} href="/system/fleet/live-map" variant="default" size="xs">Live map</Button>
                </Group>
            </Group>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <Group align="flex-end" gap="sm">
                    <TextInput type="datetime-local" label="From" value={from} onChange={e => setFrom(e.target.value)} />
                    <TextInput type="datetime-local" label="To" value={to} onChange={e => setTo(e.target.value)} />
                    <Button onClick={() => load()} loading={loading}>Show route</Button>
                    <Group gap={6}>
                        {[['today', 'Today'], ['yesterday', 'Yesterday'], ['24h', 'Last 24 h'], ['7d', `Last ${maxDays} days`]].map(([k, l]) => (
                            <Button key={k} size="compact-sm" variant="light" onClick={() => quick(k)}>{l}</Button>
                        ))}
                    </Group>
                </Group>
                {error && <Text size="sm" mt="sm" style={{ color: '#EF4444' }}>{error}</Text>}
            </Box>

            {s && (
                <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="sm" mb="md">
                    {stat('Distance', `${s.distance_km} km`)}
                    {stat('Driving time', fmtHM(s.moving_minutes))}
                    {stat('Max speed', `${s.max_speed} km/h`)}
                    {stat('Avg moving speed', `${s.avg_speed} km/h`)}
                    {stat('Stops (5+ min)', s.stops)}
                </SimpleGrid>
            )}

            <div ref={mapEl} style={{ width: '100%', height: 'calc(100vh - 400px)', minHeight: 500, borderRadius: 14, overflow: 'hidden', zIndex: 0, border: `1px solid ${cardBorder}` }} />

            {data && data.points.length === 0 && !loading && (
                <Box style={{ textAlign: 'center', padding: '24px 0' }}>
                    <Text fw={600} style={{ color: textPri }}>No positions recorded in this period</Text>
                    <Text size="sm" style={{ color: textMut }}>Try a wider range, or check the tracker was online.</Text>
                </Box>
            )}

            {data && data.points.length > 0 && (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 16, marginTop: 16 }}>
                    <Group justify="space-between" mb="xs" wrap="wrap">
                        <Group gap="sm">
                            <Button size="xs" onClick={() => { if (cursor >= data.points.length - 1) setCursor(0); setPlaying(p => !p); }}>{playing ? '⏸ Pause' : '▶ Play'}</Button>
                            <SegmentedControl size="xs" value={rate} onChange={setRate} data={[{ value: '1', label: '1×' }, { value: '4', label: '4×' }, { value: '12', label: '12×' }, { value: '40', label: '40×' }]} />
                            <Switch size="xs" label="Follow" checked={follow} onChange={e => setFollow(e.currentTarget.checked)} />
                        </Group>
                        <Text size="sm" fw={600} style={{ color: textPri }}>
                            {fmtTime(pt[2])} · {pt[3]} km/h{pt[4] === 1 ? ' · ignition on' : pt[4] === 0 ? ' · ignition off' : ''}
                        </Text>
                    </Group>
                    <Slider min={0} max={data.points.length - 1} value={Math.floor(cursor)} onChange={v => { setPlaying(false); setCursor(v); }} label={null} />
                    <Group gap="lg" mt="sm">
                        <Group gap={6}><Box style={{ width: 14, height: 4, background: '#3B82F6', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Driving</Text></Group>
                        <Group gap={6}><Box style={{ width: 14, height: 4, background: '#EF4444', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Over {speedLimit} km/h</Text></Group>
                        <Group gap={6}><Box style={{ width: 14, height: 4, background: '#94A3B8', borderRadius: 2 }} /><Text size="xs" style={{ color: textSec }}>Stationary</Text></Group>
                    </Group>
                </Box>
            )}

            {data && data.stops.length > 0 && (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginTop: 16 }}>
                    <Box style={{ padding: '12px 18px', borderBottom: `1px solid ${divider}` }}><Text fw={700} size="sm" style={{ color: textPri }}>Stops</Text></Box>
                    {data.stops.map((st, i) => (
                        <Box key={i} style={{ padding: '10px 18px', borderBottom: i < data.stops.length - 1 ? `1px solid ${divider}` : 'none', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <Text size="sm" style={{ color: textPri }}>{fmtTime(st.from)} → {fmtTime(st.to)}</Text>
                            <Text size="sm" fw={700} style={{ color: '#F59E0B' }}>{fmtHM(st.minutes)}</Text>
                            <Text size="xs" style={{ color: textMut, fontFamily: 'monospace' }}>{st.lat.toFixed(5)}, {st.lng.toFixed(5)}</Text>
                        </Box>
                    ))}
                </Box>
            )}
        </DashboardLayout>
    );
}

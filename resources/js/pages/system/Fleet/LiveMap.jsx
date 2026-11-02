import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, SegmentedControl, Switch, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';
import { makeBase, savedLayer, saveLayer } from '../../../lib/mapTiles';
import { glideMarker, isGliding, glideDuration } from '../../../lib/glide';
import { placeLines } from '../../../lib/place';

const dk = { card: '#0F1E32', cardHov: '#132436', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)' };

const STATES = {
    moving:  { label: 'Moving',  color: '#22C55E' },
    idle:    { label: 'Idle',    color: '#F59E0B' },
    parked:  { label: 'Parked',  color: '#64748B' },
    offline: { label: 'Offline', color: '#EF4444' },
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtCoord = (n) => Number(n).toFixed(6);

function timeAgo(iso) {
    if (!iso) return 'never';
    const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
}

function markerHtml(v) {
    const color = STATES[v.state].color;
    // Heading arrow only while moving, so a parked truck doesn't look like it is pointing somewhere.
    const arrow = v.state === 'moving' && v.heading != null
        ? `<div style="position:absolute;inset:-8px;transform:rotate(${v.heading}deg);pointer-events:none"><div style="position:absolute;top:-2px;left:50%;margin-left:-5px;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid ${color}"></div></div>`
        : '';
    return `<div style="position:relative;width:30px;height:30px">${arrow}<div style="width:30px;height:30px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:13px">🚛</div></div>`;
}

function popupHtml(v) {
    const color = STATES[v.state].color;
    const place = placeLines(v);
    const rows = [
        v.driver ? `<div style="font-size:12px;color:#555;margin-bottom:2px">👤 ${esc(v.driver)}</div>` : '',
        v.speed != null ? `<div style="font-size:12px;color:#555;margin-bottom:2px">⏱ ${Math.round(v.speed)} km/h${v.ignition === true ? ' · ignition on' : v.ignition === false ? ' · ignition off' : ''}</div>` : '',
        v.voltage_v != null ? `<div style="font-size:12px;color:#555;margin-bottom:2px">🔋 ${v.voltage_v} V</div>` : '',
        place.road ? `<div style="font-size:12px;font-weight:700;color:#222;margin:5px 0 1px">🛣 ${esc(place.road)}</div>` : '',
        place.area ? `<div style="font-size:11px;color:#555;margin-bottom:3px;line-height:1.35">📍 ${esc(place.area)}</div>` : '',
        `<div style="font-size:11px;color:#666;margin-bottom:2px;font-family:monospace">${fmtCoord(v.lat)}, ${fmtCoord(v.lng)}</div>`,
        `<a href="https://www.google.com/maps?q=${v.lat},${v.lng}" target="_blank" rel="noopener" style="font-size:11px;color:#3B82F6;text-decoration:none">Open in Google Maps ↗</a>`,
    ].join('');
    return `<div style="font-family:system-ui,sans-serif;min-width:170px">
        <div style="font-weight:800;font-size:14px;margin-bottom:4px">${esc(v.plate)}</div>
        <div style="font-size:12px;color:#555;margin-bottom:4px">${esc(v.make)} ${v.make && v.type ? '·' : ''} ${esc(v.type)}</div>
        <div style="font-size:11px;padding:3px 7px;background:${color}22;color:${color};border-radius:12px;display:inline-block;margin-bottom:6px;border:1px solid ${color}44">${STATES[v.state].label}</div>
        ${rows}
        <div style="font-size:10px;color:#999;margin-top:4px">Last update: ${timeAgo(v.last_seen)}${v.live_device ? '' : ' (manual position)'}</div>
        <div style="display:flex;gap:14px;margin-top:8px"><a href="/system/fleet/${v.id}/trail" style="font-size:12px;color:#3B82F6;text-decoration:none;font-weight:600">Replay route →</a><a href="/system/fleet/${v.id}" style="font-size:12px;color:#3B82F6;text-decoration:none;font-weight:600">Vehicle →</a></div>
    </div>`;
}

export default function LiveMap({ vehicles: initial = [], geofences = [], refreshSeconds = 4 }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const can = useCan();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const rowHov     = isDark ? dk.cardHov : '#F8FAFC';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const [vehicles, setVehicles] = useState(initial);
    const [filter, setFilter]     = useState(null);       // null = all, or a state key
    const [selected, setSelected] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(new Date());
    const [error, setError]       = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [search, setSearch]     = useState('');
    const [follow, setFollow]     = useState(true);
    const [layer, setLayer]       = useState(savedLayer);
    const [showZones, setShowZones] = useState(true);

    const mapEl      = useRef(null);
    const mapRef     = useRef(null);
    const leafletRef = useRef(null);
    const markersRef = useRef({});
    const fittedRef  = useRef(false);
    const tilesRef   = useRef(null);
    const zoomedRef  = useRef(false);
    const lastSeenRef = useRef({});     // vehicle id -> timestamp of the previous position sample
    const followRef  = useRef(true);
    const selectedRef = useRef(null);
    const zonesRef   = useRef(null);

    // Poll the JSON feed.
    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/system/fleet/live-map/positions', {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error(res.status);
            const data = await res.json();
            setVehicles(data.vehicles);
            setUpdatedAt(new Date());
            setError(false);
        } catch {
            setError(true);
        }
    }, []);

    useEffect(() => {
        const id = setInterval(refresh, refreshSeconds * 1000);
        return () => clearInterval(id);
    }, [refresh, refreshSeconds]);

    // Create the map once.
    useEffect(() => {
        let cancelled = false;
        import('leaflet').then(({ default: L }) => {
            import('leaflet/dist/leaflet.css');
            if (cancelled || !mapEl.current || mapRef.current) return;

            const map = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: true }).setView([-6.369, 34.889], 5);
            tilesRef.current = makeBase(L, savedLayer()).addTo(map);
            map.on('dragstart', () => setFollow(false));
            zonesRef.current = L.layerGroup().addTo(map);

            leafletRef.current = L;
            mapRef.current = map;
            setMapReady(true);
        });

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markersRef.current = {};
            }
        };
    }, []);

    // Street / satellite switch.
    useEffect(() => {
        const L = leafletRef.current, map = mapRef.current;
        if (!mapReady || !L || !map) return;
        tilesRef.current?.remove();
        tilesRef.current = makeBase(L, layer).addTo(map);
    }, [layer, mapReady]);

    // Geofence zones.
    useEffect(() => {
        const L = leafletRef.current, group = zonesRef.current;
        if (!mapReady || !L || !group) return;
        group.clearLayers();
        if (!showZones) return;
        geofences.forEach(g => L.circle([g.center_lat, g.center_lng], { radius: g.radius_m, color: g.color, weight: 2, fillOpacity: 0.12, interactive: false })
            .bindTooltip(esc(g.name)).addTo(group));
    }, [geofences, showZones, mapReady]);

    // Keep markers in sync with the data (move existing ones rather than rebuilding).
    useEffect(() => {
        const L = leafletRef.current, map = mapRef.current;
        if (!mapReady || !L || !map) return;

        const visible = vehicles.filter(matches);
        const seen = new Set();

        visible.forEach(v => {
            seen.add(v.id);
            const icon = L.divIcon({ html: markerHtml(v), className: '', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -18] });
            const existing = markersRef.current[v.id];
            const ts = v.last_seen ? new Date(v.last_seen).getTime() : null;
            if (existing) {
                existing.setIcon(icon);
                existing.getPopup()?.setContent(popupHtml(v));
                if (existing._target?.[0] !== v.lat || existing._target?.[1] !== v.lng) {
                    existing._target = [v.lat, v.lng];
                    // The camera moves in step with the marker, so following looks like one smooth drive.
                    glideMarker(existing, { lat: v.lat, lng: v.lng }, glideDuration(lastSeenRef.current[v.id], ts, refreshSeconds * 1000), (pos) => {
                        if (followRef.current && selectedRef.current === v.id) map.setView(pos, map.getZoom(), { animate: false });
                    });
                }
            } else {
                markersRef.current[v.id] = L.marker([v.lat, v.lng], { icon }).addTo(map).bindPopup(popupHtml(v))
                    .on('click', () => { setSelected(v.id); setFollow(true); });
                markersRef.current[v.id]._target = [v.lat, v.lng];
            }
            lastSeenRef.current[v.id] = ts;
        });

        Object.keys(markersRef.current).forEach(id => {
            if (!seen.has(Number(id))) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // With a single vehicle on the map there is nothing to choose: follow it.
        if (selected == null && visible.length === 1) setSelected(visible[0].id);

        // Follow mode keeps the selected vehicle centred as it moves (zooming in once on first follow).
        const sel = follow && selected != null ? visible.find(v => v.id === selected) : null;
        if (sel) {
            if (!zoomedRef.current) {
                map.setView([sel.lat, sel.lng], Math.max(map.getZoom(), 14), { animate: true });
                zoomedRef.current = true;
            } else if (!isGliding(markersRef.current[sel.id])) {
                map.panTo([sel.lat, sel.lng], { animate: true });
            }
        }

        // Zoom to the fleet on first load only — never fight the user's panning on later refreshes.
        if (!fittedRef.current && visible.length > 0) {
            map.fitBounds(visible.map(v => [v.lat, v.lng]), { padding: [40, 40], maxZoom: 13 });
            fittedRef.current = true;
        }
    }, [vehicles, filter, search, follow, selected, mapReady]);

    const focusVehicle = (v) => {
        setSelected(v.id);
        setFollow(true);
        const map = mapRef.current, marker = markersRef.current[v.id];
        if (map && marker) {
            map.setView([v.lat, v.lng], Math.max(map.getZoom(), 14), { animate: true });
            marker.openPopup();
        }
    };

    followRef.current = follow;
    selectedRef.current = selected;

    const q = search.trim().toLowerCase();
    const matches = (v) => (!filter || v.state === filter)
        && (!q || [v.plate, v.driver, v.location].some(x => (x ?? '').toLowerCase().includes(q)));

    const counts = Object.fromEntries(Object.keys(STATES).map(k => [k, vehicles.filter(v => v.state === k).length]));
    const listed = vehicles.filter(matches);

    return (
        <DashboardLayout title="Fleet · Live Map">
            <Head title="Live Map" />

            <Group justify="space-between" mb="lg" align="flex-end">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Live Map</Text>
                    <Text size="sm" style={{ color: textSec }}>
                        {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} reporting · refreshes every {refreshSeconds}s
                    </Text>
                </Stack>
                <Group gap="xs">
                    <Box style={{ width: 8, height: 8, borderRadius: '50%', background: error ? '#EF4444' : '#22C55E' }} />
                    <Text size="xs" style={{ color: error ? '#EF4444' : textMut }}>
                        {error ? 'Connection problem — retrying' : `Updated ${updatedAt.toLocaleTimeString('en-GB')}`}
                    </Text>
                </Group>
            </Group>

            {/* State filters */}
            <Group gap="sm" mb="md">
                {Object.entries(STATES).map(([key, s]) => {
                    const active = filter === key;
                    return (
                        <Box key={key} onClick={() => setFilter(active ? null : key)}
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, background: active ? s.color + '22' : cardBg, border: `1px solid ${active ? s.color : cardBorder}`, borderRadius: 20, padding: '6px 14px' }}>
                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                            <Text size="sm" fw={600} style={{ color: textPri }}>{s.label}</Text>
                            <Text size="sm" fw={800} style={{ color: s.color }}>{counts[key]}</Text>
                        </Box>
                    );
                })}
            </Group>

            {/* Search + map options */}
            <Group gap="md" mb="md" align="center">
                <TextInput placeholder="Search plate, driver or place…" value={search} onChange={e => setSearch(e.target.value)} w={280} />
                <SegmentedControl size="xs" value={layer} onChange={(v) => { setLayer(v); saveLayer(v); }} data={[{ value: 'street', label: 'Map' }, { value: 'satellite', label: 'Satellite' }]} />
                <Switch size="xs" label="Zones" checked={showZones} onChange={e => setShowZones(e.currentTarget.checked)} />
                <Switch size="xs" label="Follow vehicle" checked={follow} onChange={e => setFollow(e.currentTarget.checked)} />
                <Group gap={6} ml="auto">
                    <Button component={Link} href="/system/fleet/tracking-alerts" size="compact-sm" variant="light">🔔 Alerts</Button>
                    <Button component={Link} href="/system/fleet/geofences" size="compact-sm" variant="light">📍 Zones</Button>
                    <Button component={Link} href="/system/fleet/tracking-report" size="compact-sm" variant="light">📈 Mileage</Button>
                </Group>
            </Group>

            <Box style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: 16, alignItems: 'start' }} className="livemap-grid">
                {/* Vehicle list */}
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', maxHeight: 'calc(100vh - 230px)', minHeight: 300, overflowY: 'auto' }}>
                    {listed.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '40px 16px' }}>
                            <Text style={{ fontSize: '2rem', marginBottom: 8 }}>📡</Text>
                            <Text fw={600} size="sm" style={{ color: textPri }}>
                                {vehicles.length === 0 ? 'No vehicle has reported a position yet' : 'No vehicles in this state'}
                            </Text>
                            {vehicles.length === 0 && can('settings.view') && (
                                <Text size="xs" style={{ color: textMut, marginTop: 6 }}>
                                    Link a tracker under <Link href="/system/settings/gps-devices" style={{ color: '#3B82F6' }}>Settings → GPS Devices</Link>
                                </Text>
                            )}
                        </Box>
                    ) : listed.map(v => {
                        const s = STATES[v.state];
                        return (
                            <Box key={v.id} onClick={() => focusVehicle(v)}
                                style={{ padding: '12px 16px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', background: selected === v.id ? rowHov : 'transparent', borderLeft: `3px solid ${s.color}` }}
                                onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                onMouseLeave={e => e.currentTarget.style.background = selected === v.id ? rowHov : 'transparent'}>
                                <Group justify="space-between" wrap="nowrap">
                                    <Text fw={700} size="sm" style={{ color: textPri }}>{v.plate}</Text>
                                    <Text size="10px" fw={700} style={{ color: s.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
                                </Group>
                                <Text size="xs" style={{ color: textSec }}>
                                    {v.driver ?? 'No driver'}{v.speed != null && v.state === 'moving' ? ` · ${Math.round(v.speed)} km/h` : ''}
                                </Text>
                                {placeLines(v).road && <Text size="xs" fw={700} style={{ color: textPri, marginTop: 2 }}>🛣 {placeLines(v).road}</Text>}
                                {placeLines(v).area && <Text size="xs" lineClamp={2} style={{ color: textSec }}>📍 {placeLines(v).area}</Text>}
                                <Text size="10px" style={{ color: textMut, fontFamily: 'monospace', marginTop: 2 }}>{fmtCoord(v.lat)}, {fmtCoord(v.lng)}</Text>
                                <Text size="10px" style={{ color: textMut }}>{timeAgo(v.last_seen)}{v.live_device ? '' : ' · manual'}</Text>
                            </Box>
                        );
                    })}
                </Box>

                {/* Map */}
                <div ref={mapEl} style={{ width: '100%', height: 'calc(100vh - 230px)', minHeight: 540, borderRadius: 14, overflow: 'hidden', zIndex: 0, border: `1px solid ${cardBorder}` }} />
            </Box>

            <style>{`@media (max-width: 800px) { .livemap-grid { grid-template-columns: 1fr !important; } }`}</style>
        </DashboardLayout>
    );
}

import { Head, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Button, TextInput, NumberInput, Switch, ColorInput, ActionIcon, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { addBaseLayers } from '../../../lib/mapTiles';
import { useCan } from '../../../lib/can';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)', cardHov: '#132436' };

const blank = { id: null, name: '', center_lat: '', center_lng: '', radius_m: 500, color: '#3B82F6', alert_on_enter: true, alert_on_exit: true, is_active: true };

export default function Geofences({ geofences }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const can = useCan();
    const canEdit = can('fleet_tracking.edit');

    const cardBg = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const textMut = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const divider = isDark ? dk.divider : '#E2E8F0';
    const rowHov = isDark ? dk.cardHov : '#F8FAFC';
    const flash = props.flash ?? {};
    const errors = props.errors ?? {};

    const [form, setForm] = useState(null);         // null = not editing
    const [saving, setSaving] = useState(false);
    const formRef = useRef(form);
    formRef.current = form;
    const canEditRef = useRef(canEdit);
    canEditRef.current = canEdit;

    const mapEl = useRef(null), mapRef = useRef(null), leafletRef = useRef(null), layerRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);
    const fitted = useRef(false);

    useEffect(() => {
        let cancelled = false;
        import('leaflet').then(({ default: L }) => {
            import('leaflet/dist/leaflet.css');
            if (cancelled || !mapEl.current || mapRef.current) return;
            const map = L.map(mapEl.current).setView([-6.8, 39.25], 11);
            addBaseLayers(L, map);
            layerRef.current = L.layerGroup().addTo(map);
            map.on('click', (e) => {
                if (!canEditRef.current) return;
                setForm(f => ({ ...(f ?? blank), center_lat: +e.latlng.lat.toFixed(6), center_lng: +e.latlng.lng.toFixed(6) }));
            });
            leafletRef.current = L; mapRef.current = map; setMapReady(true);
            // The grid layout settles after first paint; without this Leaflet keeps its initial (wrong) size and shows grey tiles.
            setTimeout(() => map.invalidateSize(), 250);
        });
        return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, []);

    // Redraw zones + the draft.
    useEffect(() => {
        const L = leafletRef.current, map = mapRef.current, layer = layerRef.current;
        if (!mapReady || !L) return;
        layer.clearLayers();
        const all = [];
        geofences.forEach(g => {
            if (form?.id === g.id) return;      // the draft replaces it while editing
            L.circle([g.center_lat, g.center_lng], { radius: g.radius_m, color: g.color, weight: 2, fillOpacity: g.is_active ? 0.15 : 0.04, dashArray: g.is_active ? null : '4 6' })
                .bindTooltip(g.name, { permanent: false }).addTo(layer);
            all.push([g.center_lat, g.center_lng]);
        });
        if (form && form.center_lat !== '' && form.center_lng !== '') {
            L.circle([form.center_lat, form.center_lng], { radius: Number(form.radius_m) || 0, color: form.color, weight: 3, dashArray: '6 6', fillOpacity: 0.25 }).addTo(layer);
        }
        if (!fitted.current && all.length) { map.fitBounds(all, { padding: [60, 60], maxZoom: 14 }); fitted.current = true; }
    }, [geofences, form, mapReady]);

    const edit = (g) => {
        setForm({ ...g });
        mapRef.current?.setView([g.center_lat, g.center_lng], 14);
    };

    const save = () => {
        setSaving(true);
        const payload = { name: form.name, center_lat: form.center_lat, center_lng: form.center_lng, radius_m: form.radius_m, color: form.color, alert_on_enter: form.alert_on_enter, alert_on_exit: form.alert_on_exit, is_active: form.is_active };
        const opts = { preserveScroll: true, onSuccess: () => setForm(null), onFinish: () => setSaving(false) };
        form.id ? router.put(`/system/fleet/geofences/${form.id}`, payload, opts) : router.post('/system/fleet/geofences', payload, opts);
    };

    const remove = (g) => {
        if (window.confirm(`Delete zone "${g.name}"?`)) router.delete(`/system/fleet/geofences/${g.id}`, { preserveScroll: true });
    };

    return (
        <DashboardLayout title="Fleet · Geofences">
            <Head title="Geofences" />

            {flash.success && (
                <Box style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </Box>
            )}

            <Group justify="space-between" mb="lg" align="flex-end">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Geofences</Text>
                    <Text size="sm" style={{ color: textSec }}>Zones such as the yard, border posts, the port or customer sites. Get an alert when a vehicle enters or leaves.</Text>
                </Stack>
                {canEdit && !form && <Button onClick={() => setForm({ ...blank })}>＋ New zone</Button>}
            </Group>

            <Box style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 16, alignItems: 'start' }} className="geo-grid">
                <Stack gap="md">
                    {form && (
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 16 }}>
                            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 8 }}>{form.id ? 'Edit zone' : 'New zone'}</Text>
                            <Text size="xs" style={{ color: textMut, marginBottom: 10 }}>Click the map to place the centre of the zone.</Text>
                            <Stack gap="xs">
                                <TextInput label="Name" placeholder="e.g. Dar es Salaam Port" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
                                <Group grow>
                                    <NumberInput label="Latitude" decimalScale={6} value={form.center_lat} onChange={v => setForm({ ...form, center_lat: v })} error={errors.center_lat} hideControls />
                                    <NumberInput label="Longitude" decimalScale={6} value={form.center_lng} onChange={v => setForm({ ...form, center_lng: v })} error={errors.center_lng} hideControls />
                                </Group>
                                <NumberInput label="Radius (metres)" min={30} max={100000} step={50} value={form.radius_m} onChange={v => setForm({ ...form, radius_m: v })} error={errors.radius_m} />
                                <ColorInput label="Colour" value={form.color} onChange={v => setForm({ ...form, color: v })} format="hex" error={errors.color} />
                                <Switch label="Alert when a vehicle enters" checked={form.alert_on_enter} onChange={e => setForm({ ...form, alert_on_enter: e.currentTarget.checked })} />
                                <Switch label="Alert when a vehicle leaves" checked={form.alert_on_exit} onChange={e => setForm({ ...form, alert_on_exit: e.currentTarget.checked })} />
                                <Switch label="Active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.currentTarget.checked })} />
                                <Group justify="flex-end" mt="xs">
                                    <Button variant="default" onClick={() => setForm(null)}>Cancel</Button>
                                    <Button onClick={save} loading={saving} disabled={!form.name || form.center_lat === '' || form.center_lng === ''}>{form.id ? 'Save' : 'Create zone'}</Button>
                                </Group>
                            </Stack>
                        </Box>
                    )}

                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                        {geofences.length === 0 ? (
                            <Box style={{ textAlign: 'center', padding: '36px 16px' }}>
                                <Text style={{ fontSize: '2rem' }}>📍</Text>
                                <Text fw={600} size="sm" style={{ color: textPri }}>No zones yet</Text>
                                {canEdit && <Text size="xs" style={{ color: textMut, marginTop: 4 }}>Click the map, then name the zone.</Text>}
                            </Box>
                        ) : geofences.map((g, i) => (
                            <Box key={g.id} onClick={() => mapRef.current?.setView([g.center_lat, g.center_lng], 14)}
                                style={{ padding: '12px 16px', borderBottom: i < geofences.length - 1 ? `1px solid ${divider}` : 'none', cursor: 'pointer', borderLeft: `4px solid ${g.color}`, opacity: g.is_active ? 1 : 0.55 }}
                                onMouseEnter={e => e.currentTarget.style.background = rowHov} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <Group justify="space-between" wrap="nowrap">
                                    <Box>
                                        <Text size="sm" fw={700} style={{ color: textPri }}>{g.name}</Text>
                                        <Text size="xs" style={{ color: textMut }}>{g.radius_m} m · {[g.alert_on_enter && 'enter', g.alert_on_exit && 'exit'].filter(Boolean).join(' + ') || 'no alerts'}{g.is_active ? '' : ' · inactive'}</Text>
                                    </Box>
                                    {canEdit && (
                                        <Group gap={2} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                            <Tooltip label="Edit"><ActionIcon variant="subtle" onClick={() => edit(g)}>✏️</ActionIcon></Tooltip>
                                            <Tooltip label="Delete"><ActionIcon variant="subtle" color="red" onClick={() => remove(g)}>🗑️</ActionIcon></Tooltip>
                                        </Group>
                                    )}
                                </Group>
                            </Box>
                        ))}
                    </Box>
                </Stack>

                <div ref={mapEl} style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: 540, borderRadius: 14, overflow: 'hidden', zIndex: 0, border: `1px solid ${cardBorder}`, cursor: canEdit ? 'crosshair' : 'grab' }} />
            </Box>
            <style>{`@media (max-width: 800px) { .geo-grid { grid-template-columns: 1fr !important; } }`}</style>
        </DashboardLayout>
    );
}

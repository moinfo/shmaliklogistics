import { useEffect, useMemo, useRef, useState } from 'react';
import { addBaseLayers } from '../lib/mapTiles';
import { glideMarker, isGliding, glideDuration } from '../lib/glide';

/**
 * Small Leaflet map: a few markers and an optional route line, with a Map / Satellite switch.
 * markers: [{ lat, lng, color?, emoji?, label?, ts? }]   path: [[lat, lng], …]
 *
 * follow — treat the first marker as a live vehicle: it glides smoothly between position updates and the map
 * keeps it centred (zoomed in). Dragging the map pauses following; the button resumes it.
 * `ts` (ms) is the time of the position sample, used to pace the glide.
 * Without `follow`, the map fits the content once per `fitKey` and never fights the user's panning.
 */
export default function TrackMap({ height = 320, markers = [], path = [], pathColor = '#3B82F6', fitKey = 'init', follow = false }) {
    const elRef = useRef(null);
    const mapRef = useRef(null);
    const layerRef = useRef(null);
    const leafletRef = useRef(null);
    const liveRef = useRef(null);          // the animated vehicle marker (follow mode)
    const lastTsRef = useRef(null);
    const fittedKey = useRef(null);
    const followRef = useRef(follow);
    const [ready, setReady] = useState(false);
    const [following, setFollowing] = useState(follow);

    const setFollow = (v) => { followRef.current = v; setFollowing(v); };

    useEffect(() => {
        let cancelled = false;
        import('leaflet').then(({ default: L }) => {
            import('leaflet/dist/leaflet.css');
            if (cancelled || !elRef.current || mapRef.current) return;
            const map = L.map(elRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([-6.369, 34.889], 5);
            addBaseLayers(L, map);
            layerRef.current = L.layerGroup().addTo(map);
            map.on('dragstart', () => { if (followRef.current) setFollow(false); });
            leafletRef.current = L;
            mapRef.current = map;
            setReady(true);
            setTimeout(() => map.invalidateSize(), 250);
        });
        return () => {
            cancelled = true;
            if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; liveRef.current = null; }
        };
    }, []);

    const signature = useMemo(() => JSON.stringify([markers, path]), [markers, path]);

    useEffect(() => {
        const L = leafletRef.current, map = mapRef.current, layer = layerRef.current;
        if (!ready || !L || !map) return;

        layer.clearLayers();
        const bounds = [];

        if (path.length > 1) {
            L.polyline(path, { color: pathColor, weight: 4, opacity: 0.85 }).addTo(layer);
            path.forEach(p => bounds.push(p));
        }

        let firstFollowDraw = false;
        markers.forEach((m, idx) => {
            const color = m.color ?? '#22C55E';
            const icon = L.divIcon({
                html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:12px">${m.emoji ?? '🚛'}</div>`,
                className: '', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
            });
            const popup = m.label ? `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">${m.label}</div>` : null;

            if (follow && idx === 0) {
                // Persistent marker outside the layer group, so redrawing the route never resets it.
                let live = liveRef.current;
                if (!live) {
                    live = L.marker([m.lat, m.lng], { icon, zIndexOffset: 1000 }).addTo(map);
                    live._target = [m.lat, m.lng];
                    liveRef.current = live;
                    firstFollowDraw = true;
                } else {
                    live.setIcon(icon);
                    if (live._target[0] !== m.lat || live._target[1] !== m.lng) {
                        live._target = [m.lat, m.lng];
                        glideMarker(live, { lat: m.lat, lng: m.lng }, glideDuration(lastTsRef.current, m.ts, 5000), (pos) => {
                            if (followRef.current) map.setView(pos, map.getZoom(), { animate: false });
                        });
                    }
                }
                lastTsRef.current = m.ts ?? null;
                if (popup) { live.unbindPopup(); live.bindPopup(popup); }
                bounds.push([m.lat, m.lng]);
                return;
            }

            const marker = L.marker([m.lat, m.lng], { icon }).addTo(layer);
            if (popup) marker.bindPopup(popup);
            bounds.push([m.lat, m.lng]);
        });

        if (follow && markers[0]) {
            if (firstFollowDraw || fittedKey.current !== fitKey) {
                map.setView([markers[0].lat, markers[0].lng], 14, { animate: false });   // close in on the vehicle, not the whole route
                fittedKey.current = fitKey;
            } else if (followRef.current && !isGliding(liveRef.current)) {
                map.panTo([markers[0].lat, markers[0].lng], { animate: true });
            }
        } else if (bounds.length && fittedKey.current !== fitKey) {
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
            fittedKey.current = fitKey;
        }
    }, [ready, signature, fitKey, pathColor, follow]);

    const resume = () => {
        setFollow(true);
        if (markers[0] && mapRef.current) mapRef.current.setView([markers[0].lat, markers[0].lng], Math.max(mapRef.current.getZoom(), 14), { animate: true });
    };

    return (
        <div style={{ position: 'relative' }}>
            <div ref={elRef} style={{ width: '100%', height, borderRadius: 12, overflow: 'hidden', zIndex: 0 }} />
            {follow && markers[0] && (
                <button
                    type="button" onClick={following ? () => setFollow(false) : resume}
                    style={{ position: 'absolute', left: 10, bottom: 24, zIndex: 500, border: 'none', cursor: 'pointer', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.35)', background: following ? '#22C55E' : '#fff', color: following ? '#fff' : '#1E293B' }}
                >
                    {following ? '● Following vehicle' : '⌖ Follow vehicle'}
                </button>
            )}
        </div>
    );
}

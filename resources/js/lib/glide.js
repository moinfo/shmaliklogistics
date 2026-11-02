// Smoothly slide a Leaflet marker to a new position instead of teleporting it.

const SNAP_METRES = 5000;   // a bigger jump is a gap / restart, not driving: show it instantly

/**
 * Slide `marker` to `to` ({lat, lng}) over `durationMs`.
 * `onFrame([lat, lng])` is called for every animation frame, so a map camera can follow the marker in step.
 * Starting a new glide mid-flight continues from wherever the marker currently is.
 */
export function glideMarker(marker, to, durationMs, onFrame) {
    if (marker._glide) cancelAnimationFrame(marker._glide);

    const from = marker.getLatLng();
    if (durationMs < 80 || from.distanceTo([to.lat, to.lng]) > SNAP_METRES) {
        marker.setLatLng([to.lat, to.lng]);
        marker._glide = null;
        onFrame?.([to.lat, to.lng]);
        return;
    }

    const start = performance.now();
    const step = (now) => {
        const t = Math.min(1, (now - start) / durationMs);
        const lat = from.lat + (to.lat - from.lat) * t;
        const lng = from.lng + (to.lng - from.lng) * t;
        marker.setLatLng([lat, lng]);
        onFrame?.([lat, lng]);
        marker._glide = t < 1 ? requestAnimationFrame(step) : null;
    };
    marker._glide = requestAnimationFrame(step);
}

export const isGliding = (marker) => !!marker?._glide;

export function stopGlide(marker) {
    if (marker?._glide) cancelAnimationFrame(marker._glide);
    if (marker) marker._glide = null;
}

/** How long to take over a move: the time between the two position samples, within sensible bounds. */
export function glideDuration(prevMs, nextMs, fallbackMs) {
    return prevMs && nextMs && nextMs > prevMs ? Math.min(Math.max(nextMs - prevMs, 1000), 20000) : fallbackMs;
}

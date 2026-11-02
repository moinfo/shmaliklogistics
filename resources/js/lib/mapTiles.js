// Shared base layers for the tracking maps: street map and satellite (with place labels).

const STREET = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 },
};
const SATELLITE = {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: { attribution: 'Imagery © Esri, Maxar, Earthstar Geographics', maxZoom: 19, zIndex: 1 },
};
const LABELS = {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, zIndex: 2 },   // labels sit on top of the imagery
};

const KEY = 'tracking-map-layer';

export function savedLayer() {
    try { return localStorage.getItem(KEY) === 'satellite' ? 'satellite' : 'street'; } catch { return 'street'; }
}

export function saveLayer(kind) {
    try { localStorage.setItem(KEY, kind); } catch { /* private mode: the choice just isn't remembered */ }
}

/** A Leaflet layer for 'street' or 'satellite' (satellite = imagery + road / place labels). */
export function makeBase(L, kind) {
    if (kind === 'satellite') {
        return L.layerGroup([L.tileLayer(SATELLITE.url, SATELLITE.options), L.tileLayer(LABELS.url, LABELS.options)]);
    }
    return L.tileLayer(STREET.url, STREET.options);
}

/**
 * Adds the street / satellite layers plus Leaflet's built-in switcher (top right) and remembers the choice.
 * The last used layer is shown first.
 */
export function addBaseLayers(L, map) {
    const street = makeBase(L, 'street');
    const satellite = makeBase(L, 'satellite');
    (savedLayer() === 'satellite' ? satellite : street).addTo(map);

    L.control.layers({ Map: street, Satellite: satellite }, null, { position: 'topright', collapsed: false }).addTo(map);
    map.on('baselayerchange', (e) => saveLayer(e.name === 'Satellite' ? 'satellite' : 'street'));
}

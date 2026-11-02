// The two lines shown under a vehicle: the road it is on, and where that is.
//   road: "via Morogoro Road"        area: "Msigani, Ubungo Municipal, Dar es Salaam, Tanzania"
// Positions typed in by hand only have a free-text `location`, which is shown as the area.
export function placeLines(p) {
    if (!p) return { road: null, area: null };
    return {
        road: p.road ? `via ${p.road}` : null,
        area: p.area || (p.road ? null : p.location || null),
    };
}
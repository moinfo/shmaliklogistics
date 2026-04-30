import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = {
    card:    '#0F1E32',
    cardHov: '#132436',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: '#94A3B8',
    textMut: '#475569',
};

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
            <Text size="xs" fw={600} style={{ color: meta.color }}>{meta.label}</Text>
        </Box>
    );
}

function DocBadge({ label, date, isDark }) {
    if (!date) return <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>—</Text>;
    const days = Math.floor((new Date(date) - new Date()) / 86400000);
    const color = days < 0 ? '#EF4444' : days <= 30 ? '#F59E0B' : '#22C55E';
    return (
        <Box style={{ display: 'inline-block', background: color + '18', border: `1px solid ${color}40`, borderRadius: 6, padding: '2px 8px' }}>
            <Text size="10px" fw={700} style={{ color }}>{days < 0 ? 'EXPIRED' : days <= 30 ? `${days}d` : new Date(date).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: '2-digit' })}</Text>
        </Box>
    );
}

// Leaflet map mounted lazily to avoid SSR/import issues
function FleetMap({ gpsVehicles, statuses, isDark }) {
    const mapRef     = useRef(null);
    const instanceRef = useRef(null);
    const markersRef  = useRef([]);

    useEffect(() => {
        if (!mapRef.current || instanceRef.current) return;

        // Dynamic import avoids Vite SSR issues with Leaflet's window access
        import('leaflet').then(({ default: L }) => {
            import('leaflet/dist/leaflet.css');

            const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true });
            instanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 18,
            }).addTo(map);

            const bounds = [];

            gpsVehicles.forEach(v => {
                const color = statuses[v.status]?.color ?? '#94A3B8';
                const icon = L.divIcon({
                    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;">🚛</div>`,
                    className: '',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                    popupAnchor: [0, -16],
                });

                const lastSeen = v.gps_last_seen
                    ? new Date(v.gps_last_seen).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Unknown';

                const popup = `
                    <div style="font-family:system-ui,sans-serif;min-width:160px">
                        <div style="font-weight:800;font-size:14px;margin-bottom:4px">${v.plate}</div>
                        <div style="font-size:12px;color:#555;margin-bottom:2px">${v.make ?? ''} · ${v.type ?? ''}</div>
                        ${v.driver ? `<div style="font-size:12px;color:#555;margin-bottom:2px">👤 ${v.driver.name}</div>` : ''}
                        <div style="font-size:11px;padding:3px 7px;background:${color}22;color:${color};border-radius:12px;display:inline-block;margin-bottom:6px;border:1px solid ${color}44">${statuses[v.status]?.label ?? v.status}</div>
                        ${v.gps_location_name ? `<div style="font-size:11px;color:#666;margin-bottom:4px">📍 ${v.gps_location_name}</div>` : ''}
                        <div style="font-size:10px;color:#999">Last seen: ${lastSeen}</div>
                        <a href="/system/fleet/${v.id}" style="display:block;margin-top:8px;font-size:12px;color:#3B82F6;text-decoration:none;font-weight:600">View vehicle →</a>
                    </div>
                `;

                const marker = L.marker([parseFloat(v.gps_lat), parseFloat(v.gps_lng)], { icon })
                    .addTo(map)
                    .bindPopup(popup);

                markersRef.current.push(marker);
                bounds.push([parseFloat(v.gps_lat), parseFloat(v.gps_lng)]);
            });

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
            } else {
                // Default center: Tanzania
                map.setView([-6.369, 34.889], 5);
            }
        });

        return () => {
            if (instanceRef.current) {
                instanceRef.current.remove();
                instanceRef.current = null;
                markersRef.current = [];
            }
        };
    }, []);

    return (
        <div
            ref={mapRef}
            style={{ width: '100%', height: 420, borderRadius: 14, overflow: 'hidden', zIndex: 0 }}
        />
    );
}

export default function FleetIndex({ vehicles, gpsVehicles = [], stats, statuses, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const rowHov     = isDark ? dk.cardHov : '#F8FAFC';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilters = (s, st) => {
        router.get('/system/fleet', { search: s, status: st }, { preserveState: true, replace: true });
    };

    const statCards = [
        { icon: '🚛', label: 'Total Vehicles',  value: stats.total,       accent: ['#1565C0', '#2196F3'] },
        { icon: '🟢', label: 'Active / On Road', value: stats.active,      accent: ['#065F46', '#059669'] },
        { icon: '🔧', label: 'In Maintenance',   value: stats.maintenance,  accent: ['#7F1D1D', '#DC2626'] },
        { icon: '⚠️', label: 'Docs Expiring',    value: stats.expiring,     accent: ['#78350F', '#F59E0B'] },
    ];

    return (
        <DashboardLayout title="Fleet">
            <Head title="Fleet" />

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Fleet Management</Text>
                    <Text size="sm" style={{ color: textSec }}>All registered vehicles — track, manage and maintain</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component={Link}
                        href="/system/fleet/create"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}
                    >
                        <Text size="sm">＋</Text> Add Vehicle
                    </Box>
                </motion.div>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` }} />
                            <Text style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</Text>
                            <Text fw={800} size="lg" style={{ color: textPri }}>{s.value}</Text>
                            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* GPS Map */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                <Group justify="space-between" style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}>
                        <Text fw={700} size="sm" style={{ color: textPri }}>🗺️ Live Fleet Map</Text>
                        {gpsVehicles.length > 0 && (
                            <Box style={{ background: '#3B82F620', border: '1px solid #3B82F640', borderRadius: 12, padding: '2px 8px' }}>
                                <Text size="xs" fw={600} style={{ color: '#3B82F6' }}>{gpsVehicles.length} tracked</Text>
                            </Box>
                        )}
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>Update GPS from a vehicle's detail page</Text>
                </Group>

                {gpsVehicles.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 10 }}>📡</Text>
                        <Text fw={600} style={{ color: textPri }}>No GPS data yet</Text>
                        <Text size="sm" style={{ color: textMut, marginTop: 4 }}>Open a vehicle's detail page to set its coordinates</Text>
                    </Box>
                ) : (
                    <Box style={{ padding: 16 }}>
                        <FleetMap gpsVehicles={gpsVehicles} statuses={statuses} isDark={isDark} />
                        {/* Status legend */}
                        <Group gap={12} mt={10} wrap="wrap">
                            {Object.entries(statuses).map(([k, v]) => (
                                gpsVehicles.some(gv => gv.status === k) && (
                                    <Group key={k} gap={5}>
                                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                                        <Text size="xs" style={{ color: textMut }}>{v.label}</Text>
                                    </Group>
                                )
                            ))}
                        </Group>
                    </Box>
                )}
            </Box>

            {/* Filters */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search plate, make, model, type…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(search, status)}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters(search, v ?? ''); }}
                        clearable
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        w={180}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters(search, status)} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', borderRadius: 8 }} size={36}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ display: 'grid', gridTemplateColumns: '110px 1fr 130px 100px 90px 110px 110px 60px', borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Plate', 'Make / Model', 'Driver', 'Type', 'Year', 'Insurance', 'Status', ''].map(h => (
                        <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {vehicles.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚗</Text>
                        <Text fw={600} style={{ color: textPri }}>No vehicles registered</Text>
                        <Text size="sm" style={{ color: textMut }}>Add the first vehicle to get started</Text>
                    </Box>
                ) : (
                    vehicles.data.map((v, i) => (
                        <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                            <Box
                                style={{ display: 'grid', gridTemplateColumns: '110px 1fr 130px 100px 90px 110px 110px 60px', padding: '14px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                onClick={() => router.visit(`/system/fleet/${v.id}`)}
                            >
                                <Group gap={5}>
                                    <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{v.plate}</Text>
                                    {v.gps_lat && <Text size="xs" title="GPS tracked">📡</Text>}
                                </Group>
                                <Stack gap={1}>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{v.make} {v.model_name}</Text>
                                    <Text size="xs" style={{ color: textMut }}>{v.payload_tons ? `${v.payload_tons}t payload` : ''}</Text>
                                </Stack>
                                <Text size="sm" style={{ color: v.driver ? textPri : textMut }}>{v.driver?.name ?? '—'}</Text>
                                <Text size="sm" style={{ color: textSec }}>{v.type}</Text>
                                <Text size="sm" style={{ color: textSec }}>{v.year}</Text>
                                <DocBadge label="Insurance" date={v.insurance_expiry} isDark={isDark} />
                                <StatusPill status={v.status} statuses={statuses} />
                                <Group gap={4} onClick={e => e.stopPropagation()}>
                                    <Tooltip label="Edit">
                                        <ActionIcon component={Link} href={`/system/fleet/${v.id}/edit`} variant="subtle" size="sm" style={{ color: textMut }}>✏️</ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Box>
                        </motion.div>
                    ))
                )}
            </Box>

            {vehicles.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={vehicles.current_page} total={vehicles.last_page} onChange={p => router.get('/system/fleet', { ...filters, page: p })} size="sm" />
                </Group>
            )}
        </DashboardLayout>
    );
}

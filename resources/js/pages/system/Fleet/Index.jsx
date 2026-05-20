import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}`, flexShrink: 0 }} />
            <Text size="xs" fw={700} style={{ color: meta.color, letterSpacing: 0.4 }}>{meta.label}</Text>
        </Box>
    );
}

function DocBadge({ date }) {
    if (!date) return <Text size="xs" style={{ color: '#94A3B8' }}>—</Text>;
    const days = Math.floor((new Date(date) - new Date()) / 86400000);
    const color = days < 0 ? '#EF4444' : days <= 30 ? '#F59E0B' : '#22C55E';
    const label = days < 0 ? 'EXPIRED' : days <= 30 ? `${days}d` : new Date(date).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: '2-digit' });
    return (
        <Box style={{ display: 'inline-block', background: color + '18', border: `1px solid ${color}35`, borderRadius: 6, padding: '3px 8px' }}>
            <Text size="10px" fw={700} style={{ color }}>{label}</Text>
        </Box>
    );
}

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

// Leaflet map mounted lazily to avoid SSR/import issues
function FleetMap({ gpsVehicles, statuses, isDark }) {
    const mapRef      = useRef(null);
    const instanceRef = useRef(null);
    const markersRef  = useRef([]);

    useEffect(() => {
        if (!mapRef.current || instanceRef.current) return;

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
                        <a href="/system/fleet/${v.id}" style="display:block;margin-top:8px;font-size:12px;color:#EA580C;text-decoration:none;font-weight:600">View vehicle →</a>
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
        <div ref={mapRef} style={{ width: '100%', height: 420, borderRadius: 14, overflow: 'hidden', zIndex: 0 }} />
    );
}

export default function FleetIndex({ vehicles, gpsVehicles = [], stats, statuses, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const can = useCan();

    const applyFilters = (s, st) => {
        router.get('/system/fleet', { search: s, status: st }, { preserveState: true, replace: true });
    };

    const handleDelete = (v) => {
        if (window.confirm(`Remove ${v.plate} from fleet?`)) {
            router.delete(`/system/fleet/${v.id}`, { preserveScroll: true });
        }
    };

    const statCards = [
        {
            icon: '🚛', label: 'Total Vehicles',   value: String(stats.total),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '🟢', label: 'Active / On Road',  value: String(stats.active),
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
        {
            icon: '🔧', label: 'In Maintenance',    value: String(stats.maintenance),
            grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)',
            glow: '0 8px 28px rgba(239,68,68,0.4)',
        },
        {
            icon: '⚠️', label: 'Docs Expiring',     value: String(stats.expiring),
            grad: 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)',
            glow: '0 8px 28px rgba(245,158,11,0.4)',
        },
    ];

    const cols = '120px 1fr 150px 90px 80px 130px 130px 100px';

    return (
        <DashboardLayout title="Fleet">
            <Head title="Fleet" />

            {/* ── Page header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={28} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '22px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }} wrap="wrap" gap="md">
                        <Stack gap={4}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                    🚗
                                </Box>
                                <Stack gap={1}>
                                    <Text fw={900} size="lg" c="white">Fleet Management</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>All registered vehicles — track, manage and maintain</Text>
                                </Stack>
                            </Group>
                        </Stack>
                        <Group gap={10}>
                            <Box component={Link} href="/system/fleet/fuel-logs"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                ⛽ Fuel Logs
                            </Box>
                            {can('fleet.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/fleet/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ Add Vehicle
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Stat cards — full gradient ── */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── GPS Map ── */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>🗺️ Live Fleet Map</Text>
                        {gpsVehicles.length > 0 && (
                            <Box style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '2px 8px' }}>
                                <Text size="xs" fw={600} style={{ color: '#3B82F6' }}>{gpsVehicles.length} tracked</Text>
                            </Box>
                        )}
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>Update GPS from a vehicle's detail page</Text>
                </Box>

                {gpsVehicles.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Box style={{ width: 72, height: 72, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
                            📡
                        </Box>
                        <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 4 }}>No GPS data yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Open a vehicle's detail page to set its coordinates</Text>
                    </Box>
                ) : (
                    <Box style={{ padding: 16 }}>
                        <FleetMap gpsVehicles={gpsVehicles} statuses={statuses} isDark={isDark} />
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

            {/* ── Filters ── */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search plate, make, model, type…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(search, status)}
                        leftSection={<Text size="sm">🔍</Text>}
                        style={{ flex: 1 }}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                        }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters(search, v ?? ''); }}
                        clearable
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        w={180}
                        styles={{
                            input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
                        }}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters(search, status)} size={38} radius={10}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* ── Table ── */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Table toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Vehicles</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {vehicles.data.length > 0 ? `Showing ${vehicles.from ?? 1}–${vehicles.to ?? vehicles.data.length} of ${vehicles.total ?? vehicles.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Table head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Plate', 'Make / Model', 'Driver', 'Type', 'Year', 'Insurance', 'Status', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {vehicles.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0',
                            border: '2px dashed rgba(234,88,12,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.4rem', margin: '0 auto 20px',
                        }}>
                            🚗
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No vehicles registered</Text>
                        <Text size="sm" style={{ color: textMut }}>Add the first vehicle to get started</Text>
                    </Box>
                ) : (
                    vehicles.data.map((v, i) => {
                        const meta = statuses[v.status] ?? { label: v.status, color: '#94A3B8' };
                        return (
                            <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: cols, gap: 0,
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`,
                                        cursor: 'pointer', alignItems: 'center',
                                        transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = rowHov;
                                        e.currentTarget.style.borderLeft = `3px solid ${meta.color}`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderLeft = '3px solid transparent';
                                    }}
                                    onClick={() => router.visit(`/system/fleet/${v.id}`)}>

                                    {/* Plate */}
                                    <Group gap={5} align="center">
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                            <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.6 }}>{v.plate}</Text>
                                        </Box>
                                        {v.gps_lat && <Text size="xs" title="GPS tracked">📡</Text>}
                                    </Group>

                                    {/* Make / Model */}
                                    <Stack gap={2}>
                                        <Text size="sm" fw={700} style={{ color: textPri }}>{v.make} {v.model_name}</Text>
                                        {v.payload_tons && (
                                            <Text size="xs" style={{ color: textMut }}>{v.payload_tons}t payload</Text>
                                        )}
                                    </Stack>

                                    {/* Driver */}
                                    <Text size="sm" style={{ color: v.driver ? textPri : textMut }}>{v.driver?.name ?? '—'}</Text>

                                    {/* Type */}
                                    <Text size="sm" style={{ color: textSec }}>{v.type}</Text>

                                    {/* Year */}
                                    <Text size="sm" style={{ color: textSec }}>{v.year}</Text>

                                    {/* Insurance */}
                                    <DocBadge date={v.insurance_expiry} />

                                    {/* Status */}
                                    <StatusPill status={v.status} statuses={statuses} />

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        <Tooltip label="View" position="top" withArrow>
                                            <ActionIcon component={Link} href={`/system/fleet/${v.id}`} variant="subtle" size={30}
                                                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                <Text size="xs">👁</Text>
                                            </ActionIcon>
                                        </Tooltip>
                                        {can('fleet.edit') && (
                                            <Tooltip label="Edit" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/fleet/${v.id}/edit`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, color: '#EA580C' }}>
                                                    <Text size="xs">✏️</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {can('fleet.delete') && (
                                            <Tooltip label="Delete" position="top" withArrow>
                                                <ActionIcon variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}
                                                    onClick={() => handleDelete(v)}>
                                                    <Text size="xs">🗑️</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {/* Table footer */}
                {vehicles.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>
                            {vehicles.total ?? vehicles.data.length} total vehicle{(vehicles.total ?? vehicles.data.length) !== 1 ? 's' : ''}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* ── Pagination ── */}
            {vehicles.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={vehicles.current_page}
                        total={vehicles.last_page}
                        onChange={p => router.get('/system/fleet', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

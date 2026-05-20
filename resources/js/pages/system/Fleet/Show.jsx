import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';
import { formatDate } from '../../../lib/date';

function InfoRow({ icon, label, value, mono = false, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8} style={{ minWidth: 0 }}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right', wordBreak: 'break-all' }}>
                {value ?? '—'}
            </Text>
        </Box>
    );
}

function DocRow({ icon, label, date, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    let display = '—';
    let color = textPri;
    if (date) {
        const days = Math.floor((new Date(date) - new Date()) / 86400000);
        display = new Date(date).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' });
        if (days < 0)        { display += ' (EXPIRED)';       color = '#EF4444'; }
        else if (days <= 30) { display += ` (${days}d left)`; color = '#F59E0B'; }
        else                 { color = '#22C55E'; }
    }
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8}>
                <Text size="sm">{icon ?? '📄'}</Text>
                <Text size="sm" style={{ color: textSec }}>{label}</Text>
            </Group>
            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: color + '18', border: `1px solid ${color}35`, borderRadius: 8, padding: '3px 10px' }}>
                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <Text size="xs" fw={700} style={{ color }}>{display}</Text>
            </Box>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent, toolbar }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function GpsPanel({ vehicle, isDark, canEdit }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    const [lat, setLat] = useState(vehicle.gps_lat ? String(vehicle.gps_lat) : '');
    const [lng, setLng] = useState(vehicle.gps_lng ? String(vehicle.gps_lng) : '');
    const [locName, setLocName] = useState(vehicle.gps_location_name ?? '');

    const handleSubmit = (e) => {
        e.preventDefault();
        router.patch(`/system/fleet/${vehicle.id}/gps`, { gps_lat: lat, gps_lng: lng, gps_location_name: locName });
    };

    const fmtLastSeen = vehicle.gps_last_seen
        ? new Date(vehicle.gps_last_seen).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : null;

    const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #0369A1, #0EA5E9)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    <Text size="md">📡</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>GPS Location</Text>
                </Group>
                {fmtLastSeen && <Text size="xs" style={{ color: textMut }}>Last updated: {fmtLastSeen}</Text>}
            </Box>
            <Box style={{ padding: 20 }}>
                {vehicle.gps_lat && vehicle.gps_lng && (
                    <Box style={{ background: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF', border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE'}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                        <Group gap={8}>
                            <Text size="sm" fw={600} style={{ color: '#3B82F6' }}>
                                📍 {vehicle.gps_lat}, {vehicle.gps_lng}
                                {vehicle.gps_location_name ? ` — ${vehicle.gps_location_name}` : ''}
                            </Text>
                        </Group>
                    </Box>
                )}
                {canEdit && (
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 10, alignItems: 'end' }}>
                            <div>
                                <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Latitude</Text>
                                <input type="number" step="any" placeholder="-6.369" value={lat} onChange={e => setLat(e.target.value)} style={inputStyle} required />
                            </div>
                            <div>
                                <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Longitude</Text>
                                <input type="number" step="any" placeholder="34.889" value={lng} onChange={e => setLng(e.target.value)} style={inputStyle} required />
                            </div>
                            <div>
                                <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Location Name (optional)</Text>
                                <input type="text" placeholder="e.g. Namanga Border, Dar es Salaam Port" value={locName} onChange={e => setLocName(e.target.value)} style={inputStyle} />
                            </div>
                            <button type="submit" style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #0369A1, #0EA5E9)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
                                Update GPS
                            </button>
                        </div>
                    </form>
                )}
            </Box>
        </Box>
    );
}

export default function ShowVehicle({ vehicle, trips, statuses, typeIcons, availableDrivers, driverStatuses, licenseClasses, customDocumentTypes = [] }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const [assignDriverId, setAssignDriverId] = useState(vehicle.driver?.id ? String(vehicle.driver.id) : null);
    const can = useCan();

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const meta     = statuses[vehicle.status] ?? { label: vehicle.status, color: '#94A3B8' };
    const typeIcon = typeIcons?.[vehicle.type] ?? '🚗';
    const flash    = props.flash ?? {};

    const driver   = vehicle.driver;
    const dMeta    = driver ? (driverStatuses?.[driver.status] ?? { label: driver.status, color: '#94A3B8' }) : null;
    const dInitials = driver ? driver.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '';

    const doAssignDriver = () => {
        router.patch(`/system/fleet/${vehicle.id}/driver`, { driver_id: assignDriverId ?? null });
    };

    const specCards = [
        { icon: '⚖️', label: 'Payload',  value: vehicle.payload_tons ? `${vehicle.payload_tons} tons` : '—' },
        { icon: '🔢', label: 'Mileage',  value: vehicle.mileage_km ? `${Number(vehicle.mileage_km).toLocaleString()} km` : '—' },
        { icon: '⛽', label: 'Fuel',     value: vehicle.fuel_type ? vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1) + (vehicle.fuel_tank_capacity_l ? ` · ${vehicle.fuel_tank_capacity_l}L` : '') : '—' },
        { icon: '👤', label: 'Driver',   value: driver?.name ?? 'Unassigned' },
    ];

    return (
        <DashboardLayout title={vehicle.plate}>
            <Head title={vehicle.plate} />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* ── Hero header banner ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={6}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                    {typeIcon}
                                </Box>
                                <Stack gap={2}>
                                    <Group gap={10} align="center">
                                        <Text fw={900} size="xl" c="white" style={{ letterSpacing: 2, fontFamily: 'monospace' }}>{vehicle.plate}</Text>
                                        <Box style={{ background: meta.color + '30', border: `1px solid ${meta.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                            <Group gap={5} align="center">
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                                                <Text size="xs" fw={700} style={{ color: '#fff' }}>{meta.label}</Text>
                                            </Group>
                                        </Box>
                                    </Group>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        {vehicle.make} {vehicle.model_name} · {vehicle.year} · {vehicle.type}
                                    </Text>
                                </Stack>
                            </Group>
                        </Stack>

                        <Group gap={8} wrap="wrap">
                            {can('fleet.edit') && (
                                <Select
                                    value={vehicle.status}
                                    onChange={s => router.patch(`/system/fleet/${vehicle.id}/status`, { status: s })}
                                    data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                                    size="sm"
                                    styles={{
                                        input: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 10, width: 150, backdropFilter: 'blur(8px)' },
                                        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
                                    }}
                                />
                            )}
                            {can('fleet.edit') && (
                                <Box component={Link} href={`/system/fleet/${vehicle.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Quick specs bar ── */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
                {specCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                            <Group gap={6} mb={6}>
                                <Text style={{ fontSize: '1rem' }}>{s.icon}</Text>
                                <Text size="xs" style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>{s.label}</Text>
                            </Group>
                            <Text size="sm" fw={700} style={{ color: textPri }}>{s.value}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── Assigned Driver ── */}
            <Box mb="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Assigned Driver" icon="👤" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        {driver ? (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0 14px', borderBottom: `1px solid ${divider}` }}>
                                <Box style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(33,150,243,0.35)' }}>
                                    <Text c="white" fw={900} size="sm">{dInitials}</Text>
                                </Box>
                                <Stack gap={3} style={{ flex: 1 }}>
                                    <Group gap="sm" wrap="wrap">
                                        <Text fw={800} size="sm" style={{ color: textPri }}>{driver.name}</Text>
                                        <Box style={{ background: dMeta.color + '1A', border: `1px solid ${dMeta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
                                            <Text size="xs" fw={700} style={{ color: dMeta.color }}>{dMeta.label}</Text>
                                        </Box>
                                    </Group>
                                    <Text size="xs" style={{ color: textSec }}>{driver.phone}</Text>
                                    {(driver.license_classes ?? []).length > 0 && (
                                        <Group gap={5} mt={2}>
                                            {(driver.license_classes ?? []).map(code => (
                                                <Tooltip key={code} label={licenseClasses?.[code] ?? code} withArrow position="top">
                                                    <Box style={{ background: isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 5, padding: '2px 8px', color: '#60A5FA', fontWeight: 800, fontSize: 12, cursor: 'default' }}>
                                                        {code}
                                                    </Box>
                                                </Tooltip>
                                            ))}
                                        </Group>
                                    )}
                                </Stack>
                                <Box component={Link} href={`/system/drivers/${driver.id}`}
                                    style={{ padding: '7px 14px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    View →
                                </Box>
                            </Box>
                        ) : (
                            <Text size="sm" style={{ color: textMut, paddingTop: 10, paddingBottom: 4 }}>No driver currently assigned.</Text>
                        )}

                        {can('fleet.edit') && (
                            <Group align="flex-end" gap="sm" mt="md">
                                <Box style={{ flex: 1 }}>
                                    <Select
                                        label={driver ? 'Change Driver' : 'Assign Driver'}
                                        placeholder="Select a driver…"
                                        value={assignDriverId}
                                        onChange={v => setAssignDriverId(v)}
                                        clearable
                                        data={availableDrivers.map(d => ({ value: String(d.id), label: `${d.name} — ${d.phone}` }))}
                                        styles={{
                                            label:    { color: textSec, fontSize: 13, marginBottom: 4 },
                                            input:    { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
                                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
                                        }}
                                    />
                                </Box>
                                <motion.div whileTap={{ scale: 0.97 }}>
                                    <Box component="button" type="button" onClick={doAssignDriver}
                                        style={{ padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(194,65,12,0.3)', marginBottom: 1 }}>
                                        {driver ? 'Reassign' : 'Assign'}
                                    </Box>
                                </motion.div>
                            </Group>
                        )}
                    </SectionCard>
                </motion.div>
            </Box>

            {/* ── Vehicle Details & Documents ── */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Vehicle Details" icon="🚗" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow icon="🔖" label="Plate"          value={vehicle.plate}          isDark={isDark} mono />
                        <InfoRow icon="🔩" label="Chassis No."    value={vehicle.chassis_number} isDark={isDark} mono />
                        <InfoRow icon="⚙️" label="Engine No."     value={vehicle.engine_number}  isDark={isDark} mono />
                        <InfoRow icon="🏭" label="Make"           value={vehicle.make}           isDark={isDark} />
                        <InfoRow icon="🚘" label="Model"          value={vehicle.model_name}     isDark={isDark} />
                        <InfoRow icon="📅" label="Year"           value={vehicle.year}           isDark={isDark} />
                        <InfoRow icon="🏷️" label="Type"           value={`${typeIcon} ${vehicle.type}`} isDark={isDark} />
                        <InfoRow icon="🎨" label="Color"          value={vehicle.color}          isDark={isDark} />
                        <InfoRow icon="👤" label="Owner"          value={vehicle.owner_name}     isDark={isDark} />
                    </SectionCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <SectionCard title="Documents" icon="📄" isDark={isDark} accent={['#065F46', '#059669']}>
                        <DocRow icon="🛡️"  label="Insurance"             date={vehicle.insurance_expiry}             isDark={isDark} />
                        <DocRow icon="🪪"  label="Road Licence"          date={vehicle.road_licence_expiry}          isDark={isDark} />
                        <DocRow icon="✅"  label="Fitness Certificate"   date={vehicle.fitness_expiry}               isDark={isDark} />
                        <DocRow icon="🏷️" label="TRA Sticker"           date={vehicle.tra_sticker_expiry}           isDark={isDark} />
                        <DocRow icon="📋"  label="Goods Vehicle Licence" date={vehicle.goods_vehicle_licence_expiry} isDark={isDark} />
                        <DocRow icon="🔧"  label="Next Service"          date={vehicle.next_service_date}            isDark={isDark} />
                        {customDocumentTypes.map(dt => (
                            <DocRow
                                key={dt.id}
                                icon="📌"
                                label={dt.name}
                                date={(vehicle.extra_documents ?? {})[String(dt.id)] ?? null}
                                isDark={isDark}
                            />
                        ))}
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* ── Recent Trips ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Box mb="md">
                    <SectionCard title={`Recent Trips — ${vehicle.plate}`} icon="🚛" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                        {trips.length === 0 ? (
                            <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Text size="2rem" style={{ marginBottom: 8 }}>🚛</Text>
                                <Text size="sm" style={{ color: textMut }}>No trips recorded for this vehicle yet.</Text>
                            </Box>
                        ) : (
                            <Box>
                                {/* Trips table head */}
                                <Box style={{ display: 'grid', gridTemplateColumns: '130px 1fr 130px 150px', background: headBg, borderBottom: `1px solid ${divider}`, padding: '8px 0', margin: '4px -20px 0', paddingLeft: 0, paddingRight: 0 }}>
                                    {['Trip #', 'Route', 'Date', 'Status'].map(h => (
                                        <Text key={h} size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9, paddingLeft: 0 }}>{h}</Text>
                                    ))}
                                </Box>
                                {trips.map((t, i) => {
                                    const tMeta = { color: '#94A3B8' };
                                    return (
                                        <Box key={t.id}
                                            style={{ display: 'grid', gridTemplateColumns: '130px 1fr 130px 150px', padding: '11px 0', borderBottom: `1px solid ${divider}`, cursor: 'pointer', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA'; e.currentTarget.style.borderLeft = '3px solid #EA580C'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                            onClick={() => router.visit(`/system/trips/${t.id}`)}>
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 6, padding: '3px 8px', width: 'fit-content' }}>
                                                <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{t.trip_number}</Text>
                                            </Box>
                                            <Text size="sm" style={{ color: textPri }}>{t.route_from} → {t.route_to}</Text>
                                            <Text size="sm" style={{ color: textSec }}>{formatDate(t.departure_date)}</Text>
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#94A3B818', border: '1px solid #94A3B835', borderRadius: 20, padding: '3px 10px', width: 'fit-content' }}>
                                                <Text size="xs" fw={600} style={{ color: '#94A3B8' }}>{t.status}</Text>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </SectionCard>
                </Box>
            </motion.div>

            {/* ── Notes ── */}
            {vehicle.notes && (
                <Box mb="md">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <SectionCard title="Notes" icon="📝" isDark={isDark}>
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{vehicle.notes}</Text>
                        </SectionCard>
                    </motion.div>
                </Box>
            )}

            {/* ── GPS Location ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Box mt="md">
                    <GpsPanel vehicle={vehicle} isDark={isDark} canEdit={can('fleet.edit')} />
                </Box>
            </motion.div>

            {/* ── Back link ── */}
            <Box mt="xl">
                <Box component={Link} href="/system/fleet"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Fleet
                </Box>
            </Box>
        </DashboardLayout>
    );
}

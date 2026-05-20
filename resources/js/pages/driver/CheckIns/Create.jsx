import { Box, Text, Group, Stack, SimpleGrid, Select, Textarea, TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMantineColorScheme } from '@mantine/core';
import DriverLayout from '../../../layouts/DriverLayout';

function timeAgo(ts) {
    if (!ts) return null;
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s iliyopita`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min iliyopita`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saa iliyopita`;
    return `${Math.floor(diff / 86400)} siku iliyopita`;
}

export default function DriverCheckInCreate({ driver, activeTrips, selectedTripId, lastCheckIn, intervalHours, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0600' : '#ffffff';
    const cardBorder = isDark ? 'rgba(234,88,12,0.15)' : '#EAECF0';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';

    const inputStyle = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, marginBottom: 6, fontSize: 13, fontWeight: 600 },
        dropdown: { background: cardBg, border: `1px solid ${cardBorder}` },
    };

    const [coords, setCoords] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        trip_id:     selectedTripId ? String(selectedTripId) : '',
        status:      'ok',
        lat:         '',
        lng:         '',
        location:    '',
        odometer_km: '',
        notes:       '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/driver/check-ins');
    };

    const captureLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude.toFixed(7);
                const lng = pos.coords.longitude.toFixed(7);
                setCoords({ lat, lng });
                setData(d => ({ ...d, lat, lng }));
            },
            () => {},
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const due = lastCheckIn
        ? new Date(lastCheckIn.checked_in_at).getTime() + intervalHours * 3600 * 1000
        : null;
    const isOverdue = due && Date.now() > due;

    return (
        <DriverLayout title="Check-In">
            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={20} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 16, padding: '18px 24px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group gap={10} style={{ position: 'relative', zIndex: 1 }}>
                        <Box style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📍</Box>
                        <Stack gap={1}>
                            <Text fw={900} size="lg" c="white">Check-In</Text>
                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Wakumbuke: check in kila masaa {intervalHours} ukiwa safarini.</Text>
                        </Stack>
                    </Group>
                </Box>
            </motion.div>

            {activeTrips.length === 0 ? (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '48px 20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2rem', marginBottom: 12 }}>🛑</Text>
                    <Text fw={600} style={{ color: textPri }}>Huna safari inayoendelea</Text>
                    <Text size="sm" style={{ color: textSec, marginTop: 4 }}>Check-in inahitaji trip iliyokwishaanzishwa (loading / in_transit / at_border).</Text>
                </Box>
            ) : (
                <form onSubmit={submit}>
                    {/* Trip selector */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}><Text size="md">🚛</Text><Text fw={700} size="sm" style={{ color: textPri }}>Safari</Text></Group>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            <Select
                                label="Safari"
                                required
                                value={data.trip_id || null}
                                onChange={v => setData('trip_id', v ?? '')}
                                data={activeTrips.map(t => ({ value: String(t.id), label: `${t.trip_number}  —  ${t.route_from} → ${t.route_to}` }))}
                                styles={inputStyle}
                            />
                            {lastCheckIn && (
                                <Box mt="sm" style={{
                                    background: isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.08)',
                                    border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                                    borderRadius: 10, padding: '10px 14px',
                                }}>
                                    <Text size="xs" fw={700} style={{ color: isOverdue ? '#F87171' : '#22C55E' }}>
                                        {isOverdue ? '⚠️ Check-in imepitiliza muda' : '✓ Check-in mwisho'}
                                    </Text>
                                    <Text size="xs" style={{ color: textSec, marginTop: 2 }}>
                                        {timeAgo(lastCheckIn.checked_in_at)} · {new Date(lastCheckIn.checked_in_at).toLocaleString()}
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Status */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}><Text size="md">🚦</Text><Text fw={700} size="sm" style={{ color: textPri }}>Hali Sasa</Text></Group>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            <SimpleGrid cols={3} spacing="sm">
                                {Object.entries(statuses).map(([k, v]) => (
                                    <Box
                                        key={k}
                                        component="button"
                                        type="button"
                                        onClick={() => setData('status', k)}
                                        style={{
                                            background: data.status === k ? v.color + '22' : 'transparent',
                                            border: `2px solid ${data.status === k ? v.color : 'rgba(255,255,255,0.08)'}`,
                                            color: data.status === k ? v.color : textSec,
                                            borderRadius: 12, padding: '14px 8px', cursor: 'pointer',
                                            fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5,
                                        }}
                                    >
                                        {v.label}
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    </Box>

                    {/* Location & odometer */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}><Text size="md">📍</Text><Text fw={700} size="sm" style={{ color: textPri }}>Mahali Ulipo</Text></Group>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                <TextInput
                                    label="Mahali"
                                    placeholder="e.g. Tunduma, Border"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    styles={inputStyle}
                                />
                                <NumberInput
                                    label="Odometer (KM)"
                                    value={data.odometer_km}
                                    onChange={v => setData('odometer_km', v)}
                                    min={0}
                                    thousandSeparator=","
                                    styles={inputStyle}
                                />
                            </SimpleGrid>
                            <Group mt="sm">
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={captureLocation}
                                    style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.3)', color: '#FB923C', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                >
                                    📍 Capture GPS
                                </Box>
                                <Text size="xs" style={{ color: textSec }}>
                                    {coords || (data.lat && data.lng) ? `${data.lat}, ${data.lng}` : 'Hakuna GPS bado'}
                                </Text>
                            </Group>
                        </Box>
                    </Box>

                    {/* Notes */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}><Text size="md">📝</Text><Text fw={700} size="sm" style={{ color: textPri }}>Maelezo</Text></Group>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            <Textarea
                                label="Maelezo (optional)"
                                placeholder="Issue yoyote, mahitaji, au taarifa muhimu…"
                                rows={3}
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                styles={inputStyle}
                            />
                        </Box>
                    </Box>

                    {Object.values(errors).length > 0 && (
                        <Box style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                            {Object.entries(errors).map(([k, v]) => (
                                <Text key={k} size="xs" style={{ color: '#FCA5A5' }}>✗ {v}</Text>
                            ))}
                        </Box>
                    )}

                    <motion.div whileTap={{ scale: 0.97 }}>
                        <Box
                            component="button"
                            type="submit"
                            disabled={processing}
                            style={{
                                width: '100%',
                                background: data.status === 'emergency'
                                    ? 'linear-gradient(135deg, #7F1D1D, #EF4444)'
                                    : 'linear-gradient(135deg, #C2410C, #EA580C)',
                                border: 'none', borderRadius: 12,
                                padding: '14px', color: 'white', fontWeight: 800, fontSize: 15,
                                cursor: processing ? 'not-allowed' : 'pointer',
                                boxShadow: data.status === 'emergency' ? '0 8px 24px rgba(239,68,68,0.35)' : '0 8px 24px rgba(194,65,12,0.35)',
                                opacity: processing ? 0.7 : 1,
                            }}
                        >
                            {processing ? 'Tunatuma…' : '✓ Tuma Check-In'}
                        </Box>
                    </motion.div>
                </form>
            )}
        </DriverLayout>
    );
}

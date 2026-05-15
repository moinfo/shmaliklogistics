import { Box, Text, Group, Stack, SimpleGrid, Select, Textarea, TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DriverLayout from '../../../layouts/DriverLayout';

const card = { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.15)', borderRadius: 14 };
const inputStyle = {
    input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(33,150,243,0.2)', color: '#E2E8F0', borderRadius: 8 },
    label: { color: '#94A3B8', marginBottom: 6, fontSize: 13 },
};

function timeAgo(ts) {
    if (!ts) return null;
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s iliyopita`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min iliyopita`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saa iliyopita`;
    return `${Math.floor(diff / 86400)} siku iliyopita`;
}

export default function DriverCheckInCreate({ driver, activeTrips, selectedTripId, lastCheckIn, intervalHours, statuses }) {
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
            <Stack gap={2} mb="lg">
                <Text fw={800} size="xl" c="white">📍 Check-In</Text>
                <Text size="sm" style={{ color: '#94A3B8' }}>
                    Wakumbuke: check in kila masaa {intervalHours} ukiwa safarini.
                </Text>
            </Stack>

            {activeTrips.length === 0 ? (
                <Box style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2rem', marginBottom: 12 }}>🛑</Text>
                    <Text c="white" fw={600}>Huna safari inayoendelea</Text>
                    <Text size="sm" style={{ color: '#94A3B8' }}>Check-in inahitaji trip iliyokwishaanzishwa (loading / in_transit / at_border).</Text>
                </Box>
            ) : (
                <form onSubmit={submit}>
                    {/* Trip selector */}
                    <Box style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
                        <Select
                            label="Safari"
                            required
                            value={data.trip_id || null}
                            onChange={v => setData('trip_id', v ?? '')}
                            data={activeTrips.map(t => ({ value: String(t.id), label: `${t.trip_number}  —  ${t.route_from} → ${t.route_to}` }))}
                            styles={{ ...inputStyle, dropdown: { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.2)' } }}
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
                                <Text size="xs" style={{ color: '#CBD5E1', marginTop: 2 }}>
                                    {timeAgo(lastCheckIn.checked_in_at)} · {new Date(lastCheckIn.checked_in_at).toLocaleString()}
                                </Text>
                            </Box>
                        )}
                    </Box>

                    {/* Status */}
                    <Box style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
                        <Text fw={700} c="white" mb="sm">Hali Sasa</Text>
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
                                        color: data.status === k ? v.color : '#94A3B8',
                                        borderRadius: 12, padding: '14px 8px', cursor: 'pointer',
                                        fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5,
                                    }}
                                >
                                    {v.label}
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>

                    {/* Location & odometer */}
                    <Box style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
                        <Text fw={700} c="white" mb="md">Mahali Ulipo</Text>
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
                            <Box component="button" type="button" onClick={captureLocation}
                                style={{ background: 'rgba(33,150,243,0.12)', border: '1px solid rgba(33,150,243,0.3)', color: '#60A5FA', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                📍 Capture GPS
                            </Box>
                            <Text size="xs" style={{ color: '#94A3B8' }}>
                                {coords || (data.lat && data.lng) ? `${data.lat}, ${data.lng}` : 'Hakuna GPS bado'}
                            </Text>
                        </Group>
                    </Box>

                    {/* Notes */}
                    <Box style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
                        <Textarea
                            label="Maelezo (optional)"
                            placeholder="Issue yoyote, mahitaji, au taarifa muhimu…"
                            rows={3}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            styles={inputStyle}
                        />
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
                                    : 'linear-gradient(135deg, #1565C0, #2196F3)',
                                border: 'none', borderRadius: 12,
                                padding: '14px', color: 'white', fontWeight: 800, fontSize: 15,
                                cursor: processing ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(33,150,243,0.35)',
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

import { Box, Text, Group, Stack, SimpleGrid, Select, Textarea, TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import DriverLayout from '../../../layouts/DriverLayout';

const card = { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.15)', borderRadius: 14 };
const inputStyle = {
    input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(33,150,243,0.2)', color: '#E2E8F0', borderRadius: 8 },
    label: { color: '#94A3B8', marginBottom: 6, fontSize: 13 },
};

function ItemRow({ keyId, label, value, onChange, onNotes, notes }) {
    const statusColors = { ok: '#22C55E', issue: '#EF4444', na: '#64748B' };
    return (
        <Box style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
                <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={600} c="white">{label}</Text>
                    {value === 'issue' && (
                        <TextInput
                            placeholder="Describe the issue (Swahili au English)…"
                            value={notes ?? ''}
                            onChange={e => onNotes(e.target.value)}
                            styles={{ input: { ...inputStyle.input, marginTop: 6, fontSize: 13 } }}
                        />
                    )}
                </Box>
                <Group gap={4}>
                    {['ok', 'issue', 'na'].map(s => (
                        <Box
                            key={s}
                            component="button"
                            type="button"
                            onClick={() => onChange(s)}
                            style={{
                                background: value === s ? statusColors[s] + '22' : 'transparent',
                                border: `1px solid ${value === s ? statusColors[s] : 'rgba(255,255,255,0.1)'}`,
                                color: value === s ? statusColors[s] : '#94A3B8',
                                borderRadius: 8, padding: '6px 12px',
                                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                textTransform: 'uppercase', letterSpacing: 0.5,
                            }}
                        >
                            {s === 'ok' ? '✓ OK' : s === 'issue' ? '✗ Issue' : 'N/A'}
                        </Box>
                    ))}
                </Group>
            </Group>
        </Box>
    );
}

export default function DriverInspectionCreate({ driver, trip, checklist, statuses, types, recent }) {
    const initialItems = Object.fromEntries(
        Object.keys(checklist).map(k => [k, { status: 'ok', notes: '' }])
    );

    const { data, setData, post, processing, errors } = useForm({
        inspection_type: 'pre_trip',
        trip_id:         trip?.id ?? '',
        items:           initialItems,
        overall_status:  'ok',
        odometer_km:     '',
        location:        '',
        lat:             '',
        lng:             '',
        notes:           '',
        photo:           null,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/driver/inspections', { forceFormData: true });
    };

    // Auto-suggest overall_status based on per-item flags
    const issueCount = useMemo(
        () => Object.values(data.items).filter(i => i.status === 'issue').length,
        [data.items]
    );

    const setItem = (key, patch) => {
        setData('items', { ...data.items, [key]: { ...data.items[key], ...patch } });
    };

    const captureLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            pos => {
                setData(d => ({ ...d, lat: pos.coords.latitude.toFixed(7), lng: pos.coords.longitude.toFixed(7) }));
            },
            () => {},
            { enableHighAccuracy: false, timeout: 8000 }
        );
    };

    return (
        <DriverLayout title="Ukaguzi wa Gari">
            <Stack gap={2} mb="lg">
                <Text fw={800} size="xl" c="white">🔧 Ukaguzi wa Gari</Text>
                <Text size="sm" style={{ color: '#94A3B8' }}>
                    Gari: <Text component="span" fw={700} style={{ color: '#60A5FA' }}>{driver.vehicle?.plate ?? '—'}</Text>
                    {driver.vehicle && <>  ·  {driver.vehicle.make} {driver.vehicle.model_name}</>}
                </Text>
            </Stack>

            {trip && (
                <Box style={{ ...card, padding: '12px 16px', marginBottom: 16, background: 'rgba(33,150,243,0.06)', borderColor: 'rgba(33,150,243,0.3)' }}>
                    <Text size="sm" c="white">
                        Ukaguzi huu unaambatishwa na trip <Text component="span" fw={700} style={{ color: '#60A5FA' }}>{trip.trip_number}</Text> ({trip.route_from} → {trip.route_to})
                    </Text>
                </Box>
            )}

            <form onSubmit={submit}>
                {/* Inspection type */}
                <Box style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
                    <Text fw={700} c="white" mb="sm">Aina ya Ukaguzi</Text>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                        {Object.entries(types).map(([k, v]) => (
                            <Box
                                key={k}
                                component="button"
                                type="button"
                                onClick={() => setData('inspection_type', k)}
                                style={{
                                    background: data.inspection_type === k ? v.color + '22' : 'transparent',
                                    border: `1px solid ${data.inspection_type === k ? v.color : 'rgba(255,255,255,0.08)'}`,
                                    color: data.inspection_type === k ? v.color : '#94A3B8',
                                    borderRadius: 10, padding: '12px', cursor: 'pointer',
                                    fontWeight: 700, fontSize: 13,
                                }}
                            >
                                {v.label}
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>

                {/* Checklist */}
                <Box style={{ ...card, marginBottom: 16, overflow: 'hidden' }}>
                    <Box style={{ padding: '14px 20px', borderBottom: '1px solid rgba(33,150,243,0.1)' }}>
                        <Group justify="space-between">
                            <Text fw={700} c="white">Vipengele vya Kuangalia</Text>
                            <Text size="xs" style={{ color: issueCount ? '#EF4444' : '#22C55E' }}>
                                {issueCount} issue{issueCount === 1 ? '' : 's'}
                            </Text>
                        </Group>
                    </Box>
                    {Object.entries(checklist).map(([key, label]) => (
                        <ItemRow
                            key={key}
                            keyId={key}
                            label={label}
                            value={data.items[key].status}
                            notes={data.items[key].notes}
                            onChange={v => setItem(key, { status: v })}
                            onNotes={n => setItem(key, { notes: n })}
                        />
                    ))}
                </Box>

                {/* Context */}
                <Box style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
                    <Text fw={700} c="white" mb="md">Maelezo Zaidi</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Select
                            label="Hali ya Jumla"
                            required
                            value={data.overall_status}
                            onChange={v => setData('overall_status', v)}
                            data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                            styles={{ ...inputStyle, dropdown: { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.2)' } }}
                        />
                        <NumberInput
                            label="Odometer (KM)"
                            placeholder="123,456"
                            value={data.odometer_km}
                            onChange={v => setData('odometer_km', v)}
                            min={0}
                            thousandSeparator=","
                            styles={inputStyle}
                        />
                        <TextInput
                            label="Mahali"
                            placeholder="e.g. Dar es Salaam Garage"
                            value={data.location}
                            onChange={e => setData('location', e.target.value)}
                            styles={inputStyle}
                        />
                        <Box>
                            <Text size="xs" style={{ color: '#94A3B8', marginBottom: 6 }}>GPS</Text>
                            <Group gap={6}>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={captureLocation}
                                    style={{ background: 'rgba(33,150,243,0.12)', border: '1px solid rgba(33,150,243,0.3)', color: '#60A5FA', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                >
                                    📍 Capture
                                </Box>
                                <Text size="xs" style={{ color: '#94A3B8' }}>
                                    {data.lat && data.lng ? `${data.lat}, ${data.lng}` : 'Hakuna GPS'}
                                </Text>
                            </Group>
                        </Box>
                    </SimpleGrid>
                    <Textarea
                        mt="md"
                        label="Notes (optional)"
                        rows={3}
                        value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                        styles={inputStyle}
                    />

                    {/* Photo upload */}
                    <Box mt="md">
                        <Text size="xs" style={{ color: '#94A3B8', marginBottom: 6 }}>Picha (optional — chukua picha kama kuna issue)</Text>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            capture="environment"
                            onChange={e => setData('photo', e.target.files?.[0] ?? null)}
                            style={{ color: '#94A3B8', fontSize: 13 }}
                        />
                        {data.photo && <Text size="xs" mt={4} style={{ color: '#22C55E' }}>✓ {data.photo.name}</Text>}
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
                            background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                            border: 'none', borderRadius: 12,
                            padding: '14px', color: 'white', fontWeight: 800, fontSize: 15,
                            cursor: processing ? 'not-allowed' : 'pointer',
                            boxShadow: '0 8px 24px rgba(33,150,243,0.35)',
                            opacity: processing ? 0.7 : 1,
                        }}
                    >
                        {processing ? 'Tunahifadhi…' : '✓ Hifadhi Ukaguzi'}
                    </Box>
                </motion.div>
            </form>

            {recent.length > 0 && (
                <Box style={{ ...card, marginTop: 20, padding: '16px 20px' }}>
                    <Text fw={700} c="white" mb="sm">Ukaguzi wa Hivi Karibuni</Text>
                    <Stack gap="xs">
                        {recent.map(r => {
                            const s = statuses[r.overall_status] ?? { label: r.overall_status, color: '#94A3B8' };
                            return (
                                <Group key={r.id} justify="space-between" py={6} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Text size="xs" style={{ color: '#94A3B8' }}>{new Date(r.inspected_at).toLocaleString()}</Text>
                                    <Box style={{ background: s.color + '22', border: `1px solid ${s.color}55`, borderRadius: 14, padding: '2px 10px' }}>
                                        <Text size="10px" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                    </Box>
                                </Group>
                            );
                        })}
                    </Stack>
                </Box>
            )}
        </DriverLayout>
    );
}

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

const sectionColors = { A: '#3B82F6', B: '#8B5CF6', C: '#F59E0B', D: '#EF4444', E: '#22C55E' };

function SectionTable({ sectionKey, section, items, setItem }) {
    const [optOk, optIssue] = Object.entries(section.options);
    const accent = sectionColors[sectionKey] ?? '#3B82F6';

    return (
        <Box style={{ ...card, marginBottom: 16, overflow: 'hidden' }}>
            {/* Section header */}
            <Box style={{
                padding: '12px 20px',
                background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
                borderBottom: `1px solid ${accent}30`,
            }}>
                <Group gap={10}>
                    <Box style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: `${accent}22`, border: `1px solid ${accent}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Text size="xs" fw={900} style={{ color: accent }}>{sectionKey}</Text>
                    </Box>
                    <Text fw={800} size="sm" style={{ color: accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {section.title}
                    </Text>
                </Group>
            </Box>

            {/* Column headers */}
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 110px 140px', padding: '8px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <Text size="11px" fw={700} style={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6 }}>Item</Text>
                <Text size="11px" fw={700} style={{ color: '#22C55E', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' }}>{optOk[1]}</Text>
                <Text size="11px" fw={700} style={{ color: '#EF4444', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' }}>{optIssue[1]}</Text>
            </Box>

            {/* Item rows */}
            {Object.entries(section.items).map(([key, label], idx) => {
                const item = items[key] ?? { status: 'ok', notes: '' };
                const isIssue = item.status === optIssue[0];
                return (
                    <Box key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 110px 140px', padding: '12px 20px', alignItems: 'center' }}>
                            <Text size="sm" fw={500} c="white">{label}</Text>

                            {/* OK / Available / Checked button */}
                            <Box style={{ display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => setItem(key, { status: optOk[0] })}
                                    style={{
                                        width: 36, height: 36, borderRadius: 8,
                                        background: item.status === optOk[0] ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.04)',
                                        border: `2px solid ${item.status === optOk[0] ? '#22C55E' : 'rgba(255,255,255,0.1)'}`,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {item.status === optOk[0] && <Text style={{ color: '#22C55E', fontSize: 16 }}>✓</Text>}
                                </Box>
                            </Box>

                            {/* Issue / Missing / Not Checked button */}
                            <Box style={{ display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => setItem(key, { status: optIssue[0] })}
                                    style={{
                                        width: 36, height: 36, borderRadius: 8,
                                        background: isIssue ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.04)',
                                        border: `2px solid ${isIssue ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {isIssue && <Text style={{ color: '#EF4444', fontSize: 16 }}>✗</Text>}
                                </Box>
                            </Box>
                        </Box>

                        {/* Remarks / notes inline when issue flagged */}
                        {isIssue && (
                            <Box style={{ padding: '0 20px 12px' }}>
                                <TextInput
                                    placeholder="Remarks / maelezo ya tatizo…"
                                    value={item.notes ?? ''}
                                    onChange={e => setItem(key, { notes: e.target.value })}
                                    styles={{
                                        input: {
                                            ...inputStyle.input,
                                            fontSize: 12,
                                            borderColor: 'rgba(239,68,68,0.3)',
                                            background: 'rgba(239,68,68,0.06)',
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

export default function DriverInspectionCreate({ driver, trip, checklist, sections, statuses, types, recent }) {
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

    const issueCount = useMemo(
        () => Object.values(data.items).filter(i => i.status === 'issue').length,
        [data.items]
    );

    const setItem = (key, patch) =>
        setData('items', { ...data.items, [key]: { ...data.items[key], ...patch } });

    const captureLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            pos => setData(d => ({ ...d, lat: pos.coords.latitude.toFixed(7), lng: pos.coords.longitude.toFixed(7) })),
            () => {},
            { enableHighAccuracy: false, timeout: 8000 }
        );
    };

    return (
        <DriverLayout title="Ukaguzi wa Gari">
            {/* Page title */}
            <Stack gap={2} mb="lg">
                <Text fw={800} size="xl" c="white">🔧 Vehicle Inspection</Text>
                <Text size="sm" style={{ color: '#94A3B8' }}>
                    Gari: <Text component="span" fw={700} style={{ color: '#60A5FA' }}>{driver.vehicle?.plate ?? '—'}</Text>
                    {driver.vehicle && <> · {driver.vehicle.make} {driver.vehicle.model_name}</>}
                </Text>
            </Stack>

            {trip && (
                <Box style={{ ...card, padding: '12px 16px', marginBottom: 16, background: 'rgba(33,150,243,0.06)', borderColor: 'rgba(33,150,243,0.3)' }}>
                    <Text size="sm" c="white">
                        Linked to trip <Text component="span" fw={700} style={{ color: '#60A5FA' }}>{trip.trip_number}</Text> ({trip.route_from} → {trip.route_to})
                    </Text>
                </Box>
            )}

            <form onSubmit={submit}>
                {/* Inspection type selector */}
                <Box style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
                    <Group justify="space-between" mb="sm">
                        <Text fw={700} c="white">Inspection Type</Text>
                        {issueCount > 0 && (
                            <Box style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 20, padding: '3px 12px' }}>
                                <Text size="xs" fw={700} style={{ color: '#F87171' }}>⚠ {issueCount} item{issueCount > 1 ? 's' : ''} flagged</Text>
                            </Box>
                        )}
                    </Group>
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

                {/* Checklist sections A–E */}
                {Object.entries(sections).map(([sectionKey, section]) => (
                    <SectionTable
                        key={sectionKey}
                        sectionKey={sectionKey}
                        section={section}
                        items={data.items}
                        setItem={setItem}
                    />
                ))}

                {/* Context fields */}
                <Box style={{ ...card, padding: '20px', marginBottom: 16 }}>
                    <Text fw={700} c="white" mb="md">Additional Details</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <Select
                            label="Overall Status"
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
                            label="Location"
                            placeholder="e.g. Dar es Salaam Garage"
                            value={data.location}
                            onChange={e => setData('location', e.target.value)}
                            styles={inputStyle}
                        />
                        <Box>
                            <Text size="xs" style={{ color: '#94A3B8', marginBottom: 6 }}>GPS Location</Text>
                            <Group gap={8}>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={captureLocation}
                                    style={{ background: 'rgba(33,150,243,0.12)', border: '1px solid rgba(33,150,243,0.3)', color: '#60A5FA', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                >
                                    📍 Capture GPS
                                </Box>
                                {data.lat && data.lng
                                    ? <Text size="xs" style={{ color: '#22C55E' }}>✓ {data.lat}, {data.lng}</Text>
                                    : <Text size="xs" style={{ color: '#64748B' }}>Not captured</Text>
                                }
                            </Group>
                        </Box>
                    </SimpleGrid>

                    <Textarea
                        mt="md"
                        label="General Notes (optional)"
                        rows={3}
                        value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                        styles={inputStyle}
                    />

                    <Box mt="md">
                        <Text size="xs" style={{ color: '#94A3B8', marginBottom: 6 }}>Photo (optional — capture if issue found)</Text>
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

                {/* Driver declaration */}
                <Box style={{ ...card, padding: '16px 20px', marginBottom: 16, background: 'rgba(33,150,243,0.04)', borderColor: 'rgba(33,150,243,0.2)' }}>
                    <Text size="xs" style={{ color: '#94A3B8', lineHeight: 1.7 }}>
                        <Text component="span" fw={700} c="white">Driver Declaration: </Text>
                        I confirm that I have inspected the vehicle and verified that it is safe for operation. Any defects noted above have been reported to dispatch.
                    </Text>
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
                            background: issueCount > 0
                                ? 'linear-gradient(135deg, #B45309, #F59E0B)'
                                : 'linear-gradient(135deg, #065F46, #22C55E)',
                            border: 'none', borderRadius: 12,
                            padding: '14px', color: 'white', fontWeight: 800, fontSize: 15,
                            cursor: processing ? 'not-allowed' : 'pointer',
                            boxShadow: `0 8px 24px ${issueCount > 0 ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.3)'}`,
                            opacity: processing ? 0.7 : 1,
                        }}
                    >
                        {processing ? 'Saving…' : issueCount > 0 ? `⚠ Submit with ${issueCount} Issue${issueCount > 1 ? 's' : ''}` : '✓ Submit Inspection'}
                    </Box>
                </motion.div>
            </form>

            {recent.length > 0 && (
                <Box style={{ ...card, marginTop: 20, padding: '16px 20px' }}>
                    <Text fw={700} c="white" mb="sm">Recent Inspections</Text>
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

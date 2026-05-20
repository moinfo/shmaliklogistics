import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

export default function PermitForm({ data, setData, errors, statuses, types, currencies, trips = [], vehicles = [], processing, onSubmit, backHref, submitLabel = 'Save Permit' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };
    const numStyles = { ...inputStyles, section: { color: textSec } };

    const tripData = [
        { value: '', label: 'Not linked to a trip' },
        ...trips.map(t => ({ value: String(t.id), label: `${t.trip_number} · ${t.route_from} → ${t.route_to} (${t.vehicle_plate})` })),
    ];

    const vehicleData = vehicles.map(v => ({ value: v.plate, label: `${v.plate} — ${v.make} ${v.model_name}` }));

    const handleTripChange = (val) => {
        const trip = trips.find(t => String(t.id) === val);
        setData({ ...data, trip_id: val ? Number(val) : null, ...(trip?.vehicle_plate ? { vehicle_plate: trip.vehicle_plate } : {}) });
    };

    const FormCard = ({ icon, title, children }) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 16 }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    <Text size="md">{icon}</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px 24px' }}>{children}</Box>
        </Box>
    );

    return (
        <form onSubmit={onSubmit}>
            <FormCard icon="🛂" title="Permit Information">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Permit Type *"
                        placeholder="Select type…"
                        value={data.permit_type}
                        onChange={v => setData('permit_type', v)}
                        data={types.map(t => ({ value: t, label: t }))}
                        error={errors.permit_type}
                        required
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Status *"
                        value={data.status}
                        onChange={v => setData('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.status}
                        required
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <TextInput
                        label="Permit Number"
                        placeholder="TZP-2026-12345"
                        value={data.permit_number ?? ''}
                        onChange={e => setData('permit_number', e.target.value)}
                        error={errors.permit_number}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Issuing Country"
                        placeholder="Tanzania"
                        value={data.issuing_country ?? ''}
                        onChange={e => setData('issuing_country', e.target.value)}
                        error={errors.issuing_country}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Issuing Authority"
                        placeholder="Tanzania Revenue Authority"
                        value={data.issuing_authority ?? ''}
                        onChange={e => setData('issuing_authority', e.target.value)}
                        error={errors.issuing_authority}
                        styles={inputStyles}
                    />
                    <Select
                        label="Linked Trip (optional)"
                        placeholder="None"
                        value={data.trip_id ? String(data.trip_id) : ''}
                        onChange={handleTripChange}
                        data={tripData}
                        searchable
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Vehicle Plate *"
                        placeholder="Select vehicle…"
                        searchable
                        clearable
                        value={data.vehicle_plate || null}
                        onChange={v => setData('vehicle_plate', v ?? '')}
                        data={vehicleData}
                        error={errors.vehicle_plate}
                        required
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        nothingFoundMessage="No vehicles found"
                    />
                </SimpleGrid>
            </FormCard>

            <FormCard icon="📅" title="Dates & Cost">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <DatePicker
                        label="Issue Date"
                        value={data.issue_date ?? ''}
                        onChange={v => setData('issue_date', v)}
                        error={errors.issue_date}
                        styles={inputStyles}
                    />
                    <DatePicker
                        label="Expiry Date"
                        value={data.expiry_date ?? ''}
                        onChange={v => setData('expiry_date', v)}
                        error={errors.expiry_date}
                        styles={inputStyles}
                    />
                    <NumberInput
                        label="Cost"
                        placeholder="500"
                        min={0}
                        thousandSeparator=","
                        value={data.cost ?? 0}
                        onChange={v => setData('cost', v)}
                        error={errors.cost}
                        styles={numStyles}
                    />
                    <Select
                        label="Currency"
                        value={data.currency ?? 'USD'}
                        onChange={v => setData('currency', v)}
                        data={currencies.map(c => ({ value: c, label: c }))}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
            </FormCard>

            <FormCard icon="📝" title="Notes">
                <Textarea
                    placeholder="Additional notes…"
                    minRows={3}
                    value={data.notes ?? ''}
                    onChange={e => setData('notes', e.target.value)}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                />
            </FormCard>

            <Group justify="flex-end" gap="sm" mt="md">
                <Box
                    component={Link}
                    href={backHref}
                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textSec, padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                >
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component="button"
                        type="submit"
                        disabled={processing}
                        style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, fontWeight: 700, color: '#fff', padding: '0 28px', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1, fontSize: 14 }}
                    >
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

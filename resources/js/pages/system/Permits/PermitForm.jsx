import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function Section({ title, icon, children, isDark }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px' }}>{children}</Box>
        </Box>
    );
}

export default function PermitForm({ data, setData, errors, statuses, types, currencies, trips = [], vehicles = [], processing, onSubmit, backHref, submitLabel = 'Save Permit' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };
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

    return (
        <form onSubmit={onSubmit}>
            <Section title="Permit Information" icon="🛂" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Permit Type" required
                        placeholder="Select type…"
                        value={data.permit_type}
                        onChange={v => setData('permit_type', v)}
                        data={types.map(t => ({ value: t, label: t }))}
                        error={errors.permit_type}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Status" required
                        value={data.status}
                        onChange={v => setData('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <TextInput label="Permit Number" placeholder="TZP-2026-12345" value={data.permit_number ?? ''} onChange={e => setData('permit_number', e.target.value)} error={errors.permit_number} styles={inputStyles} />
                    <TextInput label="Issuing Country" placeholder="Tanzania" value={data.issuing_country ?? ''} onChange={e => setData('issuing_country', e.target.value)} error={errors.issuing_country} styles={inputStyles} />
                    <TextInput label="Issuing Authority" placeholder="Tanzania Revenue Authority" value={data.issuing_authority ?? ''} onChange={e => setData('issuing_authority', e.target.value)} error={errors.issuing_authority} styles={inputStyles} />
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
                        label="Vehicle Plate" required
                        placeholder="Select vehicle…"
                        searchable clearable
                        value={data.vehicle_plate || null}
                        onChange={v => setData('vehicle_plate', v ?? '')}
                        data={vehicleData}
                        error={errors.vehicle_plate}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        nothingFoundMessage="No vehicles found"
                    />
                </SimpleGrid>
            </Section>

            <Section title="Dates & Cost" icon="📅" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <DatePicker label="Issue Date" value={data.issue_date ?? ''} onChange={v => setData('issue_date', v)} error={errors.issue_date} styles={inputStyles} />
                    <DatePicker label="Expiry Date" value={data.expiry_date ?? ''} onChange={v => setData('expiry_date', v)} error={errors.expiry_date} styles={inputStyles} />
                    <NumberInput label="Cost" placeholder="500" min={0} thousandSeparator="," value={data.cost ?? 0} onChange={v => setData('cost', v)} error={errors.cost} styles={numStyles} />
                    <Select
                        label="Currency"
                        value={data.currency ?? 'USD'}
                        onChange={v => setData('currency', v)}
                        data={currencies.map(c => ({ value: c, label: c }))}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
            </Section>

            <Section title="Notes" icon="📝" isDark={isDark}>
                <Textarea placeholder="Additional notes…" minRows={3} value={data.notes ?? ''} onChange={e => setData('notes', e.target.value)} styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }} />
            </Section>

            <Group justify="flex-end" gap="md">
                <Box component={Link} href={backHref} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Cancel</Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

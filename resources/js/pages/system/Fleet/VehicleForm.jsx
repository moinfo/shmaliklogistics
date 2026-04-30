import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function Section({ title, children, isDark }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '20px' }}>{children}</Box>
        </Box>
    );
}

export default function VehicleForm({ data, setData, errors, statuses, types, processing, onSubmit, backHref, submitLabel = 'Save Vehicle' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    // Warn if a doc date is within 30 days or past
    const docWarning = (dateStr) => {
        if (!dateStr) return null;
        const days = Math.floor((new Date(dateStr) - new Date()) / 86400000);
        if (days < 0) return <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>⚠ Expired {Math.abs(days)} days ago</Text>;
        if (days <= 30) return <Text size="xs" style={{ color: '#F59E0B', marginTop: 3 }}>⚠ Expires in {days} days</Text>;
        return null;
    };

    return (
        <form onSubmit={onSubmit}>
            <Section title="Vehicle Identity" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="Plate Number" placeholder="TZA-221-A" required value={data.plate} onChange={e => setData('plate', e.target.value.toUpperCase())} error={errors.plate} styles={inputStyles} />
                    <Select label="Status" required value={data.status} onChange={v => setData('status', v)} data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))} error={errors.status} styles={{ ...inputStyles, dropdown: dropdownStyle }} />
                    <TextInput label="Make (Brand)" placeholder="Mercedes-Benz" required value={data.make} onChange={e => setData('make', e.target.value)} error={errors.make} styles={inputStyles} />
                    <TextInput label="Model" placeholder="Actros 2645" required value={data.model_name} onChange={e => setData('model_name', e.target.value)} error={errors.model_name} styles={inputStyles} />
                    <Select label="Vehicle Type" required value={data.type} onChange={v => setData('type', v)} data={types.map(t => ({ value: t, label: t }))} error={errors.type} styles={{ ...inputStyles, dropdown: dropdownStyle }} />
                    <NumberInput label="Year" required min={1990} max={new Date().getFullYear() + 1} value={data.year} onChange={v => setData('year', v)} error={errors.year} styles={{ label: inputStyles.label, input: inputStyles.input }} />
                    <TextInput label="Color" placeholder="White" value={data.color ?? ''} onChange={e => setData('color', e.target.value)} error={errors.color} styles={inputStyles} />
                    <NumberInput label="Payload Capacity (tons)" placeholder="28" min={0} step={0.5} value={data.payload_tons ?? ''} onChange={v => setData('payload_tons', v)} error={errors.payload_tons} styles={{ label: inputStyles.label, input: inputStyles.input, section: { color: textSec } }} />
                    <NumberInput label="Current Mileage (km)" placeholder="150000" min={0} required value={data.mileage_km} onChange={v => setData('mileage_km', v)} error={errors.mileage_km} styles={{ label: inputStyles.label, input: inputStyles.input, section: { color: textSec } }} thousandSeparator="," />
                    <TextInput label="Owner Name" placeholder="SH Malik Logistics" value={data.owner_name ?? ''} onChange={e => setData('owner_name', e.target.value)} error={errors.owner_name} styles={inputStyles} />
                </SimpleGrid>
            </Section>

            <Section title="Documents & Expiry Dates" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Stack gap={2}>
                        <TextInput label="Insurance Expiry" type="date" value={data.insurance_expiry ?? ''} onChange={e => setData('insurance_expiry', e.target.value)} error={errors.insurance_expiry} styles={inputStyles} />
                        {docWarning(data.insurance_expiry)}
                    </Stack>
                    <Stack gap={2}>
                        <TextInput label="Road Licence Expiry" type="date" value={data.road_licence_expiry ?? ''} onChange={e => setData('road_licence_expiry', e.target.value)} error={errors.road_licence_expiry} styles={inputStyles} />
                        {docWarning(data.road_licence_expiry)}
                    </Stack>
                    <Stack gap={2}>
                        <TextInput label="Fitness Certificate Expiry" type="date" value={data.fitness_expiry ?? ''} onChange={e => setData('fitness_expiry', e.target.value)} error={errors.fitness_expiry} styles={inputStyles} />
                        {docWarning(data.fitness_expiry)}
                    </Stack>
                    <Stack gap={2}>
                        <TextInput label="Next Service Date" type="date" value={data.next_service_date ?? ''} onChange={e => setData('next_service_date', e.target.value)} error={errors.next_service_date} styles={inputStyles} />
                        {docWarning(data.next_service_date)}
                    </Stack>
                </SimpleGrid>
            </Section>

            <Section title="Notes" isDark={isDark}>
                <Textarea placeholder="Additional notes…" minRows={3} value={data.notes ?? ''} onChange={e => setData('notes', e.target.value)} error={errors.notes} styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }} />
            </Section>

            <Group justify="flex-end" gap="md">
                <Box component={Link} href={backHref} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Cancel</Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

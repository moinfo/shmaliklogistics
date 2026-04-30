import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const dk = {
    card:    '#0F1E32',
    border:  'rgba(33,150,243,0.12)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: '#94A3B8',
    textMut: '#475569',
};

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
            <Box style={{ padding: '20px' }}>
                {children}
            </Box>
        </Box>
    );
}

export default function TripForm({ data, setData, errors, statuses, processing, onSubmit, backHref, submitLabel = 'Save Trip' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const numStyles = {
        ...inputStyles,
        section: { color: textSec },
    };

    const totalCosts = (Number(data.fuel_cost) || 0)
        + (Number(data.driver_allowance) || 0)
        + (Number(data.border_costs) || 0)
        + (Number(data.other_costs) || 0);
    const profit = (Number(data.freight_amount) || 0) - totalCosts;

    return (
        <form onSubmit={onSubmit}>
            <Section title="Trip Details" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Status"
                        required
                        value={data.status}
                        onChange={v => setData('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                    />
                    <TextInput label="Departure Date" type="date" required value={data.departure_date} onChange={e => setData('departure_date', e.target.value)} error={errors.departure_date} styles={inputStyles} />
                    <TextInput label="Route From" placeholder="Dar es Salaam" required value={data.route_from} onChange={e => setData('route_from', e.target.value)} error={errors.route_from} styles={inputStyles} />
                    <TextInput label="Route To" placeholder="Lubumbashi" required value={data.route_to} onChange={e => setData('route_to', e.target.value)} error={errors.route_to} styles={inputStyles} />
                    <TextInput label="Expected Arrival" type="date" value={data.arrival_date ?? ''} onChange={e => setData('arrival_date', e.target.value)} error={errors.arrival_date} styles={inputStyles} />
                </SimpleGrid>
            </Section>

            <Section title="Driver & Vehicle" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="Driver Name" placeholder="Juma Mwangi" required value={data.driver_name} onChange={e => setData('driver_name', e.target.value)} error={errors.driver_name} styles={inputStyles} />
                    <TextInput label="Vehicle Plate" placeholder="TZA-221-A" required value={data.vehicle_plate} onChange={e => setData('vehicle_plate', e.target.value.toUpperCase())} error={errors.vehicle_plate} styles={inputStyles} />
                    <TextInput label="Cargo Description" placeholder="Industrial Equipment, FMCG…" value={data.cargo_description ?? ''} onChange={e => setData('cargo_description', e.target.value)} error={errors.cargo_description} styles={inputStyles} />
                    <NumberInput label="Cargo Weight (tons)" placeholder="28" min={0} step={0.5} value={data.cargo_weight_tons ?? ''} onChange={v => setData('cargo_weight_tons', v)} error={errors.cargo_weight_tons} styles={numStyles} />
                </SimpleGrid>
            </Section>

            <Section title="Financials (TZS)" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <NumberInput label="Freight Amount (Income)" placeholder="45000000" min={0} required value={data.freight_amount} onChange={v => setData('freight_amount', v)} error={errors.freight_amount} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Fuel Cost" placeholder="8000000" min={0} required value={data.fuel_cost} onChange={v => setData('fuel_cost', v)} error={errors.fuel_cost} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Driver Allowance" placeholder="1500000" min={0} required value={data.driver_allowance} onChange={v => setData('driver_allowance', v)} error={errors.driver_allowance} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Border Costs" placeholder="2000000" min={0} required value={data.border_costs} onChange={v => setData('border_costs', v)} error={errors.border_costs} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Other Costs" placeholder="500000" min={0} required value={data.other_costs} onChange={v => setData('other_costs', v)} error={errors.other_costs} styles={numStyles} thousandSeparator="," />
                </SimpleGrid>

                {/* Live P&L summary */}
                <Box style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F0F4F9', borderRadius: 10, padding: '14px 18px', border: `1px solid ${cardBorder}` }}>
                    <Group justify="space-between">
                        <Text size="sm" style={{ color: textSec }}>Total Costs</Text>
                        <Text size="sm" fw={600} style={{ color: '#EF4444' }}>TZS {new Intl.NumberFormat('en-TZ').format(totalCosts)}</Text>
                    </Group>
                    <Group justify="space-between" mt={6}>
                        <Text size="sm" fw={700} style={{ color: textPri }}>Net Profit</Text>
                        <Text size="sm" fw={800} style={{ color: profit >= 0 ? '#22C55E' : '#EF4444' }}>
                            TZS {new Intl.NumberFormat('en-TZ').format(Math.abs(profit))} {profit < 0 ? '(Loss)' : ''}
                        </Text>
                    </Group>
                </Box>
            </Section>

            <Section title="Notes" isDark={isDark}>
                <Textarea
                    placeholder="Additional notes, instructions, or remarks…"
                    minRows={3}
                    value={data.notes ?? ''}
                    onChange={e => setData('notes', e.target.value)}
                    error={errors.notes}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                />
            </Section>

            {/* Actions */}
            <Group justify="flex-end" gap="md">
                <Box
                    component={Link}
                    href={backHref}
                    style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                >
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component="button"
                        type="submit"
                        disabled={processing}
                        style={{
                            padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                            background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                            color: '#fff', fontWeight: 700, fontSize: 14,
                            boxShadow: '0 4px 16px rgba(33,150,243,0.35)',
                            opacity: processing ? 0.7 : 1,
                        }}
                    >
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

import { Link } from '@inertiajs/react';
import { Box, Text, Group, SimpleGrid, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../../components/DatePicker';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

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

export default function PropertyForm({ data, setData, errors, types, statuses, ownerships, currencies = [], processing, onSubmit, backHref, submitLabel = 'Save Property' }) {
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
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };
    const numStyles = { ...inputStyles, section: { color: textSec } };

    return (
        <form onSubmit={onSubmit}>
            <Section title="Property Details" icon="🏠" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Name"
                        placeholder="e.g. Mikocheni Apartments"
                        required
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        error={errors.name}
                        styles={inputStyles}
                    />
                    <Select
                        label="Type"
                        required
                        value={data.type}
                        onChange={v => setData('type', v)}
                        data={Object.entries(types).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.type}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Status"
                        required
                        value={data.status}
                        onChange={v => setData('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Ownership"
                        required
                        value={data.ownership}
                        onChange={v => setData('ownership', v)}
                        data={Object.entries(ownerships).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.ownership}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
            </Section>

            <Section title="Location" icon="📍" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Box style={{ gridColumn: '1 / -1' }}>
                        <TextInput
                            label="Address"
                            placeholder="Street, plot, area…"
                            value={data.address ?? ''}
                            onChange={e => setData('address', e.target.value)}
                            error={errors.address}
                            styles={inputStyles}
                        />
                    </Box>
                    <TextInput
                        label="Region"
                        placeholder="e.g. Dar es Salaam"
                        value={data.region ?? ''}
                        onChange={e => setData('region', e.target.value)}
                        error={errors.region}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="District"
                        placeholder="e.g. Kinondoni"
                        value={data.district ?? ''}
                        onChange={e => setData('district', e.target.value)}
                        error={errors.district}
                        styles={inputStyles}
                    />
                </SimpleGrid>
            </Section>

            <Section title="Acquisition & Financials" icon="💰" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <DatePicker
                        label="Acquisition Date"
                        value={data.acquisition_date ?? ''}
                        onChange={v => setData('acquisition_date', v)}
                        error={errors.acquisition_date}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Title Deed Number"
                        placeholder="Optional"
                        value={data.title_deed_number ?? ''}
                        onChange={e => setData('title_deed_number', e.target.value)}
                        error={errors.title_deed_number}
                        styles={inputStyles}
                    />
                    <NumberInput
                        label="Purchase Price"
                        placeholder="0.00"
                        min={0}
                        value={data.purchase_price ?? ''}
                        onChange={v => setData('purchase_price', v)}
                        error={errors.purchase_price}
                        styles={numStyles}
                        thousandSeparator=","
                    />
                    <Select
                        label="Purchase Currency"
                        value={data.purchase_currency}
                        onChange={v => setData('purchase_currency', v)}
                        data={currencies.map(c => ({ value: c, label: c }))}
                        error={errors.purchase_currency}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <NumberInput
                        label="Market Value"
                        placeholder="0.00"
                        min={0}
                        value={data.market_value ?? ''}
                        onChange={v => setData('market_value', v)}
                        error={errors.market_value}
                        styles={numStyles}
                        thousandSeparator=","
                    />
                </SimpleGrid>
            </Section>

            <Section title="Description & Notes" icon="📝" isDark={isDark}>
                <Textarea
                    label="Description"
                    placeholder="Describe the property…"
                    minRows={3}
                    value={data.description ?? ''}
                    onChange={e => setData('description', e.target.value)}
                    error={errors.description}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                    mb="md"
                />
                <Textarea
                    label="Notes"
                    placeholder="Internal notes, remarks…"
                    minRows={3}
                    value={data.notes ?? ''}
                    onChange={e => setData('notes', e.target.value)}
                    error={errors.notes}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                />
            </Section>

            <Group justify="flex-end" gap="md">
                <Box component={Link} href={backHref} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}
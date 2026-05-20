import { Box, Text, Group, SimpleGrid, TextInput, Textarea, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

const CURRENCIES = ['USD', 'TZS', 'EUR', 'GBP', 'KES', 'ZMW', 'MWK', 'ZAR'];
const PACKING    = ['Pallets', 'Loose', 'Crates', 'Drums', 'Bags', 'Containers', 'Boxes', 'Bales'];

function SectionCard({ title, icon, children, isDark }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
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
}

export default function CargoForm({ data, setData, errors, trips, clients, statuses, types, isDark: isDarkProp }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = isDarkProp ?? colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    const typeOptions     = Object.entries(types).map(([v, d]) => ({ value: v, label: d.label }));
    const statusOptions   = Object.entries(statuses).map(([v, d]) => ({ value: v, label: d.label }));
    const currencyOptions = CURRENCIES.map(c => ({ value: c, label: c }));
    const packingOptions  = PACKING.map(p => ({ value: p.toLowerCase(), label: p }));
    const tripOptions     = trips.map(t => ({ value: String(t.id), label: `${t.trip_number} — ${t.route_from} → ${t.route_to}` }));
    const clientOptions   = clients.map(c => ({ value: String(c.id), label: c.company_name || c.name }));

    return (
        <>
            <SectionCard title="Cargo Identity" icon="📦" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Cargo Number *" placeholder="CGO-2026-0001"
                        value={data.cargo_number ?? ''} onChange={e => setData('cargo_number', e.target.value)}
                        error={errors.cargo_number} styles={inputStyles}
                    />
                    <Select
                        label="Status *" placeholder="Select status…"
                        value={data.status ?? ''} onChange={v => setData('status', v ?? '')}
                        data={statusOptions} error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Cargo Type *" placeholder="Select type…"
                        value={data.type ?? ''} onChange={v => setData('type', v ?? '')}
                        data={typeOptions} error={errors.type}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Packing Type" placeholder="e.g. Pallets"
                        value={data.packing_type ?? ''} onChange={v => setData('packing_type', v ?? '')}
                        data={packingOptions} error={errors.packing_type}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
                <Box mt="md">
                    <Textarea
                        label="Description *" placeholder="e.g. Industrial machinery, spare parts, FMCG goods..." minRows={2}
                        value={data.description ?? ''} onChange={e => setData('description', e.target.value)}
                        error={errors.description}
                        styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                    />
                </Box>
            </SectionCard>

            <SectionCard title="Weight & Dimensions" icon="⚖️" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    <TextInput
                        label="Weight (kg) *" placeholder="e.g. 5000" type="number"
                        value={data.weight_kg ?? ''} onChange={e => setData('weight_kg', e.target.value)}
                        error={errors.weight_kg} styles={inputStyles}
                    />
                    <TextInput
                        label="Volume (m³)" placeholder="e.g. 24.5" type="number"
                        value={data.volume_m3 ?? ''} onChange={e => setData('volume_m3', e.target.value)}
                        error={errors.volume_m3} styles={inputStyles}
                    />
                    <TextInput
                        label="Pieces *" placeholder="e.g. 1" type="number"
                        value={data.pieces ?? ''} onChange={e => setData('pieces', e.target.value)}
                        error={errors.pieces} styles={inputStyles}
                    />
                </SimpleGrid>
            </SectionCard>

            <SectionCard title="Route & Consignee" icon="📍" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Origin" placeholder="e.g. Dar es Salaam, Tanzania"
                        value={data.origin ?? ''} onChange={e => setData('origin', e.target.value)}
                        error={errors.origin} styles={inputStyles}
                    />
                    <TextInput
                        label="Destination" placeholder="e.g. Lubumbashi, DRC"
                        value={data.destination ?? ''} onChange={e => setData('destination', e.target.value)}
                        error={errors.destination} styles={inputStyles}
                    />
                    <TextInput
                        label="Consignee Name" placeholder="Receiving company or person"
                        value={data.consignee_name ?? ''} onChange={e => setData('consignee_name', e.target.value)}
                        error={errors.consignee_name} styles={inputStyles}
                    />
                    <TextInput
                        label="Consignee Contact" placeholder="Phone or email"
                        value={data.consignee_contact ?? ''} onChange={e => setData('consignee_contact', e.target.value)}
                        error={errors.consignee_contact} styles={inputStyles}
                    />
                </SimpleGrid>
            </SectionCard>

            <SectionCard title="Value & Links" icon="🔗" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Declared Value" placeholder="e.g. 50000" type="number"
                        value={data.declared_value ?? ''} onChange={e => setData('declared_value', e.target.value)}
                        error={errors.declared_value} styles={inputStyles}
                    />
                    <Select
                        label="Currency" placeholder="Currency…"
                        value={data.currency ?? ''} onChange={v => setData('currency', v ?? '')}
                        data={currencyOptions} error={errors.currency}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Linked Trip (optional)" placeholder="None"
                        value={data.trip_id ? String(data.trip_id) : ''} onChange={v => setData('trip_id', v ?? '')}
                        data={tripOptions} error={errors.trip_id} searchable clearable
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Client (optional)" placeholder="None"
                        value={data.client_id ? String(data.client_id) : ''} onChange={v => setData('client_id', v ?? '')}
                        data={clientOptions} error={errors.client_id} searchable clearable
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
            </SectionCard>

            <SectionCard title="Notes" icon="📝" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Textarea
                        label="Special Instructions"
                        placeholder="e.g. Handle with care, keep refrigerated, do not stack..."
                        minRows={3}
                        value={data.special_instructions ?? ''} onChange={e => setData('special_instructions', e.target.value)}
                        styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                    />
                    <Textarea
                        label="Internal Notes"
                        placeholder="Internal notes..."
                        minRows={3}
                        value={data.notes ?? ''} onChange={e => setData('notes', e.target.value)}
                        styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                    />
                </SimpleGrid>
            </SectionCard>
        </>
    );
}

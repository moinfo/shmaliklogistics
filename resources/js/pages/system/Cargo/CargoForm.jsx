import { Box, Text, Group, SimpleGrid, Select, Textarea } from '@mantine/core';

const CURRENCIES = ['USD', 'TZS', 'EUR', 'GBP', 'KES', 'ZMW', 'MWK', 'ZAR'];
const PACKING    = ['Pallets', 'Loose', 'Crates', 'Drums', 'Bags', 'Containers', 'Boxes', 'Bales'];

export default function CargoForm({ data, setData, errors, trips, clients, statuses, types, isDark }) {
    const textPri    = isDark ? '#E2E8F0' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const cardBorder = isDark ? 'rgba(33,150,243,0.18)' : '#E2E8F0';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inp = (label, key, placeholder = '', type = 'text', span = 1) => (
        <Box style={{ gridColumn: `span ${span}` }}>
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box component="input" type={type} value={data[key] ?? ''} onChange={e => setData(key, e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    const sel = (label, key, options, placeholder = 'Select…', span = 1) => (
        <Box style={{ gridColumn: `span ${span}` }}>
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box component="select" value={data[key] ?? ''} onChange={e => setData(key, e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: isDark ? '#0F1E32' : '#fff', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Box>
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    const typeOptions     = Object.entries(types).map(([v, d]) => ({ value: v, label: d.label }));
    const statusOptions   = Object.entries(statuses).map(([v, d]) => ({ value: v, label: d.label }));
    const currencyOptions = CURRENCIES.map(c => ({ value: c, label: c }));
    const packingOptions  = PACKING.map(p => ({ value: p.toLowerCase(), label: p }));
    const tripOptions     = trips.map(t => ({ value: String(t.id), label: `${t.trip_number} — ${t.route_from} → ${t.route_to}` }));
    const clientOptions   = clients.map(c => ({ value: String(c.id), label: c.company_name || c.name }));

    const section = (title, cols, content) => (
        <Box style={{ background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 16 }}>{title}</Text>
            <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>
                {content}
            </Box>
        </Box>
    );

    return (
        <>
            {section('Cargo Identity', 2, <>
                {inp('Cargo Number *', 'cargo_number', 'CGO-2026-0001')}
                {sel('Status *', 'status', statusOptions, 'Select status…')}
                {sel('Cargo Type *', 'type', typeOptions, 'Select type…')}
                {sel('Packing Type', 'packing_type', packingOptions, 'e.g. Pallets')}
                <Box style={{ gridColumn: 'span 2' }}>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Description *</Text>
                    <Box component="textarea" value={data.description ?? ''} onChange={e => setData('description', e.target.value)} rows={2}
                        placeholder="e.g. Industrial machinery, spare parts, FMCG goods..."
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errors.description ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                    {errors.description && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors.description}</Text>}
                </Box>
            </>)}

            {section('Weight & Dimensions', 3, <>
                {inp('Weight (kg) *', 'weight_kg', 'e.g. 5000', 'number')}
                {inp('Volume (m³)', 'volume_m3', 'e.g. 24.5', 'number')}
                {inp('Pieces *', 'pieces', 'e.g. 1', 'number')}
            </>)}

            {section('Route & Consignee', 2, <>
                {inp('Origin', 'origin', 'e.g. Dar es Salaam, Tanzania')}
                {inp('Destination', 'destination', 'e.g. Lubumbashi, DRC')}
                {inp('Consignee Name', 'consignee_name', 'Receiving company or person')}
                {inp('Consignee Contact', 'consignee_contact', 'Phone or email')}
            </>)}

            {section('Value & Links', 2, <>
                {inp('Declared Value', 'declared_value', 'e.g. 50000', 'number')}
                {sel('Currency', 'currency', currencyOptions, 'Currency…')}
                {sel('Linked Trip (optional)', 'trip_id', tripOptions, 'None')}
                {sel('Client (optional)', 'client_id', clientOptions, 'None')}
            </>)}

            <Box style={{ background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24 }}>
                <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 14 }}>Notes</Text>
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Box>
                        <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Special Instructions</Text>
                        <Box component="textarea" value={data.special_instructions ?? ''} onChange={e => setData('special_instructions', e.target.value)} rows={3}
                            placeholder="e.g. Handle with care, keep refrigerated, do not stack..."
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                    </Box>
                    <Box>
                        <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Internal Notes</Text>
                        <Box component="textarea" value={data.notes ?? ''} onChange={e => setData('notes', e.target.value)} rows={3}
                            placeholder="Internal notes..."
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
                    </Box>
                </Box>
            </Box>
        </>
    );
}

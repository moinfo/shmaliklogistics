import { useForm, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

const blankRow = (vehicleId = '') => ({
    vehicle_id: vehicleId, service_type: '', service_date: '', mileage_km: '',
    workshop_name: '', description: '', cost: '', currency: 'TZS',
    next_service_date: '', next_service_mileage: '',
});

export default function MaintenanceBulkForm({ vehicles, types, prefillVehicleId }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const { data, setData, post, processing, errors } = useForm({
        records: [blankRow(prefillVehicleId ? String(prefillVehicleId) : '')],
    });

    const setRow = (i, field, value) => setData('records', data.records.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    const addRow = () => setData('records', [...data.records, blankRow()]);
    const removeRow = (i) => setData('records', data.records.length > 1 ? data.records.filter((_, idx) => idx !== i) : data.records);
    const err = (i, f) => errors[`records.${i}.${f}`];

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };

    const submit = (e) => { e.preventDefault(); post('/system/maintenance'); };

    const vehicleData = vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }));
    const typeData    = types.map(t => ({ value: t, label: t }));
    const currData    = ['TZS', 'USD', 'EUR', 'KES'].map(c => ({ value: c, label: c }));

    return (
        <Box component="form" onSubmit={submit}>
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Add Service Records</Text>
                    <Text size="sm" style={{ color: textSec }}>Log one or many maintenance entries at once</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/maintenance" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                        Cancel
                    </Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            {processing ? 'Saving…' : `Save ${data.records.length} record${data.records.length !== 1 ? 's' : ''}`}
                        </Box>
                    </motion.div>
                </Group>
            </Group>

            <Stack gap="md">
                {data.records.map((row, i) => (
                    <Box key={i} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                        <Group justify="space-between" mb={16}>
                            <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1 }}>Service #{i + 1}</Text>
                            {data.records.length > 1 && (
                                <Box component="button" type="button" onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                    Remove
                                </Box>
                            )}
                        </Group>

                        <Group grow gap="md" mb="md">
                            <Select label="Vehicle *" placeholder="Select vehicle" data={vehicleData} value={row.vehicle_id ? String(row.vehicle_id) : ''} onChange={v => setRow(i, 'vehicle_id', v ?? '')} error={err(i, 'vehicle_id')} required searchable styles={inputStyles} />
                            <Select label="Service Type *" placeholder="Select type" data={typeData} value={row.service_type} onChange={v => setRow(i, 'service_type', v ?? '')} error={err(i, 'service_type')} required searchable styles={inputStyles} />
                        </Group>

                        <Group grow gap="md" mb="md">
                            <DatePicker label="Service Date *" value={row.service_date} onChange={v => setRow(i, 'service_date', v)} error={err(i, 'service_date')} required styles={inputStyles} />
                            <NumberInput label="Mileage (km)" placeholder="e.g. 85000" value={row.mileage_km} onChange={v => setRow(i, 'mileage_km', v)} error={err(i, 'mileage_km')} min={0} hideControls styles={inputStyles} />
                        </Group>

                        <TextInput label="Workshop Name" placeholder="e.g. Dar Auto Centre" value={row.workshop_name} onChange={e => setRow(i, 'workshop_name', e.target.value)} error={err(i, 'workshop_name')} styles={inputStyles} mb="md" />

                        <Textarea label="Work Description" placeholder="Describe what was done…" value={row.description} onChange={e => setRow(i, 'description', e.target.value)} error={err(i, 'description')} styles={inputStyles} rows={2} mb="md" />

                        <Group grow gap="md" mb="md">
                            <NumberInput label="Cost" placeholder="0.00" value={row.cost} onChange={v => setRow(i, 'cost', v)} error={err(i, 'cost')} min={0} decimalScale={2} hideControls styles={inputStyles} />
                            <Select label="Currency" data={currData} value={row.currency} onChange={v => setRow(i, 'currency', v ?? 'TZS')} styles={inputStyles} />
                        </Group>

                        <Group grow gap="md">
                            <DatePicker label="Next Service Date" value={row.next_service_date} onChange={v => setRow(i, 'next_service_date', v)} error={err(i, 'next_service_date')} styles={inputStyles} />
                            <NumberInput label="Next Service Mileage (km)" placeholder="e.g. 95000" value={row.next_service_mileage} onChange={v => setRow(i, 'next_service_mileage', v)} error={err(i, 'next_service_mileage')} min={0} hideControls styles={inputStyles} />
                        </Group>
                    </Box>
                ))}
            </Stack>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} style={{ marginTop: 16 }}>
                <Box component="button" type="button" onClick={addRow} style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'transparent', color: '#2196F3', border: `1px dashed ${cardBorder}`, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    + Add another service
                </Box>
            </motion.div>
        </Box>
    );
}

import { useForm, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function MaintenanceForm({ record, vehicles, types, submitUrl, method, submitLabel, prefillVehicleId }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const { data, setData, post, put, processing, errors } = useForm({
        vehicle_id:            record?.vehicle_id            ?? prefillVehicleId ?? '',
        service_type:          record?.service_type          ?? '',
        service_date:          record?.service_date          ?? '',
        mileage_km:            record?.mileage_km            ?? '',
        workshop_name:         record?.workshop_name         ?? '',
        description:           record?.description           ?? '',
        cost:                  record?.cost                  ?? '',
        currency:              record?.currency              ?? 'TZS',
        next_service_date:     record?.next_service_date     ?? '',
        next_service_mileage:  record?.next_service_mileage  ?? '',
        notes:                 record?.notes                 ?? '',
    });

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };

    const submit = (e) => {
        e.preventDefault();
        method === 'put' ? put(submitUrl) : post(submitUrl);
    };

    const vehicleData = vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }));
    const typeData    = types.map(t => ({ value: t, label: t }));
    const currData    = ['TZS', 'USD', 'EUR', 'KES'].map(c => ({ value: c, label: c }));

    return (
        <Box component="form" onSubmit={submit}>
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>{record ? 'Edit Service Record' : 'Add Service Record'}</Text>
                    <Text size="sm" style={{ color: textSec }}>Log vehicle maintenance</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/maintenance" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                        Cancel
                    </Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            {processing ? 'Saving…' : submitLabel}
                        </Box>
                    </motion.div>
                </Group>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px' }}>
                <Text fw={700} size="sm" style={{ color: textSec, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Service Details</Text>

                <Group grow gap="md" mb="md">
                    <Select label="Vehicle *" placeholder="Select vehicle" data={vehicleData} value={data.vehicle_id ? String(data.vehicle_id) : ''} onChange={v => setData('vehicle_id', v ?? '')} error={errors.vehicle_id} required searchable styles={inputStyles} />
                    <Select label="Service Type *" placeholder="Select type" data={typeData} value={data.service_type} onChange={v => setData('service_type', v ?? '')} error={errors.service_type} required searchable styles={inputStyles} />
                </Group>

                <Group grow gap="md" mb="md">
                    <DatePicker label="Service Date *" value={data.service_date} onChange={v => setData('service_date', v)} error={errors.service_date} required styles={inputStyles} />
                    <NumberInput label="Mileage (km)" placeholder="e.g. 85000" value={data.mileage_km} onChange={v => setData('mileage_km', v)} error={errors.mileage_km} min={0} hideControls styles={inputStyles} />
                </Group>

                <TextInput label="Workshop Name" placeholder="e.g. Dar Auto Centre" value={data.workshop_name} onChange={e => setData('workshop_name', e.target.value)} error={errors.workshop_name} styles={inputStyles} mb="md" />

                <Textarea label="Work Description" placeholder="Describe what was done…" value={data.description} onChange={e => setData('description', e.target.value)} error={errors.description} styles={inputStyles} rows={3} mb="md" />

                <Group grow gap="md" mb="md">
                    <NumberInput label="Cost" placeholder="0.00" value={data.cost} onChange={v => setData('cost', v)} error={errors.cost} min={0} decimalScale={2} hideControls styles={inputStyles} />
                    <Select label="Currency" data={currData} value={data.currency} onChange={v => setData('currency', v ?? 'TZS')} styles={inputStyles} />
                </Group>

                <Text fw={700} size="sm" style={{ color: textSec, margin: '20px 0 14px', textTransform: 'uppercase', letterSpacing: 1 }}>Next Service</Text>

                <Group grow gap="md" mb="md">
                    <DatePicker label="Next Service Date" value={data.next_service_date} onChange={v => setData('next_service_date', v)} error={errors.next_service_date} styles={inputStyles} />
                    <NumberInput label="Next Service Mileage (km)" placeholder="e.g. 95000" value={data.next_service_mileage} onChange={v => setData('next_service_mileage', v)} error={errors.next_service_mileage} min={0} hideControls styles={inputStyles} />
                </Group>

                <Textarea label="Notes" placeholder="Additional notes…" value={data.notes} onChange={e => setData('notes', e.target.value)} error={errors.notes} styles={inputStyles} rows={2} />
            </Box>
        </Box>
    );
}

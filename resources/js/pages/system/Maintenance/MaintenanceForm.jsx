import { useForm, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, NumberInput, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

export default function MaintenanceForm({ record, vehicles, types, submitUrl, method, submitLabel, prefillVehicleId }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

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
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const submit = (e) => {
        e.preventDefault();
        method === 'put' ? put(submitUrl) : post(submitUrl);
    };

    const vehicleData = vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }));
    const typeData    = types.map(t => ({ value: t, label: t }));
    const currData    = ['TZS', 'USD', 'EUR', 'KES'].map(c => ({ value: c, label: c }));

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
        <Box component="form" onSubmit={submit}>
            <FormCard icon="🔧" title="Service Details">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <Select
                        label="Vehicle *"
                        placeholder="Select vehicle"
                        data={vehicleData}
                        value={data.vehicle_id ? String(data.vehicle_id) : ''}
                        onChange={v => setData('vehicle_id', v ?? '')}
                        error={errors.vehicle_id}
                        required
                        searchable
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Service Type *"
                        placeholder="Select type"
                        data={typeData}
                        value={data.service_type}
                        onChange={v => setData('service_type', v ?? '')}
                        error={errors.service_type}
                        required
                        searchable
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <DatePicker
                        label="Service Date *"
                        value={data.service_date}
                        onChange={v => setData('service_date', v)}
                        error={errors.service_date}
                        required
                        styles={inputStyles}
                    />
                    <NumberInput
                        label="Mileage (km)"
                        placeholder="e.g. 85000"
                        value={data.mileage_km}
                        onChange={v => setData('mileage_km', v)}
                        error={errors.mileage_km}
                        min={0}
                        hideControls
                        styles={inputStyles}
                        thousandSeparator=","
                    />
                </SimpleGrid>

                <TextInput
                    label="Workshop Name"
                    placeholder="e.g. Dar Auto Centre"
                    value={data.workshop_name}
                    onChange={e => setData('workshop_name', e.target.value)}
                    error={errors.workshop_name}
                    styles={inputStyles}
                    mb="md"
                />

                <Textarea
                    label="Work Description"
                    placeholder="Describe what was done…"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    error={errors.description}
                    styles={inputStyles}
                    rows={3}
                    mb="md"
                />

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NumberInput
                        label="Cost"
                        placeholder="0.00"
                        value={data.cost}
                        onChange={v => setData('cost', v)}
                        error={errors.cost}
                        min={0}
                        decimalScale={2}
                        hideControls
                        styles={inputStyles}
                        thousandSeparator=","
                    />
                    <Select
                        label="Currency"
                        data={currData}
                        value={data.currency}
                        onChange={v => setData('currency', v ?? 'TZS')}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
            </FormCard>

            <FormCard icon="📅" title="Next Service">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <DatePicker
                        label="Next Service Date"
                        value={data.next_service_date}
                        onChange={v => setData('next_service_date', v)}
                        error={errors.next_service_date}
                        styles={inputStyles}
                    />
                    <NumberInput
                        label="Next Service Mileage (km)"
                        placeholder="e.g. 95000"
                        value={data.next_service_mileage}
                        onChange={v => setData('next_service_mileage', v)}
                        error={errors.next_service_mileage}
                        min={0}
                        hideControls
                        styles={inputStyles}
                        thousandSeparator=","
                    />
                </SimpleGrid>
            </FormCard>

            <FormCard icon="📝" title="Notes">
                <Textarea
                    placeholder="Additional notes…"
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    error={errors.notes}
                    styles={inputStyles}
                    rows={3}
                />
            </FormCard>

            <Group justify="flex-end" gap="sm" mt="md">
                <Box
                    component={Link}
                    href="/system/maintenance"
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
        </Box>
    );
}

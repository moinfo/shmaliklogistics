import { useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, NumberInput, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

export default function ExpenseForm({ expense, categories, currencies, trips, vehicles, submitUrl, method, submitLabel, prefillTrip }) {
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
        trip_id:        expense?.trip_id        ?? prefillTrip ?? '',
        vehicle_plate:  expense?.vehicle_plate  ?? '',
        category:       expense?.category       ?? '',
        description:    expense?.description    ?? '',
        amount:         expense?.amount         ?? '',
        currency:       expense?.currency       ?? 'TZS',
        expense_date:   expense?.expense_date   ?? '',
        receipt_number: expense?.receipt_number ?? '',
        notes:          expense?.notes          ?? '',
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

    const tripData = [{ value: '', label: 'No trip' }, ...trips.map(t => ({ value: String(t.id), label: `${t.trip_number} — ${t.route_from} → ${t.route_to}` }))];
    const vehicleData = [{ value: '', label: 'No vehicle' }, ...vehicles.map(v => ({ value: v.plate, label: `${v.plate} — ${v.make} ${v.model_name}` }))];
    const catData = Object.entries(categories).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }));
    const currData = currencies.map(c => ({ value: c, label: c }));

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
            <FormCard icon="💸" title="Expense Details">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <Select
                        label="Category *"
                        placeholder="Select category"
                        data={catData}
                        value={data.category}
                        onChange={v => setData('category', v ?? '')}
                        error={errors.category}
                        required
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <DatePicker
                        label="Date *"
                        value={data.expense_date}
                        onChange={v => setData('expense_date', v)}
                        error={errors.expense_date}
                        required
                        styles={inputStyles}
                    />
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <NumberInput
                        label="Amount *"
                        placeholder="0.00"
                        value={data.amount}
                        onChange={v => setData('amount', v)}
                        error={errors.amount}
                        required
                        min={0.01}
                        decimalScale={2}
                        hideControls
                        thousandSeparator=","
                        styles={inputStyles}
                    />
                    <Select
                        label="Currency"
                        data={currData}
                        value={data.currency}
                        onChange={v => setData('currency', v ?? 'TZS')}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>

                <TextInput
                    label="Description"
                    placeholder="Brief description"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    error={errors.description}
                    styles={inputStyles}
                    mb="md"
                />

                <TextInput
                    label="Receipt / Reference No."
                    placeholder="e.g. REC-0001"
                    value={data.receipt_number}
                    onChange={e => setData('receipt_number', e.target.value)}
                    error={errors.receipt_number}
                    styles={inputStyles}
                />
            </FormCard>

            <FormCard icon="🔗" title="Linked To">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Linked Trip"
                        placeholder="No trip"
                        data={tripData}
                        value={data.trip_id ? String(data.trip_id) : ''}
                        onChange={v => setData('trip_id', v ?? '')}
                        searchable
                        clearable
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <Select
                        label="Vehicle Plate"
                        placeholder="No vehicle"
                        data={vehicleData}
                        value={data.vehicle_plate}
                        onChange={v => setData('vehicle_plate', v ?? '')}
                        searchable
                        clearable
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
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
                    href="/system/expenses"
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

import { useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function ExpenseForm({ expense, categories, currencies, trips, vehicles, submitUrl, method, submitLabel, prefillTrip }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

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
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };

    const submit = (e) => {
        e.preventDefault();
        method === 'put' ? put(submitUrl) : post(submitUrl);
    };

    const tripData = [{ value: '', label: 'No trip' }, ...trips.map(t => ({ value: String(t.id), label: `${t.trip_number} — ${t.route_from} → ${t.route_to}` }))];
    const vehicleData = [{ value: '', label: 'No vehicle' }, ...vehicles.map(v => ({ value: v.plate, label: `${v.plate} — ${v.make} ${v.model_name}` }))];
    const catData = Object.entries(categories).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }));
    const currData = currencies.map(c => ({ value: c, label: c }));

    return (
        <Box component="form" onSubmit={submit}>
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>{expense ? 'Edit Expense' : 'Record Expense'}</Text>
                    <Text size="sm" style={{ color: textSec }}>Track an operational cost</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/expenses" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                        Cancel
                    </Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            {processing ? 'Saving…' : submitLabel}
                        </Box>
                    </motion.div>
                </Group>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px 28px' }}>
                <SimpleGrid>
                    <Group grow gap="md">
                        <Select label="Category *" placeholder="Select category" data={catData} value={data.category} onChange={v => setData('category', v ?? '')} error={errors.category} required styles={inputStyles} />
                        <DatePicker label="Date *" value={data.expense_date} onChange={v => setData('expense_date', v)} error={errors.expense_date} required styles={inputStyles} />
                    </Group>

                    <Group grow gap="md" mt="md">
                        <NumberInput label="Amount *" placeholder="0.00" value={data.amount} onChange={v => setData('amount', v)} error={errors.amount} required min={0.01} decimalScale={2} hideControls styles={inputStyles} />
                        <Select label="Currency" data={currData} value={data.currency} onChange={v => setData('currency', v ?? 'TZS')} styles={inputStyles} />
                    </Group>

                    <Group grow gap="md" mt="md">
                        <Select label="Linked Trip" placeholder="No trip" data={tripData} value={data.trip_id ? String(data.trip_id) : ''} onChange={v => setData('trip_id', v ?? '')} searchable clearable styles={inputStyles} />
                        <Select label="Vehicle Plate" placeholder="No vehicle" data={vehicleData} value={data.vehicle_plate} onChange={v => setData('vehicle_plate', v ?? '')} searchable clearable styles={inputStyles} />
                    </Group>

                    <TextInput label="Description" placeholder="Brief description" value={data.description} onChange={e => setData('description', e.target.value)} error={errors.description} styles={inputStyles} mt="md" />
                    <TextInput label="Receipt / Reference No." placeholder="e.g. REC-0001" value={data.receipt_number} onChange={e => setData('receipt_number', e.target.value)} error={errors.receipt_number} styles={inputStyles} mt="md" />
                    <Textarea label="Notes" placeholder="Additional notes…" value={data.notes} onChange={e => setData('notes', e.target.value)} error={errors.notes} styles={inputStyles} rows={3} mt="md" />
                </SimpleGrid>
            </Box>
        </Box>
    );
}

function SimpleGrid({ children }) {
    return <Stack gap={0}>{children}</Stack>;
}

import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Textarea, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function CreateAdvance({ employees, prefillEmployee }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const { data, setData, post, processing, errors } = useForm({
        employee_id:     prefillEmployee ? String(prefillEmployee) : '',
        amount:          '',
        purpose:         '',
        requested_date:  new Date().toLocaleDateString('en-CA'),
        deduction_month: '',
        notes:           '',
    });

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
        dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
    };

    const empData = employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }));

    const submit = (e) => {
        e.preventDefault();
        post('/system/hr/advances');
    };

    return (
        <DashboardLayout title="New Advance Request">
            <Head title="New Advance Request" />
            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>Salary Advance Request</Text>
                        <Text size="sm" style={{ color: textSec }}>Will be deducted from the specified payroll month</Text>
                    </Stack>
                    <Group gap="sm">
                        <Box component={Link} href="/system/hr/advances" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Cancel</Box>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                                {processing ? 'Submitting…' : 'Submit Request'}
                            </Box>
                        </motion.div>
                    </Group>
                </Group>
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px', maxWidth: 560 }}>
                    <Select label="Employee *" placeholder="Select employee" data={empData} value={data.employee_id} onChange={v => setData('employee_id', v ?? '')} error={errors.employee_id} required searchable styles={inputStyles} mb="md" />
                    <Group grow gap="md" mb="md">
                        <NumberInput label="Amount (TZS) *" value={data.amount} onChange={v => setData('amount', v ?? '')} error={errors.amount} required min={1} hideControls styles={inputStyles} />
                        <DatePicker label="Request Date *" value={data.requested_date} onChange={v => setData('requested_date', v)} error={errors.requested_date} required styles={inputStyles} />
                    </Group>
                    <DatePicker label="Deduct in Payroll Month" value={data.deduction_month} onChange={v => setData('deduction_month', v)} error={errors.deduction_month} styles={inputStyles} mb="md" />
                    <Textarea label="Purpose" placeholder="Reason for advance…" value={data.purpose} onChange={e => setData('purpose', e.target.value)} styles={inputStyles} rows={2} mb="md" />
                    <Textarea label="Notes" value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyles} rows={2} />
                </Box>
            </Box>
        </DashboardLayout>
    );
}

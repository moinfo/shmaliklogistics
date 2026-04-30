import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Textarea, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function CreateLoan({ employees, prefillEmployee }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const { data, setData, post, processing, errors } = useForm({
        employee_id:          prefillEmployee ? String(prefillEmployee) : '',
        principal:            '',
        monthly_installment:  '',
        total_months:         '',
        start_date:           new Date().toLocaleDateString('en-CA'),
        purpose:              '',
        notes:                '',
    });

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
        dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
        error: { color: '#EF4444', fontSize: 12 },
    };

    const empData = employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }));

    const submit = (e) => {
        e.preventDefault();
        post('/system/hr/loans');
    };

    // Compute expected end date for preview
    const months = parseInt(data.total_months) || 0;
    const start  = data.start_date ? new Date(data.start_date) : null;
    let endPreview = null;
    if (start && months > 0) {
        const end = new Date(start);
        end.setMonth(end.getMonth() + months - 1);
        endPreview = end.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }

    return (
        <DashboardLayout title="New Loan">
            <Head title="New Loan" />
            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>Employee Loan Application</Text>
                        <Text size="sm" style={{ color: textSec }}>Monthly installments auto-deducted from payroll</Text>
                    </Stack>
                    <Group gap="sm">
                        <Box component={Link} href="/system/hr/loans" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Cancel</Box>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                                {processing ? 'Submitting…' : 'Submit Loan'}
                            </Box>
                        </motion.div>
                    </Group>
                </Group>

                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px', maxWidth: 580 }}>
                    <Select
                        label="Employee *" placeholder="Select employee" data={empData}
                        value={data.employee_id} onChange={v => setData('employee_id', v ?? '')}
                        error={errors.employee_id} required searchable styles={inputStyles} mb="md"
                    />

                    <NumberInput
                        label="Principal Amount (TZS) *" value={data.principal}
                        onChange={v => setData('principal', v ?? '')}
                        error={errors.principal} required min={1} hideControls
                        styles={inputStyles} mb="md"
                    />

                    <Group grow gap="md" mb="md">
                        <NumberInput
                            label="Monthly Installment (TZS) *" value={data.monthly_installment}
                            onChange={v => setData('monthly_installment', v ?? '')}
                            error={errors.monthly_installment} required min={1} hideControls
                            styles={inputStyles}
                        />
                        <NumberInput
                            label="Total Months *" value={data.total_months}
                            onChange={v => setData('total_months', v ?? '')}
                            error={errors.total_months} required min={1} max={120} hideControls
                            styles={inputStyles}
                        />
                    </Group>

                    <DatePicker
                        label="First Deduction Month *" value={data.start_date}
                        onChange={v => setData('start_date', v)}
                        error={errors.start_date} required styles={inputStyles} mb="md"
                    />

                    {endPreview && (
                        <Box mb="md" style={{ padding: '10px 14px', background: isDark ? 'rgba(33,150,243,0.08)' : '#EFF6FF', borderRadius: 8, border: '1px solid rgba(33,150,243,0.2)' }}>
                            <Text size="xs" style={{ color: '#3B82F6' }}>
                                📅 Expected completion: <strong>{endPreview}</strong> ({months} month{months !== 1 ? 's' : ''})
                            </Text>
                        </Box>
                    )}

                    <Textarea label="Purpose" placeholder="Reason for loan…" value={data.purpose} onChange={e => setData('purpose', e.target.value)} styles={inputStyles} rows={2} mb="md" />
                    <Textarea label="Notes" value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyles} rows={2} />
                </Box>
            </Box>
        </DashboardLayout>
    );
}

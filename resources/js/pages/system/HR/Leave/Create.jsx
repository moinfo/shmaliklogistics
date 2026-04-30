import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Textarea, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function CreateLeave({ employees, types, prefillEmployee }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const { data, setData, post, processing, errors } = useForm({
        employee_id: prefillEmployee ? String(prefillEmployee) : '',
        type:        '',
        start_date:  '',
        end_date:    '',
        days:        1,
        reason:      '',
    });

    // Auto-calc days when dates change
    useEffect(() => {
        if (data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end   = new Date(data.end_date);
            const diff  = Math.max(1, Math.round((end - start) / 86400000) + 1);
            setData('days', diff);
        }
    }, [data.start_date, data.end_date]);

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };

    const empData  = employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }));
    const typeData = Object.entries(types).map(([k, v]) => ({ value: k, label: v.label }));

    const submit = (e) => {
        e.preventDefault();
        post('/system/hr/leave');
    };

    return (
        <DashboardLayout title="New Leave Request">
            <Head title="New Leave Request" />

            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>Leave Request</Text>
                        <Text size="sm" style={{ color: textSec }}>Submit a new leave request</Text>
                    </Stack>
                    <Group gap="sm">
                        <Box component={Link} href="/system/hr/leave" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Cancel</Box>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                                {processing ? 'Submitting…' : 'Submit Request'}
                            </Box>
                        </motion.div>
                    </Group>
                </Group>

                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px' }}>
                    <Group grow gap="md" mb="md">
                        <Select label="Employee *" placeholder="Select employee" data={empData} value={data.employee_id} onChange={v => setData('employee_id', v ?? '')} error={errors.employee_id} required searchable styles={{ ...inputStyles, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} />
                        <Select label="Leave Type *" placeholder="Select type" data={typeData} value={data.type} onChange={v => setData('type', v ?? '')} error={errors.type} required styles={{ ...inputStyles, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} />
                    </Group>
                    <Group grow gap="md" mb="md">
                        <DatePicker label="Start Date *" value={data.start_date} onChange={v => setData('start_date', v)} error={errors.start_date} required styles={inputStyles} />
                        <DatePicker label="End Date *" value={data.end_date} onChange={v => setData('end_date', v)} error={errors.end_date} required styles={inputStyles} />
                    </Group>
                    <NumberInput label="Number of Days *" value={data.days} onChange={v => setData('days', v)} error={errors.days} required min={1} hideControls styles={inputStyles} mb="md" />
                    <Textarea label="Reason" placeholder="Reason for leave…" value={data.reason} onChange={e => setData('reason', e.target.value)} error={errors.reason} styles={inputStyles} rows={3} />
                </Box>
            </Box>
        </DashboardLayout>
    );
}

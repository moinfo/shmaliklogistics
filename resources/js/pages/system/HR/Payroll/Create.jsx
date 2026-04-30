import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CreatePayroll({ existing }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const thisYear  = new Date().getFullYear();
    const thisMonth = new Date().getMonth() + 1;

    const { data, setData, post, processing, errors } = useForm({
        year:  String(thisYear),
        month: String(thisMonth),
        notes: '',
    });

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
        dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
    };

    const yearData  = Array.from({ length: 6 }, (_, i) => String(thisYear - 1 + i)).map(y => ({ value: y, label: y }));
    const monthData = MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m }));

    const submit = (e) => {
        e.preventDefault();
        post('/system/hr/payroll');
    };

    return (
        <DashboardLayout title="New Payroll Run">
            <Head title="New Payroll Run" />

            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>New Payroll Run</Text>
                        <Text size="sm" style={{ color: textSec }}>Auto-generates payslips for all active employees using current tax settings</Text>
                    </Stack>
                    <Group gap="sm">
                        <Box component={Link} href="/system/hr/payroll" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Cancel</Box>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                                {processing ? 'Generating…' : 'Create Payroll Run'}
                            </Box>
                        </motion.div>
                    </Group>
                </Group>

                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px', maxWidth: 500 }}>
                    <Group grow gap="md" mb="md">
                        <Select label="Year *" data={yearData} value={data.year} onChange={v => setData('year', v ?? String(thisYear))} error={errors.year} styles={inputStyles} />
                        <Select label="Month *" data={monthData} value={data.month} onChange={v => setData('month', v ?? String(thisMonth))} error={errors.month} styles={inputStyles} />
                    </Group>
                    <Textarea label="Notes" placeholder="Optional notes for this payroll run…" value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyles} rows={2} />
                </Box>
            </Box>
        </DashboardLayout>
    );
}

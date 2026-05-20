import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CreatePayroll({ existing }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const thisYear  = new Date().getFullYear();
    const thisMonth = new Date().getMonth() + 1;

    const { data, setData, post, processing, errors } = useForm({
        year:  String(thisYear),
        month: String(thisMonth),
        notes: '',
    });

    const yearData  = Array.from({ length: 6 }, (_, i) => String(thisYear - 1 + i)).map(y => ({ value: y, label: y }));
    const monthData = MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m }));

    const submit = (e) => {
        e.preventDefault();
        post('/system/hr/payroll');
    };

    return (
        <DashboardLayout title="New Payroll Run">
            <Head title="New Payroll Run" />

            {/* Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18,
                    padding: '20px 28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                💼
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">New Payroll Run</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Auto-generates payslips for all active employees using current tax settings</Text>
                            </Stack>
                        </Group>
                        <Box
                            component={Link}
                            href="/system/hr/payroll"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ← Back
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <Box component="form" onSubmit={submit}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}>
                                <Text size="md">📅</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Payroll Period</Text>
                            </Group>
                        </Box>
                        <Box style={{ padding: '20px 24px' }}>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                                <Select
                                    label="Year *"
                                    data={yearData}
                                    value={data.year}
                                    onChange={v => setData('year', v ?? String(thisYear))}
                                    error={errors.year}
                                    styles={{ ...inputStyles, dropdown: dropdownStyle }}
                                />
                                <Select
                                    label="Month *"
                                    data={monthData}
                                    value={data.month}
                                    onChange={v => setData('month', v ?? String(thisMonth))}
                                    error={errors.month}
                                    styles={{ ...inputStyles, dropdown: dropdownStyle }}
                                />
                            </SimpleGrid>
                            <Textarea
                                label="Notes"
                                placeholder="Optional notes for this payroll run…"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                styles={inputStyles}
                                rows={2}
                            />
                        </Box>
                    </Box>
                </motion.div>

                <Group justify="flex-end" gap="sm" mt={16}>
                    <Box
                        component={Link}
                        href="/system/hr/payroll"
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textSec, padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                    >
                        Cancel
                    </Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box
                            component="button"
                            type="submit"
                            disabled={processing}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, padding: '0 24px', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: processing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(234,88,12,0.4)', opacity: processing ? 0.7 : 1 }}
                        >
                            {processing ? 'Generating…' : 'Create Payroll Run'}
                        </Box>
                    </motion.div>
                </Group>
            </Box>
        </DashboardLayout>
    );
}

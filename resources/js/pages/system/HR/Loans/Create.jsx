import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Textarea, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

export default function CreateLoan({ employees, prefillEmployee }) {
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
        error: { color: '#EF4444', fontSize: 12 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const { data, setData, post, processing, errors } = useForm({
        employee_id:          prefillEmployee ? String(prefillEmployee) : '',
        principal:            '',
        monthly_installment:  '',
        total_months:         '',
        start_date:           new Date().toLocaleDateString('en-CA'),
        purpose:              '',
        notes:                '',
    });

    const empData = employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }));

    const submit = (e) => {
        e.preventDefault();
        post('/system/hr/loans');
    };

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
                                🏦
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Employee Loan Application</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Monthly installments auto-deducted from payroll</Text>
                            </Stack>
                        </Group>
                        <Box
                            component={Link}
                            href="/system/hr/loans"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ← Back
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            <Box component="form" onSubmit={submit}>
                {/* Loan Details */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}>
                                <Text size="md">📋</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Loan Details</Text>
                            </Group>
                        </Box>
                        <Box style={{ padding: '20px 24px' }}>
                            <Select
                                label="Employee *"
                                placeholder="Select employee"
                                data={empData}
                                value={data.employee_id}
                                onChange={v => setData('employee_id', v ?? '')}
                                error={errors.employee_id}
                                required
                                searchable
                                styles={{ ...inputStyles, dropdown: dropdownStyle }}
                                mb="md"
                            />
                            <NumberInput
                                label="Principal Amount (TZS) *"
                                value={data.principal}
                                onChange={v => setData('principal', v ?? '')}
                                error={errors.principal}
                                required
                                min={1}
                                hideControls
                                styles={inputStyles}
                                mb="md"
                            />
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                                <NumberInput
                                    label="Monthly Installment (TZS) *"
                                    value={data.monthly_installment}
                                    onChange={v => setData('monthly_installment', v ?? '')}
                                    error={errors.monthly_installment}
                                    required
                                    min={1}
                                    hideControls
                                    styles={inputStyles}
                                />
                                <NumberInput
                                    label="Total Months *"
                                    value={data.total_months}
                                    onChange={v => setData('total_months', v ?? '')}
                                    error={errors.total_months}
                                    required
                                    min={1}
                                    max={120}
                                    hideControls
                                    styles={inputStyles}
                                />
                            </SimpleGrid>
                            <DatePicker
                                label="First Deduction Month *"
                                value={data.start_date}
                                onChange={v => setData('start_date', v)}
                                error={errors.start_date}
                                required
                                styles={inputStyles}
                                mb="md"
                            />
                            {endPreview && (
                                <Box mb="md" style={{ padding: '10px 14px', background: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE'}` }}>
                                    <Text size="xs" style={{ color: '#3B82F6' }}>
                                        📅 Expected completion: <strong>{endPreview}</strong> ({months} month{months !== 1 ? 's' : ''})
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </motion.div>

                {/* Purpose & Notes */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
                    <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}>
                                <Text size="md">📝</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Purpose & Notes</Text>
                            </Group>
                        </Box>
                        <Box style={{ padding: '20px 24px' }}>
                            <Textarea
                                label="Purpose"
                                placeholder="Reason for loan…"
                                value={data.purpose}
                                onChange={e => setData('purpose', e.target.value)}
                                styles={inputStyles}
                                rows={2}
                                mb="md"
                            />
                            <Textarea
                                label="Notes"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                styles={inputStyles}
                                rows={2}
                            />
                        </Box>
                    </Box>
                </motion.div>

                <Group justify="flex-end" gap="sm" mt={8}>
                    <Box
                        component={Link}
                        href="/system/hr/loans"
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
                            {processing ? 'Submitting…' : 'Submit Loan'}
                        </Box>
                    </motion.div>
                </Group>
            </Box>
        </DashboardLayout>
    );
}

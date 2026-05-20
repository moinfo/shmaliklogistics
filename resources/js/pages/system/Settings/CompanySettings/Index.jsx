import { Head, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

export default function CompanySettingsIndex({ company }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const { data, setData, post, processing, errors } = useForm({
        company_name:    company?.company_name ?? '',
        company_address: company?.company_address ?? '',
        company_po_box:  company?.company_po_box ?? '',
        company_city:    company?.company_city ?? '',
        company_country: company?.company_country ?? 'Tanzania',
        company_phone:   company?.company_phone ?? '',
        company_email:   company?.company_email ?? '',
        company_tin:     company?.company_tin ?? '',
    });

    const submit = (e) => { e.preventDefault(); post('/system/settings/company'); };

    const inp = (label, key, placeholder = '', full = false) => (
        <Box style={full ? { gridColumn: 'span 2' } : {}}>
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box
                component="input"
                value={data[key]}
                onChange={e => setData(key, e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    return (
        <DashboardLayout title="Company Settings">
            <Head title="Company Settings" />

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏢</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Company Settings</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>These details appear on salary slips and printed documents</Text>
                            </Stack>
                        </Group>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box
                                component="button"
                                onClick={submit}
                                disabled={processing}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, cursor: 'pointer', opacity: processing ? 0.7 : 1 }}
                            >
                                {processing ? 'Saving…' : '💾 Save Settings'}
                            </Box>
                        </motion.div>
                    </Group>
                </Box>
            </motion.div>

            <Box component="form" onSubmit={submit} style={{ maxWidth: 720 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}><Text size="md">🏢</Text><Text fw={700} size="sm" style={{ color: textPri }}>Company Information</Text></Group>
                    </Box>
                    <Box style={{ padding: '20px 24px' }}>
                        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {inp('Company Name *', 'company_name', 'e.g. WAJENZI PROFESSIONAL COMPANY LIMITED', true)}
                            {inp('Address', 'company_address', 'Street address', true)}
                            {inp('P.O. Box', 'company_po_box', 'e.g. 14492')}
                            {inp('City', 'company_city', 'e.g. Dar es Salaam')}
                            {inp('Country', 'company_country', 'e.g. Tanzania')}
                            {inp('TIN Number', 'company_tin', 'e.g. 154-867-805')}
                            {inp('Phone', 'company_phone', 'e.g. +255 793 444 400')}
                            {inp('Email', 'company_email', 'e.g. info@company.co.tz')}
                        </Box>

                        <Box mt="xl" style={{ padding: '14px 16px', background: isDark ? 'rgba(234,88,12,0.06)' : '#FFF7ED', borderRadius: 10, border: '1px solid rgba(234,88,12,0.2)' }}>
                            <Text size="sm" style={{ color: '#EA580C' }}>
                                💡 The company name and address will appear on all printed salary slips. Update these before printing payslips for the first time.
                            </Text>
                        </Box>
                    </Box>
                </Box>

                <Group justify="flex-end" mt="xl">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box
                            component="button"
                            type="submit"
                            disabled={processing}
                            style={{ padding: '10px 28px', height: 42, borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(194,65,12,0.35)', opacity: processing ? 0.7 : 1 }}
                        >
                            {processing ? 'Saving…' : '💾 Save Settings'}
                        </Box>
                    </motion.div>
                </Group>
            </Box>
        </DashboardLayout>
    );
}

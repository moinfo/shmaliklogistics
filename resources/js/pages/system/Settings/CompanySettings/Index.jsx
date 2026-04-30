import { Head, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function CompanySettingsIndex({ company }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

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

    const inp = (label, key, placeholder = '', span = 1) => (
        <Box style={{ gridColumn: `span ${span}` }}>
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box component="input" value={data[key]} onChange={e => setData(key, e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    return (
        <DashboardLayout title="Company Settings">
            <Head title="Company Settings" />
            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>Company Settings</Text>
                        <Text size="sm" style={{ color: textSec }}>These details appear on salary slips and printed documents</Text>
                    </Stack>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        {processing ? 'Saving…' : '💾 Save Settings'}
                    </Box>
                </Group>

                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px', maxWidth: 700 }}>
                    <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 20 }}>Company Information</Text>
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {inp('Company Name *', 'company_name', 'e.g. WAJENZI PROFESSIONAL COMPANY LIMITED', 2)}
                        {inp('Address', 'company_address', 'Street address', 2)}
                        {inp('P.O. Box', 'company_po_box', 'e.g. 14492')}
                        {inp('City', 'company_city', 'e.g. Dar es Salaam')}
                        {inp('Country', 'company_country', 'e.g. Tanzania')}
                        {inp('TIN Number', 'company_tin', 'e.g. 154-867-805')}
                        {inp('Phone', 'company_phone', 'e.g. +255 793 444 400')}
                        {inp('Email', 'company_email', 'e.g. info@company.co.tz')}
                    </Box>

                    <Box mt="xl" style={{ padding: '14px 16px', background: isDark ? 'rgba(33,150,243,0.06)' : '#EFF6FF', borderRadius: 8, border: '1px solid rgba(33,150,243,0.2)' }}>
                        <Text size="sm" style={{ color: '#3B82F6' }}>💡 The company name and address will appear on all printed salary slips. Update these before printing payslips for the first time.</Text>
                    </Box>
                </Box>
            </Box>
        </DashboardLayout>
    );
}

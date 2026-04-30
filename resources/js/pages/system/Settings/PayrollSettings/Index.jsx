import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, NumberInput, Textarea } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 }); }

const PAYE_BANDS_DEFAULT = [
    { from: 0,        to: 270000,  rate: 0 },
    { from: 270001,   to: 520000,  rate: 8 },
    { from: 520001,   to: 760000,  rate: 20 },
    { from: 760001,   to: 1000000, rate: 25 },
    { from: 1000001,  to: null,    rate: 30 },
];

const NHIF_BANDS_DEFAULT = [
    { from: 0,       to: 999999,  amount: 0 },
    { from: 1000000, to: 1999999, amount: 30000 },
    { from: 2000000, to: 2999999, amount: 60000 },
    { from: 3000000, to: null,    amount: 90000 },
];

export default function PayrollSettingsIndex({ grouped }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const get = (group, key, fallback = '') => grouped?.[group]?.[key]?.value ?? fallback;

    const [sdlRate,      setSdlRate]      = useState(Number(get('sdl', 'sdl_rate', '4.5')));
    const [nssfEmployee, setNssfEmployee] = useState(Number(get('nssf', 'nssf_employee', '10')));
    const [nssfEmployer, setNssfEmployer] = useState(Number(get('nssf', 'nssf_employer', '10')));
    const [nssfMax,      setNssfMax]      = useState(Number(get('nssf', 'nssf_max_monthly', '0')));
    const [wcfRate,      setWcfRate]      = useState(Number(get('wcf', 'wcf_rate', '0.5')));
    const [payeBands,    setPayeBands]    = useState(() => {
        try { return JSON.parse(get('paye', 'paye_bands', JSON.stringify(PAYE_BANDS_DEFAULT))); }
        catch { return PAYE_BANDS_DEFAULT; }
    });
    const [nhifBands, setNhifBands] = useState(() => {
        try { return JSON.parse(get('nhif', 'nhif_bands', JSON.stringify(NHIF_BANDS_DEFAULT))); }
        catch { return NHIF_BANDS_DEFAULT; }
    });

    // Live calculator
    const [previewGross, setPreviewGross] = useState(1000000);
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const runPreview = useCallback(() => {
        if (!previewGross) return;
        setLoadingPreview(true);
        fetch(`/system/settings/payroll/preview?gross=${previewGross}`)
            .then(r => r.json())
            .then(d => { setPreview(d); setLoadingPreview(false); })
            .catch(() => setLoadingPreview(false));
    }, [previewGross]);

    const { post, processing } = useForm({});

    const save = (e) => {
        e.preventDefault();
        router.post('/system/settings/payroll', {
            settings: {
                sdl_rate:          String(sdlRate),
                nssf_employee:     String(nssfEmployee),
                nssf_employer:     String(nssfEmployer),
                nssf_max_monthly:  String(nssfMax),
                wcf_rate:          String(wcfRate),
                paye_bands:        JSON.stringify(payeBands),
                nhif_bands:        JSON.stringify(nhifBands),
            },
        });
    };

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };

    const section = (title, sub) => (
        <Box mb="md">
            <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            {sub && <Text size="xs" style={{ color: textSec }}>{sub}</Text>}
        </Box>
    );

    return (
        <DashboardLayout title="Payroll Settings">
            <Head title="Payroll Settings" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Payroll Settings</Text>
                    <Text size="sm" style={{ color: textSec }}>Tanzania statutory deduction rates and bands</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" onClick={save} disabled={processing} style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        {processing ? 'Saving…' : 'Save Settings'}
                    </Box>
                </motion.div>
            </Group>

            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* SDL */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    {section('SDL — Skills & Development Levy', 'Employer only. Calculated on gross salary.')}
                    <NumberInput label="SDL Rate (%)" value={sdlRate} onChange={v => setSdlRate(v ?? 0)} min={0} max={100} decimalScale={2} step={0.5} styles={inputStyles} />
                </Box>

                {/* WCF */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    {section('WCF — Workers\' Compensation Fund', 'Employer only. Calculated on gross salary.')}
                    <NumberInput label="WCF Rate (%)" value={wcfRate} onChange={v => setWcfRate(v ?? 0)} min={0} max={100} decimalScale={2} step={0.1} styles={inputStyles} />
                </Box>

                {/* NSSF */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    {section('NSSF — National Social Security Fund', 'Both employee and employer contribute.')}
                    <Group grow gap="md" mb="md">
                        <NumberInput label="Employee Rate (%)" value={nssfEmployee} onChange={v => setNssfEmployee(v ?? 0)} min={0} max={100} decimalScale={2} step={0.5} styles={inputStyles} />
                        <NumberInput label="Employer Rate (%)" value={nssfEmployer} onChange={v => setNssfEmployer(v ?? 0)} min={0} max={100} decimalScale={2} step={0.5} styles={inputStyles} />
                    </Group>
                    <NumberInput label="Monthly Cap (TZS, 0 = no cap)" value={nssfMax} onChange={v => setNssfMax(v ?? 0)} min={0} hideControls styles={inputStyles} />
                </Box>

                {/* NHIF bands */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    {section('NHIF — National Health Insurance Fund', 'Employee only. Flat amount per salary bracket.')}
                    <Stack gap={8}>
                        {nhifBands.map((band, i) => (
                            <Group key={i} gap="sm" align="flex-end">
                                <NumberInput label={i === 0 ? 'From (TZS)' : undefined} value={band.from} onChange={v => { const b = [...nhifBands]; b[i] = { ...b[i], from: v ?? 0 }; setNhifBands(b); }} hideControls styles={{ ...inputStyles, root: { flex: 1 } }} />
                                <NumberInput label={i === 0 ? 'To (TZS, blank = ∞)' : undefined} value={band.to ?? ''} onChange={v => { const b = [...nhifBands]; b[i] = { ...b[i], to: v || null }; setNhifBands(b); }} hideControls styles={{ ...inputStyles, root: { flex: 1 } }} />
                                <NumberInput label={i === 0 ? 'Amount (TZS)' : undefined} value={band.amount} onChange={v => { const b = [...nhifBands]; b[i] = { ...b[i], amount: v ?? 0 }; setNhifBands(b); }} hideControls styles={{ ...inputStyles, root: { flex: 1 } }} />
                            </Group>
                        ))}
                    </Stack>
                </Box>
            </Box>

            {/* PAYE bands — full width */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px', marginBottom: 20 }}>
                {section('PAYE — Pay As You Earn', 'Employee only. Progressive tax on gross monthly salary (TZS).')}
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['From (TZS)', 'To (TZS, blank = ∞)', 'Rate (%)'].map((h, i) => (
                                    <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {payeBands.map((band, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}>
                                    <td style={{ padding: '8px 12px' }}>
                                        <NumberInput value={band.from} onChange={v => { const b = [...payeBands]; b[i] = { ...b[i], from: v ?? 0 }; setPayeBands(b); }} hideControls styles={{ ...inputStyles, input: { ...inputStyles.input, width: 140 } }} />
                                    </td>
                                    <td style={{ padding: '8px 12px' }}>
                                        <NumberInput value={band.to ?? ''} onChange={v => { const b = [...payeBands]; b[i] = { ...b[i], to: v || null }; setPayeBands(b); }} hideControls placeholder="∞" styles={{ ...inputStyles, input: { ...inputStyles.input, width: 140 } }} />
                                    </td>
                                    <td style={{ padding: '8px 12px' }}>
                                        <NumberInput value={band.rate} onChange={v => { const b = [...payeBands]; b[i] = { ...b[i], rate: v ?? 0 }; setPayeBands(b); }} min={0} max={100} decimalScale={1} hideControls styles={{ ...inputStyles, input: { ...inputStyles.input, width: 90 } }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Box>

            {/* Live calculator preview */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 4 }}>🧮 Live Tax Calculator</Text>
                <Text size="xs" style={{ color: textSec, marginBottom: 16 }}>Preview deductions using saved settings for any gross salary.</Text>
                <Group gap="md" align="flex-end" mb="md">
                    <NumberInput label="Gross Salary (TZS)" value={previewGross} onChange={v => setPreviewGross(v ?? 0)} hideControls styles={{ ...inputStyles, root: { flex: 1 } }} />
                    <Box component="button" onClick={runPreview} disabled={loadingPreview} style={{ padding: '9px 20px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        {loadingPreview ? 'Calculating…' : 'Calculate'}
                    </Box>
                </Group>
                {preview && (
                    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                        {[
                            ['Gross Salary', preview.gross_salary, '#3B82F6'],
                            ['PAYE', preview.paye, '#EF4444'],
                            ['NSSF (Employee)', preview.nssf_employee, '#F59E0B'],
                            ['NHIF', preview.nhif_employee, '#F59E0B'],
                            ['Total Deductions', preview.total_deductions, '#EF4444'],
                            ['Net Salary', preview.net_salary, '#22C55E'],
                            ['SDL (Employer)', preview.sdl_employer, '#8B5CF6'],
                            ['NSSF (Employer)', preview.nssf_employer, '#8B5CF6'],
                            ['WCF (Employer)', preview.wcf_employer, '#8B5CF6'],
                            ['Total Employer Cost', preview.total_employer_cost, '#475569'],
                        ].map(([label, value, color]) => (
                            <Box key={label} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 8, padding: '12px 14px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}` }}>
                                <Text size="xs" style={{ color: textSec }}>{label}</Text>
                                <Text fw={800} size="sm" style={{ color }}>{fmt(value)}</Text>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

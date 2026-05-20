import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

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

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
    };

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
    const [previewGross,    setPreviewGross]    = useState(1000000);
    const [preview,         setPreview]         = useState(null);
    const [loadingPreview,  setLoadingPreview]  = useState(false);

    const runPreview = useCallback(() => {
        if (!previewGross) return;
        setLoadingPreview(true);
        fetch(`/system/settings/payroll/preview?gross=${previewGross}`)
            .then(r => r.json())
            .then(d => { setPreview(d); setLoadingPreview(false); })
            .catch(() => setLoadingPreview(false));
    }, [previewGross]);

    const { processing } = useForm({});

    const save = (e) => {
        e.preventDefault();
        router.post('/system/settings/payroll', {
            settings: {
                sdl_rate:         String(sdlRate),
                nssf_employee:    String(nssfEmployee),
                nssf_employer:    String(nssfEmployer),
                nssf_max_monthly: String(nssfMax),
                wcf_rate:         String(wcfRate),
                paye_bands:       JSON.stringify(payeBands),
                nhif_bands:       JSON.stringify(nhifBands),
            },
        });
    };

    const SectionCard = ({ icon, title, subtitle, children }) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}><Text size="md">{icon}</Text><Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text></Group>
                {subtitle && <Text size="xs" style={{ color: textSec, marginTop: 2 }}>{subtitle}</Text>}
            </Box>
            <Box style={{ padding: '20px 24px' }}>{children}</Box>
        </Box>
    );

    return (
        <DashboardLayout title="Payroll Settings">
            <Head title="Payroll Settings" />

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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⚙️</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Payroll Settings</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Tanzania statutory deduction rates and bands</Text>
                            </Stack>
                        </Group>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box
                                component="button"
                                onClick={save}
                                disabled={processing}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, cursor: 'pointer', opacity: processing ? 0.7 : 1 }}
                            >
                                {processing ? 'Saving…' : '💾 Save Settings'}
                            </Box>
                        </motion.div>
                    </Group>
                </Box>
            </motion.div>

            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* SDL */}
                <SectionCard icon="🏗️" title="SDL — Skills & Development Levy" subtitle="Employer only. Calculated on gross salary.">
                    <NumberInput label="SDL Rate (%)" value={sdlRate} onChange={v => setSdlRate(v ?? 0)} min={0} max={100} decimalScale={2} step={0.5} styles={inputStyles} />
                </SectionCard>

                {/* WCF */}
                <SectionCard icon="🦺" title="WCF — Workers' Compensation Fund" subtitle="Employer only. Calculated on gross salary.">
                    <NumberInput label="WCF Rate (%)" value={wcfRate} onChange={v => setWcfRate(v ?? 0)} min={0} max={100} decimalScale={2} step={0.1} styles={inputStyles} />
                </SectionCard>

                {/* NSSF */}
                <SectionCard icon="🏛️" title="NSSF — National Social Security Fund" subtitle="Both employee and employer contribute.">
                    <Group grow gap="md" mb="md">
                        <NumberInput label="Employee Rate (%)" value={nssfEmployee} onChange={v => setNssfEmployee(v ?? 0)} min={0} max={100} decimalScale={2} step={0.5} styles={inputStyles} />
                        <NumberInput label="Employer Rate (%)" value={nssfEmployer} onChange={v => setNssfEmployer(v ?? 0)} min={0} max={100} decimalScale={2} step={0.5} styles={inputStyles} />
                    </Group>
                    <NumberInput label="Monthly Cap (TZS, 0 = no cap)" value={nssfMax} onChange={v => setNssfMax(v ?? 0)} min={0} hideControls styles={inputStyles} />
                </SectionCard>

                {/* NHIF bands */}
                <SectionCard icon="🏥" title="NHIF — National Health Insurance Fund" subtitle="Employee only. Flat amount per salary bracket.">
                    <Stack gap={8}>
                        {nhifBands.map((band, i) => (
                            <Group key={i} gap="sm" align="flex-end">
                                <NumberInput label={i === 0 ? 'From (TZS)' : undefined} value={band.from} onChange={v => { const b = [...nhifBands]; b[i] = { ...b[i], from: v ?? 0 }; setNhifBands(b); }} hideControls styles={{ ...inputStyles, root: { flex: 1 } }} />
                                <NumberInput label={i === 0 ? 'To (TZS, blank = ∞)' : undefined} value={band.to ?? ''} onChange={v => { const b = [...nhifBands]; b[i] = { ...b[i], to: v || null }; setNhifBands(b); }} hideControls styles={{ ...inputStyles, root: { flex: 1 } }} />
                                <NumberInput label={i === 0 ? 'Amount (TZS)' : undefined} value={band.amount} onChange={v => { const b = [...nhifBands]; b[i] = { ...b[i], amount: v ?? 0 }; setNhifBands(b); }} hideControls styles={{ ...inputStyles, root: { flex: 1 } }} />
                            </Group>
                        ))}
                    </Stack>
                </SectionCard>
            </Box>

            {/* PAYE bands — full width */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 20 }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}><Text size="md">📊</Text><Text fw={700} size="sm" style={{ color: textPri }}>PAYE — Pay As You Earn</Text></Group>
                    <Text size="xs" style={{ color: textSec, marginTop: 2 }}>Employee only. Progressive tax on gross monthly salary (TZS).</Text>
                </Box>
                <Box style={{ padding: '20px 24px' }}>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['From (TZS)', 'To (TZS, blank = ∞)', 'Rate (%)'].map((h, i) => (
                                        <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: textMut, textTransform: 'uppercase', letterSpacing: 0.9 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {payeBands.map((band, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${divider}` }}>
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
            </Box>

            {/* Live calculator */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}><Text size="md">🧮</Text><Text fw={700} size="sm" style={{ color: textPri }}>Live Tax Calculator</Text></Group>
                    <Text size="xs" style={{ color: textSec, marginTop: 2 }}>Preview deductions using saved settings for any gross salary.</Text>
                </Box>
                <Box style={{ padding: '20px 24px' }}>
                    <Group gap="md" align="flex-end" mb="md">
                        <NumberInput
                            label="Gross Salary (TZS)"
                            value={previewGross}
                            onChange={v => setPreviewGross(v ?? 0)}
                            hideControls
                            styles={{ ...inputStyles, root: { flex: 1 } }}
                        />
                        <Box
                            component="button"
                            onClick={runPreview}
                            disabled={loadingPreview}
                            style={{ padding: '9px 20px', height: 38, borderRadius: 8, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                        >
                            {loadingPreview ? 'Calculating…' : 'Calculate'}
                        </Box>
                    </Group>
                    {preview && (
                        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                            {[
                                ['Gross Salary',       preview.gross_salary,       '#EA580C'],
                                ['PAYE',               preview.paye,               '#EF4444'],
                                ['NSSF (Employee)',    preview.nssf_employee,      '#F59E0B'],
                                ['NHIF',               preview.nhif_employee,      '#F59E0B'],
                                ['Total Deductions',   preview.total_deductions,   '#EF4444'],
                                ['Net Salary',         preview.net_salary,         '#22C55E'],
                                ['SDL (Employer)',     preview.sdl_employer,       '#8B5CF6'],
                                ['NSSF (Employer)',    preview.nssf_employer,      '#8B5CF6'],
                                ['WCF (Employer)',     preview.wcf_employer,       '#8B5CF6'],
                                ['Total Employer Cost',preview.total_employer_cost, textMut],
                            ].map(([label, value, color]) => (
                                <Box key={label} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 10, padding: '12px 14px', border: `1px solid ${cardBorder}` }}>
                                    <Text size="xs" style={{ color: textSec }}>{label}</Text>
                                    <Text fw={800} size="sm" style={{ color }}>{fmt(value)}</Text>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </DashboardLayout>
    );
}

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));

export default function TripImport() {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const { props } = usePage();
    const flash = props.flash ?? {};

    const fileRef = useRef(null);
    const [file, setFile]             = useState(null);
    const [year, setYear]             = useState('2026');
    const [loading, setLoading]       = useState(false);
    const [preview, setPreview]       = useState(null);
    const [rows, setRows]             = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');

    const handleFile = (e) => {
        setFile(e.target.files[0] ?? null);
        setPreview(null);
        setRows([]);
        setError('');
    };

    const loadPreview = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('year', year);
        fd.append('_token', document.querySelector('meta[name="csrf-token"]')?.content ?? '');
        try {
            const res = await fetch('/system/trips/import/preview', { method: 'POST', body: fd });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setPreview(data);
            setRows(data.rows.map(r => ({ ...r, skip: r.exists })));
        } catch (e) {
            setError('Failed to parse file: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSkip = (idx) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, skip: !r.skip } : r));
    };

    const toggleAll = (skip) => setRows(prev => prev.map(r => ({ ...r, skip })));

    const doImport = () => {
        setSubmitting(true);
        router.post('/system/trips/import', { rows }, {
            onSuccess: () => { setPreview(null); setRows([]); setFile(null); setSubmitting(false); },
            onError:   () => setSubmitting(false),
        });
    };

    const newCount  = rows.filter(r => !r.skip).length;
    const skipCount = rows.filter(r => r.skip).length;
    const rowHov    = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    return (
        <DashboardLayout title="Import Trips">
            <Head title="Import Trips" />

            {/* Page Header Banner */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                📂
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Import Trips from Excel</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Upload a Trip Sheet (.xlsx) — DEBTORS sheet is read automatically</Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href="/system/trips" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            ← Back to Trips
                        </Box>
                    </Group>
                </Box>
            </motion.div>

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <Box mb="md" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '10px 16px' }}>
                        <Text size="sm" fw={600} style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                    </Box>
                </motion.div>
            )}

            {/* Upload card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 16 }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text size="md">📂</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Select Excel File</Text>
                        </Group>
                    </Box>
                    <Box style={{ padding: '20px 24px' }}>
                        <Group gap="md" align="flex-end">
                            <Select
                                label="Year"
                                value={year}
                                onChange={v => { setYear(v ?? '2026'); setPreview(null); setRows([]); }}
                                data={['2024', '2025', '2026', '2027'].map(y => ({ value: y, label: y }))}
                                styles={{ ...inputStyles, dropdown: dropdownStyle }}
                                w={100}
                            />
                            <Box
                                style={{ flex: 1, border: `2px dashed ${file ? '#22C55E' : cardBorder}`, borderRadius: 10, padding: '18px 20px', cursor: 'pointer', background: file ? 'rgba(34,197,94,0.05)' : inputBg, transition: 'all 0.2s' }}
                                onClick={() => fileRef.current?.click()}
                            >
                                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} style={{ display: 'none' }} />
                                <Text size="sm" style={{ color: file ? '#22C55E' : textMut, textAlign: 'center' }}>
                                    {file ? `✓ ${file.name}` : '📄 Click to choose an .xlsx file'}
                                </Text>
                            </Box>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Box
                                    component="button"
                                    onClick={loadPreview}
                                    disabled={!file || loading}
                                    style={{
                                        padding: '10px 24px', borderRadius: 10,
                                        background: !file || loading ? (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0') : 'linear-gradient(135deg, #C2410C, #EA580C)',
                                        color: !file || loading ? textMut : '#fff',
                                        border: 'none', cursor: !file || loading ? 'not-allowed' : 'pointer',
                                        fontWeight: 700, fontSize: 14,
                                        boxShadow: !file || loading ? 'none' : '0 4px 16px rgba(234,88,12,0.4)',
                                    }}
                                >
                                    {loading ? '⏳ Parsing…' : '🔍 Preview'}
                                </Box>
                            </motion.div>
                        </Group>

                        {error && (
                            <Box mt="sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                                <Text size="sm" style={{ color: '#EF4444' }}>{error}</Text>
                            </Box>
                        )}

                        <Box mt="md" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 8, padding: '10px 14px', border: `1px solid ${divider}` }}>
                            <Text size="xs" style={{ color: textMut }}>
                                Expected format: <strong>TRIP SHEET 2026.xlsx</strong> — reads the <strong>DEBTORS</strong> sheet.<br />
                                Columns: B=Trip No · C=Truck · D=Container · E=Destination · F=Agent · G=Invoice USD · H=Rate · K=Advance USD · N=Adv Cheque · P=Final USD · S=Fin Cheque
                            </Text>
                        </Box>
                    </Box>
                </Box>
            </motion.div>

            {/* Preview table */}
            {preview && rows.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />

                        {/* Summary bar */}
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group justify="space-between" align="center">
                                <Group gap="xl">
                                    <Stack gap={0}>
                                        <Text size="xs" style={{ color: textMut }}>Total rows</Text>
                                        <Text fw={700} size="md" style={{ color: textPri }}>{preview.total}</Text>
                                    </Stack>
                                    <Stack gap={0}>
                                        <Text size="xs" style={{ color: textMut }}>To import</Text>
                                        <Text fw={700} size="md" style={{ color: '#22C55E' }}>{newCount}</Text>
                                    </Stack>
                                    <Stack gap={0}>
                                        <Text size="xs" style={{ color: textMut }}>Skipping</Text>
                                        <Text fw={700} size="md" style={{ color: '#F59E0B' }}>{skipCount}</Text>
                                    </Stack>
                                </Group>
                                <Group gap="sm">
                                    <Box component="button" onClick={() => toggleAll(false)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Select All</Box>
                                    <Box component="button" onClick={() => toggleAll(true)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Skip All</Box>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Box
                                            component="button"
                                            onClick={doImport}
                                            disabled={submitting || newCount === 0}
                                            style={{
                                                padding: '8px 22px', borderRadius: 10,
                                                background: newCount === 0 || submitting ? (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0') : 'linear-gradient(135deg, #C2410C, #EA580C)',
                                                color: newCount === 0 || submitting ? textMut : '#fff',
                                                border: 'none', cursor: newCount === 0 || submitting ? 'not-allowed' : 'pointer',
                                                fontWeight: 700, fontSize: 13,
                                                boxShadow: newCount === 0 || submitting ? 'none' : '0 4px 16px rgba(234,88,12,0.4)',
                                            }}
                                        >
                                            {submitting ? 'Importing…' : `✓ Import ${newCount} Trip${newCount !== 1 ? 's' : ''}`}
                                        </Box>
                                    </motion.div>
                                </Group>
                            </Group>
                        </Box>

                        {/* Column headers */}
                        <Box style={{ overflowX: 'auto' }}>
                            <Box style={{ display: 'grid', gridTemplateColumns: '40px 120px 100px 130px 110px 1fr 90px 80px 100px 80px 40px', gap: 0, padding: '8px 20px', borderBottom: `1px solid ${divider}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                                {['', 'Trip #', 'Truck', 'Container', 'Destination', 'Agent', 'Inv USD', 'Rate', 'Adv USD', 'Bal USD', ''].map((h, i) => (
                                    <Text key={i} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</Text>
                                ))}
                            </Box>

                            {rows.map((r, idx) => (
                                <Box
                                    key={idx}
                                    style={{ display: 'grid', gridTemplateColumns: '40px 120px 100px 130px 110px 1fr 90px 80px 100px 80px 40px', gap: 0, padding: '10px 20px', borderBottom: `1px solid ${divider}`, background: r.skip ? (isDark ? 'rgba(239,68,68,0.04)' : '#FFF5F5') : 'transparent', opacity: r.skip ? 0.55 : 1, transition: 'all 0.15s' }}
                                    onMouseEnter={e => { if (!r.skip) e.currentTarget.style.background = rowHov; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = r.skip ? (isDark ? 'rgba(239,68,68,0.04)' : '#FFF5F5') : 'transparent'; }}
                                >
                                    <input type="checkbox" checked={!r.skip} onChange={() => toggleSkip(idx)} style={{ cursor: 'pointer', accentColor: '#EA580C', width: 16, height: 16, marginTop: 2 }} />
                                    <Stack gap={0}>
                                        <Text size="sm" fw={700} style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{r.trip_number}</Text>
                                        {r.exists && <Text size="10px" style={{ color: '#F59E0B' }}>⚠ exists</Text>}
                                    </Stack>
                                    <Text size="sm" style={{ color: textSec, fontFamily: 'monospace' }}>{r.vehicle_plate}</Text>
                                    <Text size="xs" style={{ color: textMut, fontFamily: 'monospace' }}>{r.container ?? '—'}</Text>
                                    <Text size="sm" style={{ color: textPri }}>{r.destination}</Text>
                                    <Text size="xs" style={{ color: textSec }}>{r.agent}</Text>
                                    <Text size="sm" fw={600} style={{ color: '#22C55E' }}>$ {fmt(r.invoice_usd)}</Text>
                                    <Text size="xs" style={{ color: textMut }}>{fmt(r.exchange_rate)}</Text>
                                    <Text size="sm" style={{ color: '#3B82F6' }}>$ {fmt(r.advance_usd)}</Text>
                                    <Text size="sm" style={{ color: r.balance_usd > 0 ? '#EF4444' : '#22C55E' }}>$ {fmt(r.balance_usd)}</Text>
                                    <Box style={{ width: 10, height: 10, borderRadius: '50%', background: r.skip ? '#EF4444' : '#22C55E', marginTop: 4 }} />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </motion.div>
            )}

            {preview && rows.length === 0 && (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '40px', textAlign: 'center', boxShadow: cardShadow }}>
                    <Text size="2rem" style={{ marginBottom: 12 }}>📭</Text>
                    <Text fw={600} style={{ color: textPri }}>No valid trip rows found in this file.</Text>
                    <Text size="sm" style={{ color: textMut, marginTop: 4 }}>Make sure the file has a DEBTORS sheet with TR0001, TR0002… in column B.</Text>
                </Box>
            )}
        </DashboardLayout>
    );
}

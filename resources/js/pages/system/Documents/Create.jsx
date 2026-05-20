import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, FileInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

export default function CreateDocument({ trips, vehicles, drivers, prefill }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const { data, setData, post, processing, errors } = useForm({
        title:             '',
        documentable_type: prefill?.type ?? '',
        documentable_id:   prefill?.id ?? '',
        notes:             '',
        file:              null,
    });

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    const typeOptions = [
        { value: 'trip',    label: '🗺️ Trip' },
        { value: 'vehicle', label: '🚛 Vehicle' },
        { value: 'driver',  label: '👤 Driver' },
    ];

    const entityOptions = () => {
        if (data.documentable_type === 'trip') {
            return trips.map(t => ({ value: String(t.id), label: `${t.trip_number} — ${t.route_from} → ${t.route_to}` }));
        }
        if (data.documentable_type === 'vehicle') {
            return vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }));
        }
        if (data.documentable_type === 'driver') {
            return drivers.map(d => ({ value: String(d.id), label: d.name }));
        }
        return [];
    };

    const submit = (e) => {
        e.preventDefault();
        post('/system/documents', { forceFormData: true });
    };

    return (
        <DashboardLayout title="Upload Document">
            <Head title="Upload Document" />

            {/* Banner */}
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
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📎</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Upload Document</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Attach a file to a trip, vehicle or driver</Text>
                            </Stack>
                        </Group>
                        <Box component={Link} href="/system/documents" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back</Box>
                    </Group>
                </Box>
            </motion.div>

            <Box component="form" onSubmit={submit}>
                {/* Document Details Card */}
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 16 }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text size="md">📋</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Document Details</Text>
                        </Group>
                    </Box>
                    <Box style={{ padding: '20px 24px' }}>
                        <TextInput
                            label="Document Title *"
                            placeholder="e.g. Road Transport Permit Jan 2026"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            error={errors.title}
                            required
                            styles={inputStyles}
                            mb="md"
                        />

                        <Group grow gap="md" mb="md">
                            <Select
                                label="Attach To *"
                                placeholder="Select type"
                                data={typeOptions}
                                value={data.documentable_type}
                                onChange={v => { setData('documentable_type', v ?? ''); setData('documentable_id', ''); }}
                                error={errors.documentable_type}
                                required
                                styles={{ ...inputStyles, dropdown: dropdownStyle }}
                            />
                            <Select
                                label="Select Record *"
                                placeholder={data.documentable_type ? 'Choose…' : 'Select type first'}
                                data={entityOptions()}
                                value={data.documentable_id ? String(data.documentable_id) : ''}
                                onChange={v => setData('documentable_id', v ?? '')}
                                error={errors.documentable_id}
                                required
                                searchable
                                disabled={!data.documentable_type}
                                styles={{ ...inputStyles, dropdown: dropdownStyle }}
                            />
                        </Group>

                        <FileInput
                            label="File *"
                            placeholder="Click to choose file (PDF, image, Word, Excel — max 20MB)"
                            accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
                            value={data.file}
                            onChange={f => setData('file', f)}
                            error={errors.file}
                            required
                            styles={{ ...inputStyles, wrapper: { marginBottom: 16 } }}
                            mb="md"
                        />

                        <Textarea
                            label="Notes"
                            placeholder="Optional notes about this document…"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            error={errors.notes}
                            styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                            rows={3}
                        />
                    </Box>
                </Box>

                <Group justify="flex-end" gap="md" mt={4}>
                    <Box
                        component={Link} href="/system/documents"
                        style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textSec, padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                    >
                        Cancel
                    </Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box
                            component="button" type="submit" disabled={processing}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, fontWeight: 700, boxShadow: '0 4px 16px rgba(234,88,12,0.4)', color: '#fff', cursor: processing ? 'not-allowed' : 'pointer', padding: '0 28px', fontSize: 14, opacity: processing ? 0.7 : 1 }}
                        >
                            {processing ? 'Uploading…' : 'Upload Document'}
                        </Box>
                    </motion.div>
                </Group>
            </Box>
        </DashboardLayout>
    );
}

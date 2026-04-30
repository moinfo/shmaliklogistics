import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, FileInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function CreateDocument({ trips, vehicles, drivers, prefill }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const { data, setData, post, processing, errors } = useForm({
        title:             '',
        documentable_type: prefill?.type ?? '',
        documentable_id:   prefill?.id ?? '',
        notes:             '',
        file:              null,
    });

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
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

            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>Upload Document</Text>
                        <Text size="sm" style={{ color: textSec }}>Attach a file to a trip, vehicle or driver</Text>
                    </Stack>
                    <Group gap="sm">
                        <Box component={Link} href="/system/documents" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            Cancel
                        </Box>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                                {processing ? 'Uploading…' : 'Upload Document'}
                            </Box>
                        </motion.div>
                    </Group>
                </Group>

                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px' }}>
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
                            styles={inputStyles}
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
                            styles={{ ...inputStyles, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
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
                        styles={inputStyles}
                        rows={3}
                    />
                </Box>
            </Box>
        </DashboardLayout>
    );
}

import { Head, useForm, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };
const FUEL_LEVELS = ['Empty', '1/4', '1/2', '3/4', 'Full'];

function StatusPicker({ value, onChange, options }) {
    return (
        <Group gap={4} wrap="nowrap">
            {Object.entries(options).map(([key, opt]) => {
                const active = value === key;
                return (
                    <button key={key} type="button" onClick={() => onChange(key)}
                        style={{
                            padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            border: `1px solid ${active ? opt.color : 'var(--c-border-color)'}`,
                            background: active ? `${opt.color}22` : 'transparent',
                            color: active ? opt.color : 'var(--c-text-secondary)',
                        }}>
                        {opt.label}
                    </button>
                );
            })}
        </Group>
    );
}

function ChecklistCard({ title, items, group, data, setItem, statusOptions, isDark, cardBorder, textPri, textSec }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 24px' }}>
            <Text fw={700} size="sm" style={{ color: textSec, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
            <Stack gap={10}>
                {Object.entries(items).map(([key, label]) => (
                    <Box key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.4fr) auto minmax(160px, 1fr)', gap: 12, alignItems: 'center', paddingBottom: 10, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}` }}>
                        <Text size="sm" style={{ color: textPri }}>{label}</Text>
                        <StatusPicker value={data[group][key]?.status} onChange={v => setItem(group, key, 'status', v)} options={statusOptions} />
                        <input
                            type="text" placeholder="Comments / remarks…"
                            value={data[group][key]?.remarks ?? ''}
                            onChange={e => setItem(group, key, 'remarks', e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}

export default function HandoverCreate({ vehicle, prefill, inspectionItems, documentationItems, statusOptions }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const initChecklist = (items) => Object.fromEntries(Object.keys(items).map(k => [k, { status: 'ok', remarks: '' }]));

    const { data, setData, post, processing, errors } = useForm({
        driver_name: prefill.driver_name ?? '',
        license_number: prefill.license_number ?? '',
        license_class: prefill.license_class ?? '',
        license_expiry: prefill.license_expiry ?? '',
        vehicle_registration: prefill.vehicle_registration ?? '',
        horse_trailer: '',
        odometer_km: prefill.odometer_km ?? '',
        fuel_level: '',
        route_destination: '',
        inspection: initChecklist(inspectionItems),
        documentation: initChecklist(documentationItems),
        handed_over_by: '',
        handed_over_date: '',
        received_by: prefill.driver_name ?? '',
        received_date: '',
        notes: '',
    });

    const setItem = (group, key, field, value) => setData(group, { ...data[group], [key]: { ...data[group][key], [field]: value } });

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };

    const submit = (e) => { e.preventDefault(); post(`/system/fleet/${vehicle.id}/handovers`); };

    return (
        <DashboardLayout title="Vehicle Handover Report">
            <Head title="Vehicle Handover Report" />
            <Box component="form" onSubmit={submit}>
                <Group justify="space-between" mb="xl" align="flex-start">
                    <Stack gap={2}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>Vehicle Handover Report</Text>
                        <Text size="sm" style={{ color: textSec }}>{vehicle.plate} — {vehicle.make} {vehicle.model_name}</Text>
                    </Stack>
                    <Group gap="sm">
                        <Box component={Link} href={`/system/fleet/${vehicle.id}`} style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                            Cancel
                        </Box>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                                {processing ? 'Saving…' : 'Save Handover Report'}
                            </Box>
                        </motion.div>
                    </Group>
                </Group>

                <Stack gap="lg">
                    {/* Header / trip info */}
                    <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 24px' }}>
                        <Text fw={700} size="sm" style={{ color: textSec, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Trip & Driver Information</Text>
                        <Group grow gap="md" mb="md">
                            <TextInput label="Driver's Full Name" value={data.driver_name} onChange={e => setData('driver_name', e.target.value)} error={errors.driver_name} styles={inputStyles} />
                            <TextInput label="License No. & Class" value={data.license_number} onChange={e => setData('license_number', e.target.value)} error={errors.license_number} styles={inputStyles} />
                        </Group>
                        <Group grow gap="md" mb="md">
                            <TextInput label="License Class" value={data.license_class} onChange={e => setData('license_class', e.target.value)} error={errors.license_class} styles={inputStyles} />
                            <DatePicker label="License Expiry" value={data.license_expiry} onChange={v => setData('license_expiry', v)} error={errors.license_expiry} styles={inputStyles} />
                        </Group>
                        <Group grow gap="md" mb="md">
                            <TextInput label="Vehicle Registration No." value={data.vehicle_registration} onChange={e => setData('vehicle_registration', e.target.value)} error={errors.vehicle_registration} styles={inputStyles} />
                            <TextInput label="Horse / Trailer" value={data.horse_trailer} onChange={e => setData('horse_trailer', e.target.value)} error={errors.horse_trailer} styles={inputStyles} />
                        </Group>
                        <Group grow gap="md" mb="md">
                            <NumberInput label="Odometer Reading (KM)" value={data.odometer_km} onChange={v => setData('odometer_km', v)} error={errors.odometer_km} min={0} hideControls styles={inputStyles} />
                            <Select label="Fuel Level" placeholder="Select level" data={FUEL_LEVELS} value={data.fuel_level} onChange={v => setData('fuel_level', v ?? '')} clearable styles={inputStyles} />
                        </Group>
                        <TextInput label="Route / Destination" value={data.route_destination} onChange={e => setData('route_destination', e.target.value)} error={errors.route_destination} styles={inputStyles} />
                    </Box>

                    <ChecklistCard title="Vehicle Inspection Checklist" items={inspectionItems} group="inspection" data={data} setItem={setItem} statusOptions={statusOptions} isDark={isDark} cardBorder={cardBorder} textPri={textPri} textSec={textSec} />
                    <ChecklistCard title="Documentation Checklist" items={documentationItems} group="documentation" data={data} setItem={setItem} statusOptions={statusOptions} isDark={isDark} cardBorder={cardBorder} textPri={textPri} textSec={textSec} />

                    {/* Declaration & signatures */}
                    <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 24px' }}>
                        <Text fw={700} size="sm" style={{ color: textSec, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Declaration & Signatures</Text>
                        <Text size="xs" style={{ color: textSec, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.5 }}>
                            The undersigned driver confirms the vehicle has been inspected and all listed documentation received, and agrees to operate
                            this vehicle safely, adhering strictly to road safety regulations, axle load limits, and speed governor restrictions.
                        </Text>
                        <Group grow gap="xl" align="flex-start">
                            <Stack gap="md">
                                <Text size="xs" fw={700} style={{ color: textPri }}>Handed Over By (Authorized Signatory)</Text>
                                <TextInput label="Name" value={data.handed_over_by} onChange={e => setData('handed_over_by', e.target.value)} error={errors.handed_over_by} styles={inputStyles} />
                                <DatePicker label="Date" value={data.handed_over_date} onChange={v => setData('handed_over_date', v)} error={errors.handed_over_date} styles={inputStyles} />
                            </Stack>
                            <Stack gap="md">
                                <Text size="xs" fw={700} style={{ color: textPri }}>Received By (Driver)</Text>
                                <TextInput label="Name" value={data.received_by} onChange={e => setData('received_by', e.target.value)} error={errors.received_by} styles={inputStyles} />
                                <DatePicker label="Date" value={data.received_date} onChange={v => setData('received_date', v)} error={errors.received_date} styles={inputStyles} />
                            </Stack>
                        </Group>
                        <Textarea label="Notes" mt="md" value={data.notes} onChange={e => setData('notes', e.target.value)} error={errors.notes} styles={inputStyles} rows={2} />
                    </Box>
                </Stack>
            </Box>
        </DashboardLayout>
    );
}

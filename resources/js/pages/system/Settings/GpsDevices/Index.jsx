import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Tooltip, ActionIcon, Modal, TextInput, Select, Switch, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)', cardHov: '#132436' };

const PROVIDERS = [{ value: 'teltonika', label: 'Teltonika (Codec 8 / 8E)' }];

const blank = { imei: '', vehicle_id: '', provider: 'teltonika', model: 'FMB130', sim_number: '', is_active: true };

function timeAgo(iso) {
    if (!iso) return 'Never connected';
    const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
}

export default function GpsDevicesIndex({ devices, vehicles, port }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const can = useCan();
    const canManage = can('settings.edit');

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const rowHov     = isDark ? dk.cardHov : '#F8FAFC';
    const flash      = props.flash ?? {};

    const [editing, setEditing] = useState(null);   // null = closed, 'new' or a device
    const form = useForm(blank);

    const open = (device) => {
        form.clearErrors();
        if (device === 'new') {
            form.setData(blank);
        } else {
            form.setData({
                imei: device.imei, vehicle_id: device.vehicle_id ? String(device.vehicle_id) : '',
                provider: device.provider, model: device.model ?? '', sim_number: device.sim_number ?? '', is_active: device.is_active,
            });
        }
        setEditing(device);
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => setEditing(null) };
        form.transform(d => ({ ...d, vehicle_id: d.vehicle_id || null }));
        editing === 'new'
            ? form.post('/system/settings/gps-devices', opts)
            : form.put(`/system/settings/gps-devices/${editing.id}`, opts);
    };

    const remove = (d) => {
        if (window.confirm(`Remove tracker ${d.imei}? Its stored location history will be deleted.`)) {
            router.delete(`/system/settings/gps-devices/${d.id}`, { preserveScroll: true });
        }
    };

    const vehicleOptions = vehicles.map(v => ({ value: String(v.id), label: `${v.plate}${v.make ? ` — ${v.make} ${v.model_name ?? ''}` : ''}` }));
    const cols = '1.2fr 1.2fr 0.9fr 1fr 1fr 90px 80px';

    return (
        <DashboardLayout title="Settings · GPS Devices">
            <Head title="GPS Devices" />

            {flash.success && (
                <Box style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </Box>
            )}

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>GPS Devices</Text>
                    <Text size="sm" style={{ color: textSec }}>Link each tracker's IMEI to a vehicle so its position appears on the Live Map</Text>
                </Stack>
                {canManage && (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" type="button" onClick={() => open('new')}
                            style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            ＋ Add Device
                        </Box>
                    </motion.div>
                )}
            </Group>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['IMEI', 'Vehicle', 'Model', 'SIM', 'Last contact', 'Active', ''].map((h, i) => (
                        <Text key={i} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {devices.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2rem', marginBottom: 10 }}>📡</Text>
                        <Text fw={600} style={{ color: textPri }}>No trackers registered</Text>
                        <Text size="sm" style={{ color: textMut, marginTop: 4 }}>Add the IMEI printed on the device label to get started</Text>
                    </Box>
                ) : devices.map(d => (
                    <Box key={d.id}
                        style={{ display: 'grid', gridTemplateColumns: cols, padding: '13px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = rowHov}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Text size="sm" fw={600} style={{ color: textPri, fontFamily: 'monospace' }}>{d.imei}</Text>
                        <Text size="sm" style={{ color: d.vehicle ? textPri : textMut }}>{d.vehicle ? d.vehicle.plate : 'Not linked'}</Text>
                        <Text size="sm" style={{ color: textSec }}>{d.model || '—'}</Text>
                        <Text size="sm" style={{ color: textSec }}>{d.sim_number || '—'}</Text>
                        <Text size="sm" style={{ color: d.last_ping ? textSec : textMut }}>{timeAgo(d.last_ping)}</Text>
                        <Box>
                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: d.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${d.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 20, padding: '3px 10px' }}>
                                <Box style={{ width: 5, height: 5, borderRadius: '50%', background: d.is_active ? '#22C55E' : '#EF4444' }} />
                                <Text size="xs" fw={600} style={{ color: d.is_active ? '#22C55E' : '#EF4444' }}>{d.is_active ? 'Yes' : 'No'}</Text>
                            </Box>
                        </Box>
                        <Group gap={4} justify="flex-end">
                            {canManage && <Tooltip label="Edit"><ActionIcon onClick={() => open(d)} variant="subtle" size="sm" style={{ color: textMut }}>✏️</ActionIcon></Tooltip>}
                            {canManage && <Tooltip label="Delete"><ActionIcon onClick={() => remove(d)} variant="subtle" size="sm" style={{ color: '#EF4444' }}>🗑️</ActionIcon></Tooltip>}
                        </Group>
                    </Box>
                ))}
            </Box>

            <Box mt="xl" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px' }}>
                <Text size="sm" fw={700} style={{ color: textPri, marginBottom: 6 }}>Device setup (Teltonika Configurator)</Text>
                <Text size="xs" style={{ color: textSec, lineHeight: 1.7 }}>
                    Under <b>System → GPRS</b> set the SIM's APN. Under <b>Data Acquisition → Server Settings</b> set the server's public domain or IP,
                    port <b>{port}</b>, protocol <b>TCP</b>, and codec <b>Codec 8 Extended</b>. The server runs <code>php artisan gps:listen --port={port}</code>.
                    A device whose IMEI is not listed here (or is inactive) is refused.
                </Text>
            </Box>

            <Modal opened={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add GPS device' : 'Edit GPS device'} centered>
                <form onSubmit={submit}>
                    <Stack gap="sm">
                        <TextInput label="IMEI" description="15 digits, printed on the device label" required value={form.data.imei}
                            onChange={e => form.setData('imei', e.target.value.replace(/\D/g, ''))} error={form.errors.imei} />
                        <Select label="Vehicle" placeholder="Not linked" searchable clearable data={vehicleOptions}
                            value={form.data.vehicle_id || null} onChange={v => form.setData('vehicle_id', v ?? '')} error={form.errors.vehicle_id} />
                        <Select label="Provider" data={PROVIDERS} allowDeselect={false} value={form.data.provider}
                            onChange={v => form.setData('provider', v)} error={form.errors.provider} />
                        <TextInput label="Model" value={form.data.model} onChange={e => form.setData('model', e.target.value)} error={form.errors.model} />
                        <TextInput label="SIM number" value={form.data.sim_number} onChange={e => form.setData('sim_number', e.target.value)} error={form.errors.sim_number} />
                        <Switch label="Active" checked={form.data.is_active} onChange={e => form.setData('is_active', e.currentTarget.checked)} />
                        <Group justify="flex-end" mt="sm">
                            <Button variant="default" onClick={() => setEditing(null)}>Cancel</Button>
                            <Button type="submit" loading={form.processing}>{editing === 'new' ? 'Add device' : 'Save'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </DashboardLayout>
    );
}

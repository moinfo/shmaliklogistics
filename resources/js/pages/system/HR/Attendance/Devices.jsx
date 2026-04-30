import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Modal, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function DeviceForm({ device, onClose, isDark, cardBorder }) {
    const isEdit = !!device;
    const { data, setData, post, put, processing, errors } = useForm({
        name:          device?.name ?? '',
        ip_address:    device?.ip_address ?? '',
        port:          device?.port ?? 4370,
        serial_number: device?.serial_number ?? '',
        location:      device?.location ?? '',
        model:         device?.model ?? '',
        is_active:     device?.is_active ?? true,
    });
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const inp = (label, key, placeholder = '', type = 'text') => (
        <Box mb="sm">
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box component="input" type={type} value={data[key]} onChange={e => setData(key, type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{errors[key]}</Text>}
        </Box>
    );

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/system/hr/attendance/devices/${device.id}`, { onSuccess: onClose });
        } else {
            post('/system/hr/attendance/devices', { onSuccess: onClose });
        }
    };

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Register'} ZKTeco Device</Text>
            {inp('Device Name *', 'name', 'e.g. Main Entrance')}
            <Group grow gap="md">{inp('IP Address *', 'ip_address', '192.168.1.100')}{inp('Port', 'port', '4370', 'number')}</Group>
            <Group grow gap="md">{inp('Location', 'location', 'e.g. Head Office')}{inp('Model', 'model', 'e.g. K40, F18, ZK100')}</Group>
            {inp('Serial Number', 'serial_number', 'Optional')}
            {isEdit && <Group gap={8} mb="md">
                <Box component="input" type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id="dev_active" />
                <Text component="label" htmlFor="dev_active" size="sm" style={{ color: textSec, cursor: 'pointer' }}>Active</Text>
            </Group>}
            <Box mb="md" style={{ padding: '10px 14px', background: isDark ? 'var(--c-border-row)' : '#EFF6FF', borderRadius: 8, border: '1px solid var(--c-border-input)' }}>
                <Text size="xs" style={{ color: '#3B82F6' }}>💡 ZKTeco devices communicate on TCP port 4370 by default. Ensure the device and server are on the same network or the port is reachable.</Text>
            </Box>
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : isEdit ? 'Update' : 'Register'}</Box>
            </Group>
        </Box>
    );
}

export default function AttendanceDevices({ devices }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [modal, setModal] = useState(null);
    const [syncing, setSyncing] = useState(null);

    const handleSync = (device) => {
        if (!confirm(`Sync attendance logs from "${device.name}" (${device.ip_address})?`)) return;
        setSyncing(device.id);
        router.post(`/system/hr/attendance/devices/${device.id}/sync`, {}, {
            onFinish: () => setSyncing(null),
        });
    };

    return (
        <DashboardLayout title="Attendance Devices">
            <Head title="Attendance Devices" />
            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false} size="lg" styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                {modal !== null && <DeviceForm device={modal === 'new' ? null : modal} onClose={() => setModal(null)} isDark={isDark} cardBorder={cardBorder} />}
            </Modal>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>ZKTeco Devices</Text>
                    <Text size="sm" style={{ color: textSec }}>Biometric attendance device registry — pull logs via TCP</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/attendance" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Attendance Logs</Box>
                    <Box component="button" onClick={() => setModal('new')} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Register Device</Box>
                </Group>
            </Group>

            {devices.length === 0 ? (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '60px', textAlign: 'center' }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>📡</Text>
                    <Text fw={700} size="lg" style={{ color: textPri, marginBottom: 6 }}>No devices registered</Text>
                    <Text size="sm" style={{ color: textSec }}>Register your ZKTeco biometric device to start pulling attendance logs.</Text>
                </Box>
            ) : (
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {devices.map(device => (
                        <Box key={device.id} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px' }}>
                            <Group justify="space-between" mb="md">
                                <Group gap={10}>
                                    <Text style={{ fontSize: 24 }}>📡</Text>
                                    <div>
                                        <Text fw={700} style={{ color: textPri }}>{device.name}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{device.location ?? 'No location set'}</Text>
                                    </div>
                                </Group>
                                <Badge size="sm" style={{ background: device.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)', color: device.is_active ? '#22C55E' : '#94A3B8', border: `1px solid ${device.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.3)'}` }}>{device.is_active ? 'Active' : 'Inactive'}</Badge>
                            </Group>

                            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                {[['IP Address', device.ip_address], ['Port', device.port], ['Model', device.model ?? '—'], ['Serial', device.serial_number ?? '—']].map(([label, value]) => (
                                    <Box key={label}>
                                        <Text size="xs" style={{ color: textSec }}>{label}</Text>
                                        <Text size="sm" fw={600} style={{ color: textPri, fontFamily: 'monospace' }}>{value}</Text>
                                    </Box>
                                ))}
                            </Box>

                            <Box style={{ padding: '10px 12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 8, marginBottom: 14 }}>
                                <Text size="xs" style={{ color: textSec }}>Last Sync: <span style={{ color: textPri }}>{device.last_sync_at ? new Date(device.last_sync_at).toLocaleString() : 'Never'}</span></Text>
                                {device.last_sync_at && <Text size="xs" style={{ color: textSec }}>Records Imported: <span style={{ color: '#3B82F6', fontWeight: 700 }}>{device.last_sync_count}</span></Text>}
                                <Text size="xs" style={{ color: textSec }}>Total Logs: <span style={{ color: textPri }}>{device.logs_count}</span></Text>
                            </Box>

                            <Group gap={8}>
                                <Box component="button" onClick={() => handleSync(device)} disabled={syncing === device.id || !device.is_active}
                                    style={{ flex: 1, padding: '8px', borderRadius: 8, background: syncing === device.id ? '#475569' : '#22C55E', color: '#fff', border: 'none', cursor: device.is_active ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 13 }}>
                                    {syncing === device.id ? '⟳ Syncing…' : '⟳ Sync Now'}
                                </Box>
                                <Box component="button" onClick={() => setModal(device)} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 12 }}>✏️</Box>
                                <Box component="button" onClick={() => { if (confirm('Remove this device?')) router.delete(`/system/hr/attendance/devices/${device.id}`, { preserveScroll: true }); }} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>🗑️</Box>
                            </Group>
                        </Box>
                    ))}
                </Box>
            )}
        </DashboardLayout>
    );
}

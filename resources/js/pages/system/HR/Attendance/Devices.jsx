import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Modal, Badge, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

function DeviceForm({ device, onClose, cardBg, cardBorder, textPri, textSec, inputBg, divider }) {
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

    const inp = (label, key, placeholder = '', type = 'text') => (
        <Box mb="sm">
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box
                component="input"
                type={type}
                value={data[key]}
                onChange={e => setData(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}`, background: inputBg, color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
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
            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 16 }}>{isEdit ? 'Edit' : 'Register'} ZKTeco Device</Text>
            {inp('Device Name *', 'name', 'e.g. Main Entrance')}
            <Group grow gap="md">{inp('IP Address *', 'ip_address', '192.168.1.100')}{inp('Port', 'port', '4370', 'number')}</Group>
            <Group grow gap="md">{inp('Location', 'location', 'e.g. Head Office')}{inp('Model', 'model', 'e.g. K40, F18, ZK100')}</Group>
            {inp('Serial Number', 'serial_number', 'Optional')}
            {isEdit && (
                <Group gap={8} mb="md">
                    <Box component="input" type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id="dev_active" />
                    <Text component="label" htmlFor="dev_active" size="sm" style={{ color: textSec, cursor: 'pointer' }}>Active</Text>
                </Group>
            )}
            <Box mb="md" style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)' }}>
                <Text size="xs" style={{ color: '#3B82F6' }}>💡 ZKTeco devices communicate on TCP port 4370 by default. Ensure the device and server are on the same network or the port is reachable.</Text>
            </Box>
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#C2410C,#EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(234,88,12,0.4)', opacity: processing ? 0.7 : 1 }}>
                    {processing ? 'Saving…' : isEdit ? 'Update' : 'Register'}
                </Box>
            </Group>
        </Box>
    );
}

export default function AttendanceDevices({ devices }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const [modal, setModal] = useState(null);
    const [syncing, setSyncing] = useState(null);
    const can = useCan();

    const formProps = { cardBg, cardBorder, textPri, textSec, inputBg, divider };

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

            <Modal
                opened={!!modal}
                onClose={() => setModal(null)}
                withCloseButton={false}
                size="lg"
                styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}` }, header: { background: cardBg } }}
            >
                {modal !== null && (
                    <DeviceForm device={modal === 'new' ? null : modal} onClose={() => setModal(null)} {...formProps} />
                )}
            </Modal>

            {/* Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18,
                    padding: '20px 28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                📡
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">ZKTeco Devices</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Biometric attendance device registry — pull logs via TCP</Text>
                            </Stack>
                        </Group>
                        <Group gap={8}>
                            <Box
                                component={Link}
                                href="/system/hr/attendance"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                            >
                                ← Attendance Logs
                            </Box>
                            {can('hr_attendance.create') && (
                                <Box
                                    component="button"
                                    onClick={() => setModal('new')}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    + Register Device
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {devices.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '60px', textAlign: 'center', boxShadow: cardShadow }}>
                        <Text style={{ fontSize: 40, marginBottom: 12 }}>📡</Text>
                        <Text fw={700} size="lg" style={{ color: textPri, marginBottom: 6 }}>No devices registered</Text>
                        <Text size="sm" style={{ color: textSec }}>Register your ZKTeco biometric device to start pulling attendance logs.</Text>
                    </Box>
                </motion.div>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {devices.map((device, i) => (
                        <motion.div key={device.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                                <Box style={{ height: 3, background: device.is_active ? 'linear-gradient(90deg, #059669, #22C55E)' : 'linear-gradient(90deg, #64748B, #94A3B8)' }} />
                                <Box style={{ padding: '20px' }}>
                                    <Group justify="space-between" mb="md">
                                        <Group gap={10}>
                                            <Box style={{ width: 38, height: 38, borderRadius: 10, background: device.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: '1.3rem' }}>📡</Text>
                                            </Box>
                                            <div>
                                                <Text fw={700} style={{ color: textPri }}>{device.name}</Text>
                                                <Text size="xs" style={{ color: textSec }}>{device.location ?? 'No location set'}</Text>
                                            </div>
                                        </Group>
                                        <Badge size="sm" style={{ background: device.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)', color: device.is_active ? '#22C55E' : textSec, border: `1px solid ${device.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.3)'}` }}>
                                            {device.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </Group>

                                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                        {[['IP Address', device.ip_address], ['Port', device.port], ['Model', device.model ?? '—'], ['Serial', device.serial_number ?? '—']].map(([label, value]) => (
                                            <Box key={label}>
                                                <Text size="xs" style={{ color: textSec }}>{label}</Text>
                                                <Text size="sm" fw={600} style={{ color: textPri, fontFamily: 'monospace' }}>{value}</Text>
                                            </Box>
                                        ))}
                                    </Box>

                                    <Box style={{ padding: '10px 12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 8, border: `1px solid ${cardBorder}`, marginBottom: 14 }}>
                                        <Text size="xs" style={{ color: textSec }}>Last Sync: <span style={{ color: textPri }}>{device.last_sync_at ? new Date(device.last_sync_at).toLocaleString() : 'Never'}</span></Text>
                                        {device.last_sync_at && <Text size="xs" style={{ color: textSec }}>Records Imported: <span style={{ color: '#3B82F6', fontWeight: 700 }}>{device.last_sync_count}</span></Text>}
                                        <Text size="xs" style={{ color: textSec }}>Total Logs: <span style={{ color: textPri }}>{device.logs_count}</span></Text>
                                    </Box>

                                    <Group gap={8}>
                                        {can('hr_attendance.create') && (
                                            <Box
                                                component="button"
                                                onClick={() => handleSync(device)}
                                                disabled={syncing === device.id || !device.is_active}
                                                style={{ flex: 1, padding: '8px', borderRadius: 8, background: syncing === device.id ? 'rgba(148,163,184,0.2)' : 'linear-gradient(135deg, #059669, #22C55E)', color: '#fff', border: 'none', cursor: device.is_active ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 13 }}
                                            >
                                                {syncing === device.id ? '⟳ Syncing…' : '⟳ Sync Now'}
                                            </Box>
                                        )}
                                        {can('hr_attendance.create') && (
                                            <Box component="button" onClick={() => setModal(device)} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 12 }}>✏️</Box>
                                        )}
                                        {can('hr_attendance.create') && (
                                            <Box component="button" onClick={() => { if (confirm('Remove this device?')) router.delete(`/system/hr/attendance/devices/${device.id}`, { preserveScroll: true }); }} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>🗑️</Box>
                                        )}
                                    </Group>
                                </Box>
                            </Box>
                        </motion.div>
                    ))}
                </SimpleGrid>
            )}
        </DashboardLayout>
    );
}

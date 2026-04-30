import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

function DataRow({ label, value, isDark }) {
    const d = isDark ? dk : { textSec: '#64748B', textPri: '#1E293B', divider: '#E2E8F0' };
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${d.divider}` }}>
            <Text size="sm" style={{ color: d.textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: d.textPri }}>{value ?? '—'}</Text>
        </Box>
    );
}

function DocRow({ label, date, isDark }) {
    const d = isDark ? dk : { textSec: '#64748B', textPri: '#1E293B', divider: '#E2E8F0' };
    let display = '—'; let color = d.textPri;
    if (date) {
        const days = Math.floor((new Date(date) - new Date()) / 86400000);
        display = new Date(date).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' });
        if (days < 0)        { display += ' (EXPIRED)';       color = '#EF4444'; }
        else if (days <= 30) { display += ` (${days}d left)`; color = '#F59E0B'; }
        else                 { color = '#22C55E'; }
    }
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${d.divider}` }}>
            <Text size="sm" style={{ color: d.textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color }}>{display}</Text>
        </Box>
    );
}

function Card({ title, children, isDark, accent }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function Avatar({ name, size = 56 }) {
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(33,150,243,0.4)' }}>
            <Text c="white" fw={900} size="lg">{initials}</Text>
        </Box>
    );
}

export default function ShowDriver({ driver, trips, statuses, licenseClasses, availableVehicles, vehicleStatuses, vehicleTypeIcons }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const [assignVehicleId, setAssignVehicleId] = useState(driver.vehicle?.id ? String(driver.vehicle.id) : null);

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const meta  = statuses[driver.status] ?? { label: driver.status, color: '#94A3B8' };
    const flash = props.flash ?? {};

    const vehicle = driver.vehicle;
    const vMeta   = vehicle ? (vehicleStatuses?.[vehicle.status] ?? { label: vehicle.status, color: '#94A3B8' }) : null;
    const vIcon   = vehicle ? (vehicleTypeIcons?.[vehicle.type] ?? '🚗') : null;

    const confirmDelete = () => {
        if (window.confirm(`Remove ${driver.name} from the system?`)) {
            router.delete(`/system/drivers/${driver.id}`);
        }
    };

    const doAssignVehicle = () => {
        router.patch(`/system/drivers/${driver.id}/vehicle`, { vehicle_id: assignVehicleId ?? null });
    };

    return (
        <DashboardLayout title={driver.name}>
            <Head title={driver.name} />

            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* Header */}
            <Group justify="space-between" mb="xl" align="flex-start" wrap="wrap" gap="md">
                <Group gap="md">
                    <Avatar name={driver.name} />
                    <Stack gap={4}>
                        <Group gap="sm">
                            <Text fw={800} size="xl" style={{ color: textPri }}>{driver.name}</Text>
                            <Box style={{ background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '4px 12px' }}>
                                <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                            </Box>
                        </Group>
                        <Text size="sm" style={{ color: textSec }}>{driver.phone}</Text>
                    </Stack>
                </Group>
                <Group gap="sm" wrap="wrap">
                    <Select
                        value={driver.status}
                        onChange={s => router.patch(`/system/drivers/${driver.id}/status`, { status: s })}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        size="sm"
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8, width: 150 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                    />
                    <Box component={Link} href={`/system/drivers/${driver.id}/edit`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                        ✏️ Edit
                    </Box>
                    <Tooltip label="Remove driver">
                        <ActionIcon onClick={confirmDelete} size={36} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444' }}>🗑️</ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <Card title="Personal Details" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                    <DataRow label="Full Name"   value={driver.name}        isDark={isDark} />
                    <DataRow label="Phone"       value={driver.phone}       isDark={isDark} />
                    <DataRow label="Alt. Phone"  value={driver.phone_alt}   isDark={isDark} />
                    <DataRow label="Email"       value={driver.email}       isDark={isDark} />
                    <DataRow label="National ID" value={driver.national_id} isDark={isDark} />
                    <DataRow label="Address"     value={driver.address}     isDark={isDark} />
                </Card>

                <Card title="Licence & Emergency" isDark={isDark} accent={['#065F46', '#059669']}>
                    <DataRow label="Licence #"      value={driver.license_number}         isDark={isDark} />
                    <DocRow  label="Licence Expiry" date={driver.license_expiry}          isDark={isDark} />

                    {/* Licence class badges */}
                    <Box style={{ padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
                        <Text size="sm" style={{ color: textSec, marginBottom: (driver.license_classes ?? []).length > 0 ? 6 : 0 }}>Licence Classes</Text>
                        {(driver.license_classes ?? []).length === 0 ? (
                            <Text size="sm" fw={600} style={{ color: textPri }}>—</Text>
                        ) : (
                            <Group gap={6} wrap="wrap">
                                {(driver.license_classes ?? []).map(code => (
                                    <Tooltip key={code} label={licenseClasses?.[code] ?? code} withArrow position="top">
                                        <Box style={{ background: 'rgba(33,150,243,0.12)', border: '1px solid rgba(33,150,243,0.3)', borderRadius: 6, padding: '3px 10px', color: '#60A5FA', fontWeight: 800, fontSize: 13, cursor: 'default' }}>
                                            {code}
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Group>
                        )}
                    </Box>

                    <DataRow label="Emergency Name"  value={driver.emergency_contact_name}  isDark={isDark} />
                    <DataRow label="Emergency Phone" value={driver.emergency_contact_phone} isDark={isDark} />
                </Card>
            </SimpleGrid>

            {/* Assigned Vehicle */}
            <Box mb="md">
                <Card title="Assigned Vehicle" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                    {vehicle ? (
                        <Group gap="md" align="center" style={{ padding: '10px 0 14px', borderBottom: `1px solid ${divider}` }}>
                            <Box style={{ fontSize: '1.8rem', lineHeight: 1 }}>{vIcon}</Box>
                            <Stack gap={3} style={{ flex: 1 }}>
                                <Group gap="sm">
                                    <Text fw={900} style={{ color: textPri, fontFamily: 'monospace', letterSpacing: 2, fontSize: 15 }}>{vehicle.plate}</Text>
                                    <Box style={{ background: vMeta.color + '1A', border: `1px solid ${vMeta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
                                        <Text size="xs" fw={700} style={{ color: vMeta.color }}>{vMeta.label}</Text>
                                    </Box>
                                </Group>
                                <Text size="sm" style={{ color: textSec }}>{vehicle.make} {vehicle.model_name} · {vehicle.type}</Text>
                            </Stack>
                            <Box component={Link} href={`/system/fleet/${vehicle.id}`} style={{ padding: '7px 14px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                View →
                            </Box>
                        </Group>
                    ) : (
                        <Text size="sm" style={{ color: textMut, paddingTop: 10, paddingBottom: 4 }}>No vehicle currently assigned.</Text>
                    )}

                    <Group align="flex-end" gap="sm" mt="md">
                        <Box style={{ flex: 1 }}>
                            <Select
                                label={vehicle ? 'Change Vehicle' : 'Assign Vehicle'}
                                placeholder="Select a vehicle…"
                                value={assignVehicleId}
                                onChange={v => setAssignVehicleId(v)}
                                clearable
                                data={availableVehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }))}
                                styles={{
                                    label:    { color: textSec, fontSize: 13, marginBottom: 4 },
                                    input:    { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
                                    dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
                                }}
                            />
                        </Box>
                        <motion.div whileTap={{ scale: 0.97 }}>
                            <Box component="button" type="button" onClick={doAssignVehicle} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(33,150,243,0.25)', marginBottom: 1 }}>
                                {vehicle ? 'Reassign' : 'Assign'}
                            </Box>
                        </motion.div>
                    </Group>
                </Card>
            </Box>

            {/* Trip history */}
            <Card title={`Recent Trips by ${driver.name}`} isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                {trips.length === 0 ? (
                    <Text size="sm" style={{ color: textMut, padding: '16px 0' }}>No trips recorded for this driver yet.</Text>
                ) : (
                    <Box>
                        <Box style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px', borderBottom: `1px solid ${divider}`, padding: '8px 0' }}>
                            {['Trip #', 'Route', 'Date', 'Status'].map(h => (
                                <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                            ))}
                        </Box>
                        {trips.map(t => (
                            <Box key={t.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px', padding: '10px 0', borderBottom: `1px solid ${divider}`, cursor: 'pointer' }} onClick={() => router.visit(`/system/trips/${t.id}`)}>
                                <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{t.trip_number}</Text>
                                <Text size="sm" style={{ color: textPri }}>{t.route_from} → {t.route_to}</Text>
                                <Text size="sm" style={{ color: textSec }}>{t.departure_date}</Text>
                                <Text size="sm" style={{ color: textSec }}>{t.status}</Text>
                            </Box>
                        ))}
                    </Box>
                )}
            </Card>

            {driver.notes && (
                <Box mt="md">
                    <Card title="Notes" isDark={isDark}>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{driver.notes}</Text>
                    </Card>
                </Box>
            )}

            <Box mt="xl">
                <Box component={Link} href="/system/drivers" style={{ color: textMut, textDecoration: 'none', fontSize: 13 }}>← Back to Drivers</Box>
            </Box>
        </DashboardLayout>
    );
}

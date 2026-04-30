import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: '#94A3B8' };

const STATUS_FLOW = ['registered', 'loaded', 'in_transit', 'at_border', 'cleared', 'delivered'];
const fmtW = kg => kg >= 1000 ? `${(kg / 1000).toFixed(2)} t` : `${Number(kg).toFixed(0)} kg`;
const fmt  = n  => n ? new Intl.NumberFormat('en-TZ').format(Number(n)) : '—';

export default function ShowCargo({ cargo, statusLogs = [], statuses, types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider    = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const [updating, setUpdating]         = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [logNotes, setLogNotes]          = useState('');
    const [logLocation, setLogLocation]    = useState('');

    const st  = statuses[cargo.status] ?? { label: cargo.status, color: '#64748B' };
    const tp  = types[cargo.type]     ?? { label: cargo.type,   color: '#64748B' };
    const idx = STATUS_FLOW.indexOf(cargo.status);

    const handleStatusChange = (newStatus) => {
        setUpdating(true);
        router.patch(`/system/cargo/${cargo.id}/status`, { status: newStatus, location: logLocation, notes: logNotes }, {
            onFinish: () => { setUpdating(false); setLogNotes(''); setLogLocation(''); },
        });
    };

    const handleDelete = () => {
        router.delete(`/system/cargo/${cargo.id}`);
    };

    const field = (label, value) => (
        <Box>
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 2 }}>{label}</Text>
            <Text size="sm" style={{ color: textPri }}>{value || '—'}</Text>
        </Box>
    );

    return (
        <DashboardLayout title="Cargo Detail">
            <Head title={cargo.cargo_number} />

            {/* Header */}
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={4}>
                    <Group gap="md" align="center">
                        <Text fw={800} size="xl" style={{ color: textPri, fontFamily: 'monospace' }}>{cargo.cargo_number}</Text>
                        <Box style={{ background: st.color + '22', border: `1px solid ${st.color}44`, borderRadius: 20, padding: '4px 14px' }}>
                            <Text size="xs" fw={700} style={{ color: st.color, textTransform: 'uppercase', letterSpacing: 0.6 }}>{st.label}</Text>
                        </Box>
                        <Box style={{ background: tp.color + '22', border: `1px solid ${tp.color}44`, borderRadius: 20, padding: '4px 14px' }}>
                            <Text size="xs" fw={700} style={{ color: tp.color }}>{tp.label}</Text>
                        </Box>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{cargo.description}</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href={`/system/cargo/${cargo.id}/edit`}
                        style={{ padding: '9px 20px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                        ✏️ Edit
                    </Box>
                    <Box component={Link} href="/system/cargo"
                        style={{ padding: '9px 20px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                        ← Back
                    </Box>
                </Group>
            </Group>

            {/* Status tracker */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 16 }}>Shipment Progress</Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
                    {STATUS_FLOW.map((s, i) => {
                        const sd    = statuses[s] ?? { label: s, color: '#64748B' };
                        const done  = i <= idx;
                        const cur   = i === idx;
                        return (
                            <Box key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_FLOW.length - 1 ? 1 : 0 }}>
                                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 72 }}>
                                    <Box
                                        onClick={() => !updating && handleStatusChange(s)}
                                        style={{ width: cur ? 36 : 28, height: cur ? 36 : 28, borderRadius: '50%', background: done ? sd.color : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'), border: cur ? `3px solid ${sd.color}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: cur ? `0 0 12px ${sd.color}66` : 'none' }}>
                                        <Text style={{ fontSize: done ? 14 : 10, color: done ? '#fff' : (isDark ? '#475569' : '#94A3B8') }}>{done ? '✓' : ''}</Text>
                                    </Box>
                                    <Text size="10px" fw={cur ? 700 : 500} style={{ color: done ? sd.color : (isDark ? '#475569' : '#94A3B8'), textAlign: 'center', whiteSpace: 'nowrap' }}>{sd.label}</Text>
                                </Box>
                                {i < STATUS_FLOW.length - 1 && (
                                    <Box style={{ flex: 1, height: 2, background: i < idx ? '#3B82F6' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'), margin: '0 4px', marginBottom: 20 }} />
                                )}
                            </Box>
                        );
                    })}
                </Box>
                {cargo.status === 'cancelled' && (
                    <Text size="xs" style={{ color: '#EF4444', marginTop: 8 }}>This cargo has been cancelled.</Text>
                )}
                <Group gap="md" mt="md" wrap="wrap">
                    <Box style={{ flex: 1, minWidth: 160 }}>
                        <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Location (optional)</Text>
                        <input value={logLocation} onChange={e => setLogLocation(e.target.value)} placeholder="e.g. Dar es Salaam Port"
                            style={{ width: '100%', padding: '7px 10px', background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 7, color: textPri, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                    </Box>
                    <Box style={{ flex: 2, minWidth: 200 }}>
                        <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Note (optional)</Text>
                        <input value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder="Add a note for this update…"
                            style={{ width: '100%', padding: '7px 10px', background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 7, color: textPri, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                    </Box>
                </Group>
            </Box>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {/* Cargo Details */}
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24 }}>
                    <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 16 }}>Cargo Details</Text>
                    <SimpleGrid cols={2} spacing="md">
                        {field('Weight', fmtW(cargo.weight_kg))}
                        {field('Pieces', cargo.pieces)}
                        {field('Volume', cargo.volume_m3 ? `${cargo.volume_m3} m³` : null)}
                        {field('Packing', cargo.packing_type)}
                        {field('Origin', cargo.origin)}
                        {field('Destination', cargo.destination)}
                        {field('Consignee', cargo.consignee_name)}
                        {field('Contact', cargo.consignee_contact)}
                        {field('Declared Value', cargo.declared_value ? `${cargo.currency} ${fmt(cargo.declared_value)}` : null)}
                    </SimpleGrid>
                    {cargo.special_instructions && (
                        <Box mt="md" style={{ padding: '12px 14px', background: isDark ? 'rgba(245,158,11,0.08)' : '#FFFBEB', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)' }}>
                            <Text size="xs" fw={700} style={{ color: '#F59E0B', marginBottom: 4 }}>⚠️ Special Instructions</Text>
                            <Text size="sm" style={{ color: textSec }}>{cargo.special_instructions}</Text>
                        </Box>
                    )}
                </Box>

                {/* Linked Records */}
                <Stack gap="md">
                    {/* Linked Trip */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24 }}>
                        <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 12 }}>Linked Trip</Text>
                        {cargo.trip ? (
                            <Box>
                                <Group justify="space-between" mb={8}>
                                    <Text size="sm" fw={700} style={{ color: '#60A5FA', fontFamily: 'monospace' }}>{cargo.trip.trip_number}</Text>
                                    <Box style={{ background: '#3B82F622', border: '1px solid #3B82F644', borderRadius: 20, padding: '2px 10px' }}>
                                        <Text size="11px" fw={700} style={{ color: '#3B82F6', textTransform: 'uppercase' }}>{cargo.trip.status?.replace(/_/g, ' ')}</Text>
                                    </Box>
                                </Group>
                                <Text size="sm" style={{ color: textSec }}>{cargo.trip.route_from} → {cargo.trip.route_to}</Text>
                                <Text size="xs" style={{ color: textSec, marginTop: 4 }}>{cargo.trip.driver_name} · {cargo.trip.vehicle_plate}</Text>
                                <Box component={Link} href={`/system/trips/${cargo.trip.id}`}
                                    style={{ display: 'inline-block', marginTop: 10, padding: '6px 14px', borderRadius: 6, background: isDark ? 'var(--c-border-strong)' : '#EFF6FF', color: '#3B82F6', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                                    View Trip →
                                </Box>
                            </Box>
                        ) : (
                            <Text size="sm" style={{ color: textSec }}>No trip linked. <Box component={Link} href={`/system/cargo/${cargo.id}/edit`} style={{ color: '#3B82F6', textDecoration: 'none' }}>Assign one →</Box></Text>
                        )}
                    </Box>

                    {/* Linked Client */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24 }}>
                        <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 12 }}>Client</Text>
                        {cargo.client ? (
                            <Box>
                                <Text size="sm" fw={700} style={{ color: textPri }}>{cargo.client.company_name || cargo.client.name}</Text>
                                {cargo.client.phone && <Text size="xs" style={{ color: textSec, marginTop: 4 }}>📞 {cargo.client.phone}</Text>}
                                {cargo.client.email && <Text size="xs" style={{ color: textSec }}>✉️ {cargo.client.email}</Text>}
                            </Box>
                        ) : (
                            <Text size="sm" style={{ color: textSec }}>No client linked.</Text>
                        )}
                    </Box>

                    {/* Notes */}
                    {cargo.notes && (
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 24 }}>
                            <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 8 }}>Notes</Text>
                            <Text size="sm" style={{ color: textSec }}>{cargo.notes}</Text>
                        </Box>
                    )}

                    {/* Danger zone */}
                    <Box style={{ border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: 20 }}>
                        <Text fw={700} size="sm" style={{ color: '#EF4444', marginBottom: 8 }}>Danger Zone</Text>
                        {confirmDelete ? (
                            <Group gap="sm">
                                <Text size="sm" style={{ color: textSec }}>Delete this cargo record?</Text>
                                <Box component="button" onClick={handleDelete}
                                    style={{ padding: '6px 14px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                    Yes, delete
                                </Box>
                                <Box component="button" onClick={() => setConfirmDelete(false)}
                                    style={{ padding: '6px 14px', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                    Cancel
                                </Box>
                            </Group>
                        ) : (
                            <Box component="button" onClick={() => setConfirmDelete(true)}
                                style={{ padding: '7px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                Delete Cargo Record
                            </Box>
                        )}
                    </Box>
                </Stack>
            </SimpleGrid>

            {/* Status Timeline */}
            {statusLogs.length > 0 && (
                <Box mt="xl" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Text fw={700} size="sm" style={{ color: textPri }}>📍 Status Timeline</Text>
                    </Box>
                    <Box style={{ padding: '20px', position: 'relative' }}>
                        {statusLogs.map((log, i) => {
                            const s  = statuses[log.status] ?? { label: log.status, color: '#64748B' };
                            const dt = new Date(log.created_at);
                            return (
                                <Box key={log.id} style={{ display: 'flex', gap: 14, marginBottom: i < statusLogs.length - 1 ? 20 : 0 }}>
                                    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                                        <Box style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, border: `2px solid ${s.color}66`, marginTop: 3, flexShrink: 0 }} />
                                        {i < statusLogs.length - 1 && (
                                            <Box style={{ width: 2, flex: 1, background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', marginTop: 4 }} />
                                        )}
                                    </Box>
                                    <Box style={{ flex: 1, paddingBottom: i < statusLogs.length - 1 ? 4 : 0 }}>
                                        <Group gap="sm" wrap="wrap">
                                            <Box style={{ background: s.color + '18', border: `1px solid ${s.color}35`, borderRadius: 20, padding: '2px 10px' }}>
                                                <Text size="xs" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                            </Box>
                                            {log.location && (
                                                <Text size="xs" style={{ color: textSec }}>📍 {log.location}</Text>
                                            )}
                                            <Text size="xs" style={{ color: isDark ? '#475569' : '#94A3B8', marginLeft: 'auto' }}>
                                                {dt.toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' })} {dt.toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </Group>
                                        {log.notes && (
                                            <Text size="xs" style={{ color: textSec, marginTop: 4 }}>{log.notes}</Text>
                                        )}
                                        {log.user && (
                                            <Text size="xs" style={{ color: isDark ? '#334155' : '#CBD5E1', marginTop: 2 }}>by {log.user.name}</Text>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </DashboardLayout>
    );
}

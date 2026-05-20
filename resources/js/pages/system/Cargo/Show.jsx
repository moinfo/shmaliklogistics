import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';

const STATUS_FLOW = ['registered', 'loaded', 'in_transit', 'at_border', 'cleared', 'delivered'];
const fmtW = kg => kg >= 1000 ? `${(kg / 1000).toFixed(2)} t` : `${Number(kg).toFixed(0)} kg`;
const fmt  = n  => n ? new Intl.NumberFormat('en-TZ').format(Number(n)) : '—';

function InfoRow({ icon, label, value, isDark, mono }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8} style={{ minWidth: 0 }}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right', wordBreak: 'break-all' }}>{value ?? '—'}</Text>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent, toolbar }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

export default function ShowCargo({ cargo, statusLogs = [], statuses, types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const [updating, setUpdating]           = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [logNotes, setLogNotes]           = useState('');
    const [logLocation, setLogLocation]     = useState('');
    const can = useCan();

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

    return (
        <DashboardLayout title="Cargo Detail">
            <Head title={cargo.cargo_number} />

            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={6}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</Box>
                                <Stack gap={2}>
                                    <Group gap={10} align="center">
                                        <Text fw={900} size="xl" c="white" style={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>{cargo.cargo_number}</Text>
                                        <Box style={{ background: st.color + '30', border: `1px solid ${st.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                            <Group gap={5} align="center">
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
                                                <Text size="xs" fw={700} style={{ color: '#fff' }}>{st.label}</Text>
                                            </Group>
                                        </Box>
                                        <Box style={{ background: tp.color + '30', border: `1px solid ${tp.color}60`, borderRadius: 20, padding: '3px 12px' }}>
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{tp.label}</Text>
                                        </Box>
                                    </Group>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{cargo.description}</Text>
                                </Stack>
                            </Group>
                        </Stack>
                        <Group gap={8} wrap="wrap">
                            {can('cargo.edit') && (
                                <Box component={Link} href={`/system/cargo/${cargo.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Shipment Progress */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Box mb="md" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #EA580C, #F97316)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text size="md">🚢</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Shipment Progress</Text>
                        </Group>
                    </Box>
                    <Box style={{ padding: '20px' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
                            {STATUS_FLOW.map((s, i) => {
                                const sd   = statuses[s] ?? { label: s, color: '#64748B' };
                                const done = i <= idx;
                                const cur  = i === idx;
                                return (
                                    <Box key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_FLOW.length - 1 ? 1 : 0 }}>
                                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 72 }}>
                                            <Box
                                                onClick={() => can('cargo.edit') && !updating && handleStatusChange(s)}
                                                style={{ width: cur ? 36 : 28, height: cur ? 36 : 28, borderRadius: '50%', background: done ? sd.color : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'), border: cur ? `3px solid ${sd.color}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: can('cargo.edit') ? 'pointer' : 'default', transition: 'all 0.2s', boxShadow: cur ? `0 0 12px ${sd.color}66` : 'none' }}>
                                                <Text style={{ fontSize: done ? 14 : 10, color: done ? '#fff' : (isDark ? textMut : textSec) }}>{done ? '✓' : ''}</Text>
                                            </Box>
                                            <Text size="10px" fw={cur ? 700 : 500} style={{ color: done ? sd.color : textMut, textAlign: 'center', whiteSpace: 'nowrap' }}>{sd.label}</Text>
                                        </Box>
                                        {i < STATUS_FLOW.length - 1 && (
                                            <Box style={{ flex: 1, height: 2, background: i < idx ? '#EA580C' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'), margin: '0 4px', marginBottom: 20 }} />
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                        {cargo.status === 'cancelled' && (
                            <Text size="xs" style={{ color: '#EF4444', marginTop: 8 }}>This cargo has been cancelled.</Text>
                        )}
                        {can('cargo.edit') && (
                            <Group gap="md" mt="md" wrap="wrap">
                                <Box style={{ flex: 1, minWidth: 160 }}>
                                    <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Location (optional)</Text>
                                    <input value={logLocation} onChange={e => setLogLocation(e.target.value)} placeholder="e.g. Dar es Salaam Port"
                                        style={{ width: '100%', padding: '7px 10px', background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, color: textPri, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                                </Box>
                                <Box style={{ flex: 2, minWidth: 200 }}>
                                    <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Note (optional)</Text>
                                    <input value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder="Add a note for this update…"
                                        style={{ width: '100%', padding: '7px 10px', background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, color: textPri, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                                </Box>
                            </Group>
                        )}
                    </Box>
                </Box>
            </motion.div>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                {/* Cargo Details */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Cargo Details" icon="📋" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow icon="⚖️" label="Weight"       value={fmtW(cargo.weight_kg)}  isDark={isDark} />
                        <InfoRow icon="📦" label="Pieces"       value={cargo.pieces}            isDark={isDark} />
                        <InfoRow icon="📐" label="Volume"       value={cargo.volume_m3 ? `${cargo.volume_m3} m³` : null} isDark={isDark} />
                        <InfoRow icon="🗃️" label="Packing"      value={cargo.packing_type}      isDark={isDark} />
                        <InfoRow icon="📍" label="Origin"       value={cargo.origin}            isDark={isDark} />
                        <InfoRow icon="🏁" label="Destination"  value={cargo.destination}       isDark={isDark} />
                        <InfoRow icon="🏢" label="Consignee"    value={cargo.consignee_name}    isDark={isDark} />
                        <InfoRow icon="📞" label="Contact"      value={cargo.consignee_contact} isDark={isDark} />
                        <InfoRow icon="💰" label="Declared Value" value={cargo.declared_value ? `${cargo.currency} ${fmt(cargo.declared_value)}` : null} isDark={isDark} />
                        {cargo.special_instructions && (
                            <Box mt={12} style={{ padding: '12px 14px', background: isDark ? 'rgba(245,158,11,0.08)' : '#FFFBEB', borderRadius: 10, border: '1px solid rgba(245,158,11,0.25)' }}>
                                <Text size="xs" fw={700} style={{ color: '#F59E0B', marginBottom: 4 }}>⚠️ Special Instructions</Text>
                                <Text size="sm" style={{ color: textSec }}>{cargo.special_instructions}</Text>
                            </Box>
                        )}
                    </SectionCard>
                </motion.div>

                <Stack gap="md">
                    {/* Linked Trip */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <SectionCard title="Linked Trip" icon="🚛" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                            {cargo.trip ? (
                                <Box pt={8}>
                                    <Group justify="space-between" mb={8}>
                                        <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(96,165,250,0.12)' : '#EFF6FF', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 8, padding: '4px 12px' }}>
                                            <Text size="sm" fw={800} style={{ color: '#60A5FA', fontFamily: 'monospace' }}>{cargo.trip.trip_number}</Text>
                                        </Box>
                                        <Box style={{ background: '#3B82F618', border: '1px solid #3B82F635', borderRadius: 20, padding: '3px 10px' }}>
                                            <Text size="11px" fw={700} style={{ color: '#3B82F6', textTransform: 'uppercase' }}>{cargo.trip.status?.replace(/_/g, ' ')}</Text>
                                        </Box>
                                    </Group>
                                    <Text size="sm" style={{ color: textSec }}>{cargo.trip.route_from} → {cargo.trip.route_to}</Text>
                                    <Text size="xs" style={{ color: textMut, marginTop: 4 }}>{cargo.trip.driver_name} · {cargo.trip.vehicle_plate}</Text>
                                    <Box component={Link} href={`/system/trips/${cargo.trip.id}`}
                                        style={{ display: 'inline-flex', marginTop: 12, padding: '6px 14px', borderRadius: 8, background: isDark ? 'rgba(96,165,250,0.1)' : '#EFF6FF', color: '#60A5FA', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                                        View Trip →
                                    </Box>
                                </Box>
                            ) : (
                                <Box pt={8}>
                                    <Text size="sm" style={{ color: textSec }}>No trip linked. <Box component={Link} href={`/system/cargo/${cargo.id}/edit`} style={{ color: '#EA580C', textDecoration: 'none' }}>Assign one →</Box></Text>
                                </Box>
                            )}
                        </SectionCard>
                    </motion.div>

                    {/* Linked Client */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <SectionCard title="Client" icon="🏢" isDark={isDark} accent={['#5B21B6', '#7C3AED']}>
                            {cargo.client ? (
                                <Box pt={8}>
                                    <Text size="sm" fw={700} style={{ color: textPri }}>{cargo.client.company_name || cargo.client.name}</Text>
                                    {cargo.client.phone && <Text size="xs" style={{ color: textSec, marginTop: 4 }}>📞 {cargo.client.phone}</Text>}
                                    {cargo.client.email && <Text size="xs" style={{ color: textSec }}>✉️ {cargo.client.email}</Text>}
                                </Box>
                            ) : (
                                <Box pt={8}><Text size="sm" style={{ color: textSec }}>No client linked.</Text></Box>
                            )}
                        </SectionCard>
                    </motion.div>

                    {/* Notes */}
                    {cargo.notes && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <SectionCard title="Notes" icon="📝" isDark={isDark} accent={['#0D9488', '#14B8A6']}>
                                <Box pt={8}><Text size="sm" style={{ color: textSec }}>{cargo.notes}</Text></Box>
                            </SectionCard>
                        </motion.div>
                    )}

                    {/* Danger zone */}
                    {can('cargo.delete') && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                            <Box style={{ background: cardBg, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                                <Box style={{ height: 3, background: 'linear-gradient(90deg, #7F1D1D, #EF4444)' }} />
                                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                                    <Group gap={8}><Text size="md">⚠️</Text><Text fw={700} size="sm" style={{ color: '#EF4444' }}>Danger Zone</Text></Group>
                                </Box>
                                <Box style={{ padding: '16px 20px' }}>
                                    {confirmDelete ? (
                                        <Group gap="sm">
                                            <Text size="sm" style={{ color: textSec }}>Delete this cargo record?</Text>
                                            <Box component="button" onClick={handleDelete}
                                                style={{ padding: '6px 14px', borderRadius: 8, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                                Yes, delete
                                            </Box>
                                            <Box component="button" onClick={() => setConfirmDelete(false)}
                                                style={{ padding: '6px 14px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                                Cancel
                                            </Box>
                                        </Group>
                                    ) : (
                                        <Box component="button" onClick={() => setConfirmDelete(true)}
                                            style={{ padding: '7px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                            Delete Cargo Record
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </motion.div>
                    )}
                </Stack>
            </SimpleGrid>

            {/* Status Timeline */}
            {statusLogs.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #0369A1, #0EA5E9)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}>
                                <Text size="md">📍</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Status Timeline</Text>
                            </Group>
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
                                                <Text size="xs" style={{ color: textMut, marginLeft: 'auto' }}>
                                                    {dt.toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' })} {dt.toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </Group>
                                            {log.notes && <Text size="xs" style={{ color: textSec, marginTop: 4 }}>{log.notes}</Text>}
                                            {log.user && <Text size="xs" style={{ color: textMut, marginTop: 2 }}>by {log.user.name}</Text>}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </motion.div>
            )}

            <Box mt="xl">
                <Box component={Link} href="/system/cargo"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Cargo
                </Box>
            </Box>
        </DashboardLayout>
    );
}

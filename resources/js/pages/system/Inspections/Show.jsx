import { Box, Text, Group, Stack, Grid, SimpleGrid } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const itemColors = { ok: '#22C55E', issue: '#EF4444', na: '#64748B' };
const itemLabels = { ok: 'OK', issue: 'ISSUE', na: 'N/A' };

function InfoRow({ label, value, color, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Text size="xs" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: color ?? textPri, textAlign: 'right' }}>{value ?? '—'}</Text>
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

export default function AdminInspectionShow({ inspection, checklist, statuses, types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    const s     = statuses[inspection.overall_status] ?? { label: inspection.overall_status, color: '#94A3B8' };
    const t     = types[inspection.inspection_type]   ?? { label: inspection.inspection_type, color: '#94A3B8' };
    const items = inspection.items ?? {};

    const issueCount   = Object.values(items).filter(i => i.status === 'issue').length;
    const okCount      = Object.values(items).filter(i => i.status === 'ok').length;
    const totalItems   = Object.keys(checklist).length;

    return (
        <DashboardLayout title="Inspection Report">

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
                                <Box style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📋</Box>
                                <Stack gap={2}>
                                    <Text fw={900} size="xl" c="white">Inspection Report</Text>
                                    <Group gap={8}>
                                        <Box style={{ background: t.color + '30', border: `1px solid ${t.color}60`, borderRadius: 20, padding: '3px 12px' }}>
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{t.label}</Text>
                                        </Box>
                                        <Box style={{ background: s.color + '30', border: `1px solid ${s.color}60`, borderRadius: 20, padding: '3px 12px' }}>
                                            <Group gap={5} align="center">
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                                                <Text size="xs" fw={700} style={{ color: '#fff' }}>{s.label}</Text>
                                            </Group>
                                        </Box>
                                    </Group>
                                </Stack>
                            </Group>
                        </Stack>
                        <Group gap={8}>
                            <Box component={Link} href="/system/inspections"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                ← Back
                            </Box>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Summary stat mini-cards */}
            <SimpleGrid cols={{ base: 3 }} spacing="md" mb="md">
                {[
                    { icon: '✅', label: 'Passed', value: String(okCount),    grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 6px 20px rgba(16,185,129,0.35)' },
                    { icon: '⚠️', label: 'Issues', value: String(issueCount), grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 6px 20px rgba(245,158,11,0.35)' },
                    { icon: '📋', label: 'Total Checks', value: String(totalItems), grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 6px 20px rgba(37,99,235,0.35)' },
                ].map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Box style={{ background: card.grad, borderRadius: 14, padding: '16px 18px', boxShadow: card.glow, position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group gap={10} align="center">
                                <Box style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{card.icon}</Box>
                                <Stack gap={1}>
                                    <Text fw={900} c="white" size="xl" style={{ lineHeight: 1 }}>{card.value}</Text>
                                    <Text size="xs" c="white" style={{ opacity: 0.75 }}>{card.label}</Text>
                                </Stack>
                            </Group>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack gap="md">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <SectionCard title="Summary" icon="📊" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                                <InfoRow label="Inspected at" value={new Date(inspection.inspected_at).toLocaleString()} isDark={isDark} />
                                <InfoRow label="Driver"       value={inspection.driver?.name}  isDark={isDark} />
                                <InfoRow label="Vehicle"      value={inspection.vehicle ? `${inspection.vehicle.plate} — ${inspection.vehicle.make} ${inspection.vehicle.model_name}` : '—'} isDark={isDark} />
                                <InfoRow label="Trip"         value={inspection.trip ? `${inspection.trip.trip_number} (${inspection.trip.route_from} → ${inspection.trip.route_to})` : '—'} isDark={isDark} />
                                <InfoRow label="Odometer"     value={inspection.odometer_km ? `${Number(inspection.odometer_km).toLocaleString()} km` : '—'} isDark={isDark} />
                                <InfoRow label="Location"     value={inspection.location} isDark={isDark} />
                                <InfoRow label="GPS"          value={inspection.lat && inspection.lng ? `${inspection.lat}, ${inspection.lng}` : '—'} isDark={isDark} />
                            </SectionCard>
                        </motion.div>

                        {inspection.photo_path && (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #5B21B6, #A78BFA)' }} />
                                    <Box style={{ padding: '14px', textAlign: 'center' }}>
                                        <Box component="img"
                                            src={`/storage/${inspection.photo_path}`}
                                            alt="Inspection photo"
                                            style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 10 }} />
                                    </Box>
                                </Box>
                            </motion.div>
                        )}

                        {inspection.notes && (
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                <SectionCard title="Notes" icon="📝" isDark={isDark} accent={['#0D9488', '#14B8A6']}>
                                    <Box pt={8}>
                                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{inspection.notes}</Text>
                                    </Box>
                                </SectionCard>
                            </motion.div>
                        )}
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 7 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                            <Box style={{ height: 3, background: 'linear-gradient(90deg, #EA580C, #F97316)' }} />
                            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Group gap={8}>
                                    <Text size="md">✅</Text>
                                    <Text fw={700} size="sm" style={{ color: textPri }}>Checklist</Text>
                                </Group>
                                <Group gap={8}>
                                    {issueCount > 0 && (
                                        <Box style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '3px 10px' }}>
                                            <Text size="xs" fw={700} style={{ color: '#EF4444' }}>{issueCount} issue{issueCount !== 1 ? 's' : ''}</Text>
                                        </Box>
                                    )}
                                    <Box style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '3px 10px' }}>
                                        <Text size="xs" fw={700} style={{ color: '#22C55E' }}>{okCount} OK</Text>
                                    </Box>
                                </Group>
                            </Box>
                            {Object.entries(checklist).map(([key, label], idx) => {
                                const item = items[key] ?? { status: 'na', notes: '' };
                                const c    = itemColors[item.status] ?? '#64748B';
                                const isIssue = item.status === 'issue';
                                return (
                                    <Box key={key} style={{ padding: '12px 20px', borderBottom: `1px solid ${divider}`, background: isIssue ? (isDark ? 'rgba(239,68,68,0.04)' : '#FEF2F2') : 'transparent', transition: 'background 0.15s' }}
                                        onMouseEnter={e => { if (!isIssue) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = isIssue ? (isDark ? 'rgba(239,68,68,0.04)' : '#FEF2F2') : 'transparent'; }}>
                                        <Group justify="space-between" align="flex-start">
                                            <Box style={{ flex: 1, minWidth: 0 }}>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{label}</Text>
                                                {item.notes && (
                                                    <Group gap={4} mt={4}>
                                                        <Text size="xs" style={{ color: '#EF4444' }}>↪</Text>
                                                        <Text size="xs" style={{ color: '#EF4444' }}>{item.notes}</Text>
                                                    </Group>
                                                )}
                                            </Box>
                                            <Box style={{ background: c + '18', border: `1px solid ${c}35`, borderRadius: 8, padding: '3px 10px', flexShrink: 0 }}>
                                                <Text size="10px" fw={800} style={{ color: c, letterSpacing: 0.8 }}>{itemLabels[item.status] ?? item.status}</Text>
                                            </Box>
                                        </Group>
                                    </Box>
                                );
                            })}
                        </Box>
                    </motion.div>
                </Grid.Col>
            </Grid>

            <Box mt="xl">
                <Box component={Link} href="/system/inspections"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Inspections
                </Box>
            </Box>
        </DashboardLayout>
    );
}

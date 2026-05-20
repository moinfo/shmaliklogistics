import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { useCan } from '../../../lib/can';
import { formatDate } from '../../../lib/date';

function fmt(n) { return Number(n ?? 0).toLocaleString(); }

function InfoRow({ icon, label, value, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8} style={{ minWidth: 0 }}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: textPri, textAlign: 'right', wordBreak: 'break-all' }}>{value ?? '—'}</Text>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent }) {
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
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

export default function ShowMaintenance({ record }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';

    const handleDelete = () => {
        if (!confirm('Delete this service record?')) return;
        router.delete(`/system/maintenance/${record.id}`);
    };
    const can = useCan();

    return (
        <DashboardLayout title="Service Record">
            <Head title="Service Record" />

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
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🔧</Box>
                            <Stack gap={2}>
                                <Text fw={900} size="lg" c="white">Service Record</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {record.vehicle?.plate} — {record.service_type} on {formatDate(record.service_date)}
                                </Text>
                            </Stack>
                        </Group>
                        <Group gap={8} wrap="wrap">
                            {can('maintenance.edit') && (
                                <Box component={Link} href={`/system/maintenance/${record.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                            {can('maintenance.delete') && (
                                <Box component="button" onClick={handleDelete}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                    🗑️ Delete
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                {/* Service Details */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Service Details" icon="🔧" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow icon="🚛" label="Vehicle"      value={`${record.vehicle?.plate} — ${record.vehicle?.make} ${record.vehicle?.model_name}`} isDark={isDark} />
                        <InfoRow icon="🛠️" label="Service Type"  value={record.service_type}                  isDark={isDark} />
                        <InfoRow icon="📅" label="Service Date"  value={formatDate(record.service_date)}       isDark={isDark} />
                        <InfoRow icon="🏭" label="Mileage"       value={record.mileage_km ? `${fmt(record.mileage_km)} km` : null} isDark={isDark} />
                        <InfoRow icon="🏢" label="Workshop"      value={record.workshop_name}                  isDark={isDark} />
                        <InfoRow icon="💰" label="Cost"          value={record.cost ? `${record.currency} ${fmt(record.cost)}` : null} isDark={isDark} />
                    </SectionCard>
                </motion.div>

                {/* Next Service */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Next Service" icon="📅" isDark={isDark} accent={['#065F46', '#059669']}>
                        <InfoRow icon="📅" label="Next Service Date"    value={formatDate(record.next_service_date)}  isDark={isDark} />
                        <InfoRow icon="🔢" label="Next Service Mileage" value={record.next_service_mileage ? `${fmt(record.next_service_mileage)} km` : null} isDark={isDark} />

                        {record.description && (
                            <Box mt={12}>
                                <Text size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6 }}>Work Description</Text>
                                <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{record.description}</Text>
                            </Box>
                        )}

                        {record.notes && (
                            <Box mt={12}>
                                <Text size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6 }}>Notes</Text>
                                <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{record.notes}</Text>
                            </Box>
                        )}
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            <Box mt="xl">
                <Box component={Link} href="/system/maintenance"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Maintenance
                </Box>
            </Box>
        </DashboardLayout>
    );
}

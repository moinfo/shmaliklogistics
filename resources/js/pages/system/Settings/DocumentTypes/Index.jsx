import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

export default function DocumentTypesIndex({ types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const flash = props.flash ?? {};
    const can = useCan();
    const canManage = can('settings.edit');

    const confirmDelete = (type) => {
        if (window.confirm(`Remove document type "${type.name}"? This will hide the field from all vehicles.`)) {
            router.delete(`/system/settings/document-types/${type.id}`);
        }
    };

    return (
        <DashboardLayout title="Settings · Document Types">
            <Head title="Vehicle Document Types" />

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📄</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Vehicle Document Types</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Define which documents are tracked per vehicle and their expiry dates</Text>
                            </Stack>
                        </Group>
                        {canManage && (
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Box
                                    component={Link} href="/system/settings/document-types/create"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, textDecoration: 'none' }}
                                >
                                    + Add Document Type
                                </Box>
                            </motion.div>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}
            {flash.error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#EF4444' }}>✕ {flash.error}</Text>
                </motion.div>
            )}

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />

                {/* Header row */}
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px 100px 80px', background: headBg, padding: '10px 20px', borderBottom: `1px solid ${divider}` }}>
                    {['Name', 'Description', 'Order', 'Type', 'Active', ''].map((h, i) => (
                        <Text key={i} size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9 }}>{h}</Text>
                    ))}
                </Box>

                {types.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2rem', marginBottom: 10 }}>📄</Text>
                        <Text fw={600} style={{ color: textPri }}>No document types defined</Text>
                        <Text size="sm" style={{ color: textMut, marginTop: 4 }}>Add the first document type to get started</Text>
                    </Box>
                ) : (
                    types.map((type, i) => (
                        <motion.div key={type.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                            <Box
                                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px 100px 80px', padding: '13px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center', borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeftColor = '#EA580C'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
                            >
                                <Text size="sm" fw={600} style={{ color: textPri }}>{type.name}</Text>
                                <Text size="sm" style={{ color: textSec }}>{type.description || '—'}</Text>
                                <Text size="sm" style={{ color: textMut }}>{type.sort_order}</Text>

                                {/* Built-in / Custom badge */}
                                <Box>
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: type.is_builtin ? 'rgba(99,102,241,0.1)' : 'rgba(234,88,12,0.08)', border: `1px solid ${type.is_builtin ? 'rgba(99,102,241,0.3)' : 'rgba(234,88,12,0.3)'}`, borderRadius: 20, padding: '2px 8px' }}>
                                        <Text size="10px" fw={700} style={{ color: type.is_builtin ? '#818CF8' : '#EA580C' }}>{type.is_builtin ? 'Built-in' : 'Custom'}</Text>
                                    </Box>
                                </Box>

                                {/* Active pill */}
                                <Box>
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: type.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${type.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 20, padding: '3px 10px' }}>
                                        <Box style={{ width: 5, height: 5, borderRadius: '50%', background: type.is_active ? '#22C55E' : '#EF4444' }} />
                                        <Text size="xs" fw={600} style={{ color: type.is_active ? '#22C55E' : '#EF4444' }}>{type.is_active ? 'Active' : 'Inactive'}</Text>
                                    </Box>
                                </Box>

                                {/* Actions */}
                                <Group gap={4} justify="flex-end">
                                    {canManage && (
                                        <Tooltip label="Edit">
                                            <ActionIcon component={Link} href={`/system/settings/document-types/${type.id}/edit`} variant="subtle" size="sm" style={{ color: textMut }}>✏️</ActionIcon>
                                        </Tooltip>
                                    )}
                                    {canManage && !type.is_builtin && (
                                        <Tooltip label="Delete">
                                            <ActionIcon onClick={() => confirmDelete(type)} variant="subtle" size="sm" style={{ color: '#EF4444' }}>🗑️</ActionIcon>
                                        </Tooltip>
                                    )}
                                </Group>
                            </Box>
                        </motion.div>
                    ))
                )}
            </Box>

            <Box mt="xl">
                <Text size="xs" style={{ color: textMut }}>
                    📌 Built-in types map to fixed database columns. Custom types store dates in the vehicle's extra documents field.
                </Text>
            </Box>
        </DashboardLayout>
    );
}

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569', cardHov: '#132436' };

export default function DocumentTypesIndex({ types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const rowHov     = isDark ? dk.cardHov : '#F8FAFC';

    const flash = props.flash ?? {};

    const confirmDelete = (type) => {
        if (window.confirm(`Remove document type "${type.name}"? This will hide the field from all vehicles.`)) {
            router.delete(`/system/settings/document-types/${type.id}`);
        }
    };

    return (
        <DashboardLayout title="Settings · Document Types">
            <Head title="Vehicle Document Types" />

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

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Vehicle Document Types</Text>
                    <Text size="sm" style={{ color: textSec }}>Define which documents are tracked per vehicle and their expiry dates</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component={Link} href="/system/settings/document-types/create"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}
                    >
                        <Text size="sm">＋</Text> Add Document Type
                    </Box>
                </motion.div>
            </Group>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Header */}
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px 100px 80px', borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Name', 'Description', 'Order', 'Type', 'Active', ''].map((h, i) => (
                        <Text key={i} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
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
                                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 90px 100px 80px', padding: '13px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <Text size="sm" fw={600} style={{ color: textPri }}>{type.name}</Text>
                                <Text size="sm" style={{ color: textSec }}>{type.description || '—'}</Text>
                                <Text size="sm" style={{ color: textMut }}>{type.sort_order}</Text>

                                {/* Built-in / Custom badge */}
                                <Box>
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: type.is_builtin ? 'rgba(99,102,241,0.1)' : 'var(--c-border-subtle)', border: `1px solid ${type.is_builtin ? 'rgba(99,102,241,0.3)' : 'rgba(33,150,243,0.3)'}`, borderRadius: 20, padding: '2px 8px' }}>
                                        <Text size="10px" fw={700} style={{ color: type.is_builtin ? '#818CF8' : '#60A5FA' }}>{type.is_builtin ? 'Built-in' : 'Custom'}</Text>
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
                                    <Tooltip label="Edit">
                                        <ActionIcon component={Link} href={`/system/settings/document-types/${type.id}/edit`} variant="subtle" size="sm" style={{ color: textMut }}>✏️</ActionIcon>
                                    </Tooltip>
                                    {!type.is_builtin && (
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

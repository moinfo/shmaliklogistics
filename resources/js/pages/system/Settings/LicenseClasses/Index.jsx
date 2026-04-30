import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569', cardHov: '#132436' };

export default function LicenseClassesIndex({ classes }) {
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

    const confirmDelete = (cls) => {
        if (window.confirm(`Remove licence class "${cls.code} — ${cls.name}"?`)) {
            router.delete(`/system/settings/license-classes/${cls.id}`);
        }
    };

    return (
        <DashboardLayout title="Settings · Licence Classes">
            <Head title="Licence Classes" />

            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Licence Classes</Text>
                    <Text size="sm" style={{ color: textSec }}>Manage driving licence class codes available across the system</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component={Link} href="/system/settings/license-classes/create"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}
                    >
                        <Text size="sm">＋</Text> Add Class
                    </Box>
                </motion.div>
            </Group>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Header row */}
                <Box style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 80px 90px 80px', borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Code', 'Name', 'Description', 'Order', 'Active', ''].map((h, i) => (
                        <Text key={i} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {classes.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2rem', marginBottom: 10 }}>🪪</Text>
                        <Text fw={600} style={{ color: textPri }}>No licence classes defined</Text>
                        <Text size="sm" style={{ color: textMut, marginTop: 4 }}>Add the first class to get started</Text>
                    </Box>
                ) : (
                    classes.map((cls, i) => (
                        <motion.div key={cls.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                            <Box
                                style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 80px 90px 80px', padding: '13px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Code badge */}
                                <Box>
                                    <Box style={{ display: 'inline-block', background: cls.is_active ? 'var(--c-border-color)' : 'rgba(255,255,255,0.05)', border: `1px solid ${cls.is_active ? 'rgba(33,150,243,0.3)' : cardBorder}`, borderRadius: 6, padding: '4px 10px' }}>
                                        <Text fw={800} size="sm" style={{ color: cls.is_active ? '#60A5FA' : textMut, fontFamily: 'monospace', letterSpacing: 0.5 }}>{cls.code}</Text>
                                    </Box>
                                </Box>

                                <Text size="sm" fw={600} style={{ color: textPri }}>{cls.name}</Text>
                                <Text size="sm" style={{ color: textSec }}>{cls.description || '—'}</Text>
                                <Text size="sm" style={{ color: textMut }}>{cls.sort_order}</Text>

                                {/* Active pill */}
                                <Box>
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cls.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${cls.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 20, padding: '3px 10px' }}>
                                        <Box style={{ width: 5, height: 5, borderRadius: '50%', background: cls.is_active ? '#22C55E' : '#EF4444' }} />
                                        <Text size="xs" fw={600} style={{ color: cls.is_active ? '#22C55E' : '#EF4444' }}>{cls.is_active ? 'Active' : 'Inactive'}</Text>
                                    </Box>
                                </Box>

                                {/* Actions */}
                                <Group gap={4} justify="flex-end">
                                    <Tooltip label="Edit">
                                        <ActionIcon component={Link} href={`/system/settings/license-classes/${cls.id}/edit`} variant="subtle" size="sm" style={{ color: textMut }}>✏️</ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Delete">
                                        <ActionIcon onClick={() => confirmDelete(cls)} variant="subtle" size="sm" style={{ color: '#EF4444' }}>🗑️</ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Box>
                        </motion.div>
                    ))
                )}
            </Box>
        </DashboardLayout>
    );
}

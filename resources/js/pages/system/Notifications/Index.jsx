import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function AlertRow({ alert, isDark, index }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const daysLabel = alert.days < 0
        ? `${Math.abs(alert.days)}d overdue`
        : alert.days === 0
        ? 'Today'
        : `${alert.days}d left`;

    return (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
            <Box
                component={Link}
                href={alert.href}
                style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 20px',
                    borderBottom: `1px solid ${divider}`,
                    borderLeft: '3px solid transparent',
                    textDecoration: 'none',
                    transition: 'background 0.15s, border-left 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${alert.color}`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
            >
                <Box style={{ width: 38, height: 38, borderRadius: 11, background: alert.color + '1A', border: `1px solid ${alert.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                    {alert.icon}
                </Box>
                <Stack gap={2} style={{ flex: 1 }}>
                    <Text size="sm" fw={600} style={{ color: textPri }}>{alert.title}</Text>
                    <Text size="xs" style={{ color: textSec }}>{alert.subtitle}</Text>
                </Stack>
                <Box style={{ background: alert.color + '18', border: `1px solid ${alert.color}40`, borderRadius: 20, padding: '3px 12px', flexShrink: 0 }}>
                    <Text size="xs" fw={700} style={{ color: alert.color }}>{daysLabel}</Text>
                </Box>
            </Box>
        </motion.div>
    );
}

function Section({ title, icon, color, alerts, isDark, emptyText, animDelay = 0 }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: animDelay }}>
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: color }} />
                <Box style={{ padding: '13px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Box style={{ width: 32, height: 32, borderRadius: 9, background: color + '18', border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{icon}</Box>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                    <Box style={{ background: color + '18', border: `1px solid ${color}30`, borderRadius: 20, padding: '2px 10px', marginLeft: 'auto' }}>
                        <Text size="xs" fw={700} style={{ color }}>{alerts.length}</Text>
                    </Box>
                </Box>
                {alerts.length === 0 ? (
                    <Box style={{ padding: '20px', textAlign: 'center' }}>
                        <Text size="sm" style={{ color: textMut }}>{emptyText}</Text>
                    </Box>
                ) : (
                    alerts.map((a, i) => <AlertRow key={i} alert={a} isDark={isDark} index={i} />)
                )}
            </Box>
        </motion.div>
    );
}

export default function NotificationsIndex({ alerts, grouped, counts }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';

    const total = alerts.length;

    const summaryCards = [
        { label: 'Expired',  count: counts.expired,  color: '#EF4444', grad: 'linear-gradient(135deg,#7F1D1D,#EF4444)', glow: '0 8px 28px rgba(239,68,68,0.4)', icon: '❌' },
        { label: 'Critical', count: counts.critical,  color: '#F59E0B', grad: 'linear-gradient(135deg,#78350F,#F59E0B)', glow: '0 8px 28px rgba(245,158,11,0.4)', icon: '⚠️' },
        { label: 'Warning',  count: counts.warning,   color: '#F97316', grad: 'linear-gradient(135deg,#7C2D12,#F97316)', glow: '0 8px 28px rgba(249,115,22,0.4)', icon: '🔔' },
        { label: 'Notice',   count: counts.notice,    color: '#3B82F6', grad: 'linear-gradient(135deg,#1E3A5F,#3B82F6)', glow: '0 8px 28px rgba(59,130,246,0.4)', icon: 'ℹ️' },
    ];

    return (
        <DashboardLayout title="Notifications">
            <Head title="Notifications" />

            {/* Page Header Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)' : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🔔</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Notifications & Alerts</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {total === 0 ? 'All clear — no active alerts.' : `${total} alert${total !== 1 ? 's' : ''} across your operation`}
                                </Text>
                            </Stack>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Summary cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {summaryCards.map((c, i) => (
                    <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: c.grad, borderRadius: 16, padding: '18px 20px', boxShadow: c.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={10}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{c.icon}</Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{c.count}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{c.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {total === 0 ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '64px 20px', textAlign: 'center', boxShadow: cardShadow }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(34,197,94,0.1)' : '#F0FDF4', border: '2px dashed rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                            ✅
                        </Box>
                        <Text fw={800} size="lg" style={{ color: textPri, marginBottom: 6 }}>All Clear</Text>
                        <Text size="sm" style={{ color: textSec }}>No expiring documents or overdue invoices found.</Text>
                    </Box>
                </motion.div>
            ) : (
                <>
                    <Section title="Expired / Overdue"         icon="❌" color="#EF4444" alerts={grouped.expired}  isDark={isDark} emptyText="No expired items."         animDelay={0.15} />
                    <Section title="Critical — within 7 days"  icon="⚠️" color="#F59E0B" alerts={grouped.critical} isDark={isDark} emptyText="Nothing critical."          animDelay={0.2}  />
                    <Section title="Warning — within 30 days"  icon="🔔" color="#F97316" alerts={grouped.warning}  isDark={isDark} emptyText="No warnings."               animDelay={0.25} />
                    <Section title="Notice — 31–60 days"       icon="ℹ️" color="#3B82F6" alerts={grouped.notice}   isDark={isDark} emptyText="No upcoming notices."       animDelay={0.3}  />
                </>
            )}
        </DashboardLayout>
    );
}

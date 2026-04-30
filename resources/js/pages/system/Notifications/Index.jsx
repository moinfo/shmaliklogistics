import { Head, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

function AlertRow({ alert, isDark }) {
    const d = isDark
        ? { textPri: dk.textPri, textSec: dk.textSec, divider: dk.divider, hover: '#132436' }
        : { textPri: '#1E293B', textSec: '#64748B', divider: '#F1F5F9', hover: '#F8FAFC' };

    const daysLabel = alert.days < 0
        ? `${Math.abs(alert.days)}d overdue`
        : alert.days === 0
        ? 'Today'
        : `${alert.days}d left`;

    return (
        <Box
            component={Link}
            href={alert.href}
            style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px',
                borderBottom: `1px solid ${d.divider}`,
                textDecoration: 'none',
                transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = d.hover; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
            <Box style={{ width: 36, height: 36, borderRadius: 10, background: alert.color + '20', border: `1px solid ${alert.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>
                {alert.icon}
            </Box>
            <Stack gap={2} style={{ flex: 1 }}>
                <Text size="sm" fw={600} style={{ color: d.textPri }}>{alert.title}</Text>
                <Text size="xs" style={{ color: d.textSec }}>{alert.subtitle}</Text>
            </Stack>
            <Box style={{ background: alert.color + '20', border: `1px solid ${alert.color}40`, borderRadius: 20, padding: '3px 10px', flexShrink: 0 }}>
                <Text size="xs" fw={700} style={{ color: alert.color }}>{daysLabel}</Text>
            </Box>
        </Box>
    );
}

function Section({ title, color, alerts, isDark, emptyText }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '12px 16px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Box style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                <Box style={{ background: color + '20', borderRadius: 20, padding: '1px 8px', marginLeft: 'auto' }}>
                    <Text size="xs" fw={700} style={{ color }}>{alerts.length}</Text>
                </Box>
            </Box>
            {alerts.length === 0 ? (
                <Text size="sm" style={{ color: textMut, padding: '16px', textAlign: 'center' }}>{emptyText}</Text>
            ) : (
                alerts.map((a, i) => <AlertRow key={i} alert={a} isDark={isDark} />)
            )}
        </Box>
    );
}

export default function NotificationsIndex({ alerts, grouped, counts }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';

    const total = alerts.length;

    const summaryCards = [
        { label: 'Expired',  count: counts.expired,  color: '#EF4444' },
        { label: 'Critical', count: counts.critical,  color: '#F59E0B' },
        { label: 'Warning',  count: counts.warning,   color: '#F97316' },
        { label: 'Notice',   count: counts.notice,    color: '#3B82F6' },
    ];

    return (
        <DashboardLayout title="Notifications">
            <Head title="Notifications" />

            <Group justify="space-between" mb="xl" align="flex-start" wrap="wrap" gap="md">
                <Stack gap={4}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Notifications & Alerts</Text>
                    <Text size="sm" style={{ color: textSec }}>
                        {total === 0 ? 'All clear — no active alerts.' : `${total} alert${total !== 1 ? 's' : ''} across your operation`}
                    </Text>
                </Stack>
            </Group>

            {/* Summary row */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {summaryCards.map(c => (
                    <Box key={c.label} style={{ background: c.color + '12', border: `1px solid ${c.color}30`, borderRadius: 12, padding: '16px 20px' }}>
                        <Text size="xs" fw={700} style={{ color: c.color, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{c.label}</Text>
                        <Text fw={900} size="xl" style={{ color: c.color, lineHeight: 1 }}>{c.count}</Text>
                    </Box>
                ))}
            </SimpleGrid>

            {total === 0 ? (
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 14, padding: '60px 20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</Text>
                    <Text fw={700} size="lg" style={{ color: textPri }}>All Clear</Text>
                    <Text size="sm" style={{ color: textSec, marginTop: 4 }}>No expiring documents or overdue invoices found.</Text>
                </Box>
            ) : (
                <>
                    <Section title="Expired / Overdue"    color="#EF4444" alerts={grouped.expired}  isDark={isDark} emptyText="No expired items." />
                    <Section title="Critical — within 7 days" color="#F59E0B" alerts={grouped.critical} isDark={isDark} emptyText="Nothing critical." />
                    <Section title="Warning — within 30 days" color="#F97316" alerts={grouped.warning}  isDark={isDark} emptyText="No warnings." />
                    <Section title="Notice — 31–60 days"      color="#3B82F6" alerts={grouped.notice}   isDark={isDark} emptyText="No upcoming notices." />
                </>
            )}
        </DashboardLayout>
    );
}

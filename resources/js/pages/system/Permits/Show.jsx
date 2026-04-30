import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function Card({ title, icon, children, isDark }) {
    const cardBg = isDark ? dk.card : '#fff';
    const border = isDark ? dk.border : '#E2E8F0';
    const divider = isDark ? dk.divider : '#E2E8F0';
    const textPri = isDark ? dk.textPri : '#1E293B';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}><Text style={{ fontSize: 16 }}>{icon}</Text><Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text></Group>
            </Box>
            <Box style={{ padding: 20 }}>{children}</Box>
        </Box>
    );
}

function Row({ label, value, isDark }) {
    return (
        <Group justify="space-between" py={6} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}>
            <Text size="sm" style={{ color: isDark ? dk.textSec : '#64748B' }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: isDark ? dk.textPri : '#1E293B' }}>{value ?? '—'}</Text>
        </Group>
    );
}

export default function ShowPermit({ permit, statuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const statusInfo = statuses[permit.status] ?? {};
    const fmtDate    = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const daysLeft = permit.days_until_expiry;
    const expiryColor = daysLeft === null ? textSec : daysLeft <= 0 ? '#EF4444' : daysLeft <= 14 ? '#F59E0B' : '#22C55E';

    const handleDelete = () => {
        if (confirm('Delete this permit?')) router.delete(`/system/permits/${permit.id}`);
    };

    return (
        <DashboardLayout title={`Permit · ${permit.permit_type}`}>
            <Head title={`Permit · ${permit.vehicle_plate}`} />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap={8}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>{permit.permit_type}</Text>
                        <Badge size="sm" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>{statusInfo.label}</Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>Vehicle: <b style={{ color: '#3B82F6', fontFamily: 'monospace' }}>{permit.vehicle_plate}</b></Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href={`/system/permits/${permit.id}/edit`} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>Edit</Box>
                    <Box component="button" onClick={handleDelete} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #EF444444', color: '#EF4444', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Delete</Box>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Card title="Permit Details" icon="🛂" isDark={isDark}>
                    <Row label="Permit Number" value={<span style={{ fontFamily: 'monospace' }}>{permit.permit_number}</span>} isDark={isDark} />
                    <Row label="Issuing Country" value={permit.issuing_country} isDark={isDark} />
                    <Row label="Issuing Authority" value={permit.issuing_authority} isDark={isDark} />
                    <Row label="Linked Trip" value={permit.trip ? (
                        <Box component={Link} href={`/system/trips/${permit.trip.id}`} style={{ color: '#3B82F6', textDecoration: 'none' }}>{permit.trip.trip_number}</Box>
                    ) : null} isDark={isDark} />
                </Card>

                <Card title="Validity & Cost" icon="📅" isDark={isDark}>
                    <Row label="Issue Date" value={fmtDate(permit.issue_date)} isDark={isDark} />
                    <Row label="Expiry Date" value={
                        <span style={{ color: expiryColor, fontWeight: 700 }}>
                            {fmtDate(permit.expiry_date)}
                            {daysLeft !== null && ` (${daysLeft >= 0 ? `${daysLeft}d left` : 'Expired'})`}
                        </span>
                    } isDark={isDark} />
                    <Row label="Cost" value={`${permit.currency} ${new Intl.NumberFormat().format(permit.cost)}`} isDark={isDark} />
                </Card>
            </SimpleGrid>

            {permit.notes && (
                <Card title="Notes" icon="📝" isDark={isDark}>
                    <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap' }}>{permit.notes}</Text>
                </Card>
            )}

            <Group mt="md">
                <Box component={Link} href="/system/permits" style={{ color: textSec, textDecoration: 'none', fontSize: 13 }}>← Back to Permits</Box>
            </Group>
        </DashboardLayout>
    );
}

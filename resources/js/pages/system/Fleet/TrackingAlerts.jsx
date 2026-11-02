import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Button, Select, Pagination, SegmentedControl } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)', cardHov: '#132436' };

const SEV = { info: '#3B82F6', warning: '#F59E0B', critical: '#EF4444' };

export default function TrackingAlerts({ events, filters, types, vehicles, openCount }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const can = useCan();
    const canEdit = can('fleet_tracking.edit');

    const cardBg = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const textMut = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const divider = isDark ? dk.divider : '#E2E8F0';
    const rowHov = isDark ? dk.cardHov : '#F8FAFC';
    const flash = props.flash ?? {};

    const go = (patch) => router.get('/system/fleet/tracking-alerts', { ...filters, ...patch, page: 1 }, { preserveState: true, replace: true });
    const ack = (e) => router.post(`/system/fleet/tracking-alerts/${e.id}/acknowledge`, {}, { preserveScroll: true });
    const ackAll = () => { if (window.confirm('Acknowledge all open alerts?')) router.post('/system/fleet/tracking-alerts/acknowledge-all', {}, { preserveScroll: true }); };

    return (
        <DashboardLayout title="Fleet · Tracking Alerts">
            <Head title="Tracking Alerts" />

            {flash.success && (
                <Box style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </Box>
            )}

            <Group justify="space-between" mb="lg" align="flex-end">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Tracking Alerts</Text>
                    <Text size="sm" style={{ color: textSec }}>Speeding, long idling, after-hours starts, harsh driving, offline trackers and zone entries / exits</Text>
                </Stack>
                {canEdit && openCount > 0 && <Button variant="light" onClick={ackAll}>✓ Acknowledge all ({openCount})</Button>}
            </Group>

            <Group gap="sm" mb="md" align="flex-end">
                <SegmentedControl value={filters.status} onChange={v => go({ status: v })} data={[{ value: 'open', label: `Open (${openCount})` }, { value: 'all', label: 'All' }]} />
                <Select placeholder="All types" clearable data={types} value={filters.type || null} onChange={v => go({ type: v ?? '' })} w={200} />
                <Select placeholder="All vehicles" clearable searchable data={vehicles.map(v => ({ value: String(v.id), label: v.plate }))} value={filters.vehicle_id ? String(filters.vehicle_id) : null} onChange={v => go({ vehicle_id: v ?? '' })} w={180} />
            </Group>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                {events.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2rem' }}>✅</Text>
                        <Text fw={600} style={{ color: textPri }}>{filters.status === 'open' ? 'No open alerts' : 'No alerts found'}</Text>
                    </Box>
                ) : events.data.map((e, i) => (
                    <Box key={e.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: i < events.data.length - 1 ? `1px solid ${divider}` : 'none', borderLeft: `4px solid ${SEV[e.severity] ?? '#F59E0B'}`, opacity: e.acknowledged ? 0.55 : 1 }}
                        onMouseEnter={ev => ev.currentTarget.style.background = rowHov} onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                        <Text style={{ fontSize: '1.3rem' }}>{e.icon}</Text>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" fw={700} style={{ color: textPri }}>{e.label} · <Link href={`/system/fleet/${e.vehicle_id}`} style={{ color: '#3B82F6', textDecoration: 'none' }}>{e.plate}</Link></Text>
                            <Text size="xs" style={{ color: textSec }}>{e.message}{e.driver ? ` · ${e.driver}` : ''}</Text>
                            <Text size="10px" style={{ color: textMut }}>{new Date(e.occurred_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                        </Box>
                        <Group gap="xs" wrap="nowrap">
                            {e.lat != null && <Button component="a" href={`https://www.google.com/maps?q=${e.lat},${e.lng}`} target="_blank" rel="noopener" size="compact-xs" variant="default">Map ↗</Button>}
                            <Button component={Link} href={`/system/fleet/${e.vehicle_id}/trail`} size="compact-xs" variant="default">Replay</Button>
                            {canEdit && !e.acknowledged && <Button size="compact-xs" variant="light" onClick={() => ack(e)}>Acknowledge</Button>}
                        </Group>
                    </Box>
                ))}
            </Box>

            {events.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination total={events.last_page} value={events.current_page} onChange={p => router.get('/system/fleet/tracking-alerts', { ...filters, page: p }, { preserveState: true })} />
                </Group>
            )}
        </DashboardLayout>
    );
}

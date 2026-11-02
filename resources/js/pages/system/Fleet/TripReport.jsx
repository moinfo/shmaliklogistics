import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ExportMenu from '../../../components/ExportMenu';
import VehicleTrackingPanel from '../../../components/VehicleTrackingPanel';
import { formatDate } from '../../../lib/date';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };

const fmt = (n, d = 0) => Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: d });
const hm = (min) => (min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`);
const SEV = { critical: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };

export default function TripReport({ trips, selected, report, statuses, speedLimit }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBg = isDark ? dk.card : '#fff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const divider = isDark ? dk.divider : '#E2E8F0';

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
    };

    const Card = ({ title, children, right }) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
            <Group justify="space-between" mb="sm">
                <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
                {right}
            </Group>
            {children}
        </Box>
    );

    const Stat = ({ label, value, color, sub }) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px' }}>
            <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
            <Text size="xl" fw={800} mt={4} style={{ color: color ?? textPri }}>{value}</Text>
            {sub && <Text size="xs" style={{ color: textSec }}>{sub}</Text>}
        </Box>
    );

    const Table = ({ cols, rows, empty }) => rows.length === 0 ? (
        <Text size="sm" style={{ color: textSec }}>{empty}</Text>
    ) : (
        <Box style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>{cols.map(c => (
                        <th key={c.label} style={{ textAlign: c.num ? 'right' : 'left', padding: '8px 10px', fontSize: 11, color: textSec, textTransform: 'uppercase', letterSpacing: 0.6, borderBottom: `1px solid ${divider}` }}>{c.label}</th>
                    ))}</tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>{cols.map(c => (
                            <td key={c.label} style={{ textAlign: c.num ? 'right' : 'left', padding: '8px 10px', fontSize: 13, color: textPri, borderBottom: `1px solid ${divider}` }}>{c.render ? c.render(r) : (r[c.key] ?? '—')}</td>
                        ))}</tr>
                    ))}
                </tbody>
            </table>
        </Box>
    );

    const t = report?.trip;
    const g = report?.gps;
    const st = t ? statuses[t.status] : null;

    return (
        <DashboardLayout title="Trip Tracking Report">
            <Head title="Trip Tracking Report" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Trip Tracking Report</Text>
                    <Text size="sm" style={{ color: textSec }}>What the tracker recorded on one trip: distance, speed, stops, alerts and the route driven</Text>
                </Stack>
                <Group gap="sm" align="flex-end">
                    <Select searchable placeholder="Choose a trip…" value={selected} data={trips} nothingFoundMessage="No trip with a vehicle found"
                        onChange={v => router.get('/system/fleet/trip-report', v ? { trip: v } : {}, { preserveState: true })}
                        styles={inputStyles} style={{ width: 420, maxWidth: '100%' }} />
                    {t && <ExportMenu baseUrl="/system/fleet/trip-report/export" params={{ trip: t.id }} />}
                </Group>
            </Group>

            {!report && (
                <Box style={{ background: cardBg, border: `1px dashed ${cardBorder}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '2.2rem' }}>🧭</Text>
                    <Text fw={700} style={{ color: textPri }}>Choose a trip above</Text>
                    <Text size="sm" style={{ color: textSec }}>You will get its distance, speeds, stops, alerts, driver check-ins and the route on the map.</Text>
                </Box>
            )}

            {report && (
                <>
                    <Card title={`Trip ${t.trip_number}`} right={
                        <Group gap="xs">
                            {st && <Badge variant="light" style={{ color: st.color, background: `${st.color}22` }}>{st.label}</Badge>}
                            <Link href={`/system/trips/${t.id}`} style={{ color: '#3B82F6', fontSize: 13 }}>Open trip →</Link>
                        </Group>
                    }>
                        <Text fw={800} size="lg" style={{ color: textPri }}>{t.route_from} → {t.route_to}</Text>
                        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mt="md">
                            {[
                                ['Departure', formatDate(t.departure_date)],
                                ['Arrival', t.arrival_date ? formatDate(t.arrival_date) : '—'],
                                ['Duration', t.days ? `${t.days} day${t.days > 1 ? 's' : ''}` : '—'],
                                ['Vehicle', [t.vehicle_plate, t.vehicle_name].filter(Boolean).join(' · ') || '—'],
                                ['Driver', t.driver_name || '—'],
                                ['Driver phone', t.driver_phone || '—'],
                            ].map(([k, v]) => (
                                <Box key={k}>
                                    <Text size="xs" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.6 }}>{k}</Text>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{v}</Text>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Card>

                    {!g ? (
                        <Card title="GPS tracking">
                            <Text size="sm" style={{ color: textSec }}>The tracker recorded no positions for this vehicle during the trip dates.</Text>
                        </Card>
                    ) : (
                        <>
                            <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md" mb="md">
                                <Stat label="Distance" value={`${fmt(g.distance_km, 1)} km`} color="#3B82F6" />
                                <Stat label="Max speed" value={`${g.max_speed} km/h`} color={g.max_speed > speedLimit ? '#EF4444' : undefined} sub={`Limit ${speedLimit}`} />
                                <Stat label="Avg moving" value={`${g.avg_speed} km/h`} />
                                <Stat label="Time moving" value={hm(g.moving_minutes)} />
                                <Stat label="Stopped" value={hm(g.stopped_minutes)} sub={`${g.stops.length} stops`} />
                                <Stat label="Alerts" value={g.events.length} color={g.events.length ? '#F59E0B' : '#22C55E'} />
                            </SimpleGrid>
                            <Text size="xs" mb="md" style={{ color: textSec }}>{fmt(g.records)} positions recorded from {g.first} to {g.last}</Text>

                            <Box mb="md">
                                <VehicleTrackingPanel vehicleId={t.vehicle_id} tripId={t.id} title="Route driven"
                                    from={new Date(g.from)} to={new Date(g.to) < new Date() ? new Date(g.to) : null} />
                            </Box>

                            <Card title={`Stops of 5 minutes or more (${g.stops.length})`}>
                                <Table cols={[
                                    { label: 'From', key: 'from' }, { label: 'To', key: 'to' }, { label: 'Duration', num: true, render: r => hm(r.minutes) },
                                    { label: 'Position', render: r => <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" style={{ color: '#3B82F6' }}>{r.lat}, {r.lng}</a> },
                                ]} rows={g.stops} empty="No stops of 5 minutes or more." />
                            </Card>

                            <Card title={`Alerts during the trip (${g.events.length})`}>
                                <Table cols={[
                                    { label: 'When', key: 'at' }, { label: 'Type', render: r => `${r.icon} ${r.label}` },
                                    { label: 'Severity', render: r => <span style={{ color: SEV[r.severity] ?? textSec, fontWeight: 700 }}>{r.severity}</span> },
                                    { label: 'Detail', key: 'message' },
                                ]} rows={g.events} empty="No alerts — a clean trip." />
                            </Card>
                        </>
                    )}

                    <Card title={`Driver check-ins (${report.check_ins.length})`}>
                        <Table cols={[
                            { label: 'When', key: 'at' },
                            { label: 'Status', render: r => <span style={{ color: r.color, fontWeight: 700 }}>{r.status}</span> },
                            { label: 'Location', key: 'location' }, { label: 'Odometer', num: true, render: r => r.odometer != null ? fmt(r.odometer) : '—' }, { label: 'Notes', key: 'notes' },
                        ]} rows={report.check_ins} empty="The driver made no check-ins on this trip." />
                    </Card>
                </>
            )}
        </DashboardLayout>
    );
}

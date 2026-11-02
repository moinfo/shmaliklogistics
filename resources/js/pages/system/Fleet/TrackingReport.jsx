import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ExportMenu from '../../../components/ExportMenu';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)', textMut: 'var(--c-text-muted)', cardHov: '#132436' };

const scoreColor = (s) => s == null ? '#94A3B8' : s >= 85 ? '#22C55E' : s >= 65 ? '#F59E0B' : '#EF4444';

export default function TrackingReport({ from, to, rows, totals, speedLimit }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const textMut = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const divider = isDark ? dk.divider : '#E2E8F0';
    const rowHov = isDark ? dk.cardHov : '#F8FAFC';

    const [f, setF] = useState(from);
    const [t, setT] = useState(to);
    const apply = () => router.get('/system/fleet/tracking-report', { from: f, to: t }, { preserveState: true, replace: true });

    const cols = '1.1fr 1.2fr 0.8fr 0.7fr 0.7fr 0.8fr 0.7fr 0.7fr 0.7fr 0.8fr 0.9fr';
    const heads = ['Vehicle', 'Driver', 'GPS km', 'Days', 'Max km/h', 'Avg moving', 'Speeding', 'Harsh', 'Idle', 'After-hrs', 'Score'];

    const stat = (label, value) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '12px 16px' }}>
            <Text size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
            <Text fw={800} size="xl" style={{ color: textPri }}>{value}</Text>
        </Box>
    );

    return (
        <DashboardLayout title="Fleet · GPS Mileage">
            <Head title="GPS Mileage & Driver Behaviour" />

            <Group justify="space-between" mb="lg" align="flex-end">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>GPS Mileage & Driver Behaviour</Text>
                    <Text size="sm" style={{ color: textSec }}>Distance driven per vehicle from the tracker, with speeding, harsh driving and idling counts</Text>
                </Stack>
                <ExportMenu baseUrl="/system/fleet/tracking-report/export" params={{ from, to }} />
            </Group>

            <Group align="flex-end" gap="sm" mb="md">
                <TextInput type="date" label="From" value={f} onChange={e => setF(e.target.value)} />
                <TextInput type="date" label="To" value={t} onChange={e => setT(e.target.value)} />
                <Button onClick={apply}>Apply</Button>
            </Group>

            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm" mb="md">
                {stat('Total GPS distance', `${totals.km.toLocaleString()} km`)}
                {stat(`Speeding (>${speedLimit} km/h)`, totals.speeding)}
                {stat('Harsh driving', totals.harsh)}
                {stat('Long idle', totals.idle)}
            </SimpleGrid>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'auto' }}>
                <Box style={{ minWidth: 900 }}>
                    <Box style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                        {heads.map(h => <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>)}
                    </Box>
                    {rows.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Text style={{ fontSize: '2rem' }}>🛰️</Text>
                            <Text fw={600} style={{ color: textPri }}>No tracked driving in this period</Text>
                        </Box>
                    ) : rows.map(r => (
                        <Box key={r.id} style={{ display: 'grid', gridTemplateColumns: cols, padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = rowHov} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Link href={`/system/fleet/${r.id}/trail`} style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>{r.plate}</Link>
                            <Text size="sm" style={{ color: textSec }}>{r.driver ?? '—'}</Text>
                            <Text size="sm" fw={700} style={{ color: textPri }}>{r.km.toLocaleString()}</Text>
                            <Text size="sm" style={{ color: textSec }}>{r.days}</Text>
                            <Text size="sm" style={{ color: r.max_speed > speedLimit ? '#EF4444' : textSec }}>{r.max_speed}</Text>
                            <Text size="sm" style={{ color: textSec }}>{r.avg_speed}</Text>
                            <Text size="sm" style={{ color: r.speeding ? '#F59E0B' : textMut }}>{r.speeding}</Text>
                            <Text size="sm" style={{ color: r.harsh ? '#F59E0B' : textMut }}>{r.harsh}</Text>
                            <Text size="sm" style={{ color: textSec }}>{r.idle}</Text>
                            <Text size="sm" style={{ color: textSec }}>{r.after_hours}</Text>
                            <Box>
                                <Box style={{ display: 'inline-block', background: scoreColor(r.score) + '22', border: `1px solid ${scoreColor(r.score)}55`, borderRadius: 20, padding: '2px 12px' }}>
                                    <Text size="sm" fw={800} style={{ color: scoreColor(r.score) }}>{r.score ?? '—'}</Text>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Text size="xs" mt="md" style={{ color: textMut }}>
                Score = 100 − 5 × (speeding + 2 × harsh + 0.5 × idle events per 100 km), minimum 0; distances under 50 km are treated as 50 km so short periods are not over-penalised.
                Harsh-driving counts need the Eco / Green Driving feature enabled on the tracker.
            </Text>
        </DashboardLayout>
    );
}

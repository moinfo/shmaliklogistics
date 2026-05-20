import { Box, Text, Group, Stack, Grid, SimpleGrid, NumberInput, Textarea } from '@mantine/core';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMantineColorScheme } from '@mantine/core';
import DriverLayout from '../../../layouts/DriverLayout';

const fmtTzs = (n) => 'TZS ' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function Row({ label, value, color, textSec, textPri, divider }) {
    return (
        <Group justify="space-between" py={8} style={{ borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Text size="xs" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: color ?? textPri }}>{value ?? '—'}</Text>
        </Group>
    );
}

export default function DriverTripShow({ trip, tripStatuses }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0600' : '#ffffff';
    const cardBorder = isDark ? 'rgba(234,88,12,0.15)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';

    const inputStyle = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, marginBottom: 6, fontSize: 13, fontWeight: 600 },
    };

    const meta = tripStatuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
    const isActive   = ['loading', 'in_transit', 'at_border'].includes(trip.status);
    const isEditable = ['planned', 'loading', 'in_transit', 'at_border', 'delivered'].includes(trip.status);

    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        road_fines:   trip.road_fines ?? 0,
        guard_fees:   trip.guard_fees ?? 0,
        border_costs: trip.border_costs ?? 0,
        notes:        '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(`/driver/trips/${trip.id}/expenses`, {
            onSuccess: () => setShowExpenseForm(false),
            preserveScroll: true,
        });
    };

    const SectionCard = ({ icon, title, children, toolbar }) => (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', boxShadow: cardShadow }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '8px 20px 16px' }}>{children}</Box>
        </Box>
    );

    return (
        <DriverLayout title={`Trip ${trip.trip_number}`}>
            {/* Page header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={20} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 16, padding: '18px 24px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap="md">
                            <Box component={Link} href="/driver/trips" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>← Back</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">{trip.trip_number}</Text>
                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: meta.color + '30', border: `1px solid ${meta.color}50`, borderRadius: 20, padding: '2px 12px' }}>
                                    <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                                </Box>
                            </Stack>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Route card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 16 }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}><Text size="md">🗺️</Text><Text fw={700} size="sm" style={{ color: textPri }}>Route</Text></Group>
                </Box>
                <Box style={{ padding: '16px 20px' }}>
                    <Group gap="md" align="center">
                        <Box style={{ flex: 1 }}>
                            <Text size="xs" style={{ color: textSec }}>From</Text>
                            <Text fw={700} size="lg" style={{ color: textPri }}>{trip.route_from}</Text>
                        </Box>
                        <Text style={{ fontSize: '1.5rem', color: '#EA580C' }}>→</Text>
                        <Box style={{ flex: 1 }}>
                            <Text size="xs" style={{ color: textSec }}>To</Text>
                            <Text fw={700} size="lg" style={{ color: textPri }}>{trip.route_to}</Text>
                        </Box>
                    </Group>
                    <Group gap="xl" mt="md">
                        <Box>
                            <Text size="xs" style={{ color: textSec }}>Depart</Text>
                            <Text size="sm" fw={600} style={{ color: textPri }}>{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString() : '—'}</Text>
                        </Box>
                        <Box>
                            <Text size="xs" style={{ color: textSec }}>Arrive</Text>
                            <Text size="sm" fw={600} style={{ color: textPri }}>{trip.arrival_date ? new Date(trip.arrival_date).toLocaleDateString() : '—'}</Text>
                        </Box>
                    </Group>
                </Box>
            </Box>

            {/* Quick actions */}
            {isActive && (
                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm" mb={16}>
                    <Box
                        component={Link}
                        href={`/driver/check-ins/create?trip=${trip.id}`}
                        style={{ background: 'linear-gradient(135deg, #5B21B6, #8B5CF6)', color: 'white', textDecoration: 'none', padding: '14px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}
                    >
                        📍 Check-In
                    </Box>
                    <Box
                        component={Link}
                        href={`/driver/inspections/create?trip=${trip.id}`}
                        style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: 'white', textDecoration: 'none', padding: '14px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 16px rgba(194,65,12,0.35)' }}
                    >
                        🔧 Ukaguzi
                    </Box>
                    {isEditable && (
                        <Box
                            component="button"
                            type="button"
                            onClick={() => setShowExpenseForm(s => !s)}
                            style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)', color: 'white', border: 'none', padding: '14px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}
                        >
                            💸 {showExpenseForm ? 'Funga' : 'Expenses'}
                        </Box>
                    )}
                </SimpleGrid>
            )}

            {/* Expense form (inline) */}
            {showExpenseForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden', marginBottom: 16 }}>
                    <Box style={{ background: cardBg, border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #B45309, #F59E0B)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}><Text size="md">💸</Text><Text fw={700} size="sm" style={{ color: textPri }}>Jaza Expenses</Text></Group>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            <Text size="xs" style={{ color: textSec, marginBottom: 16 }}>
                                Andika jumla iliyolipwa sasa. Ukiongeza, lipa kiasi kipya juu ya kile kilichohifadhiwa awali.
                            </Text>
                            <form onSubmit={submit}>
                                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                                    <NumberInput
                                        label="Fine za Barabarani"
                                        value={data.road_fines}
                                        onChange={v => setData('road_fines', v)}
                                        min={0}
                                        thousandSeparator=","
                                        styles={inputStyle}
                                        error={errors.road_fines}
                                    />
                                    <NumberInput
                                        label="Hela ya Mlinzi"
                                        value={data.guard_fees}
                                        onChange={v => setData('guard_fees', v)}
                                        min={0}
                                        thousandSeparator=","
                                        styles={inputStyle}
                                        error={errors.guard_fees}
                                    />
                                    <NumberInput
                                        label="Border Costs"
                                        value={data.border_costs}
                                        onChange={v => setData('border_costs', v)}
                                        min={0}
                                        thousandSeparator=","
                                        styles={inputStyle}
                                        error={errors.border_costs}
                                    />
                                </SimpleGrid>
                                <Textarea
                                    mt="md"
                                    label="Maelezo (optional)"
                                    placeholder="e.g. Fine kubwa Iringa, mlinzi mara mbili Tunduma…"
                                    rows={3}
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    styles={inputStyle}
                                />
                                <Group justify="flex-end" mt="md" gap="sm">
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() => setShowExpenseForm(false)}
                                        style={{ background: 'transparent', border: `1px solid ${cardBorder}`, color: textSec, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
                                    >
                                        Cancel
                                    </Box>
                                    <Box
                                        component="button"
                                        type="submit"
                                        disabled={processing}
                                        style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)', border: 'none', color: 'white', borderRadius: 8, padding: '8px 22px', cursor: processing ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: processing ? 0.7 : 1 }}
                                    >
                                        {processing ? 'Tunahifadhi…' : '✓ Hifadhi'}
                                    </Box>
                                </Group>
                            </form>
                        </Box>
                    </Box>
                </motion.div>
            )}

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <SectionCard icon="📦" title="Cargo">
                        <Row label="Description" value={trip.cargo_description} textSec={textSec} textPri={textPri} divider={divider} />
                        <Row label="Weight" value={trip.cargo_weight_tons ? `${trip.cargo_weight_tons} tons` : '—'} textSec={textSec} textPri={textPri} divider={divider} />
                    </SectionCard>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <SectionCard icon="🚛" title="Vehicle">
                        <Row label="Plate" value={trip.vehicle?.plate || trip.vehicle_plate} textSec={textSec} textPri={textPri} divider={divider} />
                        <Row label="Make / Model" value={trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model_name}` : '—'} textSec={textSec} textPri={textPri} divider={divider} />
                    </SectionCard>
                </Grid.Col>

                <Grid.Col span={12}>
                    <SectionCard icon="💰" title="Financials">
                        <Row label="Driver allowance"    value={fmtTzs(trip.driver_allowance)}  color="#22C55E" textSec={textSec} textPri={textPri} divider={divider} />
                        <Row label="Fuel cost"           value={fmtTzs(trip.fuel_cost)}          textSec={textSec} textPri={textPri} divider={divider} />
                        <Row label="Border costs"        value={fmtTzs(trip.border_costs)}       textSec={textSec} textPri={textPri} divider={divider} />
                        <Row label="Road fines"          value={fmtTzs(trip.road_fines)}         color="#EF4444" textSec={textSec} textPri={textPri} divider={divider} />
                        <Row label="Guard fees (Mlinzi)" value={fmtTzs(trip.guard_fees)}         textSec={textSec} textPri={textPri} divider={divider} />
                        <Row label="Other"               value={fmtTzs(trip.other_costs)}        textSec={textSec} textPri={textPri} divider={divider} />
                    </SectionCard>
                </Grid.Col>

                {trip.notes && (
                    <Grid.Col span={12}>
                        <SectionCard icon="📝" title="Notes">
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{trip.notes}</Text>
                        </SectionCard>
                    </Grid.Col>
                )}
            </Grid>
        </DriverLayout>
    );
}

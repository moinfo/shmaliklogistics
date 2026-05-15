import { Box, Text, Group, Stack, Grid, SimpleGrid, NumberInput, Textarea } from '@mantine/core';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DriverLayout from '../../../layouts/DriverLayout';

const card = { background: '#0F1E32', border: '1px solid rgba(33,150,243,0.15)', borderRadius: 14 };
const inputStyle = {
    input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(33,150,243,0.2)', color: '#E2E8F0', borderRadius: 8 },
    label: { color: '#94A3B8', marginBottom: 6, fontSize: 13 },
};

function Row({ label, value, color = 'white' }) {
    return (
        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Text size="xs" style={{ color: '#94A3B8' }}>{label}</Text>
            <Text size="sm" fw={600} c={color}>{value ?? '—'}</Text>
        </Group>
    );
}

const fmtTzs = (n) => 'TZS ' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function DriverTripShow({ trip, tripStatuses }) {
    const meta = tripStatuses[trip.status] ?? { label: trip.status, color: '#94A3B8' };
    const isActive = ['loading', 'in_transit', 'at_border'].includes(trip.status);
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

    return (
        <DriverLayout title={`Trip ${trip.trip_number}`}>
            <Group justify="space-between" mb="lg" wrap="wrap">
                <Group gap="md">
                    <Box component={Link} href="/driver/trips" style={{ color: '#60A5FA', textDecoration: 'none', fontSize: 14 }}>← Back</Box>
                    <Text fw={800} size="xl" c="white">{trip.trip_number}</Text>
                    <Box style={{ background: meta.color + '22', border: `1px solid ${meta.color}55`, borderRadius: 16, padding: '4px 14px' }}>
                        <Text size="xs" fw={700} style={{ color: meta.color }}>{meta.label}</Text>
                    </Box>
                </Group>
            </Group>

            {/* Route card */}
            <Box style={{ ...card, padding: '20px 24px', marginBottom: 16 }}>
                <Text size="xs" style={{ color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' }} mb={8}>Route</Text>
                <Group gap="md" align="center">
                    <Box style={{ flex: 1 }}>
                        <Text size="xs" style={{ color: '#94A3B8' }}>From</Text>
                        <Text fw={700} size="lg" c="white">{trip.route_from}</Text>
                    </Box>
                    <Text style={{ fontSize: '1.5rem', color: '#3B82F6' }}>→</Text>
                    <Box style={{ flex: 1 }}>
                        <Text size="xs" style={{ color: '#94A3B8' }}>To</Text>
                        <Text fw={700} size="lg" c="white">{trip.route_to}</Text>
                    </Box>
                </Group>
                <Group gap="xl" mt="md">
                    <Box>
                        <Text size="xs" style={{ color: '#94A3B8' }}>Depart</Text>
                        <Text size="sm" fw={600} c="white">{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString() : '—'}</Text>
                    </Box>
                    <Box>
                        <Text size="xs" style={{ color: '#94A3B8' }}>Arrive</Text>
                        <Text size="sm" fw={600} c="white">{trip.arrival_date ? new Date(trip.arrival_date).toLocaleDateString() : '—'}</Text>
                    </Box>
                </Group>
            </Box>

            {/* Quick actions */}
            {isActive && (
                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm" mb={16}>
                    <Box component={Link} href={`/driver/check-ins/create?trip=${trip.id}`}
                        style={{ background: 'linear-gradient(135deg, #5B21B6, #8B5CF6)', color: 'white', textDecoration: 'none', padding: '14px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
                        📍 Check-In
                    </Box>
                    <Box component={Link} href={`/driver/inspections/create?trip=${trip.id}`}
                        style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)', color: 'white', textDecoration: 'none', padding: '14px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
                        🔧 Ukaguzi
                    </Box>
                    {isEditable && (
                        <Box component="button" type="button" onClick={() => setShowExpenseForm(s => !s)}
                            style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)', color: 'white', border: 'none', padding: '14px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            💸 {showExpenseForm ? 'Funga' : 'Expenses'}
                        </Box>
                    )}
                </SimpleGrid>
            )}

            {/* Expense form (inline) */}
            {showExpenseForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                    <Box style={{ ...card, padding: '20px 24px', marginBottom: 16, borderColor: 'rgba(245,158,11,0.4)' }}>
                        <Text fw={700} c="white" mb="sm">💸 Jaza Expenses</Text>
                        <Text size="xs" style={{ color: '#94A3B8', marginBottom: 16 }}>
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
                                <Box component="button" type="button" onClick={() => setShowExpenseForm(false)}
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#94A3B8', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
                                    Cancel
                                </Box>
                                <Box component="button" type="submit" disabled={processing}
                                    style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)', border: 'none', color: 'white', borderRadius: 8, padding: '8px 22px', cursor: processing ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: processing ? 0.7 : 1 }}>
                                    {processing ? 'Tunahifadhi…' : '✓ Hifadhi'}
                                </Box>
                            </Group>
                        </form>
                    </Box>
                </motion.div>
            )}

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Box style={{ ...card, padding: '16px 20px' }}>
                        <Text fw={700} c="white" mb={8}>Cargo</Text>
                        <Row label="Description" value={trip.cargo_description} />
                        <Row label="Weight" value={trip.cargo_weight_tons ? `${trip.cargo_weight_tons} tons` : '—'} />
                    </Box>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Box style={{ ...card, padding: '16px 20px' }}>
                        <Text fw={700} c="white" mb={8}>Vehicle</Text>
                        <Row label="Plate" value={trip.vehicle?.plate || trip.vehicle_plate} />
                        <Row label="Make / Model" value={trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model_name}` : '—'} />
                    </Box>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Box style={{ ...card, padding: '16px 20px' }}>
                        <Text fw={700} c="white" mb={8}>Financials</Text>
                        <Row label="Driver allowance"      value={fmtTzs(trip.driver_allowance)} color="#22C55E" />
                        <Row label="Fuel cost"             value={fmtTzs(trip.fuel_cost)} />
                        <Row label="Border costs"          value={fmtTzs(trip.border_costs)} />
                        <Row label="Road fines"            value={fmtTzs(trip.road_fines)} color="#EF4444" />
                        <Row label="Guard fees (Mlinzi)"   value={fmtTzs(trip.guard_fees)} />
                        <Row label="Other"                 value={fmtTzs(trip.other_costs)} />
                    </Box>
                </Grid.Col>

                {trip.notes && (
                    <Grid.Col span={12}>
                        <Box style={{ ...card, padding: '16px 20px' }}>
                            <Text fw={700} c="white" mb={8}>Notes</Text>
                            <Text size="sm" style={{ color: '#CBD5E1', whiteSpace: 'pre-wrap' }}>{trip.notes}</Text>
                        </Box>
                    </Grid.Col>
                )}
            </Grid>
        </DriverLayout>
    );
}

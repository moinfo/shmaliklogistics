import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

// ─── Section card wrapper ────────────────────────────────────────────────────

function Section({ title, icon, children, isDark }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 16 }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px 24px' }}>{children}</Box>
        </Box>
    );
}

export default function TripForm({ data, setData, errors, statuses, drivers = [], vehicles = [], processing, onSubmit, backHref, submitLabel = 'Save Trip' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };
    const numStyles = { ...inputStyles, section: { color: textSec } };

    // Build Select options, including current value as fallback if not in list
    const driverData = (() => {
        const opts = drivers.map(d => ({
            value: d.name,
            label: d.vehicle ? `${d.name}  ·  ${d.vehicle.plate}` : d.name,
        }));
        if (data.driver_name && !opts.find(o => o.value === data.driver_name)) {
            opts.unshift({ value: data.driver_name, label: data.driver_name });
        }
        return opts;
    })();

    const vehicleData = (() => {
        const opts = vehicles.map(v => ({
            value: v.plate,
            label: v.driver ? `${v.plate}  —  ${v.make} ${v.model_name}  ·  ${v.driver.name}` : `${v.plate}  —  ${v.make} ${v.model_name}`,
        }));
        if (data.vehicle_plate && !opts.find(o => o.value === data.vehicle_plate)) {
            opts.unshift({ value: data.vehicle_plate, label: data.vehicle_plate });
        }
        return opts;
    })();

    const handleDriverChange = (name) => {
        const driver = drivers.find(d => d.name === name);
        const autoPlate = driver?.vehicle?.plate;
        setData({ ...data, driver_name: name ?? '', ...(autoPlate ? { vehicle_plate: autoPlate } : {}) });
    };

    const handleVehicleChange = (plate) => {
        const vehicle = vehicles.find(v => v.plate === plate);
        const autoDriver = vehicle?.driver?.name;
        setData({ ...data, vehicle_plate: plate ?? '', ...(autoDriver ? { driver_name: autoDriver } : {}) });
    };

    // Auto-compute invoice_tzs when usd + rate are both filled
    const handleInvoiceUsd = (v) => {
        const usd  = Number(v) || 0;
        const rate = Number(data.exchange_rate) || 0;
        setData({ ...data, invoice_usd: v, invoice_tzs: usd && rate ? (usd * rate).toFixed(0) : data.invoice_tzs });
    };
    const handleExchangeRate = (v) => {
        const rate = Number(v) || 0;
        const usd  = Number(data.invoice_usd) || 0;
        setData({ ...data, exchange_rate: v, invoice_tzs: usd && rate ? (usd * rate).toFixed(0) : data.invoice_tzs });
    };

    const totalCosts = (Number(data.fuel_cost) || 0)
        + (Number(data.driver_allowance) || 0)
        + (Number(data.border_costs) || 0)
        + (Number(data.road_fines) || 0)
        + (Number(data.guard_fees) || 0)
        + (Number(data.other_costs) || 0);
    const profit = (Number(data.freight_amount) || 0) - totalCosts;

    const selectedDriver  = drivers.find(d => d.name === data.driver_name);
    const selectedVehicle = vehicles.find(v => v.plate === data.vehicle_plate);

    return (
        <form onSubmit={onSubmit}>
            {/* ── Trip Details ── */}
            <Section title="Trip Details" icon="🚛" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Status"
                        required
                        value={data.status}
                        onChange={v => setData('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <DatePicker label="Departure Date" required value={data.departure_date} onChange={v => setData('departure_date', v)} error={errors.departure_date} styles={inputStyles} />
                    <TextInput label="Route From" placeholder="Dar es Salaam" required value={data.route_from} onChange={e => setData('route_from', e.target.value)} error={errors.route_from} styles={inputStyles} />
                    <TextInput label="Route To" placeholder="Lubumbashi" required value={data.route_to} onChange={e => setData('route_to', e.target.value)} error={errors.route_to} styles={inputStyles} />
                    <DatePicker label="Expected Arrival" value={data.arrival_date ?? ''} onChange={v => setData('arrival_date', v)} error={errors.arrival_date} styles={inputStyles} />
                </SimpleGrid>
            </Section>

            {/* ── Driver & Vehicle ── */}
            <Section title="Driver & Vehicle" icon="👤" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb={selectedDriver || selectedVehicle ? 'xs' : 0}>
                    <Stack gap={4}>
                        <Select
                            label="Driver"
                            placeholder="Select driver…"
                            required
                            searchable
                            clearable
                            value={data.driver_name || null}
                            onChange={handleDriverChange}
                            data={driverData}
                            error={errors.driver_name}
                            styles={{ ...inputStyles, dropdown: dropdownStyle }}
                            nothingFoundMessage="No matching drivers"
                        />
                        {selectedDriver && (
                            <Text size="xs" style={{ color: textSec }}>
                                📞 {selectedDriver.phone}
                                {selectedDriver.vehicle ? `  ·  Assigned to ${selectedDriver.vehicle.plate}` : ''}
                            </Text>
                        )}
                    </Stack>

                    <Stack gap={4}>
                        <Select
                            label="Vehicle"
                            placeholder="Select vehicle…"
                            required
                            searchable
                            clearable
                            value={data.vehicle_plate || null}
                            onChange={handleVehicleChange}
                            data={vehicleData}
                            error={errors.vehicle_plate}
                            styles={{ ...inputStyles, dropdown: dropdownStyle }}
                            nothingFoundMessage="No matching vehicles"
                        />
                        {selectedVehicle && (
                            <Text size="xs" style={{ color: textSec }}>
                                🚛 {selectedVehicle.make} {selectedVehicle.model_name} · {selectedVehicle.type}
                                {selectedVehicle.driver ? `  ·  ${selectedVehicle.driver.name}` : ''}
                            </Text>
                        )}
                    </Stack>

                    <TextInput label="Cargo Description" placeholder="Industrial Equipment, FMCG…" value={data.cargo_description ?? ''} onChange={e => setData('cargo_description', e.target.value)} error={errors.cargo_description} styles={inputStyles} />
                    <TextInput label="Container Number" placeholder="TRHU5515899 or LOOSE CARGO" value={data.container_number ?? ''} onChange={e => setData('container_number', e.target.value.toUpperCase())} error={errors.container_number} styles={inputStyles} maxLength={20} />
                    <NumberInput label="Cargo Weight (tons)" placeholder="28" min={0} step={0.5} value={data.cargo_weight_tons ?? ''} onChange={v => setData('cargo_weight_tons', v)} error={errors.cargo_weight_tons} styles={numStyles} />
                </SimpleGrid>

                {drivers.length === 0 && (
                    <Text size="xs" style={{ color: '#F59E0B', marginTop: 6 }}>
                        ⚠ No active drivers found.{' '}
                        <Box component="a" href="/system/drivers/create" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Register a driver →</Box>
                    </Text>
                )}
                {vehicles.length === 0 && (
                    <Text size="xs" style={{ color: '#F59E0B', marginTop: 6 }}>
                        ⚠ No available vehicles found.{' '}
                        <Box component="a" href="/system/fleet/create" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Add a vehicle →</Box>
                    </Text>
                )}
            </Section>

            {/* ── Financials ── */}
            <Section title="Financials (TZS)" icon="💰" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <NumberInput label="Freight Amount / TZS Income" placeholder="45,000,000" min={0} required value={data.freight_amount} onChange={v => setData('freight_amount', v)} error={errors.freight_amount} styles={numStyles} thousandSeparator="," />

                    {/* USD invoice block */}
                    <Box style={{ gridColumn: '1 / -1' }}>
                        <Box style={{ background: isDark ? 'rgba(59,130,246,0.05)' : '#EFF6FF', borderRadius: 10, padding: '14px 16px', border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE'}` }}>
                            <Text size="xs" fw={700} style={{ color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>💵 USD Invoice (optional)</Text>
                            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                                <NumberInput
                                    label="Invoice Amount (USD)"
                                    placeholder="15,000"
                                    min={0}
                                    value={data.invoice_usd}
                                    onChange={handleInvoiceUsd}
                                    error={errors.invoice_usd}
                                    styles={numStyles}
                                    thousandSeparator=","
                                    prefix="$ "
                                />
                                <NumberInput
                                    label="Exchange Rate (TZS per USD)"
                                    placeholder="2,550"
                                    min={0}
                                    value={data.exchange_rate}
                                    onChange={handleExchangeRate}
                                    error={errors.exchange_rate}
                                    styles={numStyles}
                                    thousandSeparator=","
                                />
                                <NumberInput
                                    label="Invoice TZS (auto-computed)"
                                    placeholder="38,250,000"
                                    min={0}
                                    value={data.invoice_tzs}
                                    onChange={v => setData('invoice_tzs', v)}
                                    error={errors.invoice_tzs}
                                    styles={{
                                        ...numStyles,
                                        input: { ...numStyles.input, background: isDark ? 'rgba(59,130,246,0.08)' : '#DBEAFE', fontWeight: 700 },
                                    }}
                                    thousandSeparator=","
                                />
                            </SimpleGrid>
                        </Box>
                    </Box>

                    <NumberInput label="Fuel Cost" placeholder="8,000,000" min={0} required value={data.fuel_cost} onChange={v => setData('fuel_cost', v)} error={errors.fuel_cost} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Driver Allowance" placeholder="1,500,000" min={0} required value={data.driver_allowance} onChange={v => setData('driver_allowance', v)} error={errors.driver_allowance} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Border Costs" placeholder="2,000,000" min={0} required value={data.border_costs} onChange={v => setData('border_costs', v)} error={errors.border_costs} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Road Fines" placeholder="0" min={0} value={data.road_fines ?? 0} onChange={v => setData('road_fines', v)} error={errors.road_fines} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Guard Fees (Mlinzi)" placeholder="0" min={0} value={data.guard_fees ?? 0} onChange={v => setData('guard_fees', v)} error={errors.guard_fees} styles={numStyles} thousandSeparator="," />
                    <NumberInput label="Other Costs" placeholder="500,000" min={0} required value={data.other_costs} onChange={v => setData('other_costs', v)} error={errors.other_costs} styles={numStyles} thousandSeparator="," />
                </SimpleGrid>

                {/* Live P&L summary */}
                <Box style={{
                    background: profit >= 0 ? (isDark ? 'rgba(34,197,94,0.07)' : '#F0FDF4') : (isDark ? 'rgba(239,68,68,0.07)' : '#FEF2F2'),
                    borderRadius: 10, padding: '14px 18px',
                    border: `1px solid ${profit >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                    <Group justify="space-between">
                        <Text size="sm" style={{ color: textSec }}>Total Costs</Text>
                        <Text size="sm" fw={600} style={{ color: '#EF4444' }}>TZS {new Intl.NumberFormat('en-TZ').format(totalCosts)}</Text>
                    </Group>
                    <Group justify="space-between" mt={6}>
                        <Text size="sm" fw={700} style={{ color: textPri }}>Net {profit >= 0 ? 'Profit' : 'Loss'}</Text>
                        <Text size="sm" fw={800} style={{ color: profit >= 0 ? '#22C55E' : '#EF4444' }}>
                            TZS {new Intl.NumberFormat('en-TZ').format(Math.abs(profit))} {profit < 0 ? '(Loss)' : ''}
                        </Text>
                    </Group>
                </Box>
            </Section>

            {/* ── Notes ── */}
            <Section title="Notes" icon="📝" isDark={isDark}>
                <Textarea
                    placeholder="Additional notes, instructions, or remarks…"
                    minRows={3}
                    value={data.notes ?? ''}
                    onChange={e => setData('notes', e.target.value)}
                    error={errors.notes}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                />
            </Section>

            <Group justify="flex-end" gap="md">
                <Box
                    component={Link} href={backHref}
                    style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 10, background: cardBg, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                >
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                        type="submit"
                        loading={processing}
                        style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, fontWeight: 700, boxShadow: '0 4px 16px rgba(234,88,12,0.4)' }}
                    >
                        {submitLabel}
                    </Button>
                </motion.div>
            </Group>
        </form>
    );
}

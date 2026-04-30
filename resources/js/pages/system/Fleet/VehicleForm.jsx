import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const dk = {
    card:    '#0F1E32',
    cardHov: '#132436',
    border:  'rgba(33,150,243,0.12)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: '#94A3B8',
    textMut: '#475569',
};

// ─── helpers ────────────────────────────────────────────────────────────────

function docStatus(dateStr) {
    if (!dateStr) return null;
    const days = Math.floor((new Date(dateStr) - new Date()) / 86400000);
    if (days < 0)   return { color: '#EF4444', label: 'EXPIRED',          days };
    if (days <= 30) return { color: '#F59E0B', label: `${days}d left`,    days };
                    return { color: '#22C55E', label: new Date(dateStr).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: '2-digit' }), days };
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ icon, title, children, isDark }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px' }}>{children}</Box>
        </Box>
    );
}

// ─── Live Preview Card ────────────────────────────────────────────────────────

function VehiclePreview({ data, drivers, typeIcons, isDark }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const assignedDriver = drivers.find(d => String(d.id) === String(data.driver_id));
    const typeIcon = typeIcons?.[data.type] ?? '🚗';

    const docs = [
        { label: 'Insurance',        value: data.insurance_expiry },
        { label: 'Road Licence',     value: data.road_licence_expiry },
        { label: 'Fitness',          value: data.fitness_expiry },
        { label: 'TRA Sticker',      value: data.tra_sticker_expiry },
        { label: 'GVL',              value: data.goods_vehicle_licence_expiry },
        { label: 'Next Service',     value: data.next_service_date },
    ];

    const hasAnyDoc = docs.some(d => d.value);
    const plate = data.plate || 'TZA-000-X';

    return (
        <Box style={{ position: 'sticky', top: 24 }}>
            {/* Preview label */}
            <Text size="10px" fw={700} style={{ color: textMut, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Live Preview</Text>

            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                {/* Accent bar */}
                <Box style={{ height: 4, background: 'linear-gradient(90deg, #1565C0, #2196F3, #60A5FA)' }} />

                <Box style={{ padding: '20px' }}>
                    {/* Plate badge */}
                    <Box style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Box style={{ display: 'inline-block', background: isDark ? '#0B1627' : '#F0F4F9', border: `2px solid ${isDark ? dk.border : '#CBD5E1'}`, borderRadius: 10, padding: '8px 20px', minWidth: 160 }}>
                            <Text fw={900} style={{ color: textPri, fontSize: 22, letterSpacing: 4, fontFamily: 'monospace' }}>
                                {plate.toUpperCase()}
                            </Text>
                            <Text size="9px" fw={700} style={{ color: textMut, letterSpacing: 2, marginTop: 2 }}>TANZANIA</Text>
                        </Box>
                    </Box>

                    {/* Type icon + Make/Model */}
                    <Box style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: '2.2rem', marginBottom: 4 }}>{typeIcon}</Text>
                        <Text fw={800} size="md" style={{ color: textPri }}>
                            {data.make || 'Make'} {data.model_name || 'Model'}
                        </Text>
                        <Group gap={8} justify="center" mt={4}>
                            {data.year && <Text size="xs" style={{ color: textSec }}>{data.year}</Text>}
                            {data.type && <Text size="xs" style={{ color: textSec }}>· {data.type}</Text>}
                            {data.color && <Text size="xs" style={{ color: textSec }}>· {data.color}</Text>}
                        </Group>
                    </Box>

                    <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 14, marginBottom: 14 }}>
                        {/* Assigned driver */}
                        <Group gap={8} mb={8}>
                            <Text size="sm">👤</Text>
                            <Text size="sm" style={{ color: assignedDriver ? textPri : textMut }}>
                                {assignedDriver ? assignedDriver.name : 'No driver assigned'}
                            </Text>
                        </Group>
                        {/* Specs */}
                        {(data.payload_tons || data.mileage_km) && (
                            <Group gap={16} mb={8}>
                                {data.payload_tons && (
                                    <Group gap={6}>
                                        <Text size="sm">⚖️</Text>
                                        <Text size="sm" style={{ color: textSec }}>{data.payload_tons}t payload</Text>
                                    </Group>
                                )}
                                {data.mileage_km > 0 && (
                                    <Group gap={6}>
                                        <Text size="sm">🔢</Text>
                                        <Text size="sm" style={{ color: textSec }}>{Number(data.mileage_km).toLocaleString()} km</Text>
                                    </Group>
                                )}
                            </Group>
                        )}
                        {(data.fuel_type || data.fuel_tank_capacity_l) && (
                            <Group gap={6} mb={8}>
                                <Text size="sm">⛽</Text>
                                <Text size="sm" style={{ color: textSec }}>
                                    {data.fuel_type?.toUpperCase()}
                                    {data.fuel_tank_capacity_l ? ` · ${data.fuel_tank_capacity_l}L tank` : ''}
                                </Text>
                            </Group>
                        )}
                        {data.owner_name && (
                            <Group gap={6} mb={4}>
                                <Text size="sm">🏢</Text>
                                <Text size="sm" style={{ color: textSec }}>{data.owner_name}</Text>
                            </Group>
                        )}
                    </Box>

                    {/* Documents */}
                    {hasAnyDoc && (
                        <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 14 }}>
                            <Text size="xs" fw={700} style={{ color: textMut, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Documents</Text>
                            <Stack gap={6}>
                                {docs.filter(d => d.value).map(d => {
                                    const s = docStatus(d.value);
                                    return (
                                        <Group key={d.label} justify="space-between">
                                            <Text size="xs" style={{ color: textSec }}>{d.label}</Text>
                                            <Box style={{ background: s.color + '18', border: `1px solid ${s.color}40`, borderRadius: 6, padding: '1px 8px' }}>
                                                <Text size="10px" fw={700} style={{ color: s.color }}>{s.label}</Text>
                                            </Box>
                                        </Group>
                                    );
                                })}
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Chassis/Engine small print */}
            {(data.chassis_number || data.engine_number) && (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '10px 14px', marginTop: 10 }}>
                    {data.chassis_number && (
                        <Group gap={6} mb={data.engine_number ? 4 : 0}>
                            <Text size="xs" style={{ color: textMut }}>Chassis:</Text>
                            <Text size="xs" fw={600} style={{ color: textSec, fontFamily: 'monospace' }}>{data.chassis_number.toUpperCase()}</Text>
                        </Group>
                    )}
                    {data.engine_number && (
                        <Group gap={6}>
                            <Text size="xs" style={{ color: textMut }}>Engine:</Text>
                            <Text size="xs" fw={600} style={{ color: textSec, fontFamily: 'monospace' }}>{data.engine_number.toUpperCase()}</Text>
                        </Group>
                    )}
                </Box>
            )}
        </Box>
    );
}

// ─── Main form ───────────────────────────────────────────────────────────────

export default function VehicleForm({ data, setData, errors, statuses, types, fuelTypes = ['diesel', 'petrol', 'cng'], typeIcons = {}, drivers = [], processing, onSubmit, backHref, submitLabel = 'Save Vehicle' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const numStyles = { ...inputStyles, section: { color: textSec } };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    const docWarning = (dateStr) => {
        if (!dateStr) return null;
        const s = docStatus(dateStr);
        if (!s || s.days > 30) return null;
        return (
            <Text size="xs" style={{ color: s.color, marginTop: 3 }}>
                ⚠ {s.days < 0 ? `Expired ${Math.abs(s.days)} days ago` : `Expires in ${s.days} days`}
            </Text>
        );
    };

    return (
        <form onSubmit={onSubmit}>
            {/* Two-column layout: form left, preview right */}
            <Group align="flex-start" gap="xl" style={{ flexWrap: 'nowrap' }}>
                {/* ── Form column ── */}
                <Box style={{ flex: 1, minWidth: 0 }}>

                    <Section icon="🚛" title="Vehicle Identity" isDark={isDark}>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <TextInput
                                label="Plate Number" placeholder="TZA-221-A" required
                                value={data.plate}
                                onChange={e => setData('plate', e.target.value.toUpperCase())}
                                error={errors.plate} styles={inputStyles}
                            />
                            <Select
                                label="Status" required value={data.status}
                                onChange={v => setData('status', v)}
                                data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                                error={errors.status} styles={{ ...inputStyles, dropdown: dropdownStyle }}
                            />
                            <TextInput
                                label="Make (Brand)" placeholder="Mercedes-Benz, MAN, Scania…" required
                                value={data.make} onChange={e => setData('make', e.target.value)}
                                error={errors.make} styles={inputStyles}
                            />
                            <TextInput
                                label="Model" placeholder="Actros 2645, TGS 26.440…" required
                                value={data.model_name} onChange={e => setData('model_name', e.target.value)}
                                error={errors.model_name} styles={inputStyles}
                            />
                            <Select
                                label="Vehicle Type" required value={data.type}
                                onChange={v => setData('type', v)}
                                data={types.map(t => ({ value: t, label: `${typeIcons[t] ?? ''} ${t}` }))}
                                error={errors.type} styles={{ ...inputStyles, dropdown: dropdownStyle }}
                            />
                            <NumberInput
                                label="Year" required min={1990} max={new Date().getFullYear() + 1}
                                value={data.year} onChange={v => setData('year', v)}
                                error={errors.year} styles={numStyles}
                            />
                            <TextInput
                                label="Color" placeholder="White, Red, Blue…"
                                value={data.color ?? ''} onChange={e => setData('color', e.target.value)}
                                error={errors.color} styles={inputStyles}
                            />
                            <TextInput
                                label="Owner Name" placeholder="SH Malik Logistics"
                                value={data.owner_name ?? ''} onChange={e => setData('owner_name', e.target.value)}
                                error={errors.owner_name} styles={inputStyles}
                            />
                        </SimpleGrid>
                    </Section>

                    <Section icon="👤" title="Driver Assignment" isDark={isDark}>
                        <Select
                            label="Assigned Driver"
                            placeholder="Search and select a driver (optional)"
                            value={data.driver_id ? String(data.driver_id) : null}
                            onChange={v => setData('driver_id', v ? Number(v) : null)}
                            clearable searchable
                            data={drivers.map(d => ({ value: String(d.id), label: `${d.name}  ·  ${d.phone}` }))}
                            error={errors.driver_id}
                            styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        />
                        {drivers.length === 0 && (
                            <Text size="xs" style={{ color: textSec, marginTop: 8 }}>
                                No active drivers found. <a href="/system/drivers/create" style={{ color: '#3B82F6' }}>Register a driver first →</a>
                            </Text>
                        )}
                    </Section>

                    <Section icon="⚙️" title="Specifications" isDark={isDark}>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <TextInput
                                label="Chassis Number" placeholder="XXXXXXXXXXXXXXXXX"
                                value={data.chassis_number ?? ''}
                                onChange={e => setData('chassis_number', e.target.value.toUpperCase())}
                                error={errors.chassis_number} styles={inputStyles}
                            />
                            <TextInput
                                label="Engine Number" placeholder="Engine serial"
                                value={data.engine_number ?? ''}
                                onChange={e => setData('engine_number', e.target.value.toUpperCase())}
                                error={errors.engine_number} styles={inputStyles}
                            />
                            <NumberInput
                                label="Payload Capacity (tons)" placeholder="28" min={0} step={0.5}
                                value={data.payload_tons ?? ''}
                                onChange={v => setData('payload_tons', v)}
                                error={errors.payload_tons} styles={numStyles}
                            />
                            <NumberInput
                                label="Current Mileage (km)" placeholder="150,000" required min={0}
                                value={data.mileage_km}
                                onChange={v => setData('mileage_km', v)}
                                thousandSeparator=","
                                error={errors.mileage_km} styles={numStyles}
                            />
                            <Select
                                label="Fuel Type" required value={data.fuel_type}
                                onChange={v => setData('fuel_type', v)}
                                data={fuelTypes.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
                                error={errors.fuel_type} styles={{ ...inputStyles, dropdown: dropdownStyle }}
                            />
                            <NumberInput
                                label="Fuel Tank Capacity (litres)" placeholder="400" min={0}
                                value={data.fuel_tank_capacity_l ?? ''}
                                onChange={v => setData('fuel_tank_capacity_l', v)}
                                error={errors.fuel_tank_capacity_l} styles={numStyles}
                            />
                        </SimpleGrid>
                    </Section>

                    <Section icon="📄" title="Documents & Expiry Dates" isDark={isDark}>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            {[
                                { key: 'insurance_expiry',             label: 'Insurance Expiry' },
                                { key: 'road_licence_expiry',          label: 'Road Licence Expiry' },
                                { key: 'fitness_expiry',               label: 'Fitness Certificate Expiry' },
                                { key: 'tra_sticker_expiry',           label: 'TRA Sticker Expiry' },
                                { key: 'goods_vehicle_licence_expiry', label: 'Goods Vehicle Licence Expiry' },
                                { key: 'next_service_date',            label: 'Next Service Date' },
                            ].map(({ key, label }) => (
                                <Stack key={key} gap={2}>
                                    <TextInput
                                        label={label} type="date"
                                        value={data[key] ?? ''}
                                        onChange={e => setData(key, e.target.value)}
                                        error={errors[key]} styles={inputStyles}
                                    />
                                    {docWarning(data[key])}
                                </Stack>
                            ))}
                        </SimpleGrid>
                    </Section>

                    <Section icon="📝" title="Notes" isDark={isDark}>
                        <Textarea
                            placeholder="Additional notes, remarks, or special instructions…"
                            minRows={3}
                            value={data.notes ?? ''}
                            onChange={e => setData('notes', e.target.value)}
                            error={errors.notes}
                            styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                        />
                    </Section>

                    <Group justify="flex-end" gap="md" mt="lg">
                        <Box
                            component={Link} href={backHref}
                            style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                        >
                            Cancel
                        </Box>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Box
                                component="button" type="submit" disabled={processing}
                                style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}
                            >
                                {processing ? 'Saving…' : submitLabel}
                            </Box>
                        </motion.div>
                    </Group>
                </Box>

                {/* ── Preview column (hidden on mobile) ── */}
                <Box visibleFrom="lg" style={{ width: 280, flexShrink: 0 }}>
                    <VehiclePreview data={data} drivers={drivers} typeIcons={typeIcons} isDark={isDark} />
                </Box>
            </Group>
        </form>
    );
}

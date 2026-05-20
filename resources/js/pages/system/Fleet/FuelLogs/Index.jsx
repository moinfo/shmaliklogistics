import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, TextInput, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

const fmt  = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function FuelTypePill({ type }) {
    const colors = { diesel: '#3B82F6', petrol: '#22C55E', cng: '#8B5CF6' };
    const color = colors[type] ?? '#94A3B8';
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: color + '18', border: `1px solid ${color}35`, borderRadius: 20, padding: '2px 8px' }}>
            <Text size="10px" fw={700} style={{ color }}>{(type ?? '—').toUpperCase()}</Text>
        </Box>
    );
}

export default function FuelLogsIndex({ logs, stats, vehicles, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const [vehicleId, setVehicleId] = useState(filters.vehicle_id ?? '');
    const [search, setSearch]       = useState(filters.search ?? '');

    const [form, setForm] = useState({
        vehicle_id: '', driver_id: '', trip_id: '',
        log_date: new Date().toISOString().slice(0, 10),
        liters: '', cost_per_liter: '', odometer_km: '',
        station_name: '', fuel_type: 'diesel', currency: 'TZS', notes: '',
    });
    const [showForm, setShowForm] = useState(false);
    const can = useCan();

    const applyFilters = (vid, s) => {
        router.get('/system/fleet/fuel-logs', { vehicle_id: vid, search: s }, { preserveState: true, replace: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post('/system/fleet/fuel-logs', form, {
            onSuccess: () => {
                setShowForm(false);
                setForm(prev => ({ ...prev, liters: '', cost_per_liter: '', odometer_km: '', station_name: '', notes: '' }));
            }
        });
    };

    const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textPri, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

    const statCards = [
        {
            icon: '⛽', label: 'This Month (Liters)', value: fmt(stats.month_liters),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '💰', label: 'This Month (Cost)', value: `TZS ${fmt(stats.month_cost)}`,
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
        {
            icon: '📊', label: 'Total Liters (All)', value: fmt(stats.total_liters),
            grad: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)',
            glow: '0 8px 28px rgba(139,92,246,0.4)',
        },
        {
            icon: '📋', label: 'Total Records', value: String(stats.log_count),
            grad: 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #F59E0B 100%)',
            glow: '0 8px 28px rgba(245,158,11,0.4)',
        },
    ];

    const cols = '120px 130px 80px 110px 130px 140px 150px 44px';

    return (
        <DashboardLayout title="Fuel Logs">
            <Head title="Fuel Logs" />

            {/* ── Page header ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={28} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '22px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }} wrap="wrap" gap="md">
                        <Stack gap={4}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                    ⛽
                                </Box>
                                <Stack gap={1}>
                                    <Text fw={900} size="lg" c="white">Fuel Logs</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Track fuel consumption and costs across the fleet</Text>
                                </Stack>
                            </Group>
                        </Stack>
                        <Group gap={10}>
                            <Box component={Link} href="/system/fleet"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                🚗 Fleet
                            </Box>
                            {can('fleet_fuel_logs.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component="button" type="button" onClick={() => setShowForm(v => !v)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        {showForm ? '✕ Cancel' : '＋ Add Fuel Log'}
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Stat cards — full gradient ── */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: s.value.length > 10 ? '1.3rem' : '1.8rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── Add Fuel Log Form ── */}
            {showForm && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <Box mb={16} style={{ background: cardBg, border: `1px solid rgba(234,88,12,0.3)`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #F97316)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}>
                                <Text size="md">⛽</Text>
                                <Text fw={700} size="sm" style={{ color: textPri }}>Record Fuel Fill</Text>
                            </Group>
                        </Box>
                        <Box style={{ padding: '16px 20px' }}>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Vehicle *</Text>
                                        <select value={form.vehicle_id} onChange={e => setForm(p => ({ ...p, vehicle_id: e.target.value }))} style={inputStyle} required>
                                            <option value="">Select vehicle</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.make} {v.model_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Date *</Text>
                                        <input type="date" value={form.log_date} onChange={e => setForm(p => ({ ...p, log_date: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Liters *</Text>
                                        <input type="number" step="0.01" min="1" placeholder="150.00" value={form.liters} onChange={e => setForm(p => ({ ...p, liters: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Cost/Liter *</Text>
                                        <input type="number" step="0.01" min="0" placeholder="2800" value={form.cost_per_liter} onChange={e => setForm(p => ({ ...p, cost_per_liter: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Odometer (km)</Text>
                                        <input type="number" min="0" placeholder="85000" value={form.odometer_km} onChange={e => setForm(p => ({ ...p, odometer_km: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Station</Text>
                                        <input type="text" placeholder="e.g. Total Kariakoo" value={form.station_name} onChange={e => setForm(p => ({ ...p, station_name: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Fuel Type</Text>
                                        <select value={form.fuel_type} onChange={e => setForm(p => ({ ...p, fuel_type: e.target.value }))} style={inputStyle}>
                                            <option value="diesel">Diesel</option>
                                            <option value="petrol">Petrol</option>
                                            <option value="cng">CNG</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Currency</Text>
                                        <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} style={inputStyle}>
                                            {['TZS','USD','ZMW','KES'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Notes</Text>
                                    <input type="text" placeholder="Optional notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={inputStyle} />
                                </div>
                                {form.liters && form.cost_per_liter && (
                                    <Box style={{ background: isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 14 }}>
                                        <Group gap={8}>
                                            <Text size="sm">⛽</Text>
                                            <Text size="sm" style={{ color: '#22C55E' }}>
                                                Total: <strong>{form.currency} {fmt(Number(form.liters) * Number(form.cost_per_liter))}</strong>
                                            </Text>
                                        </Group>
                                    </Box>
                                )}
                                <button type="submit" style={{ padding: '9px 24px', borderRadius: 8, background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(194,65,12,0.3)' }}>
                                    Save Fuel Log
                                </button>
                            </form>
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* ── Filters ── */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <Select
                        placeholder="All vehicles"
                        value={vehicleId}
                        onChange={v => { setVehicleId(v ?? ''); applyFilters(v ?? '', search); }}
                        clearable
                        data={vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make}` }))}
                        w={220}
                        styles={{
                            input: { background: inputBg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
                        }}
                    />
                    <TextInput
                        placeholder="Search plate, station…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(vehicleId, search)}
                        leftSection={<Text size="sm">🔍</Text>}
                        style={{ flex: 1 }}
                        styles={{
                            input: { background: inputBg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
                        }}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters(vehicleId, search)} size={38} radius={10}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* ── Table ── */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Table toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Fuel Logs</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {logs.data.length > 0 ? `Showing ${logs.from ?? 1}–${logs.to ?? logs.data.length} of ${logs.total ?? logs.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Table head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Date', 'Vehicle', 'Liters', 'Cost / L', 'Total Cost', 'Station', 'Driver', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {logs.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0',
                            border: '2px dashed rgba(234,88,12,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.4rem', margin: '0 auto 20px',
                        }}>
                            ⛽
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No fuel logs yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Record the first fuel fill to start tracking</Text>
                    </Box>
                ) : (
                    logs.data.map((log, i) => {
                        const total = Number(log.liters) * Number(log.cost_per_liter);
                        return (
                            <motion.div key={log.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{
                                        display: 'grid', gridTemplateColumns: cols, gap: 0,
                                        padding: '13px 20px', borderBottom: `1px solid ${divider}`,
                                        alignItems: 'center',
                                        transition: 'background 0.15s, border-left 0.15s',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = rowHov;
                                        e.currentTarget.style.borderLeft = '3px solid #EA580C';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.borderLeft = '3px solid transparent';
                                    }}>

                                    {/* Date */}
                                    <Stack gap={1}>
                                        <Text size="xs" fw={600} style={{ color: textPri }}>{fmtD(log.log_date)}</Text>
                                        <FuelTypePill type={log.fuel_type} />
                                    </Stack>

                                    {/* Vehicle */}
                                    <Box component={Link} href={`/system/fleet/${log.vehicle_id}`}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px', width: 'fit-content', textDecoration: 'none' }}>
                                        <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{log.vehicle?.plate}</Text>
                                    </Box>

                                    {/* Liters */}
                                    <Text size="sm" fw={700} style={{ color: textPri }}>{log.liters}L</Text>

                                    {/* Cost/L */}
                                    <Stack gap={1}>
                                        <Text size="sm" fw={600} style={{ color: textSec }}>{fmt(log.cost_per_liter)}</Text>
                                        <Text size="10px" style={{ color: textMut }}>{log.currency}</Text>
                                    </Stack>

                                    {/* Total Cost */}
                                    <Stack gap={1}>
                                        <Text size="sm" fw={800} style={{ color: '#22C55E', fontVariantNumeric: 'tabular-nums' }}>{fmt(total)}</Text>
                                        <Text size="10px" style={{ color: textMut }}>{log.currency}</Text>
                                    </Stack>

                                    {/* Station */}
                                    <Text size="sm" style={{ color: log.station_name ? textSec : textMut }}>{log.station_name ?? '—'}</Text>

                                    {/* Driver */}
                                    <Text size="sm" style={{ color: log.driver ? textPri : textMut }}>{log.driver?.name ?? '—'}</Text>

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap">
                                        {can('fleet_fuel_logs.delete') && (
                                            <Tooltip label="Delete" position="top" withArrow>
                                                <ActionIcon size={30} variant="subtle"
                                                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}
                                                    onClick={() => confirm('Delete this fuel log?') && router.delete(`/system/fleet/fuel-logs/${log.id}`)}>
                                                    <Text size="xs">🗑️</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {/* Table footer */}
                {logs.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>
                            {logs.total ?? logs.data.length} total record{(logs.total ?? logs.data.length) !== 1 ? 's' : ''}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* ── Pagination ── */}
            {logs.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={logs.current_page}
                        total={logs.last_page}
                        onChange={p => router.get('/system/fleet/fuel-logs', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}

            {/* ── Back link ── */}
            <Box mt="xl">
                <Box component={Link} href="/system/fleet"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Fleet
                </Box>
            </Box>
        </DashboardLayout>
    );
}

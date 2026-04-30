import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, TextInput, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };
const fmt  = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function FuelLogsIndex({ logs, stats, vehicles, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? dk.card : '#fff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : '#94A3B8';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const [vehicleId, setVehicleId] = useState(filters.vehicle_id ?? '');
    const [search, setSearch]       = useState(filters.search ?? '');

    // Add-log form state
    const [form, setForm] = useState({ vehicle_id: '', driver_id: '', trip_id: '', log_date: new Date().toISOString().slice(0, 10), liters: '', cost_per_liter: '', odometer_km: '', station_name: '', fuel_type: 'diesel', currency: 'TZS', notes: '' });
    const [showForm, setShowForm] = useState(false);

    const applyFilters = (vid, s) => {
        router.get('/system/fleet/fuel-logs', { vehicle_id: vid, search: s }, { preserveState: true, replace: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post('/system/fleet/fuel-logs', form, {
            onSuccess: () => { setShowForm(false); setForm(prev => ({ ...prev, liters: '', cost_per_liter: '', odometer_km: '', station_name: '', notes: '' })); }
        });
    };

    const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textPri, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

    const statCards = [
        { icon: '⛽', label: 'This Month (Liters)', value: fmt(stats.month_liters), accent: ['#1565C0', '#2196F3'] },
        { icon: '💰', label: 'This Month (Cost)',   value: `TZS ${fmt(stats.month_cost)}`, accent: ['#065F46', '#059669'] },
        { icon: '📊', label: 'Total Liters (All)',  value: fmt(stats.total_liters), accent: ['#5B21B6', '#8B5CF6'] },
        { icon: '📋', label: 'Total Records',        value: String(stats.log_count), accent: ['#78350F', '#F59E0B'] },
    ];

    return (
        <DashboardLayout title="Fuel Logs">
            <Head title="Fuel Logs" />

            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Fuel Logs</Text>
                    <Text size="sm" style={{ color: textSec }}>Track fuel consumption and costs across the fleet</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="button" onClick={() => setShowForm(v => !v)}
                        style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                        {showForm ? '✕ Cancel' : '＋ Add Fuel Log'}
                    </Box>
                </motion.div>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` }} />
                            <Text style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</Text>
                            <Text fw={800} size="lg" style={{ color: textPri }}>{s.value}</Text>
                            <Text size="xs" style={{ color: textMut, marginTop: 2 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Add Fuel Log Form */}
            {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <Box style={{ background: cardBg, border: `1px solid #3B82F640`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
                        <Text fw={700} size="sm" style={{ color: textPri, marginBottom: 16 }}>⛽ Record Fuel Fill</Text>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 4 }}>Vehicle *</Text>
                                    <select value={form.vehicle_id} onChange={e => setForm(p => ({ ...p, vehicle_id: e.target.value }))} style={{ ...inputStyle }} required>
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
                                <Box style={{ background: isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '8px 14px', marginBottom: 12 }}>
                                    <Text size="sm" style={{ color: '#22C55E' }}>
                                        Total: <strong>{form.currency} {fmt(Number(form.liters) * Number(form.cost_per_liter))}</strong>
                                    </Text>
                                </Box>
                            )}
                            <button type="submit" style={{ padding: '9px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#065F46,#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                Save Fuel Log
                            </button>
                        </form>
                    </Box>
                </motion.div>
            )}

            {/* Filters */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <Select
                        placeholder="All vehicles"
                        value={vehicleId}
                        onChange={v => { setVehicleId(v ?? ''); applyFilters(v ?? '', search); }}
                        clearable
                        data={vehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make}` }))}
                        styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        w={220}
                    />
                    <TextInput
                        placeholder="Search plate, station…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(vehicleId, search)}
                        style={{ flex: 1 }}
                        styles={{ input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri } }}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters(vehicleId, search)} style={{ background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', borderRadius: 8 }} size={36}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* Table */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <Box style={{ display: 'grid', gridTemplateColumns: '110px 120px 90px 90px 110px 120px 130px 50px', padding: '10px 20px', borderBottom: `1px solid ${divider}` }}>
                    {['Date', 'Vehicle', 'Liters', 'Cost/L', 'Total Cost', 'Station', 'Driver', ''].map(h => (
                        <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                    ))}
                </Box>

                {logs.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>⛽</Text>
                        <Text fw={600} style={{ color: textPri }}>No fuel logs yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Record the first fuel fill to start tracking</Text>
                    </Box>
                ) : (
                    logs.data.map((log, i) => {
                        const total = Number(log.liters) * Number(log.cost_per_liter);
                        return (
                            <Box key={log.id} style={{ display: 'grid', gridTemplateColumns: '110px 120px 90px 90px 110px 120px 130px 50px', padding: '12px 20px', borderBottom: `1px solid ${divider}` }}>
                                <Text size="sm" style={{ color: textSec }}>{fmtD(log.log_date)}</Text>
                                <Box component={Link} href={`/system/fleet/${log.vehicle_id}`} style={{ color: '#3B82F6', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>{log.vehicle?.plate}</Box>
                                <Text size="sm" fw={600} style={{ color: textPri }}>{log.liters}L</Text>
                                <Text size="sm" style={{ color: textSec }}>{log.currency} {fmt(log.cost_per_liter)}</Text>
                                <Text size="sm" fw={700} style={{ color: '#22C55E' }}>{log.currency} {fmt(total)}</Text>
                                <Text size="sm" style={{ color: textSec }}>{log.station_name ?? '—'}</Text>
                                <Text size="sm" style={{ color: log.driver ? textPri : textMut }}>{log.driver?.name ?? '—'}</Text>
                                <Tooltip label="Delete">
                                    <ActionIcon size="sm" variant="subtle" onClick={() => confirm('Delete this log?') && router.delete(`/system/fleet/fuel-logs/${log.id}`)}>
                                        <Text size="xs" style={{ color: '#EF4444' }}>✕</Text>
                                    </ActionIcon>
                                </Tooltip>
                            </Box>
                        );
                    })
                )}
            </Box>

            {logs.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={logs.current_page} total={logs.last_page} onChange={p => router.get('/system/fleet/fuel-logs', { ...filters, page: p })} size="sm" />
                </Group>
            )}

            <Group mt="md">
                <Box component={Link} href="/system/fleet" style={{ color: textMut, textDecoration: 'none', fontSize: 13 }}>← Back to Fleet</Box>
            </Group>
        </DashboardLayout>
    );
}

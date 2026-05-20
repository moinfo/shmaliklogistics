import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, ActionIcon, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function PersonAvatar({ name, size = 32 }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text size="xs" fw={900} style={{ color }}>{initials}</Text>
        </Box>
    );
}

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.color + '18', border: `1px solid ${meta.color}35`, borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>
            <Box style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}`, flexShrink: 0 }} />
            <Text size="xs" fw={700} style={{ color: meta.color, letterSpacing: 0.4 }}>{meta.label}</Text>
        </Box>
    );
}

function StarRating({ value }) {
    return (
        <Group gap={2} wrap="nowrap">
            {Array.from({ length: 5 }, (_, i) => (
                <Text key={i} style={{ fontSize: 12, color: i < (value || 0) ? '#F59E0B' : 'rgba(245,158,11,0.2)' }}>★</Text>
            ))}
            {value != null && <Text size="xs" fw={700} style={{ color: '#F59E0B', marginLeft: 3 }}>{value}</Text>}
        </Group>
    );
}

export default function AppraisalsIndex({ appraisals, employees, statuses, stats, filters }) {
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

    const [empId, setEmpId] = useState(filters.employee_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const can = useCan();

    const apply = (key, val) => {
        const updated = { employee_id: empId, status };
        updated[key] = val;
        if (key === 'employee_id') setEmpId(val);
        if (key === 'status') setStatus(val);
        const params = {};
        if (updated.employee_id) params.employee_id = updated.employee_id;
        if (updated.status) params.status = updated.status;
        router.get('/system/hr/appraisals', params, { preserveState: true, replace: true });
    };

    const iStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
    };

    const statCards = [
        { icon: '📋', label: 'Total',     value: String(stats.total),     grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '✅', label: 'Published', value: String(stats.published), grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { icon: '📝', label: 'Drafts',    value: String(stats.drafts),    grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.35)' },
        { icon: '⭐', label: 'Avg Score', value: `${stats.avg_score}/5`,  grad: 'linear-gradient(135deg, #7C2D8E 0%, #9333EA 60%, #A855F7 100%)', glow: '0 8px 28px rgba(168,85,247,0.35)' },
    ];

    const cols = '1fr 160px 80px 90px 100px 150px 140px 80px';

    return (
        <DashboardLayout title="Appraisals">
            <Head title="Appraisals" />

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⭐</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Performance Appraisals</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Driver performance reviews and KPI tracking</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('hr_appraisals.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/hr/appraisals/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ New Appraisal
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Stat cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md" justify="space-between">
                    <Group gap="md" style={{ flex: 1 }}>
                        <Select
                            placeholder="All employees"
                            value={empId}
                            onChange={v => apply('employee_id', v || '')}
                            data={[{ value: '', label: 'All Employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))]}
                            style={{ flex: 1 }}
                            styles={iStyles}
                        />
                        <Select
                            placeholder="All statuses"
                            value={status}
                            onChange={v => apply('status', v || '')}
                            data={[{ value: '', label: 'All' }, ...Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))]}
                            style={{ width: 180 }}
                            styles={iStyles}
                        />
                    </Group>
                </Group>
            </Box>

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Appraisals</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {appraisals.data.length > 0 ? `Showing ${appraisals.from ?? 1}–${appraisals.to ?? appraisals.data.length} of ${appraisals.total ?? appraisals.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Employee', 'Period', 'Trips', 'On-Time', 'Fuel Eff.', 'Score', 'Status', 'Action'].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {appraisals.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>⭐</Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No appraisals yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Create the first performance review</Text>
                    </Box>
                ) : (
                    appraisals.data.map((a, i) => {
                        const meta = statuses[a.status] ?? { label: a.status, color: '#94A3B8' };
                        return (
                            <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, padding: '13px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${meta.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/system/hr/appraisals/${a.id}`)}>

                                    {/* Employee */}
                                    <Group gap={8} wrap="nowrap">
                                        <PersonAvatar name={a.employee?.name} size={32} />
                                        <Stack gap={1}>
                                            <Text fw={700} size="sm" style={{ color: textPri }}>{a.employee?.name}</Text>
                                            <Text size="xs" style={{ color: textMut }}>{a.employee?.department}</Text>
                                        </Stack>
                                    </Group>

                                    {/* Period */}
                                    <Stack gap={1}>
                                        <Text size="xs" fw={600} style={{ color: textPri }}>
                                            {a.period_from ? new Date(a.period_from).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
                                        </Text>
                                        <Text size="10px" style={{ color: textMut }}>
                                            to {a.period_to ? new Date(a.period_to).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
                                        </Text>
                                    </Stack>

                                    {/* Trips */}
                                    <Text size="sm" style={{ color: textSec }}>{a.trips_count ?? '—'}</Text>

                                    {/* On-Time */}
                                    <Text size="sm" style={{ color: a.on_time_pct != null ? (a.on_time_pct >= 90 ? '#22C55E' : a.on_time_pct >= 70 ? '#F59E0B' : '#EF4444') : textSec }}>
                                        {a.on_time_pct != null ? `${a.on_time_pct}%` : '—'}
                                    </Text>

                                    {/* Fuel Eff */}
                                    <Text size="sm" style={{ color: textSec }}>{a.fuel_eff_kml != null ? `${a.fuel_eff_kml} km/L` : '—'}</Text>

                                    {/* Score */}
                                    {a.overall_score != null
                                        ? <StarRating value={Math.round(a.overall_score)} />
                                        : <Text size="sm" style={{ color: textMut }}>—</Text>
                                    }

                                    {/* Status */}
                                    <StatusPill status={a.status} statuses={statuses} />

                                    {/* Action */}
                                    <Box onClick={e => e.stopPropagation()}>
                                        {can('hr_appraisals.view') && (
                                            <Tooltip label="View appraisal" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/hr/appraisals/${a.id}`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                    <Text size="xs">👁</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {/* Footer */}
                {appraisals.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{appraisals.total ?? appraisals.data.length} total appraisal{(appraisals.total ?? appraisals.data.length) !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

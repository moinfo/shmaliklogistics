import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Tooltip, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
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

export default function PayrollIndex({ runs, stats, statuses, available }) {
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

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropRef = useRef(null);
    const can = useCan();

    useEffect(() => {
        const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDelete = (id) => {
        if (!confirm('Delete this payroll run? All slips will be removed.')) return;
        router.delete(`/system/hr/payroll/${id}`, { preserveScroll: true });
    };

    const createRun = (year, month) => {
        setDropdownOpen(false);
        router.post('/system/hr/payroll', { year, month });
    };

    const statCards = [
        {
            icon: '📋', label: 'Total Runs', value: String(stats.total_runs),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '✏️', label: 'Draft', value: String(stats.draft),
            grad: 'linear-gradient(135deg, #475569 0%, #64748B 60%, #94A3B8 100%)',
            glow: '0 8px 28px rgba(100,116,139,0.35)',
        },
        {
            icon: '✅', label: 'Processed', value: String(stats.processed),
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
        {
            icon: '👥', label: 'Active Employees', value: String(stats.active_employees),
            grad: 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
            glow: '0 8px 28px rgba(194,65,12,0.35)',
        },
    ];

    const cols = '180px 160px 1fr 120px 120px 100px 90px';

    return (
        <DashboardLayout title="Payroll Administration">
            <Head title="Payroll Administration" />

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
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💼</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Payroll Administration</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Monthly payroll runs — Tanzania statutory deductions applied automatically</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('hr_payroll.view') && (
                                <Box component={Link} href="/system/hr/payroll/create"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                    👁 Preview Current Payroll
                                </Box>
                            )}
                            {can('hr_payroll.create') && (
                                <Box style={{ position: 'relative' }} ref={dropRef}>
                                    <Group gap={0} style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        <Box onClick={() => available[0] && createRun(available[0].year, available[0].month)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                                            ＋ Create New Payroll
                                        </Box>
                                        <Box onClick={() => setDropdownOpen(!dropdownOpen)}
                                            style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.85)', color: '#C2410C', cursor: 'pointer', borderLeft: '1px solid rgba(194,65,12,0.2)', fontWeight: 700 }}>▾</Box>
                                    </Group>
                                    {dropdownOpen && available.length > 0 && (
                                        <Box style={{ position: 'absolute', right: 0, top: '110%', background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 10, overflow: 'hidden', zIndex: 100, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                            {available.map(a => (
                                                <Box key={`${a.year}-${a.month}`} onClick={() => createRun(a.year, a.month)}
                                                    style={{ padding: '10px 16px', cursor: 'pointer', color: textPri, fontSize: 14 }}
                                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#FFF7F0'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    {a.label}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
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

            {/* Table card */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Payroll Runs</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {runs.data.length > 0 ? `${runs.total ?? runs.data.length} total run${(runs.total ?? runs.data.length) !== 1 ? 's' : ''}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Doc Number', 'Payroll Number', 'Payroll Month', 'Employees', 'Status', 'Action', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {runs.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>💼</Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No payroll runs yet</Text>
                        <Text size="sm" style={{ color: textMut }}>Create your first payroll run to get started</Text>
                    </Box>
                ) : (
                    runs.data.map((run, i) => {
                        const meta = statuses[run.status] ?? { label: run.status, color: '#94A3B8' };
                        return (
                            <motion.div key={run.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, padding: '13px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${meta.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/system/hr/payroll/${run.id}`)}>

                                    {/* Doc Number */}
                                    <Box>
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                            <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{run.document_number ?? '—'}</Text>
                                        </Box>
                                    </Box>

                                    {/* Payroll Number */}
                                    <Text size="xs" fw={600} style={{ color: textSec, fontFamily: 'monospace' }}>{run.payroll_number ?? '—'}</Text>

                                    {/* Month */}
                                    <Text fw={700} size="sm" style={{ color: textPri }}>{MONTHS[run.month]} {run.year}</Text>

                                    {/* Employees */}
                                    <Group gap={6} align="center">
                                        <Box style={{ width: 22, height: 22, borderRadius: '50%', background: isDark ? 'rgba(99,102,241,0.15)' : '#EEF2FF', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>👤</Box>
                                        <Text size="sm" style={{ color: textSec }}>{run.slips_count}</Text>
                                    </Group>

                                    {/* Status */}
                                    <StatusPill status={run.status} statuses={statuses} />

                                    {/* Actions */}
                                    <Group gap={6} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        {can('hr_payroll.view') && (
                                            <Tooltip label="View run" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/hr/payroll/${run.id}`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                    <Text size="xs">👁</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {can('hr_payroll.delete') && run.status !== 'closed' && (
                                            <Tooltip label="Delete run" position="top" withArrow>
                                                <ActionIcon variant="subtle" size={30} onClick={() => handleDelete(run.id)}
                                                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}>
                                                    <Text size="xs">🗑️</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>

                                    <Box />
                                </Box>
                            </motion.div>
                        );
                    })
                )}

                {/* Footer */}
                {runs.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{runs.total ?? runs.data.length} total payroll run{(runs.total ?? runs.data.length) !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {runs.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination value={runs.current_page} total={runs.last_page} onChange={p => router.get('/system/hr/payroll', { page: p })} size="sm" styles={{ control: { borderRadius: 8 } }} />
                </Group>
            )}
        </DashboardLayout>
    );
}

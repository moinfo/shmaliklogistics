import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Badge, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function StatCard({ label, value, icon, color, isDark }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '16px 20px' }}>
            <Group gap={10}><Text style={{ fontSize: 22 }}>{icon}</Text><div>
                <Text size="xl" fw={800} style={{ color: color ?? (isDark ? dk.textPri : '#1E293B'), lineHeight: 1 }}>{value}</Text>
                <Text size="xs" style={{ color: isDark ? dk.textSec : '#64748B' }}>{label}</Text>
            </div></Group>
        </Box>
    );
}

export default function PayrollIndex({ runs, stats, statuses, available }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropRef = useRef(null);

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

    return (
        <DashboardLayout title="Payroll Administration">
            <Head title="Payroll Administration" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Payroll Administration</Text>
                    <Text size="sm" style={{ color: textSec }}>Monthly payroll runs — Tanzania statutory deductions applied automatically</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/payroll/create" style={{ padding: '10px 18px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13, border: `1px solid ${cardBorder}` }}>
                        👁 Preview Current Payroll
                    </Box>
                    {/* Month dropdown for quick creation */}
                    <Box style={{ position: 'relative' }} ref={dropRef}>
                        <Group gap={0} style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            <Box onClick={() => available[0] && createRun(available[0].year, available[0].month)}
                                style={{ padding: '10px 18px', background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                                + Create New Payroll
                            </Box>
                            <Box onClick={() => setDropdownOpen(!dropdownOpen)} style={{ padding: '10px 12px', background: '#1565C0', color: '#fff', cursor: 'pointer', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>▾</Box>
                        </Group>
                        {dropdownOpen && available.length > 0 && (
                            <Box style={{ position: 'absolute', right: 0, top: '110%', background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 8, overflow: 'hidden', zIndex: 100, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                {available.map(a => (
                                    <Box key={`${a.year}-${a.month}`} onClick={() => createRun(a.year, a.month)}
                                        style={{ padding: '10px 16px', cursor: 'pointer', color: textPri, fontSize: 14 }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        {a.label}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <StatCard label="Total Runs" value={stats.total_runs} icon="📋" isDark={isDark} />
                <StatCard label="Draft" value={stats.draft} icon="✏️" color="#94A3B8" isDark={isDark} />
                <StatCard label="Processed" value={stats.processed} icon="✅" color="#3B82F6" isDark={isDark} />
                <StatCard label="Active Employees" value={stats.active_employees} icon="👥" color="#22C55E" isDark={isDark} />
            </SimpleGrid>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}`, background: isDark ? 'var(--c-border-row)' : '#EFF6FF' }}>
                                {['#', 'DOCUMENT NUMBER', 'PAYROLL NUMBER', 'PAYROLL MONTH', 'EMPLOYEES', 'STATUS', 'ACTION'].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {runs.data.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No payroll runs yet.</td></tr>
                            ) : runs.data.map((run, idx) => (
                                <tr key={run.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 14px' }}><Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{idx + 1}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text fw={700} size="sm" style={{ color: '#3B82F6' }}>{run.document_number ?? '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec, fontFamily: 'monospace' }}>{run.payroll_number ?? '—'}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text fw={600} size="sm" style={{ color: textPri }}>{MONTHS[run.month]} {run.year}</Text></td>
                                    <td style={{ padding: '13px 14px' }}><Text size="sm" style={{ color: textSec }}>{run.slips_count} employees</Text></td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Badge size="sm" style={{ background: statuses[run.status]?.color + '22', color: statuses[run.status]?.color, border: `1px solid ${statuses[run.status]?.color}44` }}>
                                            {statuses[run.status]?.label}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '13px 14px' }}>
                                        <Group gap={6}>
                                            <Box component={Link} href={`/system/hr/payroll/${run.id}`} style={{ padding: '5px 12px', borderRadius: 6, background: '#22C55E', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>👁 View</Box>
                                            {run.status !== 'closed' && <Box component="button" onClick={() => handleDelete(run.id)} style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</Box>}
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {runs.last_page > 1 && (
                    <Box style={{ padding: '14px 18px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={runs.last_page} value={runs.current_page} onChange={p => router.get('/system/hr/payroll', { page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

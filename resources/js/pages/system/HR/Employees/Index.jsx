import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Tooltip, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function PersonAvatar({ name, size = 36 }) {
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

export default function EmployeesIndex({ employees, stats, statuses, departments, filters }) {
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

    const [search, setSearch]   = useState(filters.search ?? '');
    const [department, setDept] = useState(filters.department ?? '');
    const [status, setStatus]   = useState(filters.status ?? '');
    const can = useCan();

    const applyFilters = (overrides = {}) => {
        router.get('/system/hr/employees', { search, department, status, ...overrides }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (!confirm('Remove this employee?')) return;
        router.delete(`/system/hr/employees/${id}`, { preserveScroll: true });
    };

    const deptData   = [{ value: '', label: 'All departments' }, ...departments.map(d => ({ value: d, label: d }))];
    const statusData = [{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))];

    const statCards = [
        { icon: '👥', label: 'Total Employees', value: String(stats.total),    grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '✅', label: 'Active',           value: String(stats.active),   grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)', glow: '0 8px 28px rgba(16,185,129,0.4)' },
        { icon: '🏖️', label: 'On Leave',         value: String(stats.on_leave), grad: 'linear-gradient(135deg, #92400E 0%, #B45309 60%, #F59E0B 100%)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
        { icon: '🚛', label: 'Drivers',          value: String(stats.drivers ?? 0), grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
    ];

    const cols = '140px 1fr 200px 180px 160px 140px 80px';

    return (
        <DashboardLayout title="Employees">
            <Head title="Employees" />

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
                        <Group gap={10} align="center">
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                👤
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Employees</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Manage your workforce</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            {can('hr_employees.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component={Link} href="/system/hr/employees/create"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ Add Employee
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Stat cards ── */}
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

            {/* ── Filters ── */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search name, number, position…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        leftSection={<Text size="sm">🔍</Text>}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 } }}
                    />
                    <Select
                        placeholder="All departments"
                        value={department}
                        onChange={v => { setDept(v ?? ''); applyFilters({ department: v ?? '' }); }}
                        data={deptData}
                        clearable
                        w={190}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 }, dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 } }}
                    />
                    <Select
                        placeholder="All statuses"
                        value={status}
                        onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }}
                        data={statusData}
                        clearable
                        w={160}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 }, dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 } }}
                    />
                    <Tooltip label="Search">
                        <ActionIcon onClick={() => applyFilters({ search })} size={38} radius={10}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* ── Table card ── */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>

                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>All Employees</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>
                        {employees.data.length > 0 ? `Showing ${employees.from ?? 1}–${employees.to ?? employees.data.length} of ${employees.total ?? employees.data.length}` : '0 results'}
                    </Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Emp #', 'Name', 'Department / Position', 'Contact', 'Salary', 'Status', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                    ))}
                </Box>

                {employees.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                            👤
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No employees found</Text>
                        <Text size="sm" style={{ color: textMut }}>Try adjusting your filters or add a new employee</Text>
                    </Box>
                ) : (
                    employees.data.map((emp, i) => {
                        const meta = statuses[emp.status] ?? { label: emp.status, color: '#94A3B8' };
                        return (
                            <motion.div key={emp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Box
                                    style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, padding: '13px 20px', borderBottom: `1px solid ${divider}`, cursor: 'pointer', alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${meta.color}`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                    onClick={() => router.visit(`/system/hr/employees/${emp.id}`)}>

                                    {/* Emp # */}
                                    <Box>
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                            <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{emp.employee_number}</Text>
                                        </Box>
                                    </Box>

                                    {/* Name */}
                                    <Group gap={10} align="center">
                                        <PersonAvatar name={emp.name} />
                                        <Stack gap={2}>
                                            <Group gap={6} align="center" wrap="nowrap">
                                                <Text size="sm" fw={700} style={{ color: textPri, lineHeight: 1.2 }}>{emp.name}</Text>
                                                {emp.driver_id && (
                                                    <Box component={Link} href={`/system/drivers/${emp.driver_id}`} onClick={e => e.stopPropagation()}
                                                        title="This employee is a registered driver — view driver profile"
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 20, background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.35)', color: '#3B82F6', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                                        🚛 Driver
                                                    </Box>
                                                )}
                                            </Group>
                                            {emp.hire_date && <Text size="xs" style={{ color: textMut }}>Since {formatDate(emp.hire_date)}</Text>}
                                        </Stack>
                                    </Group>

                                    {/* Dept / Position */}
                                    <Stack gap={2}>
                                        {emp.department && <Text size="sm" fw={600} style={{ color: textPri }}>{emp.department}</Text>}
                                        {emp.position && <Text size="xs" style={{ color: textSec }}>{emp.position}</Text>}
                                        {!emp.department && !emp.position && <Text size="xs" style={{ color: textMut }}>—</Text>}
                                    </Stack>

                                    {/* Contact */}
                                    <Stack gap={2}>
                                        <Text size="sm" style={{ color: textSec }}>{emp.phone ?? '—'}</Text>
                                        {emp.email && <Text size="xs" style={{ color: textMut, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{emp.email}</Text>}
                                    </Stack>

                                    {/* Salary */}
                                    {emp.salary
                                        ? <Text size="sm" fw={700} style={{ color: '#F59E0B', whiteSpace: 'nowrap' }}>{emp.salary_currency} {Number(emp.salary).toLocaleString()}</Text>
                                        : <Text size="xs" style={{ color: textMut }}>—</Text>
                                    }

                                    {/* Status */}
                                    <StatusPill status={emp.status} statuses={statuses} />

                                    {/* Actions */}
                                    <Group gap={4} wrap="nowrap" onClick={e => e.stopPropagation()}>
                                        {can('hr_employees.view') && (
                                            <Tooltip label="View" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/hr/employees/${emp.id}`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', borderRadius: 8, color: textSec }}>
                                                    <Text size="xs">👁</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {can('hr_employees.edit') && (
                                            <Tooltip label="Edit" position="top" withArrow>
                                                <ActionIcon component={Link} href={`/system/hr/employees/${emp.id}/edit`} variant="subtle" size={30}
                                                    style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, color: '#EA580C' }}>
                                                    <Text size="xs">✏️</Text>
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {can('hr_employees.delete') && (
                                            <Tooltip label="Delete" position="top" withArrow>
                                                <ActionIcon variant="subtle" size={30} onClick={() => handleDelete(emp.id)}
                                                    style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}>
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

                {/* Footer */}
                {employees.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>
                            {employees.total ?? employees.data.length} total employee{(employees.total ?? employees.data.length) !== 1 ? 's' : ''}
                        </Text>
                    </Box>
                )}
            </Box>

            {/* ── Pagination ── */}
            {employees.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        value={employees.current_page}
                        total={employees.last_page}
                        onChange={p => router.get('/system/hr/employees', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

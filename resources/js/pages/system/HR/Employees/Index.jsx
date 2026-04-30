import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, Badge, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

function StatCard({ label, value, icon, color, isDark }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '16px 20px' }}>
            <Group gap={10}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
                <div>
                    <Text size="xl" fw={800} style={{ color: color ?? (isDark ? dk.textPri : '#1E293B'), lineHeight: 1 }}>{value}</Text>
                    <Text size="xs" style={{ color: isDark ? dk.textSec : '#64748B' }}>{label}</Text>
                </div>
            </Group>
        </Box>
    );
}

export default function EmployeesIndex({ employees, stats, statuses, departments, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [search, setSearch]       = useState(filters.search ?? '');
    const [department, setDept]     = useState(filters.department ?? '');
    const [status, setStatus]       = useState(filters.status ?? '');

    const applyFilters = (overrides = {}) => {
        router.get('/system/hr/employees', { search, department, status, ...overrides }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (!confirm('Remove this employee?')) return;
        router.delete(`/system/hr/employees/${id}`, { preserveScroll: true });
    };

    const deptData = [{ value: '', label: 'All departments' }, ...departments.map(d => ({ value: d, label: d }))];
    const statusData = [{ value: '', label: 'All statuses' }, ...Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))];

    return (
        <DashboardLayout title="Employees">
            <Head title="Employees" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Employees</Text>
                    <Text size="sm" style={{ color: textSec }}>Manage your workforce</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/hr/employees/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        + Add Employee
                    </Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md" mb="xl">
                <StatCard label="Total Employees" value={stats.total} icon="👥" isDark={isDark} />
                <StatCard label="Active" value={stats.active} icon="✅" color="#22C55E" isDark={isDark} />
                <StatCard label="On Leave" value={stats.on_leave} icon="🏖️" color="#F59E0B" isDark={isDark} />
            </SimpleGrid>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search name, number, position…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 } }}
                    />
                    <Select placeholder="All departments" value={department} onChange={v => { setDept(v ?? ''); applyFilters({ department: v ?? '' }); }} data={deptData} styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} style={{ width: 180 }} clearable />
                    <Select placeholder="All statuses" value={status} onChange={v => { setStatus(v ?? ''); applyFilters({ status: v ?? '' }); }} data={statusData} styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} style={{ width: 150 }} clearable />
                    <Box component="button" onClick={() => applyFilters({ search })} style={{ padding: '8px 18px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Search</Box>
                </Group>
            </Box>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['ID', 'Name', 'Department / Position', 'Contact', 'Salary', 'Status', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.data.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No employees found.</td></tr>
                            ) : employees.data.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="xs" fw={700} style={{ color: textSec, fontFamily: 'monospace' }}>{emp.employee_number}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text fw={700} size="sm" style={{ color: textPri }}>{emp.name}</Text>
                                        {emp.hire_date && <Text size="xs" style={{ color: textSec }}>Since {emp.hire_date}</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {emp.department && <Text size="sm" style={{ color: textPri }}>{emp.department}</Text>}
                                        {emp.position && <Text size="xs" style={{ color: textSec }}>{emp.position}</Text>}
                                        {!emp.department && !emp.position && <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>—</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: textSec }}>{emp.phone ?? '—'}</Text>
                                        {emp.email && <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>{emp.email}</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {emp.salary ? <Text size="sm" fw={600} style={{ color: '#F59E0B', whiteSpace: 'nowrap' }}>{emp.salary_currency} {Number(emp.salary).toLocaleString()}</Text> : <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>—</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Badge size="sm" style={{ background: statuses[emp.status]?.color + '22', color: statuses[emp.status]?.color, border: `1px solid ${statuses[emp.status]?.color}44` }}>
                                            {statuses[emp.status]?.label}
                                        </Badge>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon component={Link} href={`/system/hr/employees/${emp.id}`} variant="subtle" size="sm" style={{ color: '#3B82F6' }}>👁</ActionIcon>
                                            <ActionIcon component={Link} href={`/system/hr/employees/${emp.id}/edit`} variant="subtle" size="sm" style={{ color: textSec }}>✏️</ActionIcon>
                                            <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => handleDelete(emp.id)}>🗑️</ActionIcon>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {employees.last_page > 1 && (
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={employees.last_page} value={employees.current_page} onChange={p => router.get('/system/hr/employees', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

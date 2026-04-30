import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function Field({ label, value, isDark }) {
    return (
        <Box>
            <Text size="xs" fw={700} style={{ color: isDark ? dk.textSec : '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{label}</Text>
            <Text size="sm" style={{ color: isDark ? dk.textPri : '#1E293B' }}>{value ?? '—'}</Text>
        </Box>
    );
}

export default function ShowEmployee({ employee, statuses, leaveTypes }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const handleDelete = () => {
        if (!confirm('Remove this employee?')) return;
        router.delete(`/system/hr/employees/${employee.id}`);
    };

    const leaveRequests = employee.leave_requests ?? [];
    const pendingLeave  = leaveRequests.filter(l => l.status === 'pending').length;

    return (
        <DashboardLayout title="Employee">
            <Head title={employee.name} />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap="sm" align="center">
                        <Text fw={800} size="xl" style={{ color: textPri }}>{employee.name}</Text>
                        <Badge size="sm" style={{ background: statuses[employee.status]?.color + '22', color: statuses[employee.status]?.color, border: `1px solid ${statuses[employee.status]?.color}44` }}>
                            {statuses[employee.status]?.label}
                        </Badge>
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{employee.employee_number} · {employee.department ?? 'No department'}</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/employees" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back</Box>
                    <Box component={Link} href={`/system/hr/employees/${employee.id}/edit`} style={{ padding: '9px 18px', borderRadius: 9, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textPri, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>✏️ Edit</Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" onClick={handleDelete} style={{ padding: '9px 18px', borderRadius: 9, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>🗑️ Remove</Box>
                    </motion.div>
                </Group>
            </Group>

            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Personal */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    <Text fw={700} size="xs" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Personal</Text>
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field label="Phone" value={employee.phone} isDark={isDark} />
                        <Field label="Email" value={employee.email} isDark={isDark} />
                        <Field label="National ID" value={employee.national_id} isDark={isDark} />
                        <Field label="Date of Birth" value={employee.birth_date} isDark={isDark} />
                        <Box style={{ gridColumn: '1 / -1' }}><Field label="Address" value={employee.address} isDark={isDark} /></Box>
                    </Box>
                </Box>

                {/* Employment */}
                <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px' }}>
                    <Text fw={700} size="xs" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Employment</Text>
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field label="Position" value={employee.position} isDark={isDark} />
                        <Field label="Department" value={employee.department} isDark={isDark} />
                        <Field label="Hire Date" value={employee.hire_date} isDark={isDark} />
                        <Field label="Salary" value={employee.salary ? `${employee.salary_currency} ${Number(employee.salary).toLocaleString()}` : null} isDark={isDark} />
                        <Field label="Emergency Contact" value={employee.emergency_contact_name} isDark={isDark} />
                        <Field label="Emergency Phone" value={employee.emergency_contact_phone} isDark={isDark} />
                    </Box>
                </Box>
            </Box>

            {/* Leave history */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ padding: '16px 20px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text fw={700} size="sm" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1 }}>Leave Requests {pendingLeave > 0 && <Badge size="xs" color="yellow" ml={6}>{pendingLeave} pending</Badge>}</Text>
                    <Box component={Link} href={`/system/hr/leave/create?employee_id=${employee.id}`} style={{ fontSize: 12, color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>+ Request Leave</Box>
                </Box>
                {leaveRequests.length === 0 ? (
                    <Box style={{ padding: '32px', textAlign: 'center' }}>
                        <Text size="sm" style={{ color: textSec }}>No leave requests recorded.</Text>
                    </Box>
                ) : (
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                    {['Type', 'Period', 'Days', 'Status'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.map(l => (
                                    <tr key={l.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textPri }}>{leaveTypes[l.type]?.label ?? l.type}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textSec }}>{l.start_date} → {l.end_date}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textSec }}>{l.days}d</Text></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Badge size="sm" style={{ background: (l.status === 'approved' ? '#22C55E' : l.status === 'rejected' ? '#EF4444' : '#F59E0B') + '22', color: l.status === 'approved' ? '#22C55E' : l.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>
                                                {l.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

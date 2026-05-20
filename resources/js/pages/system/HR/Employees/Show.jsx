import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

function PersonAvatar({ name, size = 52 }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text fw={900} style={{ color, fontSize: size * 0.34 }}>{initials}</Text>
        </Box>
    );
}

function InfoRow({ icon, label, value, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: textPri, textAlign: 'right' }}>{value ?? '—'}</Text>
        </Box>
    );
}

function SectionCard({ title, icon, children, isDark, accent, toolbar }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
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

export default function ShowEmployee({ employee, statuses, leaveTypes }) {
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

    const handleDelete = () => {
        if (!confirm('Remove this employee?')) return;
        router.delete(`/system/hr/employees/${employee.id}`);
    };
    const can = useCan();

    const leaveRequests = employee.leave_requests ?? [];
    const pendingLeave  = leaveRequests.filter(l => l.status === 'pending').length;

    return (
        <DashboardLayout title="Employee">
            <Head title={employee.name} />

            {/* ── Page header banner ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={14} align="center">
                            <PersonAvatar name={employee.name} size={52} />
                            <Stack gap={4}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white">{employee.name}</Text>
                                    <Box style={{ background: (statuses[employee.status]?.color ?? '#94A3B8') + '30', border: `1px solid ${(statuses[employee.status]?.color ?? '#94A3B8')}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statuses[employee.status]?.color ?? '#94A3B8', boxShadow: `0 0 6px ${statuses[employee.status]?.color ?? '#94A3B8'}` }} />
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{statuses[employee.status]?.label}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Group gap={6}>
                                    <Box style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '2px 10px' }}>
                                        <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>{employee.employee_number}</Text>
                                    </Box>
                                    {employee.department && (
                                        <Text size="sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{employee.department}</Text>
                                    )}
                                </Group>
                            </Stack>
                        </Group>

                        <Group gap={8} wrap="wrap">
                            <Box component={Link} href="/system/hr/employees"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                ← Back
                            </Box>
                            {can('hr_employees.edit') && (
                                <Box component={Link} href={`/system/hr/employees/${employee.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                            {can('hr_employees.delete') && (
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Box component="button" onClick={handleDelete}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                                        🗑️ Remove
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Info cards ── */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                {/* Personal */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Personal Information" icon="👤" isDark={isDark} accent={['#C2410C', '#EA580C']}>
                        <InfoRow icon="📱" label="Phone"         value={employee.phone}              isDark={isDark} />
                        <InfoRow icon="📧" label="Email"         value={employee.email}              isDark={isDark} />
                        <InfoRow icon="🪪" label="National ID"   value={employee.national_id}        isDark={isDark} />
                        <InfoRow icon="🎂" label="Date of Birth" value={formatDate(employee.birth_date)} isDark={isDark} />
                        <InfoRow icon="🏠" label="Address"       value={employee.address}            isDark={isDark} />
                    </SectionCard>
                </motion.div>

                {/* Employment */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Employment Details" icon="💼" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow icon="🏷️" label="Position"          value={employee.position}   isDark={isDark} />
                        <InfoRow icon="🏢" label="Department"         value={employee.department} isDark={isDark} />
                        <InfoRow icon="📅" label="Hire Date"          value={formatDate(employee.hire_date)} isDark={isDark} />
                        <InfoRow icon="💰" label="Salary"             value={employee.salary ? `${employee.salary_currency} ${Number(employee.salary).toLocaleString()}` : null} isDark={isDark} />
                        <InfoRow icon="🆘" label="Emergency Contact"  value={employee.emergency_contact_name} isDark={isDark} />
                        <InfoRow icon="📞" label="Emergency Phone"    value={employee.emergency_contact_phone} isDark={isDark} />
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* ── Leave history ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    {/* accent */}
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #065F46, #059669)' }} />

                    {/* toolbar */}
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Text size="md">🏖️</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Leave Requests</Text>
                            {pendingLeave > 0 && (
                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 20, padding: '2px 10px' }}>
                                    <Text size="xs" fw={700} style={{ color: '#F59E0B' }}>{pendingLeave} pending</Text>
                                </Box>
                            )}
                        </Group>
                        <Box component={Link} href={`/system/hr/leave/create?employee_id=${employee.id}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', color: '#EA580C', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                            ＋ Request Leave
                        </Box>
                    </Box>

                    {leaveRequests.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '48px 0' }}>
                            <Text size="2rem" style={{ marginBottom: 8 }}>🏖️</Text>
                            <Text size="sm" style={{ color: textMut }}>No leave requests recorded.</Text>
                        </Box>
                    ) : (
                        <>
                            {/* Head */}
                            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 240px 80px 140px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                                {['Type', 'Period', 'Days', 'Status'].map(h => (
                                    <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                                ))}
                            </Box>
                            {leaveRequests.map((l, i) => {
                                const lColor = l.status === 'approved' ? '#22C55E' : l.status === 'rejected' ? '#EF4444' : '#F59E0B';
                                return (
                                    <motion.div key={l.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                        <Box
                                            style={{ display: 'grid', gridTemplateColumns: '1fr 240px 80px 140px', gap: 0, padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA'; e.currentTarget.style.borderLeft = `3px solid ${lColor}`; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>
                                            <Box>
                                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: (leaveTypes[l.type]?.color ?? '#94A3B8') + '18', border: `1px solid ${(leaveTypes[l.type]?.color ?? '#94A3B8')}35`, borderRadius: 20, padding: '4px 12px' }}>
                                                    <Text size="xs" fw={700} style={{ color: leaveTypes[l.type]?.color ?? '#94A3B8' }}>{leaveTypes[l.type]?.label ?? l.type}</Text>
                                                </Box>
                                            </Box>
                                            <Text size="sm" style={{ color: textSec }}>{formatDate(l.start_date)} → {formatDate(l.end_date)}</Text>
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 28, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}` }}>
                                                <Text size="xs" fw={700} style={{ color: textPri }}>{l.days}d</Text>
                                            </Box>
                                            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: lColor + '18', border: `1px solid ${lColor}35`, borderRadius: 20, padding: '4px 12px', width: 'fit-content' }}>
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: lColor, flexShrink: 0 }} />
                                                <Text size="xs" fw={700} style={{ color: lColor, textTransform: 'capitalize' }}>{l.status}</Text>
                                            </Box>
                                        </Box>
                                    </motion.div>
                                );
                            })}
                        </>
                    )}
                </Box>
            </motion.div>

            <Box mt="xl">
                <Box component={Link} href="/system/hr/employees"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Employees
                </Box>
            </Box>
        </DashboardLayout>
    );
}

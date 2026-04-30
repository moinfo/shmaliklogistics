import { Head, useForm, router, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal, Pagination, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function ManualEntryModal({ employees, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing, errors } = useForm({ employee_id: '', punch_time: '', punch_type: 'in', notes: '' });
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const iS = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };
    const submit = (e) => { e.preventDefault(); post('/system/hr/attendance', { onSuccess: onClose }); };

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: textPri, marginBottom: 14 }}>Manual Attendance Entry</Text>
            <Select label="Employee *" data={employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))} value={data.employee_id} onChange={v => setData('employee_id', v ?? '')} searchable styles={iS} mb="sm" error={errors.employee_id} />
            <Group grow gap="md" mb="sm">
                <Box>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Punch Time *</Text>
                    <Box component="input" type="datetime-local" value={data.punch_time} onChange={e => setData('punch_time', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </Box>
                <Select label="Type *" data={[{ value: 'in', label: 'Check In' }, { value: 'out', label: 'Check Out' }]} value={data.punch_type} onChange={v => setData('punch_type', v ?? 'in')} styles={iS} />
            </Group>
            <Box mb="md">
                <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Notes</Text>
                <Box component="textarea" value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} placeholder="Optional notes…"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </Box>
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: '#22C55E', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : 'Add Record'}</Box>
            </Group>
        </Box>
    );
}

export default function AttendanceIndex({ logs, summary, employees, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const [empId, setEmpId] = useState(filters.empId ?? '');
    const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? '');
    const [dateTo, setDateTo] = useState(filters.dateTo ?? '');
    const [modal, setModal] = useState(false);
    const iS = { input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } };

    const applyFilters = (o = {}) => router.get('/system/hr/attendance', { employee_id: empId, date_from: dateFrom, date_to: dateTo, ...o }, { preserveState: true, replace: true });

    // Compute daily summary grouped by date+employee
    const summaryMap = {};
    summary.forEach(s => {
        const key = `${s.date}-${s.employee_id}`;
        const inTime = s.check_in ? new Date(s.check_in) : null;
        const outTime = s.check_out ? new Date(s.check_out) : null;
        const hours = inTime && outTime ? ((outTime - inTime) / 3600000).toFixed(1) : null;
        summaryMap[key] = { ...s, hours };
    });

    const punchBadge = (type) => ({
        background: type === 'in' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
        color: type === 'in' ? '#22C55E' : '#3B82F6',
        border: `1px solid ${type === 'in' ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
    });

    const sourceColors = { device: '#3B82F6', manual: '#F59E0B', import: '#8B5CF6' };

    return (
        <DashboardLayout title="Attendance">
            <Head title="Attendance" />
            <Modal opened={modal} onClose={() => setModal(false)} withCloseButton={false} styles={{ content: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}>
                <ManualEntryModal employees={employees} onClose={() => setModal(false)} isDark={isDark} cardBorder={cardBorder} />
            </Modal>

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Attendance</Text>
                    <Text size="sm" style={{ color: textSec }}>ZKTeco device logs + manual entries</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/attendance/devices" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>📡 Devices</Box>
                    <Box component="button" onClick={() => setModal(true)} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Manual Entry</Box>
                </Group>
            </Group>

            {/* Filters */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
                <Group gap="md" align="flex-end">
                    <Select placeholder="All employees" data={[{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))]} value={empId} onChange={v => { setEmpId(v ?? ''); applyFilters({ employee_id: v ?? '' }); }} searchable clearable styles={iS} style={{ flex: 1 }} />
                    <Box>
                        <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>From</Text>
                        <Box component="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none' }} />
                    </Box>
                    <Box>
                        <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>To</Text>
                        <Box component="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            style={{ padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none' }} />
                    </Box>
                    <Box component="button" onClick={() => applyFilters()} style={{ padding: '9px 18px', borderRadius: 9, background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Show</Box>
                </Group>
            </Box>

            {/* Daily Summary */}
            {summary.length > 0 && (
                <Box mb="md" style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                    <Box style={{ padding: '12px 18px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Daily Summary</Text>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                    {['DATE', 'EMPLOYEE', 'CHECK IN', 'CHECK OUT', 'HOURS'].map((h, i) => (
                                        <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(summaryMap).map((s, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '10px 14px' }}><Text size="sm" fw={600} style={{ color: textPri }}>{s.date}</Text></td>
                                        <td style={{ padding: '10px 14px' }}><Text size="sm" style={{ color: textPri }}>{s.employee?.name}</Text></td>
                                        <td style={{ padding: '10px 14px' }}><Text size="sm" style={{ color: '#22C55E' }}>{s.check_in ? new Date(s.check_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}</Text></td>
                                        <td style={{ padding: '10px 14px' }}><Text size="sm" style={{ color: '#3B82F6' }}>{s.check_out ? new Date(s.check_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}</Text></td>
                                        <td style={{ padding: '10px 14px' }}><Text size="sm" fw={700} style={{ color: s.hours >= 8 ? '#22C55E' : s.hours ? '#F59E0B' : textSec }}>{s.hours ? `${s.hours}h` : '—'}</Text></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            )}

            {/* Raw punch log */}
            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ padding: '12px 18px', borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                    <Text fw={700} size="sm" style={{ color: textPri }}>Punch Log ({logs.total} records)</Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['EMPLOYEE', 'PUNCH TIME', 'TYPE', 'SOURCE', 'DEVICE', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No attendance records found. Sync a device or add a manual entry.</td></tr>
                            ) : logs.data.map(log => (
                                <tr key={log.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '10px 14px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{log.employee?.name}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{log.employee?.employee_number}</Text>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}><Text size="sm" fw={600} style={{ color: textPri }}>{new Date(log.punch_time).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</Text></td>
                                    <td style={{ padding: '10px 14px' }}><Badge size="sm" style={punchBadge(log.punch_type)}>{log.punch_type === 'in' ? '▶ IN' : '◀ OUT'}</Badge></td>
                                    <td style={{ padding: '10px 14px' }}><Text size="xs" fw={600} style={{ color: sourceColors[log.source] ?? textSec, textTransform: 'uppercase' }}>{log.source}</Text></td>
                                    <td style={{ padding: '10px 14px' }}><Text size="sm" style={{ color: textSec }}>{log.device?.name ?? (log.source === 'manual' ? 'Manual' : '—')}</Text></td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                        {log.source === 'manual' && (
                                            <Box component="button" onClick={() => { if (confirm('Delete this record?')) router.delete(`/system/hr/attendance/${log.id}`, { preserveScroll: true }); }} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>🗑️</Box>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {logs.last_page > 1 && (
                    <Box style={{ padding: '14px 18px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={logs.last_page} value={logs.current_page} onChange={p => router.get('/system/hr/attendance', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}

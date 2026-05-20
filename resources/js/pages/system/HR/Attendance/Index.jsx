import { Head, useForm, router, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal, Pagination, ActionIcon, Tooltip, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import DatePicker from '../../../../components/DatePicker';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

function PersonAvatar({ name, size = 34 }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text size="xs" fw={900} style={{ color }}>{initials}</Text>
        </Box>
    );
}

function ManualEntryModal({ employees, onClose, isDark, cardBorder }) {
    const { data, setData, post, processing, errors } = useForm({ employee_id: '', punch_time: '', punch_type: 'in', notes: '' });
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const iS = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
    };
    const submit = (e) => { e.preventDefault(); post('/system/hr/attendance', { onSuccess: onClose }); };

    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Group gap={10} mb={16} align="center">
                <Box style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⏱️</Box>
                <Text fw={700} style={{ color: textPri }}>Manual Attendance Entry</Text>
            </Group>
            <Select label="Employee *" data={employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))} value={data.employee_id} onChange={v => setData('employee_id', v ?? '')} searchable styles={iS} mb="sm" error={errors.employee_id} />
            <Group grow gap="md" mb="sm">
                <Box>
                    <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Punch Time *</Text>
                    <Box component="input" type="datetime-local" value={data.punch_time} onChange={e => setData('punch_time', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </Box>
                <Select label="Type *" data={[{ value: 'in', label: '▶ Check In' }, { value: 'out', label: '◀ Check Out' }]} value={data.punch_type} onChange={v => setData('punch_type', v ?? 'in')} styles={iS} />
            </Group>
            <Box mb="md">
                <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>Notes</Text>
                <Box component="textarea" value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} placeholder="Optional notes…"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </Box>
            <Group justify="flex-end" gap="sm">
                <Box component="button" type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontSize: 13 }}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #065F46, #059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{processing ? 'Saving…' : 'Add Record'}</Box>
            </Group>
        </Box>
    );
}

export default function AttendanceIndex({ logs, summary, employees, filters }) {
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

    const [empId, setEmpId]       = useState(filters.empId ?? '');
    const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? '');
    const [dateTo, setDateTo]     = useState(filters.dateTo ?? '');
    const [modal, setModal]       = useState(false);
    const can = useCan();

    const iS = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, borderRadius: 12 },
    };

    const applyFilters = (o = {}) => router.get('/system/hr/attendance', { employee_id: empId, date_from: dateFrom, date_to: dateTo, ...o }, { preserveState: true, replace: true });

    // Compute daily summary grouped by date+employee
    const summaryMap = {};
    summary.forEach(s => {
        const key = `${s.date}-${s.employee_id}`;
        const inTime  = s.check_in  ? new Date(s.check_in)  : null;
        const outTime = s.check_out ? new Date(s.check_out) : null;
        const hours   = inTime && outTime ? ((outTime - inTime) / 3600000).toFixed(1) : null;
        summaryMap[key] = { ...s, hours };
    });

    const sourceColors = { device: '#3B82F6', manual: '#F59E0B', import: '#8B5CF6' };

    const summaryRows = Object.values(summaryMap);

    return (
        <DashboardLayout title="Attendance">
            <Head title="Attendance" />

            <Modal opened={modal} onClose={() => setModal(false)} withCloseButton={false}
                styles={{ content: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` } }}>
                <ManualEntryModal employees={employees} onClose={() => setModal(false)} isDark={isDark} cardBorder={cardBorder} />
            </Modal>

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
                                ⏱️
                            </Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Attendance</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>ZKTeco device logs + manual entries</Text>
                            </Stack>
                        </Group>
                        <Group gap={10}>
                            <Box component={Link} href="/system/hr/attendance/devices"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                                📡 Devices
                            </Box>
                            {can('hr_attendance.create') && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component="button" onClick={() => setModal(true)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ＋ Manual Entry
                                    </Box>
                                </motion.div>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Filters ── */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="md" align="flex-end">
                    <Select
                        placeholder="All employees"
                        data={[{ value: '', label: 'All employees' }, ...employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))]}
                        value={empId}
                        onChange={v => { setEmpId(v ?? ''); applyFilters({ employee_id: v ?? '' }); }}
                        searchable clearable
                        style={{ flex: 1 }}
                        styles={iS}
                    />
                    <Box>
                        <Text size="xs" fw={700} style={{ color: textMut, marginBottom: 4 }}>From</Text>
                        <Box component="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none' }} />
                    </Box>
                    <Box>
                        <Text size="xs" fw={700} style={{ color: textMut, marginBottom: 4 }}>To</Text>
                        <Box component="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none' }} />
                    </Box>
                    <Tooltip label="Apply filters">
                        <ActionIcon onClick={() => applyFilters()} size={38} radius={10}
                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', boxShadow: '0 4px 12px rgba(194,65,12,0.35)' }}>
                            <Text size="sm">🔍</Text>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Box>

            {/* ── Daily Summary ── */}
            {summaryRows.length > 0 && (
                <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    {/* Toolbar */}
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10B981)', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
                            <Text size="sm" fw={700} style={{ color: textPri }}>Daily Summary</Text>
                        </Group>
                        <Text size="xs" style={{ color: textMut }}>{summaryRows.length} record{summaryRows.length !== 1 ? 's' : ''}</Text>
                    </Box>

                    {/* Head */}
                    <Box style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px 100px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                        {['Date', 'Employee', 'Check In', 'Check Out', 'Hours'].map(h => (
                            <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                        ))}
                    </Box>

                    {summaryRows.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <Box
                                style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px 100px', gap: 0, padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = '3px solid #059669'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>
                                <Text size="sm" fw={700} style={{ color: textPri }}>{formatDate(s.date)}</Text>
                                <Group gap={8} align="center">
                                    <PersonAvatar name={s.employee?.name ?? '?'} size={28} />
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{s.employee?.name}</Text>
                                </Group>
                                <Group gap={5} align="center">
                                    {s.check_in
                                        ? <>
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                                            <Text size="sm" fw={600} style={{ color: '#22C55E' }}>{new Date(s.check_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
                                          </>
                                        : <Text size="sm" style={{ color: textMut }}>—</Text>
                                    }
                                </Group>
                                <Group gap={5} align="center">
                                    {s.check_out
                                        ? <>
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', flexShrink: 0 }} />
                                            <Text size="sm" fw={600} style={{ color: '#3B82F6' }}>{new Date(s.check_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
                                          </>
                                        : <Text size="sm" style={{ color: textMut }}>—</Text>
                                    }
                                </Group>
                                {s.hours ? (
                                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: (Number(s.hours) >= 8 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)'), border: `1px solid ${Number(s.hours) >= 8 ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 8, padding: '3px 10px', width: 'fit-content' }}>
                                        <Text size="xs" fw={700} style={{ color: Number(s.hours) >= 8 ? '#22C55E' : '#F59E0B' }}>{s.hours}h</Text>
                                    </Box>
                                ) : (
                                    <Text size="sm" style={{ color: textMut }}>—</Text>
                                )}
                            </Box>
                        </motion.div>
                    ))}
                </Box>
            )}

            {/* ── Raw punch log ── */}
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                {/* Toolbar */}
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Group gap={8}>
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                        <Text size="sm" fw={700} style={{ color: textPri }}>Punch Log</Text>
                    </Group>
                    <Text size="xs" style={{ color: textMut }}>{logs.total} record{logs.total !== 1 ? 's' : ''}</Text>
                </Box>

                {/* Head */}
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 160px 100px 90px 160px 50px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                    {['Employee', 'Punch Time', 'Type', 'Source', 'Device', ''].map(h => (
                        <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</Text>
                    ))}
                </Box>

                {logs.data.length === 0 ? (
                    <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                        <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>
                            ⏱️
                        </Box>
                        <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No attendance records found</Text>
                        <Text size="sm" style={{ color: textMut }}>Sync a device or add a manual entry</Text>
                    </Box>
                ) : (
                    logs.data.map((log, i) => (
                        <motion.div key={log.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                            <Box
                                style={{ display: 'grid', gridTemplateColumns: '1fr 160px 100px 90px 160px 50px', gap: 0, padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center', transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent' }}
                                onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${log.punch_type === 'in' ? '#22C55E' : '#3B82F6'}`; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}>

                                {/* Employee */}
                                <Group gap={10} align="center">
                                    <PersonAvatar name={log.employee?.name ?? '?'} />
                                    <Stack gap={2}>
                                        <Text size="sm" fw={700} style={{ color: textPri, lineHeight: 1.2 }}>{log.employee?.name}</Text>
                                        <Text size="xs" style={{ color: textMut }}>{log.employee?.employee_number}</Text>
                                    </Stack>
                                </Group>

                                {/* Punch time */}
                                <Text size="sm" fw={600} style={{ color: textPri }}>
                                    {new Date(log.punch_time).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                                </Text>

                                {/* Type pill */}
                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: log.punch_type === 'in' ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)', border: `1px solid ${log.punch_type === 'in' ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`, borderRadius: 20, padding: '4px 10px', width: 'fit-content' }}>
                                    <Text size="xs" fw={700} style={{ color: log.punch_type === 'in' ? '#22C55E' : '#3B82F6' }}>{log.punch_type === 'in' ? '▶ IN' : '◀ OUT'}</Text>
                                </Box>

                                {/* Source */}
                                <Box style={{ display: 'inline-flex', alignItems: 'center', background: (sourceColors[log.source] ?? textMut) + '15', border: `1px solid ${(sourceColors[log.source] ?? textMut)}30`, borderRadius: 8, padding: '3px 10px', width: 'fit-content' }}>
                                    <Text size="xs" fw={700} style={{ color: sourceColors[log.source] ?? textMut, textTransform: 'uppercase', letterSpacing: 0.5 }}>{log.source}</Text>
                                </Box>

                                {/* Device */}
                                <Text size="sm" style={{ color: textSec }}>{log.device?.name ?? (log.source === 'manual' ? 'Manual' : '—')}</Text>

                                {/* Delete */}
                                <Box onClick={e => e.stopPropagation()}>
                                    {can('hr_attendance.delete') && log.source === 'manual' && (
                                        <Tooltip label="Delete" position="top" withArrow>
                                            <ActionIcon variant="subtle" size={28}
                                                onClick={() => { if (confirm('Delete this record?')) router.delete(`/system/hr/attendance/${log.id}`, { preserveScroll: true }); }}
                                                style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444' }}>
                                                <Text size="xs">🗑️</Text>
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>
                        </motion.div>
                    ))
                )}

                {/* Footer */}
                {logs.data.length > 0 && (
                    <Box style={{ padding: '10px 20px', borderTop: `1px solid ${divider}`, background: headBg }}>
                        <Text size="xs" style={{ color: textMut }}>{logs.total} total record{logs.total !== 1 ? 's' : ''}</Text>
                    </Box>
                )}
            </Box>

            {/* ── Pagination ── */}
            {logs.last_page > 1 && (
                <Group justify="center" mt="lg">
                    <Pagination
                        total={logs.last_page}
                        value={logs.current_page}
                        onChange={p => router.get('/system/hr/attendance', { ...filters, page: p })}
                        size="sm"
                        styles={{ control: { borderRadius: 8 } }}
                    />
                </Group>
            )}
        </DashboardLayout>
    );
}

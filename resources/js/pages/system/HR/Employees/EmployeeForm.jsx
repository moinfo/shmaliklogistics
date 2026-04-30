import { useForm, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function EmployeeForm({ employee, statuses, departments, nextNumber, submitUrl, method, submitLabel }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';

    const { data, setData, post, put, processing, errors } = useForm({
        employee_number:         employee?.employee_number         ?? nextNumber ?? '',
        name:                    employee?.name                    ?? '',
        department:              employee?.department              ?? '',
        position:                employee?.position                ?? '',
        phone:                   employee?.phone                   ?? '',
        email:                   employee?.email                   ?? '',
        national_id:             employee?.national_id             ?? '',
        address:                 employee?.address                 ?? '',
        hire_date:               employee?.hire_date               ?? '',
        birth_date:              employee?.birth_date              ?? '',
        salary:                  employee?.salary                  ?? '',
        salary_currency:         employee?.salary_currency         ?? 'TZS',
        status:                  employee?.status                  ?? 'active',
        emergency_contact_name:  employee?.emergency_contact_name  ?? '',
        emergency_contact_phone: employee?.emergency_contact_phone ?? '',
        notes:                   employee?.notes                   ?? '',
    });

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label: { color: textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    };

    const submit = (e) => {
        e.preventDefault();
        method === 'put' ? put(submitUrl) : post(submitUrl);
    };

    const deptData  = departments.map(d => ({ value: d, label: d }));
    const statusData = Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }));
    const currData  = ['TZS', 'USD', 'EUR', 'KES'].map(c => ({ value: c, label: c }));

    const section = (label) => (
        <Text fw={700} size="xs" style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 14 }}>{label}</Text>
    );

    return (
        <Box component="form" onSubmit={submit}>
            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>{employee ? 'Edit Employee' : 'Add Employee'}</Text>
                    <Text size="sm" style={{ color: textSec }}>Staff record</Text>
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href="/system/hr/employees" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Cancel</Box>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Box component="button" type="submit" disabled={processing} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                            {processing ? 'Saving…' : submitLabel}
                        </Box>
                    </motion.div>
                </Group>
            </Group>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '28px' }}>
                {section('Personal Information')}
                <Group grow gap="md" mb="md">
                    <TextInput label="Employee Number *" value={data.employee_number} onChange={e => setData('employee_number', e.target.value)} error={errors.employee_number} required styles={inputStyles} />
                    <TextInput label="Full Name *" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} required styles={inputStyles} />
                </Group>
                <Group grow gap="md" mb="md">
                    <TextInput label="Phone" value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} styles={inputStyles} />
                    <TextInput label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} styles={inputStyles} />
                </Group>
                <Group grow gap="md" mb="md">
                    <TextInput label="National ID" value={data.national_id} onChange={e => setData('national_id', e.target.value)} error={errors.national_id} styles={inputStyles} />
                    <DatePicker label="Date of Birth" value={data.birth_date} onChange={v => setData('birth_date', v)} error={errors.birth_date} styles={inputStyles} />
                </Group>
                <Textarea label="Address" value={data.address} onChange={e => setData('address', e.target.value)} error={errors.address} styles={inputStyles} rows={2} mb="md" />

                {section('Employment')}
                <Group grow gap="md" mb="md">
                    <Select label="Department" placeholder="Select dept" data={deptData} value={data.department} onChange={v => setData('department', v ?? '')} styles={{ ...inputStyles, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} clearable />
                    <TextInput label="Position / Role" placeholder="e.g. Fleet Coordinator" value={data.position} onChange={e => setData('position', e.target.value)} error={errors.position} styles={inputStyles} />
                </Group>
                <Group grow gap="md" mb="md">
                    <DatePicker label="Hire Date" value={data.hire_date} onChange={v => setData('hire_date', v)} error={errors.hire_date} styles={inputStyles} />
                    <Select label="Status *" data={statusData} value={data.status} onChange={v => setData('status', v ?? 'active')} error={errors.status} styles={{ ...inputStyles, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} />
                </Group>
                <Group grow gap="md" mb="md">
                    <NumberInput label="Salary" placeholder="0.00" value={data.salary} onChange={v => setData('salary', v)} error={errors.salary} min={0} decimalScale={2} hideControls styles={inputStyles} />
                    <Select label="Currency" data={currData} value={data.salary_currency} onChange={v => setData('salary_currency', v ?? 'TZS')} styles={{ ...inputStyles, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }} />
                </Group>

                {section('Emergency Contact')}
                <Group grow gap="md" mb="md">
                    <TextInput label="Name" value={data.emergency_contact_name} onChange={e => setData('emergency_contact_name', e.target.value)} styles={inputStyles} />
                    <TextInput label="Phone" value={data.emergency_contact_phone} onChange={e => setData('emergency_contact_phone', e.target.value)} styles={inputStyles} />
                </Group>

                <Textarea label="Notes" value={data.notes} onChange={e => setData('notes', e.target.value)} styles={inputStyles} rows={2} mt="sm" />
            </Box>
        </Box>
    );
}

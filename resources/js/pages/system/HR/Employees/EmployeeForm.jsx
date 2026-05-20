import { useForm, Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../../components/DatePicker';

export default function EmployeeForm({ employee, statuses, departments, nextNumber, submitUrl, method, submitLabel }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

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

    const submit = (e) => {
        e.preventDefault();
        method === 'put' ? put(submitUrl) : post(submitUrl);
    };

    const deptData   = departments.map(d => ({ value: d, label: d }));
    const statusData = Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }));
    const currData   = ['TZS', 'USD', 'EUR', 'KES'].map(c => ({ value: c, label: c }));

    const SectionCard = ({ icon, title, children }) => (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}>
                        <Text size="md">{icon}</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                    </Group>
                </Box>
                <Box style={{ padding: '20px 24px' }}>{children}</Box>
            </Box>
        </motion.div>
    );

    return (
        <Box component="form" onSubmit={submit}>
            {/* Personal Information */}
            <SectionCard icon="👤" title="Personal Information">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <TextInput
                        label="Employee Number *"
                        value={data.employee_number}
                        onChange={e => setData('employee_number', e.target.value)}
                        error={errors.employee_number}
                        required
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Full Name *"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        error={errors.name}
                        required
                        styles={inputStyles}
                    />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <TextInput
                        label="Phone"
                        value={data.phone}
                        onChange={e => setData('phone', e.target.value)}
                        error={errors.phone}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        error={errors.email}
                        styles={inputStyles}
                    />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <TextInput
                        label="National ID"
                        value={data.national_id}
                        onChange={e => setData('national_id', e.target.value)}
                        error={errors.national_id}
                        styles={inputStyles}
                    />
                    <DatePicker
                        label="Date of Birth"
                        value={data.birth_date}
                        onChange={v => setData('birth_date', v)}
                        error={errors.birth_date}
                        styles={inputStyles}
                    />
                </SimpleGrid>
                <Textarea
                    label="Address"
                    value={data.address}
                    onChange={e => setData('address', e.target.value)}
                    error={errors.address}
                    styles={inputStyles}
                    rows={2}
                />
            </SectionCard>

            {/* Employment Details */}
            <SectionCard icon="💼" title="Employment Details">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <Select
                        label="Department"
                        placeholder="Select dept"
                        data={deptData}
                        value={data.department}
                        onChange={v => setData('department', v ?? '')}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        clearable
                    />
                    <TextInput
                        label="Position / Role"
                        placeholder="e.g. Fleet Coordinator"
                        value={data.position}
                        onChange={e => setData('position', e.target.value)}
                        error={errors.position}
                        styles={inputStyles}
                    />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <DatePicker
                        label="Hire Date"
                        value={data.hire_date}
                        onChange={v => setData('hire_date', v)}
                        error={errors.hire_date}
                        styles={inputStyles}
                    />
                    <Select
                        label="Status *"
                        data={statusData}
                        value={data.status}
                        onChange={v => setData('status', v ?? 'active')}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
            </SectionCard>

            {/* Salary */}
            <SectionCard icon="💰" title="Salary">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NumberInput
                        label="Salary"
                        placeholder="0.00"
                        value={data.salary}
                        onChange={v => setData('salary', v)}
                        error={errors.salary}
                        min={0}
                        decimalScale={2}
                        hideControls
                        styles={inputStyles}
                    />
                    <Select
                        label="Currency"
                        data={currData}
                        value={data.salary_currency}
                        onChange={v => setData('salary_currency', v ?? 'TZS')}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
            </SectionCard>

            {/* Emergency Contact */}
            <SectionCard icon="🚨" title="Emergency Contact">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Name"
                        value={data.emergency_contact_name}
                        onChange={e => setData('emergency_contact_name', e.target.value)}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Phone"
                        value={data.emergency_contact_phone}
                        onChange={e => setData('emergency_contact_phone', e.target.value)}
                        styles={inputStyles}
                    />
                </SimpleGrid>
            </SectionCard>

            {/* Notes */}
            <SectionCard icon="📝" title="Notes">
                <Textarea
                    label="Additional Notes"
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    styles={inputStyles}
                    rows={3}
                />
            </SectionCard>

            {/* Actions */}
            <Group justify="flex-end" gap="sm" mt={8}>
                <Box
                    component={Link}
                    href="/system/hr/employees"
                    style={{
                        background: cardBg,
                        border: `1px solid ${cardBorder}`,
                        color: textSec,
                        padding: '10px 18px',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component="button"
                        type="submit"
                        disabled={processing}
                        style={{
                            background: 'linear-gradient(135deg, #C2410C, #EA580C)',
                            border: 'none',
                            height: 42,
                            padding: '0 24px',
                            borderRadius: 10,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: processing ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 16px rgba(234,88,12,0.4)',
                            opacity: processing ? 0.7 : 1,
                        }}
                    >
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </Box>
    );
}

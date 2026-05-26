import { Link } from '@inertiajs/react';
import { Box, Text, Group, SimpleGrid, TextInput, Textarea, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function Section({ title, icon, children, isDark }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px' }}>{children}</Box>
        </Box>
    );
}

export default function TenantForm({ data, setData, errors, types, statuses, processing, onSubmit, backHref, submitLabel = 'Save Tenant' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    const isCompany = data.type === 'company';

    return (
        <form onSubmit={onSubmit}>
            <Section title="Tenant Details" icon="👤" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Name"
                        placeholder="Full name or contact person"
                        required
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        error={errors.name}
                        styles={inputStyles}
                    />
                    <Select
                        label="Type"
                        required
                        value={data.type}
                        onChange={v => setData('type', v ?? 'individual')}
                        data={Object.entries(types).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.type}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    {isCompany && (
                        <>
                            <TextInput
                                label="Company Name"
                                placeholder="Registered company name"
                                value={data.company_name ?? ''}
                                onChange={e => setData('company_name', e.target.value)}
                                error={errors.company_name}
                                styles={inputStyles}
                            />
                            <TextInput
                                label="TIN"
                                placeholder="Tax identification number"
                                value={data.tin ?? ''}
                                onChange={e => setData('tin', e.target.value)}
                                error={errors.tin}
                                styles={inputStyles}
                            />
                        </>
                    )}
                    {!isCompany && (
                        <TextInput
                            label="National ID"
                            placeholder="ID / NIDA number"
                            value={data.national_id ?? ''}
                            onChange={e => setData('national_id', e.target.value)}
                            error={errors.national_id}
                            styles={inputStyles}
                        />
                    )}
                    <Select
                        label="Status"
                        required
                        value={data.status}
                        onChange={v => setData('status', v ?? 'active')}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    {isCompany && (
                        <TextInput
                            label="National ID"
                            placeholder="ID of contact person (optional)"
                            value={data.national_id ?? ''}
                            onChange={e => setData('national_id', e.target.value)}
                            error={errors.national_id}
                            styles={inputStyles}
                        />
                    )}
                </SimpleGrid>
            </Section>

            <Section title="Contact" icon="📞" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Phone"
                        placeholder="+255 7XX XXX XXX"
                        required
                        value={data.phone}
                        onChange={e => setData('phone', e.target.value)}
                        error={errors.phone}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Alternate Phone"
                        placeholder="Optional"
                        value={data.phone_alt ?? ''}
                        onChange={e => setData('phone_alt', e.target.value)}
                        error={errors.phone_alt}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Email"
                        type="email"
                        placeholder="tenant@example.com"
                        value={data.email ?? ''}
                        onChange={e => setData('email', e.target.value)}
                        error={errors.email}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Address"
                        placeholder="Physical / postal address"
                        value={data.address ?? ''}
                        onChange={e => setData('address', e.target.value)}
                        error={errors.address}
                        styles={inputStyles}
                    />
                </SimpleGrid>
            </Section>

            <Section title="Emergency Contact" icon="🚨" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Contact Name"
                        placeholder="Next of kin / reference"
                        value={data.emergency_contact_name ?? ''}
                        onChange={e => setData('emergency_contact_name', e.target.value)}
                        error={errors.emergency_contact_name}
                        styles={inputStyles}
                    />
                    <TextInput
                        label="Contact Phone"
                        placeholder="+255 7XX XXX XXX"
                        value={data.emergency_contact_phone ?? ''}
                        onChange={e => setData('emergency_contact_phone', e.target.value)}
                        error={errors.emergency_contact_phone}
                        styles={inputStyles}
                    />
                </SimpleGrid>
            </Section>

            <Section title="Notes" icon="📝" isDark={isDark}>
                <Textarea
                    placeholder="Additional notes or remarks…"
                    minRows={3}
                    value={data.notes ?? ''}
                    onChange={e => setData('notes', e.target.value)}
                    error={errors.notes}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                />
            </Section>

            <Group justify="flex-end" gap="md">
                <Box component={Link} href={backHref} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}
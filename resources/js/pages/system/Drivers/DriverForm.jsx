import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

function Section({ title, children, isDark }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '20px' }}>{children}</Box>
        </Box>
    );
}

export default function DriverForm({ data, setData, errors, statuses, licenseClasses, processing, onSubmit, backHref, submitLabel = 'Save Driver' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    const licenceWarning = () => {
        if (!data.license_expiry) return null;
        const days = Math.floor((new Date(data.license_expiry) - new Date()) / 86400000);
        if (days < 0) return <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>⚠ Licence expired {Math.abs(days)} days ago</Text>;
        if (days <= 30) return <Text size="xs" style={{ color: '#F59E0B', marginTop: 3 }}>⚠ Licence expires in {days} days</Text>;
        return null;
    };

    return (
        <form onSubmit={onSubmit}>
            <Section title="Personal Information" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="Full Name" placeholder="Juma Mwangi" required value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} styles={inputStyles} />
                    <Select label="Status" required value={data.status} onChange={v => setData('status', v)} data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))} error={errors.status} styles={{ ...inputStyles, dropdown: dropdownStyle }} />
                    <TextInput label="Phone" placeholder="+255 712 345 678" required value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} styles={inputStyles} />
                    <TextInput label="Alternative Phone" placeholder="+255 754 000 000" value={data.phone_alt ?? ''} onChange={e => setData('phone_alt', e.target.value)} error={errors.phone_alt} styles={inputStyles} />
                    <TextInput label="Email" type="email" placeholder="driver@example.com" value={data.email ?? ''} onChange={e => setData('email', e.target.value)} error={errors.email} styles={inputStyles} />
                    <TextInput label="National ID" placeholder="19XXXXXXXXX" value={data.national_id ?? ''} onChange={e => setData('national_id', e.target.value)} error={errors.national_id} styles={inputStyles} />
                    <TextInput label="Address" placeholder="Dar es Salaam, Tanzania" value={data.address ?? ''} onChange={e => setData('address', e.target.value)} error={errors.address} styles={inputStyles} />
                </SimpleGrid>
            </Section>

            <Section title="Driving Licence" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="Licence Number" placeholder="TZ-DL-XXXXXX" value={data.license_number ?? ''} onChange={e => setData('license_number', e.target.value)} error={errors.license_number} styles={inputStyles} />
                    <Select label="Licence Class" value={data.license_class ?? ''} onChange={v => setData('license_class', v ?? '')} clearable data={licenseClasses.map(c => ({ value: c, label: c }))} error={errors.license_class} styles={{ ...inputStyles, dropdown: dropdownStyle }} />
                    <Stack gap={2}>
                        <TextInput label="Licence Expiry" type="date" value={data.license_expiry ?? ''} onChange={e => setData('license_expiry', e.target.value)} error={errors.license_expiry} styles={inputStyles} />
                        {licenceWarning()}
                    </Stack>
                </SimpleGrid>
            </Section>

            <Section title="Emergency Contact" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="Contact Name" placeholder="Mary Mwangi" value={data.emergency_contact_name ?? ''} onChange={e => setData('emergency_contact_name', e.target.value)} error={errors.emergency_contact_name} styles={inputStyles} />
                    <TextInput label="Contact Phone" placeholder="+255 700 000 000" value={data.emergency_contact_phone ?? ''} onChange={e => setData('emergency_contact_phone', e.target.value)} error={errors.emergency_contact_phone} styles={inputStyles} />
                </SimpleGrid>
            </Section>

            <Section title="Notes" isDark={isDark}>
                <Textarea placeholder="Additional notes…" minRows={3} value={data.notes ?? ''} onChange={e => setData('notes', e.target.value)} error={errors.notes} styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }} />
            </Section>

            <Group justify="flex-end" gap="md">
                <Box component={Link} href={backHref} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Cancel</Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

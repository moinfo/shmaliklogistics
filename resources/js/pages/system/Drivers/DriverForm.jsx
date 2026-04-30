import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, Tooltip } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../components/DatePicker';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

function Section({ icon, title, children, isDark }) {
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

// Visual toggle grid for licence classes
function LicenceClassToggle({ classes, selected, onToggle, isDark }) {
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textMut    = isDark ? dk.textMut : '#94A3B8';

    return (
        <Box>
            <Text size="xs" fw={700} style={{ color: textMut, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
                Held Licence Classes — click to toggle
            </Text>
            <Group gap={8} wrap="wrap">
                {Object.entries(classes).map(([code, desc]) => {
                    const active = (selected ?? []).includes(code);
                    return (
                        <Tooltip key={code} label={desc} position="top" withArrow>
                            <motion.div whileTap={{ scale: 0.94 }}>
                                <Box
                                    onClick={() => onToggle(code)}
                                    style={{
                                        padding: '7px 16px',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        background: active
                                            ? 'rgba(33,150,243,0.15)'
                                            : isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                                        border: active
                                            ? '1.5px solid rgba(33,150,243,0.5)'
                                            : `1px solid ${cardBorder}`,
                                        color: active ? '#60A5FA' : textMut,
                                        fontWeight: active ? 800 : 500,
                                        fontSize: 14,
                                        letterSpacing: 0.5,
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {code}
                                </Box>
                            </motion.div>
                        </Tooltip>
                    );
                })}
            </Group>
            {(selected ?? []).length > 0 && (
                <Group gap={6} mt={10} wrap="wrap">
                    {(selected ?? []).map(code => (
                        <Box key={code} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
                            <Text size="xs" style={{ color: isDark ? dk.textSec : '#64748B' }}>
                                <b>{code}</b> — {classes[code]}
                            </Text>
                        </Box>
                    ))}
                </Group>
            )}
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

    const toggleClass = (code) => {
        const current = data.license_classes ?? [];
        const next = current.includes(code)
            ? current.filter(c => c !== code)
            : [...current, code];
        setData('license_classes', next);
    };

    const licenceWarning = () => {
        if (!data.license_expiry) return null;
        const days = Math.floor((new Date(data.license_expiry) - new Date()) / 86400000);
        if (days < 0) return <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>⚠ Licence expired {Math.abs(days)} days ago</Text>;
        if (days <= 30) return <Text size="xs" style={{ color: '#F59E0B', marginTop: 3 }}>⚠ Licence expires in {days} days</Text>;
        return null;
    };

    return (
        <form onSubmit={onSubmit}>
            <Section icon="👤" title="Personal Information" isDark={isDark}>
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

            <Section icon="🪪" title="Driving Licence" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="lg">
                    <TextInput
                        label="Licence Number" placeholder="TZ-DL-XXXXXX"
                        value={data.license_number ?? ''}
                        onChange={e => setData('license_number', e.target.value)}
                        error={errors.license_number} styles={inputStyles}
                    />
                    <Stack gap={2}>
                        <DatePicker
                            label="Licence Expiry"
                            value={data.license_expiry ?? ''}
                            onChange={v => setData('license_expiry', v)}
                            error={errors.license_expiry} styles={inputStyles}
                        />
                        {licenceWarning()}
                    </Stack>
                </SimpleGrid>

                {/* Licence class toggle grid */}
                <LicenceClassToggle
                    classes={licenseClasses}
                    selected={data.license_classes}
                    onToggle={toggleClass}
                    isDark={isDark}
                />
                {errors.license_classes && (
                    <Text size="xs" style={{ color: '#EF4444', marginTop: 6 }}>{errors.license_classes}</Text>
                )}
            </Section>

            <Section icon="🚨" title="Emergency Contact" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="Contact Name" placeholder="Mary Mwangi" value={data.emergency_contact_name ?? ''} onChange={e => setData('emergency_contact_name', e.target.value)} error={errors.emergency_contact_name} styles={inputStyles} />
                    <TextInput label="Contact Phone" placeholder="+255 700 000 000" value={data.emergency_contact_phone ?? ''} onChange={e => setData('emergency_contact_phone', e.target.value)} error={errors.emergency_contact_phone} styles={inputStyles} />
                </SimpleGrid>
            </Section>

            <Section icon="📝" title="Notes" isDark={isDark}>
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

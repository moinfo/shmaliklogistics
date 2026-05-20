import { Link } from '@inertiajs/react';
import { Box, Text, Group, SimpleGrid, TextInput, Textarea, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

function SectionCard({ title, icon, children, isDark }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 16 }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    <Text size="md">{icon}</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px 24px' }}>{children}</Box>
        </Box>
    );
}

export default function ClientForm({ data, setData, errors, statuses, processing, onSubmit, backHref, submitLabel = 'Save Client' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const dropdownStyle = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 };

    const inputStyles = {
        label: { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    return (
        <form onSubmit={onSubmit}>
            <SectionCard title="Client Information" icon="👤" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="Contact Name" required placeholder="John Doe"
                        value={data.name} onChange={e => setData('name', e.target.value)}
                        error={errors.name} styles={inputStyles}
                    />
                    <TextInput
                        label="Company Name" placeholder="Acme Logistics Ltd."
                        value={data.company_name ?? ''} onChange={e => setData('company_name', e.target.value)}
                        error={errors.company_name} styles={inputStyles}
                    />
                    <TextInput
                        label="Email" type="email" placeholder="john@acme.co.tz"
                        value={data.email ?? ''} onChange={e => setData('email', e.target.value)}
                        error={errors.email} styles={inputStyles}
                    />
                    <TextInput
                        label="Phone" placeholder="+255 7xx xxx xxx"
                        value={data.phone ?? ''} onChange={e => setData('phone', e.target.value)}
                        error={errors.phone} styles={inputStyles}
                    />
                    <TextInput
                        label="Alt. Phone" placeholder="+255 6xx xxx xxx"
                        value={data.phone_alt ?? ''} onChange={e => setData('phone_alt', e.target.value)}
                        error={errors.phone_alt} styles={inputStyles}
                    />
                    <Select
                        label="Status" required
                        value={data.status}
                        onChange={v => setData('status', v)}
                        data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
                <Box mt="md">
                    <Textarea
                        label="Address" placeholder="123 Main St, Dar es Salaam…" minRows={2}
                        value={data.address ?? ''} onChange={e => setData('address', e.target.value)}
                        error={errors.address}
                        styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                    />
                </Box>
            </SectionCard>

            <SectionCard title="Tax Information" icon="🧾" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                        label="TIN Number" placeholder="123-456-789"
                        value={data.tin_number ?? ''} onChange={e => setData('tin_number', e.target.value)}
                        error={errors.tin_number} styles={inputStyles}
                    />
                    <TextInput
                        label="VRN Number" placeholder="10-012345-B"
                        value={data.vrn_number ?? ''} onChange={e => setData('vrn_number', e.target.value)}
                        error={errors.vrn_number} styles={inputStyles}
                    />
                </SimpleGrid>
            </SectionCard>

            <SectionCard title="Notes" icon="📝" isDark={isDark}>
                <Textarea
                    placeholder="Internal notes about this client…" minRows={3}
                    value={data.notes ?? ''} onChange={e => setData('notes', e.target.value)}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                />
            </SectionCard>

            <Group justify="flex-end" gap="md" mt={4}>
                <Box
                    component={Link} href={backHref}
                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, color: textSec, padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                >
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component="button" type="submit" disabled={processing}
                        style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', height: 42, borderRadius: 10, fontWeight: 700, boxShadow: '0 4px 16px rgba(234,88,12,0.4)', color: '#fff', cursor: processing ? 'not-allowed' : 'pointer', padding: '0 28px', fontSize: 14, opacity: processing ? 0.7 : 1 }}
                    >
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

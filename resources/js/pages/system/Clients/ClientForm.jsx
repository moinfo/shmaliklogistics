import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8' };

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

export default function ClientForm({ data, setData, errors, statuses, processing, onSubmit, backHref, submitLabel = 'Save Client' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    return (
        <form onSubmit={onSubmit}>
            <Section title="Client Information" icon="👤" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="Contact Name" required placeholder="John Doe" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} styles={inputStyles} />
                    <TextInput label="Company Name" placeholder="Acme Logistics Ltd." value={data.company_name ?? ''} onChange={e => setData('company_name', e.target.value)} error={errors.company_name} styles={inputStyles} />
                    <TextInput label="Email" type="email" placeholder="john@acme.co.tz" value={data.email ?? ''} onChange={e => setData('email', e.target.value)} error={errors.email} styles={inputStyles} />
                    <TextInput label="Phone" placeholder="+255 7xx xxx xxx" value={data.phone ?? ''} onChange={e => setData('phone', e.target.value)} error={errors.phone} styles={inputStyles} />
                    <TextInput label="Alt. Phone" placeholder="+255 6xx xxx xxx" value={data.phone_alt ?? ''} onChange={e => setData('phone_alt', e.target.value)} error={errors.phone_alt} styles={inputStyles} />
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
                    <Textarea label="Address" placeholder="123 Main St, Dar es Salaam…" minRows={2} value={data.address ?? ''} onChange={e => setData('address', e.target.value)} error={errors.address} styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }} />
                </Box>
            </Section>

            <Section title="Tax Information" icon="🧾" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="TIN Number" placeholder="123-456-789" value={data.tin_number ?? ''} onChange={e => setData('tin_number', e.target.value)} error={errors.tin_number} styles={inputStyles} />
                    <TextInput label="VRN Number" placeholder="10-012345-B" value={data.vrn_number ?? ''} onChange={e => setData('vrn_number', e.target.value)} error={errors.vrn_number} styles={inputStyles} />
                </SimpleGrid>
            </Section>

            <Section title="Notes" icon="📝" isDark={isDark}>
                <Textarea placeholder="Internal notes about this client…" minRows={3} value={data.notes ?? ''} onChange={e => setData('notes', e.target.value)} styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }} />
            </Section>

            <Group justify="flex-end" gap="md">
                <Box component={Link} href={backHref} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Cancel</Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

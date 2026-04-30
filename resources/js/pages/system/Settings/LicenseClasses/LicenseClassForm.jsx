import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, Textarea, NumberInput, Switch } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function LicenseClassForm({ data, setData, errors, processing, onSubmit, backHref, submitLabel = 'Save' }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const divider    = isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };

    return (
        <form onSubmit={onSubmit}>
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}>
                        <Text style={{ fontSize: 16 }}>🪪</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Class Details</Text>
                    </Group>
                </Box>
                <Box style={{ padding: 20 }}>
                    <Stack gap="md">
                        <Group grow>
                            <TextInput
                                label="Class Code"
                                placeholder="e.g. CE"
                                description="Short uppercase code (e.g. B, C1, CE)"
                                required
                                value={data.code}
                                onChange={e => setData('code', e.target.value.toUpperCase())}
                                error={errors.code}
                                styles={{ ...inputStyles, description: { color: textSec, fontSize: 12 } }}
                            />
                            <NumberInput
                                label="Sort Order"
                                placeholder="0"
                                min={0}
                                max={999}
                                value={data.sort_order === '' ? undefined : data.sort_order}
                                onChange={v => setData('sort_order', v ?? 0)}
                                error={errors.sort_order}
                                styles={inputStyles}
                            />
                        </Group>

                        <TextInput
                            label="Name"
                            placeholder="e.g. Articulated Trucks"
                            required
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                            styles={inputStyles}
                        />

                        <TextInput
                            label="Description"
                            placeholder="e.g. Class C + trailer"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            error={errors.description}
                            styles={inputStyles}
                        />

                        <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Switch
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.currentTarget.checked)}
                                label="Active"
                                styles={{ label: { color: textSec, fontSize: 13 } }}
                            />
                            <Text size="xs" style={{ color: textSec }}>
                                Inactive classes won't appear in driver registration forms.
                            </Text>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            {/* Preview badge */}
            {data.code && (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                    <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Badge Preview</Text>
                    <Group gap={10} align="center">
                        <Box style={{ background: 'rgba(33,150,243,0.12)', border: '1.5px solid rgba(33,150,243,0.4)', borderRadius: 8, padding: '7px 16px', color: '#60A5FA', fontWeight: 800, fontSize: 14, fontFamily: 'monospace', letterSpacing: 0.5 }}>
                            {data.code}
                        </Box>
                        {data.name && (
                            <Text size="sm" fw={600} style={{ color: textPri }}>
                                {data.name}{data.description ? ` — ${data.description}` : ''}
                            </Text>
                        )}
                    </Group>
                </Box>
            )}

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

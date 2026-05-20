import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, NumberInput, Switch } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

export default function LicenseClassForm({ data, setData, errors, processing, onSubmit, backHref, submitLabel = 'Save' }) {
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

    return (
        <form onSubmit={onSubmit}>
            <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 20 }}>
                <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                    <Group gap={8}>
                        <Text size="md">🪪</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Class Details</Text>
                    </Group>
                </Box>
                <Box style={{ padding: '20px 24px' }}>
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
                                color="orange"
                                styles={{ label: { color: textSec, fontSize: 13 } }}
                            />
                            <Text size="xs" style={{ color: textSec }}>
                                Inactive classes won't appear in driver registration forms.
                            </Text>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            {/* Badge preview */}
            {data.code && (
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 20 }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}><Text size="md">👁️</Text><Text fw={700} size="sm" style={{ color: textPri }}>Badge Preview</Text></Group>
                    </Box>
                    <Box style={{ padding: '16px 24px' }}>
                        <Group gap={10} align="center">
                            <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7ED', border: '1.5px solid rgba(234,88,12,0.4)', borderRadius: 8, padding: '7px 16px' }}>
                                <Text fw={800} size="sm" style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.5 }}>{data.code}</Text>
                            </Box>
                            {data.name && (
                                <Text size="sm" fw={600} style={{ color: textPri }}>
                                    {data.name}{data.description ? ` — ${data.description}` : ''}
                                </Text>
                            )}
                        </Group>
                    </Box>
                </Box>
            )}

            <Group justify="flex-end" gap="md">
                <Box
                    component={Link}
                    href={backHref}
                    style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600, background: cardBg }}
                >
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box
                        component="button"
                        type="submit"
                        disabled={processing}
                        style={{ padding: '10px 28px', height: 42, borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(194,65,12,0.35)', opacity: processing ? 0.7 : 1 }}
                    >
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}

import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, NumberInput, Switch } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

export default function DocumentTypeForm({ data, setData, errors, processing, onSubmit, backHref, submitLabel = 'Save', isBuiltin = false }) {
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
                        <Text size="md">📄</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Document Details</Text>
                        {isBuiltin && (
                            <Box style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '2px 10px' }}>
                                <Text size="10px" fw={700} style={{ color: '#818CF8' }}>BUILT-IN</Text>
                            </Box>
                        )}
                    </Group>
                </Box>
                <Box style={{ padding: '20px 24px' }}>
                    <Stack gap="md">
                        <Group grow>
                            <TextInput
                                label="Document Name"
                                placeholder="e.g. Goods Vehicle Licence Expiry"
                                required
                                disabled={isBuiltin}
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                error={errors.name}
                                styles={inputStyles}
                            />
                            <NumberInput
                                label="Sort Order"
                                placeholder="0"
                                min={0} max={999}
                                value={data.sort_order === '' ? undefined : data.sort_order}
                                onChange={v => setData('sort_order', v ?? 0)}
                                error={errors.sort_order}
                                styles={inputStyles}
                            />
                        </Group>

                        <TextInput
                            label="Description"
                            placeholder="Brief description of this document (optional)"
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
                                Inactive document types won't appear in vehicle registration forms.
                            </Text>
                        </Box>

                        {isBuiltin && (
                            <Box style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                                <Text size="xs" style={{ color: '#818CF8' }}>
                                    📌 This is a built-in document type. The name is fixed but you can update the description, sort order, and active status.
                                </Text>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Box>

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

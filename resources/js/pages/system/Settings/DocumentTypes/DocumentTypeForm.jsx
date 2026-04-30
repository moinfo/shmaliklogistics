import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, TextInput, NumberInput, Switch } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };

export default function DocumentTypeForm({ data, setData, errors, processing, onSubmit, backHref, submitLabel = 'Save', isBuiltin = false }) {
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
                        <Text style={{ fontSize: 16 }}>📄</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Document Details</Text>
                        {isBuiltin && (
                            <Box style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '2px 10px' }}>
                                <Text size="10px" fw={700} style={{ color: '#818CF8' }}>BUILT-IN</Text>
                            </Box>
                        )}
                    </Group>
                </Box>
                <Box style={{ padding: 20 }}>
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
                                styles={{ label: { color: textSec, fontSize: 13 } }}
                            />
                            <Text size="xs" style={{ color: textSec }}>
                                Inactive document types won't appear in vehicle registration forms.
                            </Text>
                        </Box>

                        {isBuiltin && (
                            <Box style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                                <Text size="xs" style={{ color: '#818CF8' }}>
                                    📌 This is a built-in document type. The name is fixed but you can update the description, sort order, and active status.
                                </Text>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Box>

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

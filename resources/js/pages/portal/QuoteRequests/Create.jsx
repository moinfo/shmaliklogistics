import { Head, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import PortalLayout from '../../../layouts/PortalLayout';

export default function PortalQuoteRequestCreate({ client }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0600' : '#ffffff';
    const cardBorder = isDark ? 'rgba(234,88,12,0.15)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const { data, setData, post, processing, errors } = useForm({
        route_from:        '',
        route_to:          '',
        cargo_description: '',
        cargo_weight_kg:   '',
        cargo_volume_m3:   '',
        preferred_date:    '',
        notes:             '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/portal/quote-requests');
    };

    const inputStyle = {
        display: 'block', width: '100%', padding: '10px 14px',
        background: inputBg, border: `1px solid ${cardBorder}`,
        borderRadius: 8, color: textPri, fontSize: 14, outline: 'none',
        boxSizing: 'border-box',
    };
    const labelStyle = { color: textSec, fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' };

    const field = (label, key, type = 'text', placeholder = '', props = {}) => (
        <Box>
            <label style={labelStyle}>{label}</label>
            <input
                type={type}
                style={{ ...inputStyle, border: `1px solid ${errors[key] ? '#EF4444' : cardBorder}` }}
                placeholder={placeholder}
                value={data[key]}
                onChange={e => setData(key, e.target.value)}
                {...props}
            />
            {errors[key] && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{errors[key]}</Text>}
        </Box>
    );

    return (
        <PortalLayout title="">
            <Head title="Request a Quote" />

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group gap={10} style={{ position: 'relative', zIndex: 1 }}>
                        <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💬</Box>
                        <Stack gap={1}>
                            <Text fw={900} size="lg" c="white">Request a Quote</Text>
                            <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Tell us about your shipment and we'll get back to you with pricing.</Text>
                        </Stack>
                    </Group>
                </Box>
            </motion.div>

            <Box style={{ maxWidth: 680, margin: '0 auto' }}>
                <form onSubmit={submit}>
                    {/* Route */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 16 }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}><Text size="md">🗺️</Text><Text fw={700} size="sm" style={{ color: textPri }}>Route</Text></Group>
                        </Box>
                        <Box style={{ padding: '20px 24px' }}>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                {field('From *', 'route_from', 'text', 'e.g. Dar es Salaam', { required: true })}
                                {field('To *', 'route_to', 'text', 'e.g. Lusaka, Zambia', { required: true })}
                                {field('Preferred Date', 'preferred_date', 'date', '')}
                            </SimpleGrid>
                        </Box>
                    </Box>

                    {/* Cargo */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 16 }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}><Text size="md">📦</Text><Text fw={700} size="sm" style={{ color: textPri }}>Cargo Details</Text></Group>
                        </Box>
                        <Box style={{ padding: '20px 24px' }}>
                            <Stack gap="md">
                                {field('Cargo Description *', 'cargo_description', 'text', 'e.g. 20 pallets of building materials', { required: true })}
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                    {field('Estimated Weight (kg)', 'cargo_weight_kg', 'number', 'e.g. 5000', { min: '0' })}
                                    {field('Volume (m³)', 'cargo_volume_m3', 'number', 'e.g. 20', { min: '0' })}
                                </SimpleGrid>
                            </Stack>
                        </Box>
                    </Box>

                    {/* Notes */}
                    <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow, marginBottom: 24 }}>
                        <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
                        <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                            <Group gap={8}><Text size="md">📝</Text><Text fw={700} size="sm" style={{ color: textPri }}>Additional Notes</Text></Group>
                        </Box>
                        <Box style={{ padding: '20px 24px' }}>
                            <label style={labelStyle}>Notes</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                                placeholder="Any special requirements, handling instructions, or questions…"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            />
                        </Box>
                    </Box>

                    <Group justify="flex-end" gap="md">
                        <Box
                            component={Link}
                            href="/portal/quote-requests"
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
                                {processing ? 'Submitting…' : 'Submit Request'}
                            </Box>
                        </motion.div>
                    </Group>
                </form>
            </Box>
        </PortalLayout>
    );
}

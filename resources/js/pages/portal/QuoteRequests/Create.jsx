import { Head, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea } from '@mantine/core';
import PortalLayout from '../../../layouts/PortalLayout';

export default function PortalQuoteRequestCreate({ client }) {
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
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(33,150,243,0.2)',
        borderRadius: 8, color: '#E2E8F0', fontSize: 14, outline: 'none',
        boxSizing: 'border-box',
    };
    const labelStyle = { color: '#94A3B8', fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' };
    const errorStyle = { color: '#EF4444', fontSize: 12, marginTop: 4 };

    return (
        <PortalLayout title="Request a Quote">
            <Head title="Request a Quote" />

            <Box style={{ maxWidth: 680, margin: '0 auto' }}>
                <Stack gap={4} mb="xl">
                    <Text fw={800} size="xl" style={{ color: '#E2E8F0' }}>Request a Quote</Text>
                    <Text size="sm" style={{ color: '#94A3B8' }}>Tell us about your shipment and we'll get back to you with pricing.</Text>
                </Stack>

                <form onSubmit={submit}>
                    {/* Route */}
                    <Box style={{ background: '#0F1E32', border: '1px solid rgba(33,150,243,0.12)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                        <Box style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <Text fw={700} size="sm" style={{ color: '#E2E8F0' }}>🗺️ Route</Text>
                        </Box>
                        <Box style={{ padding: 20 }}>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                <Box>
                                    <label style={labelStyle}>From *</label>
                                    <input style={inputStyle} placeholder="e.g. Dar es Salaam" value={data.route_from} onChange={e => setData('route_from', e.target.value)} required />
                                    {errors.route_from && <Text style={errorStyle}>{errors.route_from}</Text>}
                                </Box>
                                <Box>
                                    <label style={labelStyle}>To *</label>
                                    <input style={inputStyle} placeholder="e.g. Lusaka, Zambia" value={data.route_to} onChange={e => setData('route_to', e.target.value)} required />
                                    {errors.route_to && <Text style={errorStyle}>{errors.route_to}</Text>}
                                </Box>
                                <Box>
                                    <label style={labelStyle}>Preferred Date</label>
                                    <input type="date" style={inputStyle} value={data.preferred_date} onChange={e => setData('preferred_date', e.target.value)} />
                                    {errors.preferred_date && <Text style={errorStyle}>{errors.preferred_date}</Text>}
                                </Box>
                            </SimpleGrid>
                        </Box>
                    </Box>

                    {/* Cargo */}
                    <Box style={{ background: '#0F1E32', border: '1px solid rgba(33,150,243,0.12)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                        <Box style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <Text fw={700} size="sm" style={{ color: '#E2E8F0' }}>📦 Cargo Details</Text>
                        </Box>
                        <Box style={{ padding: 20 }}>
                            <Stack gap="md">
                                <Box>
                                    <label style={labelStyle}>Cargo Description *</label>
                                    <input style={inputStyle} placeholder="e.g. 20 pallets of building materials" value={data.cargo_description} onChange={e => setData('cargo_description', e.target.value)} required />
                                    {errors.cargo_description && <Text style={errorStyle}>{errors.cargo_description}</Text>}
                                </Box>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                    <Box>
                                        <label style={labelStyle}>Estimated Weight (kg)</label>
                                        <input type="number" min="0" style={inputStyle} placeholder="e.g. 5000" value={data.cargo_weight_kg} onChange={e => setData('cargo_weight_kg', e.target.value)} />
                                        {errors.cargo_weight_kg && <Text style={errorStyle}>{errors.cargo_weight_kg}</Text>}
                                    </Box>
                                    <Box>
                                        <label style={labelStyle}>Volume (m³)</label>
                                        <input type="number" min="0" style={inputStyle} placeholder="e.g. 20" value={data.cargo_volume_m3} onChange={e => setData('cargo_volume_m3', e.target.value)} />
                                        {errors.cargo_volume_m3 && <Text style={errorStyle}>{errors.cargo_volume_m3}</Text>}
                                    </Box>
                                </SimpleGrid>
                            </Stack>
                        </Box>
                    </Box>

                    {/* Notes */}
                    <Box style={{ background: '#0F1E32', border: '1px solid rgba(33,150,243,0.12)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
                        <Box style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <Text fw={700} size="sm" style={{ color: '#E2E8F0' }}>📝 Additional Notes</Text>
                        </Box>
                        <Box style={{ padding: 20 }}>
                            <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} placeholder="Any special requirements, handling instructions, or questions…" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                        </Box>
                    </Box>

                    <Group justify="flex-end" gap="md">
                        <Box component="a" href="/portal/quote-requests"
                            style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(33,150,243,0.2)', color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                            Cancel
                        </Box>
                        <Box component="button" type="submit" disabled={processing}
                            style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                            {processing ? 'Submitting…' : 'Submit Request'}
                        </Box>
                    </Group>
                </form>
            </Box>
        </PortalLayout>
    );
}

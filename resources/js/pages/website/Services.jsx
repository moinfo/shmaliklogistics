import { Head } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, SimpleGrid, Card, Badge, List, ThemeIcon } from '@mantine/core';
import WebsiteLayout from '../../layouts/WebsiteLayout';

const services = [
    {
        icon: '🚛',
        title: 'Long Haul Freight',
        desc: 'Cross-border trucking from Tanzania to DRC (Lubumbashi), Zambia, Malawi, and Mozambique.',
        features: ['Full truck load (FTL)', 'Part load (LTL)', 'Refrigerated cargo', 'Oversize loads'],
    },
    {
        icon: '📦',
        title: 'Cargo Management',
        desc: 'Complete cargo handling from loading at origin to delivery confirmation at destination.',
        features: ['Loading supervision', 'Weight verification', 'Cargo insurance', 'Delivery confirmation'],
    },
    {
        icon: '🛣️',
        title: 'Route Optimisation',
        desc: 'Data-driven route planning to reduce fuel costs and transit times on every trip.',
        features: ['Fuel cost analysis', 'Transit time tracking', 'Border crossing planning', 'Profit per route reporting'],
    },
    {
        icon: '🛂',
        title: 'Border & Customs',
        desc: 'Full permit and customs documentation management for all crossing points.',
        features: ['Transit permits', 'COMESA/SADC compliance', 'Customs documentation', 'Expiry alerts'],
    },
    {
        icon: '📍',
        title: 'GPS Fleet Tracking',
        desc: 'Real-time location of every vehicle in the fleet, accessible from any device.',
        features: ['Live map view', 'Trip history', 'Fuel sensor integration', 'Geofence alerts'],
    },
    {
        icon: '🤝',
        title: 'Customer Portal',
        desc: 'Your clients can log in to track shipments and view invoices without calling the office.',
        features: ['Shipment tracking', 'Invoice downloads', 'Trip history', 'SMS notifications'],
    },
];

export default function Services() {
    return (
        <WebsiteLayout>
            <Head title="Services — SH Malik Logistics" />

            {/* Header */}
            <Box
                py={80}
                style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1565C0 100%)' }}
            >
                <Container size="xl">
                    <Stack align="center" gap="md">
                        <Badge color="brand.2" variant="light" size="lg">What We Offer</Badge>
                        <Title order={1} c="white" ta="center" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                            Our Services
                        </Title>
                        <Text c="gray.3" ta="center" maw={600} size="lg">
                            Full-spectrum logistics services designed for East and Central African trade routes.
                        </Text>
                    </Stack>
                </Container>
            </Box>

            {/* Services Grid */}
            <Box py={80} style={{ background: '#f8faff' }}>
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                        {services.map((s) => (
                            <Card key={s.title} shadow="sm" radius="lg" p="xl" style={{ borderTop: '3px solid #1565C0' }}>
                                <Text size="2.5rem" mb="md">{s.icon}</Text>
                                <Text fw={700} size="xl" mb="xs" c="brand.8">{s.title}</Text>
                                <Text c="dimmed" size="sm" lh={1.6} mb="md">{s.desc}</Text>
                                <List size="sm" spacing="xs" c="brand.6">
                                    {s.features.map((f) => (
                                        <List.Item key={f}>{f}</List.Item>
                                    ))}
                                </List>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}

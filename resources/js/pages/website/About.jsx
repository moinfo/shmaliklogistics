import { Head } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, SimpleGrid, Card, Badge, Group, Avatar } from '@mantine/core';
import WebsiteLayout from '../../layouts/WebsiteLayout';

const values = [
    { icon: '🎯', title: 'Reliability', desc: 'Every trip planned and tracked to ensure on-time delivery.' },
    { icon: '🔍', title: 'Transparency', desc: 'Full cost visibility — no hidden charges on any route.' },
    { icon: '🌍', title: 'Regional Expertise', desc: 'Deep knowledge of East and Central African trade routes.' },
    { icon: '🤝', title: 'Partnership', desc: 'We treat your cargo as our own business.' },
];

export default function About() {
    return (
        <WebsiteLayout>
            <Head title="About — SH Malik Logistics" />

            {/* Header */}
            <Box
                py={80}
                style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1565C0 100%)' }}
            >
                <Container size="xl">
                    <Stack align="center" gap="md">
                        <Badge color="brand.2" variant="light" size="lg">Who We Are</Badge>
                        <Title order={1} c="white" ta="center" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                            About SH Malik Logistics
                        </Title>
                        <Text c="gray.3" ta="center" maw={600} size="lg">
                            A Tanzanian logistics company built on trust, technology, and deep regional knowledge.
                        </Text>
                    </Stack>
                </Container>
            </Box>

            {/* Story */}
            <Box py={80}>
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60} style={{ alignItems: 'center' }}>
                        <Stack gap="lg">
                            <Badge color="brand" variant="light">Our Story</Badge>
                            <Title order={2} c="brand.8">Built for Africa's Trade Routes</Title>
                            <Text c="dimmed" lh={1.8}>
                                SH Malik Logistics Company Limited was established to solve the real
                                challenges of cross-border freight in East and Central Africa — unreliable
                                transport, hidden costs, and zero visibility on cargo.
                            </Text>
                            <Text c="dimmed" lh={1.8}>
                                Based in Kibaha, Pwani, Tanzania, we operate on major corridors including
                                Dar es Salaam to Lubumbashi (DRC), Zambia, Malawi, and Mozambique —
                                with a fleet managed by experienced drivers and supported by modern
                                logistics technology.
                            </Text>
                            <Text c="dimmed" lh={1.8}>
                                Every trip is tracked, every cost is recorded, and every client gets
                                full transparency from loading to delivery.
                            </Text>
                        </Stack>
                        <Box
                            style={{
                                background: 'linear-gradient(135deg, #0A1628, #1565C0)',
                                borderRadius: 16,
                                padding: 40,
                                color: 'white',
                            }}
                        >
                            <Stack gap="xl">
                                {[
                                    { label: 'Location', value: 'Buza, Kwa Mama Kibonge, Dar es Salaam' },
                                    { label: 'Phone / WhatsApp', value: '+255 789 511 234' },
                                    { label: 'Core Routes', value: 'Tanzania → DRC, Zambia, Malawi' },
                                    { label: 'Technology', value: 'GPS Tracking + Digital Management' },
                                ].map((item) => (
                                    <Box key={item.label}>
                                        <Text size="xs" c="brand.2" fw={600} tt="uppercase" mb={4}>{item.label}</Text>
                                        <Text c="white" fw={600}>{item.value}</Text>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Values */}
            <Box py={80} style={{ background: '#f8faff' }}>
                <Container size="xl">
                    <Stack align="center" gap="sm" mb={48}>
                        <Badge color="brand" variant="light" size="lg">Our Values</Badge>
                        <Title order={2} ta="center" c="brand.8">What Drives Us</Title>
                    </Stack>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                        {values.map((v) => (
                            <Card key={v.title} shadow="sm" radius="lg" p="xl" ta="center" style={{ borderTop: '3px solid #1565C0' }}>
                                <Text size="2.5rem" mb="md">{v.icon}</Text>
                                <Text fw={700} size="lg" mb="xs" c="brand.8">{v.title}</Text>
                                <Text c="dimmed" size="sm" lh={1.6}>{v.desc}</Text>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}

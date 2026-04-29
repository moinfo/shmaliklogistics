import { Head } from '@inertiajs/react';
import {
    Box, Container, Title, Text, Stack, SimpleGrid, Card, Badge,
    TextInput, Textarea, Button, Group,
} from '@mantine/core';
import { useForm } from '@inertiajs/react';
import WebsiteLayout from '../../layouts/WebsiteLayout';

export default function Contact() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/contact', { onSuccess: () => reset() });
    };

    return (
        <WebsiteLayout>
            <Head title="Contact — SH Malik Logistics" />

            {/* Header */}
            <Box
                py={80}
                style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1565C0 100%)' }}
            >
                <Container size="xl">
                    <Stack align="center" gap="md">
                        <Badge color="brand.2" variant="light" size="lg">Get In Touch</Badge>
                        <Title order={1} c="white" ta="center" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                            Contact Us
                        </Title>
                        <Text c="gray.3" ta="center" maw={500} size="lg">
                            Ready to move your cargo? Send us a message and we'll get back to you within 24 hours.
                        </Text>
                    </Stack>
                </Container>
            </Box>

            <Box py={80} style={{ background: '#f8faff' }}>
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60}>

                        {/* Contact Info */}
                        <Stack gap="xl">
                            <Stack gap="sm">
                                <Badge color="brand" variant="light">Our Details</Badge>
                                <Title order={2} c="brand.8">SH Malik Logistics</Title>
                                <Text c="dimmed">Company Limited</Text>
                            </Stack>

                            {[
                                { icon: '📍', label: 'Address', value: 'Buza, Kwa Mama Kibonge, Dar es Salaam, Tanzania' },
                                { icon: '📞', label: 'Phone / WhatsApp', value: '+255 789 511 234' },
                                { icon: '📧', label: 'Email', value: 'info@shmalik.co.tz' },
                            ].map((item) => (
                                <Group key={item.label} gap="md" align="flex-start">
                                    <Text size="1.5rem">{item.icon}</Text>
                                    <Stack gap={2}>
                                        <Text size="xs" fw={600} tt="uppercase" c="brand.5">{item.label}</Text>
                                        <Text c="brand.8" fw={500}>{item.value}</Text>
                                    </Stack>
                                </Group>
                            ))}
                        </Stack>

                        {/* Contact Form */}
                        <Card shadow="sm" radius="lg" p="xl">
                            <form onSubmit={submit}>
                                <Stack gap="md">
                                    <Title order={3} c="brand.8">Send a Message</Title>
                                    <TextInput
                                        label="Full Name"
                                        placeholder="Your name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                        required
                                    />
                                    <TextInput
                                        label="Email Address"
                                        placeholder="your@email.com"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        required
                                    />
                                    <TextInput
                                        label="Phone Number"
                                        placeholder="+255 ..."
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        error={errors.phone}
                                    />
                                    <Textarea
                                        label="Message"
                                        placeholder="Tell us about your shipment — route, cargo type, weight..."
                                        rows={5}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        error={errors.message}
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        loading={processing}
                                        color="brand.5"
                                        radius="xl"
                                        size="md"
                                        fullWidth
                                    >
                                        Send Message
                                    </Button>
                                </Stack>
                            </form>
                        </Card>
                    </SimpleGrid>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}

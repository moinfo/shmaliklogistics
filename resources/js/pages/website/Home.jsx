import { Head, Link } from '@inertiajs/react';
import {
    Box, Container, Title, Text, Button, Group, Stack, Card,
    Badge, SimpleGrid, ThemeIcon, Divider, Avatar, Paper,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import '@mantine/carousel/styles.css';
import WebsiteLayout from '../../layouts/WebsiteLayout';

const slides = [
    {
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=80',
        badge: "Tanzania's Trusted Logistics Partner",
        title: 'Moving Your Cargo',
        highlight: 'Across Africa',
        desc: 'Reliable, transparent freight services from Dar es Salaam to DRC, Zambia, Malawi and beyond — with real-time tracking and full cost visibility on every trip.',
        features: ['GPS Fleet Tracking', 'Border Permit Management', 'Real-Time Cost Reporting'],
    },
    {
        image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=80',
        badge: 'Real-Time Cargo Visibility',
        title: 'Track Every Shipment',
        highlight: 'From Loading to Delivery',
        desc: 'Full cargo visibility with GPS tracking and live status updates. Your clients know exactly where their goods are — without calling the office.',
        features: ['Live GPS Location', 'Customer Self-Service Portal', 'Automated SMS Alerts'],
    },
    {
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1920&q=80',
        badge: 'Cross-Border Expertise',
        title: 'Border Crossings',
        highlight: 'Made Simple',
        desc: 'We handle all transit permits, customs documentation and border logistics for DRC, Zambia and Malawi — so your cargo keeps moving without delays.',
        features: ['Transit Permits Handled', 'COMESA/SADC Compliance', 'Expiry Date Alerts'],
    },
    {
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
        badge: 'Modern Fleet Management',
        title: 'A Fleet You Can',
        highlight: 'Rely On',
        desc: 'Well-maintained vehicles, experienced drivers and scheduled servicing — every trip planned and tracked for on-time, safe delivery.',
        features: ['Scheduled Maintenance Alerts', 'Driver Performance Tracking', 'Fuel Cost Monitoring'],
    },
];

const services = [
    {
        icon: '🚛',
        title: 'Long Haul Freight',
        desc: 'Full and part-load trucking on major East and Central African corridors — Dar es Salaam to DRC, Zambia, Malawi and Mozambique.',
        features: ['Full Truck Load (FTL)', 'Part Load (LTL)', 'Refrigerated cargo', 'Oversize & heavy loads'],
    },
    {
        icon: '📍',
        title: 'GPS Fleet Tracking',
        desc: 'Real-time location of every vehicle on the road, accessible from any device. Know exactly where your cargo is at all times.',
        features: ['Live map view', 'Trip history & replay', 'Fuel sensor integration', 'Geofence alerts'],
    },
    {
        icon: '🛂',
        title: 'Border & Customs',
        desc: 'End-to-end permit and customs documentation management for all border crossing points — with expiry alerts before documents lapse.',
        features: ['Transit permits', 'COMESA/SADC compliance', 'Customs documentation', 'Expiry date tracking'],
    },
    {
        icon: '📊',
        title: 'Route Profitability',
        desc: 'See the true profit of every trip — revenue vs all costs (fuel, driver allowance, border fees, maintenance) per route and per vehicle.',
        features: ['Cost per km analysis', 'Driver performance KPIs', 'Fuel efficiency reports', 'Monthly P&L per route'],
    },
    {
        icon: '📦',
        title: 'Cargo Management',
        desc: 'Complete cargo handling from loading supervision to delivery confirmation — with weight verification and cargo insurance.',
        features: ['Loading supervision', 'Weight & seal verification', 'Cargo insurance', 'Digital delivery proof'],
    },
    {
        icon: '🤝',
        title: 'Customer Portal',
        desc: 'Your clients log in to track shipments, download invoices and view trip history — reducing "where is my cargo?" calls to zero.',
        features: ['Self-service shipment tracking', 'Invoice downloads', 'Trip & payment history', 'SMS/email notifications'],
    },
];

const routes = [
    { from: 'Dar es Salaam', to: 'Lubumbashi', country: 'DRC 🇨🇩', distance: '~2,100 km', time: '5–7 days' },
    { from: 'Dar es Salaam', to: 'Lusaka', country: 'Zambia 🇿🇲', distance: '~1,900 km', time: '4–6 days' },
    { from: 'Dar es Salaam', to: 'Lilongwe', country: 'Malawi 🇲🇼', distance: '~1,400 km', time: '3–5 days' },
    { from: 'Dar es Salaam', to: 'Maputo', country: 'Mozambique 🇲🇿', distance: '~2,200 km', time: '5–7 days' },
];

const steps = [
    { n: '01', title: 'Get a Quote', desc: 'Contact us with your route, cargo type and weight. We respond within 2 hours with a full cost breakdown.' },
    { n: '02', title: 'Booking Confirmed', desc: 'We assign a vehicle and driver, prepare all documents and schedule the loading date with you.' },
    { n: '03', title: 'Track in Real Time', desc: 'Follow your cargo live on GPS. Get SMS updates at key milestones — loading, border crossing, delivery.' },
    { n: '04', title: 'Delivery & Invoice', desc: 'Cargo delivered with signed proof of delivery. Invoice sent digitally with full trip cost breakdown.' },
];

const whyUs = [
    { icon: '🎯', title: 'Full Cost Transparency', desc: 'Every shilling accounted for — fuel, driver allowance, border fees, maintenance. No hidden charges on any trip.' },
    { icon: '⏱️', title: '98% On-Time Delivery', desc: 'Disciplined route planning, real-time driver monitoring and proactive communication keeps us on schedule.' },
    { icon: '🌍', title: 'Regional Expertise', desc: 'Deep knowledge of East and Central African border requirements, road conditions and customs procedures.' },
    { icon: '📱', title: 'Technology-Driven', desc: 'GPS tracking, digital documents, customer portal and automated alerts — logistics managed from your phone.' },
];

const stats = [
    { icon: '🚛', value: '500+', label: 'Trips Completed' },
    { icon: '🚗', value: '50+', label: 'Vehicles in Fleet' },
    { icon: '🌍', value: '6', label: 'Countries Served' },
    { icon: '✅', value: '98%', label: 'On-Time Delivery' },
];

export default function Home() {
    const autoplay = useRef(Autoplay({ delay: 5000 }));

    return (
        <WebsiteLayout>
            <Head title="Home — SH Malik Logistics" />

            {/* ── Hero Slider ── */}
            <Carousel
                withIndicators
                loop
                plugins={[autoplay.current]}
                onMouseEnter={autoplay.current.stop}
                onMouseLeave={autoplay.current.reset}
                styles={{
                    indicator: {
                        width: 32, height: 4,
                        backgroundColor: 'rgba(255,255,255,0.4)',
                        transition: 'background 0.3s',
                    },
                    indicators: { bottom: 28 },
                    control: {
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                    },
                }}
            >
                {slides.map((slide, i) => (
                    <Carousel.Slide key={i}>
                        <Box style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                            <Box style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: `url(${slide.image})`,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                            }} />
                            <Box style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(105deg, rgba(10,22,40,0.93) 0%, rgba(21,101,192,0.78) 55%, rgba(10,22,40,0.5) 100%)',
                            }} />
                            <Container size="xl" style={{ position: 'relative', zIndex: 1 }} py={100}>
                                <Group align="flex-start" gap={60} wrap="nowrap">
                                    <Stack gap="lg" style={{ flex: 1, minWidth: 0 }}>
                                        <img src="/logo-icon.png" alt="SH Malik" style={{ height: 80, width: 'auto', objectFit: 'contain' }} />
                                        <Badge color="brand.4" variant="light" size="lg" radius="xl">{slide.badge}</Badge>
                                        <Title order={1} c="white" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: 1.1, fontWeight: 800 }}>
                                            {slide.title}{' '}
                                            <Text component="span" c="brand.3" inherit>{slide.highlight}</Text>
                                        </Title>
                                        <Text c="gray.3" size="lg" lh={1.8} maw={580}>{slide.desc}</Text>
                                        {/* Feature pills */}
                                        <Group gap="sm" wrap="wrap">
                                            {slide.features.map(f => (
                                                <Box key={f} style={{
                                                    background: 'rgba(33,150,243,0.18)',
                                                    border: '1px solid rgba(33,150,243,0.4)',
                                                    borderRadius: 20, padding: '6px 14px',
                                                }}>
                                                    <Text c="brand.2" size="sm" fw={500}>✓ {f}</Text>
                                                </Box>
                                            ))}
                                        </Group>
                                        <Group gap="md" mt="sm">
                                            <Button component={Link} href="/contact" size="lg" radius="xl" color="brand.4" style={{ paddingInline: 32 }}>
                                                Get a Quote
                                            </Button>
                                            <Button component={Link} href="/services" size="lg" radius="xl" variant="outline" color="white" style={{ paddingInline: 32 }}>
                                                Our Services
                                            </Button>
                                        </Group>
                                    </Stack>

                                    {/* Side info card — desktop only */}
                                    <Box visibleFrom="md" style={{ width: 280, flexShrink: 0 }}>
                                        <Paper style={{ background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }} p="xl">
                                            <Stack gap="lg">
                                                <Text c="brand.3" fw={700} size="sm" tt="uppercase" style={{ letterSpacing: 1 }}>Quick Stats</Text>
                                                {stats.map(s => (
                                                    <Group key={s.label} justify="space-between">
                                                        <Text c="gray.4" size="sm">{s.icon} {s.label}</Text>
                                                        <Text c="white" fw={800} size="lg">{s.value}</Text>
                                                    </Group>
                                                ))}
                                                <Divider color="rgba(255,255,255,0.1)" />
                                                <Text c="gray.5" size="xs" lh={1.6}>Kibaha, Pwani, Tanzania · Est. 2020</Text>
                                            </Stack>
                                        </Paper>
                                    </Box>
                                </Group>
                            </Container>
                        </Box>
                    </Carousel.Slide>
                ))}
            </Carousel>

            {/* ── Stats Bar ── */}
            <Box style={{ background: '#0E4FA0' }} py="xl">
                <Container size="xl">
                    <SimpleGrid cols={{ base: 2, sm: 4 }}>
                        {stats.map((s) => (
                            <Stack key={s.label} align="center" gap={6} py="md">
                                <Text size="1.8rem">{s.icon}</Text>
                                <Text fw={900} style={{ fontSize: '2.2rem', lineHeight: 1 }} c="white">{s.value}</Text>
                                <Text c="brand.2" size="sm" fw={500}>{s.label}</Text>
                            </Stack>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── Why Choose Us ── */}
            <Box py={80}>
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60} style={{ alignItems: 'center' }}>
                        <Stack gap="lg">
                            <Badge color="brand" variant="light" size="lg" w="fit-content">Why SH Malik</Badge>
                            <Title order={2} c="brand.8" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
                                Logistics Built on<br />Transparency & Trust
                            </Title>
                            <Text c="dimmed" size="lg" lh={1.8}>
                                Most logistics problems in Africa come from hidden costs, zero visibility, and
                                unreliable communication. We built our entire operation to solve exactly those problems.
                            </Text>
                            <SimpleGrid cols={2} spacing="md" mt="sm">
                                {whyUs.map(w => (
                                    <Box key={w.title} style={{ padding: 20, borderRadius: 12, background: '#f0f6ff', border: '1px solid #dbeafe' }}>
                                        <Text size="1.6rem" mb={8}>{w.icon}</Text>
                                        <Text fw={700} size="sm" c="brand.8" mb={4}>{w.title}</Text>
                                        <Text c="dimmed" size="xs" lh={1.6}>{w.desc}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Stack>
                        <Box style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', minHeight: 420 }}>
                            <img
                                src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=900&q=80"
                                alt="Logistics operations"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            <Box style={{
                                position: 'absolute', bottom: 24, left: 24, right: 24,
                                background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(8px)',
                                borderRadius: 12, padding: '16px 20px',
                            }}>
                                <Text c="white" fw={600} size="sm">🏆 Trusted by businesses across East Africa</Text>
                                <Text c="brand.3" size="xs" mt={4}>DRC · Zambia · Malawi · Mozambique · Kenya · Rwanda</Text>
                            </Box>
                        </Box>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── Services ── */}
            <Box py={80} style={{ background: '#f0f6ff' }}>
                <Container size="xl">
                    <Stack align="center" gap="sm" mb={52}>
                        <Badge color="brand" variant="light" size="lg">What We Do</Badge>
                        <Title order={2} ta="center" c="brand.8" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>Our Core Services</Title>
                        <Text c="dimmed" ta="center" maw={520} size="lg">
                            End-to-end logistics built for East and Central African trade routes.
                        </Text>
                    </Stack>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                        {services.map((s) => (
                            <Card key={s.title} shadow="sm" radius="xl" p={0} style={{ overflow: 'hidden' }}>
                                <Box style={{ background: 'linear-gradient(135deg, #0A1628, #1565C0)', padding: '24px 24px 20px' }}>
                                    <Text size="2.4rem">{s.icon}</Text>
                                    <Text fw={700} size="lg" c="white" mt="xs">{s.title}</Text>
                                </Box>
                                <Box p="xl">
                                    <Text c="dimmed" size="sm" lh={1.7} mb="md">{s.desc}</Text>
                                    <Stack gap={6}>
                                        {s.features.map(f => (
                                            <Group key={f} gap="xs">
                                                <Text c="brand.5" size="sm">→</Text>
                                                <Text size="sm" c="brand.8" fw={500}>{f}</Text>
                                            </Group>
                                        ))}
                                    </Stack>
                                </Box>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── Our Routes ── */}
            <Box py={80}>
                <Container size="xl">
                    <Stack align="center" gap="sm" mb={52}>
                        <Badge color="brand" variant="light" size="lg">Where We Operate</Badge>
                        <Title order={2} ta="center" c="brand.8" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>Our Active Routes</Title>
                        <Text c="dimmed" ta="center" maw={500} size="lg">
                            Regular scheduled departures on all major corridors from Dar es Salaam.
                        </Text>
                    </Stack>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                        {routes.map(r => (
                            <Card key={r.to} shadow="sm" radius="xl" p="xl" style={{ borderLeft: '4px solid #1565C0', background: '#f8faff' }}>
                                <Text fw={800} size="xl" c="brand.5" mb={4}>{r.country}</Text>
                                <Group gap={6} mb="md">
                                    <Text size="sm" c="brand.8" fw={600}>{r.from}</Text>
                                    <Text c="brand.4">→</Text>
                                    <Text size="sm" c="brand.8" fw={600}>{r.to}</Text>
                                </Group>
                                <Divider mb="md" color="#dbeafe" />
                                <Group justify="space-between">
                                    <Stack gap={2}>
                                        <Text size="xs" c="dimmed">Distance</Text>
                                        <Text size="sm" fw={700} c="brand.8">{r.distance}</Text>
                                    </Stack>
                                    <Stack gap={2}>
                                        <Text size="xs" c="dimmed">Transit Time</Text>
                                        <Text size="sm" fw={700} c="brand.8">{r.time}</Text>
                                    </Stack>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── How It Works ── */}
            <Box py={80} style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0E4FA0 100%)' }}>
                <Container size="xl">
                    <Stack align="center" gap="sm" mb={60}>
                        <Badge color="brand.3" variant="light" size="lg">Simple Process</Badge>
                        <Title order={2} ta="center" c="white" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>How It Works</Title>
                        <Text c="gray.4" ta="center" maw={500} size="lg">From first contact to final delivery in 4 clear steps.</Text>
                    </Stack>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                        {steps.map((step, i) => (
                            <Stack key={step.n} gap="md" align="flex-start">
                                <Box style={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    background: 'rgba(33,150,243,0.2)',
                                    border: '2px solid #2196F3',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Text fw={900} c="brand.3" size="lg">{step.n}</Text>
                                </Box>
                                {i < steps.length - 1 && (
                                    <Box visibleFrom="md" style={{ position: 'absolute', top: 28, left: '100%', width: '100%', height: 2, background: 'rgba(33,150,243,0.3)' }} />
                                )}
                                <Text fw={700} c="white" size="lg">{step.title}</Text>
                                <Text c="gray.4" size="sm" lh={1.7}>{step.desc}</Text>
                            </Stack>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ── CTA ── */}
            <Box py={80} style={{ background: '#f0f6ff' }}>
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60} style={{ alignItems: 'center' }}>
                        <Stack gap="lg">
                            <Badge color="brand" variant="light" size="lg" w="fit-content">Get Started Today</Badge>
                            <Title order={2} c="brand.8" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                                Ready to Move<br />Your Cargo?
                            </Title>
                            <Text c="dimmed" size="lg" lh={1.8}>
                                Contact us for a free quote on your next shipment. We respond within 2 hours
                                with a full cost breakdown — no hidden fees.
                            </Text>
                            <Group gap="md">
                                <Button component={Link} href="/contact" size="lg" radius="xl" color="brand.5" style={{ paddingInline: 36 }}>
                                    Get a Free Quote
                                </Button>
                                <Button component={Link} href="/services" size="lg" radius="xl" variant="outline" color="brand.5" style={{ paddingInline: 36 }}>
                                    View Services
                                </Button>
                            </Group>
                        </Stack>
                        <Stack gap="lg">
                            {[
                                { icon: '📞', label: 'Phone / WhatsApp', value: '+255 789 511 234', sub: 'Call or WhatsApp anytime' },
                                { icon: '📧', label: 'Email Us', value: 'info@shmalik.co.tz', sub: 'We reply within 2 hours' },
                                { icon: '📍', label: 'Location', value: 'Buza, Kwa Mama Kibonge, Dar es Salaam', sub: 'Main operations base' },
                            ].map(item => (
                                <Group key={item.label} gap="lg" style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(10,22,40,0.08)' }}>
                                    <Text size="1.8rem">{item.icon}</Text>
                                    <Stack gap={2}>
                                        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{item.label}</Text>
                                        <Text fw={700} c="brand.8">{item.value}</Text>
                                        <Text size="xs" c="dimmed">{item.sub}</Text>
                                    </Stack>
                                </Group>
                            ))}
                        </Stack>
                    </SimpleGrid>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}

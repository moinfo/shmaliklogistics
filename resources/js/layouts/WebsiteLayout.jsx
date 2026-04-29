import { AppShell, Group, Burger, NavLink, Button, Text, Box, Container, Stack, Anchor, SimpleGrid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@inertiajs/react';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export default function WebsiteLayout({ children }) {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 70 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
            padding={0}
        >
            <AppShell.Header
                style={{
                    background: 'linear-gradient(135deg, #0A1628 0%, #1565C0 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <Container size="xl" h="100%">
                    <Group h="100%" justify="space-between">
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <img
                                src="/logo-full.png"
                                alt="SH Malik Logistics"
                                style={{ height: 48, width: 'auto', objectFit: 'contain' }}
                            />
                        </Link>

                        <Group gap="xl" visibleFrom="sm">
                            {navLinks.map((link) => (
                                <Anchor
                                    key={link.href}
                                    component={Link}
                                    href={link.href}
                                    c="white"
                                    fw={500}
                                    style={{ textDecoration: 'none', opacity: 0.9 }}
                                >
                                    {link.label}
                                </Anchor>
                            ))}
                            <Button
                                component={Link}
                                href="/login"
                                variant="filled"
                                color="brand.4"
                                radius="xl"
                                size="sm"
                            >
                                Login to System
                            </Button>
                        </Group>

                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" color="white" />
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Navbar p="md" style={{ background: '#0A1628' }}>
                <Stack gap="xs">
                    <img
                        src="/logo-full.png"
                        alt="SH Malik Logistics"
                        style={{ height: 48, width: 'auto', objectFit: 'contain', marginBottom: 8 }}
                    />
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            component={Link}
                            href={link.href}
                            label={link.label}
                            c="white"
                            onClick={toggle}
                        />
                    ))}
                    <Button
                        component={Link}
                        href="/login"
                        fullWidth
                        mt="md"
                        color="brand.4"
                        radius="xl"
                    >
                        Login to System
                    </Button>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>

            <Box component="footer" style={{ background: '#050D18', borderTop: '1px solid rgba(255,255,255,0.08)' }} pt={60} pb="xl">
                <Container size="xl">
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl" mb={48}>
                        {/* Brand */}
                        <Stack gap="md">
                            <img src="/logo-full.png" alt="SH Malik Logistics" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
                            <Text c="gray.6" size="sm" lh={1.7}>
                                Tanzania's trusted freight partner for cross-border logistics across East and Central Africa.
                            </Text>
                            <Stack gap={4}>
                                <Text c="gray.5" size="xs">📍 Buza, Kwa Mama Kibonge, Dar es Salaam</Text>
                                <Text c="gray.5" size="xs">📞 +255 789 511 234</Text>
                                <Text c="gray.5" size="xs">📧 info@shmalik.co.tz</Text>
                            </Stack>
                        </Stack>

                        {/* Quick Links */}
                        <Stack gap="sm">
                            <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 1 }}>Quick Links</Text>
                            {navLinks.map((link) => (
                                <Anchor key={link.href} component={Link} href={link.href} c="gray.5" size="sm"
                                    style={{ textDecoration: 'none' }}
                                    onMouseEnter={e => e.target.style.color = '#2196F3'}
                                    onMouseLeave={e => e.target.style.color = ''}>
                                    → {link.label}
                                </Anchor>
                            ))}
                        </Stack>

                        {/* Services */}
                        <Stack gap="sm">
                            <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 1 }}>Services</Text>
                            {['Long Haul Freight', 'GPS Fleet Tracking', 'Border & Customs', 'Route Profitability', 'Customer Portal'].map(s => (
                                <Text key={s} c="gray.5" size="sm">→ {s}</Text>
                            ))}
                        </Stack>

                        {/* Routes */}
                        <Stack gap="sm">
                            <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 1 }}>Active Routes</Text>
                            {[
                                { route: 'Dar → Lubumbashi', flag: '🇨🇩' },
                                { route: 'Dar → Lusaka', flag: '🇿🇲' },
                                { route: 'Dar → Lilongwe', flag: '🇲🇼' },
                                { route: 'Dar → Maputo', flag: '🇲🇿' },
                            ].map(r => (
                                <Text key={r.route} c="gray.5" size="sm">{r.flag} {r.route}</Text>
                            ))}
                        </Stack>
                    </SimpleGrid>

                    <Box style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
                        <Group justify="space-between" wrap="wrap" gap="sm">
                            <Text c="gray.6" size="xs">© 2026 SH Malik Logistics Company Limited. All rights reserved.</Text>
                            <Text c="gray.6" size="xs">Powered by Moinfotech · makutano.co.tz</Text>
                        </Group>
                    </Box>
                </Container>
            </Box>
        </AppShell>
    );
}

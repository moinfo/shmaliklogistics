import { AppShell, Group, Burger, NavLink, Button, Text, Box, Container, Stack, Anchor, SimpleGrid, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import { useMantineColorScheme } from '@mantine/core';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export default function WebsiteLayout({ children }) {
    const [opened, { toggle, close }] = useDisclosure();
    const [scroll] = useWindowScroll();
    const { url } = usePage();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const { lang, setLang, T } = useLanguage();
    const scrolled = scroll.y > 50;
    const isDark = colorScheme === 'dark';

    const navLinks = [
        { label: T.nav.home, href: '/' },
        { label: T.nav.services, href: '/services' },
        { label: T.nav.about, href: '/about' },
        { label: T.nav.contact, href: '/contact' },
    ];

    const navBg = scrolled
        ? (isDark ? 'rgba(5,13,24,0.97)' : 'rgba(255,255,255,0.92)')
        : (isDark ? 'linear-gradient(135deg, #0A1628 0%, #1565C0 100%)' : 'linear-gradient(135deg, #0A1628 0%, #1565C0 100%)');

    const navTextColor = (active) => {
        if (scrolled && !isDark) return active ? '#1565C0' : '#1a2a4a';
        return active ? '#2196F3' : 'rgba(255,255,255,0.85)';
    };

    return (
        <AppShell
            header={{ height: scrolled ? 60 : 70 }}
            navbar={{ width: 280, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
            padding={0}
        >
            {/* ── Header ── */}
            <AppShell.Header
                style={{
                    background: navBg,
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled && !isDark ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.3s ease',
                    boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.12)' : 'none',
                }}
            >
                <Container size="xl" h="100%">
                    <Group h="100%" justify="space-between">
                        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400 }}>
                            <Link href="/" style={{ textDecoration: 'none' }}>
                                <img
                                    src="/logo-full.png"
                                    alt="SH Malik Logistics"
                                    style={{ height: scrolled ? 40 : 48, width: 'auto', objectFit: 'contain', transition: 'height 0.3s' }}
                                />
                            </Link>
                        </motion.div>

                        {/* Desktop nav */}
                        <Group gap="xl" visibleFrom="sm">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <Anchor
                                        component={Link}
                                        href={link.href}
                                        fw={500}
                                        style={{
                                            textDecoration: 'none',
                                            color: navTextColor(url === link.href),
                                            borderBottom: url === link.href ? '2px solid #2196F3' : '2px solid transparent',
                                            paddingBottom: 2,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {link.label}
                                    </Anchor>
                                </motion.div>
                            ))}

                            {/* Language toggle */}
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}>
                                <Box style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 3px', backdropFilter: 'blur(8px)' }}>
                                    {['en', 'sw'].map(l => (
                                        <motion.button
                                            key={l}
                                            onClick={() => setLang(l)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                background: lang === l ? 'rgba(33,150,243,0.85)' : 'transparent',
                                                border: 'none', cursor: 'pointer', borderRadius: 16,
                                                padding: '3px 10px', color: lang === l ? '#fff' : 'rgba(255,255,255,0.65)',
                                                fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {l}
                                        </motion.button>
                                    ))}
                                </Box>
                            </motion.div>

                            {/* Dark/light toggle */}
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                                <Tooltip label={isDark ? 'Light mode' : 'Dark mode'} position="bottom">
                                    <ActionIcon
                                        variant="subtle"
                                        radius="xl"
                                        size="lg"
                                        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'white',
                                            backdropFilter: 'blur(8px)',
                                        }}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={isDark ? 'sun' : 'moon'}
                                                initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
                                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                                exit={{ rotate: 30, opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ fontSize: 16, display: 'flex' }}
                                            >
                                                {isDark ? '☀️' : '🌙'}
                                            </motion.span>
                                        </AnimatePresence>
                                    </ActionIcon>
                                </Tooltip>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.45 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Button
                                    component={Link}
                                    href="/login"
                                    variant="filled"
                                    color="brand.4"
                                    radius="xl"
                                    size="sm"
                                    style={{ boxShadow: '0 0 20px rgba(33,150,243,0.4)' }}
                                >
                                    {T.nav.login}
                                </Button>
                            </motion.div>
                        </Group>

                        <Group gap="sm" hiddenFrom="sm">
                            {/* Mobile: compact lang + theme toggles */}
                            <Box style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 3px' }}>
                                {['en', 'sw'].map(l => (
                                    <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'rgba(33,150,243,0.85)' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: 16, padding: '3px 8px', color: lang === l ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                        {l}
                                    </button>
                                ))}
                            </Box>
                            <ActionIcon variant="subtle" radius="xl" size="md" onClick={() => setColorScheme(isDark ? 'light' : 'dark')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                                {isDark ? '☀️' : '🌙'}
                            </ActionIcon>
                            <Burger opened={opened} onClick={toggle} color="white" size="sm" />
                        </Group>
                    </Group>
                </Container>
            </AppShell.Header>

            {/* ── Mobile Drawer ── */}
            <AppShell.Navbar
                style={{
                    background: isDark ? 'rgba(5,13,24,0.97)' : 'rgba(255,255,255,0.97)',
                    backdropFilter: 'blur(20px)',
                    borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                }}
            >
                <Stack gap="xs" p="lg">
                    <img src="/logo-full.png" alt="SH Malik" style={{ height: 50, objectFit: 'contain', marginBottom: 12 }} />
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            component={Link}
                            href={link.href}
                            label={link.label}
                            style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#1a2a4a', borderRadius: 8 }}
                            onClick={close}
                        />
                    ))}
                    <Button component={Link} href="/login" fullWidth mt="md" color="brand.4" radius="xl" onClick={close}>
                        {T.nav.login}
                    </Button>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                {children}
            </AppShell.Main>

            {/* ── Footer ── */}
            <Box
                component="footer"
                style={{
                    background: isDark
                        ? 'linear-gradient(180deg, #050D18 0%, #0A1628 100%)'
                        : 'linear-gradient(180deg, #0A1628 0%, #050D18 100%)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
                pt={60} pb="xl"
            >
                <Container size="xl">
                    <Box style={{ height: 2, background: 'linear-gradient(90deg, transparent, #1565C0, #2196F3, transparent)', marginBottom: 48, borderRadius: 2 }} />

                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl" mb={48}>
                        <Stack gap="md">
                            <img src="/logo-full.png" alt="SH Malik Logistics" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
                            <Text c="gray.6" size="sm" lh={1.8}>{T.footer.tagline}</Text>
                            <Stack gap={6}>
                                <Text c="gray.5" size="sm">📍 Handeni, Tanzania</Text>
                                <Text c="gray.5" size="sm">📞 +255 652 373 434</Text>
                                <Text c="gray.5" size="sm">📧 shmaliklogisticscoltd@gmail.com</Text>
                            </Stack>
                        </Stack>

                        <Stack gap="sm">
                            <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 2 }}>{T.footer.quickLinks}</Text>
                            {navLinks.map((link) => (
                                <Anchor key={link.href} component={Link} href={link.href} c="gray.5" size="sm"
                                    style={{ textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#2196F3'}
                                    onMouseLeave={e => e.target.style.color = ''}>
                                    → {link.label}
                                </Anchor>
                            ))}
                        </Stack>

                        <Stack gap="sm">
                            <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 2 }}>{T.footer.services}</Text>
                            {T.home.services.items.slice(0, 5).map(s => (
                                <Text key={s.title} c="gray.5" size="sm" style={{ cursor: 'default' }}>→ {s.title}</Text>
                            ))}
                        </Stack>

                        <Stack gap="sm">
                            <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 2 }}>{T.footer.activeRoutes}</Text>
                            {T.home.routes.items.map(r => (
                                <Text key={r.to} c="gray.5" size="sm">{r.flag} Tanzania → {r.to}</Text>
                            ))}
                        </Stack>
                    </SimpleGrid>

                    <Box style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
                        <Group justify="space-between" wrap="wrap" gap="sm">
                            <Text c="gray.6" size="xs">{T.footer.copyright}</Text>
                            <Group gap="xs">
                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#1565C0' }} />
                                <Text c="gray.6" size="xs">Handeni, Tanzania</Text>
                            </Group>
                        </Group>
                    </Box>
                </Container>
            </Box>
        </AppShell>
    );
}

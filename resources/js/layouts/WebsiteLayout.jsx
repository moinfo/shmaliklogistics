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
        ? (isDark ? 'rgba(10,4,0,0.97)' : 'rgba(255,255,255,0.96)')
        : (isDark ? 'linear-gradient(135deg, #0A0400 0%, #C2410C 100%)' : 'rgba(255,255,255,0.98)');

    const navTextColor = (active) => {
        if (!isDark) return active ? '#C2410C' : '#1a2a4a';
        return active ? '#EA580C' : 'rgba(255,255,255,0.85)';
    };

    const langBtnBg = (active) => {
        if (!isDark) return active ? 'rgba(194,65,12,0.12)' : 'transparent';
        return active ? 'rgba(234,88,12,0.85)' : 'transparent';
    };
    const langBtnColor = (active) => {
        if (!isDark) return active ? '#C2410C' : '#475569';
        return active ? '#fff' : 'rgba(255,255,255,0.65)';
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
                                <Group gap={10} align="center" wrap="nowrap">
                                    <img
                                        src="/logo.jpeg"
                                        alt="Trans-Mas Logistics"
                                        style={{ height: scrolled ? 44 : 56, width: 'auto', objectFit: 'contain', transition: 'height 0.3s', borderRadius: 8 }}
                                    />
                                    <Stack gap={0}>
                                        <Text fw={900} size="sm" style={{ lineHeight: 1.1, color: isDark ? '#ffffff' : '#1E293B', letterSpacing: 0.5 }}>
                                            TRANS-MAS
                                        </Text>
                                        <Text size="xs" fw={500} style={{ color: isDark ? '#FB923C' : '#EA580C', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.2 }}>
                                            Logistics Co. Ltd
                                        </Text>
                                    </Stack>
                                </Group>
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
                                            borderBottom: url === link.href ? '2px solid #EA580C' : '2px solid transparent',
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
                                <Box style={{ display: 'flex', gap: 1, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: '2px 3px', backdropFilter: 'blur(8px)' }}>
                                    {['en', 'sw'].map(l => (
                                        <motion.button
                                            key={l}
                                            onClick={() => setLang(l)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                background: langBtnBg(lang === l),
                                                border: 'none', cursor: 'pointer', borderRadius: 16,
                                                padding: '3px 10px', color: langBtnColor(lang === l),
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
                                            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                                            color: isDark ? 'white' : '#1a2a4a',
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
                                    style={{ boxShadow: '0 0 20px rgba(234,88,12,0.4)' }}
                                >
                                    {T.nav.login}
                                </Button>
                            </motion.div>
                        </Group>

                        <Group gap="sm" hiddenFrom="sm">
                            {/* Mobile: compact lang + theme toggles */}
                            <Box style={{ display: 'flex', gap: 1, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: '2px 3px' }}>
                                {['en', 'sw'].map(l => (
                                    <button key={l} onClick={() => setLang(l)} style={{ background: langBtnBg(lang === l), border: 'none', cursor: 'pointer', borderRadius: 16, padding: '3px 8px', color: langBtnColor(lang === l), fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                        {l}
                                    </button>
                                ))}
                            </Box>
                            <ActionIcon variant="subtle" radius="xl" size="md" onClick={() => setColorScheme(isDark ? 'light' : 'dark')} style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? 'white' : '#1a2a4a' }}>
                                {isDark ? '☀️' : '🌙'}
                            </ActionIcon>
                            <Burger opened={opened} onClick={toggle} color={isDark ? 'white' : '#1a2a4a'} size="sm" />
                        </Group>
                    </Group>
                </Container>
            </AppShell.Header>

            {/* ── Mobile Drawer ── */}
            <AppShell.Navbar
                style={{
                    background: isDark ? 'rgba(10,4,0,0.97)' : 'rgba(255,255,255,0.97)',
                    backdropFilter: 'blur(20px)',
                    borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                }}
            >
                <Stack gap="xs" p="lg">
                    <Group gap={10} align="center" mb={12}>
                        <img src="/logo.jpeg" alt="Trans-Mas Logistics" style={{ height: 60, width: 'auto', objectFit: 'contain', borderRadius: 8 }} />
                        <Stack gap={0}>
                            <Text fw={900} size="sm" style={{ lineHeight: 1.1, color: isDark ? '#ffffff' : '#1E293B', letterSpacing: 0.5 }}>TRANS-MAS</Text>
                            <Text size="xs" fw={500} style={{ color: '#EA580C', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.2 }}>Logistics Co. Ltd</Text>
                        </Stack>
                    </Group>
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
                style={{ background: 'linear-gradient(180deg, #100500 0%, #070200 100%)', position: 'relative', overflow: 'hidden' }}
            >
                {/* Dot grid */}
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(234,88,12,0.045) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
                {/* Glow blobs */}
                <Box style={{ position: 'absolute', top: -80, left: -60, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,65,12,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <Box style={{ position: 'absolute', bottom: 0, right: 60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Top accent bar */}
                <Box style={{ height: 3, background: 'linear-gradient(90deg, transparent 0%, #C2410C 25%, #EA580C 50%, #C2410C 75%, transparent 100%)' }} />

                <Container size="xl" pt={56} pb="xl" style={{ position: 'relative', zIndex: 1 }}>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl" mb={52}>

                        {/* Company */}
                        <Stack gap="lg">
                            <img src="/logo.jpeg" alt="Trans-Mas Logistics" style={{ height: 72, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
                            <Text c="gray.5" size="sm" lh={1.8}>{T.footer.tagline}</Text>
                            <Stack gap={8}>
                                {[
                                    { icon: '📍', text: 'Handeni, Tanzania' },
                                    { icon: '📞', text: '+255 652 373 434' },
                                    { icon: '📧', text: 'info@transmaslogistics.co.tz' },
                                ].map(item => (
                                    <Group key={item.text} gap={10} style={{ background: 'rgba(234,88,12,0.07)', border: '1px solid rgba(234,88,12,0.14)', borderRadius: 10, padding: '8px 12px' }}>
                                        <Text size="sm">{item.icon}</Text>
                                        <Text c="gray.4" size="xs">{item.text}</Text>
                                    </Group>
                                ))}
                            </Stack>
                        </Stack>

                        {/* Quick Links */}
                        <Stack gap="sm">
                            <Group gap={8} mb={6}>
                                <Box style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #EA580C, #C2410C)', borderRadius: 2 }} />
                                <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 2 }}>{T.footer.quickLinks}</Text>
                            </Group>
                            {navLinks.map((link) => (
                                <Anchor key={link.href} component={Link} href={link.href}
                                    style={{ textDecoration: 'none', color: '#94A3B8', fontSize: 14, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#FB923C'; e.currentTarget.style.paddingLeft = '4px'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.paddingLeft = '0'; }}>
                                    <Box style={{ width: 4, height: 4, borderRadius: '50%', background: '#EA580C', flexShrink: 0 }} />
                                    {link.label}
                                </Anchor>
                            ))}
                        </Stack>

                        {/* Services */}
                        <Stack gap="sm">
                            <Group gap={8} mb={6}>
                                <Box style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #EA580C, #C2410C)', borderRadius: 2 }} />
                                <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 2 }}>{T.footer.services}</Text>
                            </Group>
                            {T.home.services.items.slice(0, 5).map(s => (
                                <Group key={s.title} gap={8} align="flex-start">
                                    <Box style={{ width: 4, height: 4, borderRadius: '50%', background: '#EA580C', flexShrink: 0, marginTop: 6 }} />
                                    <Text c="gray.5" size="sm" style={{ lineHeight: 1.5 }}>{s.title}</Text>
                                </Group>
                            ))}
                        </Stack>

                        {/* Active Routes */}
                        <Stack gap={8}>
                            <Group gap={8} mb={6}>
                                <Box style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #EA580C, #C2410C)', borderRadius: 2 }} />
                                <Text fw={700} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 2 }}>{T.footer.activeRoutes}</Text>
                            </Group>
                            {T.home.routes.items.map(r => (
                                <Group key={r.to} gap={10} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px' }}>
                                    <Text style={{ fontSize: '1.1rem' }}>{r.flag}</Text>
                                    <Box>
                                        <Text c="gray.6" size="10px" fw={500} tt="uppercase" style={{ letterSpacing: 0.6 }}>Tanzania</Text>
                                        <Text c="brand.3" size="sm" fw={600}>→ {r.to}</Text>
                                    </Box>
                                </Group>
                            ))}
                        </Stack>
                    </SimpleGrid>

                    {/* Bottom bar */}
                    <Box style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
                        <Group justify="space-between" wrap="wrap" gap="sm">
                            <Text c="gray.6" size="xs">{T.footer.copyright}</Text>
                            <Group gap="lg">
                                <Group gap={6}>
                                    <motion.div
                                        style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }}
                                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <Text c="gray.5" size="xs">Online · Handeni, Tanzania</Text>
                                </Group>
                                <Text c="gray.6" size="xs" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 12 }}>
                                    TIN: 187-839-823
                                </Text>
                            </Group>
                        </Group>
                    </Box>
                </Container>
            </Box>
        </AppShell>
    );
}

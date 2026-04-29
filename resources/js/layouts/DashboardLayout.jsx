import { AppShell, Group, Text, Box, Stack, NavLink, Anchor, Tooltip, ActionIcon, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMantineColorScheme } from '@mantine/core';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/system/dashboard' },
    { icon: '🚛', label: 'Trips', href: '/system/trips', soon: true },
    { icon: '🚗', label: 'Fleet', href: '/system/fleet', soon: true },
    { icon: '🛂', label: 'Permits', href: '/system/permits', soon: true },
    { icon: '📦', label: 'Cargo', href: '/system/cargo', soon: true },
    { icon: '👥', label: 'Clients', href: '/system/clients', soon: true },
    { icon: '📈', label: 'Reports', href: '/system/reports', soon: true },
    { icon: '⚙️', label: 'Settings', href: '/system/settings', soon: true },
];

export default function DashboardLayout({ title = 'Dashboard', children }) {
    const [opened, { toggle }] = useDisclosure();
    const { url, props } = usePage();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const user = props.auth?.user;

    const logout = () => router.post('/logout');

    const sidebarBg = '#050D18';
    const mainBg = isDark ? '#0A1628' : '#F4F7FB';

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding={0}
            styles={{
                main: { background: mainBg, minHeight: '100vh' },
            }}
        >
            {/* ── Top bar ── */}
            <AppShell.Header style={{ background: isDark ? '#050D18' : '#ffffff', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e8edf2', boxShadow: '0 1px 8px rgba(0,0,0,0.12)' }}>
                <Group h="100%" px="lg" justify="space-between">
                    <Group gap="sm">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color={isDark ? 'white' : '#1a2a4a'} />
                        <Text fw={700} size="lg" c={isDark ? 'white' : 'brand.8'}>{title}</Text>
                    </Group>
                    <Group gap="sm">
                        <Tooltip label={isDark ? 'Light mode' : 'Dark mode'}>
                            <ActionIcon variant="subtle" radius="xl" size="lg" onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
                                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#555' }}>
                                <AnimatePresence mode="wait">
                                    <motion.span key={isDark ? 'sun' : 'moon'} initial={{ rotate: -30, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 30, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }} style={{ fontSize: 16 }}>
                                        {isDark ? '☀️' : '🌙'}
                                    </motion.span>
                                </AnimatePresence>
                            </ActionIcon>
                        </Tooltip>
                        <Box style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text c="white" fw={700} size="sm">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
                        </Box>
                        <Box visibleFrom="sm">
                            <Text fw={600} size="sm" c={isDark ? 'white' : 'brand.8'} lh={1.2}>{user?.name || 'Admin'}</Text>
                            <Text size="xs" c="dimmed">{user?.email}</Text>
                        </Box>
                        <Tooltip label="Logout">
                            <ActionIcon variant="subtle" size="lg" radius="xl" onClick={logout}
                                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#888' }}>
                                <Text size="lg">🚪</Text>
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* ── Sidebar ── */}
            <AppShell.Navbar style={{ background: sidebarBg, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <Stack gap={0} style={{ height: '100%' }}>
                    {/* Logo */}
                    <Box style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <Link href="/">
                            <img src="/logo-full.png" alt="SH Malik" style={{ height: 44, objectFit: 'contain' }} />
                        </Link>
                    </Box>

                    {/* Nav items */}
                    <Box style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
                        <Stack gap={2}>
                            {navItems.map((item) => {
                                const active = url.startsWith(item.href);
                                return (
                                    <motion.div key={item.href} whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400 }}>
                                        <Box
                                            component={item.soon ? 'div' : Link}
                                            href={item.soon ? undefined : item.href}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '9px 14px', borderRadius: 10, cursor: item.soon ? 'default' : 'pointer',
                                                background: active ? 'rgba(33,150,243,0.18)' : 'transparent',
                                                border: active ? '1px solid rgba(33,150,243,0.35)' : '1px solid transparent',
                                                textDecoration: 'none', transition: 'all 0.15s',
                                                opacity: item.soon ? 0.45 : 1,
                                            }}
                                            onMouseEnter={e => { if (!active && !item.soon) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <Text style={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.icon}</Text>
                                            <Text fw={active ? 700 : 500} size="sm" c={active ? 'brand.3' : 'gray.5'}>{item.label}</Text>
                                            {item.soon && <Text size="xs" c="gray.7" style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 5px' }}>Soon</Text>}
                                        </Box>
                                    </motion.div>
                                );
                            })}
                        </Stack>
                    </Box>

                    {/* Bottom: website link */}
                    <Box style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <Anchor component={Link} href="/" size="xs" c="gray.6" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Text size="sm">🌐</Text> Back to website
                        </Anchor>
                    </Box>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                <Box style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
                    {children}
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}

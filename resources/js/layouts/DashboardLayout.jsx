import { useState } from 'react';
import { AppShell, Group, Text, Box, Stack, Anchor, Tooltip, ActionIcon, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMantineColorScheme } from '@mantine/core';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/system/dashboard' },
    { icon: '🚛', label: 'Trips',     href: '/system/trips' },
    { icon: '🚗', label: 'Fleet',     href: '/system/fleet' },
    { icon: '👤', label: 'Drivers',   href: '/system/drivers' },
    { icon: '🛂', label: 'Permits',   href: '/system/permits' },
    { icon: '👥', label: 'Clients',   href: '/system/clients' },
    {
        icon: '🧾', label: 'Billing', href: '/system/billing',
        children: [
            { icon: '💬', label: 'Quotes',    href: '/system/billing/quotes' },
            { icon: '📋', label: 'Proforma',  href: '/system/billing/proformas' },
            { icon: '📄', label: 'Invoices',  href: '/system/billing/invoices' },
            { icon: '💳', label: 'Payments',  href: '/system/billing/payments' },
        ],
    },
    { icon: '💸', label: 'Expenses',    href: '/system/expenses' },
    { icon: '🔧', label: 'Maintenance', href: '/system/maintenance' },
    { icon: '📁', label: 'Documents',   href: '/system/documents' },
    {
        icon: '👥', label: 'HR', href: '/system/hr',
        children: [
            { icon: '🧑‍💼', label: 'Employees',  href: '/system/hr/employees' },
            { icon: '🏖️',  label: 'Leave',      href: '/system/hr/leave' },
            { icon: '💰',  label: 'Payroll',    href: '/system/hr/payroll' },
            { icon: '💵',  label: 'Advances',   href: '/system/hr/advances' },
            { icon: '🏦',  label: 'Loans',      href: '/system/hr/loans' },
            { icon: '🎁',  label: 'Allowances',  href: '/system/hr/allowances' },
            { icon: '🕐',  label: 'Attendance',  href: '/system/hr/attendance' },
            { icon: '📑',  label: 'Salary Slip', href: '/system/hr/salary-slips' },
        ],
    },
    {
        icon: '📈', label: 'Reports', href: '/system/reports',
        children: [
            { icon: '📊', label: 'Route Profitability', href: '/system/reports/route-profitability' },
            { icon: '💹', label: 'Financial Summary',   href: '/system/reports/financial-summary' },
            { icon: '🚛', label: 'Fleet Utilization',   href: '/system/reports/fleet-utilization' },
        ],
    },
    { icon: '📦', label: 'Cargo', href: '/system/cargo', soon: true },
    {
        icon: '⚙️', label: 'Settings', href: '/system/settings',
        children: [
            { icon: '🏢', label: 'Company Settings',        href: '/system/settings/company' },
            { icon: '🪪', label: 'Licence Classes',         href: '/system/settings/license-classes' },
            { icon: '📄', label: 'Document Types',          href: '/system/settings/document-types' },
            { icon: '💰', label: 'Payroll Settings',        href: '/system/settings/payroll' },
            { icon: '📋', label: 'Deductions',              href: '/system/settings/deductions' },
            { icon: '🔗', label: 'Deduction Subscriptions', href: '/system/settings/deduction-subscriptions' },
            { icon: '🏛️', label: 'Staff Bank Details',      href: '/system/settings/bank-details' },
        ],
    },
];

// Dark layer system: sidebar < header < main < card < hover
const dk = {
    sidebar:  '#050D18',
    header:   '#07111F',
    main:     '#0B1627',
    card:     '#0F1E32',
    cardHov:  '#132436',
    border:   'rgba(33,150,243,0.12)',
    divider:  'rgba(255,255,255,0.06)',
    textPri:  '#E2E8F0',
    textSec:  '#94A3B8',
    textMut:  '#475569',
};

// Light sidebar tokens
const lk = {
    sidebar:  '#ffffff',
    divider:  '#E8EDF4',
    textPri:  '#1E293B',
    textSec:  '#64748B',
    textMut:  '#94A3B8',
};

export default function DashboardLayout({ title = 'Dashboard', children }) {
    const [opened, { toggle }] = useDisclosure();
    const { url, props } = usePage();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const user = props.auth?.user;

    // Auto-expand any group whose href matches the current URL
    const [expandedGroups, setExpandedGroups] = useState(() =>
        navItems
            .filter(item => item.children && url.startsWith(item.href))
            .map(item => item.href)
    );

    const toggleGroup = (href) => {
        setExpandedGroups(prev =>
            prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]
        );
    };

    const logout = () => router.post('/logout');

    return (
        <AppShell
            header={{ height: 62 }}
            navbar={{ width: 244, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding={0}
            styles={{ main: { background: isDark ? dk.main : '#F0F4F9', minHeight: '100vh' } }}
        >
            {/* ── Top bar ── */}
            <AppShell.Header style={{
                background: isDark ? dk.header : '#ffffff',
                borderBottom: isDark ? `1px solid ${dk.divider}` : '1px solid #E2E8F0',
                boxShadow: isDark ? '0 1px 0 rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.06)',
            }}>
                <Group h="100%" px="xl" justify="space-between">
                    <Group gap="sm">
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color={isDark ? dk.textSec : '#64748B'} />
                        <Text fw={700} size="md" style={{ color: isDark ? dk.textPri : '#1E293B', letterSpacing: -0.3 }}>{title}</Text>
                    </Group>

                    <Group gap="xs">
                        <Tooltip label={isDark ? 'Light mode' : 'Dark mode'} position="bottom">
                            <ActionIcon
                                variant="subtle" radius="xl" size={36}
                                onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
                                style={{
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                                    border: isDark ? `1px solid ${dk.divider}` : '1px solid #E2E8F0',
                                    color: isDark ? dk.textSec : '#64748B',
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.span key={isDark ? 'sun' : 'moon'} initial={{ rotate: -30, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 30, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }} style={{ fontSize: 15 }}>
                                        {isDark ? '☀️' : '🌙'}
                                    </motion.span>
                                </AnimatePresence>
                            </ActionIcon>
                        </Tooltip>

                        {/* Divider */}
                        <Box style={{ width: 1, height: 32, background: isDark ? dk.divider : '#E2E8F0' }} />

                        {/* Avatar */}
                        <Box style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(33,150,243,0.4)' }}>
                            <Text c="white" fw={800} size="sm">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
                        </Box>
                        <Box visibleFrom="sm">
                            <Text fw={600} size="sm" style={{ color: isDark ? dk.textPri : '#1E293B' }} lh={1.2}>{user?.name || 'Admin'}</Text>
                            <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>{user?.email}</Text>
                        </Box>

                        <Tooltip label="Logout" position="bottom">
                            <ActionIcon
                                variant="subtle" size={36} radius="xl" onClick={logout}
                                style={{
                                    background: isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2',
                                    border: isDark ? '1px solid rgba(239,68,68,0.15)' : '1px solid #FECACA',
                                    color: '#EF4444',
                                }}
                            >
                                <Text size="sm">↩</Text>
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* ── Sidebar ── */}
            <AppShell.Navbar style={{
                background: isDark ? dk.sidebar : lk.sidebar,
                borderRight: `1px solid ${isDark ? dk.divider : lk.divider}`,
                boxShadow: isDark ? 'none' : '2px 0 12px rgba(0,0,0,0.06)',
            }}>
                <Stack gap={0} style={{ height: '100%' }}>
                    {/* Logo */}
                    <Box style={{ padding: '18px 20px 16px', borderBottom: `1px solid ${isDark ? dk.divider : lk.divider}` }}>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <img src="/logo-full.png" alt="SH Malik" style={{ height: 42, objectFit: 'contain' }} />
                        </Link>
                    </Box>

                    {/* Section label */}
                    <Box style={{ padding: '16px 16px 6px' }}>
                        <Text size="10px" fw={700} style={{ color: isDark ? dk.textMut : lk.textMut, letterSpacing: 1.2, textTransform: 'uppercase' }}>Main Menu</Text>
                    </Box>

                    {/* Nav items */}
                    <Box style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
                        <Stack gap={2}>
                            {navItems.map((item) => {
                                const isGroup    = !!item.children;
                                const expanded   = expandedGroups.includes(item.href);
                                const active     = !isGroup && url.startsWith(item.href);
                                const groupActive = isGroup && url.startsWith(item.href);

                                const hoverBg      = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
                                const activeBg     = isDark ? 'rgba(33,150,243,0.15)' : 'rgba(21,101,192,0.08)';
                                const activeText   = isDark ? '#60A5FA' : '#1565C0';
                                const inactiveText = isDark ? dk.textSec : lk.textSec;
                                const soonBg       = isDark ? 'rgba(255,255,255,0.07)' : '#F1F5F9';
                                const soonText     = isDark ? dk.textMut : lk.textMut;

                                return (
                                    <div key={item.href}>
                                        <motion.div whileHover={!item.soon ? { x: 3 } : {}} transition={{ type: 'spring', stiffness: 400 }}>
                                            <Box
                                                component={isGroup || item.soon ? 'div' : Link}
                                                href={isGroup || item.soon ? undefined : item.href}
                                                onClick={isGroup ? () => toggleGroup(item.href) : undefined}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    padding: '9px 12px', borderRadius: 8,
                                                    cursor: item.soon ? 'default' : 'pointer',
                                                    background: (active || (groupActive && expanded)) ? activeBg : 'transparent',
                                                    borderLeft: (active || groupActive) ? '3px solid #2196F3' : '3px solid transparent',
                                                    textDecoration: 'none', transition: 'all 0.15s',
                                                    opacity: item.soon ? 0.45 : 1,
                                                }}
                                                onMouseEnter={e => { if (!active && !item.soon) e.currentTarget.style.background = hoverBg; }}
                                                onMouseLeave={e => { if (!active && !(groupActive && expanded)) e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <Text style={{ fontSize: '1rem', lineHeight: 1, width: 20, textAlign: 'center' }}>{item.icon}</Text>
                                                <Text fw={(active || groupActive) ? 700 : 500} size="sm" style={{ color: (active || groupActive) ? activeText : inactiveText, flex: 1 }}>{item.label}</Text>
                                                {item.soon && (
                                                    <Box style={{ background: soonBg, borderRadius: 4, padding: '1px 6px' }}>
                                                        <Text style={{ fontSize: 9, color: soonText, fontWeight: 700, letterSpacing: 0.5 }}>SOON</Text>
                                                    </Box>
                                                )}
                                                {isGroup && (
                                                    <Text style={{ fontSize: 10, color: inactiveText, transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</Text>
                                                )}
                                                {active && (
                                                    <motion.div layoutId="activeIndicator" style={{ width: 6, height: 6, borderRadius: '50%', background: '#2196F3', flexShrink: 0 }} />
                                                )}
                                            </Box>
                                        </motion.div>

                                        {/* Children (accordion) */}
                                        {isGroup && expanded && (
                                            <AnimatePresence>
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.18 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <Stack gap={1} style={{ paddingLeft: 8, marginTop: 2 }}>
                                                        {item.children.map((child) => {
                                                            const childActive = url.startsWith(child.href);
                                                            return (
                                                                <Box
                                                                    key={child.href}
                                                                    component={Link}
                                                                    href={child.href}
                                                                    style={{
                                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                                        padding: '7px 10px 7px 14px', borderRadius: 8,
                                                                        background: childActive ? activeBg : 'transparent',
                                                                        borderLeft: childActive ? '2px solid #2196F3' : '2px solid rgba(33,150,243,0.15)',
                                                                        textDecoration: 'none', transition: 'all 0.15s',
                                                                    }}
                                                                    onMouseEnter={e => { if (!childActive) e.currentTarget.style.background = hoverBg; }}
                                                                    onMouseLeave={e => { if (!childActive) e.currentTarget.style.background = 'transparent'; }}
                                                                >
                                                                    <Text style={{ fontSize: '0.85rem', lineHeight: 1, width: 16, textAlign: 'center', opacity: 0.8 }}>{child.icon}</Text>
                                                                    <Text fw={childActive ? 700 : 500} size="xs" style={{ color: childActive ? activeText : inactiveText }}>{child.label}</Text>
                                                                    {childActive && (
                                                                        <Box style={{ width: 5, height: 5, borderRadius: '50%', background: '#2196F3', marginLeft: 'auto', flexShrink: 0 }} />
                                                                    )}
                                                                </Box>
                                                            );
                                                        })}
                                                    </Stack>
                                                </motion.div>
                                            </AnimatePresence>
                                        )}
                                    </div>
                                );
                            })}
                        </Stack>
                    </Box>

                    {/* Bottom */}
                    <Box style={{ padding: '12px 16px 20px', borderTop: `1px solid ${isDark ? dk.divider : lk.divider}` }}>
                        <Box style={{
                            background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                            borderRadius: 10, padding: '10px 12px',
                            border: `1px solid ${isDark ? dk.divider : lk.divider}`,
                            marginBottom: 10,
                        }}>
                            <Text size="xs" style={{ color: isDark ? dk.textMut : lk.textMut }} mb={2}>Logged in as</Text>
                            <Text size="sm" fw={600} style={{ color: isDark ? dk.textSec : lk.textPri }}>{user?.name || 'Admin'}</Text>
                        </Box>
                        <Anchor component={Link} href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Text size="sm">🌐</Text>
                            <Text size="xs" style={{ color: isDark ? dk.textMut : lk.textSec }}>Back to website</Text>
                        </Anchor>
                    </Box>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                <Box style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto' }}>
                    {children}
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}

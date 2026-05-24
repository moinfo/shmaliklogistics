import { useState, useEffect } from 'react';
import { AppShell, Group, Text, Box, Stack, Anchor, Tooltip, ActionIcon, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMantineColorScheme } from '@mantine/core';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkPermission } from '../lib/can';

// Each item carries a `perm` (single permission) or `anyPerm` (array; visible if user has any).
// Items without either are always visible (Dashboard, Notifications).
const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/system/dashboard' },

    { icon: '🚛', label: 'Trips', href: '/system/trips', perm: 'trips.view' },

    // ── Fleet ─────────────────────────────────────────────────────────────────
    {
        icon: '🚗', label: 'Fleet', href: '/system/fleet',
        anyPerm: ['fleet.view', 'fleet_fuel_logs.view', 'inspections.view', 'trip_check_ins.view'],
        children: [
            { icon: '🚗', label: 'All Vehicles',  href: '/system/fleet',                    perm: 'fleet.view' },
            { icon: '⛽', label: 'Fuel Logs',     href: '/system/fleet/fuel-logs',          perm: 'fleet_fuel_logs.view' },
            { icon: '🔧', label: 'Inspections',   href: '/system/inspections',              perm: 'inspections.view' },
            { icon: '📍', label: 'Check-Ins',     href: '/system/check-ins',                perm: 'trip_check_ins.view' },
            { icon: '🗺️', label: 'Live Map',      href: '/system/fleet/live-map',           soon: true },
        ],
    },

    { icon: '👤', label: 'Drivers',   href: '/system/drivers', perm: 'drivers.view' },
    { icon: '🛂', label: 'Permits',   href: '/system/permits', perm: 'permits.view' },
    { icon: '👥', label: 'Clients',   href: '/system/clients', perm: 'clients.view' },

    // ── Billing ───────────────────────────────────────────────────────────────
    {
        icon: '🧾', label: 'Billing', href: '/system/billing',
        anyPerm: ['billing_quotes.view', 'billing_proformas.view', 'billing_invoices.view', 'billing_payments.view', 'billing_quote_requests.view'],
        children: [
            { icon: '💬', label: 'Quotes',         href: '/system/billing/quotes',         perm: 'billing_quotes.view' },
            { icon: '📋', label: 'Proforma',       href: '/system/billing/proformas',      perm: 'billing_proformas.view' },
            { icon: '📄', label: 'Invoices',       href: '/system/billing/invoices',       perm: 'billing_invoices.view' },
            { icon: '💳', label: 'Payments',       href: '/system/billing/payments',       perm: 'billing_payments.view' },
            { icon: '🔴', label: 'Debtors',        href: '/system/billing/debtors',        perm: 'billing_invoices.view' },
            { icon: '📥', label: 'Quote Requests', href: '/system/billing/quote-requests', perm: 'billing_quote_requests.view' },
        ],
    },

    { icon: '💸', label: 'Expenses',    href: '/system/expenses',    perm: 'expenses.view' },
    { icon: '🔧', label: 'Maintenance', href: '/system/maintenance', perm: 'maintenance.view' },
    { icon: '📁', label: 'Documents',   href: '/system/documents',   perm: 'documents.view' },
    { icon: '📦', label: 'Cargo',       href: '/system/cargo',       perm: 'cargo.view' },

    // ── HR ────────────────────────────────────────────────────────────────────
    {
        icon: '👥', label: 'HR', href: '/system/hr',
        anyPerm: ['hr_employees.view', 'hr_leave.view', 'hr_payroll.view', 'hr_advances.view', 'hr_loans.view', 'hr_allowances.view', 'hr_bonus.view', 'hr_attendance.view', 'hr_salary_slips.view', 'hr_appraisals.view', 'hr_recruitment.view'],
        children: [
            { icon: '🧑‍💼', label: 'Employees',   href: '/system/hr/employees',    perm: 'hr_employees.view' },
            { icon: '🏖️',  label: 'Leave',       href: '/system/hr/leave',        perm: 'hr_leave.view' },
            { icon: '💰',  label: 'Payroll',     href: '/system/hr/payroll',      perm: 'hr_payroll.view' },
            { icon: '💵',  label: 'Advances',    href: '/system/hr/advances',     perm: 'hr_advances.view' },
            { icon: '🏦',  label: 'Loans',       href: '/system/hr/loans',        perm: 'hr_loans.view' },
            { icon: '🎁',  label: 'Allowances',  href: '/system/hr/allowances',   perm: 'hr_allowances.view' },
            { icon: '🏆',  label: 'Bonus',       href: '/system/hr/bonus',        perm: 'hr_bonus.view' },
            { icon: '🕐',  label: 'Attendance',  href: '/system/hr/attendance',   perm: 'hr_attendance.view' },
            { icon: '📑',  label: 'Salary Slip', href: '/system/hr/salary-slips', perm: 'hr_salary_slips.view' },
            { icon: '⭐',  label: 'Appraisals',  href: '/system/hr/appraisals',   perm: 'hr_appraisals.view' },
            { icon: '🎯',  label: 'Recruitment', href: '/system/hr/recruitment',  perm: 'hr_recruitment.view' },
        ],
    },

    // ── Procurement & Inventory ───────────────────────────────────────────────
    {
        icon: '🛒', label: 'Procurement', href: '/system/procurement',
        anyPerm: ['procurement_suppliers.view', 'procurement_orders.view'],
        children: [
            { icon: '🏭', label: 'Suppliers',       href: '/system/procurement/suppliers', perm: 'procurement_suppliers.view' },
            { icon: '📋', label: 'Purchase Orders', href: '/system/procurement/orders',    perm: 'procurement_orders.view' },
        ],
    },
    { icon: '🏗️', label: 'Inventory', href: '/system/inventory', perm: 'inventory.view' },

    // ── Reports ───────────────────────────────────────────────────────────────
    {
        icon: '📈', label: 'Reports', href: '/system/reports',
        anyPerm: ['reports_route_profitability.view', 'reports_financial_summary.view', 'reports_fleet_utilization.view', 'billing_invoices.view'],
        children: [
            { icon: '📊', label: 'Route Profitability', href: '/system/reports/route-profitability', perm: 'reports_route_profitability.view' },
            { icon: '💹', label: 'Financial Summary',   href: '/system/reports/financial-summary',   perm: 'reports_financial_summary.view' },
            { icon: '🚛', label: 'Fleet Utilization',   href: '/system/reports/fleet-utilization',   perm: 'reports_fleet_utilization.view' },
            { icon: '🔴', label: 'Debtors / AR',        href: '/system/billing/debtors',             perm: 'billing_invoices.view' },
        ],
    },

    // ── Customer Portal (coming soon) ─────────────────────────────────────────
    {
        icon: '🌐', label: 'Customer Portal', href: '/system/portal',
        children: [
            { icon: '📊', label: 'Dashboard',   href: '/portal/dashboard', soon: true },
            { icon: '🚛', label: 'My Shipments', href: '/portal/trips',    soon: true },
            { icon: '📄', label: 'My Invoices',  href: '/portal/invoices', soon: true },
        ],
    },

    // ── Settings ──────────────────────────────────────────────────────────────
    {
        icon: '⚙️', label: 'Settings', href: '/system/settings', perm: 'settings.view',
        children: [
            { icon: '🏢', label: 'Company Settings',        href: '/system/settings/company',                 perm: 'settings.view' },
            { icon: '🪪', label: 'Licence Classes',         href: '/system/settings/license-classes',         perm: 'settings.view' },
            { icon: '📄', label: 'Document Types',          href: '/system/settings/document-types',          perm: 'settings.view' },
            { icon: '💰', label: 'Payroll Settings',        href: '/system/settings/payroll',                 perm: 'settings.view' },
            { icon: '📋', label: 'Deductions',              href: '/system/settings/deductions',              perm: 'settings.view' },
            { icon: '🔗', label: 'Deduction Subscriptions', href: '/system/settings/deduction-subscriptions', perm: 'settings.view' },
            { icon: '🏛️', label: 'Staff Bank Details',      href: '/system/settings/bank-details',            perm: 'settings.view' },
            { icon: '🏢', label: 'Departments',              href: '/system/settings/departments',            perm: 'settings.view' },
            { icon: '🔑', label: 'Roles & Permissions',     href: '/system/settings/roles',                   perm: 'settings.view' },
            { icon: '👤', label: 'Users',                    href: '/system/settings/users',                  perm: 'settings.view' },
        ],
    },

    { icon: '🔔', label: 'Notifications', href: '/system/notifications' },
];

function visibleNav(items, permissions) {
    return items
        .map(item => {
            if (item.children) {
                const kids = visibleNav(item.children, permissions);
                if (kids.length === 0 && item.perm && !checkPermission(permissions, item.perm)) return null;
                if (kids.length === 0 && item.anyPerm && !item.anyPerm.some(p => checkPermission(permissions, p))) return null;
                return { ...item, children: kids };
            }
            if (item.perm && !checkPermission(permissions, item.perm)) return null;
            if (item.anyPerm && !item.anyPerm.some(p => checkPermission(permissions, p))) return null;
            return item;
        })
        .filter(Boolean);
}

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
    textSec:  'var(--c-text-secondary)',
    textMut:  'var(--c-text-muted)',
};

// Light sidebar tokens
const lk = {
    sidebar:  '#ffffff',
    divider:  '#E8EDF4',
    textPri:  '#1E293B',
    textSec:  '#64748B',
    textMut:  'var(--c-text-secondary)',
};

export default function DashboardLayout({ title = 'Dashboard', children }) {
    const [opened, { toggle }] = useDisclosure();
    const { url, props } = usePage();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const user = props.auth?.user;
    const userPermissions = user?.permissions ?? [];
    const filteredNav = visibleNav(navItems, userPermissions);

    const flash       = props.flash ?? {};
    const alertCount  = props.alert_count ?? 0;
    const [toast, setToast] = useState(null);
    useEffect(() => {
        const msg = flash.success ? { type: 'success', text: flash.success }
                  : flash.error   ? { type: 'error',   text: flash.error }
                  : null;
        if (msg) {
            setToast(msg);
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash.success, flash.error]);

    // Auto-expand any group whose href matches the current URL
    const [expandedGroups, setExpandedGroups] = useState(() =>
        filteredNav
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

                        {/* Notification bell */}
                        <Tooltip label="Alerts & Notifications" position="bottom">
                            <Box component={Link} href="/system/notifications"
                                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: alertCount > 0 ? 'rgba(239,68,68,0.08)' : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'), border: alertCount > 0 ? '1px solid rgba(239,68,68,0.2)' : (isDark ? `1px solid ${dk.divider}` : '1px solid #E2E8F0'), textDecoration: 'none', flexShrink: 0 }}>
                                <Text style={{ fontSize: 15, lineHeight: 1 }}>🔔</Text>
                                {alertCount > 0 && (
                                    <Box style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', borderRadius: '50%', minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid ' + (isDark ? '#07111F' : '#fff') }}>
                                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 800, lineHeight: 1, padding: '0 3px' }}>{alertCount > 99 ? '99+' : alertCount}</Text>
                                    </Box>
                                )}
                            </Box>
                        </Tooltip>

                        {/* Divider */}
                        <Box style={{ width: 1, height: 32, background: isDark ? dk.divider : '#E2E8F0' }} />

                        {/* Avatar */}
                        <Box style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(33,150,243,0.4)' }}>
                            <Text c="white" fw={800} size="sm">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
                        </Box>
                        <Box visibleFrom="sm">
                            <Text fw={600} size="sm" style={{ color: isDark ? dk.textPri : '#1E293B' }} lh={1.2}>{user?.name || 'Admin'}</Text>
                            <Text size="xs" style={{ color: isDark ? dk.textMut : 'var(--c-text-secondary)' }}>{user?.email}</Text>
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
                            {filteredNav.map((item) => {
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
                                                            const childActive = !child.soon && url.startsWith(child.href);
                                                            return (
                                                                <Box
                                                                    key={child.href}
                                                                    component={child.soon ? 'div' : Link}
                                                                    href={child.soon ? undefined : child.href}
                                                                    style={{
                                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                                        padding: '7px 10px 7px 14px', borderRadius: 8,
                                                                        background: childActive ? activeBg : 'transparent',
                                                                        borderLeft: childActive ? '2px solid #2196F3' : '2px solid rgba(33,150,243,0.15)',
                                                                        textDecoration: 'none', transition: 'all 0.15s',
                                                                        opacity: child.soon ? 0.4 : 1,
                                                                        cursor: child.soon ? 'default' : 'pointer',
                                                                    }}
                                                                    onMouseEnter={e => { if (!childActive && !child.soon) e.currentTarget.style.background = hoverBg; }}
                                                                    onMouseLeave={e => { if (!childActive) e.currentTarget.style.background = 'transparent'; }}
                                                                >
                                                                    <Text style={{ fontSize: '0.85rem', lineHeight: 1, width: 16, textAlign: 'center', opacity: 0.8 }}>{child.icon}</Text>
                                                                    <Text fw={childActive ? 700 : 500} size="xs" style={{ color: childActive ? activeText : inactiveText, flex: 1 }}>{child.label}</Text>
                                                                    {child.soon && (
                                                                        <Box style={{ background: soonBg, borderRadius: 4, padding: '1px 5px' }}>
                                                                            <Text style={{ fontSize: 8, color: soonText, fontWeight: 700, letterSpacing: 0.5 }}>SOON</Text>
                                                                        </Box>
                                                                    )}
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
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            {user?.avatar_url ? (
                                <Box component="img" src={user.avatar_url} alt={user.name}
                                    style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                                <Box style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Text c="white" fw={800} size="sm">{(user?.name || 'A').charAt(0).toUpperCase()}</Text>
                                </Box>
                            )}
                            <Box style={{ minWidth: 0 }}>
                                <Text size="xs" style={{ color: isDark ? dk.textMut : lk.textMut }} mb={2}>Logged in as</Text>
                                <Text size="sm" fw={600} style={{ color: isDark ? dk.textSec : lk.textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</Text>
                            </Box>
                        </Box>
                        <Anchor component={Link} href="/account/password" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <Text size="sm">🔑</Text>
                            <Text size="xs" style={{ color: isDark ? dk.textMut : lk.textSec }}>Change Password</Text>
                        </Anchor>
                        <Anchor component={Link} href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Text size="sm">🌐</Text>
                            <Text size="xs" style={{ color: isDark ? dk.textMut : lk.textSec }}>Back to website</Text>
                        </Anchor>
                    </Box>
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main>
                {/* Flash toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.25 }}
                            style={{ position: 'fixed', top: 74, right: 24, zIndex: 9999 }}
                        >
                            <Box style={{
                                padding: '12px 20px',
                                borderRadius: 10,
                                background: toast.type === 'success' ? '#065F46' : '#7F1D1D',
                                border: `1px solid ${toast.type === 'success' ? '#10B981' : '#EF4444'}`,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                                display: 'flex', alignItems: 'center', gap: 10, maxWidth: 380,
                            }}>
                                <Text style={{ fontSize: '1.1rem' }}>{toast.type === 'success' ? '✅' : '❌'}</Text>
                                <Text size="sm" fw={600} c="white">{toast.text}</Text>
                                <Box
                                    component="button"
                                    onClick={() => setToast(null)}
                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16, padding: '0 0 0 8px', lineHeight: 1 }}
                                >×</Box>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Box style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto' }}>
                    {children}
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}

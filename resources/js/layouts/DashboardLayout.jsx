import { useState, useEffect } from 'react';
import { AppShell, Group, Text, Box, Stack, Anchor, Tooltip, ActionIcon, Burger, Menu, Drawer, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMantineColorScheme } from '@mantine/core';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkPermission } from '../lib/can';

// ── Flat item registry (used by drawer) ──────────────────────────────────────
const allNavItems = [
    { icon: '📊', label: 'Dashboard',     href: '/system/dashboard' },
    { icon: '🚛', label: 'Trips',         href: '/system/trips',         perm: 'trips.view' },
    { icon: '🚗', label: 'All Vehicles',  href: '/system/fleet',         perm: 'fleet.view' },
    { icon: '⛽', label: 'Fuel Logs',     href: '/system/fleet/fuel-logs', perm: 'fleet_fuel_logs.view' },
    { icon: '🔧', label: 'Inspections',   href: '/system/inspections',   perm: 'inspections.view' },
    { icon: '📍', label: 'Check-Ins',     href: '/system/check-ins',     perm: 'trip_check_ins.view' },
    { icon: '👤', label: 'Drivers',       href: '/system/drivers',       perm: 'drivers.view' },
    { icon: '👥', label: 'Clients',       href: '/system/clients',       perm: 'clients.view' },
    { icon: '🧑‍💼', label: 'Employees',  href: '/system/hr/employees',  perm: 'hr_employees.view' },
    { icon: '🏖️', label: 'Leave',        href: '/system/hr/leave',      perm: 'hr_leave.view' },
    { icon: '💰', label: 'Payroll',       href: '/system/hr/payroll',    perm: 'hr_payroll.view' },
    { icon: '💵', label: 'Advances',      href: '/system/hr/advances',   perm: 'hr_advances.view' },
    { icon: '🏦', label: 'Loans',         href: '/system/hr/loans',      perm: 'hr_loans.view' },
    { icon: '🎁', label: 'Allowances',    href: '/system/hr/allowances', perm: 'hr_allowances.view' },
    { icon: '🕐', label: 'Attendance',    href: '/system/hr/attendance', perm: 'hr_attendance.view' },
    { icon: '📑', label: 'Salary Slips',  href: '/system/hr/salary-slips', perm: 'hr_salary_slips.view' },
    { icon: '⭐', label: 'Appraisals',    href: '/system/hr/appraisals', perm: 'hr_appraisals.view' },
    { icon: '🎯', label: 'Recruitment',   href: '/system/hr/recruitment', perm: 'hr_recruitment.view' },
    { icon: '🛂', label: 'Permits',       href: '/system/permits',       perm: 'permits.view' },
    { icon: '💬', label: 'Quotes',        href: '/system/billing/quotes', perm: 'billing_quotes.view' },
    { icon: '📋', label: 'Proforma',      href: '/system/billing/proformas', perm: 'billing_proformas.view' },
    { icon: '📄', label: 'Invoices',      href: '/system/billing/invoices', perm: 'billing_invoices.view' },
    { icon: '💳', label: 'Payments',      href: '/system/billing/payments', perm: 'billing_payments.view' },
    { icon: '🔴', label: 'Debtors',       href: '/system/billing/debtors', perm: 'billing_invoices.view' },
    { icon: '📥', label: 'Quote Requests', href: '/system/billing/quote-requests', perm: 'billing_quote_requests.view' },
    { icon: '💸', label: 'Expenses',      href: '/system/expenses',      perm: 'expenses.view' },
    { icon: '🏭', label: 'Suppliers',     href: '/system/procurement/suppliers', perm: 'procurement_suppliers.view' },
    { icon: '📋', label: 'Purchase Orders', href: '/system/procurement/orders', perm: 'procurement_orders.view' },
    { icon: '🔧', label: 'Maintenance',   href: '/system/maintenance',   perm: 'maintenance.view' },
    { icon: '📁', label: 'Documents',     href: '/system/documents',     perm: 'documents.view' },
    { icon: '📦', label: 'Cargo',         href: '/system/cargo',         perm: 'cargo.view' },
    { icon: '🏗️', label: 'Inventory',    href: '/system/inventory',     perm: 'inventory.view' },
    { icon: '📊', label: 'Route Profitability', href: '/system/reports/route-profitability', perm: 'reports_route_profitability.view' },
    { icon: '💹', label: 'Financial Summary',   href: '/system/reports/financial-summary',   perm: 'reports_financial_summary.view' },
    { icon: '🚛', label: 'Fleet Utilization',   href: '/system/reports/fleet-utilization',   perm: 'reports_fleet_utilization.view' },
    { icon: '⚙️', label: 'Settings',      href: '/system/settings',      perm: 'settings.view' },
    { icon: '🔔', label: 'Notifications', href: '/system/notifications' },
];

// ── Grouped nav for top bar ───────────────────────────────────────────────────
const navGroups = [
    {
        label: 'Dashboard', icon: '📊', href: '/system/dashboard',
    },
    {
        label: 'Trips', icon: '🚛', href: '/system/trips', perm: 'trips.view',
    },
    {
        label: 'Fleet', icon: '🚗',
        anyPerm: ['fleet.view', 'fleet_fuel_logs.view', 'inspections.view', 'trip_check_ins.view'],
        sections: [
            {
                title: 'Fleet',
                items: [
                    { icon: '🚗', label: 'All Vehicles',  href: '/system/fleet',                 perm: 'fleet.view' },
                    { icon: '⛽', label: 'Fuel Logs',     href: '/system/fleet/fuel-logs',       perm: 'fleet_fuel_logs.view' },
                    { icon: '🔧', label: 'Inspections',   href: '/system/inspections',           perm: 'inspections.view' },
                    { icon: '📍', label: 'Check-Ins',     href: '/system/check-ins',             perm: 'trip_check_ins.view' },
                    { icon: '🗺️', label: 'Live Map',      href: '/system/fleet/live-map',        soon: true },
                ],
            },
        ],
    },
    {
        label: 'People', icon: '👥',
        anyPerm: ['drivers.view', 'clients.view', 'hr_employees.view', 'hr_leave.view', 'hr_payroll.view'],
        sections: [
            {
                title: 'Staff',
                items: [
                    { icon: '👤', label: 'Drivers',   href: '/system/drivers', perm: 'drivers.view' },
                    { icon: '👥', label: 'Clients',   href: '/system/clients', perm: 'clients.view' },
                ],
            },
            {
                title: 'HR',
                items: [
                    { icon: '🧑‍💼', label: 'Employees',  href: '/system/hr/employees',    perm: 'hr_employees.view' },
                    { icon: '🏖️',  label: 'Leave',       href: '/system/hr/leave',        perm: 'hr_leave.view' },
                    { icon: '💰',  label: 'Payroll',     href: '/system/hr/payroll',      perm: 'hr_payroll.view' },
                    { icon: '💵',  label: 'Advances',    href: '/system/hr/advances',     perm: 'hr_advances.view' },
                    { icon: '🏦',  label: 'Loans',       href: '/system/hr/loans',        perm: 'hr_loans.view' },
                    { icon: '🎁',  label: 'Allowances',  href: '/system/hr/allowances',   perm: 'hr_allowances.view' },
                    { icon: '🕐',  label: 'Attendance',  href: '/system/hr/attendance',   perm: 'hr_attendance.view' },
                    { icon: '📑',  label: 'Salary Slips',href: '/system/hr/salary-slips', perm: 'hr_salary_slips.view' },
                    { icon: '⭐',  label: 'Appraisals',  href: '/system/hr/appraisals',   perm: 'hr_appraisals.view' },
                    { icon: '🎯',  label: 'Recruitment', href: '/system/hr/recruitment',  perm: 'hr_recruitment.view' },
                ],
            },
        ],
    },
    {
        label: 'Finance', icon: '💰',
        anyPerm: ['billing_quotes.view', 'billing_invoices.view', 'billing_payments.view', 'expenses.view', 'procurement_suppliers.view', 'procurement_orders.view'],
        sections: [
            {
                title: 'Billing',
                items: [
                    { icon: '💬', label: 'Quotes',         href: '/system/billing/quotes',         perm: 'billing_quotes.view' },
                    { icon: '📋', label: 'Proforma',       href: '/system/billing/proformas',      perm: 'billing_proformas.view' },
                    { icon: '📄', label: 'Invoices',       href: '/system/billing/invoices',       perm: 'billing_invoices.view' },
                    { icon: '💳', label: 'Payments',       href: '/system/billing/payments',       perm: 'billing_payments.view' },
                    { icon: '🔴', label: 'Debtors',        href: '/system/billing/debtors',        perm: 'billing_invoices.view' },
                    { icon: '📥', label: 'Quote Requests', href: '/system/billing/quote-requests', perm: 'billing_quote_requests.view' },
                ],
            },
            {
                title: 'Expenses & Procurement',
                items: [
                    { icon: '💸', label: 'Expenses',        href: '/system/expenses',               perm: 'expenses.view' },
                    { icon: '🏭', label: 'Suppliers',       href: '/system/procurement/suppliers',  perm: 'procurement_suppliers.view' },
                    { icon: '📋', label: 'Purchase Orders', href: '/system/procurement/orders',     perm: 'procurement_orders.view' },
                ],
            },
        ],
    },
    {
        label: 'Operations', icon: '📦',
        anyPerm: ['permits.view', 'cargo.view', 'documents.view', 'maintenance.view', 'inventory.view'],
        sections: [
            {
                title: 'Compliance & Assets',
                items: [
                    { icon: '🛂', label: 'Permits',     href: '/system/permits',     perm: 'permits.view' },
                    { icon: '📦', label: 'Cargo',       href: '/system/cargo',       perm: 'cargo.view' },
                    { icon: '📁', label: 'Documents',   href: '/system/documents',   perm: 'documents.view' },
                    { icon: '🔧', label: 'Maintenance', href: '/system/maintenance', perm: 'maintenance.view' },
                    { icon: '🏗️', label: 'Inventory',  href: '/system/inventory',   perm: 'inventory.view' },
                ],
            },
        ],
    },
    {
        label: 'Reports', icon: '📈',
        anyPerm: ['reports_route_profitability.view', 'reports_financial_summary.view', 'reports_fleet_utilization.view', 'billing_invoices.view'],
        sections: [
            {
                title: 'Analytics',
                items: [
                    { icon: '📊', label: 'Route Profitability', href: '/system/reports/route-profitability', perm: 'reports_route_profitability.view' },
                    { icon: '💹', label: 'Financial Summary',   href: '/system/reports/financial-summary',   perm: 'reports_financial_summary.view' },
                    { icon: '🚛', label: 'Fleet Utilization',   href: '/system/reports/fleet-utilization',   perm: 'reports_fleet_utilization.view' },
                    { icon: '🔴', label: 'Debtors / AR',        href: '/system/billing/debtors',             perm: 'billing_invoices.view' },
                ],
            },
            {
                title: 'Portal',
                items: [
                    { icon: '📊', label: 'Client Dashboard', href: '/portal/dashboard', soon: true },
                    { icon: '🚛', label: 'My Shipments',     href: '/portal/trips',     soon: true },
                    { icon: '📄', label: 'My Invoices',      href: '/portal/invoices',  soon: true },
                ],
            },
        ],
    },
    {
        label: 'Settings', icon: '⚙️',
        sections: [
            {
                title: 'System',
                items: [
                    { icon: '🏢', label: 'Company',              href: '/system/settings/company',                 perm: 'settings.view' },
                    { icon: '🔑', label: 'Roles & Permissions',  href: '/system/settings/roles',                   perm: 'settings.view' },
                    { icon: '👤', label: 'Users',                href: '/system/settings/users',                   perm: 'settings.view' },
                    { icon: '🏢', label: 'Departments',          href: '/system/settings/departments',             perm: 'settings.view' },
                ],
            },
            {
                title: 'Documents & Payroll',
                items: [
                    { icon: '🪪', label: 'Licence Classes',         href: '/system/settings/license-classes',         perm: 'settings.view' },
                    { icon: '📄', label: 'Document Types',          href: '/system/settings/document-types',          perm: 'settings.view' },
                    { icon: '💰', label: 'Payroll Settings',        href: '/system/settings/payroll',                 perm: 'settings.view' },
                    { icon: '📋', label: 'Deductions',              href: '/system/settings/deductions',              perm: 'settings.view' },
                    { icon: '🔗', label: 'Deduction Subscriptions', href: '/system/settings/deduction-subscriptions', perm: 'settings.view' },
                    { icon: '🏛️', label: 'Staff Bank Details',      href: '/system/settings/bank-details',            perm: 'settings.view' },
                ],
            },
            {
                title: 'Other',
                items: [
                    { icon: '🔔', label: 'Notifications', href: '/system/notifications' },
                    { icon: '🔑', label: 'Change Password', href: '/account/password' },
                    { icon: '🌐', label: 'Back to Website', href: '/' },
                ],
            },
        ],
    },
];

function checkGroupVisible(group, permissions) {
    if (!group.sections) return true;
    if (group.perm && !checkPermission(permissions, group.perm)) return false;
    if (group.anyPerm && !group.anyPerm.some(p => checkPermission(permissions, p))) return false;
    return true;
}

function filterSectionItems(items, permissions) {
    return items.filter(item => {
        if (!item.perm) return true;
        return checkPermission(permissions, item.perm);
    });
}

function visibleFlatNav(items, permissions) {
    return items.filter(item => {
        if (!item.perm) return true;
        return checkPermission(permissions, item.perm);
    });
}

const dk = {
    topbar:  '#0F0500',
    navbar:  '#1A0800',
    main:    '#0A0400',
    divider: 'rgba(255,255,255,0.07)',
    border:  'rgba(234,88,12,0.15)',
    textPri: '#E2E8F0',
    dropBg:  '#1E0A00',
};

const lk = {
    topbar:  '#ffffff',
    navbar:  '#ffffff',
    main:    '#F0F4F9',
    divider: '#E2E8F0',
    border:  '#E2E8F0',
    textPri: '#1E293B',
    dropBg:  '#ffffff',
};

export default function DashboardLayout({ title = 'Dashboard', children }) {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const { url, props } = usePage();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const user = props.auth?.user;
    const userPermissions = user?.permissions ?? [];

    const flash      = props.flash ?? {};
    const alertCount = props.alert_count ?? 0;
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

    const logout = () => router.post('/logout');

    const activeText   = isDark ? '#FB923C' : '#C2410C';
    const inactiveText = isDark ? '#94A3B8'  : '#4B5563';
    const activeBg     = isDark ? 'rgba(234,88,12,0.18)' : 'rgba(194,65,12,0.08)';
    const hoverBg      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    const soonColor    = isDark ? '#475569' : '#9CA3AF';

    const dropdownStyles = {
        dropdown: {
            background: isDark ? dk.dropBg : lk.dropBg,
            border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`,
            padding: '8px',
            minWidth: 220,
            boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.12)',
        },
        item: { borderRadius: 8, fontSize: 13 },
        label: { fontSize: 10, letterSpacing: 1, fontWeight: 700, color: isDark ? '#EA580C' : '#C2410C', textTransform: 'uppercase', padding: '4px 8px 2px' },
    };

    // ── Desktop grouped nav item ──────────────────────────────────────────────
    function NavGroup({ group }) {
        const isSimple    = !group.sections;
        const isActive    = isSimple && url.startsWith(group.href);
        const groupActive = !isSimple && group.sections?.some(s => s.items?.some(i => !i.soon && url.startsWith(i.href)));

        const triggerStyle = {
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 12px', height: '100%', cursor: 'pointer',
            borderBottom: (isActive || groupActive) ? '2px solid #EA580C' : '2px solid transparent',
            background: (isActive || groupActive) ? activeBg : 'transparent',
            whiteSpace: 'nowrap', userSelect: 'none',
            transition: 'all 0.15s',
        };

        if (isSimple) {
            return (
                <Box component={Link} href={group.href} style={{ ...triggerStyle, textDecoration: 'none', height: '100%', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hoverBg; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <Text style={{ fontSize: '0.9rem', lineHeight: 1 }}>{group.icon}</Text>
                    <Text size="xs" fw={(isActive || groupActive) ? 700 : 500} style={{ color: (isActive || groupActive) ? activeText : inactiveText }}>
                        {group.label}
                    </Text>
                </Box>
            );
        }

        return (
            <Menu trigger="hover" openDelay={50} closeDelay={100} shadow="xl" radius="lg" position="bottom-start" styles={dropdownStyles}>
                <Menu.Target>
                    <Box style={triggerStyle}
                        onMouseEnter={e => { if (!groupActive) e.currentTarget.style.background = hoverBg; }}
                        onMouseLeave={e => { if (!groupActive) e.currentTarget.style.background = 'transparent'; }}>
                        <Text style={{ fontSize: '0.9rem', lineHeight: 1 }}>{group.icon}</Text>
                        <Text size="xs" fw={groupActive ? 700 : 500} style={{ color: groupActive ? activeText : inactiveText }}>
                            {group.label}
                        </Text>
                        <Text style={{ fontSize: 7, color: inactiveText, marginLeft: 1, opacity: 0.7 }}>▾</Text>
                    </Box>
                </Menu.Target>
                <Menu.Dropdown>
                    {group.sections.map((section, si) => {
                        const visibleItems = filterSectionItems(section.items, userPermissions);
                        if (visibleItems.length === 0) return null;
                        return (
                            <Box key={section.title}>
                                {si > 0 && <Menu.Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#F1F5F9', margin: '4px 0' }} />}
                                <Menu.Label>{section.title}</Menu.Label>
                                {visibleItems.map(item => {
                                    const childActive = !item.soon && url.startsWith(item.href);
                                    return (
                                        <Menu.Item key={item.href}
                                            component={item.soon ? 'div' : Link}
                                            href={item.soon ? undefined : item.href}
                                            leftSection={<Text style={{ fontSize: '0.85rem' }}>{item.icon}</Text>}
                                            rightSection={item.soon ? <Text style={{ fontSize: 9, color: soonColor, fontWeight: 700 }}>SOON</Text> : null}
                                            style={{
                                                color: childActive ? activeText : (isDark ? '#CBD5E1' : '#374151'),
                                                background: childActive ? activeBg : 'transparent',
                                                fontWeight: childActive ? 700 : 400,
                                                opacity: item.soon ? 0.5 : 1,
                                                cursor: item.soon ? 'default' : 'pointer',
                                            }}
                                        >
                                            {item.label}
                                        </Menu.Item>
                                    );
                                })}
                            </Box>
                        );
                    })}
                </Menu.Dropdown>
            </Menu>
        );
    }

    // ── Mobile drawer ─────────────────────────────────────────────────────────
    function DrawerSection({ group }) {
        const isSimple   = !group.sections;
        const isActive   = isSimple && url.startsWith(group.href);
        const [open, setOpen] = useState(
            !isSimple && group.sections?.some(s => s.items?.some(i => url.startsWith(i.href)))
        );

        if (isSimple) {
            return (
                <Box component={Link} href={group.href} onClick={closeDrawer}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 8, borderLeft: isActive ? '3px solid #EA580C' : '3px solid transparent',
                        background: isActive ? activeBg : 'transparent', textDecoration: 'none', marginBottom: 2,
                    }}>
                    <Text style={{ fontSize: '1rem', lineHeight: 1 }}>{group.icon}</Text>
                    <Text fw={isActive ? 700 : 500} size="sm" style={{ color: isActive ? activeText : (isDark ? '#CBD5E1' : '#374151') }}>{group.label}</Text>
                </Box>
            );
        }

        const groupActive = group.sections?.some(s => s.items?.some(i => url.startsWith(i.href)));
        return (
            <Box mb={2}>
                <Box onClick={() => setOpen(o => !o)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 8, borderLeft: groupActive ? '3px solid #EA580C' : '3px solid transparent',
                        background: groupActive ? activeBg : 'transparent', cursor: 'pointer', marginBottom: 2,
                    }}>
                    <Text style={{ fontSize: '1rem', lineHeight: 1 }}>{group.icon}</Text>
                    <Text fw={groupActive ? 700 : 500} size="sm" style={{ color: groupActive ? activeText : (isDark ? '#CBD5E1' : '#374151'), flex: 1 }}>{group.label}</Text>
                    <Text style={{ fontSize: 10, color: inactiveText, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none' }}>▶</Text>
                </Box>
                {open && (
                    <Stack gap={0} style={{ paddingLeft: 12, marginBottom: 4 }}>
                        {group.sections.map((section, si) => {
                            const visibleItems = filterSectionItems(section.items, userPermissions);
                            if (visibleItems.length === 0) return null;
                            return (
                                <Box key={section.title}>
                                    <Text size="10px" fw={700} style={{ color: '#EA580C', letterSpacing: 1, textTransform: 'uppercase', padding: '6px 10px 2px' }}>{section.title}</Text>
                                    {visibleItems.map(item => {
                                        const childActive = !item.soon && url.startsWith(item.href);
                                        return (
                                            <Box key={item.href}
                                                component={item.soon ? 'div' : Link}
                                                href={item.soon ? undefined : item.href}
                                                onClick={item.soon ? undefined : closeDrawer}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 8,
                                                    padding: '8px 10px', borderRadius: 7,
                                                    background: childActive ? activeBg : 'transparent',
                                                    borderLeft: childActive ? '2px solid #EA580C' : '2px solid rgba(234,88,12,0.12)',
                                                    textDecoration: 'none', opacity: item.soon ? 0.5 : 1,
                                                    cursor: item.soon ? 'default' : 'pointer', marginBottom: 1,
                                                }}>
                                                <Text style={{ fontSize: '0.85rem', lineHeight: 1, width: 16, textAlign: 'center' }}>{item.icon}</Text>
                                                <Text fw={childActive ? 700 : 400} size="xs"
                                                    style={{ color: childActive ? activeText : (isDark ? '#94A3B8' : '#6B7280'), flex: 1 }}>
                                                    {item.label}
                                                </Text>
                                                {item.soon && <Text style={{ fontSize: 8, color: soonColor, fontWeight: 700 }}>SOON</Text>}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        );
    }

    return (
        <>
            {/* ── Mobile drawer ── */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} size={300} padding="md"
                title={
                    <Link href="/" style={{ textDecoration: 'none' }} onClick={closeDrawer}>
                        <Group gap={8} align="center">
                            <img src="/logo.jpeg" alt="Trans-Mas" style={{ height: 36, width: 'auto', objectFit: 'contain', borderRadius: 6 }} />
                            <Stack gap={0}>
                                <Text fw={900} size="xs" style={{ color: isDark ? '#ffffff' : '#1E293B', letterSpacing: 0.5, lineHeight: 1.1 }}>TRANS-MAS</Text>
                                <Text size="10px" fw={600} style={{ color: '#EA580C', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.2 }}>Logistics Co. Ltd</Text>
                            </Stack>
                        </Group>
                    </Link>
                }
                styles={{
                    content: { background: isDark ? dk.dropBg : '#ffffff' },
                    header:  { background: isDark ? dk.topbar  : '#ffffff', borderBottom: `1px solid ${isDark ? dk.divider : lk.divider}` },
                    title:   { flex: 1 },
                }}>
                <Stack gap={0} style={{ overflowY: 'auto', flex: 1 }}>
                    {navGroups.filter(g => checkGroupVisible(g, userPermissions)).map(g => (
                        <DrawerSection key={g.label} group={g} />
                    ))}
                </Stack>
            </Drawer>

            <AppShell header={{ height: 106 }} padding={0}
                styles={{ main: { background: isDark ? dk.main : lk.main, minHeight: '100vh' } }}>
                <AppShell.Header style={{ padding: 0 }}>

                    {/* ── Row 1: Logo + breadcrumb + user tools ── */}
                    <Box style={{
                        height: 58,
                        background: isDark
                            ? 'linear-gradient(90deg, #0F0500, #1A0800)'
                            : '#ffffff',
                        borderBottom: `1px solid ${isDark ? 'rgba(234,88,12,0.12)' : '#F1F5F9'}`,
                        display: 'flex', alignItems: 'center', padding: '0 20px',
                        boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.06)',
                    }}>
                        <Group justify="space-between" style={{ width: '100%' }}>
                            <Group gap={10}>
                                <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="md" size="sm"
                                    color={isDark ? '#94A3B8' : '#64748B'} />
                                <Link href="/system/dashboard" style={{ textDecoration: 'none' }}>
                                    <Group gap={8} align="center">
                                        <img src="/logo.jpeg" alt="Trans-Mas" style={{ height: 38, width: 'auto', objectFit: 'contain', borderRadius: 7 }} />
                                        <Stack gap={0} visibleFrom="sm">
                                            <Text fw={900} size="xs" style={{ color: isDark ? '#ffffff' : '#1E293B', letterSpacing: 0.5, lineHeight: 1.1 }}>TRANS-MAS</Text>
                                            <Text size="10px" fw={700} style={{ color: '#EA580C', letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 1.2 }}>Logistics Co. Ltd</Text>
                                        </Stack>
                                    </Group>
                                </Link>
                                <Box visibleFrom="md" style={{ width: 1, height: 22, background: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', margin: '0 2px' }} />
                                <Box visibleFrom="md" style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: isDark ? '1px solid rgba(234,88,12,0.2)' : '1px solid rgba(234,88,12,0.15)', borderRadius: 8, padding: '4px 10px' }}>
                                    <Text size="xs" fw={700} style={{ color: isDark ? '#FB923C' : '#C2410C', letterSpacing: 0.3 }}>{title}</Text>
                                </Box>
                            </Group>

                            <Group gap={8}>
                                {/* Theme toggle */}
                                <Tooltip label={isDark ? 'Light mode' : 'Dark mode'} position="bottom">
                                    <ActionIcon variant="subtle" radius="xl" size={34}
                                        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
                                        style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, color: isDark ? '#94A3B8' : '#64748B' }}>
                                        <AnimatePresence mode="wait">
                                            <motion.span key={isDark ? 'sun' : 'moon'}
                                                initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
                                                animate={{ rotate: 0,   opacity: 1, scale: 1 }}
                                                exit={{ rotate: 30,    opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.2 }} style={{ fontSize: 14 }}>
                                                {isDark ? '☀️' : '🌙'}
                                            </motion.span>
                                        </AnimatePresence>
                                    </ActionIcon>
                                </Tooltip>

                                {/* Notifications */}
                                <Tooltip label="Alerts & Notifications" position="bottom">
                                    <Box component={Link} href="/system/notifications" style={{
                                        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: 34, height: 34, borderRadius: '50%', textDecoration: 'none', flexShrink: 0,
                                        background: alertCount > 0 ? 'rgba(239,68,68,0.08)' : (isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC'),
                                        border: alertCount > 0 ? '1px solid rgba(239,68,68,0.3)' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                    }}>
                                        <Text style={{ fontSize: 15, lineHeight: 1 }}>🔔</Text>
                                        {alertCount > 0 && (
                                            <Box style={{
                                                position: 'absolute', top: -4, right: -4,
                                                background: '#EF4444', borderRadius: '50%', minWidth: 17, height: 17,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: `2px solid ${isDark ? '#0F0500' : '#fff'}`,
                                            }}>
                                                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 800, lineHeight: 1, padding: '0 2px' }}>
                                                    {alertCount > 99 ? '99+' : alertCount}
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                </Tooltip>

                                <Box style={{ width: 1, height: 26, background: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }} />

                                {/* User menu */}
                                <Menu shadow="xl" radius="lg" position="bottom-end" styles={{
                                    dropdown: { background: isDark ? dk.dropBg : '#ffffff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, minWidth: 200, padding: 8, boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.12)' },
                                    item: { borderRadius: 8 },
                                }}>
                                    <Menu.Target>
                                        <Group gap={8} style={{ cursor: 'pointer' }}>
                                            <Box style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(234,88,12,0.35)', flexShrink: 0 }}>
                                                <Text c="white" fw={800} size="xs">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
                                            </Box>
                                            <Box visibleFrom="sm">
                                                <Text fw={700} size="xs" style={{ color: isDark ? '#E2E8F0' : '#1E293B' }} lh={1.2}>{user?.name || 'Admin'}</Text>
                                                <Text size="10px" style={{ color: isDark ? '#475569' : '#94A3B8' }}>{user?.email}</Text>
                                            </Box>
                                            <Text visibleFrom="sm" style={{ fontSize: 9, color: inactiveText, opacity: 0.7 }}>▾</Text>
                                        </Group>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Box style={{ padding: '8px 12px 10px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#F1F5F9'}`, marginBottom: 6 }}>
                                            <Text fw={700} size="sm" style={{ color: isDark ? '#E2E8F0' : '#1E293B' }}>{user?.name}</Text>
                                            <Text size="xs" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{user?.email}</Text>
                                        </Box>
                                        <Menu.Item leftSection={<Text style={{ fontSize: '0.85rem' }}>🔑</Text>}
                                            component={Link} href="/account/password"
                                            style={{ color: isDark ? '#CBD5E1' : '#374151' }}>
                                            Change Password
                                        </Menu.Item>
                                        <Menu.Item leftSection={<Text style={{ fontSize: '0.85rem' }}>🌐</Text>}
                                            component={Link} href="/"
                                            style={{ color: isDark ? '#CBD5E1' : '#374151' }}>
                                            Back to Website
                                        </Menu.Item>
                                        <Menu.Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#F1F5F9' }} />
                                        <Menu.Item leftSection={<Text style={{ fontSize: '0.85rem' }}>↩</Text>}
                                            onClick={logout}
                                            style={{ color: '#EF4444', fontWeight: 600 }}>
                                            Sign Out
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Group>
                        </Group>
                    </Box>

                    {/* ── Row 2: Grouped navigation ── */}
                    <Box visibleFrom="md" style={{
                        height: 48,
                        background: isDark
                            ? 'linear-gradient(90deg, #120600, #1E0A00)'
                            : '#FAFAFA',
                        borderBottom: `1px solid ${isDark ? 'rgba(234,88,12,0.1)' : '#E8E8E8'}`,
                    }}>
                        <Group h="100%" px="lg" gap={0} justify="center" style={{ flexWrap: 'nowrap' }}>
                            {navGroups.filter(g => checkGroupVisible(g, userPermissions)).map((group, i) => (
                                <NavGroup key={group.label} group={group} />
                            ))}
                        </Group>
                    </Box>
                </AppShell.Header>

                <AppShell.Main>
                    {/* Flash toast */}
                    <AnimatePresence>
                        {toast && (
                            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}
                                style={{ position: 'fixed', top: 118, right: 24, zIndex: 9999 }}>
                                <Box style={{
                                    padding: '12px 20px', borderRadius: 12,
                                    background: toast.type === 'success' ? '#065F46' : '#7F1D1D',
                                    border: `1px solid ${toast.type === 'success' ? '#10B981' : '#EF4444'}`,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                                    display: 'flex', alignItems: 'center', gap: 10, maxWidth: 380,
                                }}>
                                    <Text style={{ fontSize: '1.1rem' }}>{toast.type === 'success' ? '✅' : '❌'}</Text>
                                    <Text size="sm" fw={600} c="white">{toast.text}</Text>
                                    <Box component="button" onClick={() => setToast(null)}
                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16, padding: '0 0 0 8px', lineHeight: 1 }}>×</Box>
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Box style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto' }}>
                        {children}
                    </Box>
                </AppShell.Main>
            </AppShell>
        </>
    );
}

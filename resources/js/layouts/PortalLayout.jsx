import { Box, Group, Text, Anchor, Stack } from '@mantine/core';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { label: 'Dashboard',      href: '/portal/dashboard',      icon: '📊' },
    { label: 'My Trips',       href: '/portal/trips',          icon: '🚛' },
    { label: 'Cargo Tracking', href: '/portal/cargo',          icon: '📦' },
    { label: 'Invoices',       href: '/portal/invoices',       icon: '📄' },
    { label: 'Quote Requests', href: '/portal/quote-requests', icon: '💬' },
];

export default function PortalLayout({ title = 'Customer Portal', children }) {
    const { url, props } = usePage();
    const flash = props.flash ?? {};
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

    const logout = () => router.post('/portal/logout');

    return (
        <Box style={{ minHeight: '100vh', background: '#0B1627' }}>
            {/* Header */}
            <Box style={{
                background: '#07111F',
                borderBottom: '1px solid rgba(33,150,243,0.15)',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <Group h={62} px="xl" justify="space-between" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Group gap="xl">
                        <Link href="/portal/dashboard" style={{ textDecoration: 'none' }}>
                            <img src="/logo-full.png" alt="SH Malik" style={{ height: 36, objectFit: 'contain' }} />
                        </Link>
                        <Group gap="xs" visibleFrom="sm">
                            {navLinks.map(link => {
                                const active = url.startsWith(link.href);
                                return (
                                    <Box
                                        key={link.href}
                                        component={Link}
                                        href={link.href}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '6px 14px', borderRadius: 8,
                                            textDecoration: 'none',
                                            background: active ? 'rgba(33,150,243,0.15)' : 'transparent',
                                            borderBottom: active ? '2px solid #2196F3' : '2px solid transparent',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <Text style={{ fontSize: '0.9rem' }}>{link.icon}</Text>
                                        <Text size="sm" fw={active ? 700 : 500} style={{ color: active ? '#60A5FA' : '#94A3B8' }}>{link.label}</Text>
                                    </Box>
                                );
                            })}
                        </Group>
                    </Group>
                    <Group gap="sm">
                        <Box style={{ padding: '2px 10px', borderRadius: 6, background: 'rgba(33,150,243,0.1)', border: '1px solid rgba(33,150,243,0.2)' }}>
                            <Text size="xs" style={{ color: '#60A5FA' }}>Client Portal</Text>
                        </Box>
                        <Box
                            component="button"
                            onClick={logout}
                            style={{
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                                color: '#EF4444', fontSize: 13, fontWeight: 600,
                            }}
                        >
                            Sign Out
                        </Box>
                    </Group>
                </Group>
            </Box>

            {/* Mobile nav */}
            <Group px="lg" py="xs" gap="xs" hiddenFrom="sm" style={{ background: '#07111F', borderBottom: '1px solid rgba(33,150,243,0.1)' }}>
                {navLinks.map(link => {
                    const active = url.startsWith(link.href);
                    return (
                        <Box key={link.href} component={Link} href={link.href} style={{ padding: '6px 12px', borderRadius: 8, background: active ? 'rgba(33,150,243,0.15)' : 'transparent', textDecoration: 'none', borderBottom: active ? '2px solid #2196F3' : '2px solid transparent' }}>
                            <Text size="sm" fw={active ? 700 : 500} style={{ color: active ? '#60A5FA' : '#94A3B8' }}>{link.icon} {link.label}</Text>
                        </Box>
                    );
                })}
            </Group>

            {/* Flash toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} style={{ position: 'fixed', top: 74, right: 24, zIndex: 9999 }}>
                        <Box style={{ padding: '12px 20px', borderRadius: 10, background: toast.type === 'success' ? '#065F46' : '#7F1D1D', border: `1px solid ${toast.type === 'success' ? '#10B981' : '#EF4444'}`, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 380 }}>
                            <Text style={{ fontSize: '1.1rem' }}>{toast.type === 'success' ? '✅' : '❌'}</Text>
                            <Text size="sm" fw={600} c="white">{toast.text}</Text>
                            <Box component="button" onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16, padding: '0 0 0 8px' }}>×</Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <Box style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                {title && (
                    <Text fw={700} size="xl" style={{ color: '#E2E8F0', marginBottom: 24 }}>{title}</Text>
                )}
                {children}
            </Box>
        </Box>
    );
}

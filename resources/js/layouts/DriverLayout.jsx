import { Box, Group, Text, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { label: 'Dashboard',  href: '/driver/dashboard',   icon: '🏠' },
    { label: 'My Trips',   href: '/driver/trips',       icon: '🚛' },
    { label: 'Inspection', href: '/driver/inspections', icon: '🔧' },
    { label: 'Check-Ins',  href: '/driver/check-ins',   icon: '📍' },
];

const severityStyle = {
    info:     { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.4)',  text: '#60A5FA', icon: 'ℹ️' },
    warning:  { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.45)', text: '#F59E0B', icon: '⚠️' },
    critical: { bg: 'rgba(239,68,68,0.14)',   border: 'rgba(239,68,68,0.5)',   text: '#F87171', icon: '🚨' },
};

// Short notification chime synthesised via Web Audio so we don't ship an asset.
function playChime() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const beep = (freq, start, dur) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = freq;
            o.connect(g); g.connect(ctx.destination);
            g.gain.setValueAtTime(0.001, ctx.currentTime + start);
            g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + start + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            o.start(ctx.currentTime + start);
            o.stop(ctx.currentTime + start + dur);
        };
        beep(880, 0, 0.2);
        beep(1175, 0.18, 0.25);
    } catch { /* audio not available — ignore */ }
}

export default function DriverLayout({ title, children }) {
    const { url, props } = usePage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const flash = props.flash ?? {};
    const auth = props.auth ?? {};
    const user = auth.user;
    const driverAlerts = props.driverAlerts ?? { items: [], count: 0 };
    const [toast, setToast] = useState(null);
    const [dismissed, setDismissed] = useState(() => new Set());
    const previousIds = useRef(null); // null = first render

    // Audio cue when new alerts appear (after first load)
    useEffect(() => {
        const currentIds = new Set(driverAlerts.items.map(a => a.id));
        if (previousIds.current === null) {
            previousIds.current = currentIds;
            return;
        }
        const newOnes = [...currentIds].filter(id => !previousIds.current.has(id));
        if (newOnes.length > 0) playChime();
        previousIds.current = currentIds;
    }, [driverAlerts]);

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

    // Refresh driverAlerts every 60s so check-in due times stay live without
    // requiring the driver to navigate.
    useEffect(() => {
        const id = setInterval(() => {
            router.reload({ only: ['driverAlerts'], preserveScroll: true, preserveState: true });
        }, 60000);
        return () => clearInterval(id);
    }, []);

    const logout = () => router.post('/logout');

    const visibleAlerts = driverAlerts.items.filter(a => !dismissed.has(a.id));

    return (
        <Box style={{ minHeight: '100vh', background: isDark ? '#2C1200' : '#F5F0EB' }}>
            {title && <Head title={title} />}

            {/* Header */}
            <Box style={{ background: isDark ? '#220D00' : '#ffffff', borderBottom: isDark ? '1px solid rgba(234,88,12,0.15)' : '1px solid #E8DDD4', position: 'sticky', top: 0, zIndex: 100 }}>
                <Group h={62} px="md" justify="space-between" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Group gap="md">
                        <Link href="/driver/dashboard" style={{ textDecoration: 'none' }}>
                            <Group gap={8} align="center">
                                <img src="/logo.jpeg" alt="Trans-Mas" style={{ height: 34, width: 'auto', objectFit: 'contain', borderRadius: 6 }} />
                                <Stack gap={0}>
                                    <Text fw={900} size="xs" style={{ color: isDark ? '#ffffff' : '#1E293B', letterSpacing: 0.5, lineHeight: 1.1 }}>TRANS-MAS</Text>
                                    <Text size="10px" fw={600} style={{ color: '#EA580C', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.2 }}>Logistics Co. Ltd</Text>
                                </Stack>
                            </Group>
                        </Link>
                        <Box style={{ padding: '2px 10px', borderRadius: 6, background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.2)' }}>
                            <Text size="xs" fw={700} style={{ color: '#FB923C', letterSpacing: 0.5 }}>DRIVER</Text>
                        </Box>
                        {driverAlerts.count > 0 && (
                            <Box style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: '2px 10px' }}>
                                <Text size="xs" fw={700} style={{ color: '#F87171' }}>🔔 {driverAlerts.count}</Text>
                            </Box>
                        )}
                    </Group>
                    <Group gap="sm">
                        {user?.avatar_url ? (
                            <Box component="img" src={user.avatar_url} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top' }} />
                        ) : (
                            <Box style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C2410C, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Text c="white" fw={800} size="xs">{(user?.name || 'D').charAt(0).toUpperCase()}</Text>
                            </Box>
                        )}
                        <Box visibleFrom="sm">
                            <Text size="xs" fw={700} style={{ color: isDark ? '#ffffff' : '#1E293B' }}>{user?.name}</Text>
                            <Text size="10px" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{user?.email}</Text>
                        </Box>
                        <Box component="button" onClick={logout}
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                            Logout
                        </Box>
                    </Group>
                </Group>
            </Box>

            <Box style={{ background: isDark ? '#3A1700' : '#FDF0E8', borderBottom: isDark ? '1px solid rgba(234,88,12,0.1)' : '1px solid #E8DDD4' }}>
                <Group px="md" gap={4} style={{ maxWidth: 1200, margin: '0 auto', overflowX: 'auto' }}>
                    {navLinks.map(link => {
                        const active = url.startsWith(link.href);
                        return (
                            <Box
                                key={link.href}
                                component={Link}
                                href={link.href}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '12px 16px',
                                    textDecoration: 'none', whiteSpace: 'nowrap',
                                    borderBottom: active ? '2px solid #EA580C' : '2px solid transparent',
                                    background: active ? 'rgba(234,88,12,0.08)' : 'transparent',
                                }}
                            >
                                <Text style={{ fontSize: '1rem' }}>{link.icon}</Text>
                                <Text size="sm" fw={active ? 700 : 500} style={{ color: active ? '#FB923C' : '#94A3B8' }}>{link.label}</Text>
                            </Box>
                        );
                    })}
                </Group>
            </Box>

            {/* Driver alert banner stack */}
            <AnimatePresence>
                {visibleAlerts.length > 0 && (
                    <Box style={{ maxWidth: 1200, margin: '12px auto 0', padding: '0 16px' }}>
                        <Stack gap={8}>
                            {visibleAlerts.map(alert => {
                                const s = severityStyle[alert.severity] ?? severityStyle.info;
                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: 30 }}
                                    >
                                        <Box style={{
                                            background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12,
                                            padding: '12px 16px',
                                            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                                        }}>
                                            <Text style={{ fontSize: '1.3rem' }}>{s.icon}</Text>
                                            <Box style={{ flex: 1, minWidth: 200 }}>
                                                <Text size="sm" fw={700} style={{ color: s.text }}>{alert.title}</Text>
                                                <Text size="xs" style={{ color: '#CBD5E1', marginTop: 2 }}>{alert.message}</Text>
                                            </Box>
                                            {alert.href && (
                                                <Box component={Link} href={alert.href}
                                                    style={{ background: s.text + '22', border: `1px solid ${s.text}55`, color: s.text, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>
                                                    {alert.cta ?? 'View'}
                                                </Box>
                                            )}
                                            <Box component="button" type="button" onClick={() => setDismissed(d => new Set(d).add(alert.id))}
                                                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                                                ×
                                            </Box>
                                        </Box>
                                    </motion.div>
                                );
                            })}
                        </Stack>
                    </Box>
                )}
            </AnimatePresence>

            {/* Flash toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} style={{ position: 'fixed', top: 78, right: 16, zIndex: 9999 }}>
                        <Box style={{ padding: '12px 20px', borderRadius: 10, background: toast.type === 'success' ? '#065F46' : '#7F1D1D', border: `1px solid ${toast.type === 'success' ? '#10B981' : '#EF4444'}`, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 380 }}>
                            <Text style={{ fontSize: '1.1rem' }}>{toast.type === 'success' ? '✅' : '❌'}</Text>
                            <Text size="sm" fw={600} c="white">{toast.text}</Text>
                            <Box component="button" onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16 }}>×</Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            <Box style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
                {children}
            </Box>
        </Box>
    );
}

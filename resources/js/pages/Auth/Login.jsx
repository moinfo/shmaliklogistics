import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Title, Text, TextInput, PasswordInput, Button, Checkbox, Group, Stack, Anchor } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

const features = [
    { icon: '🚛', label: 'Trip Planning', desc: 'Schedule & track cargo trips across East Africa' },
    { icon: '📊', label: 'Fleet Analytics', desc: 'Real-time profitability & route performance' },
    { icon: '🛂', label: 'Permits & Customs', desc: 'Manage border crossings and documentation' },
    { icon: '👥', label: 'Driver Management', desc: 'Assign, monitor and pay your driver fleet' },
];

export default function Login() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login — Trans-Mas Logistics" />

            <Box style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', background: isDark ? 'linear-gradient(160deg, #0A0400 0%, #150600 60%, #1E0800 100%)' : '#F8FAFC' }}>

                {/* ── Left brand panel ── */}
                <Box
                    visibleFrom="md"
                    style={{
                        width: '48%',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '48px 56px',
                    }}
                >
                    {/* Background photo */}
                    <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    {/* Overlay — dark or light */}
                    {isDark
                        ? <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(7,2,0,0.93) 0%, rgba(30,8,0,0.88) 50%, rgba(120,40,0,0.82) 100%)' }} />
                        : <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(194,65,12,0.92) 0%, rgba(234,88,12,0.87) 50%, rgba(249,115,22,0.82) 100%)' }} />
                    }
                    {/* Dot grid */}
                    <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
                    {/* Glow bottom-right */}
                    <Box style={{ position: 'absolute', bottom: -60, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    {/* Logo */}
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} style={{ position: 'relative', zIndex: 1 }}>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <Group gap={12} align="center">
                                <img src="/logo.jpeg" alt="Trans-Mas Logistics" style={{ height: 64, width: 'auto', objectFit: 'contain', borderRadius: 10 }} />
                                <Stack gap={0}>
                                    <Text fw={900} size="md" style={{ color: '#ffffff', letterSpacing: 0.5, lineHeight: 1.1 }}>TRANS-MAS</Text>
                                    <Text size="xs" fw={500} style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5, textTransform: 'uppercase', lineHeight: 1.2 }}>Logistics Co. Ltd</Text>
                                </Stack>
                            </Group>
                        </Link>
                    </motion.div>

                    {/* Main copy */}
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap="xl">
                            <Stack gap="md">
                                <Box style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '4px 14px', width: 'fit-content' }}>
                                    <Text size="xs" fw={700} style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Management Portal</Text>
                                </Box>
                                <Title order={1} c="white" style={{ fontSize: 'clamp(1.9rem, 2.8vw, 2.6rem)', fontWeight: 900, lineHeight: 1.15 }}>
                                    East Africa's{' '}
                                    <Text component="span" style={{ color: 'rgba(255,255,255,0.85)', borderBottom: '3px solid rgba(255,255,255,0.5)' }} inherit>
                                        Logistics
                                    </Text>
                                    {' '}Command Centre
                                </Title>
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }} size="md" lh={1.8} maw={400}>
                                    One platform to manage your entire fleet, routes, permits and cargo across Tanzania and beyond.
                                </Text>
                            </Stack>

                            {/* Feature cards */}
                            <Stack gap="sm">
                                {features.map((f, i) => (
                                    <motion.div key={f.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                                        <Group gap="md" align="center" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', backdropFilter: 'blur(10px)' }}>
                                            <Box style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                                                {f.icon}
                                            </Box>
                                            <Stack gap={2}>
                                                <Text fw={700} size="sm" c="white">{f.label}</Text>
                                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }} lh={1.4}>{f.desc}</Text>
                                            </Stack>
                                        </Group>
                                    </motion.div>
                                ))}
                            </Stack>
                        </Stack>
                    </motion.div>

                    {/* Bottom stat bar */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap="xl">
                            {[{ v: '500+', l: 'Trips Completed' }, { v: '50+', l: 'Active Trucks' }, { v: '8+', l: 'Routes' }].map(s => (
                                <Stack key={s.l} gap={2}>
                                    <Text fw={900} size="xl" c="white">{s.v}</Text>
                                    <Text size="xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.l}</Text>
                                </Stack>
                            ))}
                        </Group>
                    </motion.div>
                </Box>

                {/* ── Right form panel ── */}
                <Box style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: isDark
                        ? 'transparent'
                        : 'linear-gradient(160deg, #ffffff 0%, #FFF7F0 60%, #FFF0E6 100%)',
                }}>
                    {/* Dark mode blobs */}
                    {isDark && <>
                        <motion.div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(70px)', width: 400, height: 400, background: 'rgba(194,65,12,0.15)', top: '-15%', right: '-15%', pointerEvents: 'none' }}
                            animate={{ x: [0, 15, 0], y: [0, -10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                        <motion.div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(70px)', width: 300, height: 300, background: 'rgba(120,40,0,0.2)', bottom: '5%', left: '-10%', pointerEvents: 'none' }}
                            animate={{ x: [0, -15, 0], y: [0, 10, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
                        <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(234,88,12,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
                    </>}

                    {/* Light mode decorative circles */}
                    {!isDark && <>
                        <Box style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                        <Box style={{ position: 'absolute', bottom: -40, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,65,12,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    </>}

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
                    >
                        {/* Mobile logo */}
                        <Box hiddenFrom="md" style={{ textAlign: 'center', marginBottom: 32 }}>
                            <Group gap={10} align="center" justify="center">
                                <img src="/logo.jpeg" alt="Trans-Mas Logistics" style={{ height: 56, width: 'auto', objectFit: 'contain', borderRadius: 8 }} />
                                <Stack gap={0}>
                                    <Text fw={900} size="sm" style={{ color: isDark ? '#ffffff' : '#1E293B', letterSpacing: 0.5, lineHeight: 1.1 }}>TRANS-MAS</Text>
                                    <Text size="xs" fw={500} style={{ color: '#EA580C', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.2 }}>Logistics Co. Ltd</Text>
                                </Stack>
                            </Group>
                        </Box>

                        {/* Card */}
                        <Box style={isDark ? {
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(28px)',
                            WebkitBackdropFilter: 'blur(28px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 28,
                            overflow: 'hidden',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                        } : {
                            background: '#ffffff',
                            border: '1px solid #E2E8F0',
                            borderRadius: 28,
                            overflow: 'hidden',
                            boxShadow: '0 16px 60px rgba(0,0,0,0.1)',
                        }}>
                            {/* Card header */}
                            <Box style={isDark ? {
                                padding: '32px 36px 28px',
                                background: 'linear-gradient(135deg, rgba(194,65,12,0.25), rgba(234,88,12,0.1))',
                                borderBottom: '1px solid rgba(255,255,255,0.07)',
                            } : {
                                padding: '32px 36px 28px',
                                background: 'linear-gradient(135deg, #C2410C, #EA580C)',
                                borderBottom: 'none',
                            }}>
                                <Group gap="sm" align="center" mb={12}>
                                    <Box style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? 'linear-gradient(135deg, #C2410C, #EA580C)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        🔐
                                    </Box>
                                    <Stack gap={2}>
                                        <Text fw={800} c="white" size="lg" style={{ lineHeight: 1 }}>Welcome back</Text>
                                        <Text style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.75)' }} size="xs">Sign in to your account</Text>
                                    </Stack>
                                </Group>
                                <Box style={{ height: 2, background: isDark ? 'linear-gradient(90deg, #C2410C, #EA580C, transparent)' : 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
                            </Box>

                            {/* Form */}
                            <Box style={{ padding: '32px 36px 36px' }}>
                                <form onSubmit={submit}>
                                    <Stack gap="xl">
                                        <TextInput
                                            label="Email address"
                                            placeholder="admin@transmas.co.tz"
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            error={errors.email}
                                            required
                                            styles={{
                                                label: { color: isDark ? 'rgba(255,255,255,0.65)' : '#475569', marginBottom: 8, fontSize: 13, fontWeight: 600 },
                                                input: isDark
                                                    ? { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', borderRadius: 12, height: 48, fontSize: 14 }
                                                    : { background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: 12, height: 48, fontSize: 14 },
                                            }}
                                        />
                                        <PasswordInput
                                            label="Password"
                                            placeholder="••••••••"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            error={errors.password}
                                            required
                                            styles={{
                                                label: { color: isDark ? 'rgba(255,255,255,0.65)' : '#475569', marginBottom: 8, fontSize: 13, fontWeight: 600 },
                                                input: isDark
                                                    ? { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', borderRadius: 12, height: 48 }
                                                    : { background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: 12, height: 48 },
                                                innerInput: { color: isDark ? 'white' : '#1E293B', fontSize: 14 },
                                                visibilityToggle: { color: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' },
                                            }}
                                        />

                                        <Checkbox
                                            label="Keep me signed in"
                                            checked={data.remember}
                                            onChange={e => setData('remember', e.currentTarget.checked)}
                                            styles={{
                                                label: { color: isDark ? 'rgba(255,255,255,0.55)' : '#64748B', fontSize: 13 },
                                                input: { borderRadius: 5 },
                                            }}
                                        />

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                type="submit"
                                                loading={processing}
                                                fullWidth
                                                size="lg"
                                                radius="xl"
                                                style={{
                                                    background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                                                    border: 'none',
                                                    boxShadow: '0 8px 30px rgba(234,88,12,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                                                    fontWeight: 700,
                                                    fontSize: 15,
                                                    height: 52,
                                                    letterSpacing: 0.3,
                                                }}
                                            >
                                                {processing ? 'Signing in…' : 'Sign In  →'}
                                            </Button>
                                        </motion.div>
                                    </Stack>
                                </form>

                                <Box style={{ textAlign: 'center', marginTop: 28, paddingTop: 24, borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                                    <Anchor component={Link} href="/" size="sm" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8', textDecoration: 'none' }}
                                        onMouseEnter={e => e.target.style.color = '#EA580C'}
                                        onMouseLeave={e => e.target.style.color = isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8'}>
                                        ← Back to website
                                    </Anchor>
                                </Box>
                            </Box>
                        </Box>

                        <Text style={{ color: isDark ? '#4B5563' : '#94A3B8' }} size="xs" ta="center" mt={24}>
                            © 2026 Trans-Mas Logistics Company Limited · TIN 158-264-046
                        </Text>
                    </motion.div>
                </Box>
            </Box>
        </>
    );
}

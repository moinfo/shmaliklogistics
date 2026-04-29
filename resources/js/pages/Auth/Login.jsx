import { Head, Link, useForm } from '@inertiajs/react';
import { Box, Container, Title, Text, TextInput, PasswordInput, Button, Checkbox, Group, Stack, Anchor } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
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
            <Head title="Login — SH Malik Logistics" />

            <Box style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #050D18 0%, #0A1628 50%, #0E4FA0 100%)' }}>

                {/* Animated mesh blobs */}
                {[
                    { w: 500, h: 500, top: '-10%', left: '-10%', color: 'rgba(21,101,192,0.25)' },
                    { w: 400, h: 400, top: '50%', right: '-8%', color: 'rgba(33,150,243,0.18)' },
                    { w: 350, h: 350, bottom: '-5%', left: '30%', color: 'rgba(10,58,122,0.3)' },
                ].map((b, i) => (
                    <motion.div key={i} style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', width: b.w, height: b.h, background: b.color, top: b.top, left: b.left, right: b.right, bottom: b.bottom, pointerEvents: 'none' }}
                        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                        transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }} />
                ))}

                {/* Dot grid */}
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(33,150,243,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                {/* Left brand panel (hidden on mobile) */}
                <Box visibleFrom="md" style={{ width: '45%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', position: 'relative', zIndex: 1 }}>
                    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <img src="/logo-full.png" alt="SH Malik Logistics" style={{ height: 72, width: 'auto', objectFit: 'contain', marginBottom: 48 }} />
                        </Link>
                        <Title order={1} c="white" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
                            Welcome to the{' '}
                            <Text component="span" style={{ background: 'linear-gradient(135deg, #2196F3, #80B8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                Logistics System
                            </Text>
                        </Title>
                        <Text c="gray.4" size="lg" lh={1.8} maw={420} mb={48}>
                            Manage trips, fleet, permits, cargo and operations from a single platform — built for East Africa's trade routes.
                        </Text>

                        {/* Feature list */}
                        <Stack gap="md">
                            {[
                                { icon: '🚛', text: 'Trip planning & GPS tracking' },
                                { icon: '📊', text: 'Real-time route profitability' },
                                { icon: '🛂', text: 'Permit & customs management' },
                                { icon: '👥', text: 'Driver & fleet management' },
                            ].map((f, i) => (
                                <motion.div key={f.text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                                    <Group gap="md" align="center">
                                        <Box style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(33,150,243,0.15)', border: '1px solid rgba(33,150,243,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                                            {f.icon}
                                        </Box>
                                        <Text c="gray.3" size="sm">{f.text}</Text>
                                    </Group>
                                </motion.div>
                            ))}
                        </Stack>
                    </motion.div>
                </Box>

                {/* Right login form */}
                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        style={{ width: '100%', maxWidth: 420 }}
                    >
                        {/* Mobile logo */}
                        <Box hiddenFrom="md" style={{ textAlign: 'center', marginBottom: 32 }}>
                            <img src="/logo-full.png" alt="SH Malik Logistics" style={{ height: 56, objectFit: 'contain' }} />
                        </Box>

                        <Box style={{
                            background: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 24,
                            overflow: 'hidden',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                        }}>
                            {/* Form header */}
                            <Box style={{ padding: '28px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <Text fw={800} c="white" size="xl" mb={4}>Sign in to your account</Text>
                                <Text c="gray.5" size="sm">SH Malik Logistics Management System</Text>
                            </Box>

                            {/* Form body */}
                            <Box style={{ padding: '28px 32px 32px' }}>
                                <form onSubmit={submit}>
                                    <Stack gap="lg">
                                        <TextInput
                                            label="Email address"
                                            placeholder="admin@shmalik.co.tz"
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            error={errors.email}
                                            required
                                            styles={{
                                                label: { color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
                                                input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', borderRadius: 10, '&:focus': { borderColor: '#2196F3' } },
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
                                                label: { color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
                                                input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', borderRadius: 10 },
                                                innerInput: { color: 'white' },
                                            }}
                                        />

                                        <Group justify="space-between" align="center">
                                            <Checkbox
                                                label="Remember me"
                                                checked={data.remember}
                                                onChange={e => setData('remember', e.currentTarget.checked)}
                                                styles={{ label: { color: 'rgba(255,255,255,0.6)', fontSize: 13 } }}
                                            />
                                        </Group>

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                type="submit"
                                                loading={processing}
                                                fullWidth
                                                size="lg"
                                                radius="xl"
                                                style={{
                                                    background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                                                    border: 'none',
                                                    boxShadow: '0 8px 30px rgba(33,150,243,0.4)',
                                                    fontWeight: 700,
                                                    fontSize: 15,
                                                }}
                                            >
                                                {processing ? 'Signing in…' : 'Sign In →'}
                                            </Button>
                                        </motion.div>
                                    </Stack>
                                </form>

                                <Box style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                    <Anchor component={Link} href="/" c="brand.3" size="sm" style={{ textDecoration: 'none' }}>
                                        ← Back to website
                                    </Anchor>
                                </Box>
                            </Box>
                        </Box>

                        <Text c="gray.7" size="xs" ta="center" mt={20}>
                            © 2026 SH Malik Logistics Company Limited
                        </Text>
                    </motion.div>
                </Box>
            </Box>
        </>
    );
}

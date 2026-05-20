import { useForm } from '@inertiajs/react';
import { Box, Text, TextInput, PasswordInput, Button, Stack, Group, Alert } from '@mantine/core';

export default function PortalLogin() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/portal/login');
    };

    return (
        <Box style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A0400 0%, #1E0800 50%, #A83200 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <Box style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <Box style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Group gap={10} justify="center" align="center" mb={4}>
                        <img src="/logo.jpeg" alt="Trans-Mas" style={{ height: 56, width: 'auto', objectFit: 'contain', borderRadius: 8 }} />
                        <Stack gap={0} align="flex-start">
                            <Text fw={900} size="md" style={{ color: '#ffffff', letterSpacing: 0.5, lineHeight: 1.1 }}>TRANS-MAS</Text>
                            <Text size="xs" fw={600} style={{ color: '#FB923C', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.2 }}>Logistics Co. Ltd</Text>
                        </Stack>
                    </Group>
                    <Text size="sm" style={{ color: 'var(--c-text-secondary)', marginTop: 10 }}>Customer Portal</Text>
                </Box>

                {/* Card */}
                <Box style={{
                    background: 'var(--c-card)',
                    border: '1px solid var(--c-border-strong)',
                    borderRadius: 16,
                    padding: '36px 32px',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                }}>
                    <Text fw={700} size="lg" style={{ color: 'var(--c-text)', marginBottom: 6 }}>Welcome back</Text>
                    <Text size="sm" style={{ color: '#64748B', marginBottom: 28 }}>Sign in to track your shipments and invoices</Text>

                    {errors.email && (
                        <Alert color="red" style={{ marginBottom: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8 }}>
                            <Text size="sm" style={{ color: '#FCA5A5' }}>{errors.email}</Text>
                        </Alert>
                    )}

                    <form onSubmit={submit}>
                        <Stack gap="md">
                            <TextInput
                                label="Email Address"
                                placeholder="you@company.com"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                styles={{
                                    label: { color: 'var(--c-text-secondary)', marginBottom: 6 },
                                    input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)', '&:focus': { borderColor: '#EA580C' } },
                                }}
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                styles={{
                                    label: { color: 'var(--c-text-secondary)', marginBottom: 6 },
                                    input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' },
                                    innerInput: { color: 'var(--c-text)' },
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                loading={processing}
                                style={{
                                    background: 'linear-gradient(135deg, #C2410C, #EA580C)',
                                    border: 'none', height: 46, borderRadius: 10,
                                    fontWeight: 700, marginTop: 8,
                                    boxShadow: '0 4px 16px rgba(234,88,12,0.4)',
                                }}
                            >
                                Sign In
                            </Button>
                        </Stack>
                    </form>
                </Box>

                <Text size="xs" style={{ color: 'var(--c-text-muted)', textAlign: 'center', marginTop: 24 }}>
                    Contact Trans-Mas Logistics to get portal access
                </Text>
            </Box>
        </Box>
    );
}

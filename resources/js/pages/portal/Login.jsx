import { useForm } from '@inertiajs/react';
import { Box, Text, TextInput, PasswordInput, Button, Stack, Group, Alert } from '@mantine/core';

export default function PortalLogin() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/portal/login');
    };

    return (
        <Box style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050D18 0%, #0B1627 50%, #07111F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <Box style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <Box style={{ textAlign: 'center', marginBottom: 40 }}>
                    <img src="/logo-full.png" alt="SH Malik Logistics" style={{ height: 52, objectFit: 'contain' }} />
                    <Text size="sm" style={{ color: '#94A3B8', marginTop: 10 }}>Customer Portal</Text>
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
                                    label: { color: '#94A3B8', marginBottom: 6 },
                                    input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)', '&:focus': { borderColor: '#2196F3' } },
                                }}
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                styles={{
                                    label: { color: '#94A3B8', marginBottom: 6 },
                                    input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' },
                                    innerInput: { color: 'var(--c-text)' },
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                loading={processing}
                                style={{
                                    background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                                    border: 'none', height: 46, borderRadius: 10,
                                    fontWeight: 700, marginTop: 8,
                                    boxShadow: '0 4px 16px rgba(33,150,243,0.4)',
                                }}
                            >
                                Sign In
                            </Button>
                        </Stack>
                    </form>
                </Box>

                <Text size="xs" style={{ color: '#475569', textAlign: 'center', marginTop: 24 }}>
                    Contact SH Malik Logistics to get portal access
                </Text>
            </Box>
        </Box>
    );
}

import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Box, Stack, Title, Text, PasswordInput, Button, Alert } from '@mantine/core';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

export default function ChangePassword() {
    const { flash } = usePage().props;

    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch('/account/password', {
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
        });
    };

    return (
        <DashboardLayout>
            <Head title="Change Password" />

            <Box style={{ maxWidth: 480, margin: '0 auto' }} py="xl" px="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                    <Title order={2} mb={4}>Change Password</Title>
                    <Text c="dimmed" size="sm" mb="xl">Update your account password. You'll need your current password to confirm the change.</Text>

                    {flash?.success && (
                        <Alert color="green" radius="md" mb="lg" withCloseButton={false}>
                            {flash.success}
                        </Alert>
                    )}

                    <Box
                        style={{
                            background: 'var(--mantine-color-default)',
                            border: '1px solid var(--mantine-color-default-border)',
                            borderRadius: 12,
                            padding: 24,
                        }}
                    >
                        <form onSubmit={submit}>
                            <Stack gap="md">
                                <PasswordInput
                                    label="Current Password"
                                    placeholder="Enter your current password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    error={errors.current_password}
                                    required
                                    autoComplete="current-password"
                                />
                                <PasswordInput
                                    label="New Password"
                                    placeholder="At least 8 characters"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                    required
                                    autoComplete="new-password"
                                />
                                <PasswordInput
                                    label="Confirm New Password"
                                    placeholder="Repeat new password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={errors.password_confirmation}
                                    required
                                    autoComplete="new-password"
                                />

                                <Button
                                    type="submit"
                                    loading={processing}
                                    radius="xl"
                                    mt="xs"
                                    style={{
                                        background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                                        boxShadow: '0 4px 16px rgba(33,150,243,0.3)',
                                    }}
                                >
                                    {processing ? 'Updating…' : 'Update Password'}
                                </Button>
                            </Stack>
                        </form>
                    </Box>
                </motion.div>
            </Box>
        </DashboardLayout>
    );
}

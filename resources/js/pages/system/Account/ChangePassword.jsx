import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Box, Stack, Title, Text, PasswordInput, Button, Alert, Group } from '@mantine/core';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

export default function ChangePassword() {
    const { flash, auth } = usePage().props;
    const user = auth?.user;
    const fileRef = useRef(null);

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

    const handleAvatarPick = (file) => {
        if (!file) return;
        router.post('/account/avatar', { avatar: file }, { forceFormData: true, preserveScroll: true });
    };

    return (
        <DashboardLayout>
            <Head title="Change Password" />

            <Box style={{ maxWidth: 480, margin: '0 auto' }} py="xl" px="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                    <Title order={2} mb={4}>Account Settings</Title>
                    <Text c="dimmed" size="sm" mb="xl">Update your profile picture and password.</Text>

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
                            marginBottom: 20,
                        }}
                    >
                        <Title order={4} mb={4}>Profile Picture</Title>
                        <Text c="dimmed" size="sm" mb="lg">JPG, PNG or WEBP. Max 4 MB.</Text>

                        <Group gap="lg" align="center">
                            {user?.avatar_url ? (
                                <Box component="img" src={user.avatar_url} alt={user.name}
                                    style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--mantine-color-default-border)' }} />
                            ) : (
                                <Box style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #2196F3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text c="white" fw={800} size="32px">{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
                                </Box>
                            )}
                            <Stack gap={6}>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    style={{ display: 'none' }}
                                    onChange={e => { handleAvatarPick(e.target.files?.[0]); e.target.value = ''; }}
                                />
                                <Button onClick={() => fileRef.current?.click()} radius="xl"
                                    style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', boxShadow: '0 4px 16px rgba(33,150,243,0.3)' }}>
                                    {user?.avatar_url ? 'Change photo' : 'Upload photo'}
                                </Button>
                                <Text size="xs" c="dimmed">A square image works best.</Text>
                            </Stack>
                        </Group>
                    </Box>

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
